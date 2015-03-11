var screenSize = {};

// Create the browser window.
var mainWindow = null;
var win = {
    url: 'file://' + app.fixDIR(__dirname) + '/../popup/popup.html',
    init: function(url) {
        screenSize = Screen.getPrimaryDisplay().workAreaSize;

        if (mainWindow == null) {
            mainWindow = new BrowserWindow({
                x: (settings.params.left<=0 ? null : settings.params.left),
                y: (settings.params.top<=0 ? null : settings.params.top),
                center: (settings.params.left<=0 && settings.params.top<=0 ? true : false),
                width: settings.params.width,
                "min-width": 370,
                height: settings.params.height,
                "min-height": 450,
                resizable: true,
                "always-on-top": settings.params["always-on-top"],
                fullscreen: false,
                "skip-taskbar": (process.platform == 'darwin'),
                frame: (process.platform != 'darwin'),
                "node-integration": true,
                "accept-first-mouse": true,
                "auto-hide-menu-bar": true,
                "web-preferences": {
                    "web-security": false,
                    java: false,
                    "text-areas-are-resizable": false,
                    webgl: false,
                    webaudio: false,
                    plugins: true,
                    "experimental-features": false,
                    "experimental-canvas-features": false,
                    "subpixel-font-scaling": true,
                    "overlay-scrollbars": true
                },

                show: false
            });

            settings.params.left = mainWindow.getPosition()[0];
            settings.params.top = mainWindow.getPosition()[1];

            //mainWindow.on('blur', win.hide);

            mainWindow.on('close', function() {
                settings.params.left = mainWindow.getPosition()[0];
                settings.params.top = mainWindow.getPosition()[1];
                settings.params.width = mainWindow.getContentSize()[0];
                settings.params.height = mainWindow.getContentSize()[1];
                settings.save();
            });

            // Emitted when the window is closed.
            mainWindow.on('closed', function () {
                // Dereference the window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.
                mainWindow = null;
            });

            mainWindow.webContents.on('did-finish-load', function() {
                if (settings.params["dock"])
                    mainWindow.show();
                //mainWindow.openDevTools();

                mainWindow.webContents.send('settings', settings.params);
            });

            mainWindow.webContents.on('will-navigate', function(e,url) {
                url = url || "";
                if (url.indexOf('file:')!=0) {
                    e.preventDefault();
                    Shell.openExternal(url);
                }
            });

            mainWindow.webContents.on('new-window', function(e,url) {
                url = url || "";
                if ((url.indexOf('file:')!=0)&&(url.indexOf('http://raindrop.io')!=0)&&(url.indexOf('https://raindrop.io')!=0)) {
                    e.preventDefault();
                    Shell.openExternal(url);
                }
            });
        }

        mainWindow.loadUrl(win.url+(url||""));
    },
    show: function(fromTray) {
        var firstRun=false;
        if (mainWindow == null) {
            win.init();
            firstRun=true;
        }

        if (fromTray) {
            var left = Screen.getCursorScreenPoint().x - (fromTray!=2 ? 15 : 0),
                top = Screen.getCursorScreenPoint().y - (fromTray!=2 ? 15 : -15);

            if (left+mainWindow.getContentSize()[0] > screenSize.width){
                left = screenSize.width - mainWindow.getContentSize()[0];
            }

            mainWindow.setPosition(left, top);
        }

        if (!mainWindow.isVisible()) {
            mainWindow.show();
        }
        mainWindow.focus();
    },
    hide: function() {
        if (process.platform == 'darwin')
            mainWindow.hide();
        else
            mainWindow.minimize();
    },
    minimize: function() {
        mainWindow.minimize();
    },
    maximize: function() {
        if (mainWindow.isMaximized())
            mainWindow.unmaximize();
        else
            mainWindow.maximize();
    },
    destroy: function() {
        mainWindow.close();
        mainWindow.destroy();
        mainWindow = null;
    }
}

exports.init = win.init;
exports.show = win.show;
exports.hide = win.hide;
exports.minimize = win.minimize;
exports.maximize = win.maximize;
exports.destroy = win.destroy;

exports.showOrHide = function(fromTray) {
    if (mainWindow != null) {
        if ((mainWindow.isFocused()) && (mainWindow.isVisible())) {
            win.hide();
        }
        else {
            win.show(fromTray);
        }
    }else{
        win.show();
    }
}

exports.fastSave = function(params) {
    mainWindow.send('fastSave', params);
}
exports.addToCache = function(params) {
    mainWindow.send('addToCache', params);
}

exports.addScreenshot = function(attrs) {
    mainWindow.send('addScreenshot', attrs);
}