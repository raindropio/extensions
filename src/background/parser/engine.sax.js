import sax from './sax'

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

export default (doc)=>{
	var readable = new sax({
        searchFurtherPages: false,
        resolvePaths: true
    });
	saxParser(doc, readable);
	var tempArticle = readable.getArticle();

	return {
		score: tempArticle.score,
		title: tempArticle.title,
		html: tempArticle.html
	}
}