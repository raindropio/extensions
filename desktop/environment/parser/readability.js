exports.fas = function(urlToParse, callback) {
    var fetch = require('fetch'),
        request = fetch.fetchUrl,
        $s = require('string'),
        url = require('url');

    var item = {
        URL : urlToParse,
        media: [],
        html: '',
        text: '',
        title: '',
        type: 'link'
    };
    var working={
        metaTags: {},
        type: '',
        media: []
    };

    var timeout = 18000;
    var pageMaxLength = 1100000;
    var started = new Date().getTime();

    var http = {
        fixURL: function(s) {
            var rules = {
                dribbble: /(https|http):\/\/dribbble.com\/shots\/\d{1,}/gmi
            }, ruleIndex=false;

            for(var i in rules)
                if (rules[i].test(s)) ruleIndex=i;

            if (ruleIndex!=false){
                s = s.match(rules[ruleIndex])[0];
            }

            return encodeURIComponent(s);
        },
        getDomain: function(s) {
            var domain = url.parse(s).hostname;
            if (domain != null){
                if (domain.indexOf('www.')==0)
                    domain = domain.replace('www.', '');
            }
            else
                domain='';
            return domain;
        },

        parseContentType: function (str){
            if(!str){
                return {};
            }
            var parts = str.split(";"),
                mimeType = parts.shift(),
                charset, chparts;

            for(var i=0, len = parts.length; i<len; i++){
                chparts = parts[i].split("=");
                if(chparts.length>1){
                    if(chparts[0].trim().toLowerCase() == "charset"){
                        charset = chparts[1];
                    }
                }
            }

            return {
                mimeType: (mimeType || "").trim().toLowerCase(),
                charset: (charset || "UTF-8").trim().toLowerCase() // defaults to UTF-8
            }
        },

        findHTMLCharset: function(htmlbuffer){
            var body = htmlbuffer.toString("ascii"),
                input, meta, charset;

            if(meta = body.match(/<meta\s+http-equiv=["']content-type["'][^>]*?>/i)){
                input = meta[0];
            }

            if(input){
                charset = input.match(/charset\s?=\s?([a-zA-Z\-0-9]*);?/);
                if(charset){
                    charset = (charset[1] || "").trim().toLowerCase();
                }
            }

            if(!charset && (meta = body.match(/<meta\s+charset=["'](.*?)["']/i))){
                charset = (meta[1] || "").trim().toLowerCase();
            }

            return charset;
        },

        checkHeaders: function(h,mime){
            var mimeTypes = {
                'image':['image/jpeg','image/png','image/gif'],
                'html':['text/html',/*'text/plain',*/'application/xhtml+xml']
            };

            item.status=parseInt(h.status);

            if (typeof h.status=='undefined')
            {
                item.error='HTTP Error';
                return false;
            }
            else if (h.status!=200)
            {
                item.error='HTTP Error '+item.status;
                return false;
            }

            /*var tempContentType = this.parseContentType(h.headers['content-type']);

             if (typeof mime == 'undefined'){
             mime = tempContentType.mimeType;
             working.charset = tempContentType.charset;
             }*/

            var mimeType=false;
            for (var i in mimeTypes)
                for (var j in mimeTypes[i])
                    if (mimeTypes[i][j]==mime)
                        mimeType = i;

            if (!mimeType)
                return false;

            return mimeType;
        }
    }

    /* helpers */
    var helpers = {
        iframe: function(attrs) {
            return '<div class="raindropLikeVideo"><iframe '+(typeof attrs.width!='undefined' ? ' width="'+attrs.width+'" ':' ' )+(typeof attrs.height!='undefined' ? ' height="'+attrs.height+'" ':' ' )+' src="'+attrs.src+'" frameborder="0" allowfullscreen></iframe></div>'
                +(typeof attrs.text!='undefined' ? '<div class="raindropLikeVideoDescription">'+attrs.text+'</div>' : '');
        },

        html5video: function(attrs) {
            var str='<div class="raindropLikeVideo"><video '+(typeof attrs.width!='undefined' ? ' width="'+attrs.width+'" ':' ' )+(typeof attrs.height!='undefined' ? ' height="'+attrs.height+'" ':' ' )+' src="'+attrs.src+'"></video></div>'
                +(typeof attrs.text!='undefined' ? '<div class="raindropLikeVideoDescription">'+attrs.text+'</div>' : '');
            return str;
        },

        image: function(attrs) {
            if (typeof attrs != 'object')
                return '';

            if (typeof attrs.src == 'undefined')
                return '';

            if (typeof attrs.src[0] != 'undefined')
                attrs.src=attrs.src[0];

            var str = '<div class="raindropLikeImage">';
            if (typeof attrs.url!='undefined')
                str+='<a href="'+attrs.url+'" target="_blank">';
            str+='<img src="'+attrs.src+'" />';
            if (typeof attrs.url!='undefined')
                str+='</a>';
            str+='</div>';
            if (typeof attrs.text!='undefined')
                str+='<div class="raindropLikeImageDescription">'+attrs.text+'</div>';
            return str;
        },

        removeDublicates: function(arr) {
            var i,
                len=arr.length,
                out=[],
                obj={};

            for (i=0;i<len;i++) {
                obj[arr[i]]=0;
            }
            for (i in obj) {
                out.push(i);
            }
            return out;
        },

        imageUrl: function(path,img) {
            if (typeof img == 'undefined')
                return '';
            if (img == '')
                return '';

            var baseIMG = url.parse(img),
                finalURL = img;

            if (baseIMG.hostname==null)
            {
                var baseURL = url.parse(path),
                    imgSlashes = img.split('/'),
                    basePATH = (baseURL.pathname).split('/');

                if ( (basePATH[ basePATH.length-1 ]).split('.').length>1 )
                    basePATH.splice(basePATH.length-1, 1);
                basePATH = basePATH.join('/');

                if ((imgSlashes[0]!='')&&(imgSlashes[0]!='..'))
                    finalURL = baseURL.protocol+'//'+baseURL.hostname+basePATH+'/'+baseIMG.pathname;
                else if (imgSlashes[0]=='')
                    finalURL = baseURL.protocol+'//'+baseURL.hostname+baseIMG.pathname;
            }
            else if (baseIMG.protocol==''){
                var parseURL=url.parse(item.URL);
                finalURL=parseURL.protocol+finalURL;
            }

            return finalURL;
        },

        cleanHTML: function(html) {
            function uriPolicy(value, effects, ltype, hints) {
                return value.toString();
            }

            var sanitizer = require('sanitizer'), clean = '';
            try {
                clean = sanitizer.sanitize(html, uriPolicy);
            } catch(e) {
                clean = '';
            }
            return clean;
        }
    }

    /*  DIRECT LINK TO THE IMAGE ****/
    var directImage = function(url) {
        item.title = (url).split('/'); item.title=item.title[ item.title.length-1 ];
        item.title = (item.title).split('.'); item.title=item.title[0];
        item.title = $s(item.title).humanize().s;

        item.media = [{link: item.URL, type:"image"}];

        item.html = helpers.image({
            src: [item.URL],
            url: item.URL
        });
        item.type = 'image';
    }

    var sendResult=function(){
        if (working.media.length>0)
        {
            working.media = helpers.removeDublicates(working.media);
            for(var i in working.media)
                item.media.push( {type: 'image', link: working.media[i]} );
        }

        if (item.html=='')
            item.type='link';
        /*else
         item.html=item.html.replace(/\\r\\n/g, "<br />");*/

        if (item.type=='link')
            item.html='';

        item.title = $s(item.title).stripTags().trim().collapseWhitespace().decodeHTMLEntities().truncate(200).s;
        item.text = $s(item.text || item.html).stripTags().trim().collapseWhitespace().decodeHTMLEntities().truncate(200).s;

        item.proccessingTime = (new Date().getTime() - started)/1000;

        if (typeof item.error!='undefined')
            console.log(item);

        callback(item);
    }


    var x = new fetch.FetchStream(item.URL, {timeout: timeout, onlyMeta:true});

    x.on('meta', function(h){
        body = {};

        try{
            body.mime = h.responseHeaders['content-type'];
            body.mime = body.mime.split(';')[0].toLowerCase();
        }catch(e){}

        var mime = http.checkHeaders(h, body.mime);

        if (typeof body.finalurl == 'undefined')
            body.finalurl = item.URL;
        else{
            var tempUrl = url.parse(body.finalurl);
            if (tempUrl.pathname=='/')
                mime = 'root';
        }


        item.domain = http.getDomain(item.URL);

        switch( mime ) {
            case 'image':
                directImage(body.finalurl);
                sendResult();
                break;
            case 'html':
                //parse content -----------------------------
                var encodinglib = require("encoding");
                request(body.finalurl, {timeout:timeout, maxResponseLength: pageMaxLength}, function(re,rh,rbody){
                    if (re){
                        console.log(re);
                        item.error='Can\'t open Final URL'; sendResult();
                    }
                    else{
                        /*if ( http.checkHeaders(rh) != 'html'){
                         item.error='Mime is changed!'; sendResult();
                         }
                         else*/{
                            /*working.charset = http.findHTMLCharset(rbody) || working.charset;
                             working.charset = (working.charset || "utf-8").trim().toLowerCase();

                             if(!working.charset.match(/^utf-?8$/i)){
                             rbody = encodinglib.convert(rbody, "UTF-8", working.charset);
                             }
                             rbody = rbody.toString();


                             if (rbody.length > pageMaxLength){
                             item.error='Page is very big!'; sendResult();
                             }
                             else */{
                                rbody = rbody.toString();

                                var cheerio = require('cheerio');
                                try{
                                    $ = cheerio.load(rbody);
                                } catch(eCH) {
                                    if (eCH){
                                        item.error='Cheerio error!'; sendResult();
                                    }
                                }

                                //parse meta tags ------------------------
                                if (typeof item.error == 'undefined'){
                                    var ogTypes = {
                                        'video' : ['video', 'video.movie', 'video.episode', 'video.tv_show', 'video.other', 'coub-com:coub', 'movie']
                                    };

                                    //meta tags
                                    var parseTag=function(s) {
                                        if (s!='og:type')
                                        {s=s.split(':'); s=s[ s.length-1 ];}
                                        return s;
                                    }
                                    $('head meta[property^="og:"], head meta[name^="og:"], head meta[property^="twitter:"], head meta[name^="twitter:"]').each( function() {
                                        var tag = '', value = '';
                                        if (typeof $(this).attr('property')!='undefined')
                                            tag = parseTag( $(this).attr('property') );
                                        else if (typeof $(this).attr('name')!='undefined')
                                            tag = parseTag( $(this).attr('name') );

                                        if ((typeof $(this).attr('content')!='undefined')&&($(this).attr('content')!=''))
                                            value = $(this).attr('content');
                                        else if ((typeof $(this).attr('value')!='undefined')&&($(this).attr('value')!=''))
                                            value = $(this).attr('value');

                                        if ((tag!='')&&(value!=''))
                                        {
                                            if (tag=='image'){
                                                if (typeof working.metaTags[ tag ]=='undefined') working.metaTags[ tag ]=[];
                                                working.metaTags[ tag ].push(value);
                                            }
                                            else
                                                working.metaTags[ tag ] = value;
                                        }
                                    } );

                                    if (typeof working.metaTags['title']!='undefined')
                                        item.title = working.metaTags['title'];

                                    //check type
                                    if (typeof working.metaTags['og:type']!='undefined') {
                                        for (var i in ogTypes)
                                            for (var j in ogTypes[i])
                                                if (ogTypes[i][j] == working.metaTags['og:type'])
                                                    working.type = i;
                                    }

                                    //preview
                                    if (typeof working.metaTags['image']!='undefined')
                                        working.media=working.metaTags['image'];

                                    //if video iframe
                                    if ((typeof working.metaTags['player']!='undefined')/*&&(working.type=='video')*/)
                                    { working.type='video'; }

                                    //if photo card
                                    if ((working.metaTags['card']=='photo') /*&& (working.metaTags['width']!=undefined) && (working.metaTags['height']!=undefined)*/ )
                                    { working.type='image'; }

                                    item.type = 'link';

                                    if ( working.metaTags['og:type']=='article' )
                                        item.type = 'article';

                                    if (item.title=="")
                                        item.title = $('head title').text();

                                    /*if (item.type=='link')
                                     $('h1, h2').each(function(){
                                     var tempS = $(this).text().trim(), titleS = item.title.trim();

                                     if ((tempS.length>=(titleS.length/2) )&&(titleS.indexOf( tempS )>=0))
                                     item.type = 'article';
                                     });*/
                                    /*
                                     if (item.type=='link'){
                                     $('h1,h2').each(function(){
                                     $('*',this).remove();
                                     var tempS = $(this).text().trim(), titleS = item.title.trim();

                                     if (tempS==titleS)
                                     item.type = 'article';
                                     });
                                     }*/

                                    if (working.media.length==0){
                                        $('img[width!="",height!="",src!=""]').each(function(){
                                            var w=0,h=0;
                                            try{
                                                w=parseInt($(this).attr('width'));
                                                h=parseInt($(this).attr('height'));
                                            }catch(e){if(e) {w=0;h=0;}}
                                            if ((w>200)&&(h>200))
                                                working.media.push($(this).attr('src'));
                                        });
                                    }

                                    switch(working.type){
                                        case 'video':
                                            item.type = 'video';
                                            item.html = helpers.iframe({//html5video
                                                src: working.metaTags['video'],
                                                width: working.metaTags['width'],
                                                height: working.metaTags['height'],
                                                text: (typeof working.metaTags['description']!='undefined' ? working.metaTags['description'] : '' )
                                            });
                                            sendResult();
                                            break;
                                        case 'image':
                                            item.type = 'image';
                                            item.html = helpers.image({
                                                src: working.metaTags['image'],
                                                url: item.URL,
                                                text: (typeof working.metaTags['description']!='undefined' ? working.metaTags['description'] : '' )
                                            });
                                            sendResult();
                                            break;
                                        default:
                                            //rbody = helpers.cleanHTML(rbody);

                                            var read = require('node-read');

                                            if (rbody!='')
                                                read(rbody, function(err, article, meta) {
                                                    if (err){
                                                        console.log(err);
                                                        item.error='readability error!'; sendResult();
                                                    }
                                                    else{
                                                        item.html = article.content;

                                                        if (item.html){
                                                            try{
                                                                item.html = helpers.cleanHTML(item.html);

                                                                var doc = cheerio.load(item.html), src;
                                                                doc('img').each( function() {
                                                                    src = helpers.imageUrl(item.URL, $(this).attr('src'));
                                                                    working.media.push( src );
                                                                    doc(this).attr('src', src);
                                                                } );
                                                                doc('a').each( function() {
                                                                    src = helpers.imageUrl(item.URL, $(this).attr('href'));
                                                                    doc(this).attr('href', src);
                                                                } );

                                                                item.html = doc.html();

                                                                delete doc;
                                                            } catch (eNR) {
                                                                if (eNR)
                                                                    item.error='readability get content error!';
                                                            }
                                                        }

                                                        sendResult();
                                                    }
                                                }, null, body.finalurl);
                                            else
                                                sendResult();
                                            break;
                                    }
                                }
                            }
                        }
                    }
                });
                break;
            case 'root':
                sendResult();
                break;
            default:
                item.error='unsupported content type or Yandex error'; sendResult();
                break;
        }
    });
    x.on('data', function(data){

    });
    x.on('error', function(data){
        item.error='Can\'t open Yandex URL'; sendResult();
    });
}