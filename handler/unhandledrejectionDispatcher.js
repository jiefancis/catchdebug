import { getClient } from '../core'
let client = getClient()
export function unhandledrejectionDispatcher(e) {
    
    let detail = {
        message: e.reason.message || e.reason,
        stack: e.reason.stack
    }
    console.log('unhandledrejectionDispatcher', e)
    client.notify(detail)
}