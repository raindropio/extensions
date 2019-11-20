import {createStore} from 'reflux'
import actions from '../actions/bookmark'
import Api from 'api'

var _ = {
	uniq: require('lodash/uniq')
}

var {extension, sendMessage, getCurrentTab} = require('../background/extension').default

var _state = {
	status: "",
	item: {},
	suggestedTags: []
}

var _loadedTags = {}

export default createStore({
	listenables: actions,

	getItem() {
		return JSON.parse(JSON.stringify(_state.item));
	},

	getStatus() {
		return _state.status;
	},

	getSuggestedTags() {
		return _state.suggestedTags;
	},

	getCurrentURL(url) {
		return new Promise((res,rej)=>{
			if (url)
				return res({finalURL: url});
			
			getCurrentTab((tab)=>{
				if (!tab) return rej('forbidden_url');

				res({
					finalURL: tab.url,
					title: tab.title
				})
			})
		})
	},

	getBookmarkByURL(url) {
		return new Promise((res,rej)=>{
			//Check already exists
			Api.post("check/url", {url: url}, (json)=>{
				if (!json.result){
					if (json.auth===false)
						return rej("login_needLogin")

					return res(false)
				}

				//Load saved bookmark
				Api.get("raindrop/"+json.id, (json2)=>{
					if (json2.result)
						res(json2.item||{})
					else{
						if (json.auth===false)
							return rej("login_needLogin")

						rej("cant_load_bookmark")
					}
				})
			});
		})
	},

	localParse(url) {
		return new Promise((res,rej)=>{
			sendMessage({action:"parse", url}, res);
		})
	},

	serverParse(url) {
		return new Promise((res,rej)=>{
			Api.get("parse?url="+encodeURIComponent(url), (json)=>{
				if (json.auth===false)
					return rej("login_needLogin")
				
				res(Object.assign({}, json.item, {parser:"local"}))
			})
		})
	},

	insertBookmark(item, tryAgain=false) {
		return new Promise((res,rej)=>{
			item.collectionId = -1;

			if (!tryAgain){
				try{item.collectionId = UserStore.getUser().config.last_collection}catch(e){}
				if (item.collectionId == -99)
					item.collectionId = -1;
			}

			Api.post("raindrop", item, (json)=>{
				if (!json.result){
					if (!tryAgain)
						return res(this.insertBookmark(item, true));

					if (json.auth===false)
						return rej("login_needLogin")

					return rej("cant_insert_bookmark")
				}

				res(json.item||{})
			})
		})
	},

	appendSuggestedTags(tags=[], toBegining=false) {
		if (toBegining)
			_state.suggestedTags = tags.concat(_state.suggestedTags);
		else
			_state.suggestedTags = _state.suggestedTags.concat(tags);
		_state.suggestedTags = _.uniq(_state.suggestedTags).slice(0, 10);

		_loadedTags[_state.item._id] = (tags.length>0);
	},

	loadSuggestedTags() {
		return new Promise((res,rej)=>{
			if (typeof _loadedTags[_state.item._id] != "undefined")
				return res(true);

			if ((!_state.item.title)&&(!_state.item.excerpt))
				return res(true);

			if (!UserStore.isPro())
				return res(true);

			Api.post('keywords', {text: _state.item.title+". "+_state.item.excerpt, domain:_state.item.domain}, (json)=>{
				//if (typeof _loadedTags[_state.item._id] != "undefined")
					this.appendSuggestedTags(json.tags);

				this.trigger(_state);
				res(true);
			})
		})
	},

	onRemove() {
		_state.status = "loading";
		this.trigger(_state);

		Api.del("raindrop/"+_state.item._id, (json)=>{
			if (json.result){
				_state.item.collection.$id = -99;
			}

			_state.status = "done";
			this.trigger(_state);
		})
	},

	onRestore() {
		_state.status = "loading";
		this.trigger(_state);

		this.onUpdate({collectionId:-1}, ()=>{
			_state.status = "done";
			this.trigger(_state);
		}, {trigger:false})
	},

	onUpdate(obj, callback, params={}) {
		if (typeof params.trigger == "undefined")
			params.trigger = true;

		Api.put("raindrop/"+_state.item._id, obj, (json)=>{
			if (json.result){
				_state.item = json.item;
			}

			if (params.trigger)
				this.trigger(_state);

			if (callback)
				callback();
		})
	},

	onUploadCover: function({_id, file}, callback) {
		Api.upload(
		  "raindrop/"+_id+"/cover",
		  {name: "cover", file},
		  function(){},
		  (json)=>{
			if (json.result){
				_state.item = json.item;
			}

			this.trigger(_state);

			if (callback)
				callback();
		  }
		)
	},

	onLoadURL(preferedURL="") {
		var useLocalParser = preferedURL?false:true,
			finalURL = "",
			defaultTitle = "",
			already = false;

		_state.fixMeta = false;
		_state.status = "loading";
		_state.item = {};
		_state.suggestedTags = [];
		this.trigger(_state);

		return this.getCurrentURL(preferedURL)
			.then((result)=>{
				finalURL = result.finalURL;
				defaultTitle = result.title||"";

				if (/http(s|)\:\/\/raindrop\.io/i.test(finalURL||""))
					throw new Error('is_raindrop_url')
				if (/^\w+\:\/\//i.test(finalURL||"")==false)
					throw new Error('forbidden_url');

				return this.getBookmarkByURL(finalURL)
			})
			.then((alreadySavedBookmark)=>{
				//already saved
				if (alreadySavedBookmark)
					return alreadySavedBookmark;
				//use local parser
				else if (useLocalParser){
					_state.fixMeta = true;
					return this.localParse(finalURL);
				}

				return false;
			})
			.then((bookmark)=>{
				if (bookmark)
					return bookmark;

				//use server parser
				return this.serverParse(finalURL)
			})
			.then((bookmark)=>{
				bookmark = bookmark||{};

				//ALREADY exists
					if (bookmark._id) {
						already = true;
						return bookmark;
					}

				//SAVE bookmark
					//need to reparse
					//bookmark.parser = "local";

					bookmark.media = bookmark.media||[];
					bookmark.cover = 0;
					bookmark.title = bookmark.title||defaultTitle;
					bookmark.link = finalURL;
					bookmark.url = finalURL;
					
					return this.insertBookmark(bookmark);
			})
			.then((bookmark)=>{
				bookmark = bookmark||{};

				if (!bookmark._id)
					throw new Error('cant_prepare_bookmark');

				_state.item = bookmark;
				_state.status = "done";

				this.loadSuggestedTags()
			})
			.then(()=>{
				this.trigger(_state);

				this.loadLinkMeta();

				return {
					_id: _state.item._id,
					already: already
				};
			})
	},

	onLoadId(id, callback) {
		if ((_state.item||{})._id == id)
			return;

		_state.item = {};
		_state.status = "loading";
		this.trigger(_state);

		Api.get("raindrop/"+id, (json)=>{
			if (json.result){
				_state.item = json.item;
				_state.status = "done";

				if (typeof callback == "function")
					callback(item);
			}
			else{
				_state.status = "error";

				if (typeof callback == "function")
					callback(false);
			}

			this.loadSuggestedTags().then(()=>this.trigger(_state))
		})
	},

	/*onLoadEditById(id) {
		return new Promise((res, rej)=>{
			this.onLoadURL(id, (item)=>{
				if (!item) return rej("cant_load_bookmark");

				res({
					_id: id,
					already: true
				});
			})
		})
	},*/

	loadLinkMeta() {
		var updateBookmark = ((_state.fixMeta)&&(_state.item.type!="article"));

		Api.get("parse?url="+encodeURIComponent(_state.item.url||_state.item.link), (json)=>{
			if (!json.result) return;

			if (UserStore.isPro()){
				this.appendSuggestedTags(json.item.meta.tags, true);
				this.trigger(_state);
			}

			if (updateBookmark){
				var upd = {type: json.item.type, html: json.item.html||""}
				if ((_state.item.media||[]).length)
					upd.media = json.item.media||[];

				this.onUpdate(upd)
			}
		});
	}
})