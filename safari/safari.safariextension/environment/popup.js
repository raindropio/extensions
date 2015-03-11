try {
    $ = jQuery = module.exports;
    // If you want module.exports to be empty, uncomment:
    // module.exports = {};
} catch(e) {}

environment = {
    name:   "extension",
    safariLinks: true,

    getURL: function(params) {
        bridgeAction({action: 'setURL', url: safari.application.activeBrowserWindow.activeTab.url, params: params});
    },

    getScreenshot: function() {
        safari.application.activeBrowserWindow.activeTab.visibleContentsAsDataURL(function(response) {
            bridgeAction({action: 'setScreenshot', dataURI: response});
        });
    }
}

window.nodependencies = true;
document.getElementsByTagName('html')[0].setAttribute('data-appearance', 'light');

safari.application.addEventListener("popover", function(e){
    environment.getURL(false);

    if ((window.location.hash == '#/signin')||(window.location.hash == '#/signup')){
        window.location.hash = '#/';
        window.location.reload();
    }
}, false);