var {extension} = require('./extension').default

const GA_TRACKING_ID 	= "UA-45127971-1";

const Analytics = {
	send(payload) {
		let request = new XMLHttpRequest();
		let message = "v=1&tid=" + GA_TRACKING_ID + "&aip=1&ds=add-on" + payload;

		request.open("POST", "https://www.google-analytics.com/collect", true);
		request.send(message);
	},

	pageView(page, userId="") {
		this.send("&t=pageview&dp="+encodeURIComponent(page)+"&cid="+userId);
	}
}

if (extension){
	var onMessage = (r, sender, sendResponse)=>{
		switch(r.action){
			case "pageView":
				Analytics.pageView(r.page, r.userId||"");
				return true
		}
	}

	extension.runtime.onMessage.removeListener(onMessage);
	extension.runtime.onMessage.addListener(onMessage);
}

export default Analytics