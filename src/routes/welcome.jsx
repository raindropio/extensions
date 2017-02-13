import React from 'react'
import Icon from '../co/common/icon'
import Button from '../co/common/button'
import t from 't'

require('../css/static/welcome.styl')

export default class Welcome extends React.Component {
	render() {
		return (
			<div className="welcome-page">
				<header>
					<Icon name="logo" width="94" height="11" />

					<Button href="https://raindrop.io" target="_blank" className="button link accent" tabIndex="3" leftIcon="open,micro">
						{t.s("about")}
					</Button>
				</header>

				<section className="features">
					<article>
						<Icon name="intro-cloud" className="color-theme" width="44" height="44" />
						<p>
							<b dangerouslySetInnerHTML={{__html: t.s("saveButtonForWeb")}} />
						</p>
					</article>

					<article>
						<Icon name="intro-folder" className="color-red" width="44" height="44" />
						<p>
							<b dangerouslySetInnerHTML={{__html: t.s("downloadTitle")}} />
							<span>{t.s('shareCollaborate')}</span>
						</p>
					</article>

					<article>
						<Icon name="intro-devices" className="color-green" width="44" height="44" />
						<p>
							<b>{t.s("syncWithApps")}</b>
							<span>{t.s("welcomeSlide1DDD")}</span>
						</p>
					</article>
				</section>

				<footer>
					<Button href="https://raindrop.io/app/#/account/login" target="_blank" className="button normal" tabIndex="2">{t.s("signIn")}</Button>
					<Button href="https://raindrop.io/app/#/account/signup" target="_blank" className="button primary" tabIndex="1">{t.s("signUp")}</Button>
				</footer>
			</div>
		);
	}
}