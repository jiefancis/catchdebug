import { xhrErrorDispatcher } from '../../handler'
const xhrOrigin = XMLHttpRequest.prototype
const xhrOpen = xhrOrigin.open
const xhrSend = xhrOrigin.send

export function captureAjaxError() {
    let desc = {}
    xhrOrigin.open = function(method, url, async = true) {
        desc.method = method
        desc.url = url
        desc.async = async
        xhrOpen.call(this, ...arguments)
    }

    xhrOrigin.send = function(...arg) {
        this.addEventListener('readystatechange', function(){
            if(this.readyState === XMLHttpRequest.DONE) {
                if(client.url !== desc.url) {
                    const detail = {
                        req: {
                            url: desc.url,
                            method: desc.method,
                            async: desc.async,
                            data: arg
                        },
                        res: {
                            status: this.status,
                            statusText: this.statusText,
                            response: this.response
                        }
                    }
                    console.log('上报数据', detail)
                    xhrErrorDispatcher(detail)
                }
            }
        })
        xhrSend.apply(this, arg)
    }
}

export function removeAjaxError() {
    xhrOrigin.open = xhrOpen
    xhrOrigin.send = xhrSend
}