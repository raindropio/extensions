import React from 'react'
import Icon from './icon'

const ParseIconString = (s)=>{
	var temp = s.split(',');
	var result = {
		name: temp[0],
		micro: false,
		normal: false
	}

	for(var i = 1;i<=temp.length-1;i++)
		switch(temp[i]){
			case "micro":result.micro=true;break;
			case "normal":result.normal=true;break;
		}

	return <Icon key={result.name} name={result.name} micro={result.micro} normal={result.normal} />;
}

export default class Button extends React.Component {
	constructor(props){
		super(props);

		this.onKeydown = this.onKeydown.bind(this);

		this.state={}
	}

	onKeydown(e) {
		if (e.keyCode == 13)
			if (typeof this.props.onClick == "function")
				this.props.onClick(e);
	}

	render() {
		var leftIcon, rightIcon, content;

		if (this.props.leftIcon)
			leftIcon = <span key="leftIcon" className="button-icon-left">{ParseIconString(this.props.leftIcon)}</span>

		if (this.props.children)
			content = <span key="content" className="button-label">{this.props.children}</span>
		if (this.props.icon)
			content = ParseIconString(this.props.icon)

		var Component = "a";
		if (this.props.notLink)
			Component = "span";

		return React.createElement(Component, {
			tabIndex: this.props.tabIndex ? this.props.tabIndex : "-1",
			href: this.props.href,
			target: this.props.target,
			className: this.props.className,
			title: this.props.title,
			onClick: this.props.onClick,
			onFocus: this.props.onFocus,
			onBlur: this.props.onBlur,
			onKeyDown: this.onKeydown
		}, [
			leftIcon,
			content,
			rightIcon
		]);

		/*return (
			<Component 	tabIndex={this.props.tabIndex ? this.props.tabIndex : "-1"}
				href={this.props.href}
				target={this.props.target}
				className={this.props.className}
				title={this.props.title}
				onClick={this.props.onClick}
				onKeyDown={this.onKeydown}>
					{leftIcon}
					{content}
					{rightIcon}
			</Component>
		);*/
	}
}