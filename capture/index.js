import { captureAjaxError, removeAjaxError} from './network/ajaxError'
import { captureUnhandledRejection, removeUnhandledRejection} from './network/ajaxError'
import { captureResourceError, removeResourceError} from './network/ajaxError'

function caputureErrorListener() {
    captureAjaxError()
    captureUnhandledRejection()
    captureResourceError()
}

function removeErrorListener(){
    window.addEventListener(
        'unload',
        (e) => {
            removeAjaxError()
            removeUnhandledRejection()
            removeResourceError()
        } 
    )
}
export { caputureErrorListener, removeErrorListener }