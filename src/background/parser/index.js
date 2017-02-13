import engine from './engine.safari.js'
import $ from 'jquery'

const RaindropParser = {
	minWidth: 200,
	minHeight: 100,

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
		//delete a;
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
			/*case 'image':
				this.item.html = this.helpers.image({
					src: this.working.metaTags['image'],
					url: this.item.url,
					excerpt: this.item.excerpt
				});

				this.done(doneCallback);
			break;*/
			case 'image':
			default:
				if (this.tempDoc==null){
					this.tempDoc = document.createElement('div');
					this.tempDoc.innerHTML = '<div>'+document.body.innerHTML+'</div>';
				}

    			//get images
    			$('[href!=""]', this.tempDoc).each( function() {
					var src = RaindropParser.helpers.absolutePath(RaindropParser.item.url, $(this).attr('href'));
					$(this).attr('href', src);
				} );

				$('[src!=""]', this.tempDoc).each( function() {
					var src = RaindropParser.helpers.absolutePath(RaindropParser.item.url, $(this).attr('src'));
					$(this).attr('src', src);
				} );

				//parse and save article
				try{
					if($(this.tempDoc).text().trim()!=''){
						try{$('picture').each(function() {
							var src = "";
							$('img:visible, source', this).each(function(){
							    var tempSrc = $(this)[0].currentSrc||$(this)[0].src||$(this).attr('srcset')||$(this).attr('data-srcset');

							    if (tempSrc){
							      if (tempSrc.indexOf('w, ')!=-1){
							        var tmp = tempSrc.split('w, ');
							        tempSrc = (tmp[tmp.length-1]).split(' ')[0];
							      }
							      if (tempSrc.indexOf('data:')!=0)
							        src = tempSrc;
							    }
							});
							$(this).attr('data-raindrop-src', src);
						});}catch(e){}

						var tempArticle = engine(this.tempDoc);

						if (tempArticle)
						if (tempArticle.html){
							//is Article?
							if ((tempArticle.score)||(this.working.type=='article')) {
								if (tempArticle.title.length>10)
									this.item.title = tempArticle.title;

								var tempArticleBody = document.createElement('div');
								tempArticleBody.innerHTML = tempArticle.html;

								var tempArticleText = tempArticleBody.innerText.trim();
								
								if (tempArticleText.length>500){
									$('aside, footer', tempArticleBody).each(function(){
										if ($('a',this).length)
											$(this).remove()
									})

									$('picture', tempArticleBody).each(function(){
										$(this).replaceWith('<img src="'+$(this).attr('data-raindrop-src')+'"/>')
									})

									try{
										/*$('noscript', tempArticleBody).each(function() {
											$(this).replaceWith($(this)[0].textContent||$(this)[0].innerHTML);
										})*/
										$('noscript', tempArticleBody).remove();
									}catch(e){}

									//get post images
									$('a', tempArticleBody).each( function() {
										var originalSrc = $(this).attr('href');
										if (!originalSrc) return;

										var src = RaindropParser.helpers.absolutePath(RaindropParser.item.url, originalSrc);
										$(this).attr('href',src)
									});

									$('img', tempArticleBody).each( function() {
										RaindropParser.working.media.push($(this).attr('src'));

										var originalSrc = $(this).attr('src');
										if (!originalSrc) return;

										var src = RaindropParser.helpers.absolutePath(RaindropParser.item.url, originalSrc);
										$(this).attr('src',src)
									} );

									this.item.type='article';
									this.item.html = tempArticleBody.innerHTML;
									if (!this.item.excerpt)
										this.item.excerpt = tempArticleText;
								}
							}
						}
					}
				} catch(e) {if(e)console.log(e)}

				if (this.item.type == "image"){
					this.item.html = this.helpers.image({
						src: this.working.metaTags['image'],
						url: this.item.url,
						excerpt: this.item.excerpt
					});
				}

				//fix type suggestion
				if (this.item.type != "link"){
					if (
						(/(website|profile|book)/gi.test(this.working.metaTags['og:type']))||
						(/(forum|discussion)/gi.test(this.item.url))
					){
						this.item.type = "link";
						this.item.html = "";
					}
				}

				this.done(doneCallback);
			break;
		}

		this.tempDoc = null;
	},

	//Done, send data
	done: function(doneCallback) {
		if ((this.working.media.length==0)&&(this.working.mediaOther.length==0)) {
			$('img', this.tempDoc).each(function(){
				var w = 0, h = 0;
				try{w = $(this)[0].naturalWidth; h = $(this)[0].naturalHeight}catch(e){}

				if (( w>=RaindropParser.minWidth )&&( h>=RaindropParser.minHeight ))
					RaindropParser.working.media.push( $(this).attr('src') );
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

					bigImg = (( w>=RaindropParser.minWidth )&&( h>=RaindropParser.minHeight ))
				}catch(e){}

				var	canAdd = ((this.item.type=='image')||(this.item.type=='video')),
					notExists = (temp.length==0);

				if ( (bigImg)||(canAdd)||(notExists) ){
					var tempData = {type: 'image', link: RaindropParser.helpers.absolutePath(RaindropParser.item.url, this.working.media[i]), width: w, height: h};
					if ((tempData.width>0)&&(tempData.height>0)){
						tempData.coverHeight = (tempData.height/tempData.width).toFixed(2)
					}

					this.item.media.push( tempData );
				}
			}
		}

		//Icons and some pictures
		if (this.working.mediaOther.length>0){
			this.working.mediaOther = this.helpers.removeDublicates(this.working.mediaOther);
			this.working.mediaOther.forEach(function(item){
				RaindropParser.item.media.push( {type: 'image', link: item} );
			});
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
    		{s=s.split(':'); s=s[ s.length-1 ].toLowerCase();}
    		return s;
    	}

		$('meta', RaindropParser.tempDoc).each( function() {
			if (/^(description|og\:|twitter\:)/i.test($(this).attr('property')||$(this).attr('name')) == false)
				return;

			var tag = parseTag( $(this).attr('property') || $(this).attr('name') ) || "",
				value = $(this).attr('content') || $(this).attr('value') || "";

			if ((tag!='')&&(value!=''))
			{
				if (tag=='image'){
					if (RaindropParser.working.metaTags[ tag ]==undefined) RaindropParser.working.metaTags[ tag ]=[];
					RaindropParser.working.metaTags[ tag ].push(value);
				}
				else
					RaindropParser.working.metaTags[ tag ] = value;
			}
		} );

		if (RaindropParser.working.metaTags['title']!=undefined)
			RaindropParser.item.title = RaindropParser.working.metaTags['title'];

		if (RaindropParser.working.metaTags['description']!=undefined)
			RaindropParser.item.excerpt = RaindropParser.working.metaTags['description'];

		//check type
		if (RaindropParser.working.metaTags['og:type']!=undefined) {
			RaindropParser.working.type=RaindropParser.working.metaTags['og:type'];
			for (var i in ogTypes)
				for (var j in ogTypes[i])
					if (ogTypes[i][j] == RaindropParser.working.metaTags['og:type'])
						RaindropParser.item.type = i;
		}

		//preview
		if (RaindropParser.working.metaTags['image']!=undefined)
			RaindropParser.working.mediaOther=RaindropParser.working.metaTags['image'];

		//if video iframe
		if ((RaindropParser.working.metaTags['player']!=undefined)/*&&(RaindropParser.working.type=='video')*/)
			RaindropParser.item.type='video';

		//if html5 video
		if ((RaindropParser.working.metaTags['video']!=undefined)&&(RaindropParser.item.type=='video'))
			RaindropParser.working.html5video=true;

		//if photo card
		if ((RaindropParser.working.metaTags['card']=='photo') /*&& (RaindropParser.working.metaTags['width']!=undefined) && (RaindropParser.working.metaTags['height']!=undefined)*/ )
			RaindropParser.item.type='image';

		//is browser image preview
		if (( $('body > :not(#'+this.divId+')', RaindropParser.tempDoc).length == 1) && ( $('body > img', RaindropParser.tempDoc).length == 1 )){
			RaindropParser.working.metaTags['image'] = [$('body img:eq(0)', RaindropParser.tempDoc).attr('src')];
			RaindropParser.working.media = RaindropParser.working.metaTags['image'];
			
			RaindropParser.item.type='image';
		}

		if (RaindropParser.working.media.length==0){
			//BIGGEST icon
			var icons=[];
			$('head link[rel="apple-touch-icon-precomposed"], head link[rel="apple-touch-icon"], head link[rel="icon"]', RaindropParser.tempDoc).each(function(){
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
					RaindropParser.working.mediaOther.push( RaindropParser.helpers.absolutePath(RaindropParser.item.URL, icons[icons.length-1]) );
				}catch(e){}
			}

			$('img[width!=""][height!=""][src!=""]', RaindropParser.tempDoc).each(function(){
				var w=0,h=0;
				try{
					w=parseInt($(this).attr('width'));
					h=parseInt($(this).attr('height'));
				}catch(e){if(e) {w=0;h=0;}}
				if ((w>200)&&(h>200)&&(RaindropParser.working.mediaOther.length<=10)) {
					RaindropParser.working.mediaOther.push(RaindropParser.helpers.absolutePath(RaindropParser.item.URL, $(this).attr('src')));
				}
			});
		}
	}
};

export default RaindropParser