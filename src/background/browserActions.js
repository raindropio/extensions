import links from './links'
import common from './common'
import config from './config'
var {extension, getCurrentTab, browserName, isNewTabPage, updateTabAndGoToRaindrop} = require('./extension').default

var manifest = require('json!../config/manifest.json');
var popupPath = manifest.browser_action.default_popup;

const button = {
	/*icons: {},

	initIcons() {
		var idle = manifest.browser_action.default_icon;
		var statuses = {saved: {}, newtab: {}};//, loading: {}, savedloading: {}

		for(var i in statuses)
			for (var j in manifest.browser_action.default_icon)
				statuses[i][j] = manifest.browser_action.default_icon[j].replace("idle", "/"+i);

		statuses.idle = manifest.browser_action.default_icon;
		if (__PLATFORM__=="firefox"){
			for(var i in statuses.idle)
				statuses.idle[i] = statuses.idle[i].replace("idle","firefox_idle");

			for(var i in statuses.saved)
				statuses.idle[i] = statuses.idle[i].replace("saved","firefox_saved");
		}
		button.icons = statuses;
	},*/

	render() {
		getCurrentTab((tab)=>{
			if (!tab) return;
			if (!tab.url) return;

			var isAppBuild = false;
			//Is AppBuild
			if (__APPBUILD__){
				if (common.getSetting('appbuild'))
					isAppBuild = true;
			}

			var /*buttonIcon="",*/buttonBadge="", buttonPopup="", buttonTitle="";

			if ((isNewTabPage(tab.url))&&(!isAppBuild)) {
				//Open Raindrop.io
				//buttonIcon = button.icons["idle"]
				buttonTitle = extension.i18n.getMessage("open")+" Raindrop.io"
			}
			else{
				var status = links.getStatus(tab.url);
				if (status == 'saved')
					buttonBadge = '★'
				//buttonIcon = button.icons[status];
				buttonPopup = popupPath
				buttonTitle = extension.i18n.getMessage("saveToRaindrop")

				if (isAppBuild)
					buttonPopup = config.appBuildPage
			}

			//extension.browserAction.setIcon({tabId: tab.id, path: buttonIcon});
			extension.browserAction.setBadgeText({text: buttonBadge})
			extension.browserAction.setPopup({tabId: tab.id, popup: buttonPopup})
			extension.browserAction.setTitle({tabId: tab.id, title: buttonTitle})
			extension.browserAction.enable(tab.id);
		})
	}
}

const onMessage = (r, sender, sendResponse)=>{
	switch(r.action){
		case "rerenderBrowserAction":
			button.render();
		break;

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

	//button.initIcons();
	extension.browserAction.setBadgeBackgroundColor({color: '#0087EA'})
	try{
		extension.browserAction.setBadgeTextColor({color: '#FFFFFF'})
	}catch(e){}
}