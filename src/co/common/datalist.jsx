import React from 'react'
import t from 't'
import scroll from '../../helpers/scroll'

export default class Datalist extends React.Component {
	constructor(props) {
		super(props);

		this.renderItem = this.renderItem.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);

		this.state = this.prepareState(props);
	}

	prepareState(props) {
		var index = -1;
		var maxHeight = 80;
		var items = JSON.parse(JSON.stringify(this.props.items||[]));
		var filter = (props.filter||"").trim().toLowerCase();

		if (filter)
			items = items.filter((item)=>{
				return (item.title.toLowerCase().indexOf(filter)!=-1);
			})

		if ((items.length)&&(filter))
			if (items[0].title.toLowerCase()==filter)
				index=0;

		if ((this.refs.wrap)&&(items.length>13)) {
			maxHeight = (/*window.innerHeight -*/ this.refs.wrap.getBoundingClientRect().top - 16);
		}

		if (this.props.focus)
			document.getElementById('app').classList.add('datalist-mode');
		else
			document.getElementById('app').classList.remove('datalist-mode');

		return {
			maxHeight: maxHeight,
			index: index,
			items: items
		}
	}

	componentWillReceiveProps(nextProps) {
		setTimeout(()=>{if (this._isMounted) this.setState(this.prepareState(nextProps))},0)
    }

    onKeyDown(e) {
    	if ((this.props.focus)&&(this.state.items.length))
    	switch(e.keyCode) {
    		case 38:
    			this.changeIndex(this.state.index-1);
    		break;

    		case 40:
    			this.changeIndex(this.state.index+1);
    		break;

    		case 13:
    			if (this.state.index!=-1){
	    			e.preventDefault();
	    			this.props.onSelect(this.state.items[this.state.index].title)
	    		}
    		break;
    	}
    }

    changeIndex(index) {
    	var clean = index, dir;

    	if (index > this.state.items.length-1)
    		clean = 0;
    	else if (index < 0)
    		clean = this.state.items.length-1;

    	if (index > this.state.index)
    		dir = "bottom";
    	else
    		dir = "top";

    	this.setState({index: clean});

    	var itemsElement = this.refs.items,
    		selectedElement = this.refs["item"+clean];

    	if ((itemsElement)&&(selectedElement)){
    		var offset = selectedElement.offsetTop;
    		var wrapPlusHeight = itemsElement.scrollTop+itemsElement.clientHeight;
    		var inVisibleArea = ((offset < wrapPlusHeight)&&(itemsElement.scrollTop<offset))

    		if (!inVisibleArea){
    			var to = parseInt(offset - (itemsElement.clientHeight/2));
    			scroll.scrollTo(itemsElement, to);
    		}
    	}
    }

    componentDidMount() {
    	this._isMounted = true;
    	window.addEventListener('keydown', this.onKeyDown, true);
    }

    componentWillUnmount() {
    	this._isMounted = false;
    	window.removeEventListener('keydown', this.onKeyDown, true);
    }

	renderItem(item,index) {
		return (
			<figure ref={"item"+index} key={item.title} className={this.state.index==index?"active":""} onMouseDown={()=>this.props.onSelect(item.title)}>
				<div className="title">{item.title}</div>
				<div className="count">{item.count}</div>
			</figure>
		);
	}

	render() {
		var items = this.state.items.map(this.renderItem);

		return (
			<section className={"datalist "+(this.props.focus?"focus":"")} ref="wrap">
				{this.props.children}

				<div className="datalistItems" ref="items" style={{maxHeight: this.state.maxHeight+"px"}}>
					{items}
				</div>
			</section>
		);
	}
}