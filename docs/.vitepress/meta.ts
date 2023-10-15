import { version } from '../../package.json'

// base info
export const name = '早柚核心Docs'
export const site = 'https://docs.gsuid.gbots.work/'
export const logo = '../public/icon.png'
export const keywords = 'Dcos，GsCore，早柚核心，GenshinUID，机器人插件，NoneBot2，onebot，HoshinoBot，YunzaiBot，Koishi，ZeroBot，Plugins，Bot。'
export const description = '安装早柚核心、了解早柚协议、编写GsCore插件，早柚核心，一个可以连接多个Bot和适配多个平台的Python Bot框架。'

// social link
export const github = 'https://github.com/Genshin-bots/gsuid_core'

// docs version
export const docsVersion = version

/* PWA runtime caching urlPattern regular expressions */
/* eslint-disable prefer-regex-literals */
export const githubSourceContentRegex = new RegExp('^https://(((raw|user-images|camo).githubusercontent.com))/.*', 'i')
export const googleFontRegex = new RegExp('^https://fonts.googleapis.com/.*', 'i')
export const googleStaticFontRegex = new RegExp('^https://fonts.gstatic.com/.*', 'i')
export const jsdelivrCDNRegex = new RegExp('^https://cdn.jsdelivr.net/.*', 'i')
