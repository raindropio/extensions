var keypress, scrollTimeout=null;

var scrollToElement = function(id) {
  setTimeout(function() {
    var parent = $('.nano-content:eq(0)'),
        child = $('#'+id);
    if (child.length>0)
    if (child.position().top+child.height() >parent.height())
      parent.scrollTop(child.position().top);
  },1);
}

var raindropApiProtocol = 'https:';
if ((window.location.protocol=='http:')||(window.location.protocol=='https:'))
  raindropApiProtocol = '';

var popupServices = angular.module('popup.services', [])
.factory('Api', ['$http', 'Boot', function($http, Boot){
	return {
		path: raindropApiProtocol + '//raindrop.io/api/',

		get:function(url,callback) {
			$http.get(this.path+url).success( function(json) {
				//if (Boot.checkResult(json))
					callback(json);
			}).error( function() {
				var json={result:false};
				callback(json);
			} );
		},
		create:function(url,params,callback) {
			$http({
			  url: this.path+url,
			  method: "POST",
			  data: params,
			  headers: {
				'Content-Type': 'application/json; charset=UTF-8'
			  }
			}).success(function(json, status, headers, config) {
				//if (Boot.checkResult(json))
					callback(json);
			}).error( function() {
				var json={result:false};
				callback(json);
			} );
		},
		del:function(url,callback) {
			$http.delete(this.path+url).success( function(json) {
				//if (Boot.checkResult(json))
					callback(json);
			}).error( function() {
				var json={result:false};
				callback(json);
			} );
		},
		update:function(url,params,callback) {
			$http({
			  url: this.path+url,
			  method: "PUT",
			  data: params,
			  headers: {
				'Content-Type': 'application/json; charset=UTF-8'
			  }
			}).success(function(json, status, headers, config) {
				//if (Boot.checkResult(json))
					callback(json);
			}).error( function() {
				var json={result:false};
				callback(json);
			} );
		}
	}
}])
.factory('Boot', [/*'$location',*/'$rootScope', function(/*$location*/$rootScope){
	return {
		checkResult: function(json) {
			if(json.auth!=undefined){
				
				/*$location.url('/auth');*/
				return false;
			}
			return true;
		},
    broadcast: function(event, msg) {
      return $rootScope.$broadcast(event, msg);
    },
    isURL: function(str) {
      if (!str || str.length >= 2083) {
        return false;
      }
      var options = {
          protocols: [ 'http', 'https', 'ftp' ]
        , require_tld: true
        , require_protocol: false
        , allow_underscores: false
      };

      var separators = '-?-?' + (options.allow_underscores ? '_?' : '');
      var url = new RegExp('^(?!mailto:)(?:(?:' + options.protocols.join('|') + ')://)' + (options.require_protocol ? '' : '?') + '(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:www.)?)?(?:(?:[a-z\\u00a1-\\uffff0-9]+' + separators + ')*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+' + separators + ')*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + (options.require_tld ? '' : '?') + ')|localhost)(?::(\\d{1,5}))?(?:(?:/|\\?|#)[^\\s]*)?$', 'i');
      var match = str.match(url)
        , port = match ? match[1] : 0;
      return !!(match && (!port || (port > 0 && port <= 65535)));
    }
	}
}])
.filter('fixURL', function() {
	return function(input) {
		if (input.indexOf('/')==0)
			input='https://raindrop.io'+input;
		return input;
	}
})
.directive("trans", [
  "translateFilter", function(translateFilter) {
    return {
      link: function(scope, element, attr) {
        if (typeof attr.transAttr !== 'undefined') {
          return element.attr(attr.transAttr, translateFilter(attr.trans));
        } else {
          return element.text(translateFilter(attr.trans));
        }
      }
    };
  }
])
.directive("extraSearch", [
  "translateFilter", "$timeout", function(translateFilter, $timeout) {
    return {
      restrict: "EA",
      replace: true,
      templateUrl: 'templates/extra/search.html',
      scope: {
        submit: '&',
        keys: '=',
        autocomplete: '=',
        focused: '=',
        key: '=',
        tags: '='
      },
      link: function(scope, element, attrs) {
        var fixed;
        scope.allowedType = attrs.allowedType;
        scope.placeholder = translateFilter(attrs.placeholder);
        scope.over = false;
        fixed = {
          'link': {
            key: 'type',
            val: 'link'
          },
          'links': {
            key: 'type',
            val: 'link'
          },
          'article': {
            key: 'type',
            val: 'article'
          },
          'articles': {
            key: 'type',
            val: 'article'
          },
          'image': {
            key: 'type',
            val: 'image'
          },
          'images': {
            key: 'type',
            val: 'image'
          },
          'photo': {
            key: 'type',
            val: 'image'
          },
          'photos': {
            key: 'type',
            val: 'image'
          },
          'video': {
            key: 'type',
            val: 'video'
          },
          'videos': {
            key: 'type',
            val: 'video'
          },
          'content': {
            key: 'type',
            val: 'video'
          },
          'ссылка': {
            key: 'type',
            val: 'link'
          },
          'ссылки': {
            key: 'type',
            val: 'link'
          },
          'статья': {
            key: 'type',
            val: 'article'
          },
          'статьи': {
            key: 'type',
            val: 'article'
          },
          'картинка': {
            key: 'type',
            val: 'image'
          },
          'картинки': {
            key: 'type',
            val: 'image'
          },
          'фото': {
            key: 'type',
            val: 'image'
          },
          'фотографии': {
            key: 'type',
            val: 'image'
          },
          'видео': {
            key: 'type',
            val: 'video'
          },
          'контент': {
            key: 'type',
            val: 'video'
          }
        };

        scope.actions = {
          add: function() {
            var canAdd, i, key, val;
            try{
              scope.key = scope.key.trim();
            }catch(e){}

            if (scope.key.match(new RegExp(/(^|\s)#([^ ]*)/i)) || scope.allowedType === 'tag') {
              key = 'tag';
              scope.key = scope.key.replace(/[^a-zA-ZА-Яа-я0-9\.\s]/g, "");
              val = scope.key;
            } else if (scope.key.match(new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/))) {
              key = 'domain';
              val = scope.key.toLowerCase();
            } else if (typeof fixed[scope.key.toLowerCase()] !== 'undefined') {
              key = fixed[scope.key.toLowerCase()].key;
              val = fixed[scope.key.toLowerCase()].val;
            } else {
              key = 'word';
              val = scope.key;
            }

            //is tag?
            for(var i in scope.tags)
              if (scope.tags[i]._id.toLowerCase() == scope.key.toLowerCase()){
                key = 'tag';
                val = scope.key;
              }


            if (scope.key !== '') {
              canAdd = true;
              for (i in scope.keys) {
                if (scope.keys[i].key === key && scope.keys[i].val === val) {
                  canAdd = false;
                }
              }
              if (canAdd) {
                scope.keys.push({
                  key: key,
                  val: val,
                  q: scope.key
                });
                this.send();
              }
              scope.key = "";
            }
            return this.reset();
          },
          remove: function(i) {
            scope.keys.splice(i, 1);
            return this.send();
          },
          back: function() {
            if (scope.editMode) {
              this.remove(scope.keys.length - 1);
              return scope.editMode = false;
            } else {
              if ((scope.key === '') && (scope.keys.length > 0)) {
                return scope.editMode = true;
              }
            }
          },
          reset: function() {
            return scope.editMode = false;
          },
          check: function() {
            if (scope.key[scope.key.length - 1] === ',') {
              scope.key = scope.key.replace(/,/g, '');
              return this.add();
            }
          },
          send: function() {
            if (typeof scope.submit() !== 'undefined') {
              return scope.submit();
            }
          },
          blur: function() {
            if (!scope.over){
              scope.focused=false;
              if (scope.allowedType) scope.actions.add();
            }
          }
        };

        $timeout( function (){
          if (document.getElementById('search-form'))
          document.getElementById('search-form').onclick=function() {
            document.getElementById('search-input').focus()
          }
        },100);

        scope.$on("extraSearch-add", function(e,data) {
          scope.key = data;
          scope.actions.add();
          $timeout( function() {
            document.getElementById('search-input').focus();
          },100);
        });
      }
    };
  }
])

.factory("keypressHelper", [
  "$parse", keypress = function($parse) {
    var capitaliseFirstLetter, keysByCode;
    keysByCode = {
      8: "backspace",
      9: "tab",
      13: "enter",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "delete"
    };
    capitaliseFirstLetter = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return function(mode, scope, elm, attrs) {
      var combinations, params;
      params = void 0;
      combinations = [];
      params = scope.$eval(attrs["ui" + capitaliseFirstLetter(mode)]);
      angular.forEach(params, function(v, k) {
        var combination, expression;
        combination = void 0;
        expression = void 0;
        expression = $parse(v);
        return angular.forEach(k.split(" "), function(variation) {
          combination = {
            expression: expression,
            keys: {}
          };
          angular.forEach(variation.split("-"), function(value) {
            return combination.keys[value] = true;
          });
          return combinations.push(combination);
        });
      });
      return elm.bind(mode, function(event) {
        var altPressed, ctrlPressed, keyCode, metaPressed, shiftPressed;
        metaPressed = !!(event.metaKey && !event.ctrlKey);
        altPressed = !!event.altKey;
        ctrlPressed = !!event.ctrlKey;
        shiftPressed = !!event.shiftKey;
        keyCode = event.keyCode;
        if (mode === "keypress" && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
          keyCode = keyCode - 32;
        }
        return angular.forEach(combinations, function(combination) {
          var altRequired, ctrlRequired, mainKeyPressed, metaRequired, shiftRequired;
          mainKeyPressed = combination.keys[keysByCode[keyCode]] || combination.keys[keyCode.toString()];
          metaRequired = !!combination.keys.meta;
          altRequired = !!combination.keys.alt;
          ctrlRequired = !!combination.keys.ctrl;
          shiftRequired = !!combination.keys.shift;
          if (mainKeyPressed && (metaRequired === metaPressed) && (altRequired === altPressed) && (ctrlRequired === ctrlPressed) && (shiftRequired === shiftPressed)) {
            return scope.$apply(function() {
              return combination.expression(scope, {
                $event: event
              });
            });
          }
        });
      });
    };
  }
])

.directive("uiKeydown", [
  "keypressHelper", function(keypressHelper) {
    return {
      link: function(scope, elm, attrs) {
        return keypressHelper("keydown", scope, elm, attrs);
      }
    };
  }
])

.directive("uiKeypress", [
  "keypressHelper", function(keypressHelper) {
    return {
      link: function(scope, elm, attrs) {
        return keypressHelper("keypress", scope, elm, attrs);
      }
    };
  }
])

.directive("uiKeyup", [
  "keypressHelper", function(keypressHelper) {
    return {
      link: function(scope, elm, attrs) {
        return keypressHelper("keyup", scope, elm, attrs);
      }
    };
  }
])
.filter('fixURL', function() {
  return function(input) {
    if (typeof input == 'undefined') input = '';
    try {
      if (input.indexOf('/')==0)
        input='https://raindrop.io'+input;
    } catch(e) {}
    return input;
  }
})

.directive('backgroundCover', ["fixURLFilter", function(fixURLFilter) {
  return {
    replace: false,
    scope: {
      backgroundCover:'='
    },
    link: function(scope, element, attrs) {
      /*if (typeof scope.backgroundCover != 'undefined')
        $()*/
        var setCover=function() {
          var temp = fixURLFilter(scope.backgroundCover);
          if (temp!='')
            $(element).css('background-image', "url('"+temp+"')");
          else
            $(element).css('background-image', '');
        }

        if (attrs.backgroundCoverWatch)
        scope.$watch('backgroundCover', function() {
          setCover();
        });

        setCover();
    }
  }
}])

.directive('gravatar', function() {
  return {
    replace: false,
    scope: {
      gravatar:'='
    },
    link: function(scope, element) {
        scope.$watch('gravatar', function() {
          if ((scope.gravatar!='')&&(typeof scope.gravatar != 'undefined'))
            $(element).css('background-image', "url('https://www.gravatar.com/avatar/"+scope.gravatar+"?d=mm&s=48')");
          else
            $(element).css('background-image', '');
        });
    }
  }
})

.directive("scrollable", [
  "$timeout", function($timeout) {
    return {
      transclude: true,
      template: '<div class="nano"><div class="nano-content" ng-transclude></div></div>',
      replace: true,
      restrict: 'E',
      priority: 1000,
      link: function($scope, elem) {
        var updateScroll=function(t){
          if (typeof t == 'undefined') t = 0;

          if (scrollTimeout!=null)
            $timeout.cancel(scrollTimeout);

          scrollTimeout = $timeout(function() {
            elem.nanoScroller({
              contentClass: 'nano-content',
              iOSNativeScrolling: true
            });

            //disable overscroll
            if (!$(elem).hasClass('js-overflowDisabled')){
              $(elem).find('.nano-content:eq(0)').off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {
                  var d = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                      dir = d > 0 ? 'up' : 'down',
                      stop = (dir == 'up' && this.scrollTop == 0) || (dir == 'down' && this.scrollTop == this.scrollHeight-this.offsetHeight);
                  stop && e.preventDefault();
              });
              $(elem).addClass('js-overflowDisabled');
            }
          }, t);
        }
        $scope.$on("scrollable-update", function() {
          updateScroll(200);
        });
        updateScroll(100);
      }
    };
  }
])



.filter("sclon", function() {
  return function(s, count) {
    var declOfNum;
    declOfNum = function(number, titles) {
      var cases;
      cases = [2, 0, 1, 1, 1, 2];
      return titles[(number % 100 > 4 && number % 100 < 20 ? 2 : cases[(number % 10 < 5 ? number % 10 : 5)])];
    };
    s = s || 0;
    count = count || 0;
    return s + ( declOfNum(count, ['1', '2', '5']) || '' ).toString();
  };
})


.filter('uriencode', function () {
    return function (text) {
        return encodeURIComponent(text);
    };
})


.filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
})





.directive("extraNotify", [
  "$timeout", function($timeout) {
    return {
      templateUrl: 'templates/extra/notify.html',
      replace: true,
      restrict: 'E',
      link: function(scope, element, attrs, $rootScope) {
        var ftm, tm;
        ftm = null;
        tm = null;

        scope.showNotify = false;
        
        scope.hideNotify = function() {
          scope.showNotify = false;
        };

        scope.$on("Notify-Hide", function() {
          if (scope.showNotify){
            scope.showNotify = false;
            $timeout.cancel(ftm);$timeout.cancel(tm);
          }
        });

        scope.$on("Notify-Show", function(e, info) {
          scope.showNotify = false;

          $timeout.cancel(ftm);
          ftm = $timeout(function() {
            scope.showNotify = true;
            return scope.infoNotify = info;
          }, 50);

          $timeout.cancel(tm);
          tm = $timeout(function() {
            scope.hideNotify();
            try {
              if (!scope.$$phase) {
                return scope.$apply();
              }
            } catch (_error) {}
          }, 4000);
        });
      }
    };
  }
])




.directive("modal", [
  "$timeout", "$location", function($timeout, $location) {
    return {
      templateUrl: 'templates/extra/modal.html',
      replace: true,
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.modal={
          show: false,
          hover: false,
          hide: function(force) {
            if ((!this.hover)||(typeof force !="undefined")) {
              this.show = false;
              $('body').removeClass('modal-mode');
              $location.search({});
            }
          }
        };

        scope.$on("Modal-Show", function(e, info) {
          scope.modal.show = true;
          scope.modal.src = info.src;
          $('body').addClass('modal-mode');
        });

        scope.$on("Modal-Hide", function(e) {
          scope.modal.hide(true);
        });
      }
    };
  }
])



.directive('ngContextMenu', function ($parse) {
    var renderContextMenu = function ($scope, event, options, element) {
        if (!$) { var $ = angular.element; }
        $(element).addClass('context');
        var $contextMenu = $('<div>');
        $contextMenu.addClass('dropdown clearfix');
        var $ul = $('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.attr({ 'role': 'menu' });
        $ul.css({
            display: 'block',
            position: 'absolute',
            left: event.pageX + 'px',
            top: event.pageY + 'px'
        });
        angular.forEach(options, function (item, i) {
            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else {
                $a = $('<a>');
                $a.attr({ tabindex: '-1', href: '' });
                $a.text(item[0]);
                $li.append($a);
                $li.on('click', function () {
                    $scope.$apply(function() {
                        item[1].call($scope, $scope);
                    });
                    $(element).removeClass('context');
                    $contextMenu.remove();
                    return false;
                });
            }
            $ul.append($li);
        });
        $contextMenu.append($ul);
        $contextMenu.css({
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        });
        $(document).find('body').append($contextMenu);
        $contextMenu.on("click", function (e) {
            $(element).removeClass('context');
            $contextMenu.remove();
        }).on('contextmenu', function (event) {
            $(element).removeClass('context');
            event.preventDefault();
            $contextMenu.remove();
        });
    };
    return function ($scope, element, attrs) {
        element.on('contextmenu', function (event) {
            $scope.$apply(function () {
                event.preventDefault();
                var options = $scope.$eval(attrs.ngContextMenu);
                if (options instanceof Array) {
                    renderContextMenu($scope, event, options, element);
                } else {
                    throw '"' + attrs.ngContextMenu + '" not an array';                    
                }
            });
        });
    };
})

.directive("disableAnimate", function($animate) {
  return function($scope, $element) {
    return $animate.enabled(false, $element);
  };
})


.directive("focusElement", function($animate) {
  return function($scope, $element, attrs) {
    $($element).focus();
    if (attrs.focusElement=='select')
      setTimeout(function() {$($element).select();}, 0);
      
  };
})



.filter('highlight', function () {
  return function (text, search) {
    if (text && (search || angular.isNumber(search))) {
      text = text.toString();

      if (typeof search == 'object'){
        for(var i in search)
          text = text.replace(new RegExp(search[i].val.toString(), 'gi'), '<span class="ui-match">$&</span>');

        return text;
      }else{
        search = search.toString();
        
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
})

    .directive('desktopBrowser', function () {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          if (environment.name == 'desktop') {
            element.bind('click', function() {
              Shell.openExternal($(element).attr('href'));
              return false;
            });
          }
        }
      };
    });