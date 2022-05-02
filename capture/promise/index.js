import { unhandledrejectionDispatcher } from '../../handler'
function unhandledrejection(e) {
    unhandledrejectionDispatcher(e)
}
export function captureUnhandledRejection() {
    window.addEventListener(
        'unhandledrejection',
        unhandledrejection,
        false
    )
}

export function removeUnhandledRejection() {
    window.removeEventListener(
        'unhandledrejection',
        unhandledrejection,
        false
    )
}