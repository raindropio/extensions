require('../css/collections/tree.styl')

import React from 'react'
import t from 't'
import Api from 'api'
import config from 'config'
import Icon from './common/icon'
import scroll from '../helpers/scroll'

var _ = {
	sortBy: require('lodash/sortBy'),
	capitalize: require('lodash/capitalize'),
	findIndex: require('lodash/findIndex')
}

const newElemId = -9999;

import dialogStore from '../stores/dialog'
import collectionsStore from '../stores/collections'

import Item from './collection/item'
import Group from './collection/group'
import ItemMoveZone from './collection/itemMoveZone'
import Examples from './collection/examples'
import onlyPro from '../helpers/onlyPro'

export default class Tree extends React.Component {
	constructor(props) {
		super(props);

		this.onKeyDown = this.onKeyDown.bind(this);
		this.createNewFromExample = this.createNewFromExample.bind(this);
		this.createNewCollectionBySearch = this.createNewCollectionBySearch.bind(this);
		this.onCollectionsChange = this.onCollectionsChange.bind(this);
		this.onUserChange = this.onUserChange.bind(this);
		this.onCollectionClick = this.onCollectionClick.bind(this);

		this.state = {
			loading: false,
			selected: collectionsStore.getCurrentId(),
			items: this.cleanItems(collectionsStore.getCollections()),
			user: UserStore.getUser()
		}
	}

	cleanItems(items) {
		return Object.assign([], items);
	}

	onCollectionsChange(items) {
		this.setState({selected: collectionsStore.getCurrentId(), items: this.cleanItems(items)})
	}

	onUserChange(user) {
        this.setState({user: user});
    }

	componentDidMount() {
		this.unsubscribeCollections = collectionsStore.listen(this.onCollectionsChange);
		this.unsubscribeUser = UserStore.listen(this.onUserChange);

		window.addEventListener('keydown', this.onKeyDown, true);

		setTimeout(()=>window.requestAnimationFrame(()=>this.scrollToElement(this.state.selected)),0)
	}

    componentWillUnmount() {
        this.unsubscribeCollections();
        this.unsubscribeUser();

        window.removeEventListener('keydown', this.onKeyDown, true);
    }

    componentWillReceiveProps(nextProps) {
    	if ((nextProps.find||"").trim() != (this.props.find||"").trim()){
    		var searchResults = [];
    		this.state.items.forEach((c)=>{
				if (c._id>0)
				if (this.checkStringFind(c.title, nextProps.find))
					searchResults.push(c._id);
			});

			switch(searchResults.length) {
				case 1:
					this.setState({selected: searchResults[0]})
				break;

				case 0:
					this.setState({selected: newElemId})
    				setTimeout(()=>this.scrollToElement(newElemId),0);
				break;

				default:
					this.setState({selected: collectionsStore.getCurrentId()})
				break;
			}
    	}
    }

    onGroupClick(id) {
    	UserStore.onToggleGroup({id:id});
    }

    onToggleChildrens(item) {
    	collectionsStore.onUpdateCollection({silent: true, updateBeforeServer: true, item: {
    		_id: item._id,
    		expanded: (item.expanded?false:true)
    	}}, function() {});
    }

    createNewCollectionBySearch() {
    	var _createC = (groupIndex=0)=>{
    		this.setState({loading: true});
    		
    		collectionsStore.onInsertCollection({
	            item: {title: this.props.find, group: groupIndex},
	        }, (cId)=>{
	            if (cId>0){
	                this.props.onSelectCollection({_id: cId}, ()=>{
	                	this.setState({loading: false});
	                });
	                this.props.onCancel();
	            }
	            else
	            	this.setState({loading: false});
	        });
    	}

    	var groups = (this.state.user.groups||[]);
    	if (groups.length<=1)
    		return _createC();

    	var items = groups.map((group)=>{
			return {
				title: group.title,
				id: group.id,

				onClick: (item)=>{
					_createC(item.id);
				}
			}
		})

    	dialogStore.onShow({
    		title: t.s("collectionNew")+' "'+this.props.find+'". ' + t.s("select")+" "+t.s("group").toLowerCase()+":",
			items: items
		})
    }

    createNewFromExample(item) {
    	this.setState({loading: true});

    	collectionsStore.onInsertCollection({
            item: Object.assign(item, {group: 0}),
        }, (cId)=>{
            if (cId>0){
                this.props.onSelectCollection({_id: cId}, ()=>{
                	this.setState({loading: false});
                });
                this.props.onCancel();
            }
            else
            	this.setState({loading: false});
        });
    }

    onKeyDown(e) {
    	if (this.props.focus)
    	switch(e.keyCode) {
    		case 38://top
    			e.preventDefault();
    			e.stopPropagation();
    			this.changeIndex(-1);
    		break;

    		case 40://bottom
    			e.preventDefault();
    			e.stopPropagation();
    			this.changeIndex(1);
    		break;

    		case 37://left
    			this.toggleSelectedChildren(e);
    		break;

    		case 39://right
    			this.toggleSelectedChildren(e);
    		break;

    		case 13://enter
    			e.preventDefault();
    			e.stopPropagation();

    			if (this.state.loading) return;

    			var elem = this.getSelectedElement(this.state.selected);
    			elem.querySelector('.permalink').click();
    		break;
    	}
    }

    toggleSelectedChildren(e) {
    	var selectedId = this.state.selected;
    	var selectedElement = this.getSelectedElement(selectedId);
    	if (!selectedElement)
    		return;

    	var toggle = selectedElement.classList.contains("collapsed") || selectedElement.classList.contains("expanded");
    	if (toggle){
    		e.preventDefault();
    		e.stopPropagation();
    		this.onToggleChildrens(collectionsStore.getCollection(selectedId));
    		setTimeout(()=>this.setState({selected: selectedId}), 150)
    	}
    }

    changeIndex(val) {
    	if (this.state.loading) return;

    	var allItems = document.querySelectorAll('article.collection[data-id]');
    	if (!allItems.length) return;

    	var index = _.findIndex(allItems, (item)=>{
    		return item.classList.contains('active');
    	})
    	var destIndex = index+val;

    	if (typeof allItems[destIndex] == "undefined")
    		destIndex = (val<0 ? allItems.length-1 : 0);

    	var id = parseInt(allItems[destIndex].getAttribute('data-id'));

    	this.setState({selected: id});

    	/*if (id>newElemId)//is not new element
    	{
    		this.setState({loading: true});
    		this.props.onSelectCollection({_id: id}, ()=>{
            	this.setState({loading: false});
            });
    	}*/

    	this.scrollToElement(id);
    }

    getSelectedElement(id) {
    	return document.querySelector('article.collection[data-id="'+id+'"]');
    }

    scrollToElement(id) {
    	var selectedElement = this.getSelectedElement(id),
			itemsElement = this.refs.wrap;

    	if ((itemsElement)&&(selectedElement)){
    		var offset = selectedElement.offsetTop + selectedElement.clientHeight - itemsElement.offsetTop;
    		var wrapPlusHeight = itemsElement.scrollTop+itemsElement.clientHeight;
    		var inVisibleArea = ((offset < wrapPlusHeight)&&(itemsElement.scrollTop<offset))

    		if (!inVisibleArea){
    			var to = parseInt(offset - (itemsElement.clientHeight/2));
    			scroll.scrollTo(itemsElement, to);
    		}
    	}
    }

    onCollectionClick(obj) {
    	this.setState({loading: true});
		this.props.onSelectCollection(obj, ()=>{
        	this.setState({loading: false});
        	this.props.onCancel();
        });
    }

    checkStringFind(original="",query="") {
    	return (original.toLowerCase().trim().indexOf(query.trim().toLowerCase())!=-1)
    }

    renderNonPro() {
    	if ((UserStore.isPro())||(this.props.find))
    		return null;

    	return (
    		<div className="only-in-pro" onClick={()=>onlyPro.showAlert(1)}>
    			<b>{t.s("footerProAd")+" "+t.s("footerProAdD")}</b>
    		</div>
    	);
    }

	render() {
		var haveChildrens = [];
		this.state.items.forEach(function(c){
			if (c.parent)
				if (c.parent["$id"]){
					var id = parseInt(c.parent["$id"]);
					if (haveChildrens.indexOf(id)==-1)
						haveChildrens.push(id)
				}
		});

		var itemIndex=0;
		var makeItem = (item,level,isSearch)=> {
			if (item){
				var isActive = (this.state.selected == item._id);
				var hc = (haveChildrens.indexOf(item._id)!=-1);
				if (isSearch)
					hc=false;

				itemIndex++;
				return <Item
							key={"collection"+itemIndex}
							item={item}
							level={level}
							haveChildrens={hc}
							showPath={isSearch}
							active={isActive}
							onToggleChildrens={(e)=>this.onToggleChildrens(item)}
							onClick={this.onCollectionClick} />;
			}
			return null;
		}

		var makeRootItems = (group, groupIndex)=> {
			var rootItems = [];
			var findChildrens = (parent, level)=> {
				if (parent.expanded||false)
				this.state.items.forEach((c, cIndex)=>{
					if (c.parent)
	                if (c.parent["$id"]==parent._id) {
                		var canAdd = ((c._id||0>0)&&(c.author))

						if (canAdd) {
							rootItems.push(<ItemMoveZone key={"itemMoveZoneL"+groupIndex+"_"+level+"_"+cIndex} _id={c._id} parent={c.parent} sort={c.sort} level={level} />);
		                    rootItems.push(makeItem(c,level));
		                    findChildrens(c, level+1);
		                }
	                }
	            });
			}

			if (!group.hidden){
				(group.collections||[]).forEach((rootItem, rootItemIndex)=>{
					var tempC = collectionsStore.getCollection(rootItem);
					if (tempC){
						var canAdd = ((tempC._id||0>0)&&(tempC.author));

						if (canAdd){
							rootItems.push(<ItemMoveZone key={"itemMoveZoneG"+groupIndex+"_"+rootItemIndex} _id={tempC._id} parent={tempC.parent} sort={tempC.sort} level={0} />);
							rootItems.push(makeItem(tempC, 0));

							findChildrens(tempC, 1);
						}
					}
				});
			}

			if ((rootItems.length==0)&&(!group.hidden))
				rootItems.push(<article key={"noCollections"+groupIndex} className="collection" onClick={this.props.focusInput}>
					<span className="expand"><Icon name="arrow_alt" /></span>
					<Icon name="info" className="collectionIcon" />
					<div className="title">{t.s("createFirstCollection")}</div>
				</article>)

			return rootItems;
		}

		var groups = [];
		if (!this.props.find){
			(this.state.user.groups||[]).forEach((group,groupIndex)=>{
				var groupItem = <Group
									index={groupIndex}
									item={group}
									onToggleGroup={this.onGroupClick} />;

				groups.push(
					<section key={"group"+groupIndex}>
						{groupItem}
						{makeRootItems(group, groupIndex)}
						<ItemMoveZone key={"itemMoveZoneGroup"+groupIndex} group={group.id} level={0} />
					</section>
				);
			});

			/*groups.push(
				<Examples key="examples" fromId={newElemId} selected={this.state.selected} onClick={this.createNewFromExample} />
			);*/
		}

		//SEARCH
		if (this.props.find){
			var findResults = [];

			this.state.items.forEach((c)=>{
				if (c._id>0)
				if (this.checkStringFind(c.title, this.props.find))
					findResults.push(makeItem(c,0,true));
			});

			if (findResults.length)
			groups.push(
				<section key={"findResults"}>
					<div className="group"><div className="title">{t.s("defaultCollection-0")} ({findResults.length})</div></div>

					{findResults}
				</section>
			);

			var newIsActive = (this.state.selected==newElemId);
			groups.push(
				<section key="createNewCollection">
					<div className="group"><div className="title">{t.s("createNewCollection")}</div></div>
					<Item 
						onClick={this.createNewCollectionBySearch}
						item={{title: this.props.find, icon: ('new_collection'+(newIsActive?"_active":"")), _id:newElemId}}
						active={newIsActive} />
				</section>
			);
		}

		return (
			<div className={"collections-tree "+(this.state.loading?"collections-tree-loading":"")+(this.props.find?" searching":"")} ref="wrap">
				{this.renderNonPro()}

				<div className="collections-tree-items">
					{(this.props.find) ? null : <section>{makeItem(collectionsStore.getCollection(-1))}</section>}

					{groups}
				</div>

				
			</div>
		);
	}
}