var parser = {
	timeout: 9000,
	timer: null,
	done: false,
	parseTrys: 0,

	desktopParser: false,

	mimeTypes: {
    	'image':['image/jpeg','image/png','image/gif'],
    	'html':['text/html'/*,'text/plain'*/,'application/xhtml+xml']
    },

    callback: function(item) {
		//angular.element(document.querySelector('#wrap')).scope().saveLink(item);
		window.parent.postMessage({action: 'save-link', item: item},'*');
    },

	load: function(url) {
		$('head base').attr('href', url);

		this.done = false;
		this.parseTrys = 0;
		/*clearTimeout(this.timer);
		this.timer = setTimeout(function() {
			if (parser.done==false)
				parser.callback(parser.bookmarkBlank(url));
		}, this.timeout*3);*/
		$.ajaxSetup({timeout:this.timeout});

		var parserURL = (this.desktopParser ? "http://127.0.0.1:1505/parse?url=" : "https://raindrop.io/api/parse?url=");
		var parserHTTP = $.get(parserURL+encodeURIComponent(url), function (json) {
			if (json.result){
				json.item.link = json.item.url = url;
				json.item.result = true;
				parser.done=true;
				parser.callback(json.item);
			}
			else
				parser.otherWay(url);
		}, 'json')
		.fail(function () {
			parser.otherWay(url);
		});

		/*
		var desktopParser = $.get("http://127.0.0.1:1505/parse?url="+encodeURIComponent(url), function (json) {
			if (json.result){
				json.item.link = json.item.url = url;
				json.item.result = true;
				parser.done=true;
				parser.callback(json.item);
			}
			else
				parser.otherWay(url);
		}, 'json')
			.fail(function () {
				$.get('http://rca.yandex.com/?key=rca.1.1.20141107T112711Z.018fef3b04b9d063.0ad9f639cbff9de452b835a6e2c94b12743fe3b0&url='+encodeURIComponent(url), function(json){
					var mime = (json.mime||"").toLowerCase(),
						mimeType = null;

					if(mime!=''){
						mime=mime.split(';'); mime=mime[0];
					}

					for (var i in parser.mimeTypes)
						for (var j in parser.mimeTypes[i])
							if (parser.mimeTypes[i][j]==mime)
								mimeType = i;

					if (mimeType==null) mimeType = undefined;

					if (mimeType != undefined){
						var jqxhr = $.get(url, function(html){
							RainDropPanzer.run(function(item) {
								item.link = item.url;
								parser.done=true;
								parser.callback(item);

							}, {html: (mimeType=="image"? '<p></p>' : html), url: url, type: (mimeType=="image"?"image":undefined) });
						},'html')
							.fail(function(){
								parser.otherWay(url);
							});
					}
					else
						parser.otherWay(url);
				},'json')
					.fail(function(){
						parser.otherWay(url);
					});
			});*/
	},

	makeTitle: function(url) {
		var result = "";

		try{
			var uriObj = URI(url);
			uriObj.suffix("");
			var pathArr = uriObj.path().split('/');
			for(var i = pathArr.length-1; i > 0; i--)
				if (pathArr[i].trim()!=""){
					pathArr = pathArr[i];
					break;
				}
			result = S(pathArr || uriObj.hostname()).replaceAll('/', ' ').humanize().capitalize().trim().truncate(100).s;
		}catch(e) {}

		if (S(result).isEmpty())
			result = "Untitled";

		return result;
	},

	bookmarkBlank: function(url) {
		return {
			link: url,
			title: ''/*parser.makeTitle(url)*/,
			excerpt: "",
			type: "link",
			result: true,
			media: [],
			html: "",
			domain: RainDropPanzer.getDomain(url)
		};
	},

	otherWay: function(url) {
		parser.parseTrys++;
		$.get("https://raindrop.io/api/parse?url="+encodeURIComponent(url), function(json) {
			if (typeof json == 'string')
				json = $.parseJSON(json);
			
			if (json.result){
				parser.done=true;
				json.item.url = url;
				json.item.link = url;
				json.item.coverEnabled = json.item.media.length>0;
				parser.callback(json.item);
			}
			else {
				if (parser.parseTrys>1){
					parser.done=true;
					parser.callback(parser.bookmarkBlank(url));
				}
				else
					parser.otherWay(url);
			}
		})
		.fail(function(){
			if (parser.parseTrys>1){
				parser.done=true;
				parser.callback(parser.bookmarkBlank(url));
			}
			else
				parser.otherWay(url);
		});
	}
}

$(function(){
	$.get("http://127.0.0.1:1505/", function (json) {
		json = json || {result:false};
		json.result = json.result || false;

		parser.desktopParser = json.result;
	}, 'json')
		.fail(function () {});
});