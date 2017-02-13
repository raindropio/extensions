const prefix = "rgb_",
	wrapId = "raindropGoogleBlock";

const GoogleSearch = {
	inject(text) {
		var block = document.querySelector('#rhs');
		console.log(block)
		if (!block) return;

		var div = document.querySelector("#"+wrapId);
		if (!div) {
			var div = document.createElement("div");
			div.id = wrapId;
			var content = `
				<div id="${prefix}title">Raindrop.io</div>
				<ul id="${prefix}results"></ul>
				<div id="${prefix}more"></div>
			`;
			block.insertBefore(div, block.firstChild);
		}
	}
}

export default GoogleSearch