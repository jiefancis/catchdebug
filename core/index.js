
import Client from "./client";

let client = null
function createClient(config) {
    if(!client) {
        client = new Client(config)
    }
    return client
}

function getClient() {
    return client
}
export { getClient }
export default createClient
