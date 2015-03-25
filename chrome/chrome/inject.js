RainDropPanzer.browser = "chrome";

RainDropPanzer.close = function() {
	this.end();
	chrome.runtime.sendMessage({action: "close"});
}

RainDropPanzer._getArguments = function() {
	return {
		css: chrome.extension.getURL("css/inject.css"),
		iframe: chrome.extension.getURL("popup/popup.html")
	};
}

RainDropPanzer.Desktop = {
	saveCurrentPage: function() {
		chrome.runtime.sendMessage({action: "desktopSaveCurrentPage"});
	},

	actionHandler: function(data, sender, sendResponse) {
		if (typeof sender != 'undefined')
			if (!sender.tab)
				switch(data.action){
					case 'showPopup':
						sendResponse(RainDropPanzer.showTime(RainDropPanzer._getArguments()));
						break;
					case 'savePopup':
						RainDropPanzer.saveTime((data.someUrl||""));
						sendResponse(true);
						break;
					case 'desktopAppRun':
						RainDropPanzer.desktopAppRun = data.result;
						sendResponse(true);
						break;

					case 'parsePage':
						RainDropPanzer.run(sendResponse);
						break;
				}


		switch(data.action){
			case 'raindrop-getHTML':
				RainDropPanzer.run(function(item) {
					document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setHTML', item: item},'*');
				}, data.params);
				break;

			case 'raindrop-parseURL':
				var mimeTypes = {
					'image':['image/jpeg','image/png','image/gif'],
					'html':['text/html',/*'text/plain',*/'application/xhtml+xml']
				};

				$.ajax({
					type: "HEAD",
					async: true,
					url: data.params.url,
					success: function(message,text,response){
						var mime = "",
							mimeType = null;
						try{
							mime = response.getResponseHeader('Content-Type').toLowerCase()
						}catch(e){}
						for (var i in mimeTypes)
							for (var j in mimeTypes[i])
								if (mimeTypes[i][j]==mime)
									mimeType = i;

						if (mimeType==null) mimeType = undefined;

						if (typeof mimeType == 'undefined'){
							//bridgeAction({action: 'parseURLOtherWay', item: params.url});
							document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
								action: 'parseURLOtherWay',
								item: data.params.url
							}, '*');
						}
						else {
							if (mimeType=='html') mimeType=undefined;
							var jqxhr = $.get(data.params.url, function (html) {
								RainDropPanzer.run(function (item) {
									document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
										action: 'setHTML',
										item: item
									}, '*');
								}, {html: (mimeType ? '<p></p>' : html), url: data.params.url, type: mimeType});
							}, 'html')
								.fail(function () {
									document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
										action: 'parseURLOtherWay',
										item: data.params.url
									}, '*');
								});
						}
					},
					error: function() {
						document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'parseURLOtherWay', item: data.params.url},'*');
					}
				});
				break;

			case 'raindrop-getURL':
				document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setURL', url: document.URL, params: data.params},'*');
				break;

			case 'raindrop-getScreenshot':
				var bodyWidthClass = RainDropPanzer.divId+'-body-width', bodyWidth = $('html').hasClass(bodyWidthClass);
				if (bodyWidth) $('html').removeClass(bodyWidthClass);

				$('#'+RainDropPanzer.divId).addClass('iri-hidden');
				setTimeout( function() {
					chrome.runtime.sendMessage({action: "getScreenshot"}, function(response) {
						document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setScreenshot', dataURI: response},'*');
						$('#'+RainDropPanzer.divId).removeClass('iri-hidden');
						if (bodyWidth) $('html').addClass(bodyWidthClass);
					});
				},200);
				break;

			case 'raindrop-openTab':
				chrome.runtime.sendMessage({action: "openTab", url: data.params.url});
				break;

			case 'raindrop-setConfig':
				RainDropPanzer.config[data.params.name] = data.params.value;
				break;

			case 'raindrop-closePopup':
				RainDropPanzer.close();
				break;

			case 'raindrop-savePage':
				RainDropPanzer.saveTime(document.URL);
				break;
		}
		return true;
	}
}

//messages from background js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	return RainDropPanzer.Desktop.actionHandler(request, sender, sendResponse);
});

//messages from iframe
window.addEventListener("message", function (e) {
	RainDropPanzer.Desktop.actionHandler({params: e.data.params, action: e.data.action});
});


chrome.runtime.sendMessage({action: "desktopAppRun"});
