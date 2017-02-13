if ((window.top === window)&&(typeof window.RaindropParser == "undefined")) {
	window.RaindropParser={
		minWidth: 200,
		minHeight: 100,
		siteOverrides: {
			'vk.com': {
				selector: ['#fw_post_wrap div.fw_post_info:eq(0) > div:eq(1)', '#pv_photo', '#mv_content', '#wl_post_body'],
				type: 'article'
			},
			'play.google.com': {
				selector: ['.details-wrapper:eq(0)'],
				excerpt: '.id-app-orig-desc:eq(0)',
				title: '.document-title:eq(0)',
				type: 'link'
			}
		},

		grabArticle: null,
		item: {},
		working:{},
		divId: 'inject-raindrop-popup',

		tempDoc: null,
		desktopAppRun: false,

		helpers: {
			iframe: function(attrs) {
	            return '<div class="raindropLikeVideo"><iframe '+(attrs.width!=undefined ? ' width="'+attrs.width+'" ':' ' )+(attrs.height!=undefined ? ' height="'+attrs.height+'" ':' ' )+' src="'+attrs.src+'" frameborder="0" allowfullscreen></iframe></div>'
	                	+(attrs.excerpt!=undefined ? '<div class="raindropLikeVideoDescription">'+attrs.excerpt+'</div>' : '');
	        },

	        html5video: function(attrs) {
	            var str='<div class="raindropLikeVideo"><video '+(attrs.width!=undefined ? ' width="'+attrs.width+'" ':' ' )+(attrs.height!=undefined ? ' height="'+attrs.height+'" ':' ' )+' src="'+attrs.src+'"></video></div>'
					+(attrs.excerpt!=undefined ? '<div class="raindropLikeVideoDescription">'+attrs.excerpt+'</div>' : '');
					console.log(str); return str;
	        },

	        image: function(attrs) {
	        	if (typeof attrs.src!='undefined')
	        		if (typeof attrs.src[0]!='undefined')
	        			attrs.src=attrs.src[0];

	            var str = '<div class="raindropLikeImage">';
	            if (attrs.url!=undefined)
	               str+='<a href="'+attrs.url+'" target="_blank">';
	            str+='<img src="'+attrs.src+'" />';
	            if (attrs.url!=undefined)
	               str+='</a>';
	            str+='</div>';
	            if (attrs.excerpt!=undefined)
	            	str+='<div class="raindropLikeImageDescription">'+attrs.excerpt+'</div>';
	            return str;
	        },

	        removeDublicates: function(arr) {
				var i,
					len=arr.length,
					out=[],
					obj={};

				for (i=0;i<len;i++)
					obj[arr[i]]=0;
				
				for (i in obj)
					out.push(i);
				
				return out;
			},

			parseUrl: function(url) {
				var	a      = document.createElement('a');
					a.href = url;
				return a.protocol+'//'+a.hostname+a.pathname+a.search;
			},

			collapseWhitespace: function(s) {
				s = s.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
				return s;
			},

			truncate: function(str, length, pruneStr) {
				pruneStr = pruneStr || '…';

				if (str.length <= length) return str;

				var r = new RegExp('^(.{' + length.toString() + '}\S*).*$');
				return str.replace(r,"$1") + pruneStr;
			},

			absolutePath: function (base, relative) {
				if (typeof relative == 'undefined')
					return relative;

				if (!relative)
					return relative;

				if (relative=='')
					return relative;

				/*if ((relative.indexOf('http')==0)||(relative.indexOf('mailto:')==0)||(relative.indexOf('ftp://')==0)||(relative.indexOf('file://')==0))
					return relative;

				if (relative.indexOf('//')==0)
					return 'http:'+relative;

				if (relative.indexOf('#')==0)
					return base + relative;*/

				var hbase = document.createElement("base")
				hbase.href = base
				var hhead = document.getElementsByTagName("head")[0]
				hhead.insertBefore(hbase, hhead.firstChild)
				var a = document.createElement("a")
				var resolved
				a.href = relative
				resolved = a.href
				hbase.href = resolved
				hhead.removeChild(hbase)
				return resolved

				/*var stack = base.split("/"),
				parts = relative.split("/");
				stack.pop();
				
				for (var i=0; i<parts.length; i++) {
					if (parts[i] == ".")
						continue;
					if (parts[i] == "..")
						stack.pop();
					else
						stack.push(parts[i]);
				}
				return stack.join("/");*/
			}
		},

		getDomain: function(url){
			var a = document.createElement('a');
			a.href = url;
			var host = a.hostname;
			delete a;
			return host;
		},

		//Run now
		run:function(doneCallback, params) {
			var _this = this;

			if (typeof params == 'undefined')
				params = {};

			this.item={
				url: params.url || window.location.href,
				media: [],
				html: '',
				excerpt: '',
				title: '',
				domain: this.getDomain(params.url || window.location.href),
				type: 'link',
				drop: (params.html?true:false)
			};
			this.working={
				metaTags: {},
				media: [],
				mediaOther: [],
				type: ''
			};

			/*if(params.html){
				$('#raindropPasreHTMLplaceholder').remove();
				this.tempDoc = document.createElement('div');
				this.tempDoc.id = "raindropPasreHTMLplaceholder";
				this.tempDoc.innerHTML = '<div>'+params.html+'</div>';
			}*/

			if (typeof params.type != 'undefined')
			{
				this.item.type = params.type;
				this.item.url = params.url;
				this.item.title = params.title;

				if (params.type=='image'){
					this.working.metaTags['image'] = [params.url];
					this.working.media = [params.url];

					this.item.title = $('img[src="'+params.url+'"][alt!=""]:eq(0)')[0].getAttribute('alt') || $('head:eq(0) title:eq(0)').text() || '';
				}
			}
			else
				this.prepareHTML();

			//set title
			if (this.item.title == '')
				this.item.title = $('title:eq(0)', this.tempDoc).text();

			switch( this.item.type ) {
				case 'video':
					if (this.working.html5video==true)
						this.item.html = this.helpers.iframe({//html5video
							src: this.working.metaTags['video'],
							width: this.working.metaTags['width'],
							height: this.working.metaTags['height'],
							excerpt: this.item.excerpt
						});
					else
						this.item.html = this.helpers.iframe({
							src: this.working.metaTags['player'],
							width: this.working.metaTags['width'],
							height: this.working.metaTags['height'],
							excerpt: this.item.excerpt
						});

					this.done(doneCallback);
				break;
				case 'image':
					this.item.html = this.helpers.image({
						src: this.working.metaTags['image'],
						url: this.item.url,
						excerpt: this.item.excerpt
					});

					this.done(doneCallback);
				break;
				case 'specific':
					var overID=-1;
					for(var i in window.RaindropParser.siteOverrides[this.item.domain].selector){
						if ($(window.RaindropParser.siteOverrides[this.item.domain].selector[i]+':visible', this.tempDoc).length>0)
							overID=i;
					}

					if (overID>=0){
						//get images
						$(window.RaindropParser.siteOverrides[this.item.domain].selector[overID] + ' img', this.tempDoc).each( function() {
							src = window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.url, $(this).attr('src'));
							window.RaindropParser.working.media.push( $(this).attr('src') );
							$(this).attr('src', src);
						} );

						this.item.html = $(window.RaindropParser.siteOverrides[this.item.domain].selector[overID], this.tempDoc).html();
						this.item.excerpt = $(window.RaindropParser.siteOverrides[this.item.domain].selector[overID], this.tempDoc).text();

						this.item.type = window.RaindropParser.siteOverrides[this.item.domain].type;

						//excerpt
						if ($(window.RaindropParser.siteOverrides[this.item.domain].excerpt, this.tempDoc).length>0){
							this.item.excerpt = $(window.RaindropParser.siteOverrides[this.item.domain].excerpt, this.tempDoc).text();
						}

						//title
						if ($(window.RaindropParser.siteOverrides[this.item.domain].title, this.tempDoc).length>0){
							this.item.title = $(window.RaindropParser.siteOverrides[this.item.domain].title, this.tempDoc).text();
						}
					}
					else
						this.item.type = 'link';

					this.done(doneCallback);
				break;
				default:
					if (this.tempDoc==null){
						this.tempDoc = document.createElement('div');
						this.tempDoc.innerHTML = '<div>'+document.body.innerHTML+'</div>';
					}

	    			//get images
	    			$('[href!=""]', this.tempDoc).each( function() {
						src = window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.url, $(this).attr('href'));
						$(this).attr('href', src);
					} );

					$('[src!=""]', this.tempDoc).each( function() {
						src = window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.url, $(this).attr('src'));
						$(this).attr('src', src);
					} );

					//parse and save article
					try{
						if($(this.tempDoc).text().trim()!=''){
							var readable = new Readability({
                                searchFurtherPages: false,
                                resolvePaths: true
                            });
							saxParser(this.tempDoc, readable);
							var tempArticle = readable.getArticle();

							if (tempArticle)
							if (tempArticle.title){
								//is Article?
								if ((tempArticle.score)||(this.working.type=='article')) {
									if (tempArticle.title.length>10)
										this.item.title = tempArticle.title;

									var tempArticleBody = document.createElement('div');
									tempArticleBody.innerHTML = '<div>'+tempArticle.html+'</div>';

									var tempArticleText = tempArticleBody.innerText.trim();
									
									if (tempArticleText.length>500){
										this.item.type='article';
										this.item.html = tempArticle.html;
										this.item.excerpt = tempArticleText;
										
										//get post images
										$('img', tempArticleBody).each( function() {
											window.RaindropParser.working.media.push( $(this).attr('src') );
										} );
									}
								}
							}
						}
					} catch(e) {if(e)console.log(e)}

					this.done(doneCallback);
				break;
			}

			this.tempDoc = null;
		},

		//Done, send data
		done: function(doneCallback) {
			//Icons and some pictures
			if (this.working.mediaOther.length>0){
				this.working.mediaOther = this.helpers.removeDublicates(this.working.mediaOther);
				this.working.mediaOther.forEach(function(item){
					window.RaindropParser.item.media.push( {type: 'image', link: item} );
				});
			}

			if (this.working.media.length==0){
				$('img', this.tempDoc).each(function(){
					var w = 0, h = 0;
					try{w = $(this)[0].naturalWidth; h = $(this)[0].naturalHeight}catch(e){}

					if (( w>=window.RaindropParser.minWidth )&&( h>=window.RaindropParser.minHeight ))
						window.RaindropParser.working.media.push( $(this).attr('src') );
				});
			}

			if (this.working.media.length>0)
			{
				this.working.media = this.helpers.removeDublicates(this.working.media);
				for(var i in this.working.media){
					var temp=$('img[src="'+this.working.media[i]+'"]:eq(0)', this.tempDoc),
						bigImg = false,
						w = 0, h = 0;
					try{
						w = temp[0].naturalWidth;
						h = temp[0].naturalHeight;

						bigImg = (( w>=window.RaindropParser.minWidth )&&( h>=window.RaindropParser.minHeight ))
					}catch(e){}

					var	canAdd = ((this.item.type=='image')||(this.item.type=='video')),
						notExists = (temp.length==0);

					if ( (bigImg)||(canAdd)||(notExists) ){
						var tempData = {type: 'image', link: window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.url, this.working.media[i]), width: w, height: h};
						if ((tempData.width>0)&&(tempData.height>0)){
							tempData.coverHeight = (tempData.height/tempData.width).toFixed(2)
						}

						this.item.media.push( tempData );
					}
				}
			}
			this.item.coverEnabled=(this.item.media.length>0);

			//Title
			if (this.item.title){
				this.item.title=this.helpers.truncate(
					this.helpers.collapseWhitespace( this.item.title.trim() ), 100
				);
			}
			this.item.title = ((this.item.title||"").trim())||document.title;

			if (this.item.excerpt!=undefined)
				this.item.excerpt=this.helpers.truncate(
					this.helpers.collapseWhitespace( this.item.excerpt.trim() ), 200
				);
			this.item.result=true;
			//this.item.parser = "local";

			doneCallback(this.item);
		},

		//Read meta tags
		prepareHTML: function() {
			var ogTypes = {
				'video' : ['video', 'video.movie', 'video.episode', 'video.tv_show', 'video.other', 'coub-com:coub', 'movie']
			};

	    	//meta tags
	    	var parseTag=function(s) {
	    		if (s!='og:type')
	    		{s=s.split(':'); s=s[ s.length-1 ];}
	    		return s;
	    	}

			$('meta[name="description"], meta[property="description"], meta[property^="og:"], meta[name^="og:"], meta[property^="twitter:"], meta[name^="twitter:"]', window.RaindropParser.tempDoc).each( function() {
				var tag = '', value = '';
				if ($(this).attr('property')!=undefined)
					tag = parseTag( $(this).attr('property') );
				else if ($(this).attr('name')!=undefined)
					tag = parseTag( $(this).attr('name') );

				if (($(this).attr('content')!=undefined)&&($(this).attr('content')!=''))
					value = $(this).attr('content');
				else if (($(this).attr('value')!=undefined)&&($(this).attr('value')!=''))
					value = $(this).attr('value');

				if ((tag!='')&&(value!=''))
				{
					if (tag=='image'){
						if (window.RaindropParser.working.metaTags[ tag ]==undefined) window.RaindropParser.working.metaTags[ tag ]=[];
						window.RaindropParser.working.metaTags[ tag ].push(value);
					}
					else
						window.RaindropParser.working.metaTags[ tag ] = value;
				}
			} );

			if (window.RaindropParser.working.metaTags['title']!=undefined)
				window.RaindropParser.item.title = window.RaindropParser.working.metaTags['title'];

			if (window.RaindropParser.working.metaTags['description']!=undefined)
				window.RaindropParser.item.excerpt = window.RaindropParser.working.metaTags['description'];

			//check type
			if (window.RaindropParser.working.metaTags['og:type']!=undefined) {
				window.RaindropParser.working.type=window.RaindropParser.working.metaTags['og:type'];
				for (var i in ogTypes)
					for (var j in ogTypes[i])
						if (ogTypes[i][j] == window.RaindropParser.working.metaTags['og:type'])
							window.RaindropParser.item.type = i;
			}

			//preview
			if (window.RaindropParser.working.metaTags['image']!=undefined)
				window.RaindropParser.working.media=window.RaindropParser.working.metaTags['image'];

			//if video iframe
			if ((window.RaindropParser.working.metaTags['player']!=undefined)/*&&(window.RaindropParser.working.type=='video')*/)
				window.RaindropParser.item.type='video';

			//if html5 video
			if ((window.RaindropParser.working.metaTags['video']!=undefined)&&(window.RaindropParser.item.type=='video'))
				window.RaindropParser.working.html5video=true;

			//if photo card
			if ((window.RaindropParser.working.metaTags['card']=='photo') /*&& (window.RaindropParser.working.metaTags['width']!=undefined) && (window.RaindropParser.working.metaTags['height']!=undefined)*/ )
				window.RaindropParser.item.type='image';

			//is browser image preview
			if (( $('body > :not(#'+this.divId+')', window.RaindropParser.tempDoc).length == 1) && ( $('body > img', window.RaindropParser.tempDoc).length == 1 )){
				window.RaindropParser.working.metaTags['image'] = [$('body img:eq(0)', window.RaindropParser.tempDoc).attr('src')];
				window.RaindropParser.working.media = window.RaindropParser.working.metaTags['image'];
				
				window.RaindropParser.item.type='image';
			}

			//site specific
			if (window.RaindropParser.siteOverrides[this.item.domain]!=undefined)
				this.item.type='specific';

			if (window.RaindropParser.working.media.length==0){
				//BIGGEST icon
				var icons=[];
				$('head link[rel="apple-touch-icon-precomposed"], head link[rel="apple-touch-icon"], head link[rel="icon"]', window.RaindropParser.tempDoc).each(function(){
					if ($(this).attr('href')){
						var level=0;
						try{
							level=parseInt($(this).attr('sizes'));
						}catch(e){if(e){level=0;}}

						try{
							if (($(this).attr('type') == 'image/png') || ($(this).attr('type') == 'image/jpeg') || ($(this).attr('type') == 'image/gif'))
								level=level+1;
						}catch(e){}
						level = level || 0;

						icons[level] = $(this).attr('href');
					}
				});
				if (icons.length>0){
					try{
						window.RaindropParser.working.mediaOther.push( window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.URL, icons[icons.length-1]) );
					}catch(e){}
				}

				$('img[width!=""][height!=""][src!=""]', window.RaindropParser.tempDoc).each(function(){
					var w=0,h=0;
					try{
						w=parseInt($(this).attr('width'));
						h=parseInt($(this).attr('height'));
					}catch(e){if(e) {w=0;h=0;}}
					if ((w>200)&&(h>200)&&(window.RaindropParser.working.mediaOther.length<=10)) {
						window.RaindropParser.working.mediaOther.push(window.RaindropParser.helpers.absolutePath(window.RaindropParser.item.URL, $(this).attr('src')));
					}
				});
			}
		}
	};





	/************************    P A R S S E R ***********************/
	/*
* readabilitySAX
* https://github.com/fb55/readabilitySAX
*
* The code is structured into three main parts:
*	1. An light-weight "Element" class that is used instead of the DOM (and provides some DOM-like functionality)
*	2. A list of properties that help readability to determine how a "good" element looks like
*	3. The Readability class that provides the interface & logic (usable as a htmlparser2 handler)
*/

;(function(global){

//1. the tree element
var Element = function(tagName, parent){
	this.name = tagName;
	this.parent = parent;
	this.attributes = {};
	this.children = [];
	this.tagScore = 0;
	this.attributeScore = 0;
	this.totalScore = 0;
	this.elementData = "";
	this.info = {
		textLength: 0,
		linkLength: 0,
		commas:		0,
		density:	0,
		tagCount:	{}
	};
	this.isCandidate = false;
};

Element.prototype = {
	addInfo: function(){
		var info = this.info,
		    childs = this.children,
		    childNum = childs.length,
		    elem;
		for(var i=0; i < childNum; i++){
			elem = childs[i];
			if(typeof elem === "string"){
				info.textLength += elem.trim()./*replace(re_whitespace, " ").*/length;
				if(re_commas.test(elem)) info.commas += elem.split(re_commas).length - 1;
			}
			else {
				if(elem.name === "a"){
					info.linkLength += elem.info.textLength + elem.info.linkLength;
				}
				else{
					info.textLength += elem.info.textLength;
					info.linkLength += elem.info.linkLength;
				}
				info.commas += elem.info.commas;

				for(var j in elem.info.tagCount){
					if(j in info.tagCount) info.tagCount[j] += elem.info.tagCount[j];
					else info.tagCount[j] = elem.info.tagCount[j];
				}

				if(elem.name in info.tagCount) info.tagCount[elem.name] += 1;
				else info.tagCount[elem.name] = 1;
			}
		}

		if(info.linkLength !== 0){
			info.density = info.linkLength / (info.textLength + info.linkLength);
		}
	},
	getOuterHTML: function(){
		var ret = "<" + this.name;

		for(var i in this.attributes){
			ret += " " + i + "=\"" + this.attributes[i] + "\"";
		}

		if(this.children.length === 0){
			if(this.name in formatTags) return ret + "/>";
			else return ret + "></" + this.name + ">";
		}

		return ret + ">" + this.getInnerHTML() + "</" + this.name + ">";
	},
	getInnerHTML: function(){
		var nodes = this.children, ret = "";

		for(var i = 0, j = nodes.length; i < j; i++){
			if(typeof nodes[i] === "string") ret += nodes[i];
			else ret += nodes[i].getOuterHTML();
		}
		return ret;
	},
	getFormattedText: function(){
		var nodes = this.children, ret = "";
		for(var i = 0, j = nodes.length; i < j; i++){
			if(typeof nodes[i] === "string") ret += nodes[i].replace(re_whitespace, " ");
			else {
				if(nodes[i].name === "p" || nodes[i].name in headerTags) ret += "\n";
				ret += nodes[i].getFormattedText();
				if(nodes[i].name in newLinesAfter) ret += "\n";
			}
		}
		return ret;
	},
	toString: function(){
		return this.children.join("");
	},
	getTopCandidate: function(){
		var childs = this.children,
		    topScore = -Infinity,
		    score = 0,
		    topCandidate, elem;

		for(var i = 0, j = childs.length; i < j; i++){
			if(typeof childs[i] === "string") continue;
			if(childs[i].isCandidate){
				elem = childs[i];
				//add points for the tags name
				if(elem.name in tagCounts) elem.tagScore += tagCounts[elem.name];

				score = Math.floor(
					(elem.tagScore + elem.attributeScore) * (1 - elem.info.density)
				);
				if(topScore < score){
					elem.totalScore = topScore = score;
					topCandidate = elem;
				}
			}
			if((elem = childs[i].getTopCandidate()) && topScore < elem.totalScore){
				topScore = elem.totalScore;
				topCandidate = elem;
			}
		}
		return topCandidate;
	}
};

//2. list of values
var tagsToSkip = {__proto__:null,aside:true,footer:true,head:true,label:true,nav:true,noscript:true,script:true,select:true,style:true,textarea:true},
    tagCounts = {__proto__:null,address:-3,article:30,blockquote:3,body:-5,dd:-3,div:5,dl:-3,dt:-3,form:-3,h2:-5,h3:-5,h4:-5,h5:-5,h6:-5,li:-3,ol:-3,pre:3,section:15,td:3,th:-5,ul:-3},
    removeIfEmpty = {__proto__:null,blockquote:true,li:true,p:true,pre:true,tbody:true,td:true,th:true,thead:true,tr:true},
    embeds = {__proto__:null,embed:true,object:true,iframe:true}, //iframe added for html5 players
    goodAttributes = {__proto__:null,alt:true,href:true,src:true,title:true/*,style:true*/},
    cleanConditionally = {__proto__:null,div:true,form:true,ol:true,table:true,ul:true},
    unpackDivs = {__proto__:embeds,div:true,img:true},
    noContent = {__proto__:formatTags,font:false,input:false,link:false,meta:false,span:false},
    formatTags = {__proto__:null,br:new Element("br"),hr:new Element("hr")},
    headerTags = {__proto__:null,h1:true,h2:true,h3:true,h4:true,h5:true,h6:true},
    newLinesAfter = {__proto__:headerTags,br:true,li:true,p:true},

    divToPElements = ["a","blockquote","dl","img","ol","p","pre","table","ul"],
    okayIfEmpty = ["audio","embed","iframe","img","object","video"],

    re_videos = /http:\/\/(?:www\.)?(?:youtube|vimeo)\.com/,
    re_nextLink = /[>»]|continue|next|weiter(?:[^\|]|$)/i,
    re_prevLink = /[<«]|earl|new|old|prev/i,
    re_extraneous = /all|archive|comment|discuss|e-?mail|login|print|reply|share|sign|single/i,
    re_pages = /pag(?:e|ing|inat)/i,
    re_pagenum = /p[ag]{0,2}(?:e|ing|ination)?[=\/]\d{1,2}/i,

    re_safe = /article-body|hentry|instapaper_body/,
    re_final = /first|last/i,

    re_positive = /article|blog|body|content|entry|main|news|pag(?:e|ination)|post|story|text/,
    re_negative = /com(?:bx|ment|-)|contact|foot(?:er|note)?|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|shopping|tags|tool|widget/,
    re_unlikelyCandidates =  /ad-break|agegate|auth?or|bookmark|cat|com(?:bx|ment|munity)|date|disqus|extra|foot|header|ignore|links|menu|nav|pag(?:er|ination)|popup|related|remark|rss|share|shoutbox|sidebar|similar|social|sponsor|teaserlist|time|tweet|twitter/,
    re_okMaybeItsACandidate = /and|article|body|column|main|shadow/,

    re_sentence = /\. |\.$/,
    re_whitespace = /\s+/g,

    re_pageInURL = /[_\-]?p[a-zA-Z]*[_\-]?\d{1,2}$/,
    re_badFirst = /^(?:[^a-z]{0,3}|index|\d+)$/i,
    re_noLetters = /[^a-zA-Z]/,
    re_params = /\?.*/,
    re_extension = /00,|\.[a-zA-Z]+$/g,
    re_digits = /\d/,
    re_justDigits = /^\d{1,2}$/,
    re_slashes = /\/+/,
    re_domain = /\/([^\/]+)/,

    re_protocol = /^\w+\:/,
    re_cleanPaths = /\/\.(?!\.)|\/[^\/]*\/\.\./,

    re_closing = /\/?(?:#.*)?$/,
    re_imgUrl = /\.(gif|jpe?g|png|webp)$/i,

    re_commas = /,[\s\,]*/g;

//3. the readability class
var Readability = function(settings){
	//the root node
	this._currentElement = new Element("document");
	this._topCandidate = null;
	this._origTitle = this._headerTitle = "";
	this._scannedLinks = {};
	if(settings) this._processSettings(settings);
};

Readability.prototype._settings = {
	stripUnlikelyCandidates: true,
	weightClasses: true,
	cleanConditionally: true,
	cleanAttributes: true,
	replaceImgs: true,
	searchFurtherPages: true,
	linksToSkip: {},	//pages that are already parsed
	//pageURL: null,	//URL of the page which is parsed
	//type: "html",		//default type of output
	resolvePaths: false
};

Readability.prototype._convertLinks = function(path){
	if(!this._url) return path;
	if(!path) return this._url.full;

	var path_split = path.split("/");

	//special cases
	if(path_split[1] === ""){
		//paths starting with "//"
		if(path_split[0] === ""){
			return this._url.protocol + path;
		}
		//full domain (if not caught before)
		if(path_split[0].substr(-1) === ":"){
			return path;
		}
	}

	//if path is starting with "/"
	if(path_split[0] === "") path_split.shift();
	else Array.prototype.unshift.apply(path_split, this._url.path);

	path = path_split.join("/");

	if(this._settings.resolvePaths){
		while(path !== (path = path.replace(re_cleanPaths, "")));
	}

	return this._url.protocol + "//" + this._url.domain + "/" + path;
};

Readability.prototype._getBaseURL = function(){
	if(this._url.path.length === 0){
		//return what we got
		return this._url.full.replace(re_params,"");
	}

	var cleaned = "",
	    elementNum = this._url.path.length - 1;

	for(var i = 0; i < elementNum; i++){
		// Split off and save anything that looks like a file type and "00,"-trash.
		cleaned += "/" + this._url.path[i].replace(re_extension, "");
	}

	var first = this._url.full.replace(re_params, "").replace(/.*\//, ""),
	    second = this._url.path[elementNum];

	if(!(second.length < 3 && re_noLetters.test(first)) && !re_justDigits.test(second)){
		if(re_pageInURL.test(second)){
			second = second.replace(re_pageInURL, "");
		}
		cleaned += "/" + second;
	}

	if(!re_badFirst.test(first)){
		if(re_pageInURL.test(first)){
			first = first.replace(re_pageInURL, "");
		}
		cleaned += "/" + first;
	}

	// This is our final, cleaned, base article URL.
	return this._url.protocol + "//" + this._url.domain + cleaned;
};

Readability.prototype._processSettings = function(settings){
	var Settings = this._settings;
	this._settings = {};

	for(var i in Settings){
		if(typeof settings[i] !== "undefined"){
			this._settings[i] = settings[i];
		}
		else this._settings[i] = Settings[i];
	}

	var path;
	if(settings.pageURL){
		path = settings.pageURL.split(re_slashes);
		this._url = {
			protocol: path[0],
			domain: path[1],
			path: path.slice(2, -1),
			full: settings.pageURL.replace(re_closing,"")
		};
		this._baseURL = this._getBaseURL();
	}
	if(settings.type) this._settings.type = settings.type;
};

Readability.prototype._scanLink = function(elem){
	var href = elem.attributes.href;

	if(!href) return;
	href = href.replace(re_closing, "");

	if(href in this._settings.linksToSkip) return;
	if(href === this._baseURL || (this._url && href === this._url.full)) return;

	var match = href.match(re_domain);

	if(!match) return;
	if(this._url && match[1] !== this._url.domain) return;

	var text = elem.toString();
	if(text.length > 25 || re_extraneous.test(text)) return;
	if(!re_digits.test(href.replace(this._baseURL, ""))) return;

	var score = 0,
	    linkData = text + elem.elementData;

	if(re_nextLink.test(linkData)) score += 50;
	if(re_pages.test(linkData)) score += 25;

	if(re_final.test(linkData)){
		if(!re_nextLink.test(text))
			if(!(this._scannedLinks[href] && re_nextLink.test(this._scannedLinks[href].text)))
				score -= 65;
	}

	if(re_negative.test(linkData) || re_extraneous.test(linkData)) score -= 50;
	if(re_prevLink.test(linkData)) score -= 200;

	if(re_pagenum.test(href) || re_pages.test(href)) score += 25;
	if(re_extraneous.test(href)) score -= 15;

	var current = elem,
	    posMatch = true,
	    negMatch = true;

	while(current = current.parent){
		if(current.elementData === "") continue;
		if(posMatch && re_pages.test(current.elementData)){
			score += 25;
			if(!negMatch) break;
			else posMatch = false;
		}
		if(negMatch && re_negative.test(current.elementData) && !re_positive.test(current.elementData)){
			score -= 25;
			if(!posMatch) break;
			else negMatch = false;
		}
	}

	var parsedNum = parseInt(text, 10);
	if(parsedNum < 10){
		if(parsedNum === 1) score -= 10;
		else score += 10 - parsedNum;
	}

	if(href in this._scannedLinks){
		this._scannedLinks[href].score += score;
		this._scannedLinks[href].text += " " + text;
	}
	else this._scannedLinks[href] = {
		score: score,
		text: text
	};
};

//parser methods
Readability.prototype.onopentagname = function(name){
	if(name in noContent){
		if(name in formatTags) this._currentElement.children.push(formatTags[name]);
	}
	else this._currentElement = new Element(name, this._currentElement);
};

Readability.prototype.onattribute = function(name, value){
	if(!value) return;
	name = name.toLowerCase();

	var elem = this._currentElement;

	if(name === "href" || name === "src"){
		//fix links
		if(re_protocol.test(value)) elem.attributes[name] = value;
		else elem.attributes[name] = this._convertLinks(value);
	}
	else if(name === "id" || name === "class"){
		value = value.toLowerCase();
		if(!this._settings.weightClasses);
		else if(re_safe.test(value)){
			elem.attributeScore += 300;
			elem.isCandidate = true;
		}
		else if(re_negative.test(value)) elem.attributeScore -= 25;
		else if(re_positive.test(value)) elem.attributeScore += 25;

		elem.elementData += " " + value;
	}
	else if(elem.name === "img" && (name === "width" || name === "height")){
		value = parseInt(value, 10);
		if(value !== value); // NaN (skip)
		else if(value <= 32) {
			// skip the image
			// (use a tagname that's part of tagsToSkip)
			elem.name = "script";
		}
		else if(name === "width" ? value >= 390 : value >= 290){
			// increase score of parent
			elem.parent.attributeScore += 20;
		}
		else if(name === "width" ? value >= 200 : value >= 150){
			elem.parent.attributeScore += 5;
		}
	}
	else if(this._settings.cleanAttributes){
		if(name in goodAttributes) elem.attributes[name] = value;
	}
	else elem.attributes[name] = value;
};

Readability.prototype.ontext = function(text){
	this._currentElement.children.push(text);
};

Readability.prototype.onclosetag = function(tagName){
	if(tagName in noContent) return;

	var elem = this._currentElement, title, i, j;

	this._currentElement = elem.parent;

	//prepare title
	if(this._settings.searchFurtherPages && tagName === "a"){
		this._scanLink(elem);
	}
	else if(tagName === "title" && !this._origTitle){
		this._origTitle = elem.toString().trim().replace(re_whitespace, " ");
		return;
	}
	else if(tagName in headerTags){
		title = elem.toString().trim().replace(re_whitespace, " ");
		if(this._origTitle){
			if(this._origTitle.indexOf(title) !== -1){
				if(title.split(" ", 4).length === 4){
					//It's probably the title, so let's use it!
					this._headerTitle = title;
				}
				return;
			}
			if(tagName === "h1") return;
		}
		//if there was no title tag, use any h1 as the title
		else if(tagName === "h1"){
			this._headerTitle = title;
			return;
		}
	}

	if(tagName in tagsToSkip) return;
	if(this._settings.stripUnlikelyCandidates
		&& re_unlikelyCandidates.test(elem.elementData)
		&& !re_okMaybeItsACandidate.test(elem.elementData)){
			return;
	}
	if(tagName === "div"
		&& elem.children.length === 1
		&& typeof elem.children[0] === "object"
		&& elem.children[0].name in unpackDivs
	){
		//unpack divs
		elem.parent.children.push(elem.children[0]);
		return;
	}

	elem.addInfo();

	//clean conditionally
	if(tagName in embeds){
		//check if tag is wanted (youtube or vimeo)
		if(!("src" in elem.attributes && re_videos.test(elem.attributes.src))) return;
	}
	else if(tagName === "h2" || tagName === "h3"){
		//clean headers
		if (elem.attributeScore < 0 || elem.info.density > .33) return;
	}
	else if(this._settings.cleanConditionally && tagName in cleanConditionally){
		var p = elem.info.tagCount.p || 0,
		    contentLength = elem.info.textLength + elem.info.linkLength;

		if(contentLength === 0){
			if(elem.children.length === 0) return;
			if(elem.children.length === 1 && typeof elem.children[0] === "string") return;
		}
		if((elem.info.tagCount.li - 100) > p && tagName !== "ul" && tagName !== "ol") return;
		if(contentLength < 25 && (!("img" in elem.info.tagCount) || elem.info.tagCount.img > 2) ) return;
		if(elem.info.density > .5) return;
		if(elem.attributeScore < 25 && elem.info.density > .2) return;
		if((elem.info.tagCount.embed === 1 && contentLength < 75) || elem.info.tagCount.embed > 1) return;
	}

	filterEmpty: if(
		(tagName in removeIfEmpty || !this._settings.cleanConditionally && tagName in cleanConditionally)
		&& (elem.info.linkLength + elem.info.textLength === 0)
		&& elem.children.length !== 0
	) {
		for(i = 0, j = okayIfEmpty.length; i < j; i++){
			if(okayIfEmpty[i] in elem.info.tagCount) break filterEmpty;
		}
		return;
	}

	if(this._settings.replaceImgs
		&& tagName === "a"
		&& elem.children.length === 1
		&& elem.children[0].name === "img"
		&& re_imgUrl.test(elem.attributes.href)
	){
		elem = elem.children[0];
		elem.attributes.src = elem.parent.attributes.href;
	}

	elem.parent.children.push(elem);

	//should node be scored?
	if(tagName === "p" || tagName === "pre" || tagName === "td");
	else if(tagName === "div"){
		//check if div should be converted to a p
		for(i = 0, j = divToPElements.length; i < j; i++){
			if(divToPElements[i] in elem.info.tagCount) return;
		}
		elem.name = "p";
	}
	else return;

	if((elem.info.textLength + elem.info.linkLength) > 24 && elem.parent && elem.parent.parent){
		elem.parent.isCandidate = elem.parent.parent.isCandidate = true;
		var addScore = 1 + elem.info.commas + Math.min( Math.floor( (elem.info.textLength + elem.info.linkLength) / 100 ), 3);
		elem.parent.tagScore += addScore;
		elem.parent.parent.tagScore += addScore / 2;
	}
};

Readability.prototype.onreset = Readability;

var getCandidateSiblings = function(candidate){
	//check all siblings
	var ret = [],
	    childs = candidate.parent.children,
	    childNum = childs.length,
	    siblingScoreThreshold = Math.max(10, candidate.totalScore * .2);

	for(var i = 0; i < childNum; i++){
		if(typeof childs[i] === "string") continue;

		if(childs[i] === candidate);
		else if(candidate.elementData === childs[i].elementData){ //TODO: just the class name should be checked
			if((childs[i].totalScore + candidate.totalScore * .2) >= siblingScoreThreshold){
				if(childs[i].name !== "p") childs[i].name = "div";
			}
			else continue;
		} else if(childs[i].name === "p"){
			if(childs[i].info.textLength >= 80 && childs[i].info.density < .25);
			else if(childs[i].info.textLength < 80 && childs[i].info.density === 0 && re_sentence.test(childs[i].toString()));
			else continue;
		} else continue;

		ret.push(childs[i]);
	}
	return ret;
};



Readability.prototype._getCandidateNode = function(){
	var elem = this._topCandidate, elems;
	if(!elem) elem = this._topCandidate = this._currentElement.getTopCandidate();

	if(!elem){
		//select root node
		elem = this._currentElement;
	}
	else if(elem.parent.children.length > 1){
		elems = getCandidateSiblings(elem);

		//create a new object so that the prototype methods are callable
		elem = new Element("div");
		elem.children = elems;
		elem.addInfo();
	}

	while(elem.children.length === 1){
		if(typeof elem.children[0] === "object"){
			elem = elem.children[0];
		} else break;
	}

	return elem;
};

//skipLevel is a shortcut to allow more elements of the page
Readability.prototype.setSkipLevel = function(skipLevel){
	if(skipLevel === 0) return;

	//if the prototype is still used for settings, change that
	if(this._settings === Readability.prototype._settings){
		this._processSettings({});
	}

	if(skipLevel > 0) this._settings.stripUnlikelyCandidates = false;
	if(skipLevel > 1) this._settings.weightClasses = false;
	if(skipLevel > 2) this._settings.cleanConditionally = false;
};

Readability.prototype.getTitle = function(){
	if(this._headerTitle) return this._headerTitle;
	if(!this._origTitle) return "";

	var curTitle = this._origTitle;

	if(/ [\|\-] /.test(curTitle)){
		curTitle = curTitle.replace(/(.*) [\|\-] .*/g, "$1");

		if(curTitle.split(" ", 3).length !== 3)
			curTitle = this._origTitle.replace(/.*?[\|\-] /,"");
	}
	else if(curTitle.indexOf(": ") !== -1){
		curTitle = curTitle.substr(curTitle.lastIndexOf(": ") + 2);

		if(curTitle.split(" ", 3).length !== 3)
			curTitle = this._origTitle.substr(this._origTitle.indexOf(": "));
	}
	//TODO: support arrow ("\u00bb")

	curTitle = curTitle.trim();

	if(curTitle.split(" ", 5).length !== 5) return this._origTitle;
	return curTitle;
};

Readability.prototype.getNextPage = function(){
	var topScore = 49, topLink = "";
	for(var link in this._scannedLinks){
		if(this._scannedLinks[link].score > topScore){
			topLink = link;
			topScore = this._scannedLinks[link].score;
		}
	}

	return topLink;
};

Readability.prototype.getHTML = function(node){
	if(!node) node = this._getCandidateNode();
	return node.getInnerHTML() //=> clean it
		//remove <br>s in front of opening & closing <p>s
		.replace(/(?:<br\/>(?:\s|&nbsp;?)*)+(?=<\/?p)/g, "")
		//remove spaces in front of <br>s
		.replace(/(?:\s|&nbsp;?)+(?=<br\/>)/g, "")
		//turn all double+ <br>s into <p>s
		.replace(/(?:<br\/>){2,}/g, "</p><p>")
		//trim the result
		.trim();
};

Readability.prototype.getText = function(node){
	if(!node) node = this._getCandidateNode();
	return node.getFormattedText().trim().replace(/\n+(?=\n{2})/g, "");
};

Readability.prototype.getEvents = function(cbs){
	(function process(node){
		cbs.onopentag(node.name, node.attributes);
		for(var i = 0, j = node.children.length; i < j; i++){
			if(typeof node.children[i] === "string"){
				cbs.ontext(node.children[i]);
			}
			else process(node.children[i]);
		}
		cbs.onclosetag(node.name);
	})(this._getCandidateNode());
};

Readability.prototype.getArticle = function(type){
	var elem = this._getCandidateNode();

	var ret = {
		title: this._headerTitle || this.getTitle(),
		nextPage: this.getNextPage(),
		textLength: elem.info.textLength,
		score: this._topCandidate ? this._topCandidate.totalScore : 0
	};

	if(!type && this._settings.type) type = this._settings.type;

	if(type === "text") ret.text = this.getText(elem);
	else ret.html = this.getHTML(elem);

	return ret;
};

if(typeof module !== "undefined" && "exports" in module){
	module.exports = Readability;
} else {
	if(typeof define === "function" && define.amd){
		define("Readability", function(){
			return Readability;
		});
	}
	global.Readability = Readability;
}

})(typeof window === "object" ? window : this);




/*
	Explenation:
		DOM port of E4XasSAX
		use the document root to initialise it
*/

function saxParser(elem, callbacks){
	if(typeof callbacks !== 'object')
		throw 'please provide callbacks!';

	//todo: support further events, options for trim & space normalisation
	
	function parse(node){
		var name = node.tagName.toLowerCase(),
		    attributeNodes = node.attributes;
		
		callbacks.onopentagname(name);
		
		for(var i = 0, j = attributeNodes.length; i < j; i++){
			callbacks.onattribute(attributeNodes[i].name+'', attributeNodes[i].value);
		}
		
		var childs = node.childNodes,
		    num = childs.length, nodeType;
		
		for(var i = 0; i < num; i++){
			nodeType = childs[i].nodeType;
			if(nodeType === 3 /*text*/)
				callbacks.ontext(childs[i].textContent);
			else if(nodeType === 1 /*element*/) parse(childs[i]);
			/*else if(nodeType === 8) //comment
				if(callbacks.oncomment) callbacks.oncomment(childs[i].toString());
			[...]
			*/
		}
		callbacks.onclosetag(name);
	}
	
	parse(elem);
}
}