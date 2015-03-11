var working = false;

exports.make = function(url, callback) {
    if (!working) {
        working=true;
        var error = false;
        var win = new BrowserWindow({
            width: 1280,
            height: 1024,
            "use-content-size": true,
            show: false,
            "node-integration": false,
            "web-preferences": {
                "web-security": true,
                java: false,
                "text-areas-are-resizable": false,
                webgl: false,
                webaudio: false,
                plugins: false,
                "experimental-features": false,
                "experimental-canvas-features": false,
                "subpixel-font-scaling": true,
                "overlay-scrollbars": true
            }
        });

        var sendResult = function (result) {
            if (result != null) {
                try {
                    result = result.toDataUrl()
                    //result = "data:image/png;base64," + result.toString('base64');
                } catch (e) {
                    if (e) result = null;
                }
            }
            else
                error=true;

            callback(result);

            working=false;
            win.close();
            win = null;
        }

        win.loadUrl(url);

        win.webContents.on('did-finish-load', function () {
            setTimeout(function () {
                if (!error)
                win.capturePage({x: 0, y: 0, width: 0, height: 0}, sendResult);
            }, 500);
        });

        win.webContents.on('did-fail-load', function () {
            sendResult(null);
        });
        win.webContents.on('crashed', function () {
            sendResult(null);
        });
        win.webContents.on('did-fail-load', function () {
            sendResult(null);
        });
    }
}