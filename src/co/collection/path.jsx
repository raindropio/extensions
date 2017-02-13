import React from 'react'
import collectionsStore from '../../stores/collections'

export default class Path extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.state = this.prepareState(props);
	}

	prepareState(props) {
		if (this.state.id == props.id)
			return this.state;

		var parents = [], ids=[props.id];
		var allCollections = collectionsStore.getCollections();

		var findParents = function (id) {
            allCollections.forEach(function (item) {
                if (id == item._id) {
                    if (item._id != props.id)
                        parents.push(item.title);

                    if (item.parent){
	                    ids.push(item.parent.$id);
	                    findParents(item.parent.$id);
	                }
                }
            });
        }
        findParents(ids[0]);

        parents.reverse();

		return {
			id: props.id,
			parents: parents
		}
	}

	componentWillReceiveProps(props) {
		this.setState(this.prepareState(props));
	}

	renderItem(item, index) {
		return <span className="collection-path-item" key={index}>{item}<span className="collection-path-separator">&middot;</span></span>
	}

	render() {
		if (!this.state.parents.length)
			return null;

		return (
			<div className="collection-path">
				{this.state.parents.map(this.renderItem)}
			</div>
		);
	}
}