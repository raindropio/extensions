var strings = {
	'da_DK': require("lzstring!json!../languages/da_DK.json"),//lzstring!
  'de_DE': require("lzstring!json!../languages/de_DE.json"),
  'en_US': require("lzstring!json!../languages/en_US.json"),
  'es_ES': require("lzstring!json!../languages/es_ES.json"),
  'fi_FI': require("lzstring!json!../languages/fi_FI.json"),
  'fr_FR': require("lzstring!json!../languages/fr_FR.json"),
  'hy_AM': require("lzstring!json!../languages/hy_AM.json"),
  'id_ID': require("lzstring!json!../languages/id_ID.json"),
  'it_IT': require("lzstring!json!../languages/it_IT.json"),
  'kk_KZ': require("lzstring!json!../languages/kk_KZ.json"),
  'ko_KR': require("lzstring!json!../languages/ko_KR.json"),
  'nl_NL': require("lzstring!json!../languages/nl_NL.json"),
  'pl_PL': require("lzstring!json!../languages/pl_PL.json"),
  'pt_BR': require("lzstring!json!../languages/pt_BR.json"),
  'ru_RU': require("lzstring!json!../languages/ru_RU.json"),
  'sv_SE': require("lzstring!json!../languages/sv_SE.json"),
  'tr_TR': require("lzstring!json!../languages/tr_TR.json"),
  'uk_UA': require("lzstring!json!../languages/uk_UA.json"),
  'zh_CN': require("lzstring!json!../languages/zh_CN.json"),
  'zh_TW': require("lzstring!json!../languages/zh_TW.json")
};

var translate = {
  defaultLang: "en_US",
  currentLang: "",

  cleanLang: function(lang) {
    for(var i in strings)
      if (i.indexOf(lang)==0){
        return i;
      }
    return this.defaultLang;
  },

  initLang: function(lang) {
      //get defautls if lang not presented
      if (typeof lang == "undefined"){
        lang = null;
        try{lang = localStorage.getItem("language")||null;}catch(e){}

        if (lang==null){
          var browserLang = "";

          if (typeof navigator != "undefined"){
            //chrome specific
            try{
              const allLangs = navigator.languages.filter(l=>!l.includes('en'))
              if (this.cleanLang(allLangs[0]))
                browserLang = allLangs[0]
            } catch(e){}

            if (!browserLang)
              browserLang = (navigator||{}).language || (navigator||{}).userLanguage || "";
          }

          try{
            browserLang = browserLang.trim().substr(0,2).toLowerCase();
          } catch(e) {if (e) browserLang=""; }

          if (browserLang!=""){
            lang = this.cleanLang(browserLang);
          }
        }
      }

      if (typeof strings[lang] == "undefined")
          lang = this.defaultLang;

      this.currentLang = lang;
      try{localStorage.setItem("language", this.currentLang);}catch(e){}
  },

  s: function(key) {
    if (typeof strings[this.currentLang] != "object")
      strings[this.currentLang] = JSON.parse(strings[this.currentLang]);

    if (typeof strings[this.defaultLang] != "object")
      strings[this.defaultLang] = JSON.parse(strings[this.defaultLang]);

    if (strings[this.currentLang][key])
      return strings[this.currentLang][key];
    else if (strings[this.defaultLang][key])
      return strings[this.defaultLang][key];
    else
      return key;
  },

  format: function(key) {
    var formatted = this.s(key);
    for( var arg in arguments ) {
      if (arg>0)
        formatted = formatted.replace("{" + (arg-1) + "}", arguments[arg]);
    }
    return formatted;
  }
};

if (!translate.currentLang)
  translate.initLang();

module.exports = translate;