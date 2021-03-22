
export function install(Vue) {
    let oldErrorHandler = Vue.config.errorHandler;
    if (typeof oldErrorHandler === 'function') {
        function handlerError(error, vm, info){
            console.log('errorHandler',error, 123,vm, 456,info)
            // do something to report
            oldErrorHandler.call(Vue, error,vm,info)
        }
        Vue.config.errorHandler = handlerError
    }
    

    (function(){
        function ajaxEventTrigger(event) {
            var ajaxEvent = new CustomEvent(event, {detail: this})
            window.dispatchEvent(ajaxEvent)
        }

        var oldXMLHttpRequest = window.XMLHttpRequest;
        function newXHR(){
            var realXHR = new oldXMLHttpRequest()
            var events = [
                'abort','error','load','loadstart',
                'loadend','progress','timeout','readystatechange',
            ]
            events.forEach(event => {
                realXHR.addEventListener(event, function(){
                    ajaxEventTrigger.call(this, `ajax${event[0].toUpperCase() + event.slice(1)}`)
                },false)
            })
            return realXHR
        }
        window.XMLHttpRequest = newXHR;


        // 如何调用？
        var xhr = new XMLHttpRequest();
        var events = [
            'abort','error','load','loadstart',
            'loadend','progress','timeout','readystatechange',
        ]
        events.map(event => {
            window.addEventListener(`ajax${event[0].toUpperCase() + event.slice(1)}`, e => {
                // console.log('e.detail.responseURL', e.detail.responseURL)
                // if(e.detail.responseURL.indexOf('baidu.com') !== -1) {
                    console.log(`ajax${event[0].toUpperCase() + event.slice(1)}`, e,e.detail)
                // }
                
            })
        })
        xhr.open('get', 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=xhr%20state%20canceled&fenlei=256&oq=xhr.open%25E5%258F%2582%25E6%2595%25B0&rsv_pq=aea827e20000ab1c&rsv_t=20cbakG5E7IreDtitzEBPm%2BNcgy5liSfRCruTv%2FHO2MoKpdGi%2BskDu5ViaI&rqlang=cn&rsv_enter=1&rsv_dl=tb&rsv_btype=t&inputT=8380&rsv_sug3=43&rsv_sug1=27&rsv_sug7=101&rsv_sug2=0&rsv_sug4=8494')
        xhr.send()
        
        xhr.open('get', 'https://ips-gateway-sit.qizhidao.com/common/currency/list/page/1/10')
        xhr.send()

        window.addEventListener("unhandledrejection", event => {
            console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
            console.log(event.reason.stack)
        });
    })()
}