import React from 'react'
import t from 't'

import CollectionsStore from '../../stores/collections'
import colors from '../../modules/colors'

import CollectionIcon from '../../co/collection/icon'
import Icon from '../../co/common/icon'

var _ = {
	capitalize: require('lodash/capitalize')
}

export default class Collection extends React.Component {
	constructor(props) {
		super(props);

		this.state = this.prepareState()
	}

	prepareState() {
		return {
			collection: CollectionsStore.getCollection(CollectionsStore.getCurrentId())
		}
	}

	onCollectionsChange() {
		this.setState(this.prepareState())
	}

	componentDidMount() {
		this.unsubscribeCollections = CollectionsStore.listen(this.onCollectionsChange.bind(this));
	}

	componentWillUnmount() {
        this.unsubscribeCollections();
    }

	render() {
		if (!this.state.collection)
			return <figure className="bookmarkCollection" />;

		var src;
		try{src = this.state.collection.cover[0]}catch(e){}

		var title = _.capitalize(t.s("addSuccess")) + " " + t.s("to");
		if (this.props.already)
			title = _.capitalize(t.s("already")) + " " + t.s("in");

		return (
			<span className="bookmarkCollection back-side">
				<CollectionIcon src={src} _id={this.state.collection._id} />

				<span className="text">
					<span className="status">{title}</span>&nbsp;
					<span className="title">{this.state.collection.title}</span>
					<span className="arrowIcon"><Icon name="arrow" micro /></span>
				</span>
			</span>
		)
	}
}