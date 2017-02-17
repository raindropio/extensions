var {extension, openTab} = require('./extension').default

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
					if (details.previousVersion.indexOf('5')==0)
						openTab('ready.html?5');
				break;
			}
		});
	}
}

R.init();


//Messages
if (extension){
	const onMessage = (r, sender, sendResponse)=>{
		switch(r.action){
			case "getSetting":
				sendResponse(localStorage.getItem(r.name));
			break;

			case "setSetting":
				var toDel = false;
				if (typeof r.value == "boolean")
					if (!r.value) toDel=true;

				if (!toDel)
					localStorage.setItem(r.name, r.value);
				else
					localStorage.removeItem(r.name);
			break;
		}
	}

	extension.runtime.onMessage.removeListener(onMessage);
	extension.runtime.onMessage.addListener(onMessage);
}

export default R