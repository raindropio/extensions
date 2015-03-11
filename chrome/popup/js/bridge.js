var bridge={
	status: false,

	getURL: function(params) {
		window.parent.postMessage({action: 'raindrop-getURL', params: params},'*');

		if (typeof window.nodependencies != 'undefined')
			environment.getURL(params);
	},

	parsePage: function(params) {
		this.status = false;
		window.parent.postMessage({action: 'raindrop-getHTML', params: params},'*');

		if (typeof window.nodependencies != 'undefined')
			bridgeAction({action: "parseURLOtherWay", item: params.url});
	},

	parseURL: function(params) {
		this.status = false;
		window.parent.postMessage({action: 'raindrop-parseURL', params: params},'*');

		if (environment.name == 'desktop')
			Desktop.parseUrl(params);
	},

	capturePage: function(url) {
		if (environment.name == 'desktop'){
			if (typeof Desktop.screenshots[ url ] != 'undefined')
				bridgeAction({
					action: "setScreenshot",
					dataURI: Desktop.screenshots[ url ]
				});
			else{
				Desktop.makeScreenshot(url);
			}
		}
		else {
			window.parent.postMessage({action: 'raindrop-getScreenshot'}, '*');

			if (typeof window.nodependencies != 'undefined')
				environment.getScreenshot();
		}
	},

    openTab: function(url) {
        window.parent.postMessage({action: 'raindrop-openTab', params: {url: url}},'*');
    },

    setConfig: function(params) {
        window.parent.postMessage({action: 'raindrop-setConfig', params: params},'*');
    },

	close: function(){
		window.parent.postMessage({action: 'raindrop-closePopup'},'*');

		if (typeof Desktop != 'undefined')
			Desktop.hide();
	},

	savePage: function() {
		window.parent.postMessage({action: 'raindrop-savePage'},'*');
	}
}


//messages from inject js
var bridgeAction = function(data) {
	switch(data.action){
		case 'setHTML':
			if ((typeof data.item.result != 'undefined')&&(!bridge.status)) {
				bridge.status=true;
				angular.element(document.getElementById('CurrentController')).scope().bookmarkWorker.setFormData(data.item);
			}
			break;

		case 'parseURLOtherWay':
			angular.element(document.getElementById('CurrentController')).scope().bookmarkWorker.parseURLOtherWay(data.item);
			break;

		case 'setURL':
			try {
				angular.element(document.getElementById('CurrentController')).scope().bookmarkWorker.checkURL(data.url, data.params);
			}catch(e){}
			break;

		case 'setScreenshot':
			angular.element(document.getElementById('modal-edit-bookmark')).scope().worker.setCapturedPage(data.dataURI);
			break;

		case 'dropURL':
			angular.element(document.getElementById('CurrentController')).scope().bookmarkWorker.dropURL(data.url);
			break;
	}
}
window.addEventListener("message", function(e){
	bridgeAction(e.data);
});