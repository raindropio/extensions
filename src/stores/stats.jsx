import Reflux from 'reflux'
import Api from 'api'
var ls = {};

var _ = {
  findIndex: require('lodash/findIndex')
}

var StatsActions = require('../actions/stats');
var CollectionsActions = require('../actions/collections');

var _stat = {}, _loading = false, _all = 0, _loaded = false;

var StatsStore = Reflux.createStore({
    init: function() {
        // Here we listen to actions and register callbacks
        this.listenTo(StatsActions.load, this.onLoad);
        this.listenTo(CollectionsActions.updateCountCollection, this.onUpdate);
    },

    onLoad: function() {
    	var _this = this;

    	if (_loading)
    		return;

        try{ls.getItem("stat")
            .then(function (val) {
                if ((val) && (!_loaded)) {
                    _stat = val;
                    _this._countAll();
                    _this.trigger(_stat);
                }
            })
            .catch(function(e){
                            
            });}catch(e){}

    	_loading = true;
    	Api.get("stat", function(json) {
    		if (json.result){
	    		_stat = json.items;
	    		_this._countAll();
                try{ls.setItem("stat", _stat).then(function(){}).catch(function(e){})}catch(e){};
	    		_this.trigger(_stat);
	    	}

            _loading = false;
            _loaded = true;
    	});
    },

    onUpdate: function(params) {
        var index = _.findIndex(_stat, {_id: params._id});

        switch(params.count){
          case "+":
            if (params._id!=-99) _all++;
            if (index!=-1) _stat[index].count++;
            this.trigger(_stat);
          break;

          case "-":
            if (params._id!=-99) _all--;
            if (_all<0)
                _all = 0;

            if (index!=-1) {
                _stat[index].count--;
                if (_stat[index].count<0)
                    _stat[index].count = 0;
            }
            this.trigger(_stat);
          break;
        }
    },

    _countAll: function() {
    	_all = 0;

    	for(var i in _stat)
            if (_stat[i]._id === 0){
    		  _all = parseInt(_stat[i].count||0);
              break;
            }

        if (_all<0) _all = 0;
    },

    getStat: function() {
    	return _stat;
    },

    getAllCount: function() {
    	return _all;
    },

    getCollectionCount: function(id) {
        var index = _.findIndex(_stat, {_id: id});
        if (index!=-1)
            return _stat[index].count;
        else
            return 0;
    }
});

module.exports = StatsStore;