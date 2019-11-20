var webextension={};
if (typeof msBrowser != "undefined") webextension = msBrowser;
else if (typeof browser != "undefined") webextension = browser;
else if (typeof chrome != "undefined") webextension = chrome;

var sendMessageToIframe = function(m) {
	if (document.getElementById("iframe"))
		document.getElementById("iframe").contentWindow.postMessage(m,'*');
}

var sendMessageToBackground = function(data, callback) {
	if (typeof webextension.runtime != "undefined"){
		webextension.runtime.sendMessage(data, callback)
	}
}

var onMessage = function(e) {
	//if (e.origin!="https://raindrop.io")
	//	return;

	switch(e.data.action) {
		case "currentTab":
			new Promise((res)=>{
					webextension.tabs.query({active: true, currentWindow: true}, (tabs=[])=>{
						res(tabs[0])
					});
				})
				.then((tab)=>{
					sendMessageToIframe({action: e.data.action, content: tab});
				})
				.catch((e)=>{
					sendMessageToIframe({action: e.data.action, content: false});
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