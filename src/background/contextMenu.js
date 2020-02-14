import saver from './saver'

var {extension, getCurrentTab, browserName, openTab, openModal, getHotkeysSettingsPage} = require('./extension').default

const contextMenus = {
	ids: {
		savePage: "raindropContextSavePage",
		saveLink: "raindropContextSaveLink",
		saveImage: "raindropContextSaveImage",
		showBookmarks: "raindropContextShowBookmarks",
		hotKeys: "raindropContextHotKeys",

		settings: "raindropContextSettings",
		logOut: "raindropContextLogOut"
	},

	onClick: function (info) {
		switch (info.menuItemId) {
			case contextMenus.ids.showBookmarks:
				return openTab("https://app.raindrop.io")
			break;

			case contextMenus.ids.settings:
				return openTab("https://app.raindrop.io/#/settings")
			break;

			case contextMenus.ids.logOut:
				return openTab("https://raindrop.io/auth/logout")
			break;

			case contextMenus.ids.hotKeys:
				return openTab(getHotkeysSettingsPage())
			break;

			case contextMenus.ids.savePage:
			case contextMenus.ids.saveLink:
			case contextMenus.ids.saveImage:
				var url = info.srcUrl || info.linkUrl;
				if (url)
					saver.save(url)
				else
					getCurrentTab((currentTab)=>{
						if (currentTab.url)
							saver.save(currentTab.url)
					})
				//openModal("?saveurl="+encodeURIComponent(info.linkUrl)+"&modal=1")
			break;
		}
	},

	onCommand(command) {
		switch(command){
			case 'save-page':
				contextMenus.onClick({menuItemId: contextMenus.ids.savePage});
			break;

			case 'show-bookmarks':
				contextMenus.onClick({menuItemId: contextMenus.ids.showBookmarks});
			break;
		}
	},

	onMessage(r, sender, sendResponse) {
		switch(r.action){
			case "saveLink":
				contextMenus.onClick({menuItemId: contextMenus.ids.saveLink, linkUrl: r.url});
				return true
		}
	},

	addItem(id,obj) {
		extension.contextMenus.create(Object.assign({id:id},obj))
	},

	init() {
		contextMenus.addItem(contextMenus.ids.savePage, {
			title: extension.i18n.getMessage("savePage"),
			contexts: ["page"],
			//documentUrlPatterns: ["*://*/*"]
		});

		contextMenus.addItem(contextMenus.ids.showBookmarks,{
			title: extension.i18n.getMessage("myBookmarks"),
			contexts: ["browser_action", "page_action"]
		});

		contextMenus.addItem(contextMenus.ids.settings,{
			title: extension.i18n.getMessage("settings"),
			contexts: ["browser_action", "page_action"]
		});

		if (getHotkeysSettingsPage())
		contextMenus.addItem(contextMenus.ids.hotKeys,{
			title: extension.i18n.getMessage("hotkey"),
			contexts: ["browser_action", "page_action"]
		});

		contextMenus.addItem(contextMenus.ids.logOut,{
			title: extension.i18n.getMessage("logOut"),
			contexts: ["browser_action", "page_action"]
		});

		contextMenus.addItem(contextMenus.ids.saveImage, {
			title: extension.i18n.getMessage("saveImage"),
			contexts: ["image"],
			//documentUrlPatterns: ["*://*/*"]
		});

		contextMenus.addItem(contextMenus.ids.saveLink, {
			title: extension.i18n.getMessage("saveLink"),
			contexts: ["link", "video"],
			//documentUrlPatterns: ["*://*/*"]
		});

		extension.contextMenus.onClicked.removeListener(contextMenus.onClick);
		extension.contextMenus.onClicked.addListener(contextMenus.onClick);
	}
}

if (typeof extension.contextMenus != 'undefined'){
	if (typeof extension.contextMenus.removeAll == "function")
		extension.contextMenus.removeAll(contextMenus.init)
	else
		contextMenus.init();

	extension.commands.onCommand.removeListener(contextMenus.onCommand);
	extension.commands.onCommand.addListener(contextMenus.onCommand);
}

if (extension){
	extension.runtime.onMessage.removeListener(contextMenus.onMessage);
	extension.runtime.onMessage.addListener(contextMenus.onMessage);
}

export default contextMenus;