import React from 'react'
import extensionHelper from '../../src/helpers/extension'
import Api from '../../src/modules/api'

const proPage = "https://raindrop.io/app/#/settings/upgrade"

export default class Page extends React.Component{
	constructor(props){
		super(props);

		this.changeHotkey = this.changeHotkey.bind(this);
		this.showInvite = this.showInvite.bind(this);

		this.state = {
			hotkey:[],
			hotkeyEnabled: true,
			omniboxEnabled: extensionHelper.omniboxIsEnabled(),
			userId: 0,
			isPro: false,
			showInvite: false,
			fromFifth: (window.location.search=="?5")
		}
	}

	componentDidMount() {
		extensionHelper.getHotKey((key)=>{
			if (key===null)
				return this.setState({hotkeyEnabled:false});

			var parsed = (key||"").split('+').map((k)=>k.trim()).filter((k)=>k)
			this.setState({hotkey:parsed})
		})

		Api.get('user', (json)=>{
			if (json.result)
				this.setState({userId: json.user._id, isPro: json.user.pro})
		})
	}

	renderKeys() {
		var replacer = {
			"command" : "&#8984;",
			"shift" : "&#8679;",
			"option" : "&#8997;"
		}
		var classes = {
			"command" : "command",
			"ctrl" : "command",
			"option" : "command",
			"shift" : "shift"
		}

		var keys = ["command","shift","option"];
		if (this.state.hotkey.length>0)
			keys = this.state.hotkey;

		var items = keys.map((key,index)=>{
			var className="",
				value=key;

			if (replacer[key.toLowerCase()])
				value = replacer[key.toLowerCase()];
			if (classes[key.toLowerCase()])
				className = classes[key.toLowerCase()];

			return (
				<div key={index} className={"key"+(className?"-"+className:"")}
					dangerouslySetInnerHTML={{__html: value}}/>
			);
		})

		return items||null;
	}

	changeHotkey(e) {
		e.preventDefault()
		extensionHelper.openTab(extensionHelper.getHotkeysSettingsPage())
	}

	showInvite(e) {
		e.preventDefault()
		this.setState({showInvite:true});
		setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0)
	}

	render() {
		var link = "https://raindrop.io/?ref="+this.state.userId,
			status = "Bookmark manager with beautiful interface, fast search and the ability to work together "+link;

		return (
			<div id="page">
				<header>
					<a href="https://raindrop.io"><img src={require("../../src/assets/extension/icon-96.png")} width="48" height="48" /></a>
					<h1>✌️ The Raindrop.io Extension is ready to go</h1>
					<h2>Learn how to use Raindrop.io in your browser</h2>
				</header>

				<div id="fromfifth" hidden={!this.state.fromFifth}>
					Welcome to updated Raindrop.io Extension 6.0! Now it works only just as Clipper. We decided to simplify extension and concentrate on improving bookmark adding experience.<br/>
					<br/>
					As you remember our extension before 6 version allowed to browse your bookmarks in Sidebar-like panel. But because we made many tricks and hacks to make Sidebar work in browser, many users experienced crashes and ustable work.
					And we can't continue to support Sidebar-like extension due to browsers limitations.<br />
					<br/>
					So now extension only allows to add new bookmarks. But this decision made extension super stable, fast and more simple and intuitive to use!<br /><br/>
					To access your bookmarks please right click on extension button and select "My bookmarks". Or open new tab and just click on extension button. Or set hotkey in settings.<br/><br/>
					We continue to work on better and fast way accessing your bookmarks.
				</div>

				<section className="blocks">
					<article id="block-button">
						<p>When you find something interesting on the web, just click to add bookmark</p>
					</article>

					<article id="block-drag">
						<p>Drag image or link from page and drop it into appeared ☁️️ in the right corner</p>
					</article>

					<article id="block-hotkey" hidden={!this.state.hotkeyEnabled}>
						<p>
							Save time by pressing <b>{this.state.hotkey.length>0?this.state.hotkey.join(' + '):"hotkey"}</b>. <a href="" onClick={this.changeHotkey} hidden={__PLATFORM__=="firefox"}>Change&nbsp;hotkeys</a>
						</p>
						
						<div className="keys">
							{this.renderKeys()}
						</div>
					</article>

					<article id="block-sync">
						<p>
							Organize bookmarks from 👨‍💻 Web, &#63743; MacOS and&nbsp;📱&nbsp;mobile apps.
							<br/><br/><br/>
							<a href="https://raindrop.io">Open Web App</a><br/><br/>
							<a href="https://raindrop.io/app/#/install/mac">Install</a>
						</p>
					</article>

					<article id="block-search" hidden={!this.state.omniboxEnabled}>
						<p>Or type "r <b>query</b>" in browser address bar to find bookmark</p>
					</article>
				</section>

				<footer hidden={this.state.isPro}>
					<h1>Raindrop.io is free, but we have some <a href={proPage}>nice features</a> available for PRO users!</h1>
					<div className="features">
						<p><img src={require("./assets/nested.png")} width="44" height="38" /> Nested folders</p>
						<p><img src={require("./assets/tags.png")} width="36" height="24" /> Suggested tags</p>
						<p><img src={require("./assets/dropbox.png")} width="40" height="38" /> Dropbox backup</p>
					</div>
					<h2>
						Just <a href={proPage}>$2 per month</a>.
						<span hidden={this.state.showInvite}>Or invite 5 friends and <a href="" onClick={this.showInvite}>get year of PRO features for free!</a></span>
					</h2>
				</footer>

				<div className="share" hidden={!this.state.showInvite}>
					<b>Get 5 of your friends to sign up with this unique URL:</b>
					<input type="text" value={link} readOnly onFocus={(e)=>{e.target.select()}} />
					<div><a href={"https://www.facebook.com/share.php?u="+encodeURIComponent(link)} target="_blank">Share on Facebook</a>
					<a href={"https://twitter.com/home?status="+encodeURIComponent(status)} target="_blank">Share on Twitter</a></div>
				</div>
			</div>
		);
	}
}