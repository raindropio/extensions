import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRedirect, RoutingContext, match } from 'react-router'
import extensionHelper from '../helpers/extension'

import Base from './base'
import Start from './start'
import Forbidden from './forbidden'
import Welcome from './welcome'
import ErrorRoute from './error'
import Edit from './edit'
import Cover from './cover'
import CollectionPicker from './collectionPicker'
import Settings from './settings'
import Type from './type'

let root;

const App = (
	<Route path="/" component={Base}>
		<IndexRedirect to="/start" />

		<Route path="/start" component={Start} />
		<Route path="/forbidden" component={Forbidden} />
		<Route path="/welcome" component={Welcome}/>
		<Route path="/error/:id" component={ErrorRoute}/>
		<Route path="/edit/:id" component={Edit}/>
		<Route path="/cover/:id" component={Cover}/>
		<Route path="/collection/:id" component={CollectionPicker}/>
		<Route path="/settings" component={Settings}/>
		<Route path="/type" component={Type}/>
	</Route>
);

const MyRoutes = {
	isRendered: false,

	logPageView() {
		var userId = "";
		try{
			userId = UserStore.getUser()._id
		}catch(e){}

		if (userId)
			extensionHelper.pageView({
				page: window.location.pathname+window.location.hash,
				userId: userId
			})
	},

	tryToRender(e) {
		if (!MyRoutes.isRendered){
			var elem = document.getElementById('app');

			if (elem) {
				root = render(<Router history={hashHistory} onUpdate={MyRoutes.logPageView}>{App}</Router>, elem);
				MyRoutes.isRendered = true;
			}
		}
	}
}

export default () => {
	MyRoutes.tryToRender();
	window.addEventListener('load', MyRoutes.tryToRender);
	document.addEventListener("DOMContentLoaded", MyRoutes.tryToRender);
}