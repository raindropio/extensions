require('../css/static/settings.styl')

import React from 'react'
import t from 't'
import Button from '../co/common/button'
import extensionHelper from '../helpers/extension'
import extensionConfig from '../background/config'
import config from '../modules/config'
import dialogStore from '../stores/dialog'

import TypeForm from './type/form'

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
			"omnibox-keyword": extensionConfig.omnibox_keyword,
			last_collection: false,
			default_field: 'collection'
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

		extensionHelper.getSetting("last_collection")
			.then((isEnabled)=>{
				this.setState({"last_collection": isEnabled?true:false})
			})

		extensionHelper.getSetting("default_field")
			.then((default_field)=>{
				this.setState({ default_field })
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
		obj[key]=typeof e.target.checked != 'undefined' ? e.target.checked : e.target.value;

		this.setState(obj);

		extensionHelper.setSetting(key, obj[key])
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

	onAppBuildChange = ()=>{
		dialogStore.onShow({
			title: t.s('desktopNeedRestart'),
			items: [
				{title: t.s("refresh"), onClick: ()=>{
					window.close();
				}}
			]
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
						{t.s("commonSettings")}
					</div>

					<label className="settings-parameter">
						<div className="spl"><input type="checkbox" name="tabs" checked={this.state["tabs"]} disabled={this.state.tabs} onClick={this.requestPermission} onChange={()=>{}} /></div>
						<div className="title">
							Highlight saved pages {!this.state.ignoreTabs && <span className="new"/>}
							<p>Display ★ badge for saved pages. {!this.state.tabs && 'Requires additional permission!'}</p>
						</div>
					</label>

					<label className="settings-parameter" hidden={!extensionHelper.omniboxIsEnabled()}>
						<div className="spl"><input type="checkbox" name="omnibox-disabled" checked={this.state["omnibox-disabled"]} onChange={this.setSetting} /></div>
						<div className="title">
							Disable Omnibox{/*<span hidden={this.state["omnibox-disabled"]}>, keyword</span>*/}
							<p>Type "r something" to find bookmark right from address bar</p>
						</div>

						{/*<input hidden={this.state["omnibox-disabled"]} type="text" className="sp-text-inline" value={this.state["omnibox-keyword"]} onChange={this.setKeyword} required />*/}
					</label>

					{/*<label className="settings-parameter">
						<div className="spl"><input type="checkbox" name="drag-disabled" checked={!this.state["drag-disabled"]} onChange={this.setSetting} /></div>
						<div className="title">Drag'n'drop</div>
					</label>*/}

					<div className="settings-group">
						Extension type
					</div>

					<label className="settings-parameter" hidden={!__APPBUILD__}>
						<TypeForm onChange={this.onAppBuildChange} />
					</label>

					<div hidden={this.state.appbuild}>
						<div className="settings-group">
							{t.s("extension")} {t.s('settings').toLowerCase()}
						</div>

						<label className="settings-parameter" hidden={!__APPBUILD__}>
							<div className="spl"><input type="checkbox" name="last_collection" checked={this.state.last_collection} onChange={this.setSetting} /></div>
							<div className="title">
								Save to last collection
								<p>Save new bookmarks to last used collection, instead default "Unsorted"</p>
							</div>
						</label>

						<label className="settings-parameter" hidden={!__APPBUILD__}>
							<div className="spl">
								↹
							</div>
							<div className="title">
								Focus on field

								<div style={{paddingTop: '4px'}}>
									<select value={this.state.default_field} name='default_field' onChange={this.setSetting}>
										<option value='collection'>Collection</option>
										<option value='title'>Title</option>
										<option value='excerpt'>Description</option>
										<option value='tags'>Tags</option>
									</select>
								</div>
							</div>
						</label>
					</div>

					{this.renderButtons()}
				</div>
			</div>
		);
	}
}