import React from 'react'
import Icon from './common/icon'

export default class Httpload extends React.Component {
	timeout: null

	constructor(props) {
		super(props);

		this.state = {
			show: false
		}

		this.onCount = this.onCount.bind(this);
	}

	onCount(e) {
		var count = e.detail;
		clearTimeout(this.timeout)
		var show = (count>0);

		if (show != this.state.show)
			this.setState({show: show});

		if (show)
			this.timeout = setTimeout(()=>{
				this.setState({show: false});
			}, 3000)
	}

	componentDidMount() {
		window.addEventListener('httpcount', this.onCount);
	}

	componentWillUnmount() {
		window.removeEventListener('httpcount', this.onCount);
	}

	render() {
		if (!this.state.show) return false;
		
		return (
			<div id="httpload"><Icon name="indicator" micro/></div>
		);
	}
}