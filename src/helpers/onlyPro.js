import dialogStore from '../stores/dialog'
import extensionHelpers from './extension'
import config from '../modules/config'
import t from 't'

const onlyPro = {
	showAlert(highlight) {
		dialogStore.onShow({
    		title: t.s("footerProAd")+" "+t.s("footerProAdD"),
    		excerpt: `
    			<ul>
	    			<li>
	    				<b class="${highlight==1?"highlight":""}">${t.s("nestedCollections")}</b><br/>
	    				${t.s("pro_nestingD")}
	    			</li>
	    			<li>
	    				<b class="${highlight==2?"highlight":""}">${t.s("suggested")} ${t.s("tags").toLowerCase()}</b><br />
	    				${t.s("suggestedTagsD")}
	    			</li>
	    			<li>
	    				<b>${t.s("pro_dropboxD")}</b>
	    			</li>
	    			<li>
	    				<b>${t.s("und")} ${t.s("more").toLowerCase()}...</b>
	    			</li>
    			</ul>
    		`,
			items: [
				{
					title: t.s("goToPRO"),
					onClick: (item)=>{
						extensionHelpers.openTab(config.proPage)
					}
				}
			]
		})
	}
}

export default onlyPro