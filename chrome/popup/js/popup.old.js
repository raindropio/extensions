/* Statistics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-45127971-1']);
_gaq.push(['_trackPageview']);
_gaq.push(['_trackEvent', 'extension-' + window.navigator.vendor.substr(0, window.navigator.vendor.indexOf(" ")), 'open']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var InitApp = function($q, $rootScope, $location, $templateCache, $http, localStorageService, $route, Boot) {
    var deferred = $q.defer();

    //Only if first loading
    if (typeof $rootScope.user.me == "undefined") {
        //bridge.getURL(true);

        $http.get('templates/home.html', {cache: $templateCache});
        $http.get('templates/extra/toolbar.html', {cache: $templateCache});
        $http.get('templates/extra/search.html', {cache: $templateCache});

        $rootScope.user.load(function (loaded) {
            if (loaded) {
                if ($rootScope.user.me.config.last_collection>=0) {
                    $http.get('templates/bookmarks.html', {cache: $templateCache});
                    $http.get('templates/extra/tableTitle.html', {cache: $templateCache});
                    $http.get('templates/views/grid.html', {cache: $templateCache});
                    $http.get('templates/views/list.html', {cache: $templateCache});
                }

                $rootScope.collections.items = $rootScope.user.me.groups || [];
                $rootScope.collections.load(function () {
                    //If HOME check last_collectionID
                    if ($route.current.$$route.controller == 'Home') {
                        if ($rootScope.user.me.config.last_collection>=0) {
                            Boot.broadcast('App-Init-Done',true);
                            deferred.reject();
                            $location.path("/bookmarks/" + parseInt($rootScope.user.me.config.last_collection));
                        }
                        else {
                            Boot.broadcast('App-Init-Done',true);
                            deferred.resolve();
                        }
                    }
                    else{
                        Boot.broadcast('App-Init-Done',true);
                        deferred.resolve();
                    }
                });
                $rootScope.collections.reset();
                $rootScope.complete.load();
            } else {
                deferred.reject();
                $location.path('/signin');
            }
        });
    }else{
        deferred.resolve();
    }

    return deferred.promise;
}

/* Application */
var app=angular.module('popup', ['dndLists', 'ngRoute', 'ngAnimate', 'pascalprecht.translate', 'pasvaz.bindonce', 'popup.services', 'monospaced.elastic', 'infinite-scroll', 'LocalStorageModule'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller:'Home',
                templateUrl:'templates/home.html',
                //reloadOnSearch: false,
                resolve: {
                    InitApp: InitApp
                }
            })
            .when('/bookmarks/:cId', {
                controller:'Bookmarks',
                templateUrl:'templates/bookmarks.html',
                reloadOnSearch: false,
                resolve: {
                    InitApp: InitApp
                }
            })
            .when('/bookmark/:cId?/:bId?', {
                controller:'Bookmark',
                templateUrl:'templates/bookmark.html',
                resolve: {
                    InitApp: InitApp
                }
            })
            .when('/collection/:cId?', {
                controller:'Collection',
                templateUrl:'templates/collection.html',
                resolve: {
                    InitApp: InitApp
                }
            })
            .when('/settings', {
                controller:'Settings',
                templateUrl:'templates/settings.html',
                resolve: {
                    InitApp: InitApp
                }
            })

            .when('/signin', {
                controller:'SignIn',
                templateUrl:'templates/signin.html'
            })
            .when('/signup', {
                controller:'SignUp',
                templateUrl:'templates/signup.html'
            })

            .when('/help', {
                controller:'Help',
                templateUrl:'templates/help.html'
            })


            /*.when('/fastsave', {
             controller:'FastSave',
             templateUrl:'templates/fastsave.html',
             resolve: {
             InitApp: InitApp
             }
             })*/


            .otherwise({
                redirectTo:'/'
            });
    })
    .config(["$translateProvider", function($translateProvider) {
        for(var lang in languages){
            $translateProvider.translations(lang, languages[lang]);
        }
        delete languages;
    }])
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension|safari-extension|resource|file):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|safari-extension|data|resource|file):/);
        }
    ])

    /*
     -	-	G L O B A L 	-	-	-
     */
    .run(function($rootScope, $translate, localStorageService, $route, Api, $timeout, Boot, $location, translateFilter, Bookmark, $document, $animate) {
        $rootScope.environment = environment;

        $rootScope.$on('$locationChangeSuccess', function(){
            try{
                angular.element(document).find('body').attr('data-controller', $route.current.$$route.controller);
            } catch(e){}
            Boot.broadcast('App-Init-Done',true);
        });

        //User
        $rootScope.user = {
            //me: [],
            lists: {},
            load: function(callback) {
                Api.get("user", function(json) {
                    if (json.result){
                        $rootScope.user.me = json.user;
                        $rootScope.user.setConfigs();

                        callback(true);
                    }
                    else{
                        callback(false);
                    }
                });
            },

            setLanguage: function(forceLang) {
                var lang = 'en_US';
                if (typeof forceLang == 'undefined') {
                    //language
                    lang = (navigator.language || navigator.systemLanguage || navigator.userLanguage || 'en').substr(0, 2).toLowerCase();

                    if (localStorageService.get('lang'))
                        lang = localStorageService.get('lang');
                }else{
                    lang = forceLang;
                }

                //set language
                if ((lang == "ru") || (lang == "ru_RU"))
                    lang = 'ru_RU';
                else
                    lang = 'en_US';

                try {
                    $rootScope.user.me.config.lang = lang;
                }catch(e){}

                $translate.uses(lang);
                localStorageService.set('lang', lang);
            },

            setConfigs: function() {
                //configs
                if (typeof $rootScope.user.me.config != 'undefined') {
                    if (typeof $rootScope.user.me.config.lang != 'undefined')
                        $rootScope.user.setLanguage($rootScope.user.me.config.lang);
                    else
                        $rootScope.user.me.config.lang = localStorageService.get('lang');

                    if (typeof $rootScope.user.me.config.ex_disable_animation != 'undefined') {
                        $animate.enabled(false);
                        angular.element(document).find('body').addClass('disable-animation');
                    }
                    else{
                        $animate.enabled(true);
                        angular.element(document).find('body').removeClass('disable-animation');
                    }

                    bridge.setConfig({
                        name: 'ex_close_on_page_click',
                        value: (typeof $rootScope.user.me.config.ex_close_on_page_click != 'undefined')
                    });
                }
                else
                    $rootScope.user.me.config = {};
            }
        };
        $rootScope.user.setLanguage();

        //Collections
        $rootScope.collections = {
            current: {},
            items: [],
            sort: 'sort',

            contextMenu: [
                [translateFilter('edit'), function ($itemScope) {
                    $location.path('/collection/'+$itemScope.item._id);
                }],
                [translateFilter('shareCollection'), function ($itemScope) {
                    $rootScope.collections.shareCollection($itemScope.item._id);
                }],
                null,
                [translateFilter('remove'), function ($itemScope) {
                    $rootScope.collections.removeItem($itemScope.item._id);
                }]
            ],

            reset: function() {
                for(var i in this.items){
                    this.items[i].hover=false;
                    for(var j in this.items[i].collections)
                        this.items[i].collections[j].hover=false;
                }
                this.current=this.getById(-1);
            },

            defaultGroup: function() {
                $rootScope.collections.items.push({id:'default', index:'0', title:translateFilter('myCollections'), collections: [], sort:-1});
            },

            load: function(callback) {
                var _this = this;
                this.defaultGroup();

                Api.get('collections', function(json){
                    //_this.items=$rootScope.user.me.groups;

                    for(var i in _this.items){
                        var temp = _this.items[i].collections;
                        _this.items[i].collections = [];
                        _this.items[i].index = i;

                        //if (temp.length>0)
                        for(var c in temp)
                            for(var j in json.items)
                                if (json.items[j]._id == temp[c]){
                                    _this.items[i].collections.push(json.items[j]);
                                    json.items[j].added=true;
                                }

                        if ((temp.length==0)&&(_this.items[i].id=='default')){
                            for(var j in json.items)
                                if (!json.items[j].added){
                                    _this.items[i].collections.push(json.items[j]);
                                }

                            if (_this.items[i].collections.length==0)
                                _this.items.splice(i,1);
                        }
                    }

                    if (_this.items.length==0)
                        _this.defaultGroup();

                    callback();
                });
            },
            getById: function(id) {
                for(var i in this.items)
                    for(var j in this.items[i].collections)
                        if (this.items[i].collections[j]._id == id)
                            return this.items[i].collections[j];

                if(id==-1)
                    return {
                        _id: -1,
                        title: translateFilter('defaultCollection--1'),
                        cover: ['img/icon-inbox.png'],
                        view: localStorageService.get('grid-view--1') || 'list',
                        count: 0
                    };
                else if(id==-99)
                    return {
                        _id: -99,
                        title: translateFilter('defaultCollection--99'),
                        cover: ['img/icon-trash.png'],
                        view: localStorageService.get('grid-view--99') || 'list',
                        count: 0
                    };
                else if(id==0)
                    return {
                        _id: 0,
                        title: translateFilter('defaultCollection-0'),
                        cover: ['img/icon-magnifier.png'],
                        view: localStorageService.get('grid-view-0') || 'list',
                        count: 0
                    };
                else
                    return {view:'list', count:0, _id: id, notfound: true}

                return false;
            },
            getCollectionGroup: function(id) {
                var group=undefined;
                for(var i in this.items)
                    for(var j in this.items[i].collections)
                        if (this.items[i].collections[j]._id == id){
                            group = this.items[i].index;
                            break;
                        }
                return group;
            },
            setCurrent: function(id) {
                var temp = this.getById(parseInt(id));
                if (temp.notfound) {
                    var _this = this;
                    Api.get("collection/" + parseInt(id), function (json) {
                        if (json.result) {
                            _this.current = json.item;
                            Boot.broadcast("current-collection-loaded", true);
                        }
                    });
                }
                else {
                    this.current = temp;
                    Boot.broadcast("current-collection-loaded", true);
                }
            },
            setView: function(type, update) {
                if (typeof type == 'undefined')
                    type = 'grid';

                if (typeof update == 'undefined')
                    update = true;

                this.current.view = type;
                if (this.current["_id"] <= 0){
                    update = false;
                    localStorageService.set('grid-view-'+this.current["_id"], type);
                }

                if (update) {
                    Api.update("collection/" + this.current["_id"], {view: type}, function(json) {
                        $rootScope.collections.current.view = type;
                    });
                }
            },
            removeItem: function(id) {
                if (confirm(translateFilter('collectionDeleteConfirm'))) {
                    var _this = this;
                    Api.del("collection/" + id, function(json) {
                        if (json.result){
                            var rootCollection = false;
                            for(var i in _this.items)
                                for(var j in _this.items[i].collections)
                                    if (_this.items[i].collections[j]._id == id) {
                                        _this.items[i].collections.splice(j, 1);
                                        rootCollection=true;
                                    }

                            Boot.broadcast("Notify-Show", {
                                status: 'info',
                                text: translateFilter('removeCollectionSuccess')
                            });

                            if(rootCollection)
                                $location.path( '/' );
                            else
                                Boot.broadcast("collection-remove", id);
                        }
                    });
                }
            },

            saveGroups: function() {
                var temp = JSON.parse(JSON.stringify(this.items));
                for(var i in temp){
                    for(var c in temp[i].collections)
                        temp[i].collections[c] = temp[i].collections[c]._id;
                    delete temp[i].id;
                }

                Api.update("userConfig", {groups: temp}, function(){});
                Boot.broadcast("scrollable-update", true);
            },

            setEditGroup: function(item,mode) {
                if (!mode) {
                    this.creatingNew = false;
                    item.mode = '';
                    this.saveGroups();
                }
                else{
                    item.mode = 'edit';
                    $timeout( function() {
                        $('.edit-group-title:visible').focus();
                    },1);
                }
            },

            newBlankGroup: function(disableEdit, title) {
                this.items.unshift({title: title || translateFilter('untitled'), collections: [], sort:Date.now()*-1, index: this.items.length.toString() });
                if (typeof disableEdit == 'undefined'){
                    this.creatingNew = true;
                    this.setEditGroup(this.items[ 0 ], 'edit');
                }
            },

            removeGroup: function(item) {
                if (item.collections.length>0){
                    Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('removeGroupError')});
                }
                else{
                    for(var i in this.items)
                        if (this.items[i].index == item.index){
                            this.items.splice(i,1);
                            break;
                        }
                    this.saveGroups();
                }

                if (this.length==0)
                    this.defaultGroup();
                $rootScope.actions.apply($rootScope);
            },

            moveGroup: function(item,dir) {
                function compare(a,b) {
                    if (a.sort < b.sort)
                        return -1;
                    if (a.sort > b.sort)
                        return 1;
                    return 0;
                }

                this.items.sort(compare);

                for(var i in this.items)
                    this.items[i].sort = parseInt(i);

                for(var i in this.items)
                    if (this.items[i].index==item.index){
                        if (dir=='bottom'){
                            this.items[parseInt(i)+1].sort=this.items[i].sort;
                            this.items[i].sort++;
                        }
                        else{
                            this.items[parseInt(i)-1].sort=this.items[i].sort;
                            this.items[i].sort--;
                        }

                        break;
                    }

                this.saveGroups();
            },

            shareCollection: function(id) {
                if (typeof id != 'undefined') {
                    var _this = this;
                    Api.get("collection/"+id, function(json){
                        _this.lastCollection = json.item;
                    });
                }
                else
                    this.lastCollection = this.current;
                Boot.broadcast("Modal-Show", {src:'share'});
            },

            openShareLink: function(social) {
                var links = {
                    twitter: {
                        url: 'https://twitter.com/intent/tweet?url={url}&text={title}&via=raindrop_io',
                        width: 600,
                        height: 450
                    },
                    facebook: {
                        url: 'https://www.facebook.com/sharer/sharer.php?u={url}',
                        width: 600,
                        height: 500
                    },
                    vk: {
                        url: 'https://vk.com/share.php?url={url}&title={title}',
                        width: 550,
                        height: 330
                    },
                    google: {
                        url: 'https://plus.google.com/share?url={url}',
                        width: 700,
                        height: 500
                    }
                };

                var url = 'https://raindrop.io/collection/'+this.lastCollection._id;
                links[social].url = links[social].url.replace('{url}', encodeURIComponent(url)).replace('{title}', this.lastCollection.title);

                var left = Math.round(screen.width / 2 - links[social].width / 2);
                var top = 0;
                if (screen.height > links[social].height) {
                    top = Math.round(screen.height / 3 - links[social].height / 2);
                }

                var win = window.open(links[social].url, "share-oblako", 'left=' + left + ',top=' + top + ',' + "width=" + links[social].width + ",height=" + links[social].height + ",personalbar=0,toolbar=0,scrollbars=1,resizable=1");
                win.focus();
            },

            updateCollection: function(id, change) {
                var _this = this;
                Api.update('collection/'+id, change, function(json){
                    if(json.result){
                        var item = _this.getById(id);
                        for(var i in change)
                            item[i] = change[i];
                    }
                });
            },

            openCreateNewSubCollection: function() {
                var pro=false;
                if (typeof $rootScope.user.me.pro != 'undefined')
                    if ($rootScope.user.me.pro)
                        pro=true;

                if ((!pro)&&(this.current._id>0)){
                    var url = 'https://raindrop.io/static/pro';
                    if (typeof Shell != 'undefined'){
                        Shell.openExternal(url);
                    }
                    else {
                        var win = window.open(url, '_blank');
                        win.focus();
                    }
                }
                else {
                    window.location=('#/collection?parent=' + this.current._id);
                }
            }
        };

        //Tags
        $rootScope.complete = {
            allCount: 0,
            items: [],
            tags: [],
            load: function() {
                Api.get("stat", function(json) {
                    var i, _results;
                    _results = [];
                    for (i in json.items) {
                        json.items[i].title = translateFilter(json.items[i]._id);
                        json.items[i].val = json.items[i]._id;
                        json.items[i].type = 0;
                        $rootScope.complete.allCount += json.items[i].count;
                        _results.push($rootScope.complete.items.push(json.items[i]));
                    }
                });
                Api.get("sites", function(json) {
                    var i, _results;
                    _results = [];
                    for (i in json.items) {
                        json.items[i].title = json.items[i]._id;
                        json.items[i].val = json.items[i]._id;
                        json.items[i].type = 2;
                        _results.push($rootScope.complete.items.push(json.items[i]));
                    }
                });
                Api.get("tags", function(json) {
                    var i, _results;
                    _results = [];
                    for (i in json.items) {
                        json.items[i].title = json.items[i]._id;
                        json.items[i].val = '#' + json.items[i]._id;
                        json.items[i].type = 1;
                        $rootScope.complete.tags.push(json.items[i]);
                        _results.push($rootScope.complete.items.push(json.items[i]));
                    }
                });
            }
        };

        //Tags
        $rootScope.tags = {
            prepare: function(a) {
                var tags=[];

                for (var i in a)
                    tags.push( {key:'tag',q:a[i],val:a[i]} );

                return tags;
            },

            clear: function(a) {
                var tags = [];
                for (var i in a)
                    tags.push( a[i].val )

                return tags;
            }
        };




        //Searchbox
        $rootScope.searchbox={
            search:[],
            focus:false,
            filter: '',
            add: function(s) {
                Boot.broadcast("extraSearch-Add", s);

                if (this.search.length==0)
                    $rootScope.actions.redirect('/bookmarks/0?search='+encodeURIComponent(JSON.stringify([{
                        key: "tag",
                        val: s,
                        q: s
                    }])));
            }
        };

        //Actions
        $rootScope.actions = {
            loading: false,

            goBack: function() {
                window.history.back();
            },

            apply: function($scope) {
                try {
                    if (!$scope.$$phase)
                        $scope.$apply();
                } catch (_error) {}

                Boot.broadcast("scrollable-update", true);
            },

            openBookmark: function(id) {
                $location.search('bookmark', id);
            },

            redirect: function(url) {
                //$location.path( url );
                window.location.hash = url;
            },

            setSearch: function(s) {
                $location.search(s);
                $rootScope.actions.apply($rootScope);
            },

            close: function() {
                bridge.close();
            },

            bodyClick: function() {
                Boot.broadcast("Notify-Hide");
            },

            hideModal: function() {
                Boot.broadcast("Modal-Hide");
            }
        };

        $document.bind('keyup', function(event) {
            if (event.originalEvent.keyCode == 27)
                $rootScope.actions.close()
        })

        $rootScope.bookmarkWorker = {
            lastSaved: false,

            goToEdit: function(item) {
                if (typeof item.collection != 'undefined') {
                    $location.path( "/bookmarks/" + item.collection['$id'] );
                    $location.search({'bookmark': item._id, 'noAnim': 1});
                }else{
                    Api.get('raindrop/'+item._id, function(json){
                        $location.path( "/bookmarks/" + json.item.collection['$id'] );
                        $location.search({'bookmark': item._id, 'noAnim': 1});
                    });
                }
            },

            //after save
            afterSave: function(json, way){
                //if (way == 'drop')
                $rootScope.actions.loading=false;

                if (json.result){
                    if (way != 'drop')
                        $rootScope.bookmarkWorker.lastSaved = {
                            _id: json.item._id,
                            text: (!json.have ? json.item.type+'Saved' : 'alreadyInCollection' )
                        };

                    if ((typeof $rootScope.bookmarkWorker.afterSavePage != 'undefined')&&(typeof json.disableParse == 'undefined')) {
                        if (json.have) {
                            Boot.broadcast("Notify-Show", {status:'info', text: translateFilter('alreadyInCollection') });
                            $rootScope.bookmarkWorker.goToEdit(json.item);
                        }
                        else{
                            json.item.new=true;
                            $rootScope.bookmarkWorker.afterSavePage(json.item, way);
                        }
                    }
                    else{
                        if ((json.have)&&(way == 'drop')) {
                            Boot.broadcast("Notify-Show", {status:'info', text: translateFilter('alreadyInCollection') });
                            $rootScope.bookmarkWorker.goToEdit(json.item);
                        }
                    }
                }else{
                    if (!json.noError) {
                        Boot.broadcast("Notify-Show", {
                            status: 'error',
                            text: translateFilter('server' + (json.error || ''))
                        });
                    }
                    $location.search({});
                }

                Boot.broadcast("Checked-URL", json);
            },

            //save current page
            saveCurrentPage: Bookmark.saveCurrentPage,
            checkURL: function(url, params) {Bookmark.checkURL(url, this.afterSave, params);},
            setFormData: function(item) {Bookmark.setFormData(item, $rootScope.collections.current._id || -1, this.afterSave);},
            parseURLOtherWay: function(item) {Bookmark.parseURLOtherWay(item, $rootScope.collections.current._id || -1, this.afterSave)},

            //drag and drop url
            dropURL: function(url, collectionId) {
                if ($rootScope.user.me)
                    if (Boot.isURL(url)) {
                        Boot.broadcast("Notify-Hide");
                        Bookmark.saveURLPage(url, collectionId || $rootScope.collections.current._id || -1, this.afterSave);
                        $rootScope.actions.loading=true;
                        $rootScope.actions.apply($rootScope);
                    }
                    else{
                        $location.search({});
                        Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('supportOnlyUrls')});
                    }
            }
        };
    })


    /*
     -	-	H O M E 	-	-	-
     */
    .controller('Home', function($scope, Api, Boot, $timeout, $location, translateFilter, localStorageService) {
        if (typeof $location.search().fastsave == 'undefined')
            bridge.getURL(true);

        Api.update("userConfig", {'last_collection': 'no'}, function(){});

        $scope.ads = {
            lang: localStorageService.get('App-Language'),
            items: [],
            _items: [
                {id:'welcome',color:'pink'},
                {id:'dragndrop',color:'yellow'},
                {id:'social',color:'blue'},
                {id:'search',color:'dark'},
                //{id:'mobile',color:'purple'}
                {id:'android',color:'green'},
                {id:'pro',color:'bluepro'}
            ],
            close: function() {
                localStorageService.set('notification-extension-'+this.items[0].id,true);
                Api.update("userConfig", {notify: true, name: 'ex_'+this.items[0].id}, function(){});

                delete this.items.shift();
                if (this.items.length==0)
                    $timeout(function(){
                        Boot.broadcast("scrollable-update", true);
                    },300);
            }
        };

        $scope.search={
            now: function() {
                $location.path( "/bookmarks/0" );
            }
        }
        $scope.searchbox.search=[];
        $scope.searchbox.filter='';

        //if ($scope.collections.current._id){
        if ($scope.collections.current._id!=-1)
            scrollToElement('cItem-'+$scope.collections.current._id);
        $scope.collections.reset();
        //}

        $scope.$watchCollection('collections.items', function() {
            Boot.broadcast("scrollable-update", true);
        });
        $scope.$watch('user.me.lists', function() {
            Boot.broadcast("scrollable-update", true);
        },true);
        $scope.$watch('raindrops.filter', function() {
            Boot.broadcast("scrollable-update", true);
        });


        //ADS
        if (typeof $scope.user.me.config != 'undefined'){
            for(var i in $scope.user.me.config)
                for(var j in $scope.ads._items) {
                    if ((i == 'ex_' + $scope.ads._items[j].id)||(localStorageService.get('notification-extension-'+$scope.ads._items[j].id)))
                        $scope.ads._items[j].checked = true;
                }
        }

        $scope.ads._items.forEach(function(item){
            if (typeof item.checked == 'undefined')
                $scope.ads.items.push(item);
        });


        $scope.bookmarkWorker.afterSavePage = function(item, way){
            //if (way=='drop')
            /*Boot.broadcast("Notify-Show", {status:'done',
             text: translateFilter(item.type+'Saved')
             + ' ' + translateFilter('in') + ' "' + $scope.collections.getById(item.collection['$id']).title +'"'
             });
             $location.path('/bookmark/'+item.collection['$id']+'/'+item._id);
             $location.search('noAnim', 1);*/
            Boot.broadcast("Notify-Show", {status:'done',
                text: translateFilter(item.type+'Saved')
                //+ ' ' + translateFilter('in') + ' "' + $scope.collections.getById($routeParams.cId).title +'"'
            });
            $scope.bookmarkWorker.goToEdit(item);
        };
    })


    /*
     -	-	B O O K M A R K S 	-	-	-
     */
    .controller('Bookmarks', function($scope, Api, Boot, $timeout, $routeParams, translateFilter, $location) {
        if (typeof $location.search().fastsave == 'undefined')
            bridge.getURL(true);

        Api.update("userConfig", {'last_collection': $routeParams.cId}, function(){});
        $scope.collections.setCurrent($routeParams.cId);

        if ($location.search().search){
            $scope.searchbox.search = JSON.parse($location.search().search);
            console.log($scope.searchbox.search);
        }

        $scope.childs = {
            items: [],
            load: function() {
                this.items=[];
                if ($routeParams.cId>0)
                    Api.get("collections/?parent="+$routeParams.cId, function(json){
                        if (json.result)
                            $scope.childs.items = json.items;
                    });
            }
        };

        $scope.parents = {
            items: [],
            load: function() {
                this.items=[];
                if (($routeParams.cId>0)&&(typeof $scope.collections.current.parent != 'undefined'))
                    if (typeof $scope.collections.current.parent.$id != 'undefined')
                        Api.get("childrens", function(json){
                            var ids = [$scope.collections.current.parent.$id];

                            var findParents=function(id) {
                                json.items.forEach(function(item){
                                    if (id==item._id) {
                                        $scope.parents.items.push(item);
                                        ids.push(item.parent.$id);
                                        findParents(item.parent.$id);
                                    }
                                });
                            }
                            findParents(ids[0]);

                            var temp = $scope.collections.getById( ids[ ids.length-1 ] );
                            if (!temp.notfound )
                                $scope.parents.items.push(temp);

                            $scope.parents.items.reverse();
                        });
            }
        }

        $scope.raindrops = {
            items: null,
            search: [],
            selected: 0,
            sort: 'lastUpdate',
            page: 0,
            loading: false,
            noMore: false,
            moveCid: "0",

            contextMenu: [
                [translateFilter('read'), function ($itemScope) {
                    var url = 'https://raindrop.io/app' + ($routeParams.cId >= 0 ? '/collection/' + $routeParams.cId : '') + '?q=#' + $itemScope.item._id;
                    if (typeof Shell != 'undefined'){
                        Shell.openExternal(url);
                    }
                    else {
                        var win = window.open(url, '_blank');
                        win.focus();
                    }
                }],
                [translateFilter('edit'), function ($itemScope) {
                    //$location.path( '/bookmark/'+$routeParams.cId+'/'+$itemScope.item._id );
                    $location.search('bookmark',$itemScope.item._id);
                }],
                null,
                [translateFilter('remove'), function ($itemScope) {
                    var type=$itemScope.item.type;
                    $scope.raindrops.removeItem($itemScope.item._id, function(result){
                        if (result){
                            Boot.broadcast("Notify-Show", {status:'info', text: translateFilter(type+'Removed'+($routeParams.cId==-99?'Permament':'') ) });
                        }
                        else{
                            Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('server')});
                        }
                    });
                }]
            ],

            reset: function(isSearch) {
                if (typeof isSearch == 'undefined')
                    this.search = []
                this.items = []
                this.loading = false
                this.page = 0
                this.noMore = false
            },

            more: function(callback) {
                if ((this.loading)||(this.noMore))
                    return false;

                this.page++;
                this.load(callback);
            },

            load: function(callback) {
                var _this = this;
                this.loading = true;
                this.noMore = true;

                var query=['sort='+this.sort];
                if (this.page>0)
                    query.push('page='+this.page);

                if ($scope.searchbox.search.length>0)
                    query.push('search='+encodeURIComponent(JSON.stringify($scope.searchbox.search)));

                Api.get('raindrops/'+$routeParams.cId+'?'+query.join('&'), function(json){
                    if (_this.page == 0)
                        _this.items = json.items;
                    else
                        $.merge( _this.items, json.items );

                    _this.loading = false;
                    $scope.collections.current.count = json.count;

                    if (typeof $scope.collections.current != 'undefined')
                        _this.noMore = (parseInt(_this.items.length) >= parseInt($scope.collections.current.count))

                    _this.noMore = (json.items.length == 0);

                    if (typeof callback != 'undefined')
                        callback();
                });
            },

            checkItem: function(index) {
                if (typeof this.items[index].check == 'undefined')
                    this.items[index].check = false;

                this.items[index].check=!this.items[index].check;

                if (this.items[index].check)
                    this.selected++;
                else
                    this.selected--;
            },

            resetSelection: function() {
                for(var i in this.items)
                    this.items[i].check=false;
                this.selected = 0;
                this.moveCid = "0";
            },

            removeSelected: function() {
                var list=[], index=0, count=0;
                for(var i in this.items)
                    if (this.items[i].check)
                        list.push(this.items[i]._id);

                count = list.length;

                var _this = this;
                var check=function() {
                    index++;
                    if (index<=count-1)
                        start();
                    else{
                        /*$location.path( '/bookmarks/-99' );
                         $location.search('noAnim', 1);*/
                        $scope.actions.loading=false;
                        _this.resetSelection();
                        Boot.broadcast("Notify-Show", {status:'info', text: translateFilter('bookmarksRemoved'+($routeParams.cId==-99?'Permament':'') ) });
                        Boot.broadcast("scrollable-update", true);
                    }
                }
                var start = function() {
                    _this.removeItem(list[index], function(){
                        check();
                    });
                }

                $scope.actions.loading=true;
                $scope.temp.noAnim=true;

                start();
                _this.selected-=count;
                $scope.collections.current.count-=count;
            },

            editSelected: function() {
                for(var i in this.items)
                    if (this.items[i].check){
                        //$location.path( '/bookmark/'+$routeParams.cId+'/'+this.items[i]._id );
                        $location.search('bookmark', this.items[i]._id);
                        break;
                    }
            },

            getIndex: function(id) {
                for(var i in this.items)
                    if(this.items[i]._id == id)
                        return i;
                return false;
            },

            spliceItem: function(index) {
                this.items.splice(index,1);
                $scope.collections.current.count--;
                Boot.broadcast("scrollable-update", true);
            },

            removeItem: function(id,callback, onlyUpdateItems) {
                var _this = this;
                var index = this.getIndex(id);

                var updateItems = function() {
                    try {
                        if ($scope.bookmarkWorker.lastSaved._id == _this.items[index]._id)
                            $scope.bookmarkWorker.lastSaved = {};
                    }catch(e){}
                    _this.spliceItem(index);
                }

                if (onlyUpdateItems)
                    updateItems();
                else
                    Api.del('raindrop/'+this.items[index]._id, function(json) {
                        if (json.result){
                            updateItems();
                        }

                        if (callback)
                            callback(json.result);
                    });
            },

            moveItems: function() {
                var list={}, index=0, count=0;
                for(var i in this.items)
                    if (this.items[i].check){
                        list[count] = this.items[i]._id;
                        count++;
                    }

                var _this = this;
                var check=function() {
                    index++;
                    if (index<=count-1)
                        start();
                    else{
                        $scope.actions.loading=false;
                        _this.resetSelection();
                        Boot.broadcast("Notify-Show", {status:'info', text: translateFilter('moveSuccess') });
                        Boot.broadcast("scrollable-update", true);
                    }
                }
                var start = function() {
                    var ri = _this.getIndex(list[index]);
                    _this.items[ri].collectionId = _this.moveCid;

                    Api.update('raindrop/'+list[index], _this.items[ri], function(){
                        _this.items.splice(ri,1);
                        check();
                    });
                }

                if ($routeParams.cId!=_this.moveCid){
                    $scope.actions.loading=true;
                    $scope.temp.noAnim=true;

                    $scope.collections.getById(_this.moveCid).count+=count;
                    _this.selected-=count;
                    $scope.collections.current.count-=count;
                    start();
                }
            },

            showMoveModal: function() {
                this.movingNow=true;
                Boot.broadcast("Modal-Show", {src:'move-bookmarks'});
            },

            selectAll: function() {
                this.selected = this.items.length;
                for(var i in this.items)
                    this.items[i].check=true;
            }
        };

        $scope.raindrops.load();
        $scope.childs.load();

        $scope.search={
            now: function() {
                $scope.raindrops.reset(true);
                $scope.raindrops.load();
            }
        }
        $scope.searchbox.filter='';

        $scope.$watchCollection('raindrops.items', function() {
            Boot.broadcast("scrollable-update", true);
        });
        $scope.$watch('collections.current.view', function() {
            Boot.broadcast("scrollable-update", true);
        });

        $scope.temp = {
            noAnim: $routeParams.noAnim
        };

        $scope.bookmarkWorker.afterSavePage = function(item){
            Boot.broadcast("Notify-Show", {status:'done',
                text: translateFilter(item.type+'Saved')
                //+ ' ' + translateFilter('in') + ' "' + $scope.collections.getById($routeParams.cId).title +'"'
            });

            $scope.raindrops.items.unshift(item);
            $scope.collections.current.count++;
            Boot.broadcast("scrollable-update", true);
            $scope.bookmarkWorker.goToEdit(item);
        };

        $scope.$on("bookmark-remove", function(e, info) {
            $scope.raindrops.removeItem(info._id, false, true);
        });

        $scope.$on("bookmark-update", function(e, info) {
            if (info.collection.$id == $routeParams.cId)
                $scope.raindrops.items[$scope.raindrops.getIndex(info._id)] = info;
            else{
                $scope.raindrops.spliceItem($scope.raindrops.getIndex(info._id));
            }
        });

        $scope.$on("current-collection-loaded", function() {
            $scope.parents.load();
        });

        $scope.$on("collection-remove", function(e,id){
            for(var i in $scope.childs.items)
                if ($scope.childs.items[i]._id == id)
                    $scope.childs.items.splice(i,1);
        });

        $scope.$on("set-parent", function(e, info) {
            if ($scope.raindrops.movingNow) {
                $scope.raindrops.moveCid = info.id;
                $scope.raindrops.moveItems();
                Boot.broadcast("Modal-Hide");
                $scope.raindrops.movingNow=false;
            }
        });
    })



    /*
     -	-	B O O K M A R K 	-	-	-
     */
    .controller('Bookmark', function(Bookmark, $scope, Api, Boot, $timeout, $location, translateFilter) {
        $scope.form={
            title:'', excerpt:'', type: 'link', media: []
        };

        $scope.worker = {
            tag: '',
            tagFocused: false,
            changeWatch: null,
            changed: false,
            collectionMode: 'select',
            collection: {},
            collectionText: translateFilter('untitled'),

            setCollectionText: function() {
                var temp = $scope.collections.getById($scope.form.collection.$id);

                if (temp.notfound)
                    Api.get("collection/"+$scope.form.collection.$id, function(json){
                        $scope.worker.collection = json.item;
                        $scope.actions.apply($scope);
                    });
                else {
                    $scope.worker.collection = temp;
                }
            },

            save: function() {
                var _this = this;
                _this.loading=true;
                $scope.form.tags = $scope.tags.clear($scope.form.tags);

                var save = function() {
                    Bookmark.saveItem($scope.form, function(json){
                        if (json.result){
                            $scope.form = Bookmark.formDefaults(json.item);
                            _this.prepareItem();

                            Boot.broadcast("Notify-Show", {status:'done',
                                text: translateFilter($scope.form.type+'Saved')
                                /*+ ' ' + translateFilter('in') + ' "' + $scope.worker.collectionText +'"'*/
                            });

                            Boot.broadcast("bookmark-update", json.item);
                            Boot.broadcast("Modal-Hide");
                        }else{
                            $scope.form.tags = $scope.tags.prepare($scope.form.tags);
                            _this.changed = true;
                            Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('server'+(json.error||'')) });
                        }

                        _this.loading=false;
                    });
                }

                if (this.collectionMode=='select'){
                    save();
                }
                else{
                    Api.create('collection', {title: this.collectionText}, function(json){
                        if (json.result){
                            $scope.collections.items[0].collections.push(json.item);
                            $scope.form.collectionId = json.item._id;
                            $scope.worker.collectionText = json.item.title;
                            save();
                            $scope.collections.saveGroups();
                            _this.collectionMode='select';
                        }
                    });
                }
            },

            prepareItem: function() {
                $scope.form.tags = $scope.tags.prepare($scope.form.tags);

                //$scope.collections.setCurrent($scope.form.collectionId);
                //this.setChanger();
                $scope.worker.setCollectionText();

                Boot.broadcast("elastic:adjust", true);
            },

            removeItem: function() {
                var _this = this;
                _this.loading=true;
                Api.del('raindrop/'+$scope.form.id, function(json) {
                    if (json.result){
                        if ($scope.bookmarkWorker.lastSaved._id == $scope.form.id)
                            $scope.bookmarkWorker.lastSaved={};

                        Boot.broadcast("Notify-Show", {status:'info', text: translateFilter($scope.form.type+'Removed'+($scope.form.collectionId==-99?'Permament':'') ) });
                        $location.search({});

                        Boot.broadcast("bookmark-remove", {_id: $scope.form.id});
                    }
                    else{
                        Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('server'+(json.error||'')) });
                    }
                    $scope.actions.apply($scope);
                    _this.loading=false;
                });
            },

            setChanger: function() {
                var _this = this;
                _this.changed = false;
                this.changeWatch = $scope.$watch('form', function (n,o) {
                    if ((n.cover!=o.cover)||
                        (n.coverEnabled!=o.coverEnabled)||
                        (n.excerpt!=o.excerpt)||
                        (n.media.length!=o.media.length)||
                        (n.tags.length!=o.tags.length)||
                        (n.title!=o.title)||
                        (n.collectionId!=o.collectionId)||
                        (n.type!=o.type)){
                        _this.changed = true;
                        _this.changeWatch();
                    }
                }, true);
            },

            left: function() {
                if ($scope.form.cover>0)
                    $scope.form.cover--;
                else
                    $scope.form.cover=$scope.form.media.length-1;
            },
            right: function() {
                if ($scope.form.cover>=$scope.form.media.length-1)
                    $scope.form.cover=0;
                else
                    $scope.form.cover++;
            },


            capturePage: function() {
                bridge.capturePage($scope.form.url);
            },
            setCapturedPage: function(dataURI) {
                if (dataURI) {
                    $scope.form.media[ $scope.form.media.length-1 ] = {link: dataURI, type: "image", screenshot: true, dataURI: true};
                    $scope.form.haveScreenshot=true;
                    $scope.form.coverId = $scope.form.media.length-1;
                    $scope.form.coverEnabled = true;

                    $scope.actions.apply($scope);
                }
            },

            dropCover: function() {
                $scope.form.coverId = $scope.form.cover = $scope.form.media.length-1;
                $scope.form.coverEnabled = true;
                $scope.actions.apply($scope);
            }
        };

        Bookmark.loadItem($location.search().bookmark, function(json){
            if (json.result){
                $scope.form = json.item;
                $scope.worker.prepareItem();
            }
        });

        $scope.$on("set-parent", function(e, info) {
            $scope.form.collectionId = $scope.form.collection.$id;
            $scope.worker.setCollectionText();
            $scope.worker.showParents = false;
        });
    })



    /*
     -	-	C O L L E C T I O N 	-	-	-
     */
    .controller('Collection', function($scope, $translate, $routeParams, Api, Boot, translateFilter, $location) {
        $scope.form = {
            cover: [],
            public: false,
        }

        $scope.worker={
            status: '',
            step: '',
            changeWatch: null,
            changed: false,
            group: "0",
            parentText: translateFilter('untitled'),
            groupMode: 'select',
            showParents: false,

            setParentText: function() {
                if ($scope.form.parent){
                    Api.get("collection/"+$scope.form.parent.$id, function(json){
                        $scope.worker.parentText = json.item.title;
                        $scope.actions.apply($scope);
                    });
                }else{
                    $scope.worker.parentText = $scope.collections.items[this.group].title;
                    $scope.actions.apply($scope);
                }
            },

            formDefaults: function() {
                if ($scope.collections.items.length==0)
                    $scope.collections.defaultGroup();

                if (!$scope.form.cover)
                    $scope.form.cover=[];

                delete $scope.form.cover_path;

                if ($scope.form._id){
                    this.group = $scope.collections.getCollectionGroup($scope.form._id);
                }
                if (this.group==undefined) this.group='0';

                this.setParentText();

                $scope.actions.apply($scope);
            },

            save: function() {
                var _this = this;
                _this.loading=true;

                var afterSave=function(json) {
                    if (json.result){
                        Boot.broadcast("Notify-Show", {status:'done', text: translateFilter('saveSuccess')});

                        var oldGroup = $scope.collections.getCollectionGroup(json.item._id);

                        //move to group
                        if (_this.group != null)
                            if (_this.groupMode=='select'){
                                if (_this.group != oldGroup){
                                    $scope.collections.items[_this.group].collections.push(json.item);
                                }
                                else{
                                    for(var i in $scope.collections.items[oldGroup].collections)
                                        if ($scope.collections.items[oldGroup].collections[i]._id == json.item._id){
                                            $scope.collections.items[oldGroup].collections[i] = json.item;
                                            break;
                                        }
                                }
                            }
                            else{
                                _this.group = "-1";
                                $scope.collections.newBlankGroup(true, _this.groupText);
                                $scope.collections.items[ $scope.collections.items.length - 1 ].collections.push(json.item);
                            }

                        //remove from old group
                        if (oldGroup!=undefined)
                            if (_this.group != oldGroup)
                                for(var i in $scope.collections.items[oldGroup].collections)
                                    if ($scope.collections.items[oldGroup].collections[i]._id == json.item._id){
                                        $scope.collections.items[oldGroup].collections.splice(i,1);
                                        break;
                                    }

                        $scope.collections.saveGroups();

                        $location.path( '/bookmarks/'+json.item._id );
                        $location.search('noAnim', 1);
                    }
                    else{
                        Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('server'+(json.error||'')) });
                    }
                }

                if ($scope.form.parent) {
                    this.group = null;
                    $scope.form.parentId = $scope.form.parent["$id"];
                    delete $scope.form.parent;
                }
                else
                    $scope.form.parentId = "root";

                if ($scope.form._id)//update
                    Api.update('collection/'+$scope.form._id, $scope.form, afterSave);
                else //new
                    Api.create('collection', $scope.form, afterSave);
            }
        };

        $scope.covers={
            templates: [],
            init: function() {
                var _this = this;
                Api.get("coverTemplates", function(json){
                    _this.templates = json;
                });
            },
            setCover: function(cover) {
                $scope.form.cover[0]=this.templates.path+cover+'.png'; $scope.form.cover_path=cover;
                $scope.worker.step='';
            }
        }
        $scope.covers.init();

        if ($routeParams.cId){
            //$scope.collections.setCurrent($routeParams.cId);
            Api.get("collection/"+$routeParams.cId, function(json){
                if(json.result) {
                    $scope.form = json.item;
                    $scope.worker.formDefaults();
                }
            });
            //$scope.form = JSON.parse(JSON.stringify($scope.collections.current));
            $scope.worker.status='edit';
        }
        else{
            $scope.worker.status='new';
            if ($routeParams.group){
                for(var i in $scope.collections.items)
                    if ($scope.collections.items[i].index == $routeParams.group){
                        $scope.worker.group = i;
                        break;
                    }
            }
            else if ($routeParams.parent) {
                if ($routeParams.parent > 0) {
                    $scope.worker.group = null;
                    $scope.form.parent = {"$id": parseInt($routeParams.parent)};
                }
            }
            $scope.worker.formDefaults();
        }

        console.log($routeParams);


        $scope.$watch('worker.step', function() {
            Boot.broadcast("scrollable-update", true);
        });

        $scope.$on("set-parent", function(e, info) {
            $scope.worker.setParentText();
            $scope.worker.showParents = false;
        });
    })



    /*
     -	-	S E T T I N G S 	-	-	-
     */
    .controller('Settings', function($scope, $translate, $route, localStorageService, Api, $location, $timeout, Boot, translateFilter) {
        $scope.worker = {
            setLanguage: function() {
                $translate.uses($scope.user.me.config.lang);
                Api.update("userConfig", {lang: $scope.user.me.config.lang}, function(){
                    $location.path( "/" );
                });
            },
            logOut: function() {
                Api.get('../auth/logout',function(){});
                $scope.user.me=undefined;
                $location.path('/signin');
            },

            setConfig: function(name) {
                $scope.user.me.config[name] = !$scope.user.me.config[name];
                Api.update("userConfig", {notify: true, name: name, remove: !$scope.user.me.config[name]}, function(){});

                $scope.user.setConfigs();
            }
        };

        if (environment.name == 'desktop'){
            $scope.worker.Desktop = {
                settings: Desktop.settings,
                save: function() {
                    ipc.send('saveSettings', $scope.worker.Desktop.settings);
                    Boot.broadcast("Notify-Show", {
                        status: 'info',
                        text: translateFilter('desktopNeedRestart')
                    });
                }
            }
        }

        $timeout( function() {
            $('.openLink').click(function () {
                bridge.openTab($(this).attr('href'));
                return (!!window.chrome==false);
            });
        },500);
    })



    /*
     -	-	S I G N I N 	-	-	-
     */
    .controller('SignIn', function($scope, $timeout, Api, Boot, $location, translateFilter, SocialFactory) {
        $scope.actions.loading=false;

        $scope.login = {
            form: {
                email: '',
                password: ''
            },
            save: function() {
                $scope.login.form = {
                    email: $("#sign-email").val(),
                    password: $("#sign-password").val()
                };

                Api.create("auth/login", this.form, function(json) {
                    if (json.result) {
                        window.location = 'popup.html'
                    } else {
                        if (typeof json.error === "undefined")
                            json.error = 7;

                        Boot.broadcast("Notify-Show", {
                            status: 'error',
                            text: translateFilter('server' + json.error)
                        });
                    }
                });
            }
        };

        $timeout(function() {
            $scope.login.form = {
                email: $("#sign-email").val(),
                password: $("#sign-password").val()
            };
        }, 100);

        $scope.loginWindow = SocialFactory.loginWindow;
    })




    /*
     -	-	S I G N U P 	-	-	-
     */
    .controller('SignUp', function($scope, $timeout, Api, Boot, $location, translateFilter, SocialFactory) {
        $scope.actions.loading=false;
        $scope.loginWindow = SocialFactory.loginWindow;

        $scope.login = {
            form: {
                email: '',
                password: ''
            },
            save: function() {
                Api.create("user", this.form, function(json) {
                    if (json.result) {
                        Api.create("auth/login", $scope.login.form, function(lJson) {
                            if (lJson.result)
                                window.location = 'popup.html';
                        });
                    } else {
                        if (typeof json.error === "undefined")
                            json.error = 7;

                        Boot.broadcast("Notify-Show", {
                            status: 'error',
                            text: translateFilter('server' + json.error)
                        });
                    }
                });
            }
        };
    })



    /*
     -	-	H E L P 	-	-	-
     */
    .controller('Help', function($scope,$translate) {
        $scope.lang = $translate.uses();
        $scope.helpInfo = 0;
        $scope.nextHelpInfo = function() {
            if ($scope.helpInfo<=2)
                $scope.helpInfo++;
            else
                $scope.helpInfo=0;
        }
    })




    /*.controller('FastSave', function($scope,Api,Bookmark, $interval, $location, Boot){
     if (typeof $location.search().url != 'undefined')
     if ($location.search().url!=''){
     $scope.bookmarkWorker.dropURL($location.search().url);
     }
     else
     bridge.getURL(true);

     $location.search({});

     $scope.step = 'loading';
     $scope.item = {};
     $scope.collection = {};
     $scope.showCollections = false;
     $scope.showCollectionsNow = function() {
     $scope.showCollections = true;
     }

     var onlyOneTime=true;
     $scope.$on("Checked-URL", function(e, info) {
     if (onlyOneTime) {
     if (info.have) {
     Api.get("raindrop/" + info.item._id, function (item) {
     $scope.item = item.item;
     $scope.item.have = true;
     $scope.step = 'item';

     getCollectionInfo(true);
     });
     }
     else {
     $scope.bookmarkWorker.saveCurrentPage();
     }

     onlyOneTime = false;
     }
     });

     var getCollectionInfo = function(setTimer) {
     var temp = $scope.collections.getById($scope.item.collection.$id);

     var afterGet = function(item){
     $scope.collection = item;
     if (typeof setTimer != 'undefined') $scope.ctimer.start();
     Api.update("userConfig", {'last_collection': $scope.item.collection.$id}, function(){});
     }

     if (temp.notfound)
     Api.get("collection/"+$scope.item.collection.$id, function(item){
     afterGet(item.item);
     });
     else {
     afterGet(temp);
     }
     }

     $scope.bookmarkWorker.afterSavePage = function(item,way) {
     $scope.item = item;
     $scope.step = 'item';

     getCollectionInfo(true);
     }

     try {
     $scope.collections.setCurrent(parseInt($scope.user.me.config.last_collection));
     }catch(e){}

     $scope.removeItem = function() {
     Api.del('raindrop/'+$scope.item._id, function(json) {
     if (json.result) {
     $scope.actions.close();

     Boot.broadcast("Modal-Hide",true);
     $location.path("/bookmarks/" + parseInt($scope.item.collection.$id));
     }
     });
     }


     $scope.$on("set-parent", function(e, info) {
     $scope.showCollections = false;
     getCollectionInfo();
     $scope.item.have = false;
     $scope.step = 'loading';

     Bookmark.saveItem( Bookmark.formDefaults($scope.item, $scope.collection._id) , function(json) {
     $scope.step = 'item';
     });
     });



     $scope.ctimer = {
     show: false,
     digit: 1,
     interval: null,
     start: function() {
     $scope.ctimer.digit=1;
     $interval.cancel(this.interval);
     this.show = true;
     this.interval = $interval(function() {
     if ($scope.ctimer.digit>=3){
     $scope.ctimer.stop();
     $scope.actions.close();

     Boot.broadcast("Modal-Hide",true);
     $location.path("/bookmarks/" + parseInt($scope.item.collection.$id));
     }
     else{
     $scope.ctimer.digit++;
     }
     },1000);
     },
     stop: function() {
     $interval.cancel(this.interval);
     this.show = false;
     }
     }


     $scope.worker = {
     capturePage: function() {
     bridge.capturePage();
     $scope.step = 'loading';
     },
     setCapturedPage: function(dataURI) {
     if (dataURI) {
     $scope.item.media[ $scope.item.media.length-1 ] = {link: dataURI, type: "image", screenshot: true, dataURI: true};
     $scope.item.haveScreenshot=true;
     $scope.item.coverId = $scope.item.media.length-1;
     $scope.item.coverEnabled = true;

     $scope.actions.apply($scope);

     Bookmark.saveItem( Bookmark.formDefaults($scope.item, $scope.collection._id) , function(json) {
     $scope.step = 'item';
     });
     }
     }
     };
     })*/




    .controller('FastSave', function($scope,Api,Bookmark, $interval, $location, Boot){
        if (typeof $location.search().fastsave != 'undefined')
            if ($location.search().fastsave!=''){
                $scope.bookmarkWorker.dropURL($location.search().fastsave);
            }
            else
                bridge.getURL();
    })



    .controller('AddURL', function($scope,$translate,Boot,translateFilter){
        $scope.lang = $translate.uses();
        $scope.url="";

        $scope.addNow = function() {
            var tempUrl = $scope.url+"";
            if (Boot.isURL("http://" + tempUrl.toString())){
                tempUrl = "http://" + tempUrl.toString();
            }

            if (Boot.isURL(tempUrl)) {
                $scope.bookmarkWorker.dropURL(tempUrl);
            }
            else{
                Boot.broadcast("Notify-Show", {status:'error', text: translateFilter('supportOnlyUrls')});
            }
        }
    });



if (typeof Mousetrap != 'undefined') {
    Mousetrap.bindGlobal(['command+shift+e', 'ctrl+shift+e'], function (e) {
        e.preventDefault();
        bridge.close();
        return false;
    });

    Mousetrap.bindGlobal(['command+shift+s', 'ctrl+shift+s'], function (e) {
        e.preventDefault();
        bridge.savePage();

        return false;
    });
}