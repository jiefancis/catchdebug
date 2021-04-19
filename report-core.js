import Vue from 'vue'
import axios from 'axios'
const baseApi = {
    log(){}, // 上报
    init(){},
    bindEvent(){},
    logJsException(){},
    logResourceException(){},
    bindErrorEvent(){},
    bindPromiseEvent(){},
    logPromiseException(){},
    logAjaxException(){},
    logCrashException(){}
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
const xhrEvents = ['open', 'send','load', 'loadstart','loadend', 'abort', 'progress']
const URL_MAP = new Map()
let CURRENT_URL = ''
const emo = (
    function(){
        let config = {}
        const monitor = baseApi
        monitor.log = function(data){
            // ajax监控暂未完善
            if(data.type === 'ajax') {
                return 
            }
            const options = {
                site: FROM_SiTE,
                data,
                method: config.method ? config.method : 'post',
                url: config.url
            };

            console.log('上报log', data)
            axios({
                ...options
            }).then(res => {
                console.log('上报成功', res)
            }).catch(err => {
                console.log('上报失败', err)
            })

        }
        // 初始化，传入上传地址
        monitor.init = function (options){
            config = {...options}
            monitor.bindEvent()
        }
            
        monitor.bindEvent = function (){
            monitor.logJsException()
            monitor.bindErrorEvent()
            monitor.logAjaxException()
            monitor.bindPromiseEvent()
            // monitor.logCrashException()
        }
        // js的异常
        monitor.logJsException = function(){
            const oldHandler = Vue.config.errorHandler || shared.noop;
            Vue.config.errorHandler = function(err, vm, info) {
                const data = {
                    type: 'js',
                    stack: err.stack,
                    message: err.message
                };
                monitor.log(data)
                oldHandler.call(this, err, vm, info)
            }
        }
        
        // 静态资源加载的异常(图片, link, script等)
        monitor.logResourceException = function(err){
            if(utils.matchResourceType(err.srcElement)) {
                const data = {
                    type: 'resource',
                    stack: err.type,
                    src: err.srcElement.currentSrc,
                    message: 'image load exception',
                };
                monitor.log(data)
            }
        }
        monitor.bindErrorEvent = function(){
            window.addEventListener('error', monitor.logResourceException,true)
        }

        // promise的异常
        monitor.bindPromiseEvent = function(){
            window.addEventListener('unhandledrejection', monitor.logPromiseException, true)
        }
        monitor.logPromiseException = function (err) {
            const {message, stack} = err && err.reason || {}
            const data = {
                type: 'unhandledrejection',
                stack: stack,
                message: message,
            };
            monitor.log(data)
        }

        // 接口异常捕获
        // 重写XML && 监听api操作
        function overwriteXhr(){
            overOpen()
            overSend()
            const oldXML = window.XMLHttpRequest;
            function newXML(){
                const realXhr = new oldXML()
                xhrEvents.forEach(event => {
                    realXhr.addEventListener(event, (e) => {
                        console.log(event,'invoke ajax api', e)
                        const customName = utils.generatorXhrApi(event)
                        invokeXhrApi.call(realXhr,customName)
                    },true)
                })
                return realXhr
            }
            newXML.prototype = oldXML.prototype
            window.XMLHttpRequest = newXML
        }
        function overOpen(){
            const xhrProto = window.XMLHttpRequest.prototype
            const oldOpen = xhrProto.open
            xhrProto.open = function(...params){
                let [method,url] = params;
                CURRENT_URL = url
                if(!URL_MAP.has(url)) {
                    URL_MAP.set(url, true)
                }
                oldOpen.apply(this, params)
                console.log('open111', CURRENT_URL,params)
            }
        }
        function overSend(){
            const xhrProto = window.XMLHttpRequest.prototype
            const oldSend = xhrProto.send
            xhrProto.send = function(...params){
                console.log('send222', CURRENT_URL, params)
                oldSend.apply(this, params)
            }
        }
        // 触发自定义xhr api事件
        function invokeXhrApi(eventName){
            const event = new CustomEvent(eventName, {detail: this})
            window.dispatchEvent(event)
        }
        // 处理ajax api事件信息
        const handler = {
            open(){}
        }
        // 上报ajax异常
        monitor.logAjaxException = function(){
            xhrEvents.forEach(event => {
                handler[event] = function(e){
                    const data = {
                        stack: e,
                        message: e.message,
                        type: 'ajax'
                    }
                    // monitor.log(data)
                }
                const customName = utils.generatorXhrApi(event)
                window.addEventListener(customName, function(e) {
                    console.log(customName,'上报ajax异常', e, '')
                    handler[event](e)
                }, true)
            })
            
            overwriteXhr()
        }
        
        // 网页崩溃异常，后期会实现为插件引入
        monitor.logCrashException = function () {
            if('serviceWorker' in navigator) {
                navigator.serviceWorker.register('../public/sw.js', { scope: '/'}).then(res => {
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
                        },true);
                    });
                    setInterval(heartbeat, HEARTBEAT_INTERVAL);
                    heartbeat();
                }).catch(err => {
                  console.log('register failed', err)
                })
            }
        }
        return monitor
    }
)()
export const em = emo
