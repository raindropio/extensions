import resizeImage from 'resize-image'
import network from '../../modules/network'

const Helpers = {
	thumb(url,w,h) {
		return new Promise((res,rej)=>{
			if (!url) return res("");

			var img = new Image();
			img.onload= function () {
				var data = "";
				try{data = resizeImage.resize(img, w, h, resizeImage.PNG);}catch(e){if (e)console.log(e)}
				res(data);
			};
			img.onerror = function(e) {
				if (e)console.log(e)
				res("");
			}
			img.src = network.thumb(url, 100);
		})
	}
}

export default Helpers