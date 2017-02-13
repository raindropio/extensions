import {createStore} from 'reflux'
import actions from '../actions/dialog'

var _state = {}

export default createStore({
	listenables: actions,

	onShow(params) {
		_state = params;
		this.trigger(_state);
	},

	onClose() {
		_state = {};
		this.trigger(_state);
	}
})