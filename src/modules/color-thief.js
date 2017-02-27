function getAverageRGBFromZone(zone, opts) {
  var rgb = {r:0,g:0,b:0},
  len = zone.data.length,
  count = 0,
  i = -4;

  opts = opts || {};

  opts.accuracy = opts.accuracy || 1;

  var blockSize = opts.accuracy;

  while ((i += blockSize * 4) < len ) {
    ++count;
    rgb.r += zone.data[i];
    rgb.g += zone.data[i+1];
    rgb.b += zone.data[i+2];
  }

  rgb.r = ~~(rgb.r/count);
  rgb.g = ~~(rgb.g/count);
  rgb.b = ~~(rgb.b/count);

  return rgb;
}

function getAverageRGB(imgEl) {
  var blockSize = _ACCURACY,
  defaultRGB = {r:0,g:0,b:0},
  canvas = document.createElement('canvas'),
  context = canvas.getContext && canvas.getContext('2d'),
  data, width, height,
  length,
  rgb = {r:0,g:0,b:0},
  rgb_start = rgb,
  rgb_end = {r:0,g:0,b:0},
  count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    rgb = getAverageRGBFromZone(context.getImageData(0, 0, width, height), {accuracy: _ACCURACY});
  } catch(e) {
    console.log('image cannot be processed', e);
    rgb = defaultRGB;
  }
  return [rgb];
}

const _ACCURACY = 100 //more - faster

const ColorThief = {
	getColor(el) {
		var rgb = getAverageRGB(el);
		return [
			rgb[0]["r"],
			rgb[0]["g"],
			rgb[0]["b"]
		]
	}
}
export default ColorThief