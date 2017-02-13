export default {
	focusNext(el) {
		var universe = document.querySelectorAll('input, button, select, textarea, a[href]');
    	var list = Array.prototype.filter.call(universe, function(item) {return item.tabIndex >= "0"});
    	var index = list.indexOf(el);
    	var nextElem = list[index + 1] || list[0];
    	nextElem.focus();
	}
}