var {extension} = require('./extension').default

if (typeof extension.runtime != "undefined")
if (typeof extension.runtime.onInstalled != "undefined")
extension.runtime.onInstalled.addListener(function(details){
	switch(details.reason){
		case 'install':
			//extension.tabs.create({url:'https://raindrop.io/other/newtab/welcome/index.html?platform=clipper'});
		break;

		case 'update':

		break;
	}
});