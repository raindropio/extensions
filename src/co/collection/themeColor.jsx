import React from 'react'
import network from 'network'
import collectionsStore from '../../stores/collections'

var colorThief = require('../../modules/color-thief');
colorThief = new colorThief();
import colors from '../../modules/colors'

export default class ThemeColor extends React.Component {
	displayName: "collections/themeColor"

	prepareCollectionColor(e,_this) {
		if (!Object.keys(_this.props.collection||{}).length)
			return;

		if (typeof _this.props.collection._id == 'undefined')
			return false;

		if (!_this.props.collection.color) {
			var c = colors.getDarkPalette(colorThief.getColor(e.target));

			if (c!="0,0,0"){
				c = "rgb("+c+")";

				collectionsStore.onUpdateColorCollection({_id: _this.props.collection._id, color: c});
			}
		}
	}

	themeColor(c) {
		return {__html:this.props.cssBlock(c)}
	}

	render() {
		var color, img;
		try{
			color = this.props.collection.color;
			img = (this.props.collection.cover||[])[0];
		}catch(e){}

		if (!img)
			return null;

		return (
			<div>
				<style dangerouslySetInnerHTML={this.themeColor(color)}/>
				<img src={network.fixURL(img)} crossOrigin="anonymous" onLoad={(e) => this.prepareCollectionColor(e,this)} style={{display:"none"}} />
			</div>
		);
	}
}