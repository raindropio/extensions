var browserName = "chrome"
if (window.navigator.userAgent.indexOf('Edge/')>0) browserName = "edge";
if (!!window.opera || /opera|opr/i.test(navigator.userAgent)) browserName = "opera";
if ('MozAppearance' in document.documentElement.style) browserName = "firefox";

var webextension={};
if (typeof msBrowser != "undefined") webextension = msBrowser;
else if (typeof browser != "undefined") webextension = browser;
else if (typeof chrome != "undefined") webextension = chrome;

var os = "";
if (navigator.appVersion.indexOf("Win")!=-1) os = "windows";
else if (navigator.appVersion.indexOf("Mac")!=-1) os = "mac";
else if (navigator.appVersion.indexOf("X11")!=-1) os = "unix";
else if (navigator.appVersion.indexOf("Linux")!=-1) os = "linux";

var getCurrentTab = (callback)=>{
	new Promise((res)=>{
			webextension.tabs.query({active: true, currentWindow: true}, (tabs=[])=>{
				res(tabs[0])
			});
		})
		.then((tab)=>{
			callback(tab);
		})
		.catch((e)=>{
			callback(false);
		})
}

const newTabRegex = [/^about\:(newtab|home)/i, /^chrome\:\/\/(newtab|startpage)/i/*, /^chrome-extension\:\/\//i*/];

export default {
	extension: webextension,
	browserName: browserName,
	osName: os,
	getCurrentTab: getCurrentTab,
	newTabRegex: newTabRegex,

	openTab(url) {
		if (typeof webextension.tabs != "undefined")
			webextension.tabs.create({url: url});
	},
	sendMessage(obj, callback) {
		getCurrentTab((tab)=>{
			if (!tab) return;

			if (typeof webextension.tabs != "undefined")
				webextension.tabs.sendMessage(tab.id, obj, callback);
		});
	},
	sendMessageToBackground(obj,callback) {
		if (typeof webextension.runtime != "undefined"){
			webextension.runtime.sendMessage(obj, callback);
		}
	},
	
	openModal(urlSuffix, pos="center") {
		var w = 300, h = 600, gap = 30;
		var left = 0;
    	var top = 0;

    	switch(pos) {
    		case "center":
    			left = (screen.width/2)-(w/2);
    			top = (screen.height/2)-(h/2);
    		break;

    		case "top-right":
    			left = screen.width - w - gap;
    			top = gap;
    		break;

    		case "bottom-right":
    			left = screen.width - w - gap;
    			top = screen.height - h - gap;
    		break;
    	}

		webextension.windows.create({
			url: webextension.extension.getURL('/index.html'+urlSuffix),
			type: "popup",
			width: w,
			height: h,
			left: parseInt(left),
			top: parseInt(top),
			//alwaysOnTop: true
		})
	},

	isNewTabPage(url) {
		var isNewTab = false;
		newTabRegex.forEach((r)=>{
			if (r.test(url||""))
				isNewTab=true;
		})

		return isNewTab;
	},

	updateTabAndGoToRaindrop() {
		getCurrentTab((tab)=>{
			if (!tab) return;

			webextension.browserAction.disable(tab.id);
			webextension.tabs.update(tab.id, {url: "https://raindrop.io/app"})
		});
	},

	getHotkeysSettingsPage() {
		var link = null;
		switch(browserName) {
			case "chrome": link = "chrome://extensions/configureCommands"; break;
			case "opera": link = "opera://settings/configureCommands"; break;
		}
		return link;
	}
}