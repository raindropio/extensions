import React from 'react'
import CollectionsStore from '../../stores/collections'

export default class ThemeColor extends React.PureComponent {
	displayName: "common/themeColor"

	themeColor(c) {
		return {__html:this.props.cssBlock(c)}
	}

	render() {
		if (!this.props.collectionId)
			return null;

		const collection = CollectionsStore.getCollection(this.props.collectionId)
		if (!collection || !collection.color)
			return null

		return (
			<div>
				<style dangerouslySetInnerHTML={this.themeColor(collection.color)}/>
			</div>
		);
	}
}