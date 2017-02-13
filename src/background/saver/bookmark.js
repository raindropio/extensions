import Api from '../../modules/api'
import helpers from './helpers'

var {extension} = require('../extension').default

const Bookmark = {
	check(url) {
		return new Promise((res,rej)=>{
				//Check already exists
				Api.post("check/url", {url: url}, (json)=>{
					if (json.auth === false)
						return rej('auth')

					if (!json.result)
						return res(false)

					//Load saved bookmark
					Api.get("raindrop/"+json.id, (json2)=>{
						if (json2.result){
							var item = json2.item||{};
							item.already = true;
							res(item)
						}
						else
							rej("cant_load_bookmark")
					})
				})
			})
			.then((item)=>{
				if (item)
					return Bookmark.prepareItem(item);
				else
					return item;
			})
	},

	parse(url) {
		return new Promise((res,rej)=>{
			Api.get("parse?url="+encodeURIComponent(url), (json)=>{
				if (json.auth === false)
					return rej('auth')

				var item = json.item||{};
				item.link = url;
				item.url = url;
				item.cover = 0;
				item.coverId = 0;
				res(item)
			})
		})
	},

	getCollection(tempCid, callback) {
		Api.get("collection/"+tempCid, (json)=>{
			if (json.result)
				callback(json.item);
			else
				callback({_id:-1});
		})
	},

	getLastCollectionId() {
		return new Promise((res,rej)=>{
			Api.get("user", (json)=>{
				if (json.auth === false)
					return rej('auth')

				var tempCid = 0;
				try{tempCid = parseInt(json.user.config.last_collection)}catch(e){}
				tempCid = tempCid||-1;

				return res(tempCid);
			})
		})
	},

	prepareItem(item) {
		return (Promise.all([
				//Cover
				new Promise((res,rej)=>{
					if (!item.cover) return res(true);

					helpers.thumb(item.cover, 160, 160)
						.then((dataURI)=>{
							item.coverDataURI = dataURI;
							res(true);
						})
						.catch((e)=>{
							if (e)console.log(e)
							res(true)
						})
				}),

				//Collection
				new Promise((res,rej)=>{
					var tempCid = 0;
					try{tempCid = parseInt(item.collection.$id)}catch(e){}

					Bookmark.getCollection(tempCid, (cItem)=>{
						var cover = "";
						try{cover = cItem.cover[0]}catch(e){}
						item.collectionTitle = cItem.title||extension.i18n.getMessage("unsorted");
						item.collectionDataURI = "";

						if (!cover) return res(true);

						helpers.thumb(cover, 32, 32)
							.then((dataURI)=>{
								item.collectionDataURI = dataURI;
								res(true);
							})
							.catch((e)=>{
								if (e)console.log(e)
								res(true)
							})
					})
				})
			]))
			.then(()=>{
				return item;
			})
	},

	insert(item, cId) {
		return (new Promise((res,rej)=>{
				item.collectionId = cId;
				if (item.collectionId == -99)
					item.collectionId = -1;

				//item.parser = "local";
				try{
					item.url = item.meta.canonical||item.url;
					item.link = item.url;
				}catch(e){}

				Api.post("raindrop", item, (json)=>{
					if (json.auth === false)
						return rej('auth')

					if (!json.result)
						return rej("cant_insert_bookmark")

					res(json.item||{})
				})
			}))
			.then(Bookmark.prepareItem)
	},

	restore(id) {
		return (new Promise((res,rej)=>{
				Api.put("raindrop/"+id, {collectionId:-1}, (json)=>{
					if (json.auth === false)
						return rej('auth')

					res(json.item)
				})
			}))
			.then(Bookmark.prepareItem)
	},

	remove(id) {
		return new Promise((res,rej)=>{
			Api.del("raindrop/"+id, (json)=>{
				if (json.auth === false)
					return rej('auth')

				res(true)
			})
		})
	}
}

export default Bookmark