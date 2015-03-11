if (window.top === window) {
	RainDropPanzer.browser = "safari";

	RainDropPanzer._getArguments = function() {
		return {
			css: safari.extension.baseURI + "css/inject.css",
			iframe: safari.extension.baseURI + "popup/popup.html"
		};
	}

	RainDropPanzer.Desktop = {
		saveCurrentPage: function() {
			safari.self.tab.dispatchMessage("desktopSaveCurrentPage", true);
		}
	}

	safari.self.addEventListener("message", function(e){
		switch(e.name) {
			case 'setURL':
				document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setURL', url: e.message.url, params: e.message.params},'*');
				break;

			case 'showPopup':
				/*safari.self.tab.dispatchMessage("refreshOblako", 'please');
				RainDropPanzer.run(function(item) {
					safari.self.tab.dispatchMessage("sendRequest", item);
				});*/

				RainDropPanzer.showTime(RainDropPanzer._getArguments());
			break;

			case 'savePopup':
				RainDropPanzer.saveTime((e.message||""));
			break;

			case 'setScreenshot':
				document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setScreenshot', dataURI: e.message},'*');
				$('#'+RainDropPanzer.divId).removeClass('iri-hidden');
			break;

			case 'desktopAppRun':
				RainDropPanzer.desktopAppRun = e.message;
			break;

			case 'parsePage':
				RainDropPanzer.run(function(item){
					safari.self.tab.dispatchMessage("addToCache", item);
				});
			break;
		}
	}, false);

	RainDropPanzer.close = function() {
		this.end();
	}

	//messages from iframe
	window.addEventListener("message", function (e) {
		switch(e.data.action){
			case 'raindrop-getHTML':
				RainDropPanzer.run(function(item) {
					document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setHTML', item: item},'*');
				}, e.data.params);
			break;

			case 'raindrop-parseURL':
				var mimeTypes = {
			    	'image':['image/jpeg','image/png','image/gif'],
			    	'html':['text/html',/*'text/plain',*/'application/xhtml+xml']
			    };
			    
				$.ajax({
					type: "HEAD",
					async: true,
					url: e.data.params.url,
					success: function(message,text,response){
						var mime = response.getResponseHeader('Content-Type').toLowerCase(),
							mimeType = null;
						for (var i in mimeTypes)
							for (var j in mimeTypes[i])
								if (mimeTypes[i][j]==mime)
									mimeType = i;

						if (mimeType==null) mimeType = undefined;

						if (typeof mimeType == 'undefined'){
							//bridgeAction({action: 'parseURLOtherWay', item: params.url});
							document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
								action: 'parseURLOtherWay',
								item: e.data.params.url
							}, '*');
						}
						else {
							if (mimeType=='html') mimeType=undefined;
							var jqxhr = $.get(e.data.params.url, function (html) {
								RainDropPanzer.run(function (item) {
									document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
										action: 'setHTML',
										item: item
									}, '*');
								}, {html: (mimeType ? '<p></p>' : html), url: e.data.params.url, type: mimeType});
							}, 'html')
								.fail(function () {
									document.getElementById(RainDropPanzer.divId + "-iframe").contentWindow.postMessage({
										action: 'parseURLOtherWay',
										item: e.data.params.url
									}, '*');
								});
						}
					},
					error: function() {
						document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'parseURLOtherWay', item: e.data.params.url},'*');
					}
				});
			break;

			case 'raindrop-getURL':
				document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setURL', url: document.URL, params: e.data.params},'*');
			break;

			case 'raindrop-getScreenshot':
				$('#'+RainDropPanzer.divId).addClass('iri-hidden');
				
				setTimeout( function() {
					safari.self.tab.dispatchMessage("makeScreenshot",true);
				},200);
			break;

            case 'raindrop-setConfig':
                RainDropPanzer.config[e.data.params.name] = e.data.params.value;
            break;

			case 'raindrop-closePopup':
				RainDropPanzer.close();
			break;

			case 'raindrop-savePage':
				RainDropPanzer.saveTime(document.URL);
				break;
		}
	});
}

//safari.self.tab.dispatchMessage("desktopAppRun", true);