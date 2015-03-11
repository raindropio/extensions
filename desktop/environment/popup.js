try {
    $ = jQuery = module.exports;
} catch(e) {}
$.ajaxSetup({
    timeout: 10000 //Time in milliseconds
});

environment = {
    name:   "desktop"
}

window.isImportPage = true;
//var RainDropPanzer = require('../js/inject.js');
var Shell = require('shell');
var ipc = require('ipc');
var remote = require('remote');
var clipboard = require('clipboard');

var BrowserWindow = remote.require('browser-window');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var Desktop = {
    settings: {},
    parseUrl: function(params) {
        var mimeTypes = {
            'image':['image/jpeg','image/png','image/gif'],
            'html':['text/html',/*'text/plain',*/'application/xhtml+xml']
        };

        if (typeof Desktop.caches[params.url] != 'undefined') {
            bridgeAction({action: 'setHTML', item: Desktop.caches[params.url]});
        }
        else {
            var jqxhr = $.get("http://127.0.0.1:1505/parse?url="+encodeURIComponent(params.url), function (json) {
                if (json.result){
                    json.item.drop = true;
                    json.item.url = json.item.link = params.url;
                    json.item.result = true;
                    bridgeAction({action: 'setHTML', item: json.item});
                }
                else
                    bridgeAction({action: 'parseURLOtherWay', item: params.url});
            }, 'json')
                .fail(function () {
                    console.log('error get');
                    bridgeAction({action: 'parseURLOtherWay', item: params.url});
                });
            /*
            $.ajax({
                type: "HEAD",
                async: true,
                url: params.url,
                success: function (message, text, response) {
                    var mime = "",
                        mimeType = null;
                    try {
                        mime = response.getResponseHeader('Content-Type').toLowerCase()
                    } catch (e) {
                    }
                    for (var i in mimeTypes)
                        for (var j in mimeTypes[i])
                            if (mimeTypes[i][j] == mime)
                                mimeType = i;

                    if (mimeType == null) mimeType = undefined;

                    if (typeof mimeType == 'undefined') {
                        bridgeAction({action: 'parseURLOtherWay', item: params.url});
                    }
                    else {
                        if (mimeType == 'html') mimeType = undefined;
                        var jqxhr = $.get(params.url, function (html) {
                            RainDropPanzer.run(function (item) {
                                bridgeAction({action: 'setHTML', item: item});
                            }, {html: (mimeType ? '<p></p>' : html), url: params.url, type: mimeType});
                        }, 'html')
                            .fail(function () {
                                console.log('error get');
                                bridgeAction({action: 'parseURLOtherWay', item: params.url});
                            });
                    }
                },
                error: function () {
                    console.log('error head');
                    bridgeAction({action: 'parseURLOtherWay', item: params.url});
                }
            });
            */
        }
    },

    hide: function() {
        ipc.send('hide', true);
    },

    minimize: function() {
        ipc.send('minimize', true);
    },

    maximize: function() {
        ipc.send('maximize', true);
    },

    screenshots: {},
    caches: {},

    fastSave: function(params){
        var s = {};
        if (params.url) {
            s.fastsave = decodeURIComponent(params.url);
            s.noAnim = 1;

            Desktop.addToCache(params);
        }
        angular.element(document.getElementById('CurrentController')).scope().actions.setSearch(s);
    },

    addToCache: function(params) {
        if (params.item){
            params.item = JSON.parse(decodeURIComponent(params.item));
            params.url = decodeURIComponent(params.url);

            if (typeof params.item.title != 'undefined') {
                Desktop.caches[params.url] = params.item;
                Desktop.caches[params.url].drop = true;
            }
        }
    },

    makeScreenshot: function(url) {
        ipc.send('makeScreenshot', url);
    }
}


document.body.addEventListener('dragover', function(e){
    if ((e.dataTransfer.getData('text/uri-list'))||(e.dataTransfer.files.length==0)) {

    }
    else{
        e.dataTransfer.dropEffect = "none";
    }

    e.preventDefault();
    e.stopPropagation();
}, false);
document.body.addEventListener('drop', function(e){
    if ((e.dataTransfer.getData('text/uri-list'))||(e.dataTransfer.files.length==0)) {

    }
    else{
        e.dataTransfer.dropEffect = "none";
    }

    e.preventDefault();
    e.stopPropagation();
}, false);


window.onfocus = function(){
    $('body').removeClass('noFocus');
}
window.onblur = function(){
    $('body').addClass('noFocus');
}


//Events
ipc.on('fastSave', Desktop.fastSave);
ipc.on('addToCache', Desktop.addToCache);


ipc.on('addScreenshot', function(attrs){
    if (attrs.dataURI) {
        Desktop.screenshots[attrs.url] = attrs.dataURI;
    }

    if (attrs.setNow){
        bridgeAction({
            action: "setScreenshot",
            dataURI: attrs.dataURI
        });
    }
});


ipc.on('settings', function(attrs){
    Desktop.settings = attrs;
});