import React from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import strings from '../modules/strings'
import Dialog from '../co/dialog'
import Httpload from '../co/httpload'
import network from 'network'

var isModal = false;

class Base extends React.Component {
	componentWillMount() {
		var elem = document.getElementById("app");
		var classNames = [];

		//is retina display?
        if (typeof window !== "undefined")
        if (window.devicePixelRatio && devicePixelRatio >= 2)
            if (typeof document !== 'undefined')
                classNames.push('retina');

        //Is modal mode
        isModal = (network.getSearchParam('modal') ? true : false);
        if (isModal)
        	classNames.push('is-modal');

        classNames = classNames.concat(strings.getCurrentBrowser());

        classNames.forEach((c)=>{
        	elem.classList.add(c);
        })

        //On blur close if is modal
        if (!__DEV__)
            window.addEventListener('blur', ()=>window.close());

        if (isModal){
        	window.addEventListener('keydown', (e)=>{
        		if (!e.defaultPrevented)
	        		if (e.keyCode==27)
	        			window.close()
        	});
        }

        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;

        //fix mac
        if ((classNames.indexOf("mac")!=-1)&&(__PLATFORM__=="chrome")){
            document.body.style.paddingBottom="1px"
            setTimeout(()=>document.body.style.paddingBottom="0",300)
        }
	}

	render() {
		return (
			<div>
				<div id="app-body">{this.props.children}</div>
				<Dialog />
                <Httpload />
			</div>
		);
	}
}


export default DragDropContext(HTML5Backend)(Base);