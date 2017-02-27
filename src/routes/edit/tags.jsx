import React from 'react'
import t from 't'

import filtersStore from '../../stores/filters'

import Icon from '../../co/common/icon'
import AutosizeInput from 'react-input-autosize'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Datalist from '../../co/common/datalist'
import onlyPro from '../../helpers/onlyPro'

var _ = {
	uniq: require('lodash/uniq'),
	sortBy: require('lodash/sortBy')
}

export default class Tags extends React.Component {
	constructor(props) {
		super(props);

		this.onAddNewTitleFocus = this.onAddNewTitleFocus.bind(this);
		this.onAddNewTitleChange = this.onAddNewTitleChange.bind(this);
		this.onAddNewTitleKeydown = this.onAddNewTitleKeydown.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onDataListSelect = this.onDataListSelect.bind(this);
		

		this.state = Object.assign({
			focus: false,
			addNewTitle: "",
			filters: []
		}, this.prepareState(props));
	}

	onFiltersChange(filters) {
		var temp = [];
        try{temp = JSON.parse(JSON.stringify(filters[NaN].items.tags||[]))}catch(e){}

		temp = _.sortBy(temp, function(item){
            return item._id;
        });
        temp = temp.map((item)=>{
        	item.title = item._id;
        	return item;
        })

		this.setState({filters: temp});
	}

	componentDidMount() {
        this.unsubscribeFilters = filtersStore.listen(this.onFiltersChange.bind(this));
    }

    componentWillUnmount() {
        this.unsubscribeFilters();
    }

	prepareState(props) {
		return {
			type: props.type||"link",
			tags: (props.tags||[]).sort(),
			suggestedTags: (props.suggestedTags||[]).sort(),
		}
	}

	componentWillReceiveProps(nextProps) {
    	this.setState(this.prepareState(nextProps))
    }

    onAddNewTitleFocus() {
    	if (!(this.state.filters||[]).length){
	    	filtersStore.onSetQuery({cid:NaN});
	    	filtersStore.onLoad();
	    }

	    this.setState({focus: true});
    }

	onAddNewTitleChange(e) {
		this.setState({addNewTitle: e.target.value});
	}

	onAddNewTitleKeydown(e) {
		switch(e.keyCode) {
			case 27://esc
				if (this.state.addNewTitle){
					e.preventDefault();
					this.setState({addNewTitle: ""});
				}
			break;

			case 38://up
			case 40://down
				e.preventDefault()
			break;
		}
	}

	onSubmit(e) {
		if(e)
			e.preventDefault();

		if ((this.state.addNewTitle||"").trim()!="") {
			this.onAddTag(this.state.addNewTitle);
			this.setState({addNewTitle: ""});
		}
	}

	onAddTag(title) {
		var tags = JSON.parse(JSON.stringify(this.state.tags));
		tags.push(title);

		//this.setState({tags: _.uniq(tags)/*.sort()*/});
		this.props.onChange({tags:_.uniq(tags)})
	}

	onRemoveTag(title) {
		var tags = JSON.parse(JSON.stringify(this.state.tags));
		tags = tags.filter((tag)=>{
			return (tag!=title)
		})

		//this.setState({tags: _.uniq(tags)/*.sort()*/});
		this.props.onChange({tags:_.uniq(tags)})
	}

	onRemoveType() {
		this.props.onChange({type: "link"})
	}

	onEnter(e, callback) {
		if (e.keyCode == 13)
			callback()
	}

	onDataListSelect(title) {
		this.state.addNewTitle = title;
		this.setState({addNewTitle: title});
		this.onSubmit();
	}

	renderSuggestions() {
		var suggestions = [];

		this.state.suggestedTags.forEach((item, index)=>{
			if (this.state.tags.indexOf(item)==-1)
				suggestions.push(
					<a className="tag-item tag-suggested" tabIndex="11" key={"s"+item} onClick={()=>this.onAddTag(item)} onKeyDown={(e)=>this.onEnter(e,()=>this.onAddTag(item))}>
						{item}
						<Icon name="add" micro className="icon-close" />
					</a>
				);
		})

		return suggestions;
	}

	renderType() {
		if (this.state.type=="link") return null;

		return (
			<a className="tag-item tag-active tag-type" title={t.s("type")} tabIndex="11" onClick={()=>this.onRemoveType()} onKeyDown={(e)=>this.onEnter(e,()=>this.onRemoveType())}>
				<Icon name={this.state.type} micro className="icon-type" />
				{t.s(this.state.type)}
				<Icon name="close" micro className="icon-close" />
			</a>
		);
	}

	renderTags() {
		return this.state.tags.map((item, index)=>{
			return (
				<a className="tag-item tag-active" title={t.s("tags")} tabIndex="11" key={"t"+item} onClick={()=>this.onRemoveTag(item)} onKeyDown={(e)=>this.onEnter(e,()=>this.onRemoveTag(item))}>
					{item}
					<Icon name="close" micro className="icon-close" />
				</a>
			);
		})
	}

	renderNonPro() {
		if (UserStore.isPro())
			return null;
		return (
			<a className="tag-item tag-suggested" title={t.s("suggested")+" "+t.s("tags").toLowerCase()} tabIndex="11" key="smore" onClick={()=>onlyPro.showAlert(2)} onKeyDown={(e)=>this.onEnter(e,()=>onlyPro.showAlert(2))}>
				{t.s("more")}
				<Icon name="add" micro className="icon-close" />
			</a>
		);
	}

	render() {
		return (
			<section className="tags">
				<form onSubmit={this.onSubmit}>
					<ReactCSSTransitionGroup
						transitionName="tag"
						transitionEnterTimeout={300}
						transitionLeave={false}>
						{/*this.renderImportantButton()*/}

						<Datalist key="datalist" items={this.state.filters} filter={this.state.addNewTitle} focus={this.state.focus} onSelect={this.onDataListSelect}>
							<Icon name="tag" micro className="tag-icon" />
							<AutosizeInput 
								key="input"
								tabIndex="10"
								autoComplete="off"
								className="field field-tag"
								value={this.state.addNewTitle}
								onBlur={()=>this.setState({focus:false})}
								onFocus={this.onAddNewTitleFocus}
								onChange={this.onAddNewTitleChange}
								onKeyDown={this.onAddNewTitleKeydown}
								placeholder={t.s("addTag")+"…"}/>
						</Datalist>

						{this.renderType()}
						{this.renderTags()}
						{this.renderSuggestions()}
						{this.renderNonPro()}
					</ReactCSSTransitionGroup>
				</form>
			</section>
		);
	}
}