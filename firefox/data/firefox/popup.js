try {
    $ = jQuery = module.exports;
    // If you want module.exports to be empty, uncomment:
    // module.exports = {};
} catch(e) {}

environment = {
    name:   "extension",

    getURL: function(params) {
        console.log('asd');
    },

    getScreenshot: function() {

    }
}

self.on("message", function(msg) {
    if (msg=='openPopup') {
        if ((window.location.hash == '#/signin') || (window.location.hash == '#/signup')) {
            window.location.hash = '#/';
            window.location.reload();
        }
    }
});