import React from 'react'
import t from 't'
import Button from '../../co/common/button'
import Icon from '../../co/common/icon'

import bookmarkActions from '../../actions/bookmark'
import config from '../../modules/config'
import extensionHelper from '../../helpers/extension'
import dialogStore from '../../stores/dialog'

var _ = {
	capitalize: require('lodash/capitalize')
}

export default class Footer extends React.Component {
	constructor(props) {
		super(props);

		this.removeRestore = this.removeRestore.bind(this);
		this.onMenuSelect = this.onMenuSelect.bind(this);
		this.renderMenuItem = this.renderMenuItem.bind(this);
		this.showSettings = this.showSettings.bind(this);
		this.onToggleImportant = this.onToggleImportant.bind(this);

		this.state = this.prepareState(props);
	}

	prepareState(props) {
		return {
			isRemoved: (props.collectionId == -99)
		}
	}

	componentWillReceiveProps(nextProps) {
    	this.setState(this.prepareState(nextProps))
    }

	removeRestore() {
		if (this.state.isRemoved)
			bookmarkActions.restore();
		else
			bookmarkActions.remove();
	}

	renderMenuItem(item,index) {
		if (item.disabled)
			return <option key={index} disabled>{item.title}</option>

		return <option value={index} key={index} data-link={item.link}>{item.title}</option>
	}

	onMenuSelect(e) {
		extensionHelper.openTab(e.target.options[e.target.selectedIndex].getAttribute('data-link'));

		e.target.selectedIndex = -1;
	}

	showSettings() {
		var menu = [
			{
				title: t.s("goToPRO"),
				link: config.host+"/app#settings/upgrade"
			},

			{
				title: t.s("settings"),
				link: config.host+"/app#settings"
			},

			{
				title: t.s("helpHotKey"),
				link: extensionHelper.getHotkeysSettingsPage()
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

		dialogStore.onShow({
			title: UserStore.getUser().fullName,
			items: menu
		});
	}

	onToggleImportant() {
		this.props.onChange({important: !this.props.important});
	}

	renderImportantButton() {
		if (this.state.isRemoved)
			return null;
		
		var favPrefix = t.s("add") +" " + t.s("to");
        if (this.props.important)
            favPrefix = t.s("remove")+" "+t.s("from");

        return (
        	<Button className="button link accent" tabIndex="1001" onClick={this.onToggleImportant} onKeyDown={(e)=>this.onEnter(e,()=>this.onToggleImportant())} title={favPrefix + " " + t.s("favoriteSites").toLowerCase()}>
        		<Icon name={"like"+(this.props.important?"-active":"")} />
        	</Button>
       	); 
	}

	render() {
		return (
			<section className="footer">
				<Button className="button link accent" tabIndex="1000" onClick={this.removeRestore}>
					{this.state.isRemoved ? t.s("restore") : <Icon name="remove" />}
				</Button>

				{this.renderImportantButton()}

				<div className="max"/>

				<Button href="https://raindrop.io" target="_blank" className="button link" tabIndex="1002">
					{t.s("myAccount")}
				</Button>

				<Button className="button gray accent"  tabIndex="1010" icon="config,normal" onClick={this.showSettings} />
			</section>
		);
	}
}