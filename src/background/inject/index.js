import drag from './drag'
//import googleSearch from './google'

var parser = {};
if (__PLATFORM__ != "firefox")
	parser = require('../parser').default

window.RaindropTestParse = (callback)=>{
	ParsePage(callback)
}

var {extension} = require('../extension').default

const ParsePage = (callback)=>{
	var parseLocaly = true;

	if ((window.history.state)&&(window.history.length>1))
		parseLocaly = false;

	if (__PLATFORM__ == "firefox")
		parseLocaly = false;

	if (parseLocaly) {
		console.log("local parser")
		parser.run(callback);
	}
	else{
		console.log("server parser")
		callback(false);
	}
}

if (typeof extension.runtime != "undefined")
	if (typeof extension.runtime.onMessage != "undefined")
		extension.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			switch(request.action){
				case "parse":
					ParsePage(sendResponse)
				break;
			}
		});

drag.init()

//Google search
/*if (window.location.href.indexOf('google')!=-1){
	var q = "";
	try{q = decodeURIComponent(window.location.href.match(/[\#\&\?]q=([^&]+)/)[1]).replace('+',' ');}catch(e){}
	
	googleSearch.inject(q);
}*/