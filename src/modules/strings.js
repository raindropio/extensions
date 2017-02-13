import t from 't'
import network from './network'
import config from './config'

var _ = {
  clone: require('lodash/clone')
}

module.exports = {
    getCurrentBrowser: function() {
      var browser = [];

      if (typeof navigator != "undefined"){
        if (/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()))
          browser.push("chrome");

        if (/constructor/i.test(window.HTMLElement))
          browser.push("safari");

        if ('MozAppearance' in document.documentElement.style)
          browser.push('firefox');

        if (!!window.opera || /opera|opr/i.test(navigator.userAgent))
          browser.push('opera');

        if ('WebkitAppearance' in document.documentElement.style)
          browser.push("webkit");

        //OS
        if (navigator.appVersion.indexOf("Win")!=-1) browser.push("windows");
        if (navigator.appVersion.indexOf("Mac")!=-1) browser.push("mac");
        if (navigator.appVersion.indexOf("X11")!=-1) browser.push("unix");
        if (navigator.appVersion.indexOf("Linux")!=-1) browser.push("linux");

        if (navigator.appVersion.indexOf("Electron")!=-1) browser.push("electron");
      }

      return browser;
    },

    browserExtensionInfo() {
      var l = config.links.apps, currentBrowser = "none";
      var browser = this.getCurrentBrowser();

      if (browser.indexOf("safari")!=-1)
        currentBrowser = "safari";
      else if (browser.indexOf("opera")!=-1)
        currentBrowser = "opera";
      else if ((browser.indexOf("chrome")!=-1)||(browser.indexOf("webkit")!=-1))
        currentBrowser = "chrome";
      else if (browser.indexOf("firefox")!=-1)
        currentBrowser = "firefox";

      l = config.links.extension[currentBrowser];

      return {
        browser: currentBrowser,
        link: l
      }
    },

    swapArray: function (a, x,y) {
      var a = _.clone(a);
      var b = _.clone(a[x]);
      a[x] = _.clone(a[y]);
      a[y] = _.clone(b);
      return a;
    },

    parseSearch: function(val) {
        var key = "word";
        var typeRegexp = /type\-(image|video|link|article)/i;

        if (val.match(new RegExp(/(^|\s)#([^ ]*)/i))) {
            key = "tag";
            val = val.replace(/,/g, '').replace(/#/g, '');
        }
        else if (val.match(new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/))){
            key = "domain";
            val = val.toLowerCase();
        }
        else if (val.match(new RegExp(typeRegexp))){
            key = "type";
            val = val.match(typeRegexp)[1];
        }

        return {key: key, val: val};
    },

    inputSelectAllMixin: {
        handleSelectAll: function(e) {
            e.target.focus();
            e.target.select();
        }
    },


    getErrorFromJSON: function(json) {
      if (typeof json.error != "undefined") {
        return t.s("server"+json.error);
      }

      if (typeof json.auth != "undefined") {
        if (!json.auth)
          return t.s("startToSave");
      }

      return t.s("server");
    },

    defaultTitle: function() {
      if ((window.environment||[]).indexOf("desktop")!=-1)
        return "Raindrop.io";
      else{
        var s = t.s("pro_speed_dial");
        if (s.indexOf("(")!=-1){
          s = s.substr(0, s.indexOf("(")-1);
        }

        s = S(s).replaceAll('"', '').s;
        
        if (s.indexOf("-")!=-1){
          s = s.substr(0, s.indexOf("-")-1);
        }

        return s;
      }
    },

    beautifulDomain: function(s) {
      var clean = "";
      try{clean = network.cleanDomain(s);}catch(e){}
      try{clean = clean.match(/(.*)\./i)[1];}catch(e){}
      try{clean = clean.replace(/-/g, " ").replace(/_/g, " ");}catch(e){}
      try{clean = clean.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}catch(e){}

      return clean||s||"";
    },

    copyTextToClipboard: function(text) {
      if (typeof document === 'undefined') return;

      if (typeof MacGap != "undefined"){
        MacGap.Clipboard.copy(text);
        return;
      }

      var textArea = document.createElement("textarea");

      //
      // *** This styling is an extra step which is likely not required. ***
      //
      // Why is it here? To ensure:
      // 1. the element is able to have focus and selection.
      // 2. if element was to flash render it has minimal visual impact.
      // 3. less flakyness with selection and copying which **might** occur if
      //    the textarea element is not visible.
      //
      // The likelihood is the element won't even render, not even a flash,
      // so some of these are just precautions. However in IE the element
      // is visible whilst the popup box asking the user for permission for
      // the web page to copy to the clipboard.
      //

      // Place in top-left corner of screen regardless of scroll position.
      textArea.style.position = 'fixed';
      textArea.style.top = 0;
      textArea.style.left = 0;

      // Ensure it has a small width and height. Setting to 1px / 1em
      // doesn't work as this gives a negative w/h on some browsers.
      textArea.style.width = '2em';
      textArea.style.height = '2em';

      // We don't need padding, reducing the size if it does flash render.
      textArea.style.padding = 0;

      // Clean up any borders.
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';

      // Avoid flash of white box if rendered for any reason.
      textArea.style.background = 'transparent';


      textArea.value = text;

      document.body.appendChild(textArea);

      textArea.select();

      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }

      try{document.body.removeChild(textArea);}catch(e){}
    },

    humanFileSize: function(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['Kb','Mb','Gb','Tb','Pb','Eb','Zb','Yb']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1)+' '+units[u];
    },

    humanNumber: function(s) {
      var result = parseInt(s)||0;
      if (s)
      try{result = new Intl.NumberFormat(t.currentLang.replace('_','-')).format(s)}catch(e){}
      return result;
    },

    abbreviateNumber: function(value) {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "k", "m", "b","t"];
            var suffixNum = Math.floor( (""+value).length/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    },

    parseBrowserQuery: function() {
      var q = {};
      try{
        var temp = window.location.search.substr(1, window.location.search.length).split("&");
        temp.forEach(function(item){
          var a = item.split("=");
          q[a[0]]=decodeURIComponent(a[1]);
        });
      }catch(e){}

      return q;
    },

    humanDate: function(dt) {
      var d;
      try{d = new Date(dt)}catch(e){}
      if (!d) return "";

      var res = "";
      try{
        res = new Intl.DateTimeFormat(t.currentLang.replace('_','-'), {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(d);
      } catch(e) {}
      return res;
    },

    fromNow: function(dt) {
      var d;
      try{d = new Date(dt)}catch(e){}
      if (!d) return "";

      //default format
      var format = {
        month: "short", 
        day: "numeric"
      };

      //is today
      if (d.toDateString() == new Date().toDateString())
        format = {
          hour: 'numeric',
          minute: 'numeric'
        }
      //year(s) ago
      else if (d.getFullYear() != new Date().getFullYear())
        format = {
          month: "numeric",
          year: "numeric"
        }

      var res = "";
      try{
        res = new Intl.DateTimeFormat(t.currentLang.replace('_','-'), format).format(d);
      } catch(e) {}
      return res;
    },

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    numberThouthands: function(value) {
      var thouthends = String(value||0).length, num=1; for(var i=0;i<thouthends-1;i++) num=num*10;
      return num;
    }
}
