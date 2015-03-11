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
		resetDataWarning: "All your collections and bookmarks on Raindrop.io will be removed without possibility to restore them.",
		resetDataYes: "Yes, remove all collections and bookmarks",
		resetDone: "Done!",
		goBack: "Go back",
		goToRaindrop: "Show bookmarks",
		elapsed: "Completed ",
		otherServices: "Other services",
		universal: "Universal"
	},

	"ru_RU" : {
		importBookmarks: "Перенести закладки",
		to: "на",
		hi: "Привет",
		hiD: ", какие закладки ты хочешь перенести?",
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
		importInProgress: "Происходит перенос закладок",
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
		goToRaindrop: "Посмотреть закладки",
		elapsed: "Завершиться ",
		otherServices: "Из других сервисов",
		universal: "Универсальный"
	}
}

/* Application */
var app=angular.module('import', ['ngAnimate', 'ngRoute', 'pascalprecht.translate', 'popup.services', 'LocalStorageModule', 'multi-select'])
.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			controller:'Home',
			templateUrl:'templates/home.html?'+new Date().getTime()
		})
		.when('/browser', {
			controller:'Browser',
			templateUrl:'templates/browser.html?'+new Date().getTime()
		})
		.when('/config', {
			controller:'Config',
			templateUrl:'templates/config.html?'+new Date().getTime()
		})
		.when('/start', {
			controller:'Start',
			templateUrl:'templates/start.html?'+new Date().getTime()
		})
		.when('/done', {
			controller:'Done',
			templateUrl:'templates/done.html?'+new Date().getTime()
		})
		.when('/auth', {
			controller:'Auth',
			templateUrl:'templates/auth.html?'+new Date().getTime()
		})

		.when('/resetdata', {
			controller:'ResetData',
			templateUrl:'templates/resetdata.html?'+new Date().getTime()
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
	moment.locale(lang);

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
		removeDublicates: true,
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
					contents = "";
					$('#temphtml ul').each(function(i){
						var secTitle = $('#temphtml h1').eq(i).text(),
							secReplaces = {
								'Unread': "Pocket",
								'Read Archive': "Pocket Archive"
							};
						try {
							if (secReplaces[secTitle])
							secTitle = secReplaces[secTitle];
						}catch(e) {}

						contents += '<ul title="'+secTitle+'">'+$(this).html()+'</ul>';
					});
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
						section = $(this).parents('ul').eq(0).attr('title');
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

					var lastUpdate = $(this).attr('add_date') || $(this).attr('time_added') || 0;
					try {
						if (lastUpdate == 0)
							lastUpdate = undefined;
						else if (parseInt(lastUpdate) != NaN)
							lastUpdate = parseInt(lastUpdate) * 1000;
						else
							lastUpdate = new Date(lastUpdate).getTime();
					} catch(e) {
						if (e)
							lastUpdate = undefined;
					}

                    items[ section ].push({
                    	url: $(this).attr('href'),
                    	title: $(this).text() || 'Untitled',
                    	excerpt: excerpt,
                    	tags: tags,
						lastUpdate: lastUpdate
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
						excerpt: item.article__excerpt,
						lastUpdate: Date.parse(item.date_added)
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
						title: item.title,
						lastUpdate: item.dateAdded
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
				saver.parse();
				saver.checker();
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



	$scope.saver = {
		avgTime: 0,
		elapsed: null
	};

	var saver = {
		times: [0],
		lastTime: 0,
		desktopParser: false,
		checkInterval: null,
		getDomain: function(url){
			var a = document.createElement('a');
			a.href = url;
			var host = a.hostname;
			delete a;
			return host;
		},
		blank: function(url) {
			return {
				link: url,
				title: 'Untitled'/*parser.makeTitle(url)*/,
				excerpt: "",
				type: "link",
				result: true,
				media: [],
				html: "",
				domain: this.getDomain(url)
			};
		},
		makeItem: function(url,callback) {
			var parserURL = (this.desktopParser ? "http://127.0.0.1:1505/parse?url=" : base+"/api/parse?url=");
			var parserHTTP = $.get(parserURL+encodeURIComponent(url), function (json) {
				try{
					json = JSON.parse(json);
				}catch(e){}

				json = json || {result: false};
				json.result = json.result || false;
				if (json.result){
					json.item.link = json.item.url = url;
					json.item.result = true;
					callback(json.item);
				}
				else
					callback(saver.blank(url));
			})
			.fail(function () {
				callback(saver.blank(url));
			});
		},
		parse: function() {
			if (this.lastTime==0){
				this.lastTime = new Date().getTime();
			}else{
				this.times.push( new Date().getTime() - this.lastTime );
				this.lastTime = new Date().getTime();
				$scope.saver.avgTime = _.reduce(this.times, function(memo, num) {
					return memo + num;
				}, 0) / (this.times.length === 0 ? 1 : this.times.length);

				$scope.saver.elapsed = moment( new Date().getTime() + ((links.length - $scope.data.index)*$scope.saver.avgTime) ).fromNow();
			}

			if ($scope.data.index<$scope.data.count-1){
				$scope.data.index++;
				$scope.actions.apply($scope);

				var tempIndex = $scope.data.index;
				if ($scope.data.removeDublicates)
					$.post(base+'/api/check/url', {url: links[tempIndex].url}, function(cResult){
						if (!cResult.result)
							saver.save(tempIndex);
						else{
							$scope.data.dublicates++;
							saver.parse();
						}
					})
						.fail(function(){
							$scope.data.errors++;
							saver.parse();
						});
				else {
					saver.save(tempIndex);
				}
			}
			else{
				$location.path('/done');
				$scope.actions.apply($scope);
			}
		},
		save: function(index) {
			this.makeItem(links[index].url,function(item){
				var tempItem = JSON.parse(JSON.stringify(item));
				tempItem.url = tempItem.link = links[index].url;

				tempItem.title = links[index].title || tempItem.title;
				try{
					if (validator.isURL(tempItem.title))
						tempItem.title = item.title;
				}
				catch(e) {
					if (e) tempItem.title = "";
				}

				if (tempItem.title == "")
					tempItem.title = links[index].title || tempItem.title;

				tempItem.excerpt = links[index].excerpt || tempItem.excerpt;
				tempItem.html = (tempItem.type == "link" ? "" : tempItem.html);
				tempItem.tags = links[index].tags || [];
				tempItem.cover = 0;
				tempItem.collectionId = links[index].collectionId;

				if (typeof links[index].lastUpdate != "undefined")
					tempItem.lastUpdate = links[index].lastUpdate;

				links[index].saved = true;

				$.post(base + '/api/raindrop', tempItem, function () {
					tempItem = null;
					saver.parse();
				})
					.fail(function(){
						tempItem = null;
						$scope.data.errors++;
						saver.parse();
					});
			});
		},

		checker: function() {
			console.log('start checker');
			var _this = this;
			clearInterval(this.checkInterval);
			this.checkInterval = setInterval(function(){
				if ($scope.data.index<$scope.data.count-1){
					if (_this.lastTime>0)
					if (new Date(_this.lastTime + 10000) < new Date()){
						_this.parse();
						console.log('STUCK!')
					}
				}else{
					clearInterval(_this.checkInterval);
					_this.checkInterval = null;
				}
			},10000);
		}
	}
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