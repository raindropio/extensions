import React from 'react'
import ReactDom from 'react-dom'
import t from 't'
import dialogStore from '../stores/dialog'
import extensionHelpers from '../helpers/extension'

const tabIndex = 9999;
const itemClass = 'dialog-item-link';

var _ = {
	findIndex: require('lodash/findIndex'),
	forEach: require('lodash/forEach')
}
var lastFocusClass = 'this-is-last-focus';

export default class Dialog extends React.Component {
	constructor(props) {
		super(props)

		this.keyDown = this.keyDown.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.onDialogChange = this.onDialogChange.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onClickOutside = this.onClickOutside.bind(this);

		this.state={
			params:{},
			show: false,
			animation: "",
			minHeight: window.innerHeight
		}
	}

	componentDidMount() {
    	window.addEventListener('keydown', this.keyDown, true);
    	this.unsubscribeDialog = dialogStore.listen(this.onDialogChange);

    	this.focusFirst()
    }

    componentWillUnmount() {
    	window.removeEventListener('keydown', this.keyDown, true);
    	this.unsubscribeDialog();
    }

    onDialogChange(params) {
    	this.state.params = params;
    	this.state.show = (Object.keys(params).length>0);
    	this.setState({
    		params: params,
    		show: this.state.show,
    		animation: (this.state.show?"showing":"")
    	});

    	this.focusFirst()

    	var appElem = document.querySelector('#app');
    	if (this.state.show)
    		appElem.classList.add('dialog-mode');
    	else
    		appElem.classList.remove('dialog-mode');
    }

    focusFirst() {
    	if (!this.state.show)
			return;

		_.forEach(document.querySelectorAll('.'+lastFocusClass),(elem)=>{
			elem.classList.remove(lastFocusClass)
		});

		document.activeElement.classList.add(lastFocusClass);

    	setTimeout(()=>{
    		var elem = document.querySelectorAll('.'+itemClass)[0];
    		if (elem)
    			elem.focus()
    	},0);
    }

	keyDown(e) {
		if (!this.state.show)
			return;

		switch(e.keyCode) {
			case 37://left
			case 38://top
				this.focusElem(e,-1);
			break;

			case 9://tab
			case 39://right
			case 40://bottom
				this.focusElem(e,1);
			break;

			case 27:
				e.preventDefault()
				e.stopPropagation()
				this.onClose();
			break;
		}
	}

	focusElem(e,val) {
		e.preventDefault()
		e.stopPropagation()

		var items = document.querySelectorAll('.'+itemClass);
		var index = _.findIndex(items, (item)=>{
			return (item == document.activeElement)
		})

		var finalIndex = index+val;
		if (finalIndex>=items.length)
			finalIndex=0;
		else if (finalIndex<0)
			finalIndex=items.length-1;

		items[finalIndex].focus()
	}

	onClick(e,item) {
		e.preventDefault();

		if (typeof item.onClick == "function")
			item.onClick(item);
		else if (item.link)
			extensionHelpers.openTab(item.link)

		this.onClose();
	}

	onClose() {
		this.setState({animation: ""});
		document.querySelector('#app').classList.remove('dialog-mode')

		setTimeout(()=>{
			dialogStore.onClose();

			var lastFocus = document.querySelector('.'+lastFocusClass)
			if (lastFocus)
				lastFocus.focus();
		},250);
	}

	onClickOutside(e) {
		if (e.target.classList.contains("dialog"))
			this.onClose();
	}

	renderItem(item,index) {
		if (item.type == "separator")
			return <li className="dialog-item-separator" key={index}></li>
		return (
			<li key={index}><a className={itemClass} href="" tabIndex={tabIndex+index} onClick={(e)=>this.onClick(e,item)}>{item.title}</a></li>
		);
	}

	componentDidUpdate() {
		var elem = ReactDom.findDOMNode(this.refs.content);
		if (!elem) return;
		
		var height = parseInt(elem.clientHeight);
		if (height > this.state.minHeight)
			this.setState({minHeight: height+14});
	}

	renderMinHeight() {
		var s = `
			#app {
				--min-height: ${this.state.minHeight}px;
			}
		`
		return <style dangerouslySetInnerHTML={{__html: s}}/>;
	}

	render() {
		if (!this.state.show)
			return null;

		var items = (this.state.params.items||[]).concat([{type:"separator"},{title: t.s("cancel")}]);
		items.unshift({type:"separator"})

		return (
			<div className={"dialog "+this.state.animation} onClick={this.onClickOutside}>
				<div className="dialog-content" ref="content">
					<h2>{this.state.params.title}</h2>
					<p dangerouslySetInnerHTML={{__html: this.state.params.excerpt||""}}/>
					<menu>
						{items.map(this.renderItem)}
					</menu>
				</div>

				{this.renderMinHeight()}
			</div>
		);
	}
}