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

export default R