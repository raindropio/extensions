//HTTP Server
var connect = require('connect'),
    v = require('validator'),
    bodyParser = require('body-parser');

var httpServer = connect();
httpServer.use(bodyParser.json({limit:'2mb'}));

exports.init = function() {
    httpServer.use(function(req,res,next){
        var urlFunx = require('url');
        var url_parts = urlFunx.parse(req.url, true);
        req.query = url_parts.query || {};

        res.json = function(json) {
            json = JSON.stringify(json);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Length', json.length);
            res.end(json);
        }

        next();
    });

    httpServer.use('/bookmark/save', function(req,res,next){
        req.query.mode = req.query.mode || "";

        //If click from extension and click mode is listing open all bookmarks, not saving
        try {
            if ((req.query.mode == 'extensionButton') && (settings.params.popup.clickMode == 'listing'))
                req.query.url = '';
        }catch(e){}

        var item = {};
        if (typeof req.body.item == 'object'){
            item = req.body.item;
        }

        if (v.isURL(req.query.url))
            mainWindow.fastSave({url: encodeURIComponent(req.query.url), item: encodeURIComponent(JSON.stringify(item))});
        else
            mainWindow.fastSave({url: false, item: false});

        mainWindow.show(2);
        res.json({result:true});
    });

    httpServer.use('/bookmark/cache', function(req,res,next){
        var item = {};
        if (typeof req.body.item == 'object'){
            item = req.body.item;
        }

        if (v.isURL(req.query.url))
            mainWindow.addToCache({url: encodeURIComponent(req.query.url), item: encodeURIComponent(JSON.stringify(item))});

        res.json({result:true});
    });

    httpServer.use('/bookmark/screenshot', function(req,res,next) {
        req.body.url = decodeURIComponent(req.body.url || "");

        if ((typeof req.body.dataURI != 'undefined') && (v.isURL(req.body.url))){
            mainWindow.addScreenshot({
                url: req.body.url,
                dataURI: req.body.dataURI
            });
        }

        res.json({result:true});
    });

    httpServer.use('/parse', function(req, res){
        var $s = require('string');

        var isEnded=false;

        var getQ = req.query;

        var callbackStr = getQ.callback;

        res.writeHead(200, { 'Content-Type': 'application/javascript' });

        var jsonpBack=function(s,res,callback) {
            if (typeof callback != 'undefined'){
                res.write( callback+'('+JSON.stringify(s)+');' );
                res.end();
            }
            else{
                res.write(JSON.stringify(s));
                res.end();
            }
        }

        /*if (toobusy()) {
         jsonpBack({result:false, error:'too busy'},res,callbackStr);
         return false;
         }*/

        setTimeout(function() {
            if (!isEnded){
                jsonpBack({result:false, error:'max waiting time'},res,callbackStr);
                return false;
            }
        }, 20000);

        if (!v.isURL(getQ.url))
        {
            isEnded=true;
            jsonpBack({result:false, error:'incorrect url'},res,callbackStr);
            return false;
        }


        //save to db
        var saveDb=function(response) {
            var item={
                url:response.URL,
                domain:response.domain,
                title:(response.title!=undefined?response.title:''),
                text:(response.text!=undefined?response.text:''),
                html:(response.html!=undefined?secureFunx.cleanHTML(response.html):''),
                tags:(response.tags!=undefined?response.tags:''),
                media:(response.media!=undefined?response.media:''),
                type:(response.type!=undefined?response.type:'link')
            };

            //db.collection('cache').insert(item, { w: 0 });
            sendResult(item);
        }

        //send results
        var sendResult=function(json) {
            json.text=($s(json.text).collapseWhitespace()).s;

            var result = {
                result: true,
                item:{
                    title:json.title,
                    tags:json.tags,
                    excerpt:json.text,
                    media:json.media,
                    html:json.html,
                    type:json.type
                },
                error:json.error
            };

            isEnded=true;
            jsonpBack(result,res,callbackStr);
        }

        //find cached version
        var readibility=require('./parser/readability.js');
        readibility.fas( getQ.url, function(json) {
            /*if (json.status==200)
             saveDb(json);
             else
             {
             sendResult(json); return false;
             }*/
            sendResult(json);
        } );
    });

    httpServer.use('/', function(req,res,next) {
        res.json({result:true, home:true});
    });

    httpServer.listen(1505);
}