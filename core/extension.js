import { caputureErrorListener, removeErrorListener } from '../capture'
// 插件拓展
// 拓展对象格式 => {name, init: Function}
export function loadExtension(extension, client) {
  // 如果已经加载过这个插件，则不再重复加载
  if(hasExtension(extension, client)) {
    console.warn(`${extension.name} has been loaded!`)
    return client
  }
  client._extensions.push(extension)
  let result = extension.init(client)

  return result
}

// 插件 || 插件名字 已经加载过
function hasExtension(extension) {
    let has = client._extensions.includes(extension)
    let hasName = client._extensions.some(ext => ext.name === extension.name)
    
    return has || hasName
}

export function browserExtension() {
  return {
    name: 'browserExtension',
    init(client) {
      caputureErrorListener()
      removeErrorListener()
    }
  }
}