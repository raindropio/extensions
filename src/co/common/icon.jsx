import React from 'react'
const prefix = "svgIcon"

export default class Icon extends React.Component {
	render() {
		if (!this.props.name) return null;
		
		var size = "normal";

		if ((this.props.width)||(this.props.height))
			size = "";

		if (typeof this.props.micro != "undefined")
			if (this.props.micro !== false)
				size = "micro";

		if (typeof this.props.medium != "undefined")
			if (this.props.medium !== false)
				size = "medium";

		var className = 
			prefix
			+(this.props.className?" "+this.props.className:"")
			+(size?" "+prefix+"-size-"+size:"");
		var iconName = require('../../assets/icons/'+(size?size+"-":"")+this.props.name+'.svg');

		return (
			<span className={className}>
				<svg width={this.props.width} height={this.props.height}>
					<use xlinkHref={iconName} />
				</svg>
			</span>
		)
	}
}