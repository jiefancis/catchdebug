import { errorListenerDispatcher } from '../../handler'
function errorListener(e) {
    errorListenerDispatcher(e)
}
export function captureResourceError() {
    window.addEventListener(
        'error',
        errorListener,
        true
    )
}

export function removeResourceError() {
    window.removeEventListener(
        'error',
        errorListener,
        true
    )
}