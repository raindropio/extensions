import React from 'react'
import ReactDom from 'react-dom'
import t from 't'

import CollectionsStore from '../../stores/collections'

import Button from '../common/button'

export default class ItemEdit extends React.Component {
	timeout: null

	constructor(props) {
		super(props);

		this.handleBlur = this.handleBlur.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onKey = this.onKey.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.submitClick = this.submitClick.bind(this);

		this.state = {
			title: this.props.title
		}
	}

	componentDidMount() {
		clearTimeout(this.timeout)
		var elem = ReactDom.findDOMNode(this.refs.input);
		if (elem)
			elem.setSelectionRange(0, elem.value.length);
	}

	handleSubmit(e) {
		e.preventDefault();
		
		CollectionsStore.onUpdateCollection({
            item: {
            	_id: this.props._id,
            	title: this.state.title
            }
        }, (cId)=>{
            this.props.onClose();
        });
	}

	handleBlur() {
		this.timeout = setTimeout(()=>this.props.onClose(),200)
	}

	onKey(e) {
		switch(e.keyCode){
			case 27://esc
				e.preventDefault()
				e.stopPropagation()
				this.props.onClose();
			break;
		}
	}

	onFocus() {
		clearTimeout(this.timeout)
	}

	submitClick(e) {
		ReactDom.findDOMNode(this.refs.form).submit(e);
	}

	render() {
		return (
			<form ref="form" onSubmit={this.handleSubmit}>
				<input ref="input"
						type="text"
						required
						autoFocus
						value={this.state.title}
						onFocus={this.onFocus}
						onBlur={this.handleBlur}
						onKeyDown={this.onKey}
						onChange={(e)=>this.setState({title: e.target.value})}
						placeholder={t.s("enterTitle")}
						tabIndex="99999" />

				<input className="button primary" tabIndex="99999" type="submit" onFocus={this.onFocus} onBlur={this.handleBlur} value={t.s("save")} />
			</form>
		);
	}
}