import Api from '../modules/api'
import config from '../modules/config'

var loaded = false,
	collections = [],
	tags = []

const Search = {
	textToObj(text) {
		var val = (text).trim(),
			type = "word";

		if (val.match(new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/)))
			type = "domain";

		if (val.indexOf('#')==0){
			type = "tag";
			val = val.substr(1,val.length);
		}

		return {key: type, val: val};
	},

	getRegex(find) {
		var searchRegex;

		var query = (find||"").split(" ");
		var words = [];

		for(var j in query)
			if (query[j].trim())
				words.push(query[j].trim());

		searchRegex = (words.length ? '('+words.join('|')+')' : "")
		return searchRegex;
	},

	highlight(text,searchRegex) {
		if (!searchRegex || __PLATFORM__=='firefox')
			return text;

		var r = new RegExp(searchRegex,'gi');
		try{text=text.replace(r, '<match>$1</match>')}catch(e){}
		return text;
	},

	getQuery(text) {
		var parts = (text||"").split(' ');
		if (!parts.length)
			return [];

		var q = parts.map(this.textToObj);

		var words = [];
		q = q.filter((item)=>{
			if (item.key=="word"){
				words.push(item.val);
				return false;
			}
			else
				return true;
		})
		q.push(this.textToObj(words.join(' ')))

		return q;
	},

	getResults(text) {
		text = (text||"".trim());
		if (text.length<=1)
			return new Promise((res)=>{res([])});

		return this.init()
			.then(()=>{
				var results = [];
				collections.forEach((item)=>{
					if (item.title.toLowerCase().indexOf(text.toLowerCase())!=-1)
						results.push({
							link: config.host+"/app#/collection/"+item._id,
							title: this.collectionPath(item),
							subhead: item.count,
							hideLink: true
						})
				})

				return results;
			})
			.then((results)=>{
				return new Promise((res)=>{
					Api.get('raindrops/0?perpage=5&search='+encodeURIComponent(JSON.stringify(this.getQuery(text))), (json)=>{
						if (!json.result)
							return res(results)

						if (json.items.length)
							json.items.forEach((item)=>{
								results.push({
									link: item.link,
									title: item.title,
									description: item.excerpt
								})
							})

						res(results)
					})
				})
			})
	},

	clearCache() {
		loaded = false;
	},

	init() {
		if (loaded) return new Promise((res)=>{res(true)});
		collections = [];

		var appendCollections = (json)=>{
			if (json.result)
				json.items.forEach((item)=>{
					var cover ="";
					try{cover = item.cover[0]}catch(e){}

					collections.push({
						_id: item._id,
						title: item.title,
						cover: cover,
						parent: item.parent||{}
					})
				})
		}

		var rootColl = new Promise((res)=>{
			Api.get('collections', (json)=>{
				appendCollections(json)
				res(true)
			})
		})
		var childColl = new Promise((res)=>{
			Api.get('childrens', (json)=>{
				appendCollections(json)
				res(true)
			})
		})

		return Promise.all([rootColl, childColl])
			.then(()=>{
				loaded = true;
			})
	},

	collectionPath(coll) {
		var parents = [], ids=[coll._id];

		var findParents = function (id) {
            collections.forEach(function (item) {
                if (id == item._id) {
                    if (item._id != coll._id)
                        parents.push(item.title);

                    if (item.parent){
	                    ids.push(item.parent.$id);
	                    findParents(item.parent.$id);
	                }
                }
            });
        }
        findParents(ids[0]);
        parents.reverse();
        parents = parents.join(' / ');

        return "📁 "+parents+(parents?" / ":"")+coll.title;
	}
}

export default Search