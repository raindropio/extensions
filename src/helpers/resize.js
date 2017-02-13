import resizeImage from 'resize-image'

export default (data, callback)=>{
	var source = new Image();
	source.onload = ()=>{
		var resized;
		try{resized = resizeImage.resize(source, 640, parseInt((source.clientHeight/source.clientWidth)*640), resizeImage.JPEG);}catch(e){}
		callback(resized||data);
	}
	source.src = data;
}