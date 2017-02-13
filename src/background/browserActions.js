import links from './links'
var {extension, getCurrentTab, browserName, isNewTabPage, updateTabAndGoToRaindrop} = require('./extension').default

var manifest = require('json!../config/manifest.json');
var popupPath = manifest.browser_action.default_popup;

const button = {
	icons: {},

	initIcons() {
		var idle = manifest.browser_action.default_icon;
		var statuses = {saved: {}, newtab: {}};//, loading: {}, savedloading: {}

		for(var i in statuses)
			for (var j in manifest.browser_action.default_icon)
				statuses[i][j] = manifest.browser_action.default_icon[j].replace("idle", "/"+i);

		statuses.idle = manifest.browser_action.default_icon;
		if (__PLATFORM__=="firefox")
			for(var i in statuses.idle)
				statuses.idle[i] = statuses.idle[i].replace("idle","firefox_idle");
		button.icons = statuses;
	},

	render() {
		getCurrentTab((tab)=>{
			if (!tab) return;
			if (!tab.url) return;

			if (isNewTabPage(tab.url)){
				//Open Raindrop.io
				extension.browserAction.setIcon({path: button.icons["idle"], tabId: tab.id});

				extension.browserAction.setPopup({tabId: tab.id, popup: ""})
				extension.browserAction.setTitle({tabId: tab.id, title: extension.i18n.getMessage("open")+" Raindrop.io"})

				//extension.browserAction.setBadgeText({tabId: tab.id, text: ""});
			}
			else{
				var status = links.getStatus(tab.url);
				var icon = button.icons[status];

				extension.browserAction.setIcon({path: icon, tabId: tab.id});

				extension.browserAction.setPopup({tabId: tab.id, popup: popupPath})
				extension.browserAction.setTitle({tabId: tab.id, title: extension.i18n.getMessage("saveToRaindrop")})

				/*extension.browserAction.setBadgeText({tabId: tab.id, text: (status=="saved"?"✔":"")});
				extension.browserAction.setBadgeBackgroundColor({tabId: tab.id, color: "#4A90E2"})*/
			}

			extension.browserAction.enable(tab.id);
		})
	}
}

const onMessage = (r, sender, sendResponse)=>{
	switch(r.action){
		case "setStatus":
			getCurrentTab((tab)=>{
				var obj = Object.assign({},r);
				if (!obj.url)
					obj.url = tab.url;

				links.setStatus(obj);
				button.render();
			});
		break;

		case "appStarted":
			links.resetAll();
		break;
	}
}

const onTabUpdate = (tab)=>{
	setTimeout(()=>button.render(),100);
}

const onClicked = (tab)=>{
	updateTabAndGoToRaindrop()
}

if (extension){
	extension.browserAction.onClicked.removeListener(onClicked);
	extension.browserAction.onClicked.addListener(onClicked);

	extension.runtime.onMessage.removeListener(onMessage);
	extension.runtime.onMessage.addListener(onMessage);

	extension.tabs.onUpdated.removeListener(onTabUpdate);
	extension.tabs.onUpdated.addListener(onTabUpdate);

	extension.tabs.onActivated.removeListener(onTabUpdate);
	extension.tabs.onActivated.addListener(onTabUpdate);

	button.initIcons();
}