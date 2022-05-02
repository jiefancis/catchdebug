import { getClient } from '../core'
let client = getClient()
function handleUncaughtError(e) {
    let {
        message,
        lineno,
        colno,
        error: { stack }
    }
    let detail = {
        message,
        lineno,
        colno,
        stack
    }
    client.notify(detail)
}

function handleResourceError(e) {
    let target = e.target
    let detail = {
        outerHTML: target.outerHTML,
        tag: target.tagName,
        src: target.src,
        id: target.id
    }
    client.notify(detail)
}
export function errorListenerDispatcher(e) {
    let { message, error } = e

    if(message && error) {
        handleUncaughtError(e)
    } else {
        handleResourceError(e)
    }
    client.notify(detail)
}