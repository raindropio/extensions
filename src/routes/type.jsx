import React from 'react'
import Icon from '../co/common/icon'
import Button from '../co/common/button'
import t from 't'
import extensionConfig from '../background/config'
import extensionHelper from '../helpers/extension'

require('../css/static/type.styl')

export default class Type extends React.Component {
	constructor(props) {
		super(props);

		this.submit = this.submit.bind(this);

		this.state = {
			appbuild: false
		}
	}

	submit(e) {
		e.preventDefault();

		extensionHelper.setSetting("typeSelected", true);
		extensionHelper.setSetting("appbuild", this.state.appbuild);
		extensionHelper.rerenderBrowserAction();

		if (this.state.appbuild)
			window.location.href = extensionConfig.appBuildPage
		else
			window.location.hash = "#/";
		//;
	}

	render() {
		return (
			<div className="page type-page">
				<header>
					<h1 className="light">How do you want to use&nbsp;Raindrop.io?</h1>
				</header>

				<section className="type-selector">
					<a className={this.state.appbuild?"active":""} onClick={()=>this.setState({appbuild:true})}>
						<span className="img"><img src={require("../assets/miniapp.png")} width="63" height="50" /></span>
						<span className="title">Mini App</span>
					</a>

					<a className={!this.state.appbuild?"active":""} onClick={()=>this.setState({appbuild:false})}>
						<span className="img"><img src={require("../assets/clipper.png")} width="63" height="43" /></span>
						<span className="title">Clipper</span>
					</a>
				</section>

				<article className="type-description">
					<p hidden={!this.state.appbuild}>
						Mini App gives you same experience as Web app but in compact size. You can browse, search, organize and add new bookmarks.
					</p>

					<p hidden={this.state.appbuild}>
						Clipper is fastest way to add new bookmark. Just click and you ready to go.
					</p>

					You can change it later in settings.
				</article>

				<footer>
					<Button className="button normal" autoFocus={true} tabIndex="1" onClick={this.submit}>{t.s("continue")}</Button>
				</footer>
			</div>
		);
	}
}