/* persist.js - Toolbar Button Complete's module. */
/* author: Geek in Training (user213) <goMobileFirefox@gmail.com> */


const prefs = require("sdk/preferences/service");
const self = require("sdk/self");
const newWinUtils = require("sdk/window/utils");
require("sdk/system/unload").when(onShutdown);

var PREF;
var startup = true;
var preferences = [];
var prefList = [];
var persistentToolbars = [];

function init (pref) {
    PREF = pref;
    
    if ( prefs.isSet(PREF + "list") ) {
        prefList = JSON.parse(prefs.get(PREF + "list"));
    }
    
    for (i = 0, l = prefList.length; i < l; ++i) {
        persistentToolbars[i] = prefList[i].replace(/\.currentset/, "");
	}
    
    restoreButtons();
}

function eachToolbar(callback) {
    for (var i = 0, w = newWinUtils.windows(), l = w.length; i < l; i++) {
		if ("chrome://browser/content/browser.xul" != w[i].location) continue;
        let $ = function (id) {
            return w[i].document.getElementById(id);
        }
        
        for (var i2 = 0; i2 < prefList.length; i2++) {
            let toolbarID = prefList[i2].replace(/\.currentset$/, "");
            if (tb = $(toolbarID)) {
                callback(tb);
            }
        }
    }
}

function restoreButtons (tb) {

    if( startup ) {
        startup = false;
        // restore toolbar buttons in each window.
        eachToolbar(function (tb) {
            restoreButtons(tb);
        });
        return;
    }
    
    let currentSet = prefs.get(PREF + tb.id + ".currentset");
    if (currentSet) {

        let buttons = currentSet.split(",");
        let newButtons = tb.getAttribute("currentset").split(",");
        for (i = 0; i < buttons.length; i++) {
            let index = newButtons.indexOf(buttons[i]);
            if (index !== -1) {
                newButtons.splice(index, 1);
            }
        }

        if (newButtons.length > 0) {
            currentSet = buttons.concat(newButtons).join(",");
        }
        
        tb.currentSet = currentSet;
        tb.setAttribute("currentset", currentSet);
        update(tb.id + ".currentset", currentSet);
        tb.persist = tb.persist.replace(/\s?currentset\s?/, ""); /* remove native persist of currentset, to insure no conflicts.*/
    }
}

function removePrefs() {
    for (i = 0, l = prefList.length; i < l; i++) {
        prefs.reset(PREF + prefList[i]);
    }
    prefs.reset(PREF + "list");
}

function update(add, buttons) {
    var index = prefList.indexOf(add);
    if (index === -1) {
        prefList.push(add);
        persistentToolbars.push(add.replace(/\.currentset/, "") );
        
        preferences.push(buttons);
    } else {
        preferences[index] = buttons;
    }
}

function onShutdown (reason) {
    if (reason == "disable") { 
        removePrefs();
    } else {
    
        for (i = 0; i < prefList.length; i++) {
            if (preferences[i]) {
                prefs.set(PREF + prefList[i], preferences[i]);
            }
        }
        
        prefs.set(PREF + "list", JSON.stringify(prefList));
        eachToolbar(function (tb) {
            tb.persist = tb.persist.replace(/\s?currentset\s?/, ""); /* remove native persist of currentset, to insure no conflicts.*/
        });
    }
}

exports.init = init;
exports.update = update;
exports.persistentToolbars = function () { return persistentToolbars; }
