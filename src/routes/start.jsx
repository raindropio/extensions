import React from 'react'
import Loading from '../co/loading'

import initAuth from '../helpers/initAuth'
import bookmarkStore from '../stores/bookmark'
import network from 'network'
import extensionHelpers from '../helpers/extension'

export default class Start extends React.Component {
	constructor(props) {
		super(props);

		this.isUserLoaded = false;
		this.isBookmarkLoaded = false;
		this.userError = false;
		this.bookmarkError = false;
		this.bookmarkId = 0;

		this.state = {}
	}

	onFail() {
		if ((!this.isUserLoaded)||(!this.isBookmarkLoaded))
			return;

		if (this.failComplete)
			return;
		this.failComplete=true;

		var e = this.userError || this.bookmarkError;
		var errType = e;
		try{errType = e.split(':')[1].trim();}catch(e){}
		console.log(errType)

		switch(errType){
			case "login_error":
				window.location.hash = '#/error/login'
			break;

			case "login_needLogin":
				window.location.hash = '#/welcome'
			break;

			case "cant_insert_bookmark":
			case "cant_get_url":
				window.location.hash = '#/error/savebookmark'
			break;

			case "forbidden_url":
				window.location.hash = "#/forbidden";
			break;

			case "is_raindrop_url":
				window.location.hash = "#/forbidden?raindrop=1";
			break;

			case "newtab_url":
				extensionHelpers.openTab(network.fixURL('/app'))
			break;

			default:
				window.location.hash = '#/error/default?e='+encodeURIComponent(e)
			break;
		}
	}

	onSuccess() {
		if ((!this.isUserLoaded)||(!this.isBookmarkLoaded))
			return;

		if ((this.userError)||(this.bookmarkError))
			return this.onFail();

		if (this.successComplete)
			return;
		this.successComplete=true;

		if (this.bookmarkId)
			window.location.hash = '#/edit/'+this.bookmarkId+ '?' + [
				`default_field=${this.state.default_field}`,
				this.bookmarkAlready ? "already=1" : ''
			].join('&')
		else
			window.location.hash = '#/error/default?e='+encodeURIComponent("can't init app")
	}

	login() {
		new Promise((res,rej)=>{
				initAuth.checkStatus((result)=>{
					switch(result){
						case "done":
							res(true)
						break;

						default:
							rej("login_"+result)
						break;
					}
				})
			})
			.then((res)=>{
				this.isUserLoaded=true;
				this.onSuccess();
			})
			.catch((e)=>{
				this.userError = e.toString();
				this.isUserLoaded=true;

				this.onFail();
			})
	}

	bookmark() {
		bookmarkStore.onLoadURL(network.getSearchParam('saveurl'))
			.then((b)=>{
				this.bookmarkId = b._id;
				this.bookmarkAlready = b.already;
				this.isBookmarkLoaded = true;
				
				this.onSuccess();
			})
			.catch((e)=>{
				this.bookmarkError = e.toString();
				this.isBookmarkLoaded=true;

				this.onFail();
			})
	}

	componentWillMount() {
		var isModal = (network.getSearchParam('modal') ? true : false);
		var initApp = ()=>{
			this.login()
			this.bookmark()
		}

		if ((__APPBUILD__)||(!isModal)) {
			extensionHelpers.getSetting("typeSelected")
				.then((alreadySelected)=>{
					console.log(alreadySelected)
					if (!alreadySelected)
						return window.location.hash = '#/type';

					initApp();
				})
		}
		else
			initApp();
	}

	componentDidMount() {
		extensionHelpers.getSetting("default_field")
			.then(default_field=>
				this.setState({ default_field })
			)
	}

	render() {
		return <Loading />;
	}
}