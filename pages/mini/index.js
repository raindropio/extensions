var webextension={};
if (typeof msBrowser != "undefined") webextension = msBrowser;
else if (typeof browser != "undefined") webextension = browser;
else if (typeof chrome != "undefined") webextension = chrome;

var getCurrentTab = function(callback) {
	webextension.tabs.query({active: true, currentWindow: true}, (tabs=[])=>{
		callback(tabs[0])
	})
}

var sendMessageToIframe = function(m) {
	if (document.getElementById("iframe"))
		document.getElementById("iframe").contentWindow.postMessage(m,'*');
}

var sendMessageToBackground = function(data, callback) {
	if (typeof webextension.runtime != "undefined"){
		webextension.runtime.sendMessage(data, callback)
	}
}

var sendMessageToPage = function(data, callback) {
	getCurrentTab((tab)=>{
		if (!tab) return callback(null)

		if (typeof webextension.tabs != "undefined")
			webextension.tabs.sendMessage(tab.id, data, callback)
		else
			callback(null)
	})
}

var onMessage = function(e) {
	//if (e.origin!="https://raindrop.io")
	//	return;

	switch(e.data.action) {
		case "currentTab":
			new Promise(getCurrentTab)
				.then((tab)=>{
					sendMessageToIframe({action: e.data.action, content: tab});
				})
				.catch((e)=>{
					sendMessageToIframe({action: e.data.action, content: false});
				})
		break;

		case "parse":
			sendMessageToPage(e.data, function(content){
				sendMessageToIframe({action: e.data.action, content})
			})
		break;

		case "capturePage":
			console.log('try to capturePage')
			new Promise(getCurrentTab)
				.then((tab)=>{
					if (tab.url == e.data.url)
						webextension.tabs.captureVisibleTab(null, {format:'jpeg', quality: 100}, function(dataURI) {
							sendMessageToIframe({action: e.data.action, content: dataURI})
						})
					else
						throw new Error(`not current page, ${tab.url} != ${e.data.url}`)
				})
				.catch((error)=>{
					console.log('screenshot', error)
					sendMessageToIframe({action: e.data.action, content: null});
				})
		break;

		case "setButtonStatus":
			sendMessageToBackground(Object.assign({}, e.data, {action: "setStatus"}), function(){});
		break;

		case "openTab":
			if (typeof webextension.tabs != "undefined")
				webextension.tabs.create({url: e.data.url});
		break;
	}
}

window.removeEventListener("message", onMessage, false);
window.addEventListener("message", onMessage, false);


window.onload = function() {
	sendMessageToBackground({action: "appStarted"}, function(){})
	//tabs permission
	webextension.permissions.contains({permissions: ['tabs']}, function(result) {
		if (result){
			localStorage.setItem('tabs-permissions-ignore', '1')
		} else {
			if (localStorage.getItem('tabs-permissions-ignore')!='1')
				document.querySelector('#settings').classList.add('show-badge')
		}
	})
}