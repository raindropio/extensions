require('../css/static/settings.styl')

import React from 'react'
import t from 't'
import Button from '../co/common/button'
import extensionHelper from '../helpers/extension'
import extensionConfig from '../background/config'
import config from '../modules/config'
import dialogStore from '../stores/dialog'

export default class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.setSetting = this.setSetting.bind(this);
		this.setKeyword = this.setKeyword.bind(this);
		this.requestPermission = this.requestPermission.bind(this);

		this.state = {
			"appbuild": false,
			"drag-disabled": false,
			"omnibox-disabled": false,
			"omnibox-keyword": extensionConfig.omnibox_keyword
		}
	}

	componentDidMount() {
		extensionHelper.permissions.enabled('tabs')
			.then(isEnabled=>{
				this.setState({"tabs": isEnabled?true:false})
			})

		extensionHelper.permissions.ignored('tabs')
			.then(isIgnored=>{
				this.setState({"ignoreTabs": isIgnored?true:false})

				return extensionHelper.permissions.ignore('tabs')
			})
		
		extensionHelper.getSetting("appbuild")
			.then((isEnabled)=>{
				this.setState({"appbuild": isEnabled?true:false})
			})

		extensionHelper.getSetting("drag-disabled")
			.then((isDisabled)=>{
				this.setState({"drag-disabled": isDisabled?true:false})
			})

		extensionHelper.getSetting("omnibox-disabled")
			.then((isDisabled)=>{
				this.setState({"omnibox-disabled": isDisabled?true:false})
			})

		extensionHelper.getSetting("omnibox-keyword")
			.then((key)=>{
				this.setState({"omnibox-keyword": key||extensionConfig.omnibox_keyword})
			})
	}

	goBack() {
		window.history.back();
	}

	renderButtons() {
		var menu = [
			{
				title: t.s("goToPRO"),
				link: config.host+"/app#settings/upgrade"
			},

			{
				title: t.s("helpHotKey"),
				link: extensionHelper.getHotkeysSettingsPage()
			},

			{
				title: t.s("editProfile"),
				link: config.host+"/app#settings/profile"
			},

			{
				title: t.s("logOut"),
				link: config.host+"/auth/logout"
			},

			{
				title: t.s("help"),
				link: "http://raindrop.helpscoutdocs.com/"
			},

			{type: "separator"},

			{
				title: t.s("importBookmarks")+" "+t.s("elements2"),
				link: config.host+"/app#settings/import"
			},
			{
				title: t.s("exportBookmarks")+" "+t.s("elements2"),
				link: config.host+"/app#settings/export"
			}
		]

		//Remove Hot Key
		if (!extensionHelper.getHotkeysSettingsPage())
			menu.splice(2,1);

		//Remove pro if is pro
		if (UserStore.isPro())
			menu.splice(0,1);

		menu.unshift({type: "separator"})

		return (
			<menu className="settings-links">
				{menu.map(((item,index)=>{
					if (item.type==="separator")
						return <li key={index} className="separator"/>;

					return <li key={index} className="item"><a href="" onClick={(e)=>{e.preventDefault();extensionHelper.openTab(item.link)}}>{item.title}</a></li>
				}))}
			</menu>
		);
	}

	setSetting(e) {
		var key = e.target.name;
		var obj = {};
		obj[key]=!this.state[key];

		this.setState(obj);

		extensionHelper.setSetting(key, obj[key]);

		if (key=="appbuild"){
			extensionHelper.rerenderBrowserAction();

			dialogStore.onShow({
				title: t.s('desktopNeedRestart'),
				items: [
					{title: t.s("refresh"), onClick: ()=>{
						window.close();
					}}
				]
			})
		}
	}

	setKeyword(e) {
		var val = (e.target.value||"").trim().replace(/[^a-z]/gi,'');
		var key = "omnibox-keyword";
		var obj = {};
		obj[key]=val;

		this.setState(obj);

		extensionHelper.setSetting(key, obj[key])
	}

	requestPermission(e) {
		var key = e.target.name

		extensionHelper.permissions.request(key)
			.then(isEnabled=>{
				this.setState({key: isEnabled?true:false})
			})
	}

	render() {
		return (
			<div className="common-page settings-page">
				<header>
                    <Button onClick={this.goBack} className="button link" icon="back,normal"/>
					<div className="title">{t.s("settings")}</div>
				</header>

				<div className="common-page-content">
					<div className="settings-group">
						{t.s("extension")}
					</div>

					<label className="settings-parameter">
						<div className="spl"><input type="checkbox" name="tabs" checked={this.state["tabs"]} disabled={this.state.tabs} onClick={this.requestPermission} onChange={()=>{}} /></div>
						<div className="title">
							Highlight saved pages {!this.state.ignoreTabs && <span className="new"/>}
							<p>Display ★ badge when current page is saved in your collection</p>
							{!this.state.tabs && <p>Requires additional permission!</p>}
						</div>
					</label>

					<label className="settings-parameter" hidden={!__APPBUILD__}>
						<div className="spl"><input type="checkbox" name="appbuild" checked={this.state["appbuild"]} onClick={this.setSetting} onChange={()=>{}} /></div>
						<div className="title">
							Mini Application
							<p>Open Web App (in small form factor) instead of creating new bookmark automatically</p>
						</div>
					</label>

					{/*<label className="settings-parameter">
						<div className="spl"><input type="checkbox" name="drag-disabled" checked={!this.state["drag-disabled"]} onClick={this.setSetting} onChange={()=>{}} /></div>
						<div className="title">Drag'n'drop</div>
					</label>*/}

					<label className="settings-parameter" hidden={!extensionHelper.omniboxIsEnabled()}>
						<div className="spl"><input type="checkbox" name="omnibox-disabled" checked={!this.state["omnibox-disabled"]} onClick={this.setSetting} onChange={()=>{}} /></div>
						<div className="title">
							Omnibox{/*<span hidden={this.state["omnibox-disabled"]}>, keyword</span>*/}
							<p>Type "r something" to find bookmark right from address bar</p>
						</div>

						{/*<input hidden={this.state["omnibox-disabled"]} type="text" className="sp-text-inline" value={this.state["omnibox-keyword"]} onChange={this.setKeyword} required />*/}
					</label>

					{this.renderButtons()}
				</div>
			</div>
		);
	}
}