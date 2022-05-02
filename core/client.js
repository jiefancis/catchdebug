
import { loadExtension, browserExtension } from "./extension"
import { notify } from './notify'
class Client {
    constructor(
        {
            reportUrl
        }
    ) {
        this._url = reportUrl
        this._notifier = notifier
    }
    init() {
        return this.use(browserExtension) || this
    }
    // 加载拓展
    use(extension) {
        return loadExtension(extension, this)
    }
    // 触发上报
    notify(event) {
        return this._notifier(event)
    }
}

export default Client
