var base='https://raindrop.io';
var Shell,
    environment= {name: ""};

var languages = {
    "en_US" : {
        importBookmarks: "Import bookmarks",
        to: "to",
        hi: "Hi",
        hiD: ", what would you like to import?",
        browserBookmarks: "Browser bookmarks",
        fromFile: "Other",
        total: "Total",
        selectAll: "Select All",
        selectNone: "Select None",
        reset: "Reset",
        search: "Search...",
        configPage: "Import settings",
        folders: "Folders",
        removeDublicates: "Do not add duplicates",
        start: "Start",
        cancel: "Cancel",
        importInProgress: "Import in progress",
        doneBookmarks: "Done",
        of: 'of',
        bookmarks: "bookmarks",
        collections: "collections",
        longImport: 'Time to transfer depends on the amount of bookmarks and speed of your connection.',
        warning: "Do not close this tab before transfer of your bookmarks is complete! If process is stuck try again from the beginning and check 'Do not add duplicates'.",
        done: "Import is done!",
        doneD: "now available from web, browser extension & Android/iOS mobile app.",
        needAuth: "Log in first!",
        and: "&",
        dublicates: "dublicates ignored",
        errors: "with error",
        selectIconForCollection: "but for now select the icon for the collection",
        resetData: "Remove all collections and bookmarks on Raindrop.io",
        resetDataWarning: "All your collections and bookmarks on Raindrop.io will be remove without possibility to restore them.",
        resetDataYes: "Yes, remove all collections and bookmarks",
        resetDone: "Done!",
        goBack: "Go back",
        goToRaindrop: "Show bookmarks"
    },

    "ru_RU" : {
        importBookmarks: "Импортировать закладки",
        to: "на",
        hi: "Привет",
        hiD: ", какие закладки ты хочешь импортировать?",
        browserBookmarks: "Закладки браузера",
        fromFile: "Другое",
        total: "Всего",
        selectAll: "Выбрать все",
        selectNone: "Убрать выбор",
        reset: "Сбросить",
        search: "Найти...",
        configPage: "Параметры импорта",
        folders: "Папки",
        removeDublicates: "Не добавлять дубликаты",
        start: "Начать",
        cancel: "Отмена",
        importInProgress: "Происходит импортирование закладок",
        doneBookmarks: "Завершено",
        of: 'из',
        bookmarks: "закладок",
        collections: "коллекций",
        longImport: 'Скорость переноса закладок зависит от их количества и скорости вашего интернет соединения.',
        warning: "Не закрывайте эту вкладку до завершения процесса переноса ваших закладок на Raindrop.io! Если процесс остановится на определенном уровне надолго, попробуйте повторить импорт с самого начала и отметить пункт 'Не добавлять дубликаты'.",
        done: "Импорт завершен!",
        doneD: "теперь доступны из веб, расширения для браузера и приложения для Android/iOS.",
        needAuth: "Войдите для начала!",
        and: "и",
        dublicates: "дубликата игнорированы",
        errors: "с ошибкой",
        selectIconForCollection: "а пока укажите иконку для коллекции",
        resetData: "Удалить все коллекции и закладки на Raindrop.io",
        resetDataWarning: "Внимание! Все коллекции и закладки из вашего аккаунта на Raindrop.io будут удалены без возможности их восстановить.",
        resetDataYes: "Да, удалить все коллекции и закладки",
        resetDone: "Готово!",
        goBack: "Назад",
        goToRaindrop: "Посмотреть закладки"
    }
}

/* Application */
var app=angular.module('import', ['ngAnimate', 'ngRoute', 'pascalprecht.translate', 'popup.services', 'LocalStorageModule', 'multi-select'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller:'Home',
                templateUrl:'templates/home.html'
            })
            .when('/browser', {
                controller:'Browser',
                templateUrl:'templates/browser.html'
            })
            .when('/config', {
                controller:'Config',
                templateUrl:'templates/config.html'
            })
            .when('/start', {
                controller:'Start',
                templateUrl:'templates/start.html'
            })
            .when('/done', {
                controller:'Done',
                templateUrl:'templates/done.html'
            })
            .when('/auth', {
                controller:'Auth',
                templateUrl:'templates/auth.html'
            })

            .when('/resetdata', {
                controller:'ResetData',
                templateUrl:'templates/resetdata.html'
            })

            .otherwise({
                redirectTo:'/'
            });
    })
    .config(["$translateProvider", function($translateProvider) {
        for(var lang in languages){
            $translateProvider.translations(lang, languages[lang]);
        }
    }])
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|chrome-extension|safari-extension|resource):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|safari-extension|data|resource):/);
        }
    ])
    /*
     -	-	G L O B A L 	-	-	-
     */
    .run(function($rootScope, $translate, localStorageService, $location) {
        //language
        var lang = (navigator.language || navigator.systemLanguage || navigator.userLanguage || 'en').substr(0, 2).toLowerCase();
        if (localStorageService.get('App-Language')!=null) lang = localStorageService.get('App-Language');

        if ((lang == "ru") || (lang == "ru_RU"))
            lang = 'ru_RU';
        else
            lang = 'en_US';

        $translate.uses(lang);
        localStorageService.set('App-Language', lang);

        $rootScope.actions = {
            apply: function($scope) {
                try {
                    if (!$scope.$$phase)
                        $scope.$apply();
                } catch (_error) {}
            }
        };

        //
        $rootScope.data = {
            environment: "",
            index: -1,
            count: 0,
            dublicates: 0,
            errors: 0,
            items: [],
            removeDublicates: false,
            browser: {
                current: new UAParser().getBrowser().name.toLowerCase(),
                show: false
            },

            reset: function() {
                this.index = -1;
                this.count = 0;
                this.dublicates = 0;
                this.items = [];
                this.errors = 0;
            },

            postHTML: function(items) {
                for(var i in items)
                    items[i].reverse();

                var books=[];
                for(var i in items)
                    if (items[i].length>0)
                        books.push({folder: i, items: items[i], count: items[i].length, ticked: true});

                if ($rootScope.data.count>0){
                    $rootScope.data.items = _.sortBy(books, "folder");
                    $location.path('/config');
                }
                else{
                    alert('No bookmarks found :(');
                    $location.path('/');
                }

                $rootScope.actions.apply($rootScope);
            }
        }

        try{
            $rootScope.data.environment = $location.search().environment;
        }catch(e){}

        if ($rootScope.data.environment == 'desktop'){
            Shell = require('shell');
        }

        environment.name = $rootScope.data.environment;

        $rootScope.data.browser.show = ( (($rootScope.data.browser.current=='chrome') || ($rootScope.data.browser.current=='opera')) && ($rootScope.data.environment!="desktop") && (window.location.host!="raindrop.io") );
    })



    .controller('Home', function($scope, $location, translateFilter){
        var prepareHTML = function(evt, callback, encoding) {
            if (typeof encoding == 'undefined')
                encoding = null;

            var f = evt.files[0];

            if (f) {
                var r = new FileReader();
                r.onload = function(e) {
                    var contents = e.target.result;

                    var goToCallback=function() {
                        $scope.data.reset();
                        callback(contents);
                    }

                    //check enconding
                    if (encoding==null){
                        var eMatches=(contents.match(/meta(.*)charset(.*)\"/i));
                        eMatches = eMatches || 0;
                        if (eMatches.length>=3){
                            eCharset = eMatches[2].substr(1);
                            if (eCharset!='')
                                eCharset = eCharset.toLowerCase();

                            if ((eCharset=='utf-8')||(eCharset==''))
                                goToCallback()
                            else
                                prepareHTML(evt, callback, eCharset)
                        }
                        else
                            goToCallback()
                    }
                    else
                        goToCallback()
                }
                r.readAsText(f,encoding);
            } else {
                callback(null);
                alert("Failed to load file");
            }
        }
        var prefixes = function(vendor) {
            var prefs = {
                links: 'dt a',
                tags: 'tags'
            };

            switch(vendor) {
                case 'Pocket':
                    prefs.links = 'li a';
                    break;

                case 'Instapaper':
                    prefs.links = 'li a';
                    break;

                case 'Kippt':
                    prefs.tags = 'list';
                    break;

                default:

                    break;
            }

            return prefs;
        }

        $scope.localFile = function(evt) {
            var vendor = $(evt).attr('data-vendor'),
                prefs = prefixes(vendor);

            prepareHTML(evt, function(contents) {
                if (contents==null) return false;
                var htmlFile;

                switch(vendor){
                    case 'Pocket':
                        var tempContents = contents.match(/<body[^>]*>((.|[\n\r])*)<\/body>/gmi);
                        if (tempContents.length>0) {
                            contents = tempContents[0];
                            contents = contents.replace(/<body>/g, '');
                            contents = contents.replace(/<\/body>/g, '');
                        }

                        $('#temphtml').html(contents);
                        contents = '<ul>'+$('#temphtml ul:eq(0)').html()+'</ul>';
                        $('#temphtml').html('');
                        break;
                }

                try{
                    htmlFile = $(contents);
                }catch(e) {}

                if (typeof htmlFile == "undefined"){
                    alert('file parse error! :(')
                    return false;
                }

                var items=[], section='', excerpt = '', error=false;

                //parsing
                $(prefs.links, htmlFile).each(function(){
                    section = ''; excerpt = '';

                    switch(vendor){
                        case 'Pocket':

                            break;
                        default:
                            section = $(this).parents('dl').eq(0).parents('dt').eq(0).find('h3').eq(0).text();

                            var nextAfter = $(this).parents('dt').eq(0).next();

                            if (nextAfter.size()>0)
                                if (nextAfter.get(0).tagName.toLowerCase()=='dd')
                                    excerpt = nextAfter.text();

                            break;
                    }

                    section = section || vendor;

                    if (typeof items[ section ] == 'undefined' )
                        items[ section ]=[];

                    error = false;
                    if (!validator.isURL($(this).attr('href')))
                        error = true;

                    if (!error){
                        var tags = $(this).attr(prefs.tags);
                        if (typeof tags != 'undefined')
                            tags = secureFunx.allowedTags(tags);

                        items[ section ].push({
                            url: $(this).attr('href'),
                            title: $(this).text() || 'Untitled',
                            excerpt: excerpt,
                            tags: tags
                        });

                        $scope.data.count++;
                    }
                });

                $scope.data.postHTML(items);
                delete htmlFile;
            });
        }

        $scope.readabilityFile = function(evt) {
            prepareHTML(evt, function(contents) {
                if (contents==null) return false;
                var original = JSON.parse(contents);

                var items = [];
                items['Readability']=[];
                items['Readability Archive']=[];

                original.bookmarks.forEach(function(item) {
                    if (validator.isURL(item.article__url)){
                        items[ (item.archive?'Readability Archive':'Readability') ].push({
                            url: item.article__url,
                            title: item.article__title,
                            excerpt: item.article__excerpt
                        });

                        $scope.data.count++;
                    }
                });

                $scope.data.postHTML(items);
                delete original;
            });
        }

        $scope.user={};
        $.get(base+'/api/user', function(json){
            if (json.result){
                $scope.user=json.user;
            }
            else
                $location.path('/auth');

            $scope.actions.apply($scope);
        });

        $('.filelocal').change(function(){
            angular.element(this).scope().localFile(this);
        });
        $('.filereadability').change(function(){
            angular.element(this).scope().readabilityFile(this);
        });
    })



    .controller('Browser', function($scope){
        var items=[];

        var chromeB = {
            parseTree: function(item, index, arr, folder) {
                if (typeof item.children != 'undefined'){
                    if (typeof items[item.title] == 'undefined')
                        items[item.title] = [];
                    item.children.forEach( function(child) {
                        chromeB.parseTree(child, 0, 0, item.title);
                    });
                }
                else{
                    if (validator.isURL(item.url)){
                        items[folder].push({
                            url: item.url,
                            title: item.title
                        });
                        $scope.data.count++;
                    }
                }
            }
        };

        $scope.data.reset();

        switch ($scope.data.browser.current){
            case 'chrome':
            case 'opera':
                chrome.bookmarks.getTree(function(tree) {
                    tree[0].children.forEach(chromeB.parseTree);
                    $scope.data.postHTML(items);
                    delete items;
                })
                break;
        }
    })



    .controller('Config', function($scope, $location){
        if ($scope.data.count==0)
            $location.path('/');

        if ($scope.data.items.length==1)
            $('#collectionsSelect').hide();
        else
            $('#collectionsSelect').show();
    })


    .controller('Start', function($scope, $location){
        $scope.data.count=0;

        var temp = [];
        for(var i in $scope.data.items)
            if ($scope.data.items[i].ticked) {
                temp.push($scope.data.items[i]);
                $scope.data.count += $scope.data.items[i].items.length;
            }

        $scope.data.items = JSON.parse(JSON.stringify(temp));

        if ($scope.data.items.length==0){
            $location.path('/');
            return false;
        }

        var links = [];
        $scope.data.items.forEach(function(collection){
            collection.items.forEach(function(link){
                links.push(link);
            });
        });

        var currentDone = false, currentTimeout=null;

        var nextLink = function() {
            if ($scope.data.index<$scope.data.count-1){
                currentDone = false;
                clearTimeout(currentTimeout);
                currentTimeout = setTimeout(function() {
                    if (currentDone==false) {
                        $scope.data.errors++;
                        nextLink();
                    }
                }, 9000*2);

                $scope.data.index++;
                $scope.actions.apply($scope);

                if ($scope.data.removeDublicates)
                    $.post(base+'/api/check/url', {url: links[$scope.data.index].url}, function(cResult){
                        if (!cResult.result)
                        //$('#frameParser').attr('src', 'frame.html?url=' + encodeURIComponent(links[$scope.data.index].url) + '&t=' + Date.now() );
                            parser.load(links[$scope.data.index].url);
                        else{
                            $scope.data.dublicates++;
                            nextLink();
                        }
                    })
                        .fail(function(){
                            $scope.data.errors++;
                            nextLink();
                        });
                else {
                    //$('#frameParser').attr('src', 'frame.html?url=' + encodeURIComponent(links[$scope.data.index].url) + '&t=' + Date.now() );
                    parser.load(links[$scope.data.index].url);
                }
            }
            else{
                $location.path('/done');
                $scope.actions.apply($scope);
            }
        }

        var saveLink = function(item) {
            currentDone = true;
            clearTimeout(currentTimeout);

            if ((links[$scope.data.index].saved)||(links[$scope.data.index].url != item.link)){
                nextLink();
            }
            else {
                links[$scope.data.index].saved = true;
                links[$scope.data.index].coverEnabled = item.coverEnabled;
                links[$scope.data.index].domain = item.domain;
                links[$scope.data.index].excerpt = links[$scope.data.index].excerpt || item.excerpt;

                links[$scope.data.index].title = links[$scope.data.index].title || item.title;
                if (validator.isURL(links[$scope.data.index].title))
                    links[$scope.data.index].title = item.title;

                links[$scope.data.index].html = (item.type == "link" ? "" : item.html);
                links[$scope.data.index].media = item.media;
                links[$scope.data.index].type = item.type;
                links[$scope.data.index].cover = 0;

                /*if ($scope.data.removeDublicates)
                 $.post(base + '/api/check/url', {url: links[$scope.data.index].url}, function (cResult) {
                 if (!cResult.result)
                 $.post(base + '/api/raindrop', links[$scope.data.index], function () {
                 nextLink();
                 })
                 .fail(function(){
                 nextLink();
                 });
                 else {
                 $scope.data.dublicates++;
                 nextLink();
                 }
                 })
                 .fail(function(){
                 nextLink();
                 });
                 else*/
                $.post(base + '/api/raindrop', links[$scope.data.index], function () {
                    nextLink();
                })
                    .fail(function(){
                        $scope.data.errors++;
                        nextLink();
                    });
            }
        }

        //Init collections
        var cIndex = -1, cCount = $scope.data.items.length,
            cInit = function() {
                if (cIndex<cCount-1){
                    cIndex++;

                    var cAddLinks=function(cId) {
                        $scope.data.items[cIndex]._id = cId;

                        $scope.data.items[cIndex].items.forEach(function(link){
                            link.collectionId = cId;
                            links.push(link);
                        });
                        cInit();
                    }

                    $.post(base+'/api/check/collection', {title: $scope.data.items[cIndex].folder}, function(cResult){
                        if (cResult.result)
                            cAddLinks(cResult.id);
                        else
                            $.post(base+'/api/collection', {title: $scope.data.items[cIndex].folder}, function(aResult){
                                cAddLinks(aResult.item._id);
                            });
                    });
                }else{
                    nextLink();
                    $scope.covers.show=true;
                    $scope.actions.apply($scope);
                }
            };

        if ($scope.data.items.length>0)
            cInit();


        //Collection templates
        $scope.covers = {
            items: [],
            path: "",
            cId: 0,
            show: false,

            setCover: function(i) {
                $scope.covers.show=false;
                $scope.actions.apply($scope);

                $.ajax({
                    url: base+'/api/collection/'+$scope.data.items[$scope.covers.cId]._id,
                    type: 'PUT',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        title: $scope.data.items[$scope.covers.cId].folder,
                        cover_path: $scope.covers.items[i]
                    }),
                    success: function(res) {
                        $scope.covers.cId++;
                        $scope.covers.show=true;
                        $scope.actions.apply($scope);
                    }
                });
            }
        };
        $.get(base+'/api/coverTemplates', function(json) {
            $scope.covers.items = json.items;
            $scope.covers.path = json.path;
            $scope.actions.apply($scope);
        });

        var messagesFromIframe = function (e) {
            switch(e.data.action){
                case 'save-link':
                    saveLink(e.data.item);
                    break;
            }
        };

        window.removeEventListener("message", messagesFromIframe);
        window.addEventListener("message", messagesFromIframe);
    })


    .controller('Done', function($scope, $location){
        if ($scope.data.count==0)
            $location.path('/');
    })



    .controller('Auth', function($scope){

    })


    .controller('ResetData', function($scope, Api, $timeout){
        var index = -1,
            count = 0,
            items = [],
            del = function() {
                index++;
                if (index<count){
                    Api.del('collection/'+items[index]._id, function(){
                        $timeout( function() {
                            del();
                        },200);
                    });
                }
                else{
                    $scope.step='done';
                }
            };

        $scope.startReset = function() {
            $scope.step = 'working';
            Api.get('collections', function(json) {
                items = json.items;
                count = items.length;
                del()
            });
        }
    });





var secureFunx = {
    allowedTags: function(tags) {
        var temp=tags;
        tags=[];

        //string with comma
        if (typeof temp == 'string'){
            temp=temp.split(',');
        }

        for(var i in temp)
            if (typeof temp[i] == 'string'){
                temp[i] = S(temp[i]).trim().collapseWhitespace().s;
                temp[i] = temp[i].replace(/[^a-zA-ZА-Яа-я0-9\.\s]/g,"");
                if (temp[i]!='')
                    tags.push(temp[i]);
            }

        return tags;
    }
}