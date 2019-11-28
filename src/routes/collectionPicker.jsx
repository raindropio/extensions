require('../css/static/collection.styl')

import React from 'react'
import t from 't'
import Collection from './edit/collection'
import CollectionsList from '../co/collections'
import CollectionsStore from '../stores/collections'

import bookmarkActions from '../actions/bookmark'
import bookmarkStore from '../stores/bookmark'

import ThemeColor from '../co/common/themeColor'
import ThemeColorHelper from '../helpers/themeColor'

export default class CollectionsPicker extends React.Component {
	constructor(props) {
		super(props);

		this.handleBookmarkChange = this.handleBookmarkChange.bind(this);
		this.cancelCollectionSelect = this.cancelCollectionSelect.bind(this);
		this.onSelectCollection = this.onSelectCollection.bind(this);

		this.state = this.prepareBookmark(props)
	}

	prepareBookmark(props) {
		return {
			linkBack: 		"/edit/"+props.params.id+"?already=1&anim=appeartop",
			item: 			bookmarkStore.getItem()||{},
			anim: 			""
		}
	}

	componentDidMount() {
		bookmarkStore.onLoadId(this.props.params.id);
	}

	handleBookmarkChange(obj, callback) {
    	bookmarkActions.update(obj, callback);
    }

	cancelCollectionSelect() {
		this.setState({anim: "closing"});
		setTimeout(()=>window.location.hash = ("#"+this.state.linkBack),100)
    }

    onSelectCollection(item, callback) {
    	var id = item._id||-1;
    	CollectionsStore.onSetCurrent(id);
    	this.handleBookmarkChange({collectionId:id}, callback);
    }

	render() {
		return (
			<div className={"collection-page anim-"+this.state.anim}>
				<ThemeColor collectionId={this.state.item.collection.$id} cssBlock={ThemeColorHelper.generateCSS} />
				<CollectionsList
					onCancel={this.cancelCollectionSelect}
					onSelectCollection={this.onSelectCollection} />
 			</div>
 		)
	}
}