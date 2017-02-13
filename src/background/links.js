import Api from '../modules/api'

const
	defaultStatus = {saved:false},//,loading:false}
	divider = "</-rl-/>",
	maxLinkLength = 500

const Links = {
	items: {},

	cleanLink(link="") {
		return link
			.replace(/^\w*?:\/\//g, '')
			//.replace(/^www\./g,'')
			//.replace(/\#.+/g,'')
			.replace(/\/$/g,'')
			.trim()
			.toLowerCase()
			.substr(0,maxLinkLength);
	},

	getStatus(link) {
		link = this.cleanLink(link);

		var item;
		try{item = Links.items[link]}catch(e){}
		item = item||Object.assign({},defaultStatus);
		var status = "";

		/*if (item.loading)
			status = (item.saved?"saved":"")+"loading";
		else*/
			status = (item.saved ? "saved" : "idle");

		return status;
	},

	setStatus(_obj={}) {
		var obj = Object.assign({},_obj);

		if (!obj.url) return;
		obj.url = this.cleanLink(obj.url);
		Links.items[obj.url] = Links.items[obj.url]||Object.assign({},defaultStatus);

		if (typeof obj.saved != "undefined")
			Links.items[obj.url].saved = obj.saved;

		/*if (typeof obj.loading != "undefined")
			Links.items[obj.url].loading = obj.loading;*/
	},

	resetAll() {
		Api.getText('links', (text)=>{
			if (!text) return;
			this.items = {}

			text.split("\n").forEach((line)=>{
				var parsed = line.split(divider);
				var id = parsed[0],
					link = this.cleanLink(decodeURIComponent(parsed[1]||""));
				
				if (link)
					this.items[link]=Object.assign({}, defaultStatus, {saved:true});
			})
		})
	}
}

Links.resetAll()

export default Links;