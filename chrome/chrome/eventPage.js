//XHR
var Api = {
	xhr: function(method, url, data, callback) {
		var xhr = new XMLHttpRequest();

		xhr.open(method, 'http://127.0.0.1:1505/' + url);
		xhr.setRequestHeader("Content-type", /*(method=='POST'?"application/x-www-form-urlencoded":*/"application/json; charset=utf-8"/*)*/ );
		xhr.onreadystatechange = function(data){
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var json = {};
					try{
						json = JSON.parse(xhr.response);
					}catch(e) {
						if (e) {json = {result:false};}
					}
					callback(json);
					xhr = null;
				}else{
					onError();
				}
			}
		};

		xhr.timeout = 200;

		var onError = function () { if (xhr!=null) callback({result:false}); xhr = null; };
		xhr.ontimeout = onError;
		xhr.onerror = onError;
		try {
			if (data==null) {
				xhr.send();
			}else{
				xhr.send(JSON.stringify(data));
			}
		}catch(e) {
			if (e) {console.log(e); onError();}
		}
	},

	get: function(url,callback) {
		this.xhr('GET', url, null, callback);
	},

	post: function(url, data, callback) {
		this.xhr('POST', url, data, callback);
	},

	put: function(url, data, callback) {
		this.xhr('PUT', url, data, callback);
	}
}


//Current update
var currentUpdate={
	major: true,
	openChangeLog: function() {
		chrome.tabs.create({url:'http://blog.raindrop.io/'});
	}
}


//Notifications
{
	var notifications = {
		enabled: false,

		createFirstRunPlaceholder: function () {
			if (notifications.enabled)
				return setTimeout(function () {
					chrome.notifications.create("firstRun", {
						type: "basic",
						iconUrl: 'images/icon-48.png',
						title: chrome.i18n.getMessage("appName"),
						message: chrome.i18n.getMessage("firstRun"),
						priority: 2,
						buttons: [
							{title: chrome.i18n.getMessage("refreshPage"), iconUrl: "images/refresh.png"},
							{title: chrome.i18n.getMessage("support"), iconUrl: "images/support.png"}
						]
					}, function (nid) {
					});
				}, 500);
			else
				return null;
		},

		afterUpdate: function() {
			if (notifications.enabled)
				if (currentUpdate.major)
					chrome.notifications.create("afterUpdate", {
						type: "basic",
						iconUrl: 'images/icon-48.png',
						title: chrome.i18n.getMessage("afterUpdateTitle"),
						message: chrome.i18n.getMessage("afterUpdate"),
						priority: 2,
						buttons: [
							{title: chrome.i18n.getMessage("seeChangeLog"), iconUrl: "images/more.png"}
						],
						isClickable: true
					}, function (nid) {
					});
		},

		afterClose: function (notificationId, byUser) {
			switch (notificationId) {
				case 'firstRun':
				case 'afterUpdate':
					chrome.notifications.clear(notificationId, function (wasCleared) {
					});
				break;
			}
		},

		onClick: function (notificationId) {
			switch (notificationId) {
				case 'firstRun':

				break;
				case 'afterUpdate':
					currentUpdate.openChangeLog();
				break;
			}

			chrome.notifications.clear(notificationId, function (wasCleared) {});
		},

		buttonClick: function (notificationId, buttonIndex) {
			switch (notificationId) {
				case 'firstRun':
					switch (buttonIndex) {
						case 0:
							chrome.tabs.reload(null);
							break;
						case 1:
							chrome.tabs.create({url: 'https://raindrop.io/static/help'});
							break;
					}
				break;

				case 'afterUpdate':
					currentUpdate.openChangeLog();
				break;
			}
		}
	};

	if (typeof chrome.notifications != 'undefined') {
		notifications.enabled = true;
		chrome.notifications.onButtonClicked.addListener(notifications.buttonClick);
		chrome.notifications.onClosed.addListener(notifications.afterClose);
		chrome.notifications.onClicked.addListener(notifications.onClick);
	}
}


//Context menus
{
	var contextMenus = {
		onClick: function (info, tab) {
			var someUrl = '';

			switch (info.menuItemId) {
				case 'raindropSavePage':

				break;

				case 'raindropSaveLink':
					someUrl = info.linkUrl;
				break;

				case 'raindropSaveImage':
					someUrl = info.srcUrl;
				break;
			}

			Api.get('bookmark/save?url='+encodeURIComponent(someUrl||tab.url), function(json){
				json = json || {};
				var placeholder = notifications.createFirstRunPlaceholder();

				if (!json.result){
					chrome.tabs.sendMessage(tab.id, {action: "savePopup", url: tab.url, someUrl: someUrl}, function (response) {
						if (typeof response == 'undefined')
							response = false;

						if (response)
							clearTimeout(placeholder);
					});
				}
				else
					clearTimeout(placeholder);
			});
		}
	}

	chrome.contextMenus.create({
		id: "raindropSavePage",
		title: chrome.i18n.getMessage("savePage"),
		contexts: ["page", "browser_action", "page_action"],
		documentUrlPatterns: ["http://*/*", "https://*/*"]
	});

	chrome.contextMenus.create({
		id: "raindropSaveImage",
		title: chrome.i18n.getMessage("saveImage"),
		contexts: ["image"],
		documentUrlPatterns: ["http://*/*", "https://*/*"]
	});

	chrome.contextMenus.create({
		id: "raindropSaveLink",
		title: chrome.i18n.getMessage("saveLink"),
		contexts: ["link"],
		documentUrlPatterns: ["http://*/*", "https://*/*"]
	});

	chrome.contextMenus.onClicked.addListener(contextMenus.onClick);
}


//Browser action
{
	var browserAction = {
		tabId: null,
		onClick: function (tab) {
			browserAction.tabId = tab.id;

			var defaultOnClick = function() {
				chrome.browserAction.getPopup({tabId: tab.id}, function(disableInline){
					if (!disableInline)
						chrome.tabs.sendMessage(tab.id, {action: "showPopup", url: tab.url}, function (response) {

						});
				});
			}

			//If desktop app is running check
			Api.get('', function(json){
				json = json || {result:false};
				json.result = json.result || false;
				if (json.result){
					chrome.tabs.sendMessage(tab.id, {action: "parsePage"}, function(response) {
						Api.post('bookmark/save?url=' + encodeURIComponent(tab.url) + '&mode=extensionButton', {item: response}, function (json) {
							json = json || {};

							if (!json.result) {
								defaultOnClick();
							}
							else {
								clearTimeout(placeholder);

								chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 100}, function (dataURI) {
									Api.post('bookmark/screenshot', {
										url: encodeURIComponent(tab.url),
										dataURI: dataURI
									}, function () {
									})
								});
							}
						});
					});
				}
				else
					defaultOnClick();
			});
		}
	}

	chrome.browserAction.onClicked.addListener(browserAction.onClick);
}


//Messages from inject js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.action){
		case 'getScreenshot':
			chrome.tabs.captureVisibleTab(null, {format:'jpeg', quality: 100}, function(dataURI) {
				sendResponse(dataURI);
			});
		break;

		case 'refreshPage':
			chrome.tabs.reload(null);
		break;

		case 'removePopup':

		break;

		case 'close':

		break;

        case 'openTab':
			console.log(request);
            chrome.tabs.create({url: request.url});
        break;

		case 'desktopAppRun':
			chrome.browserAction.setPopup({tabId: sender.tab.id, popup: ""});

			Api.get('', function(json){
				json = json || {};
				chrome.tabs.sendMessage(sender.tab.id, {action: "desktopAppRun", result: json.result || false}, function (response) {});
			});
		break;

		case 'desktopSaveCurrentPage':
			chrome.tabs.sendMessage(tab.id, {action: "parsePage"}, function(response) {
				Api.post('bookmark/save?url=' + encodeURIComponent(sender.tab.url), {item: response}, function (json) {
					json = json || {};
					if (json.result)
						chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 100}, function (dataURI) {
							Api.post('bookmark/screenshot', {
								url: encodeURIComponent(sender.tab.url),
								dataURI: dataURI
							}, function () {
							})
						});
				});
			});
		break;

		case 'getURL':
			chrome.tabs.getSelected(function(tab){
				sendResponse(tab.url);
			});
		break;
	}
	return true;
});


//after install
chrome.runtime.onInstalled.addListener(function(details){
	/*var openURLafter=function(url){
		if (typeof url == 'undefined')
			url = '/extension?installed';

		chrome.tabs.create({url:'https://raindrop.io'+url});
	}*/

	switch(details.reason){
		case 'install':
			//openURLafter();
			break;

		case 'update':
			notifications.afterUpdate();
			break;
	}
});