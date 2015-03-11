try {
    $ = jQuery = module.exports;
    // If you want module.exports to be empty, uncomment:
    // module.exports = {};
} catch(e) {}

environment = {
    name:   "extension",

    getURL: function(params) {
        if (typeof chrome != 'undefined')
        chrome.runtime.sendMessage({action:'getURL'}, function(response){
            bridgeAction({action: 'setURL', url: response, params: params},'*');
        });
    },

    getScreenshot: function() {
        if (typeof chrome != 'undefined')
        chrome.runtime.sendMessage({action:'getScreenshot'}, function(response){
            bridgeAction({action: 'setScreenshot', dataURI: response},'*');
        });
    }
}

window.isImportPage = true;