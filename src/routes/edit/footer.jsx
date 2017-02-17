import React from 'react'
import t from 't'
import Button from '../../co/common/button'
import Icon from '../../co/common/icon'

import bookmarkActions from '../../actions/bookmark'

var _ = {
	capitalize: require('lodash/capitalize')
}

export default class Footer extends React.Component {
	constructor(props) {
		super(props);

		this.removeRestore = this.removeRestore.bind(this);
		this.onToggleImportant = this.onToggleImportant.bind(this);

		this.state = this.prepareState(props);
	}

	prepareState(props) {
		return {
			isRemoved: (props.collectionId == -99)
		}
	}

	componentWillReceiveProps(nextProps) {
    	this.setState(this.prepareState(nextProps))
    }

	removeRestore() {
		if (this.state.isRemoved)
			bookmarkActions.restore();
		else
			bookmarkActions.remove();
	}

	onToggleImportant() {
		this.props.onChange({important: !this.props.important});
	}

	renderImportantButton() {
		if (this.state.isRemoved)
			return null;
		
		var favPrefix = t.s("add") +" " + t.s("to");
        if (this.props.important)
            favPrefix = t.s("remove")+" "+t.s("from");

        return (
        	<Button className="button link accent" tabIndex="1001" onClick={this.onToggleImportant} onKeyDown={(e)=>this.onEnter(e,()=>this.onToggleImportant())} title={favPrefix + " " + t.s("favoriteSites").toLowerCase()}>
        		<Icon name={"like"+(this.props.important?"-active":"")} />
        	</Button>
       	); 
	}

	render() {
		return (
			<section className="footer">
				<Button className="button link accent" tabIndex="1000" onClick={this.removeRestore}>
					{this.state.isRemoved ? t.s("restore") : <Icon name="remove" />}
				</Button>

				{this.renderImportantButton()}

				<div className="max"/>

				<Button href="https://raindrop.io" target="_blank" className="button link" tabIndex="1002">
					{t.s("myAccount")}
				</Button>

				<Button className="button gray accent"  tabIndex="1010" icon="config,normal" href="#/settings" />
			</section>
		);
	}
}