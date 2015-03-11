var refreshPage=function(){
	chrome.extension.sendMessage({action: 'refreshPage'});
	window.close();
	return false;
}

$(function(){
	var lang = (navigator.language || navigator.systemLanguage || navigator.userLanguage || 'en').substr(0, 2).toLowerCase();

	if ((lang == "ru") || (lang == "ru_RU"))
		lang = 'ru_RU';
	else
		lang = 'en_US';

	$('.'+lang).show();

	if (window.location.search=='?unsupported'){
		$('#supported').hide(); $('#unsupported').show();
	}

	$('.refresh-page').click(refreshPage);
	chrome.extension.sendMessage({action: 'removePopup'});
});