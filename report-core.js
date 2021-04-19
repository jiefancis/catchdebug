import Vue from 'vue'
import axios from 'axios'

// 网页崩溃的监控原理

// export const install = function(Vue){
//     let events = [
//         'open', 'send',
//         'loadstart', 'loadend', 'load',
//         'abort'
//     ];
//     let oldXMLHttpRequest = window.XMLHttpRequest;
//     reset()
//     let options = {
//         url: "http://localhost:3000/create",
//     }

    
//         const report = {
//             send(err){
//                 // let url = "http://localhost:3000/create"
//                 axios.post(options.url, {detail: JSON.stringify(err)})
//             }
//         }
//         const shared = {
//             noop(){}
//         }

//         const captureHandler = {
//             init,
//             captureVueError,
//             captureResourceError,
//             capturePromiseError,
//             captureAjaxError,
//             captureAjaxHandler
//         }

//         function init(_options){
//             Object.assign(options, _options)
//             captureHandler.captureAjaxError()
//         }
//         /**vue js runtime error */
//         function captureVueError(){
//             let origal = Vue.config.errorHandler || shared.noop;
//             return function(err,vm,info){
//                 report.send({
//                     message: err.message,
//                     stack: err.stack,
//                     info,
//                     errorType: 'referenceError',
//                     type: err.srcElement.localName
//                 })
//                 origal.call(this,err, info, vm)
//             }

//         }
        
//         Vue.config.errorHandler = captureVueError()
        

//         /**vue resource load error */
//         function matchResourceError(srcElement){
//             let matchs = [HTMLImageElement, HTMLLinkElement, HTMLScriptElement]
//             return matchs.filter(proto => srcElement instanceof proto).length
//         }
//         function captureResourceError(err){
//             if(matchResourceError(err.srcElement)){
//                 report.send({
//                     message: err.srcElement.currentSrc,
//                     site: err.srcElement.baseURI,
//                     errorType: 'resourceError',
//                     type: err.srcElement.localName
//                 })
//             }
//         }
//         window.addEventListener('error', captureResourceError, true)
        

//         /**promise not catch error */
//         function capturePromiseError(e) {
//             console.error('PROMISE', e)
//             console.error(`UNHANDLED PROMISE REJECTION: ${e.reason}`);
//         }
//         window.addEventListener('unhandledrejection', capturePromiseError, false)


//         /**ajax interactive exception */
//         function captureAjaxError(){
//             function newXHR(){
//                 let realXHR = new oldXMLHttpRequest()
//                     let eventName
//                     events.forEach(event => {
//                         realXHR.addEventListener(event, function(){
//                             eventName = `ajax${event[0].toUpperCase() + event.slice(1)}`
//                             createCustomEvent(eventName)
//                         })
//                     })
                
//                 return realXHR
//             }
//             events.forEach(event => {
//                 window.addEventListener(`ajax${event[0].toUpperCase() + event.slice(1)}`, e => {
//                     ajaxHandlerCb(event, {_reportEvent: true, e})
//                 })
//             })
//             window.XMLHttpRequest = newXHR
             
//             var captureAjaxHandler = {
//                 open(e){
//                     // console.log('open', e)
//                     // report.send(err)
//                 },
//                 send(e){
//                     // console.log('send', e)
//                 },
//                 loadstart(e){
//                     // console.log('loadstart', e)
//                 },
//                 loadend(e){
//                     // console.log('loadend', e)
//                 },
//                 load(e){
//                     // console.log('load', e)
//                 },
//                 abort(e){
//                     // console.log('abort', e)
//                 },
//             }
//             function ajaxHandlerCb(eventName, e) {
//                 captureAjaxHandler[eventName](e)
//             }
//         }
//         function createCustomEvent(eventName){
//             let event = new CustomEvent(eventName, { detail: this })
//             window.dispatchEvent(event)
//         }
        
        
        


//         /**项目重新刷新，是否又会重新引入一次？再次绑定再次初始化？ */
//         function reset(){
//             removeAjaxEvent()
//             removeResourceEvent()
//             removePromiseEvent()
//         }
//         function removeAjaxEvent() {
//             let realXHR = new oldXMLHttpRequest()
//             events.forEach(event => {
//                 realXHR.removeEventListener(event, () => shared.noop)
//                 window.removeEventListener( `ajax${event[0].toUpperCase() + event.slice(1)}`, () => shared.noop)
//             })
//         }
//         function removeResourceEvent(){
//             window.removeEventListener('error', () => shared.noop)
//         }
//         function removePromiseEvent(){
//             window.removeEventListener('unhandledrejection', () => shared.noop)
//         }

// export const Report = captureHandler
    
// }

// import axios from 'axios'
// import Vue from 'vue'
const baseApi = {
    log(){}, // 上报
    init(){},
}
const shared = {
    noop(){}
}
const utils = {
    matchResourceType(target){
        const types = [HTMLImageElement,HTMLLinkElement,HTMLScriptElement]
        return types.filter(proto => target instanceof proto).length
    },
    generatorXhrApi(name){
        return `ajax${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`
    }
}
const FROM_SiTE = window.location.href
const xhrEvents = ['open', 'send', 'loadstart','loadend', 'load', 'abort']
const em = (
    function(){
        const monitor = {...baseApi}
        monitor.log = function(...data){
            const _default = {
                site: FROM_SiTE
            };
        }
        // 初始化，传入自定义上传地址与
        monitor.init = function (options){
            monitor.bindEvent()
        }
            
        monitor.bindEvent = function (){
            monitor.logJsException()
            monitor.bindErrorEvent()
            monitor.logCrashException()
        }
        // js的异常
        monitor.logJsException = function(){
            const oldHandler = Vue.config.errorHandler || shared.noop;
            Vue.config.errorHandler = function(err, vm, info) {
                oldHandler.call(this, err, vm, info)
                const data = {
                    type: 'js',
                    stack: err,
                    component: vm,
                    message: info
                };
                monitor.log(data)
            }
        }

        // 静态资源加载的异常(图片, link, script等)
        monitor.logResourceException = function(err){
            if(utils.matchResourceType(err.srcElement)) {
                const data = {
                    type: 'resource',
                    stack: err.srcElement,
                    src: err.srcElement.currentSrc,
                    message: 'image load exception',
                };
                monitor.log(data)
            }
        }
        monitor.bindErrorEvent = function(){
            window.addEventListener('error', monitor.logResourceException, true)
        }

        // promise的异常
        monitor.bindPromiseEvent = function(){
            window.addEventListener('unhandledrejection', monitor.logPromiseException, false)
        }
        monitor.logPromiseException = function (err) {
            const data = {
                type: 'promise',
                stack: err,
                message: err.reason,
                message: 'promise runtime exception capture',
            };
            monitor.log(data)
        }

        // 接口异常捕获
        // 重写XML && 监听api操作
        function overwriteXhr(){
            const oldXML = window.XMLHttpRequest;
            function newXML(){
                const realXhr = new oldXML()
                xhrEvents.forEach(event => {
                    realXhr.addEventListener(event, () => {
                        invokeXhrApi(customName)
                    })
                })
                return realXhr
            }
            window.XMLHttpRequest = newXML
        }
        // 触发自定义xhr api事件
        function invokeXhrApi(eventName){
            const event = new CustomEvent(eventName, {detail: this})
            window.dispatchEvent(event)
        }
        // 处理ajax api事件信息
        function ajaxApiHandler(e) {
            const handler = {
                open(){}
            }
        } 
        monitor.logAjaxException = function(){
            const customName = utils.generatorXhrApi(event)
                        window.addEventListener(customName, function(e) {})
            overwriteXhr()
        }

        // 网页崩溃异常，后期会实现为插件引入
        monitor.logCrashException = function () {
            if('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { scope: '/'}).then(res => {
                    console.log('register successed', res)
                    let HEARTBEAT_INTERVAL = 5 * 1000; // 每五秒发一次心跳
                    let sessionId = 'user-invoke';
                    let heartbeat = function () {
                        navigator.serviceWorker.controller.postMessage({
                        type: 'heartbeat',
                        id: sessionId,
                        data: {} // 附加信息，如果页面 crash，上报的附加数据
                        });
                    }
                    window.addEventListener("beforeunload", function() {
                        navigator.serviceWorker.controller.postMessage({
                        type: 'unload',
                        id: sessionId
                        });
                    });
                    setInterval(heartbeat, HEARTBEAT_INTERVAL);
                    heartbeat();
                }).catch(err => {
                  console.log('register failed', err)
                })
            }
        }
    }
)()
export const emo = em