var keypress, scrollTimeout=null;

var validateLang = function(s) {
  var langCodes = {
    'ru': "ru_RU",
    'en': "en_US",
    'es': "es_ES",
    'nl': "nl_NL",
    'pl': "pl_PL",
    'de': 'de_DE',
    'ko': 'ko_KR',
    'no': 'no_NO',
    'it': 'it_IT',
    'fr': 'fr_FR',
    'ja': 'ja_JP',
    'ro': 'ro_RO',
    'kk': 'kk_KZ'
  };
  var clean = false;
  try{
    if (s.toLowerCase() == 'pt_br')
      clean = 'pt_BR'
    else if (s.toLowerCase() == 'zh_tw')
      clean = 'zh_TW'
    else if (s.toLowerCase() == 'zh_cn')
      clean = 'zh_CN'
    else if (typeof langCodes[s.substr(0,2).toLowerCase()] != 'undefined')
      clean = langCodes[s.substr(0,2).toLowerCase()];
  } catch(e) {if (e) clean = false;}

  if (clean)
    return clean;

  return langCodes['en'];
}

var scrollToElement = function(id, parentID) {
  setTimeout(function() {
    if (typeof parentID == "undefined")
      parentID = ".nano-content:eq(0)";

    var parent = $(parentID),
        child = $('#'+id);
    if (child.length>0)
    if (child.position().top+child.height() >parent.height())
      parent.scrollTop(child.position().top);
  },1);
}

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
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
    isURL: function(url) {
      var isFQDN = function (str) {
        options = {require_tld: true
          , allow_underscores: false
          , allow_trailing_dot: false};

        /* Remove the optional trailing dot before checking validity */
        if (options.allow_trailing_dot && str[str.length - 1] === '.') {
          str = str.substring(0, str.length - 1);
        }
        var parts = str.split('.');
        if (options.require_tld) {
          var tld = parts.pop();
          if (!parts.length || !/^[a-z]{2,}$/i.test(tld)) {
            return false;
          }
        }
        for (var part, i = 0; i < parts.length; i++) {
          part = parts[i];
          if (options.allow_underscores) {
            if (part.indexOf('__') >= 0) {
              return false;
            }
            part = part.replace(/_/g, '');
          }
          if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
            return false;
          }
          if (part[0] === '-' || part[part.length - 1] === '-' ||
              part.indexOf('---') >= 0) {
            return false;
          }
        }
        return true;
      };

      var isIP = function (str, version) {
        var ipv4Maybe = /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/
            , ipv6 = /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/;

        version = '4';
        if (!version) {
          return isIP(str, 4) || isIP(str, 6);
        } else if (version === '4') {
          if (!ipv4Maybe.test(str)) {
            return false;
          }
          var parts = str.split('.').sort(function (a, b) {
            return a - b;
          });
          return parts[3] <= 255;
        }
        return version === '6' && ipv6.test(str);
      }

      var options= {
        protocols: [ 'http', 'https', 'ftp' ]
        , require_tld: true
        , require_protocol: false
        , allow_underscores: false
        , allow_trailing_dot: false
      };

      if (!url || url.length >= 2083) {
        return false;
      }
      if (url.indexOf('mailto:') === 0) {
        return false;
      }

      var protocol, user, pass, auth, host, hostname, port,
          port_str, path, query, hash, split;
      split = url.split('://');
      if (split.length > 1) {
        protocol = split.shift();
        if (options.protocols.indexOf(protocol) === -1) {
          return false;
        }
      } else if (options.require_protocol) {
        return false;
      }
      url = split.join('://');
      split = url.split('#');
      url = split.shift();
      hash = split.join('#');
      if (hash && /\s/.test(hash)) {
        return false;
      }
      split = url.split('?');
      url = split.shift();
      query = split.join('?');
      if (query && /\s/.test(query)) {
        return false;
      }
      split = url.split('/');
      url = split.shift();
      path = split.join('/');
      if (path && /\s/.test(path)) {
        return false;
      }
      split = url.split('@');
      if (split.length > 1) {
        auth = split.shift();
        if (auth.indexOf(':') >= 0) {
          auth = auth.split(':');
          user = auth.shift();
          if (!/^\S+$/.test(user)) {
            return false;
          }
          pass = auth.join(':');
          if (!/^\S*$/.test(user)) {
            return false;
          }
        }
      }
      hostname = split.join('@');
      split = hostname.split(':');
      host = split.shift();
      if (split.length) {
        port_str = split.join(':');
        port = parseInt(port_str, 10);
        if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
          return false;
        }
      }
      if (!isIP(host) && !isFQDN(host, options) &&
          host !== 'localhost') {
        return false;
      }
      if (options.host_whitelist &&
          options.host_whitelist.indexOf(host) === -1) {
        return false;
      }
      if (options.host_blacklist &&
          options.host_blacklist.indexOf(host) !== -1) {
        return false;
      }
      return true;
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
.filter('encodeURI', function() {
  return function(input) {
    return encodeURIComponent(input||"");
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
  "translateFilter", function(translateFilter) {
    return {
      restrict: "EA",
      replace: true,
      templateUrl: 'templates/extra/search.html?'+window.appVersion,
      scope: {
        submit: '&',
        keys: '=',
        autocomplete: '='
      },
      link: function(scope, element, attrs) {
        var fixed;
        scope.mother = scope.$parent;
        scope.allowedType = attrs.allowedType;
        scope.placeholder = translateFilter(attrs.placeholder);

        scope.key = '';
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
          completeIndex: null,
          add: function(fromComplete) {
            var canAdd, i, key, val;
            if (fromComplete) {
              if (scope.complete.last > -1) {
                scope.key = scope.complete.count[scope.complete.last].val;
              }
            }
            scope.complete.last = -1;
            try {
              scope.key = scope.key.trim();
            }catch(e){}
            if (scope.key.match(new RegExp(/(^|\s)#([^ ]*)/i)) || scope.allowedType === 'tag') {
              key = 'tag';
              scope.key = scope.key.replace(/,/g, '').replace(/#/g, '');
              console.log(scope.key)
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
            this.reset();
          },
          remove: function(i) {
            if (scope.keys[i].key === 'collection') {
              scope.keys.splice(0, i + 1);
            } else {
              scope.keys.splice(i, 1);
            }
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
            scope.editMode = false;
            scope.complete.last = scope.complete.index;
            return scope.complete.index = -1;
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
          }
        };
        scope.complete = {
          count: [],
          index: -1,
          last: -1,
          down: function() {
            if ((this.index + 1) < this.count.length) {
              return this.index++;
            }
          },
          up: function() {
            if (this.index >= 1) {
              return this.index--;
            }
          },
          setKey: function(val) {
            scope.key = val;
            scope.actions.add();
          },
          setMode: function(v) {
            if (v){
              if ((scope.focused) && (scope.keyoninput))
                angular.element(document).find('body').addClass('autocomplete-showing');
            }else{
              angular.element(document).find('body').removeClass('autocomplete-showing');
            }
          }
        };

        angular.element('#search-form ul:eq(0)').off('click').on('click', function() {
          scope.keyoninput=true;
          element.find('.es-input input:eq(0)').focus();
        });


        scope.$on("extraSearch-Add", function(e, info) {
          scope.key = info;
          scope.actions.add(true);
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
            element.css('background-image', "url('"+temp+"')");
          else
            element.css('background-image', '');
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
            element.css('background-image', "url('https://www.gravatar.com/avatar/"+scope.gravatar+"?d=mm&s=48')");
          else
            element.css('background-image', '');
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
            if (!elem.hasClass('js-overflowDisabled')){
              elem.find('.nano-content:eq(0)').off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {
                  var d = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                      dir = d > 0 ? 'up' : 'down',
                      stop = (dir == 'up' && this.scrollTop == 0) || (dir == 'down' && this.scrollTop == this.scrollHeight-this.offsetHeight);
                  stop && e.preventDefault();
              });
              elem.addClass('js-overflowDisabled');
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


.filter('numnominus', function () {
  return function (text) {
    text = text || 0;
    if (text<0) text = 0;
    return parseInt(text);
  };
})


.filter('retina', function () {
  return function (i) {
    i = parseInt(i);

    if (window.devicePixelRatio==1)
      return i;
    else {
      switch(i){
        case 100:
          return 230;
        break;
        case 230:
          return 460;
        break;
        default:
          return i;
        break;
      }
    }

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
      templateUrl: 'templates/extra/notify.html?'+window.appVersion,
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
      templateUrl: 'templates/extra/modal.html?'+window.appVersion,
      replace: true,
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.mother = scope.$parent;

        scope.modal={
          init: false,
          parseQuery: function() {
            var s = $location.search(), none=false,
                modals = ['bookmark','share','move-bookmarks','fastsave','add-url'];
            for(var i in s){
              none = i;
              break;
            }

            if (!none)
              scope.modal.hide(true);
            else
              for(var i in modals) {
                if (modals[i] == none) {
                  scope.modal.showTime({src: modals[i]});
                  break;
                }
              }
          },
          show: false,
          hover: false,
          showTime: function(info) {
            scope.modal.show = true;
            scope.modal.src = info.src;
            if (info.src != 'fastsave')
              angular.element(document).find('body').addClass('modal-mode');
          },
          hide: function(force) {
            if ((!this.hover)||(typeof force !="undefined")) {
              this.show = false;
              angular.element(document).find('body').removeClass('modal-mode');
              $location.search({});
            }
          }
        };

        scope.$on("Modal-Show", function(e, info) {
          scope.modal.showTime(info);
        });

        scope.$on("Modal-Hide", function(e) {
          scope.modal.hide(true);
        });

        scope.$on("App-Init-Done", function(e) {
          if (!scope.modal.init) {
            scope.modal.init = true;
            scope.$on('$locationChangeSuccess', scope.modal.parseQuery);
          }
          scope.modal.parseQuery();
        });
      }
    };
  }
])



.directive('ngContextMenu', function ($parse) {
    var renderContextMenu = function ($scope, event, options, element) {
      if (typeof remote == "undefined") {
        if (!$) {
          var $ = angular.element;
        }
        element.addClass('context');
        var $contextMenu = angular.element('<div>');
        $contextMenu.addClass('dropdown clearfix');
        var $ul = angular.element('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.attr({'role': 'menu'});
        $ul.css({
          display: 'block',
          position: 'absolute',
          left: event.pageX + 'px',
          top: event.pageY + 'px'
        });
        angular.forEach(options, function (item, i) {
          var $li = angular.element('<li>');
          if (item === null) {
            $li.addClass('divider');
          } else {
            $a = angular.element('<a>');
            $a.attr({tabindex: '-1', href: ''});
            $a.text(item[0]);
            $li.append($a);
            $li.on('click', function () {
              $scope.$apply(function () {
                item[1].call($scope, $scope);
              });
              element.removeClass('context');
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
        angular.element(document).find('body').append($contextMenu);
        $contextMenu.on("click", function (e) {
          element.removeClass('context');
          $contextMenu.remove();
        }).on('contextmenu', function (event) {
          element.removeClass('context');
          event.preventDefault();
          $contextMenu.remove();
        });

        //if not visible
        var i = {
          cw: angular.element('.dropdown-menu').width(),
          sw: angular.element('body').width(),
          cl: parseInt(angular.element('.dropdown-menu').css('left')),

          ch: angular.element('.dropdown-menu').height(),
          sh: angular.element(window).height(),
          ct: parseInt(angular.element('.dropdown-menu').css('top'))
        }

        if (i.sw < i.cl + i.cw) {
          angular.element('.dropdown-menu').css('left', event.pageX - i.cw);
        }

        if (i.sh < i.ct + i.ch) {
          angular.element('.dropdown-menu').css('top', event.pageY - i.ch);
        }
      }else{
        //desktop
        var menu = new Menu();
        angular.forEach(options, function (item, i) {
          if (item === null) {
            menu.append(new MenuItem({ type: 'separator' }));
          }
          else{
            menu.append(new MenuItem({ label: item[0], click: function() {
              item[1].call($scope, $scope);

              try {
                if (!$scope.$$phase)
                  $scope.$apply();
              } catch (_error) {}
            } }));
          }
        });
        menu.popup(remote.getCurrentWindow());
      }
    };
    return function ($scope, element, attrs) {
        var onClick = function (event) {
          $scope.$apply(function () {
            event.preventDefault();
            var options = $scope.$eval(attrs.ngContextMenu);
            if (options instanceof Array) {
              renderContextMenu($scope, event, options, element);
            } else {
              throw '"' + attrs.ngContextMenu + '" not an array';
            }
          });
        };

        var moreIcon = element.find('.context-menu-show');
        if (moreIcon.length>0)
          moreIcon.on('mousedown', onClick);
        element.on('contextmenu', onClick);
    };
})

.directive("disableAnimate", function($animate) {
  return function($scope, $element) {
    return $animate.enabled(false, $element);
  };
})


.directive("focusElement", function($animate, $timeout) {
  return function($scope, $element, attrs) {
    $element.focus();
    if (attrs.focusElement=='select')
      $timeout(function() {$element.select();}, 0);
    else
      $timeout(function() {$element.focus();}, 100);
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

.filter("domainCover", function() {
  return function(str, opacity) {
    var b, bigint, colour, g, hash, i, r, value;
    hash = 0;
    i = 0;
    while (i < str.length) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      i++;
    }
    colour = "";
    i = 0;
    while (i < 3) {
      value = (hash >> (i * 8)) & 0xff;
      colour += ("00" + value.toString(16)).substr(-2);
      i++;
    }
    bigint = parseInt(colour, 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
    return 'rgba(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ',' + opacity + ')';
  };
})

.directive("selectCollection", ["Api", "Boot", "$timeout", function(Api, Boot, $timeout) {
  return {
    templateUrl: 'templates/extra/select-collection.html?'+window.appVersion,
    replace: true,
    restrict: 'E',
    scope: {
      base: '=',
      group: '=',
      parent: '=',
      disableId: '=',
      enableCollections: '='
    },
    link: function ($scope, element, attrs) {
      $scope.items=[];

      $scope.enableGroups = (attrs.disableGroups?false:true);
      $scope.showSystemCollections = (attrs.showSystemCollections?true:false);

      $scope.select = function(t,i) {
        switch(t){
          case 'group':
              $scope.group = i;
              $scope.parent = null;
            break;
          case 'collection':
            $scope.parent = {"$id": i};
            break;
        }
        $timeout( function() {
          Boot.broadcast("set-parent", {type:t, id:i});
        },0);
      }

      $scope.base.forEach(function(group,index){
        group.collections.forEach( function(collection) {
          $scope.items.push({
            _id: parseInt(collection._id),
            title: collection.title,
            parent: 'group' + index,
            cover: collection.cover
          });
        });
      });

      Api.get('childrens', function(childs) {
        $.merge( $scope.items, childs.items );

        for(var i in $scope.items)
          for(var j in $scope.items) {
            if (typeof $scope.items[i].parent.$id != 'undefined')
              $scope.items[i].parent = parseInt($scope.items[i].parent.$id);

            if ($scope.items[i].parent == $scope.items[j]._id)
              $scope.items[j].havechildrens = true
          }
      });
    }
  }
}])


.directive('desktopBrowser', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if (environment.name == 'desktop') {
        element.bind('click', function() {
          Shell.openExternal($(element).attr('href'));
          return false;
        });
      }else if (typeof environment.safariLinks != 'undefined'){
        element.bind('click', function() {
          safari.application.activeBrowserWindow.openTab().url = $(element).attr('href');
          safari.self.hide()
          return false;
        });
      }
    }
  };
})


.directive('safariLink', function () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if (typeof environment.safariLinks != 'undefined'){
        element.bind('click', function() {
          safari.application.activeBrowserWindow.openTab().url = $(element).attr('href');
          safari.self.hide()
          return false;
        });
      }
    }
  };
})


.directive('desktopDrop', ["$rootScope", function ($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if (environment.name == 'desktop') {
        element.on("dragover", function(e) {
          if (e.originalEvent.dataTransfer.getData('text/uri-list')) {
            e.originalEvent.dataTransfer.dropEffect = "copy";
            if (e.preventDefault) e.preventDefault();

            this.classList.add("desktop-drag-over");
          }
        });

        element.on("dragenter", function(e) {
          if (e.originalEvent.dataTransfer.getData('text/uri-list')) {
            e.originalEvent.dataTransfer.dropEffect = "copy";
            this.classList.add("desktop-drag-over");
          }
        });

        element.on("dragleave", function(e) {
          this.classList.remove("desktop-drag-over");
        });

        element.on("drop", function(e) {
          var dropURL;
          try {
            dropURL = e.originalEvent.dataTransfer.getData(/*e.originalEvent.dataTransfer.types[0] ||*/ 'text/uri-list');
          } catch (e) {
          }

          if (dropURL) {
            e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();

            this.classList.remove("desktop-drag-over");

            if (dropURL) {
              if (window.location.hash != '/bookmarks/' + parseInt(this.getAttribute("desktop-drop")))
                $rootScope.actions.redirect('/bookmarks/' + parseInt(this.getAttribute("desktop-drop")));
              $rootScope.bookmarkWorker.dropURL(dropURL, parseInt(this.getAttribute("desktop-drop")));
            }
          }
        });
      }
    }
  };
}])


.directive('dropCover', function () {
  return {
    restrict: 'A',
    scope: {
      dropCover: '&',
      covers: '='
    },
    link: function(scope, element, attrs) {
      if (environment.name == 'desktop') {
        element.on("dragover", function(e) {
          e.originalEvent.dataTransfer.dropEffect = "copy";
          if (e.preventDefault) e.preventDefault();
          this.classList.add("desktop-drag-over");
        });

        element.on("dragenter", function(e) {
          e.originalEvent.dataTransfer.dropEffect = "copy";
          this.classList.add("desktop-drag-over");
        });

        element.on("dragleave", function(e) {
          this.classList.remove("desktop-drag-over");
        });

        element.on("drop", function(e) {
          e.preventDefault();
          if (e.stopPropagation) e.stopPropagation();

          this.classList.remove("desktop-drag-over");

          var dropURL;
          try {
            dropURL = e.originalEvent.dataTransfer.getData(/*e.originalEvent.dataTransfer.types[0] ||*/ 'text/uri-list');
          } catch (e) {
          }

          if (dropURL) {
            $.ajax({
              type: "HEAD",
              async: true,
              url: dropURL,
              success: function (message, text, response) {
                var mimeTypes = {
                  'image':['image/jpeg','image/png','image/gif'],
                  //'html':['text/html',/*'text/plain',*/'application/xhtml+xml']
                };

                var mime = "",
                    mimeType = null;
                try{
                  mime = response.getResponseHeader('Content-Type').toLowerCase()
                }catch(e){}
                for (var i in mimeTypes)
                  for (var j in mimeTypes[i])
                    if (mimeTypes[i][j]==mime)
                      mimeType = i;

                if (mimeType=='image'){
                  if (typeof scope.covers != 'object')
                    scope.covers = [];

                  scope.covers.push({link: dropURL, type: 'image'});
                  scope.dropCover();
                }
              },
              onerror: function () {

              }
            });
          }
        });
      }
    }
  };
})




.directive("windowActions", [
  "$timeout", function($timeout) {
    return {
      template: '<ul class="mac-window-actions"><li class="mwa-red" ng-click="win.close()"></li><li class="mwa-yellow" ng-click="win.minimize()"></li><li class="mwa-green" ng-click="win.maximize()"></li></ul>',
      replace: true,
      restrict: 'E',
      link: function($scope, elem) {
        $scope.win = {
          close: function() {
            Desktop.hide();
          },
          minimize: function() {
            Desktop.minimize();
          },
          maximize: function() {
            Desktop.maximize();
          }
        }
      }
    };
  }
])




.service('imageService', function ($http, $q, $timeout) {
  var NUM_LOBES = 3
  var lanczos = lanczosGenerator(NUM_LOBES)

  // resize via lanczos-sinc convolution
  this.resize = function (img, width, height) {
    var self = { }

    self.type    = "image/png"
    self.quality = 1.0
    self.resultD = $q.defer()

    self.canvas = document.createElement('canvas')

    self.ctx = getContext(self.canvas)
    self.ctx.imageSmoothingEnabled       = true
    self.ctx.mozImageSmoothingEnabled    = true
    self.ctx.oImageSmoothingEnabled      = true
    self.ctx.webkitImageSmoothingEnabled = true

    if (img.naturalWidth <= width || img.naturalHeight <= height) {
      console.log("FAST resizing image", img.naturalWidth, img.naturalHeight, "=>", width, height)

      self.canvas.width  = width
      self.canvas.height = height
      self.ctx.drawImage(img, 0, 0, width, height)
      resolveLanczos(self)
    } else {
      console.log("SLOW resizing image", img.naturalWidth, img.naturalHeight, "=>", width, height)

      self.canvas.width  = img.naturalWidth
      self.canvas.height = img.naturalHeight
      self.ctx.drawImage(img, 0, 0, self.canvas.width, self.canvas.height)

      self.img = img
      self.src = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height)
      self.dest = {
        width:  width,
        height: height
      }
      self.dest.data = new Array(self.dest.width * self.dest.height * 4)

      self.ratio     = img.naturalWidth / width
      self.rcpRatio  = 2 / self.ratio
      self.range2    = Math.ceil(self.ratio * NUM_LOBES / 2)
      self.cacheLanc = {}
      self.center    = {}
      self.icenter   = {}

      $timeout(function () { applyLanczosColumn(self, 0) })
    }

    return self.resultD.promise
  }

  function applyLanczosColumn (self, u) {
    self.center.x  = (u + 0.5) * self.ratio
    self.icenter.x = self.center.x | 0

    for (var v = 0; v < self.dest.height; v++) {
      self.center.y  = (v + 0.5) * self.ratio
      self.icenter.y = self.center.y | 0

      var a, r, g, b
      a = r = g = b = 0

      var norm = 0
      var idx

      for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
        if (i < 0 || i >= self.src.width) continue
        var fX = (1000 * Math.abs(i - self.center.x)) | 0
        if (!self.cacheLanc[fX]) {
          self.cacheLanc[fX] = {}
        }

        for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
          if (j < 0 || j >= self.src.height) continue

          var fY = (1000 * Math.abs(j - self.center.y)) | 0
          if (self.cacheLanc[fX][fY] === undefined) {
            self.cacheLanc[fX][fY] = lanczos(Math.sqrt(Math.pow(fX * self.rcpRatio, 2) + Math.pow(fY * self.rcpRatio, 2)) / 1000)
          }

          var weight = self.cacheLanc[fX][fY]
          if (weight > 0) {
            idx = (j * self.src.width + i) * 4
            norm += weight

            r += weight * self.src.data[idx + 0]
            g += weight * self.src.data[idx + 1]
            b += weight * self.src.data[idx + 2]
            a += weight * self.src.data[idx + 3]
          }
        }
      }

      idx = (v * self.dest.width + u) * 4
      self.dest.data[idx + 0] = r / norm
      self.dest.data[idx + 1] = g / norm
      self.dest.data[idx + 2] = b / norm
      self.dest.data[idx + 3] = a / norm
    }

    if (++u < self.dest.width) {
      if (u % 16 === 0) {
        $timeout(function () { applyLanczosColumn(self, u) })
      } else {
        applyLanczosColumn(self, u)
      }
    } else {
      $timeout(function () { finalizeLanczos(self) })
    }
  }

  function finalizeLanczos (self) {
    self.canvas.width  = self.dest.width
    self.canvas.height = self.dest.height
    //self.ctx.drawImage(self.img, 0, 0, self.dest.width, self.dest.height)
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height)
    var idx
    for (var i = 0; i < self.dest.width; i++) {
      for (var j = 0; j < self.dest.height; j++) {
        idx = (j * self.dest.width + i) * 4
        self.src.data[idx + 0] = self.dest.data[idx + 0]
        self.src.data[idx + 1] = self.dest.data[idx + 1]
        self.src.data[idx + 2] = self.dest.data[idx + 2]
        self.src.data[idx + 3] = self.dest.data[idx + 3]
      }
    }
    self.ctx.putImageData(self.src, 0, 0)
    resolveLanczos(self)
  }

  function resolveLanczos (self) {
    var result = new Image()

    result.onload = function () {
      self.resultD.resolve(result)
    }

    result.onerror = function (err) {
      self.resultD.reject(err)
    }

    result.src = self.canvas.toDataURL(self.type, self.quality)
  }

  // resize by stepping down
  this.resizeStep = function (img, width, height, quality) {
    quality = quality || 1.0

    var resultD = $q.defer()
    var canvas  = document.createElement( 'canvas' )
    var context = getContext(canvas)
    var type = "image/png"

    var cW = img.naturalWidth
    var cH = img.naturalHeight

    var dst = new Image()
    var tmp = null

    //resultD.resolve(img)
    //return resultD.promise

    function stepDown () {
      cW = Math.max(cW / 2, width) | 0
      cH = Math.max(cH / 2, height) | 0

      canvas.width  = cW
      canvas.height = cH

      context.drawImage(tmp || img, 0, 0, cW, cH)

      dst.src = canvas.toDataURL(type, quality)

      if (cW <= width || cH <= height) {
        return resultD.resolve(dst)
      }

      if (!tmp) {
        tmp = new Image()
        tmp.onload = stepDown
      }

      tmp.src = dst.src
    }

    if (cW <= width || cH <= height || cW / 2 < width || cH / 2 < height) {
      canvas.width  = width
      canvas.height = height
      context.drawImage(img, 0, 0, width, height)
      dst.src = canvas.toDataURL(type, quality)

      resultD.resolve(dst)
    } else {
      stepDown()
    }

    return resultD.promise
  }

  function getContext (canvas) {
    var context = canvas.getContext('2d')

    context.imageSmoothingEnabled       = true
    context.mozImageSmoothingEnabled    = true
    context.oImageSmoothingEnabled      = true
    context.webkitImageSmoothingEnabled = true

    return context
  }

  // returns a function that calculates lanczos weight
  function lanczosGenerator (lobes) {
    var recLobes = 1.0 / lobes

    return function (x) {
      if (x > lobes) return 0
      x *= Math.PI
      if (Math.abs(x) < 1e-16) return 1
      var xx = x * recLobes
      return Math.sin(x) * Math.sin(xx) / x / xx
    }
  }
})


.directive("bsahere", [
  "$timeout", function($timeout) {
    return {
      restrict: "C",
      link: function(scope, element, attrs) {
        var bsaNOW;
        bsaNOW = function() {
          var i;
          $('script[src*="buysellads.com"]').remove();
          for (i in window) {
            if ((i.indexOf('bsa') >= 0) || (i.indexOf('_bi') >= 0) || (i === '__babas') || (i === 'IAmGot') || (i === 'rid') || (i === 'oldproonload')) {
              window[i] = void 0;
            }
          }
          $('.bsahere').each(function(i) {
            return $(this).html('<div id="' + $(this).attr('data-num') + '" class="' + $(this).attr('data-bsa') + '"></div>');
          });
          return $timeout(function() {
            var bsa;
            $('script[src*="buysellads.com"]').remove();
            bsa = document.createElement("script");
            bsa.type = "text/javascript";
            bsa.async = true;
            bsa.src = "https://s3.buysellads.com/ac/bsa.js";
            bsa.id = "bsaHEAD";
            return (document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(bsa);
          }, 0);
        };
        bsaNOW();
        return scope.$on("$stateChangeStart", function() {
          return $timeout(function() {
            return bsaNOW();
          }, 0);
        });
      }
    };
  }
]);