import React from 'react'
import Button from '../../co/common/button'
import t from 't'
import extensionConfig from '../../background/config'
import extensionHelper from '../../helpers/extension'
import Form from './form'

export default class Type extends React.Component {
	submit = (e)=>{
		e.preventDefault();

		extensionHelper.setSetting("typeSelected", true);
		extensionHelper.rerenderBrowserAction()

		extensionHelper.getSetting("appbuild")
			.then(appbuild=>{
				if (appbuild)
					window.location.href = extensionConfig.appBuildPage
				else
					window.location.hash = "#/";
			})
	}

	render() {
		return (
			<div className="page type-page">
				<header>
					<h1 className="light">How do you want to use&nbsp;Raindrop.io?</h1>
				</header>

				<Form />

				<footer>
					<Button className="button normal" autoFocus={true} tabIndex="1" onClick={this.submit}>{t.s("continue")}</Button>
				</footer>
			</div>
		)
	}
}