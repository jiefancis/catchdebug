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
            const options = {
                site: FROM_SiTE,
                data,
                method: config.method ? config.method : 'post',
                url: config.url
            };

            // console.log('上报log', data)
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
        monitor.logAjaxException = function(){
            network()
        }
        function network(){
            class LogNetwork{
                constructor(){
                    this.requestList = {}
                    this.id = 0
                    this.mockAjax()
                    this.readystates = [0,1,2,3,4]
                    this.collectData = {
                        status: undefined, 
                        readyState: undefined,
                        response: undefined,
                        responseType: undefined,
                        responseURL: undefined,
                        responseXML: undefined,
                        statusText: undefined,
                        withCredentials: undefined
                    }
                }
                generateLogData(XMLReq){
                    for(let key in this.collectData) {
                        this.collectData[key] = XMLReq[key]
                    }
                    return this.collectData
                }
                mockAjax(){
                    let _XMLHttpRequest = window.XMLHttpRequest;
                    if(!_XMLHttpRequest) { return ;}
                    let that = this;
                    const _open = window.XMLHttpRequest.prototype.open,
                          _send = window.XMLHttpRequest.prototype.send,
                          _setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
                        
                    window.XMLHttpRequest.prototype.open = function (){
                        let timer = null;
                        const XMLReq = this;
                        const args = [...arguments],
                            url = args[1],
                            method = args[0],
                            id = ++that.id;

                        const _onreadystatechange = XMLReq.onreadystatechange || function(){};
                        const onreadystatechange = function() {
                        const item = that.requestList[that.id] || {}

                        if(XMLReq.readystate > 1) {
                            item.status = XMLReq.status
                        }

                        console.log(url,'outer  XMLReq.readystate === 4',XMLReq.readyState === 4,XMLReq.readyState,XMLReq.status)
                        if(XMLReq.readyState === 4) {
                            console.log(XMLReq.status,'inner XMLReq.readyState === 4',XMLReq.readyState, (XMLReq.status != 200))
                            if ((url !== config.url) && (XMLReq.status != 200)) {
                            
                                const collectData = that.generateLogData(XMLReq)
                            
                                const logData = {
                                type: 'ajax',
                                url,
                                method,
                                ...collectData,
                                message: 'capture ajax exception'
                                }
                                console.log('捕获异常', logData, XMLReq)
                                monitor.log(logData)
                            }
                            clearInterval(timer)
                        }
                        _onreadystatechange.apply(XMLReq, arguments)
                        }
                        XMLReq.onreadystatechange = onreadystatechange

                        let preState = -1;
                        timer = setInterval(() => {
                            console.log(XMLReq.status,'定时器', XMLReq.readystate)
                            if(preState !== XMLReq.readystate) {
                                preState = XMLReq.readystate
                                
                                onreadystatechange.call(XMLReq)
                            }
                        },10)
                        _open.apply(XMLReq,arguments)
                    }
                }
            }
            new LogNetwork()
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
