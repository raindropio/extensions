import Reflux from 'reflux'
import Api from 'api'
import t from 't'
import strings from '../modules/strings'
var ls = {};
var _ = {
  findIndex: require('lodash/findIndex'),
  sortBy: require('lodash/sortBy')
}

import Toasts from '../actions/toast'
import CollectionsActions from '../actions/collections'

import UserActions from '../actions/user'
import StatsStore from '../stores/stats'

var _collections = [], _currentId = null, _loaded = false, _speed = "sync";

var _defaults = [
    {
        _id: 0,
        title: t.s("all"),
        view: "list"
    },
    {
        _id: -2,
        title: t.s("speedDial"),
        view: "simple",
        //color: "243,73,94"
    },
    {
        _id: -1,
        title: t.s("defaultCollection--1"),
        view: "list",
        //color: "245,166,35"
    },
    {
        _id: -99,
        title: t.s("defaultCollection--99"),
        view: "list"
    },

    {
        _id: -3,
        title: t.s("articles"),
        view: "list"
    },

    {
        _id: -4,
        title: t.s("images") + " " + t.s("und") + " " + t.s("videos").toLowerCase(),
        view: "masonry"
    },
];

var CollectionsStore = Reflux.createStore({
    init: function() {
        // Here we listen to actions and register callbacks
        this.listenTo(CollectionsActions.load, this.onLoad);
        this.listenTo(CollectionsActions.setCurrent, this.onSetCurrent);
        this.listenTo(CollectionsActions.updateCollection, this.onUpdateCollection);
        this.listenTo(CollectionsActions.insertCollection, this.onInsertCollection);
        this.listenTo(CollectionsActions.removeCollection, this.onRemoveCollection);
        this.listenTo(CollectionsActions.updateCountCollection, this.onUpdateCountCollection);
        this.listenTo(CollectionsActions.updateColorCollection, this.onUpdateColorCollection);
    },

    _resortAll: function() {
        _collections = _.sortBy(_collections, function(item){
            return item.sort;
        });
    },

    _saveCache: function() {
        /*switch(_speed){
            case "async":
                try{ls.setItem('collections', _collections).then(function(){}).catch(function(e){})}catch(e){};
            break;

            case "sync":
                Api.setItem('collections', JSON.stringify(_collections));
            break;
        }*/
    },

    onLoad: function(params,callback) {
        var _this = this;

        if (!_loaded) {
            Promise.all([
                    new Promise(function(resolve,reject){
                        Api.get("collections", function(json) {
                            if (!json.result)
                                return reject('result false');

                            resolve(json.items||[]);
                        });
                    }),
                    new Promise(function(resolve,reject){
                        Api.get("childrens", function(json) {
                            if (!json.result)
                                return reject('result false');
                            
                            resolve(json.items||[]);
                        });
                    })
                ])
                .then(function(results){
                    _collections = results[0].concat(results[1]);
                    _this._insertDefaults();

                    _loaded = true;
                    _this._resortAll();
                    _this.trigger(_collections);
                    _this._saveCache();

                    UserStore._checkGroupsStability();

                    try{window.Intercom('update', {collections: _collections.length})}catch(e){}
                    if (typeof callback == 'function') return callback(true);
                })
                .catch(function(e){
                    //Toasts.show({text: "Can't load collections. Please try again.", title: t.s("Error"), status: "error", timeout:0});
                    if (typeof callback == 'function') return callback(false);
                })
        }else
            if (typeof callback == 'function') return callback(_loaded);
    },

    onLoadId: function(id, callback) {
        var _this = this;
        var index = _.findIndex(_collections, { _id: id });
        if (index==-1)
        Api.get("collection/"+id, function(json){
            if (json.result) {
                _this._updateOrInsertItem(json.item);
                _this._resortAll();
                _this.trigger(_collections);
            }

            if (typeof callback == 'function')
                callback();
        });else{
            if (typeof callback == 'function')
                callback();
        }
    },

    onSetCurrent: function(id, params) {
        params = params || {};

        if (!params.dontSaveLastId)
            UserStore.onUpdateConfig({'last_collection': parseInt(id)});

        if (id == null){
            _currentId = null;
            this.trigger(_collections);
            return;
        }

        _currentId = parseInt(id);

        var index = _.findIndex(_collections, { _id: _currentId });
        if (index!=-1)
            this.trigger(_collections);
        else
            this.onLoadId(_currentId);
    },

    onUpdateCollection: function(params, callback){
        var _this = this, updateGroups = false;

        params.item._id = parseInt(params.item._id);

        if (typeof params.updateModel == "undefined")
            params.updateModel = true;

        if ((typeof params.item.group == 'number')||(typeof params.item.parentId == 'number'))
            updateGroups = true;

        if (typeof params.item.group == 'number') {
            params.item.parentId = "root";
        }else{
            delete params.item.group;
        }

        Api.put("collection/" + params.item._id, params.item, function (json) {
            if (json.result) {
                _this._updateOrInsertItem(json.item);

                if (updateGroups)
                    UserActions.updateCollection({_id: params.item._id, group: params.item.group});

                if (!params.silent)
                    Toasts.show({text: t.s("saveSuccess"), title: params.item.title});
            }else{
                if (!params.silent)
                    Toasts.show({text: strings.getErrorFromJSON(json), title: params.item.title, status: "error"});
            }

            _this._resortAll();
            _this.trigger(_collections);
            _this._saveCache();

            if (typeof callback == 'function')
                callback((json.item || [])._id || false);
        });

        var index = _.findIndex(_collections, { _id: params.item._id});

        if ((index!=-1)&&(params.updateModel)) {
            if (params.updateBeforeServer){
                for(var i in params.item)
                    _collections[index][i] = params.item[i];

                this.trigger(_collections);
            }

            if (_collections[index]._id <= 0){
                for(var i in params.item)
                    Api.setItem("collection/" + params.item._id + "/" + i, params.item[i]);
            }
        }
    },

    onInsertCollection: function(params, callback){
        var _this = this;

        Api.post("collection", params.item, function(json){
            if (json.result){
                _collections.push(json.item);

                if (typeof params.item.group == 'number') {
                    params.item.parentId = "root";
                    UserActions.updateCollection({_id: json.item._id, group: params.item.group});
                }

                if (!params.silent)
                    Toasts.show({text: t.s("addSuccess"), title: params.item.title});

                _this._resortAll();
                _this.trigger(_collections);
                _this._saveCache();
            }else{
                if (!params.silent)
                    Toasts.show({text: strings.getErrorFromJSON(json), title: params.item.title, status: "error"});
            }

            if (typeof callback == 'function')
                callback( (json.item||[])._id||false );
        });
    },

    onRemoveCollection: function(params,callback) {
        var _this = this;

        var removeNow = function(){
            Api.del("collection/"+params.item._id, function(json){
                if (json.result){
                    if (params.item._id>0){
                        var index = _.findIndex(_collections, {_id:params.item._id});
                        if (index!=-1)
                            _collections.splice(index,1);
                    }

                    Toasts.show({text: (params.item._id != -99 ? t.s("removeCollectionSuccess") : t.s("trashEmpty")), title: params.item.title});

                    _this._resortAll();
                    _this.trigger(_collections);
                    _this._saveCache();
                    
                    UserActions.saveGroups();

                    if (_this.getCurrentId() == params.item._id){
                        
                    }
                }else{
                    Toasts.show({text: strings.getErrorFromJSON(json), title: params.item.title, status: "error"});
                }

                if (typeof callback == 'function')
                    callback( json.result );
            });
        }

        if (!params.silent){
            if (confirm(t.s('collection')+' "'+(params.item.title||"")+'". ' + t.s("collectionDeleteConfirm")))
                removeNow();
            else{
                if (typeof callback == 'function')
                    callback( false );
            }
        }else{
            removeNow();
        }
    },

    onUpdateCountCollection: function(params) {
      var index = _.findIndex(_collections, { _id: parseInt(params._id) });
      if (index!=-1){
        switch(params.count){
          case "+":
            _collections[index].count++;
          break;

          case "-":
            _collections[index].count--;
          break;

          default:
            _collections[index].count = params.count;
          break;
        }

        this.trigger(_collections);
      }
    },

    onUpdateColorCollection: function(params) {
      var index = _.findIndex(_collections, { _id: parseInt(params._id) });
      if (index!=-1){
        _collections[index].color = params.color;
        if ((_collections[index].cover||[]).length>0)
            Api.setItem("collection_color_"+_collections[index].cover[0], params.color);
        this.trigger(_collections);
      }
    },

    getCollections: function() {
        return JSON.parse(JSON.stringify(_collections));
    },

    getCurrentId: function(onlyWhat) {
        if (onlyWhat){
            switch(onlyWhat){
                case "file":
                    if (_currentId<0)
                        if (_currentId<-1)
                            return -1;
                break;
            }
        }
        return _currentId;
    },

    getCollection: function(id) {
        id = parseInt(id);
        var index = _.findIndex(_collections, { _id: id });
        if (index!=-1){
            if (id===0){
                _collections[index].count = StatsStore.getAllCount();
            }else if (id<0){
                _collections[index].count = StatsStore.getCollectionCount(id);
            }

            return this._prepareItem(_collections[index]);
        }
        else
            return null;
    },

    getCount: function() {
      return _collections.length;
    },

    reset: function(params) {
        params = params || {};
        if (typeof params.speed != "undefined")
          _speed = params.speed;
        else
          _speed = "sync";

        _collections=[];
        _currentId = null;
        _loaded = false;

        //if ((_collections.length==0)&&(!_loaded))
        //    this._resetFromCache();
    },

    _saveChildrensSort: function() {
        var iterator = 0;

        this._resortAll();

        for(var i in _collections){
            if (!_collections[i].parent) continue;

            _collections[i].sort = iterator;

            if (UserStore.isLogged())
                CollectionsActions.updateCollection({
                    item: {
                        _id: _collections[i]._id,
                        sort: _collections[i].sort
                    },
                    silent: true,
                    updateModel: false
                });

            iterator++;
        }

        this.trigger(_collections);
        this._saveCache();
    },

    _updateOrInsertItem: function(item) {
        var index = _.findIndex(_collections, { _id: parseInt(item._id) });
        if (index!=-1)
            _collections[index] = item;
        else
            _collections.push(item);
    },

    _insertDefaults: function() {
        var _this = this;
        _defaults.forEach(function(item){
            _this._updateOrInsertItem(item);
        });
    },

    _resetFromCache: function() {
        if (typeof window != "undefined")
        if (window.cacheDisabled||false)
            return;

        switch(_speed){
            case "async":
                var _this = this;
                try{ls.getItem('collections')
                    .then(function (val) {
                        if ((val) && (_collections.length == 0)) {
                            _collections = val;
                            _this._insertDefaults();
                            _this._resortAll();
                            _this.trigger(_collections);
                        };
                    })
                    .catch(function(e){
                    });}catch(e){}
            break;

            case "sync":
                var cache = Api.getItem('collections');
                try{
                    cache = JSON.parse(cache);
                }catch(e){if (e) cache = null;}

                if ((typeof cache == 'object')&&(cache!=null)){
                    _collections = cache;
                    this._insertDefaults();
                }
            break;
        }
    },

    _prepareItem: function(item) {
        if (typeof item.parent != "undefined")
            if (typeof item.parent["$id"] != "undefined") {
                item.parentId = item.parent["$id"];
                delete item.group;
            }

        if (typeof item.parentId == "undefined"){
            var group = UserStore.getCollectionGroup(item._id);
            if (group!=null)
                item.group = parseInt(group);
        }

        //if (item._id<=0)
        //  delete item.count;

        return item;
    },

    _forceUpdate: function() {
        this._resortAll();
        this.trigger(_collections);
    },

    isLoading: function() {
        return !_loaded;
    }
});
//CollectionsStore.reset();

module.exports = CollectionsStore;