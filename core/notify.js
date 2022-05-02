import { getClient } from './index'
export function notify(event) {
    return new Promise((resolve, reject) => {
        let client = getClient()
        xhr(event, client._url).then(res => resolve(res)).catch(err => reject(err))
    })
}

function xhr(event, url, method = 'post', async = true) {
    return createApi(event,method, url, async)
}
function createApi(event, method, url, async) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest()
        xhr.open(method, url, async)
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE) {
                if(this.status >= 200 || this.status < 300) {
                    resolve(this.response)
                } else {
                    reject(this.response)
                }
            }
        }
        xhr.send(event)
    })
    
}

