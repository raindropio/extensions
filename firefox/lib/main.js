var self = require("sdk/self");
var tabs = require("sdk/tabs");
const {XMLHttpRequest} = require("sdk/net/xhr");
var { ToggleButton } = require("sdk/ui/button/toggle");
var injectJS=null;


//Popup
var popup = require("sdk/panel").Panel({
	width: 380,
	height: 650,
	contentURL: "https://raindrop.io/other/popup/popup.html?style=nodependencies",
	contentScriptFile: self.data.url("firefox/popup.js"),
	onHide: function() {
		button.state('window', {checked: false});
	}
});


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

function initInject() {
	//if (injectJS==null) {
		injectJS = tabs.activeTab.attach({
			contentScriptFile: [self.data.url("js/jquery.js"), self.data.url("js/mousetrap.js"), self.data.url("js/inject.js"), self.data.url("firefox/inject.js")]
		});

		//messages from inject
		injectJS.port.on("iamLive", function (result) {
			button.state('window', {checked: result});
		});
		injectJS.port.on("getScreenshot", function () {
			injectJS.port.emit("setScreenshot", tabs.activeTab.getThumbnail());
		});
		injectJS.port.on("close", function () {
			button.state('window', {checked: false});
		});

		injectJS.port.on("desktopSaveCurrentPage", function () {
			Api.get('bookmark/save?url=' + encodeURIComponent(tabs.activeTab.url), function (json) {
				json = json || {};
				if (json.result)
					Api.post('bookmark/screenshot', {
						url: encodeURIComponent(tabs.activeTab.url),
						dataURI: tabs.activeTab.getThumbnail()
					}, function () {
					});
			});
		});

		Api.get('', function (json) {

			json = json || {};

			injectJS.port.emit("Arguments", {
				css: self.data.url("css/inject.css"),
				iframe: "https://raindrop.io/other/popup/popup.html",
				desktopAppRun: json.result || false
			});
		});
	//}
}

function openPopup(state) {
	if (state.checked) {
		popup.show({
			position: button
		});

		popup.postMessage("openPopup");
	}
	/*if (state.checked){
		Api.get('bookmark/save?url='+encodeURIComponent(tabs.activeTab.url)+'&mode=extensionButton', function(json) {
			json = json || {};

			//send message to inject
			if (!json.result) {
				injectJS.port.emit("showPopup", {
					css: self.data.url("css/inject.css"),
					iframe: "https://raindrop.io/other/popup/popup.html",
				});
			}
			else{
				button.state('window', {checked: false});
				Api.post('bookmark/screenshot', {
					url: encodeURIComponent(tabs.activeTab.url),
					dataURI: tabs.activeTab.getThumbnail()
				}, function(){});
			}
		});
	}
	else{
		injectJS.port.emit("closePopup", true);
	}*/
}

var button = ToggleButton({
	id: "popupButton",
	label: "Raindrop.io",
	//disabled: true,
	icon: {
		"16": "./icons/16.png",
		"32": "./icons/32.png",
		"64": "./icons/64.png"
	},
	onChange: openPopup
});

tabs.on("close", function(tab){
	button.state('window', {checked: false});
});

tabs.on("ready", function(tab){
	button.state('window', {checked: false});
});

tabs.on("load", function(tab){
	button.state('window', {checked: false});
});

tabs.on("pageshow", function(tab){
	button.state('window', {checked: false});
	initInject();
})

tabs.on("deactivate", function(tab){
	button.state('window', {checked: false});
});