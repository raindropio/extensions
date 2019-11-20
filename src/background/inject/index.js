import ex from '../extension'
import Parser from './parser'

window.raindropInjectScriptLoaded = true

ex.extension.runtime && ex.extension.runtime.onMessage && ex.extension.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action){
        case "parse":
            if (request.url != window.location.href)
                return sendResponse(null)

            Parser.getItem()
                .then(sendResponse)
                .catch(e=>{
                    console.log(e)
                    sendResponse(null)
                })
        break;
    }

    return true
})