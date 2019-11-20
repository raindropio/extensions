var {extension, openTab} = require('./extension').default
var settingsCache = {};

const R = {
	init() {
		if (typeof extension.runtime.onInstalled == "undefined")
			return;

		extension.runtime.onInstalled.addListener(function(details){
			switch(details.reason){
				case 'install':
					openTab('ready.html');
				break;

				case 'update':
					
				break;
			}
		});
	},

	getSetting(key) {
		if (typeof settingsCache[key] == "undefined")
			settingsCache[key] = localStorage.getItem(key);

		return settingsCache[key];
	},

	setSetting(key,val) {
		var toDel = false;
		if (typeof val == "boolean")
			if (!val) toDel=true;

		if (!toDel){
			settingsCache[key] = val;
			localStorage.setItem(key, val);
		}
		else{
			delete settingsCache[key];
			localStorage.removeItem(key);
		}
	}
}

R.init();


//Messages
if (extension){
	const onMessage = (r, sender, sendResponse)=>{
		switch(r.action){
			case "getSetting":
				sendResponse(R.getSetting(r.name));
				return true

			case "setSetting":
				R.setSetting(r.name, r.value);
				return true
		}
	}

	extension.runtime.onMessage.removeListener(onMessage);
	extension.runtime.onMessage.addListener(onMessage);
}

export default R