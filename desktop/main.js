//Init app
app = require('app');
app.fixDIR = function(s) {
    return s.replace(/\\/g,'/');
}
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});
require('crash-reporter').start();

//Core libs
BrowserWindow = require('browser-window');
Screen = null;
Shell = require('shell');

//Windows
mainWindow = require('./environment/mainwindow');
screenshot = require('./environment/screenshot');

//More
ipc = require('ipc');

var server = require('./environment/server'),
    Tray = require('tray'),
    Menu = require('menu'),
    appIcon = null,
    GlobalShortcut = require('global-shortcut'),
    autoUpdater = require('auto-updater'),
    dialog = require('dialog'),
    fs = require('fs');

autoUpdater.setFeedUrl('https://raindrop.io/mac-update?version=' + app.getVersion());
autoUpdater.on("update-downloaded", function(event,releaseNotes,releaseName,releaseDate,updateUrl,quitAndUpdate) {
    dialog.showMessageBox(null, {icon: __dirname + '/images/icon.png', buttons: ["Restart now", "Later"], type: "info", title:"Update installed", message: "New version of Raindrop.io is installed! Would you like to restart the application?"}, function(r){
        if (r==0)
            quitAndUpdate();
    });
});
autoUpdater.on("update-available", function() {
    if (settings.clickedOnUpdate)
    dialog.showMessageBox(null, {
        icon: __dirname + '/images/icon.png',
        buttons: ["OK"],
        type: "info",
        title:"Update available",
        message: "New version of Raindrop.io is available!",
        detail: "After a few minutes update will be downloaded. Please wait and do not close the application."
    });
});
autoUpdater.on("update-not-available", function() {
    if (settings.clickedOnUpdate)
    dialog.showMessageBox(null, {icon: __dirname + '/images/icon.png', buttons: ["OK"], type: "info", title:"You’re up-to-date!", message: "You have the latest version of Raindrop.io"});
});

//Settings
settings = {
    clickedOnUpdate: false,
    original: __dirname + '/settings.json',
    fileName: app.getDataPath() + '/settings.json',
    params: {},
    load: function() {
        var loadFrom = settings.fileName;

        if (!fs.existsSync(app.getDataPath()))
            fs.mkdirSync(app.getDataPath());

        if (!fs.existsSync(settings.fileName)){
            fs.createReadStream(settings.original).pipe(fs.createWriteStream(settings.fileName));

            loadFrom = settings.original;
        }

        settings.params = fs.readFileSync(loadFrom);
        try {settings.params = JSON.parse(settings.params);}
        catch (err) {}
    },
    save: function() {
        if ((!settings.params.dock)&&(!settings.params.tray))
            settings.params.dock = true;
        fs.writeFile(settings.fileName, JSON.stringify(settings.params,null,2), function (err) {});
    }
};
settings.load();


//Dock
if (!settings.params["dock"]) {
    if (process.platform == 'darwin')
        app.dock.hide();
}
else{
    app.on('activate-with-no-open-windows', function(){
        mainWindow.show();
    });
}


//Only in mac
if (process.platform == 'darwin'){
    var applescript = require("applescript");
    if (settings.params['first-start']){
        var appPath = null;
        try{
            appPath = process.execPath.match(/.*?\.app/)[0];
        }catch(e){if(e) appPath=null;}

        if (appPath!=null)
        applescript.execString('tell application "System Events" to make login item at end with properties {path:"'+ appPath +'", hidden:true, name:"Raindrop"}', function(err, rtn) {
            if (err) console.log(err);
        });
    }
}

settings.params['first-start'] = false;
settings.save();


//Init server
server.init();


app.on('ready', function() {
    Screen = require('screen');

    //Core menu
    Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: 'Raindrop.io',
        submenu: [
            {
                label: "About Raindrop.io",
                selector: 'orderFrontStandardAboutPanel:'
            },
            {
                label: 'Check for Updates...',
                click: function() {
                    settings.clickedOnUpdate = true;
                    try{autoUpdater.checkForUpdates();}
                    catch(e){
                        if(e)
                            dialog.showErrorBox('Update error', 'Please visit https://raindrop.io and manually download latest version.');
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Settings',
                accelerator: 'Command+,',
                click: function() { mainWindow.init('#/settings'); mainWindow.show(); }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function() { app.quit(); }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'Command+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'Command+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'Command+C',
                selector: 'copy:'
            },
            {
                label: 'Paste',
                accelerator: 'Command+V',
                selector: 'paste:'
            },
            {
                label: 'Select All',
                accelerator: 'Command+A',
                selector: 'selectAll:'
            },
        ]
    },
    {
        label: 'Window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'Command+M',
                selector: 'performMiniaturize:'
            },
            {
                label: 'Close',
                accelerator: 'Command+W',
                selector: 'performClose:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                selector: 'arrangeInFront:'
            },
        ]
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Support",
                click: function() { Shell.openExternal("https://raindrop.io/static/help"); }
            }
        ]
    }
    ]));

    mainWindow.init();

    //Tray icon
    if ((settings.params["tray"])&&(process.platform == 'darwin')) {
        appIcon = new Tray(__dirname + '/images/tray.png');
        appIcon.setPressedImage(__dirname + '/images/tray-active.png');
        appIcon.setToolTip('Raindrop.io');

        appIcon.on('clicked', mainWindow.showOrHide);
        appIcon.on('double-clicked', mainWindow.showOrHide);
    }

    //Shortcut
    GlobalShortcut.register('command+shift+e', mainWindow.showOrHide);

    //Events
    ipc.on('hide', function(event, arg) {
        mainWindow.hide();
    });

    ipc.on('minimize', function(event, arg) {
        mainWindow.minimize();
    });

    ipc.on('maximize', function(event, arg) {
        mainWindow.maximize();
    });

    ipc.on('saveSettings', function(event, args) {
        settings.params=args;
        settings.save();
    });

    ipc.on('makeScreenshot', function(event, arg) {
        screenshot.make(arg, function(base64){
            mainWindow.addScreenshot({
                url: arg,
                dataURI: base64,
                setNow: true
            });
        });
    });

    try{autoUpdater.checkForUpdates();}
    catch(e){}
});