import notifications from '../notifications'
import bookmark from './bookmark'
import helpers from './helpers'
import extensionConfig from '../config'

var {extension, osName, openTab, openModal, isNewTabPage, updateTabAndGoToRaindrop} = require('../extension').default
var _ = {
	truncate: require('lodash/truncate')
}
var urlState = {}

const Saver = {
	onNotifyClick(id) {
		var data = notifications.getID(id);
		if (data.type!="save")
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

		notifications.close(id);
	},

	onNotifyButtonClicked(id,buttonIndex) {
		var data = notifications.getID(id);
		if (data.type!="save")
			return;

		var state="";
		if (typeof urlState[data.id] != "undefined")
			state = urlState[data.id];

		switch (state.step) {
			case "success":
				switch (buttonIndex) {
					case 0:
						//edit
						openModal(
							"?modal=1#/edit/"+state.id+"?already=1",
							//"?saveurl="+encodeURIComponent(data.id)+"&modal=1",
							osName == "windows" ? "bottom-right" : "top-right"
						)
					break;

					case 1:
						//remove
						bookmark.check(data.id)
							.then((item)=>{
								if (item)
									return bookmark.remove(item._id)
										.then(()=>{
											this.notifyRemoved(item);
										})
							})
					break;
				}
			break;

			case "remove":
				bookmark.restore(state.id)
					.then(this.notifySuccess)
			break;

			case "auth":
				switch (buttonIndex) {
					case 0:
						//login
						openTab("https://raindrop.io/app/#/account/login")
					break;

					case 1:
						//signup
						openTab("https://raindrop.io/app/#/account/signup")
					break;
				}
			break;

			case "error":
				this.save(data.id);
			break;
		}

		notifications.close(id);
	},

	notifyProgress(url="", progress=10) {
		if ((__PLATFORM__!="chrome")&&(progress>10))
			return;

		urlState[url] = {step: "progress"};

		notifications.show({
			type: "progress",
			title: extension.i18n.getMessage("save")+" "+extension.i18n.getMessage("toRaindrop"),
			message: extension.i18n.getMessage("loading")+" "+_.truncate(url.replace('https://','').replace('http://',''), {length: 25}),
			//iconUrl: 'assets/savedloading_'+extensionConfig.notificationIconSize+'.png',
			progress: progress,
			priority: 0
		}, url, "save")
	},

	notifySuccess(item) {
		urlState[item.link] = {step: "success", id: item._id};

		var n = {
			type: 'image',
			priority: 2,
			requireInteraction: true,
			title: extension.i18n.getMessage((item.type||"link")+"Saved"),
			message: item.title+"\n"+extension.i18n.getMessage("clickToEdit")
			//iconUrl: 'assets/saved_'+extensionConfig.notificationIconSize+'.png',
			/*buttons: [
				{title: extension.i18n.getMessage("edit"), iconUrl: item.collectionDataURI},
				{title: extension.i18n.getMessage("remove")}
			]*/
		}

		if (item.already)
			n.title = extension.i18n.getMessage("alreadyInCollection")

		if (item.coverDataURI)
			n.iconUrl = item.coverDataURI

		notifications.show(n, item.link, "save")
	},

	notifyRemoved(item) {
		urlState[item.link] = {step: "remove", id: item._id};

		var n = {
			priority: 2,
			requireInteraction: true,
			title: extension.i18n.getMessage((item.type||"link")+"RemovedPermament"),
			message: item.title,
			//iconUrl: 'assets/saved_'+extensionConfig.notificationIconSize+'.png',
			buttons: [{title: extension.i18n.getMessage("restore")}]
		}

		if (item.coverDataURI)
			n.iconUrl = item.coverDataURI

		notifications.show(n, item.link, "save")
	},

	notifyError(url, e) {
		var n = {
			priority: 2,
			requireInteraction: true,
			title: extension.i18n.getMessage("saveError"),
			//iconUrl: 'assets/error_'+extensionConfig.notificationIconSize+'.png',
			message: ""
		}

		if (e=="auth"){
			urlState[url] = {step: "auth"};
			n.title = extension.i18n.getMessage("pleaseLogin");
			n.buttons = [
				{title: extension.i18n.getMessage("signIn")},
				{title: extension.i18n.getMessage("signUp")}
			]
		}else {
			urlState[url] = {step: "error"};
			n.message = e.toString();
			if (n.message == "cant_insert_bookmark")
				n.message = extension.i18n.getMessage("supportOnlyUrls")

			n.buttons = [
				{title: extension.i18n.getMessage("tryAgain")}
			]
		}

		notifications.show(n, url, "save")
	},

	save(url) {
		if (isNewTabPage(url))
			return updateTabAndGoToRaindrop();

		this.notifyProgress(url)

		return bookmark.check(url)
			.then((alreadySaved)=>{
				this.notifyProgress(url,40);

				//already saved
				if (alreadySaved)
					return alreadySaved;

				//save
				return bookmark.parse(url)
					.then((parsedItem)=>{
						this.notifyProgress(url,70);

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
		Saver.onNotifyButtonClicked = Saver.onNotifyButtonClicked.bind(Saver);

		extension.notifications.onClicked.removeListener(Saver.onNotifyClick);
		extension.notifications.onClicked.addListener(Saver.onNotifyClick);

		extension.notifications.onButtonClicked.removeListener(Saver.onNotifyButtonClicked);
		extension.notifications.onButtonClicked.addListener(Saver.onNotifyButtonClicked);
	}

export default Saver