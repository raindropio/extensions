var home = "raindrop.io";
var host = "https://"+home,
    apiPrefix = "/api/";

if(typeof window != "undefined"){
    if (window.location.protocol.indexOf('http')==0)
        host = window.location.protocol+"//"+home;
}

module.exports = {
    home: home,
	host: host,
    apiPrefix: host + apiPrefix,
    screenshotService: host + "/screenshot/?url=",
    contentTypes: ["link", "article", "image", "video"],

    proPage: host + "/app#/settings/upgrade?_k=b0zk8r",

    collectionExpandPrefix: "collection_expanded_",

    "links": {
        "apps": host+"/settings#/settings/install",
        "extension": {
            "chrome": "https://chrome.google.com/webstore/detail/ldgfbffkinooeloadekpmfoklnobpien",
            "firefox": "https://addons.mozilla.org/firefox/addon/raindropio/",
            "safari": "https://raindrop.io/releases/safari.safariextz",
            "opera": "https://addons.opera.com/extensions/details/raindropio-smart-bookmarks"
        },
        "newtab": {
            "chrome": "https://chrome.google.com/webstore/detail/raindropio-new-tab-speed/knifgjkgmgdinjeecneiphoniamhgbof",
            "firefox": "https://raindrop.io/releases/newtab.xpi"
        },
        "ios": "https://itunes.apple.com/us/app/raindrop.io-keep-your-favorites/id1021913807",
        "android": "https://play.google.com/store/apps/details?id=io.raindrop.raindropio",
        "osx": "https://itunes.apple.com/app/raindrop.io-keep-your-favorites/id957810159",
        "dmg": "https://raindrop.io/releases/mac/Raindrop.dmg",
        "windows": "http://raindrop.io/downloadwin",

        "settings": host+"/settings#/settings"
    },

    languages: {
        "id_ID": "Bahasa Indonesia",
        "de_DE": "Deutsch",
        "en_US": "English",
        "es_ES": "Español",
        "fr_FR": "Français",
        "nl_NL": "Nederlands",
        "pl_PL": "Polski",
        "pt_BR": "Português (Brasil)",
        "sv_SE": "Svenska",
        "fi_FI": "Suomi",
        "tr_TR": "Türkçe",
        "kk_KZ": "Қазақ тілі",
        "ru_RU": "Русский",
        "uk_UA": "Українська мова",
        "ko_KR": "한국어",
        "zh_TW": "中文 (繁體)",
        "zh_CN": "中文（简体）",
        "hy_AM": "հայերեն"
    },

    getImportLink: function() {
        return this.host+"/app#/settings/import";
    }
}