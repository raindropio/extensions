import _filter from 'lodash/filter'
import _escapeRegExp from 'lodash/escapeRegExp'
import _reduce from 'lodash/reduce'
import normalizeURL from 'normalize-url'

const $ = (q)=>document.querySelectorAll(q)||[]

class Parser {
	constructor() {
		this.fieldsMap = [
			{field: 'title', properties: ['og:title', 'twitter:title', 'ms.prod']}, //order matters. 'ms.prod' not in head, maybe parse all page :(
			{field: 'excerpt', properties: ['og:description', 'twitter:description']},
			{field: 'image', properties: ['og:image', 'twitter:image']},
			{field: 'site_name', properties: ['og:site_name']},
		]

		//bind
		this.getItem = this.getItem.bind(this)
	}

	async getItem() {
		const domain = this._getCleanDomain(location.hostname)

		const head = {
			query: $,
			temp: null
		}

		//If is single page application, download html of original document
		//Important because meta tags are usually not updated for SPA's
		if ((window.history.state)&&(window.history.length>1)){
			console.log('Download origin html, due to SPA')

			head.original = (await (await fetch(location.href, {cache: 'force-cache'})).text())
				.replace(/\r?\n|\r/g, '')
				.match(/<head.+?<\/head>/g)

			if (head.original && head.original.length){
				head.temp = document.createElement('div')
				head.temp.innerHTML = head.original[0]
				head.query = (q)=>head.temp.querySelectorAll(q)||[]
			}
			else
				return null
		}

		const cache = {
			h1: ''
		}

		//get H1 and document title
		cache.documentTitle = document.title
		try{cache.h1 = $('h1')[0].innerText}catch(e){}

		//check og and twitter meta tags
		this.fieldsMap.forEach(({field, properties})=>{
			if (!cache[field])
				properties.forEach((prop)=>{
					const tags = head.query(`meta[property="${prop}"][content], meta[name="${prop}"][value]`)
					if (tags && tags.length){
						const content = tags[0].getAttribute('content')||tags[0].getAttribute('value')
						if (content){
							var ignore = false
							
							//if title weird? check half of it with document title and h1
							const partValue = content.substr(0, content.length/2).toLowerCase()
							if (field == 'title' && !cache.documentTitle.toLowerCase().includes(partValue))
								if (!cache.h1.toLowerCase().includes(partValue))
									ignore = true

							if (!ignore)
								cache[field] = content
						}
					}
				})
		})

		//fallback to classic
		if (!cache.title)
			//Clean document title, remove site name in the end of string (including minus, etc)
			cache.title = cache.documentTitle.replace(new RegExp(
				'\\s.\\s'+
				(cache.site_name ? _escapeRegExp(cache.site_name)+'$|' : '')+
				_escapeRegExp(domain)+'$'
			, 'i'), '').trim().replace(/(\||-|—)$/i,'').trim()

		//fallback to server parser if image not found
		if (!cache.image)
			return null

		//make item
		const clean = {
			url: location.href,
			domain,
			title: cache.title,
			excerpt: cache.excerpt,
			coverId: 0,
			type: 'link',
			parser: 'local',
			...this._getMedia(cache.image)
		}

		console.log('Parsed locally')

		return clean
	}

	_getMedia(mainImageURL='') {
		const 
			minSize = 150,
			maxOffsetTop = 2000,
			images = [
				this._getCleanURL(mainImageURL)
			]

		//do that image present in content? if NO get image from content
		if (!mainImageURL || !document.body.innerHTML.includes(this._getCompactURL(mainImageURL))) {
			//all images, but bigger than limit and in on top of the page
			const allPageImages = _filter($('img[src]:not([hidden])'), (img)=>
				(img.getBoundingClientRect().top + window.pageYOffset < maxOffsetTop) && 
				img.naturalWidth>=minSize && 
				img.naturalHeight>=minSize
			)
			const avgWidth = _reduce(allPageImages, (a,b)=>a+b.naturalWidth, 0)/allPageImages.length

			for(var i in allPageImages)
				if (allPageImages[i].naturalWidth>=avgWidth){
					images.push(this._getCleanURL(allPageImages[i].src))
					break;
				}
		}

		const media = [...new Set(images)].filter(link=>link).map((link)=>({type: 'image', link}))

		return {
			media,
			cover: (media.length?media[0].link:'')
		}
	}

	_getCleanURL(url='') {
		var clean = url
		try{clean = normalizeURL(url)}catch(e){}
		return clean
	}

	_getCompactURL(url='') {
		var compact = url

		try{
			compact = normalizeURL(url, {
				normalizeHttps: true,
			})
		}catch(e){}

		return compact.replace(/\?.+$/,'').replace('http://','')
	}

	_getCleanDomain(domain='') {
		return domain.replace(/^www\./,'')
	}
}

export default new Parser()