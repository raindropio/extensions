require('../css/static/cover.styl')

import React from 'react'
import t from 't'
import Button from '../co/common/button'
import Masonry from 'react-masonry-component'
import network from '../modules/network'
import resize from '../helpers/resize'

import bookmarkActions from '../actions/bookmark'
import bookmarkStore from '../stores/bookmark'
import ThemeColor from '../co/common/themeColor'
import ThemeColorHelper from '../helpers/themeColor'

import extensionHelper from '../helpers/extension'
var _ = {
	capitalize: require('lodash/capitalize'),
	findIndex: require('lodash/findIndex')
}

function urltoFile(url, filename, mimeType){
	return (fetch(url)
		.then(function(res){return res.arrayBuffer();})
		.then(function(buf){return new File([buf], filename,{type:mimeType});})
	);
}

export default class Cover extends React.Component {
	constructor(props) {
		super(props);

		this.renderImg = this.renderImg.bind(this);
		this.onImageLoaded = this.onImageLoaded.bind(this);
		this.onCapturePage = this.onCapturePage.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

		this.state = this.prepareBookmark(props)
	}

	prepareBookmark(props) {
		return {
			linkBack: 		"/edit/"+props.params.id+"?already=1&anim=appear",
			item: 			bookmarkStore.getItem()||{}
		}
	}

	onBookmarkChange() {
		this.setState(this.prepareBookmark(this.props))
	}

	componentDidMount() {
		this.unsubscribeBookmark = bookmarkStore.listen(this.onBookmarkChange.bind(this));
		bookmarkStore.onLoadId(this.props.params.id);

        window.addEventListener('keydown', this.onKeyDown, true);
	}

	componentWillUnmount() {
        this.unsubscribeBookmark();

        window.removeEventListener('keydown', this.onKeyDown, true);
    }

    componentDidUpdate() {
    	if (this.refs.masonry)
    		this.refs.masonry.masonry.layout()
    }

    onKeyDown(e) {
        switch(e.keyCode) {
            case 27:
                e.preventDefault();
                e.stopPropagation();
                window.location.hash = "#"+(this.state.linkBack);
            break;
        }
    }

    onImageLoaded() {
    	if (this.refs.masonry)
    		this.refs.masonry.masonry.layout()
    }

    onCheck(index) {
    	this.updateBookmark({coverId: index, cover: index, coverEnabled: true});
    }

    updateBookmark(obj) {
    	bookmarkActions.update(obj);
    	window.location.hash = "#"+(this.state.linkBack)
    }

    onCapturePage() {
    	extensionHelper.capturePage(this.state.item.link, (item)=>{
    		if (item.dataURI){
				urltoFile(item.link, `${new Date().getTime()}.jpg`, 'image/jpeg')
					.then(file=>{
						bookmarkActions.uploadCover({
							_id: this.state.item._id,
							file
						})

						window.location.hash = "#"+(this.state.linkBack)
					})
			}
    		else{
    			var media = JSON.parse(JSON.stringify(this.state.item.media||[]));
    			media.unshift(item);
    			this.updateBookmark({coverId: 0, cover: 0, coverEnabled: true, media: media});
    		}
    	})
    }

    renderImg(item, index) {
    	return (
    		<div className="cover-page-item" key={index}>
    			<a className="cover-page-item-link" onClick={()=>this.onCheck(index)}>
    				{index == this.state.item.coverId ? <Button notLink={true} className="button primary circle" icon="check,normal" /> : null}
    				<img src={network.fixURL(item.link)} onLoad={this.onImageLoaded} />
    			</a>
    		</div>
    	);
    }

    renderMakeScreenshot() {
    	var haveScreenshot = false;
        try{haveScreenshot = (_.findIndex(this.state.item.media||[], {screenshot: true})!=-1);}catch(e) {}
        if (haveScreenshot) return null;

        return (
        	<div className="cover-page-item cover-page-item-screenshot" key="screenshot">
				<Button className="button normal" title={t.s('clickToMakeScreenshot')} onClick={this.onCapturePage}>{_.capitalize(t.s("screenshot"))}</Button>
			</div>
        );
    }

	render() {
		var items = (this.state.item.media||[]).map(this.renderImg);


		return (
			<div className="common-page cover-page">
				<header>
                    <Button href={"#"+this.state.linkBack} className="button link" icon="back,normal"/>
					<div className="title">{t.s("cover")}</div>

				</header>

                <ThemeColor collectionId={this.state.item.collection.$id} cssBlock={ThemeColorHelper.generateCSS} />

				<div className="common-page-content cover-page-items">
					<Masonry ref="masonry" elementType="article" options={{transitionDuration: "0"}}>
						{this.renderMakeScreenshot()}
						{items}
					</Masonry>
				</div>
			</div>
		);
	}
}