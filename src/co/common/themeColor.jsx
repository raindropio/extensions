import React from 'react'
import network from 'network'
import colorThief from '../../modules/color-thief'
import colors from '../../modules/colors'

export default class ThemeColor extends React.Component {
	displayName: "common/themeColor"

	constructor(props) {
		super(props);
		this.prepareColor = this.prepareColor.bind(this);
		this.state = this.prepareState(props);
	}

	prepareState(props) {
		window.imageColor = window.imageColor||{};
		
		return {
			color: window.imageColor[props.src]||""
		}
	}

	prepareColor(e) {
		if (typeof window.imageColor[this.props.src] != "undefined")
			return;

		var c = colors.getDarkPalette(colorThief.getColor(e.target));

		if (c!="0,0,0"){
			c = "rgb("+c+")";
			this.setState({color: c});

			window.imageColor[this.props.src] = c;
		}else {
			window.imageColor[this.props.src] = "";
		}
	}

	themeColor(c) {
		return {__html:this.props.cssBlock(c)}
	}

	render() {
		if (!this.props.src)
			return null;

		return (
			<div>
				<style dangerouslySetInnerHTML={this.themeColor(this.state.color)}/>
				<img src={/*network.fixURL(*/this.props.src/*)*/} crossOrigin="anonymous" onLoad={this.prepareColor} style={{display:"none"}} />
			</div>
		);
	}
}