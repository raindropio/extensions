import config from '../modules/config'
var {getSetting, setSetting, sendMessageToBackground, extension, openTab, getCurrentTab, getHotkeysSettingsPage} = require('../background/extension').default

const ExtensionHelper = {
	getHotkeysSettingsPage: getHotkeysSettingsPage,
	getSetting: getSetting,
	setSetting: setSetting,

	setStatus(obj) {
		sendMessageToBackground(Object.assign({action: "setStatus"}, obj), ()=>{})
	},

	pageView(obj) {
		sendMessageToBackground(Object.assign({action: "pageView"}, obj), ()=>{})
	},

	init() {
		sendMessageToBackground({action: "appStarted"}, ()=>{})
	},

	openTab(url) {
		openTab(url);
	},

	capturePage(url, callback) {
		getCurrentTab((tab={url:""})=>{
			if (tab.url == url)
				extension.tabs.captureVisibleTab(null, {format:'jpeg', quality: 100}, function(dataURI) {
					callback({link: dataURI, type: "image", screenshot: true, dataURI: true});
				});
			else
				callback({link: config.screenshotService+encodeURIComponent(url), type: "image", screenshot: true});
		});
	},

	getHotKey(callback) {
		if (!extension.commands)
			return callback(null);

		extension.commands.getAll((all)=>{
			var key = all.find((k)=>{
				return ((k.name=="_execute_browser_action")||(k.name=="save-page"))
			})

			callback(key ? key.shortcut : null)
		})
	},

	omniboxIsEnabled() {
		if (!chrome.omnibox)
			return false;
		return true;
	}
}

export default ExtensionHelper