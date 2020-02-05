var {extension} = require('./extension').default

if (extension){
	var onMessage = (r, sender, sendResponse)=>{
		switch(r.action){
			case "pageView":
				
				return true
		}
	}

	extension.runtime.onMessage.removeListener(onMessage);
	extension.runtime.onMessage.addListener(onMessage);
}

export default Analytics