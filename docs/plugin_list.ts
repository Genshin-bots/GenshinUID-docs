// 导入fs模块，用于读取文件
import fs from 'node:fs'

// 定义插件数据结构
interface PluginData {
  link: string
  avatar: string
  cover: string
  branch: string
  type: string
  content: string
  info: string
  installMsg: string
  alias: string[]
}

// 定义一个接口，描述plugin_list.json的结构
interface PluginList {
  plugins: Record<string, PluginData>
  fun_plugins: string[]
  tool_plugins: string[]
  extra: any
}

// 定义一个函数，用于获取插件的信息
function getPluginInfo(name: string, plugin: PluginData) {
  return { name, link: plugin.link, branch: plugin.branch, info: plugin.info }
}

const data = JSON.parse(fs.readFileSync('./plugin_list.json', 'utf-8')) as PluginList

// 所有插件列表
const pluginList = Object.keys(data.plugins).reduce((acc, name) => {
  // 调用getPluginInfo函数，获取插件的信息，并添加到数组中
  acc.push(getPluginInfo(name, data.plugins[name]))
  return acc
}, [] as { name: string; link: string; branch: string; info: string }[])

// 娱乐插件列表
const funPluginList = data.fun_plugins
  .map((name) => {
    const plugin = data.plugins[name]
    if (plugin)
      return getPluginInfo(name, plugin)

    return null
  })
  .filter((item): item is { name: string; link: string; branch: string; info: string } => item !== null)

// 工具插件列表
const toolPluginList = data.tool_plugins
  .map((name) => {
    const plugin = data.plugins[name]
    if (plugin)
      return getPluginInfo(name, plugin)

    return null
  })
  .filter((item): item is { name: string; link: string; branch: string; info: string } => item !== null)

// 导出pluginList变量
export { pluginList as plugins, funPluginList as funPlugins, toolPluginList as toolPlugins }
