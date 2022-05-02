import { unhandledrejectionDispatcher } from '../../handler'
function unhandledrejection(e) {
    unhandledrejectionDispatcher(e)
}
export function captureUnhandledRejection() {
    window.addEventListener(
        'unhandledRejection',
        unhandledrejection,
        false
    )
}

export function removeUnhandledRejection() {
    window.removeEventListener(
        'unhandledRejection',
        unhandledrejection,
        false
    )
}