require('../css/static/error.styl')

import React from 'react'
import t from 't'
import Button from '../co/common/button'

export default class ErrorComponent extends React.Component {
	reload() {
		window.location.hash="#/";
		window.location.reload()
	}

	render() {
		var content, title = t.s("error");

		switch(this.props.params.id) {
			case "login":
				content = <p><b>Can't login.</b> {t.s("noInternetError")}</p>
			break;

			case "savebookmark":
				title = t.s("saveError")
				content = <p>{t.s("supportOnlyUrls")}</p>
			break;

			default:
				content = <p><b>{t.s("serverundefined")}</b><br/>{this.props.location.query.e}</p>;
			break;
		}

		return (
			<div className="page error-page">
				<h1>{title}</h1>
				{content}

				<Button onClick={this.reload} className="button link accent">{t.s("tryAgain")}</Button>
				&nbsp;
				&nbsp;
				&nbsp;
				<Button href="http://raindrop.helpscoutdocs.com/" target="_blank" className="button link accent" leftIcon="open,micro">{t.s("help")}</Button>
			</div>
		);
	}
}