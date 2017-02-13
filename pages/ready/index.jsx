import React from 'react'
import { render } from 'react-dom'
import Page from './page'

require('./css/root.styl')

var isRendered = false;
const TryToRender = ()=>{
	if (isRendered) return;

	var elem = document.getElementById('app');
	if (elem){
		render(<Page />, elem);
		isRendered=true;
	}
}

TryToRender();
window.addEventListener('load', TryToRender);
document.addEventListener("DOMContentLoaded", TryToRender);