import { getClient } from '../core'
let client = getClient()
export function xhrErrorDispatcher(type, detail) {
    // console.log('错误类型', type, detail)
    client.notify(detail)
}