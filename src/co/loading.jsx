require('../css/loading.styl')

import React from 'react'
import Icon from './common/icon'
import t from 't'

export default class Loading extends React.Component {
	render() {
		return (
			<section className="loading">
				<span className="glow" />
				<Icon className="icon" name="loading" width="270" height="20" />
				{/*<span className="label">{this.props.label||t.s("loading")}...</span>*/}
			</section>
		);
	}
}