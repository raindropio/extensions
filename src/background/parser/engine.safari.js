import safari from './safari'

export default (doc)=>{
	var r = safari(doc);

	return {
		score: r.isReaderModeAvailable(),
		title: ((r._articleTitle||"")+" "+(r._articleSubhead||"")).trim(),
		html: r._adoptableArticle.innerHTML
	}
}