import React from 'react'
import ReactDom from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import Api from 'api'
import t from 't'
import config from 'config'
import strings from '../../modules/strings'
import collectionsHelpers from '../../helpers/collections'

import dialogStore from '../../stores/dialog'
import collectionsStore from '../../stores/collections'

import CollectionIcon from './icon'
import Icon from '../common/icon'
import Path from './path'
import onlyPro from '../../helpers/onlyPro'
import EditItem from './edit'

class Item extends React.Component {
	displayName: "collections/item"

	constructor(props) {
		super(props);

		this.openInfo = this.openInfo.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.onClick = this.onClick.bind(this);

		this.state = {
			title: this.props.item.title,
			edit: false
		}
	}

	onToggleChildrens(e,_this) {
		_this.props.onToggleChildrens();
	}

	openInfo() {
		this.setState({edit: true});
	}

	onClick(e) {	
		e.preventDefault();

		if (this.state.edit) return;

		if (typeof this.props.onClick == "function")
			this.props.onClick(this.props.item)
	}

	handleCreateCollection() {
		collectionsHelpers.createBlank({
			parentId: parseInt(this.props.item._id),
		}, {edit: true, open: !this.props.embeded});
	}

	handleRemove() {
		dialogStore.onShow({
			title: t.s('collection')+' "'+(this.props.item.title||"")+'". ' + t.s("collectionDeleteConfirm"),
			items: [
				{title: t.s("remove"), onClick: ()=>{
					collectionsStore.onRemoveCollection({
						item: this.props.item,
						silent: true
					})
				}}
			]
		})
		//collectionsHelpers.remove(this.props.item);
	}

	render() {
		const { 
			isDragging, connectDragSource, connectDragPreview,
			isOver, canDrop, connectDropTarget
		} = this.props;

		var style = {}, className = "collection";
		if (this.props.className)
			className += " "+(this.props.className||"");
		if (this.props.navPrefix!=className)
			className += " "+(this.props.navPrefix||"");
		if ((this.props.active)&&(this.props.item.color))
			style.backgroundColor = this.props.item.color;

		if (this.props.level)
			style.paddingLeft = this.props.level*21;

		if (this.props.haveChildrens){
			if (this.props.item.expanded)
				className += " expanded";
			else
				className += " collapsed";
		}

		if ((isOver)&&(canDrop))
			className += " is-drag-over";
		else if (this.props.active)
			className += " active";

		if (isDragging)
			className += " is-dragging";

		var icon;
		if(this.props.item.icon)
			icon = <Icon name={this.props.item.icon} className="collectionIcon" />;
		else
			icon = <CollectionIcon src={(this.props.item.cover||[])[0]} _id={this.props.item._id} active={this.props.active} />;

		var collectionEditable = ((this.props.item._id||0>0)&&(this.props.item.author));
		//if (this.props.embeded) collectionEditable = false;
		if (collectionEditable)
			className += " have-actions";

		var id = "";
		if (this.props.item._id)
			id = "side-collection-"+this.props.item._id;

		var href = "";
		if (!this.props.onClick)
			href = (this.props.item.link ? this.props.item.link : "#/collection/"+this.props.item._id);

		var content;
		if (this.state.edit){
			collectionEditable=false;
			content = (<EditItem {...{title: this.props.item.title, _id: this.props.item._id}} onClose={()=>this.setState({edit:false})} />)
		}
		else
			content = (
				<div className="title">
					{this.props.showPath ? <Path id={this.props.item._id} /> : null}
					{this.props.subinfo ? <div className="collection-path">{this.props.subinfo}</div> : null}
					{this.props.item.title}
				</div>
			);

		return connectDropTarget(connectDragPreview(connectDragSource(
			<article className={className} style={style} id={this.props.id} data-id={this.props.item._id}>
				<span className="expand" onMouseUp={(e)=>this.onToggleChildrens(e,this)}><Icon name="arrow_alt" /></span>
				{icon}
				{content}
				{this.state.edit ? null : <div className="count">{strings.humanNumber(this.props.item.count)||""}</div>}
				{collectionEditable ? (<div className="actions" id={id}>
					<span onClick={this.openInfo}>{t.s("editMin")}</span>
					<span onClick={this.handleRemove}>{t.s("remove")}</span>
				</div>) : null}

				{this.state.edit ? null : <a
					tabIndex="-1"
					href={href}
					onClick={this.onClick}
					className="permalink" />}
			</article>
		)));
	}
}

const Drag = DragSource(
	"collection",
	//Implements the drag source contract
	{
		canDrag(props, monitor) {
			return (props.item._id>0);
		},

		beginDrag(props) {
			document.getElementById("app").classList.add("is-collection-dragging-mode");

			return {
				_id: props.item._id,
				level: props.level,
				author: props.item.author,
				parent: props.item.parent,
				sort: props.item.sort,
				dragMode: "isDraggingElement"
			};
		},

		endDrag(props, monitor, component) {
			document.getElementById("app").classList.remove("is-collection-dragging-mode");
		}
	},
	//Specifies the props to inject into your component
	function(connect, monitor) {
		return {
			connectDragSource: connect.dragSource(),
			connectDragPreview: connect.dragPreview(),
			isDragging: monitor.isDragging()
		};
	}
)(Item);

export default DropTarget(
	["collection", "element", NativeTypes.FILE, NativeTypes.URL],
	{
		canDrop(props, monitor) {
			//props - TO (destination)
			const item = monitor.getItem(); //FROM (is dragging element)

			switch(monitor.getItemType()){
				case "collection":
					if (!UserStore.isPro())
						return false;
					
					if ((props.item._id<=0)||(!props.item.author))
            			return false;

            		var canMove = collectionsHelpers.canMoveTo(item._id, props.item._id);
					return canMove;
				break;

				case "element":
					if ((props.item._id<=0)||(!props.item.author))
						if ((props.item._id!=-1)&&(props.item._id!=-99))
            				return false;

					return true;
				break;

				default:
					return true;
				break;
			}
		},

		hover(props, monitor, component) {
			
		},

		drop(props, monitor, component) {
			//props - TO (destination)
			const item = monitor.getItem(); //FROM (is dragging element)

			switch(monitor.getItemType()){
				case "collection":
					if (!UserStore.isPro()) {
						onlyPro.showAlert();
						//Toasts.show({text: t.s("onlyInPro"), title: t.s("nestedCollections"), status: "error"});
						return;
					}

					collectionsStore.onUpdateCollection({silent: true, item: {
			    		_id: item._id,
			    		parentId: props.item._id
			    	}}, function() {});

			    	collectionsStore.onUpdateCollection({silent: true, item: {
			    		_id: props.item._id,
			    		expanded: true
			    	}}, function() {});
				break;
			}
		}
	},

	function(connect, monitor) {
		return {
			connectDropTarget: connect.dropTarget(),
			isOver: monitor.isOver(),
			isOverCurrent: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
			itemType: monitor.getItemType()
		};
	}
)(Drag)