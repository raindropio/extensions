import React from 'react'
import ReactDom from 'react-dom'
import t from 't'

import forms from '../../helpers/forms'

import Icon from '../../co/common/icon'
import Button from '../../co/common/button'
import Cover from '../../co/bookmark/cover'
import Textarea from 'react-autosize-textarea'

var changed = {}

export default class Info extends React.Component {
	constructor(props) {
		super(props);

		this.goToCover = this.goToCover.bind(this);
		this.inputChange = this.inputChange.bind(this);

		this.state = {
			showExcerpt: true,
			autoFocusField: localStorage.getItem('autoFocus') || 'title'
		}
	}


	textareaFocus(e) {
		localStorage.setItem('autoFocus', e.target.name)

		if (typeof changed[e.target.name] == "undefined"){
			if (typeof e.persist == "function")
				e.persist()

			setTimeout(()=>{
				if (e.target){
					e.target.setSelectionRange(0, e.target.value.length);
					e.target.scrollTop = 0;
				}
			},0);

			changed[e.target.name] = true;
		}
	}

	textareaKeyDown(e) {
		if(e.keyCode==13){
			e.preventDefault()
			forms.focusNext(e.target);
		}
	}

	inputChange(e) {
		var obj = {};
		obj[e.target.name] = e.target.value;

		this.props.onChange(obj);
	}

	renderExcerpt() {
		var className = "field-description field";
		var placeholder = this.props.excerpt||(t.s("note")+"…");

		if (!this.state.showExcerpt){
			var focusMain = ()=>{
				setTimeout(()=>{
					this.textareaFocus({
						target: ReactDom.findDOMNode(this.refs.excerpt)
					})
				},0);
			}
			return <textarea 	
						tabIndex="3"
						spellCheck="false"
						className={className+" field-description-empty"}
						title={t.s("enterDescription")}
						placeholder={placeholder}
						onFocus={(e)=>{this.setState({showExcerpt: true}); focusMain()}} />;
		}

		return (
			<Textarea 	
				tabIndex="3"
				name="excerpt"
				ref="excerpt"
				className={className}
				required={true}
				autoComplete="off"
				spellCheck="false"
				placeholder={placeholder}
				defaultValue={this.props.excerpt}
				autoFocus={this.state.autoFocusField=='excerpt'}
				onChange={this.inputChange}
				onFocus={this.textareaFocus}
				onKeyDown={this.textareaKeyDown}/>
		);
	}

	goToCover() {
		this.props.goTo("/cover/"+this.props._id)
	}

	render() {
		return (
			<div className="info">
				

				<div className="text">
					<Textarea 	
								ref="title"
								tabIndex="2"
								name="title"
								spellCheck="false"
								className="field-title field size-medium"
								required={true}
								autoComplete="off"
								autoFocus={this.state.autoFocusField=='title'}
								title={t.s("enterTitle")}
								placeholder={t.s("enterTitle")}
								defaultValue={this.props.title}
								onChange={this.inputChange}
								onKeyDown={this.textareaKeyDown}
								onFocus={this.textareaFocus} />
					{this.renderExcerpt()}
				</div>

				<Cover src={this.props.cover}>
					<a tabIndex="5" className="cover-button" title={t.s("covers")} onClick={this.goToCover} onKeyDown={(e)=>{if (e.keyCode == 13) this.goToCover()}}>
						<span className="button primary circle"><Icon name="settings" normal/></span>
					</a>
				</Cover>
			</div>
		);
	}
}