import React from 'react'
import extensionHelper from '../../helpers/extension'

require('../../css/static/type.styl')

export default class Type extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			appbuild: false
		}
	}

	async componentDidMount() {
		this.setState({appbuild: await extensionHelper.getSetting("appbuild")})
	}

	submit = ()=>{
		extensionHelper.setSetting("appbuild", this.state.appbuild);
		extensionHelper.rerenderBrowserAction()
		this.props.onChange && this.props.onChange(this.state.appbuild)
    }
    
    enable = (e)=>{
        e.preventDefault();
        this.setState({appbuild: true}, this.submit)
    }

    disable = (e)=>{
        e.preventDefault();
		this.setState({appbuild: false}, this.submit)
    }

	render() {
		return (
			<div className="type-page">
				<section className="type-selector">
					<a className={!this.state.appbuild?"active":""} onClick={this.disable}>
						<span className="img"><img src={require("../../assets/clipper.png")} width="63" height="43" /></span>
						<span className="title">Clipper</span>
					</a>

					<a className={this.state.appbuild?"active":""} onClick={this.enable}>
						<span className="img"><img src={require("../../assets/miniapp.png")} width="63" height="50" /></span>
						<span className="title">Mini App</span>
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
			</div>
		)
	}
}