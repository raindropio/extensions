import browserAction from '../browserActions'
import notifications from '../notifications'
import bookmark from './bookmark'
import links from '../links'

var {extension, osName, openTab, openModal, isNewTabPage, updateTabAndGoToRaindrop} = require('../extension').default
var _ = {
	truncate: require('lodash/truncate')
}
var urlState = {}

const Saver = {
	onNotifyClick(id) {
		var data = notifications.getID(id);
		if (data.type!="done")
			return;

		var state="";
		if (typeof urlState[data.id] != "undefined")
			state = urlState[data.id];

		switch (state.step) {
			case "success":
			case "remove":
				openModal(
					"?modal=1#/edit/"+state.id+"?already=1",
					//"?saveurl="+encodeURIComponent(data.id)+"&modal=1",
					osName == "windows" ? "bottom-right" : "top-right"
				)
			break;

			case "auth":
				openTab("https://raindrop.io")
			break;

			case "error":
				this.save(data.id);
			break;
		}

		notifications.close(id)
	},

	notifyProgress(url="") {
		urlState[url] = {step: "progress"};

		notifications.show({
			title: extension.i18n.getMessage("save")+" "+extension.i18n.getMessage("toRaindrop"),
			message: extension.i18n.getMessage("loading")+" "+_.truncate(url.replace('https://','').replace('http://',''), {length: 25}),
			priority: 0
		}, url, "save")
	},

	notifySuccess(item) {
		urlState[item.link] = {step: "success", id: item._id};

		var n = {
			priority: 2,
			...(__PLATFORM__!="firefox" ? {requireInteraction: true} : {}),
			title: extension.i18n.getMessage((item.type||"link")+"Saved"),
			message: item.title+"\n"+extension.i18n.getMessage("clickToEdit")
		}

		if (item.already)
			n.title = extension.i18n.getMessage("alreadyInCollection")

		if (item.coverDataURI)
			n.iconUrl = item.coverDataURI

		notifications.close(notifications.hashId(item.link, 'save'), function() {
			notifications.show(n, item.link, "done")
		})

		links.resetAll()
		browserAction.render()
	},

	notifyRemoved(item) {
		urlState[item.link] = {step: "remove", id: item._id};

		var n = {
			priority: 2,
			...(__PLATFORM__!="firefox" ? {requireInteraction: true} : {}),
			title: extension.i18n.getMessage((item.type||"link")+"RemovedPermament"),
			message: item.title,
			buttons: [{title: extension.i18n.getMessage("restore")}]
		}

		if (item.coverDataURI)
			n.iconUrl = item.coverDataURI

		notifications.close(notifications.hashId(item.link, 'save'), function() {
			notifications.show(n, item.link, "done")
		})

		links.resetAll()
		browserAction.render()
	},

	notifyError(url, e) {
		if (e=="auth"){
			if (window.confirm(extension.i18n.getMessage("pleaseLogin")))
				openTab("https://raindrop.io/app/#/account/login")

			urlState[url] = {step: "auth"}
		}else {
			var message = e.toString()
			if (message == "cant_insert_bookmark")
				message = extension.i18n.getMessage("supportOnlyUrls")

			if (window.confirm(`${extension.i18n.getMessage("saveError")}\n${message}`))
				this.save(url)

			urlState[url] = {step: "error"}
		}
	},

	save(url) {
		if (isNewTabPage(url))
			return updateTabAndGoToRaindrop();

		this.notifyProgress(url)

		return bookmark.check(url)
			.then((alreadySaved)=>{
				//already saved
				if (alreadySaved)
					return alreadySaved;

				//save
				return bookmark.parse(url)
					.then((parsedItem)=>{
						return bookmark.getLastCollectionId()
							.then((cId)=>{
								return bookmark.insert(parsedItem, cId);
							})
					})
			})
			//choose direction
			.then((item)=>{
				item.url = url;
				item.link = url;
				var cId = 0;
				try{cId = item.collection.$id}catch(e){}

				if (cId==-99)
					this.notifyRemoved(item);
				else
					this.notifySuccess(item);
			})
			.catch((e)=>{
				this.notifyError(url, e);
			})
	}
}

if (extension)
	if (typeof extension.notifications != "undefined"){
		Saver.onNotifyClick = Saver.onNotifyClick.bind(Saver);

		extension.notifications.onClicked.removeListener(Saver.onNotifyClick);
		extension.notifications.onClicked.addListener(Saver.onNotifyClick);
	}

export default Saver