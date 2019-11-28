require('../../css/edit/edit.styl')

import React from 'react'
import t from 't'
import network from 'network'
import initAuth from '../../helpers/initAuth'
import bookmarkStore from '../../stores/bookmark'
import bookmarkActions from '../../actions/bookmark'
import CollectionsStore from '../../stores/collections'
import extensionHelper from '../../helpers/extension'

import Collection from './collection'
import ThemeColor from '../../co/common/themeColor'
import ThemeColorHelper from '../../helpers/themeColor'
import Loading from '../../co/loading'
import Info from './info'
import Tags from './tags2'

import Footer from './footer'

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this.handleBookmarkChange = this.handleBookmarkChange.bind(this);
		this.goTo = this.goTo.bind(this);
		this.buttonCollectionSelect = this.buttonCollectionSelect.bind(this);

		this.state = Object.assign({
			forceShowCollections: 	(network.getSearchParam('modal') ? true : false),
			showCollections: 		false,
			already: 				(props.location.query.already ? true : false),
			anim: 					(props.location.query.anim ? props.location.query.anim : ""),
		},this.prepareBookmark());
	}

	prepareBookmark() {
		var item = bookmarkStore.getItem()||{},
			collectionId = -1;

		try{collectionId = parseInt(item.collection.$id)}catch(e){}

		extensionHelper.setStatus({
			url: item.link,
			saved: (collectionId!=-99),
			loading: false
		})

		return {
			collectionId: 	collectionId,
			status: 		bookmarkStore.getStatus(),
			suggestedTags: 	bookmarkStore.getSuggestedTags(),
			item: 			item
		}
	}

	onBookmarkChange() {
		var obj = this.prepareBookmark()
		this.setState(obj);

		CollectionsStore.onSetCurrent(obj.collectionId);
	}

	componentDidMount() {
		CollectionsStore.onSetCurrent(this.state.collectionId);

		if (!initAuth.loaded)
			initAuth.checkStatus();

		this.unsubscribeBookmark = bookmarkStore.listen(this.onBookmarkChange.bind(this));

		bookmarkActions.loadId(this.props.params.id);

		if (this.refs.selectCollection)
			this.refs.selectCollection.focus()
	}

	componentWillUnmount() {
		extensionHelper.setStatus({
			url: this.state.item.link,
			saved: (this.state.collectionId!=-99),
			loading: false
		})

        this.unsubscribeBookmark();
    }

    handleBookmarkChange(obj, callback) {
    	bookmarkActions.update(obj, callback);
    }

    goTo(url, withAnim = false) {
    	if (withAnim){
    		this.setState({anim: "closing"});
    		//setTimeout(()=>window.location.hash = ("#"+url),150)
    	}
    	//else
    		window.location.hash = ("#"+url)
    }

    buttonCollectionSelect(e) {
    	var open = false;
    	if (e.keyCode){
    		if (e.keyCode == 13)
    			open = true;
    	}
    	else
    		open = true;

    	if (open)
    		this.goTo('/collection/'+this.state.item._id, true)
    		//this.setState({showCollections:true})
    }

    renderCollection() {
    	return (
    		<a ref="selectCollection" className="ce-actions" tabIndex="1" autoFocus onClick={this.buttonCollectionSelect} onKeyPress={this.buttonCollectionSelect}><span className="card">
				<Collection already={this.state.already} />
			</span></a>
    	);
    }

	render() {
		if ((this.state.status=="loading")||(!this.state.status))
			return <Loading />;

		//configure
		var className = "edit-page edit-page-"+(this.state.anim||"");
		if (this.state.already)
			className += " edit-page-already";
		if (this.state.showCollections)
			className += " edit-page-show-collections";

		var footer = <Footer collectionId={this.state.collectionId} important={this.state.item.important} onChange={this.handleBookmarkChange} />;

		//is removed
		if (this.state.collectionId==-99)
			return (
				<div className={className}>
					<div className="page">
						<h1>{t.s(this.state.item.type+"RemovedPermament")}</h1>
					</div>

					{footer}
				</div>
			);

		return (
			<div className={className}>
				<ThemeColor collectionId={this.state.item.collection.$id} cssBlock={ThemeColorHelper.generateCSS} />

				{this.renderCollection()}
				<div className="edit-page-about">
					<Info {...this.state.item} goTo={this.goTo} onChange={this.handleBookmarkChange} />
					<Tags {...this.state.item} suggestedTags={this.state.suggestedTags} onChange={this.handleBookmarkChange} />

					{/*<div className="edit-page-separator" />*/}
				</div>
				
				{footer}
			</div>
		);
	}
}