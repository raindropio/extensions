import CollectionsStore from '../stores/collections'
window.UserStore = require('../stores/user')

/*
done
error
needLogin
*/

module.exports = {
	timeout: null,
    loaded: false,

	checkStatus(callback) {
		var callbackIsSended = false;

		this.timeout = setTimeout(()=>{
			if (!callbackIsSended){
				callbackIsSended=true;

                if (typeof callback == "function")
				    callback('error')
			}
		},10000);

		Promise.all([
				new Promise(function(resolve,reject){
                    CollectionsStore.onLoad({},(r)=>resolve({collections:r}));
                }),
                new Promise(function(resolve,reject){
                    UserStore.onLoad((r)=>resolve({user:r}));
                })
            ])
            .then((arr)=>{
            	clearTimeout(this.timeout);

            	var results = {};
            	arr.forEach((item)=>{for(var i in item) results[i]=item[i];});
            	
            	//User check
            	switch(results.user){
            		case false:
            			if (!callbackIsSended){
							callbackIsSended=true;

                            if (typeof callback == "function")
							     callback('needLogin');
						}
						return;
            		break;
            	}

            	if ((results.user=="error")||(!results.collections))
            		throw new Error('login error');

				//if (!callbackIsSended){
                    this.loaded = true;
					callbackIsSended=true;

                    if (typeof callback == "function")
					   callback('done')
				//}
            })
            .catch((e)=>{
            	clearTimeout(this.timeout);

            	if (!callbackIsSended){
					callbackIsSended=true;

                    if (typeof callback == "function")
					   callback('error');
				}
            });
	}
}