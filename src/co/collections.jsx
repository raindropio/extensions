require('../css/collections/block.styl')

import React from 'react'
import Icon from './common/icon'
import Button from './common/button'
import t from 't'
import Tree from './tree'

export default class Collections extends React.Component {
	constructor(props){
		super(props);

		this.onKeydown = this.onKeydown.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.focusInput = this.focusInput.bind(this)

		this.state = {
			query: ""
		}
	}

	componentDidMount() {
		this.refs.input.focus()
	}

	onKeydown(e) {
		switch(e.keyCode){
			case 27://esc
				e.preventDefault();
				e.stopPropagation();
				if (!this.state.query)
					this.props.onCancel();
				else
					this.setState({query:""})
			break;
		}
	}

	onSubmit(e) {
		e.preventDefault()
	}

	focusInput() {
		this.refs.input.focus();
	}

	render() {
		var className="collections-selector"

		if (this.state.focus)
			className+=" focus";

		return (
			<section className={className}>
				<form onSubmit={this.onSubmit}>
					{/*<h4 className="subheader">{t.s("selectCollection")}</h4>*/}

					<div className="collections-selector-find">
						<Button tabIndex="-1" className="button link" onClick={this.props.onCancel} icon="back,normal"/>
						<input 	ref="input"
								type="text"
								tabIndex="100"
								placeholder={t.s("findOrCreateCollection")+"…"}
								autoFocus
								value={this.state.query}
								onChange={(e)=>this.setState({query:e.target.value})}
								onFocus={()=>this.setState({focus:true})}
								onBlur={()=>this.setState({focus:false})}
								onKeyDown={this.onKeydown} />
						
					</div>
				</form>

				<Tree
					find={this.state.query}
					focus={this.state.focus}
					focusInput={this.focusInput}
					onSelectCollection={this.props.onSelectCollection}
					onCancel={this.props.onCancel} />
			</section>
		);
	}
}
