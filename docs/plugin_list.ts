// 导入fs模块，用于读取文件
import fs from 'node:fs'

// 定义一个接口，描述plugin_list.json的结构
interface PluginList {
  plugins: {
    [name: string]: {
      link: string
      branch: string
      info: string
    }
  }
  extra: any
}

// 定义一个函数，用于获取插件的信息
function getPluginInfo(name: string, plugin: { link: string; branch: string; info: string }) {
  return { name, link: plugin.link, branch: plugin.branch, info: plugin.info }
}

const data = JSON.parse(fs.readFileSync('./plugin_list.json', 'utf-8')) as PluginList

const pluginList = Object.keys(data['plugins']).reduce((acc, name) => {
  // 调用getPluginInfo函数，获取插件的信息，并添加到数组中
  acc.push(getPluginInfo(name, data['plugins'][name]))
  return acc
}, [] as { name: string; link: string; branch: string; info: string }[])
console.info(pluginList)

// 导出pluginList变量
export { pluginList as plugins }
