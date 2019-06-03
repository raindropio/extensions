import config from '../modules/config'
import search from './search'
var {extension} = require('./extension').default

var _ = {
	escape: require('lodash/escape')
}

const Omnibox = {
	onSubmit(text) {
		text = (text||"").trim();

		var url = config.host;

		if (/.*\:\/\//g.test(text)){
			url = text;
		}else{
			if (text)
				url += "/app/#/collection/0/"+encodeURIComponent(JSON.stringify(search.getQuery(text)));
		}

		extension.tabs.update(null, {url: url})
	},

	onChange(text, send) {
		if (localStorage.getItem('omnibox-disabled')){
			extension.omnibox.setDefaultSuggestion({
				description: ""
			})
			send([])
			return;
		}
		text = (text||"").trim();

		extension.omnibox.setDefaultSuggestion({
			description: (
				text ? (
					__PLATFORM__!='firefox' ? "<match>"+_.escape(text)+"</match>" : 'Raindrop.io: ' + text
				)
				: extension.i18n.getMessage("findBookmark")
			)
		})

		if (!text) return;

		search.getResults(text)
			.then((results)=>{
				var items = [];
				if (results.length){
					var sRegex = search.getRegex(text);

					results.forEach((item)=>{
						if (!item.title) return;
						var matched = search.highlight(_.escape(item.title+(item.description?". "+item.description:"")), sRegex);
						items.push({
							content: item.link,
							description: ( (item.hideLink || __PLATFORM__=='firefox') ? "" : "<url>"+search.highlight(_.escape(item.link), sRegex)+"</url> ")+matched
						})
					})
				}

				send(items);
			})
	},

	onStart() {
		search.clearCache();
	}
}

if (extension)
if (typeof extension.omnibox != "undefined"){
	Omnibox.onSubmit = Omnibox.onSubmit.bind(Omnibox);
	Omnibox.onChange = Omnibox.onChange.bind(Omnibox);
	Omnibox.onStart = Omnibox.onStart.bind(Omnibox);

	extension.omnibox.onInputEntered.removeListener(Omnibox.onSubmit);
	extension.omnibox.onInputEntered.addListener(Omnibox.onSubmit);

	extension.omnibox.onInputChanged.removeListener(Omnibox.onChange);
	extension.omnibox.onInputChanged.addListener(Omnibox.onChange);

	extension.omnibox.onInputStarted.removeListener(Omnibox.onStart);
	extension.omnibox.onInputStarted.addListener(Omnibox.onStart);
}

export default Omnibox