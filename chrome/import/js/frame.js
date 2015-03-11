var frame = {
    parseQuery: function() {
        var q = window.location.search.substr(1).split('&'), params=[];
        q.forEach(function(i){
            params[ i.split('=')[0] ] = decodeURIComponent(i.split('=')[1]);
        });
        return params;
    }
}

$(function(){
    var query = frame.parseQuery();
    $('head base').attr('href', query.url);
    parser.load(query.url);
});