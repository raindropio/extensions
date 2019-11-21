import extensionConfig from './config'

var {extension, getCurrentTab, browserName} = require('./extension').default
var ids = {}

const Notify = {
	getID(id) {
		if (typeof ids[id] == "undefined")
			return {id:0,type:0};

		return ids[id];
	},

	hashId(id, prefix='') {
		return prefix+id
	},

	getGrant(callback) {
		if (__PLATFORM__=="firefox")
			return callback(true);

		try{
			extension.notifications.getPermissionLevel(function(level){
				if (level!="granted")
					throw new Error("no access");
				callback(true);
			})
		}catch(e){
			if (e){
				console.log(e);
				callback(false);
			}
		}
	},

	show(_options, _originalId="empty", _prefix="") {
		var _id = Notify.hashId(_originalId, _prefix)
		ids[_id] = {
			id: _originalId,
			type: _prefix
		};

		this.getGrant((granted)=>{
			if (!granted)return;

			var options = Object.assign({
				type: _options.type||"basic",
				iconUrl: 'assets/icon-'+extensionConfig.notificationIconSize+'.png',
				//priority: 2
			}, _options);

			//buttons supported only on chrome
			if (__PLATFORM__!="chrome"){
				if (typeof options.buttons != "undefined")
					delete options.buttons;
			}

			extension.notifications.create(_id, options)
		})
	},

	close(_id, callback) {
		if (_id)
			extension.notifications.clear(_id, callback)
		else
			typeof callback == 'function' && callback()
	}
}

export default Notify