popupServices
.factory('Bookmark', ['Api', 'translateFilter', '$timeout', 'Boot', function(Api, translateFilter, $timeout, Boot){return {
	lastURL: '',

	saveCurrentPage: function() {
		//get current page URL
		if (environment.name == 'desktop')
			Boot.broadcast('Modal-Show', {src: 'add-url'});
		else
			bridge.getURL();
		return false;
	},

	parseURLOtherWay: function(url, collectionId, callback) {
		var _this = this;
		this.parseURL(url, function(json){
			if (json.result){
				json.item = _this.formDefaults(json.item, collectionId);
				_this.saveItem(json.item, callback, 'drop');
			}
			else
				callback(json, 'drop');
		});
	},

	saveURLPage: function(url, collectionId, callback) {
		var _this = this;

		this.checkURL(url, function(check){
			if (check.result)
				callback(check, 'drop');
			else{
				bridge.parseURL({url: url});
			}
		},true);
		return false;
	},


	checkURL: function(url, callback, disableParse) {
		this.lastURL = url;
		Api.create('check/url', {url: url}, function(check) {
			if (check.result){
				callback({item: {_id: check.id}, result:true, have: true, disableParse: disableParse});
			}
			else{
				if (typeof disableParse == 'undefined')
					bridge.parsePage({url: url});
				callback({result:false, noError:true, disableParse: disableParse});
			}
			return false;
		});
	},

	setFormData: function(item, collectionId, callback){
		item.link = this.lastURL;
		item = this.formDefaults(item, collectionId);
		this.saveItem(item, callback, (item.drop?'drop':'') );
		return false;
	},




	/* helpers */
	formDefaults: function(item, collectionId) {
		if (typeof item!='undefined'){
			item.collection = item.collection || {};
			item={
				url: item.link,
				title: item.title || translateFilter('untitled'),
				excerpt: item.excerpt,
				collection: item.collection,
				collectionId: item.collection.$id || collectionId,
				html: item.html,
				media: item.media,
				id: item['_id'],
				type: item.type,
				cover: (item.coverId!=undefined?item.coverId:0),
				coverEnabled: (item.cover!=''),
				tags: item.tags || [],
				haveScreenshot: false,
				drop: item.drop || false
			};
		}

		if (item.cover==undefined)
			item.cover = 0;

		if ((item.media=='')||(item.media==undefined)) item.media=[];
		for(var i in item.media)
			if (item.media[i].screenshot!=undefined)
				item.haveScreenshot=true;

		if (item.haveScreenshot==false)
			item.media.push({link:''});

		return item;
	},

	saveItem: function(item, callback, way) {
		var afterSave = function(json){
			if (json.result)
				Api.create('prepareCover', {id:json.item.id}, function() {} );
			callback(json, way);
		}

		if (item.id)//update
			Api.update('raindrop/'+item.id, item, afterSave);
		else //new
			Api.create('raindrop', item, afterSave);

		return false;
	},

	parseURL: function(url, callback) {
		var prepare = function(json){
			if (json.result){
				json.item.url = url;
				json.item.link = url;
			}
			callback(json);
		};

		Api.get('parse?url='+encodeURIComponent(url), function(json) {
			if (json.result)
				prepare(json);
			else
				$timeout(function(){
					Api.get('parse?url='+encodeURIComponent(url), prepare);
				},300);
		});
	},



	/* editing */
	loadItem: function(id, callback) {
		var _this = this;
		Api.get('raindrop/'+id, function(json) {
			if (json.result)
				json.item = _this.formDefaults(json.item);
			callback(json);
		});
	}
}}])






.factory('SocialFactory', ['Api', function(Api){return {
	loginWindow: function(social) {
		var links = {
			facebook: {url: 'https://raindrop.io/auth/facebook?redirect=other/modal-login.html', width: 600, height: 400},
			twitter: {url: 'https://raindrop.io/auth/twitter?redirect=other/modal-login.html', width: 600, height: 400},
			google: {url: 'https://raindrop.io/auth/google?redirect=other/modal-login.html', width: 600, height: 600},
			vkontakte: {url: 'https://raindrop.io/auth/vkontakte?redirect=other/modal-login.html', width: 600, height: 400},
			signin: {url: 'https://raindrop.io/account?extension', width: 600, height: 500},
			signup: {url: 'https://raindrop.io/account/signup?extension', width: 600, height: 600}
		}


		var width=links[social].width; height=links[social].height;
		var left = Math.round(screen.width / 2 - width / 2);
		var top = 0;
		if (screen.height > height) {
			top = Math.round(screen.height / 3 - height / 2);
		}

		if (environment.name == 'desktop'){
			var win = new BrowserWindow({
				width: width,
				height: height,
				center: true,
				"use-content-size": true,
				"always-on-top": true,
				"skip-taskbar": true,
				show: true
			});
			win.loadUrl(links[social].url);
			win.on('closed', function() {
				console.log('stop');
				win = null;
				window.location.hash = '#/';
				window.location.reload();
			});
		}
		else if (typeof environment.safariLinks != 'undefined') {
			var win = safari.application.activeBrowserWindow.openTab();
			win.url = links[social].url;
			win.addEventListener("close", function(){
				window.location.hash = '#/';
				window.location.reload();
			}, false);

			safari.self.hide();
		}
		else {
			var win = window.open(links[social].url, "login-oblako", 'left=' + left + ',top=' + top + ',' + "width=" + width + ",height=" + height + ",personalbar=0,toolbar=0,scrollbars=1,resizable=1");
			win.focus();

			var timer = setInterval(function () {
				if (win.closed) {
					clearInterval(timer);
					window.location.hash = '#/';
					window.location.reload();
				}
			}, 500);
		}
	},

	share: function(params) {
		var links = {
			twitter: {
				url: 'https://twitter.com/intent/tweet?url={url}&text={title}&via=raindrop_io',
				width: 600,
				height: 450
			},
			facebook: {
				url: 'https://www.facebook.com/sharer/sharer.php?u={url}',
				width: 600,
				height: 500
			},
			vk: {
				url: 'https://vk.com/share.php?url={url}&title={title}',
				width: 550,
				height: 330
			},
			google: {
				url: 'https://plus.google.com/share?url={url}',
				width: 700,
				height: 500
			}
		};

		links[params.social].url = links[params.social].url.replace('{url}', encodeURIComponent(params.url)).replace('{title}', params.title);

		var left = Math.round(screen.width / 2 - links[params.social].width / 2);
		var top = 0;
		if (screen.height > links[params.social].height) {
			top = Math.round(screen.height / 3 - links[params.social].height / 2);
		}

		if (environment.name=='desktop'){
			Shell.openExternal(links[params.social].url);
		}
		else if (typeof environment.safariLinks != 'undefined') {
			safari.application.activeBrowserWindow.openTab().url = links[params.social].url;
			safari.self.hide();
		}
		else {
			var win = window.open(links[params.social].url, "share-oblako", 'left=' + left + ',top=' + top + ',' + "width=" + links[params.social].width + ",height=" + links[params.social].height + ",personalbar=0,toolbar=0,scrollbars=1,resizable=1");
			win.focus();
		}
	}
}}]);