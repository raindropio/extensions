var {sendMessageToBackground} = require('../extension').default

const dragAreaID = "raindrop-drag-area";

const Drag = {
	showing: false,
	elem: null,

	render() {
		this.elem = document.getElementById(dragAreaID);

		if (this.showing){
			if (!this.elem){
				this.elem = document.createElement('div');
				this.elem.id = dragAreaID;
				document.body.appendChild(this.elem);

				this.elem.removeEventListener("dragover", this.onElemDragOver);
				this.elem.addEventListener("dragover", this.onElemDragOver);

				this.elem.removeEventListener("dragenter", this.onElemDragEnter);
				this.elem.addEventListener("dragenter", this.onElemDragEnter);

				this.elem.removeEventListener("dragleave", this.onElemDragLeave);
				this.elem.addEventListener("dragleave", this.onElemDragLeave);

				this.elem.removeEventListener("drop", this.onDrop);
				this.elem.addEventListener("drop", this.onDrop);
			}

			this.elem.innerHTML = `
				<div id="${dragAreaID}-icon-wrap">
					<svg id="${dragAreaID}-icon-arrow" width="8" height="11" viewBox="0 0 8 11" xmlns="http://www.w3.org/2000/svg"><path d="M5 4v7H3V4H0l4-4 4 4" fill-rule="evenodd"/></svg>
					<svg id="${dragAreaID}-icon-cloud" width="32" height="24" viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg"><path d="M25.8 12l.2-2c0-5.5-4.5-10-10-10-5 0-9 3.5-9.8 8.2C2.6 9 0 12.2 0 16c0 4.4 3.6 8 8 8h18c3.3 0 6-2.7 6-6s-2.7-6-6-6h-.2z" fill-rule="evenodd"/></svg>
				</div>
			`;
		}else {
			if (this.elem){
				this.elem.classList.add(dragAreaID+'-is-closing');
				setTimeout(()=>document.body.removeChild(this.elem),200);
			}
		}
	},

	onDrop(e) {
		e.preventDefault();
		
		sendMessageToBackground({action: "saveLink", url: e.dataTransfer.getData("text/uri-list")})
	},

	onElemDragOver(e) {
		e.preventDefault();
	},

	onElemDragEnter(e) {
		e.dataTransfer.effectAllowed = 'copy'
		e.dataTransfer.dropEffect = 'copy'
		this.elem.classList.add(dragAreaID+'-is-over')
	},

	onElemDragLeave() {
		this.elem.classList.remove(dragAreaID+'-is-over')
	},

	onGlobalDragStart(e) {
		var link = e.dataTransfer.getData("text/uri-list");
		if ((link)&&(link!=window.location.href)) {
			this.showing = true;

			this.render();
		}
	},

	onGlobalDragEnd() {
		this.showing = false;

		this.render();
	},

	init() {
		this.onDrop = this.onDrop.bind(this);
		this.onElemDragOver = this.onElemDragOver.bind(this);
		this.onElemDragEnter = this.onElemDragEnter.bind(this);
		this.onElemDragLeave = this.onElemDragLeave.bind(this);
		this.onGlobalDragStart = this.onGlobalDragStart.bind(this);
		this.onGlobalDragEnd = this.onGlobalDragEnd.bind(this);

		document.removeEventListener("dragstart", this.onGlobalDragStart);
		document.addEventListener("dragstart", this.onGlobalDragStart);
		
		document.removeEventListener("dragend", this.onGlobalDragEnd);
		document.addEventListener("dragend", this.onGlobalDragEnd);
	}
}

export default Drag