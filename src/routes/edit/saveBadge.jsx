import React from 'react'
import t from 't'

import CollectionsStore from '../../stores/collections'
import Icon from '../../co/common/icon'

var _ = {
	capitalize: require('lodash/capitalize')
}

export default class SaveBadge extends React.Component {
	render() {
		var collection = {title:""}
		try{collection = CollectionsStore.getCollection(CollectionsStore.getCurrentId())||{title:""}}catch(e){}

		var message = t.s("saved");
		if (this.props.type!="link")
			message = t.s((this.props.type||"link") + "Saved")

		//t.s((this.props.type||"link") + "Saved")
		//_.capitalize(t.s("saved")) + " " + t.s("in") + " " + collection.title
		return (
			<section className="saveBadge">
				<Icon name="saved" />
				<span className="title">{message}</span>
			</section>
		);
	}
}