import collectionsStore from '../stores/collections'
import t from 't'

var _ = {
    findIndex: require('lodash/findIndex')
}

export default {
    createBlank(item,params,callback) {
        params = params || {};

        if (typeof params.open == "undefined")
            params.open = true;

        if (!item.title)
            item.title = t.s("untitled");

        if ((item.parentId)&&(!UserStore.isPro()))
            return window.location.hash = "#/settings/upgrade";

        collectionsStore.onInsertCollection({
            item: item,
            silent: true
        }, (_id)=>{
            if (item.parentId)
                collectionsStore.onUpdateCollection({silent: true, item: {
                    _id: item.parentId,
                    expanded: true
                }}, function() {});

            if (params.open)
                window.location.hash="#/collection/"+_id;

            if (typeof callback == "function")
                callback(_id);
        })
    },

    createBlankGroup(item) {
        item = item || {};
        if (!item.title)
            item.title = t.s("untitled");

        UserStore.onInsertGroup({
            item: item,
            silent: true
        }, (_id)=>{
            
        })
    },

    canMoveTo(fromId,toId) {
        //find destination item (to)
        var collections = collectionsStore.getCollections();
        var index = _.findIndex(collections, {_id: toId});
        if (index == -1) return false;
        if (!collections[index].parent) return true;

        var to = collections[index];

        if (to.parent){
            if (to.parent.$id==fromId)
                {return false;}
            
            var targetIsChild = false;
            var checkIsChild = (cId)=>{
                var index = _.findIndex(collections, {_id: cId});
                if (index!=-1) if (collections[index].parent){
                    if (collections[index].parent.$id == fromId)
                        targetIsChild = true;
                    else
                        checkIsChild(collections[index].parent.$id);
                }
            }
            
            checkIsChild(to._id);
            if (targetIsChild) {return false;}
        }

        return true;
    },

	remove(item, onSuccess) {
		var lastId = item._id;

    	collectionsStore.onRemoveCollection({
            item: item
        }, (result)=>{
            if (result){
                if (collectionsStore.getCurrentId() == lastId){
                    setTimeout(()=>{
                        window.location.hash="#/collection/0";
                    },100)
                }

                if (typeof onSuccess == "function") onSuccess();
            }
        });
	},

    cleanTrash() {
        collectionsStore.onRemoveCollection({
            item: collectionsStore.getCollection(-99),
            silent: true
        }, ()=>{

        })
    }
}