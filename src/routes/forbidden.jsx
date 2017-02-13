require('../css/static/forbidden.styl')

import React from 'react'
import t from 't'
import Button from '../co/common/button'

import config from '../modules/config'

export default class ErrorComponent extends React.Component {
	render() {
		return (
			<div className="page forbidden-page">
				<h1 className="light">{t.s("welcome")}&nbsp;Raindrop.io</h1>
				<p>
					{t.s("whenYouFindInteresting")}
				</p>

				<Button href="/ready.html" target="_blank" className="button primary accent">{t.s("howToUse")}</Button><br /><br />
				<Button href={config.host+"/app#settings/import"} target="_blank" className="button link accent" leftIcon="open,micro">{t.s("importBookmarks")+" "+t.s("elements2")}</Button>
			</div>
		);
	}
}