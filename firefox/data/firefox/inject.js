RainDropPanzer.close = function() {
	self.port.emit("close", true);
	this.end();
}

RainDropPanzer._firefoxArguments = {};
RainDropPanzer._getArguments = function() {
	return RainDropPanzer._firefoxArguments;
}

self.port.on("Arguments", function(args) {
	RainDropPanzer._firefoxArguments = args;
	RainDropPanzer.desktopAppRun = args.desktopAppRun;
});

self.port.on("showPopup", function(args) {
	self.port.emit("iamLive", RainDropPanzer.showTime(args));
});

self.port.on("savePopup", function(args) {
	RainDropPanzer.saveTime(args);
});

self.port.on("setScreenshot", function(dataURI) {
	document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setScreenshot', dataURI: dataURI},'*');
	$('#'+RainDropPanzer.divId).removeClass('iri-hidden');
});

self.port.on("closePopup", function() {
	RainDropPanzer.close();
});

RainDropPanzer.Desktop = {
	saveCurrentPage: function() {
		self.port.emit("desktopSaveCurrentPage");
	}
}

//messages from iframe
window.addEventListener("message", function (e) {
	switch(e.data.action){
		case 'raindrop-getHTML':
		/*	RainDropPanzer.run(function(item) {
				document.getElementById(RainDropPanzer.divId+"-iframe").contentWindow.postMessage({action: 'setHTML', item: item},'*');
			}, e.data.params);
		break;*/

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
				self.port.emit("getScreenshot", true);
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