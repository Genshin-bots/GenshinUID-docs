if(!self.define){let s,e={};const l=(l,n)=>(l=new URL(l+".js",n).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(n,i)=>{const a=s||("document"in self?document.currentScript.src:"")||location.href;if(e[a])return;let r={};const u=s=>l(s,a),t={module:{uri:a},exports:r,require:u};e[a]=Promise.all(n.map((s=>t[s]||u(s)))).then((s=>(i(...s),r)))}}define(["./workbox-00b24671"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/Advance_BaseInfo.md.bded73b6.js",revision:null},{url:"assets/Advance_BaseInfo.md.bded73b6.lean.js",revision:null},{url:"assets/Advance_BindDevice.md.a3d0ac9f.js",revision:null},{url:"assets/Advance_BindDevice.md.a3d0ac9f.lean.js",revision:null},{url:"assets/Advance_CoreConfig.md.24bdcac9.js",revision:null},{url:"assets/Advance_CoreConfig.md.24bdcac9.lean.js",revision:null},{url:"assets/Advance_DataStruct.md.93680aa0.js",revision:null},{url:"assets/Advance_DataStruct.md.93680aa0.lean.js",revision:null},{url:"assets/Advance_ExportAndImport.md.cb718584.js",revision:null},{url:"assets/Advance_ExportAndImport.md.cb718584.lean.js",revision:null},{url:"assets/Advance_MarkdownTemplate.md.810c4cf0.js",revision:null},{url:"assets/Advance_MarkdownTemplate.md.810c4cf0.lean.js",revision:null},{url:"assets/Advance_TransURL.md.137cc106.js",revision:null},{url:"assets/Advance_TransURL.md.137cc106.lean.js",revision:null},{url:"assets/Advance_WebConsole.md.a5b725cc.js",revision:null},{url:"assets/Advance_WebConsole.md.a5b725cc.lean.js",revision:null},{url:"assets/app.8b0a4448.js",revision:null},{url:"assets/chunks/Badge.167f4610.js",revision:null},{url:"assets/chunks/ChatMessage.vue_vue_type_style_index_0_lang.3277c88f.js",revision:null},{url:"assets/chunks/commonjsHelpers.725317a4.js",revision:null},{url:"assets/chunks/framework.d8868ba7.js",revision:null},{url:"assets/chunks/PageInfo.vue_vue_type_script_setup_true_lang.576d70b4.js",revision:null},{url:"assets/chunks/pwa.5861a2ca.js",revision:null},{url:"assets/chunks/theme.647dcd73.js",revision:null},{url:"assets/chunks/workbox-window.prod.es5.a7b12eab.js",revision:null},{url:"assets/CodeAdapter_Pack.md.94fe6f94.js",revision:null},{url:"assets/CodeAdapter_Pack.md.94fe6f94.lean.js",revision:null},{url:"assets/CodeAdapter_Protocol.md.27f80596.js",revision:null},{url:"assets/CodeAdapter_Protocol.md.27f80596.lean.js",revision:null},{url:"assets/CodePlugins_Class.md.10f7cd68.js",revision:null},{url:"assets/CodePlugins_Class.md.10f7cd68.lean.js",revision:null},{url:"assets/CodePlugins_Env.md.4abb2938.js",revision:null},{url:"assets/CodePlugins_Env.md.4abb2938.lean.js",revision:null},{url:"assets/CodePlugins_Exsample.md.9390ba00.js",revision:null},{url:"assets/CodePlugins_Exsample.md.9390ba00.lean.js",revision:null},{url:"assets/CodePlugins_GetDataPath.md.ef4a2a0d.js",revision:null},{url:"assets/CodePlugins_GetDataPath.md.ef4a2a0d.lean.js",revision:null},{url:"assets/CodePlugins_GetPluginsConfig.md.5ca49df1.js",revision:null},{url:"assets/CodePlugins_GetPluginsConfig.md.5ca49df1.lean.js",revision:null},{url:"assets/CodePlugins_PluginsConfig.md.da596e25.js",revision:null},{url:"assets/CodePlugins_PluginsConfig.md.da596e25.lean.js",revision:null},{url:"assets/CodePlugins_PluginsDataBase.md.2345b6c5.js",revision:null},{url:"assets/CodePlugins_PluginsDataBase.md.2345b6c5.lean.js",revision:null},{url:"assets/CodePlugins_Resp.md.db6b8fba.js",revision:null},{url:"assets/CodePlugins_Resp.md.db6b8fba.lean.js",revision:null},{url:"assets/CodePlugins_Scheduler.md.6d256641.js",revision:null},{url:"assets/CodePlugins_Scheduler.md.6d256641.lean.js",revision:null},{url:"assets/CodePlugins_Simple.md.b4730506.js",revision:null},{url:"assets/CodePlugins_Simple.md.b4730506.lean.js",revision:null},{url:"assets/CodePlugins_Start.md.d46b8bfd.js",revision:null},{url:"assets/CodePlugins_Start.md.d46b8bfd.lean.js",revision:null},{url:"assets/Extra_AddCK.md.d743f536.js",revision:null},{url:"assets/Extra_AddCK.md.d743f536.lean.js",revision:null},{url:"assets/Extra_FAQ.md.6c152f7e.js",revision:null},{url:"assets/Extra_FAQ.md.6c152f7e.lean.js",revision:null},{url:"assets/Extra_ResourceDownload.md.759c489f.js",revision:null},{url:"assets/Extra_ResourceDownload.md.759c489f.lean.js",revision:null},{url:"assets/FAQ_index.md.45670448.js",revision:null},{url:"assets/FAQ_index.md.45670448.lean.js",revision:null},{url:"assets/grid.e967678d.svg",revision:null},{url:"assets/image-20231217045602155.04eb49c7.png",revision:null},{url:"assets/image-20231217045637291.c9624c71.png",revision:null},{url:"assets/image-20231217045705481.997fce43.png",revision:null},{url:"assets/index.md.82cc5a7a.js",revision:null},{url:"assets/index.md.82cc5a7a.lean.js",revision:null},{url:"assets/InstallPlugins_InstallPlugins.md.48d99c66.js",revision:null},{url:"assets/InstallPlugins_InstallPlugins.md.48d99c66.lean.js",revision:null},{url:"assets/InstallPlugins_PluginsList.md.37b344a7.js",revision:null},{url:"assets/InstallPlugins_PluginsList.md.37b344a7.lean.js",revision:null},{url:"assets/inter-italic-cyrillic-ext.33bd5a8e.woff2",revision:null},{url:"assets/inter-italic-cyrillic.ea42a392.woff2",revision:null},{url:"assets/inter-italic-greek-ext.4fbe9427.woff2",revision:null},{url:"assets/inter-italic-greek.8f4463c4.woff2",revision:null},{url:"assets/inter-italic-latin-ext.bd8920cc.woff2",revision:null},{url:"assets/inter-italic-latin.bd3b6f56.woff2",revision:null},{url:"assets/inter-italic-vietnamese.6ce511fb.woff2",revision:null},{url:"assets/inter-roman-cyrillic-ext.e75737ce.woff2",revision:null},{url:"assets/inter-roman-cyrillic.5f2c6c8c.woff2",revision:null},{url:"assets/inter-roman-greek-ext.ab0619bc.woff2",revision:null},{url:"assets/inter-roman-greek.d5a6d92a.woff2",revision:null},{url:"assets/inter-roman-latin-ext.0030eebd.woff2",revision:null},{url:"assets/inter-roman-latin.2ed14f66.woff2",revision:null},{url:"assets/inter-roman-vietnamese.14ce25a6.woff2",revision:null},{url:"assets/LinkBots_AdapterList.md.50cbf102.js",revision:null},{url:"assets/LinkBots_AdapterList.md.50cbf102.lean.js",revision:null},{url:"assets/LinkBots_HoshinoBot.md.7411cbfb.js",revision:null},{url:"assets/LinkBots_HoshinoBot.md.7411cbfb.lean.js",revision:null},{url:"assets/LinkBots_NoneBot2.md.b3895b4c.js",revision:null},{url:"assets/LinkBots_NoneBot2.md.b3895b4c.lean.js",revision:null},{url:"assets/PluginsHelp_ArknightsUID.md.19ba9c8e.js",revision:null},{url:"assets/PluginsHelp_ArknightsUID.md.19ba9c8e.lean.js",revision:null},{url:"assets/PluginsHelp_BlueArchiveUID.md.cdb2762c.js",revision:null},{url:"assets/PluginsHelp_BlueArchiveUID.md.cdb2762c.lean.js",revision:null},{url:"assets/PluginsHelp_GenshinUID.md.4fb0ebdf.js",revision:null},{url:"assets/PluginsHelp_GenshinUID.md.4fb0ebdf.lean.js",revision:null},{url:"assets/PluginsHelp_StarRailUID.md.3b6e858d.js",revision:null},{url:"assets/PluginsHelp_StarRailUID.md.3b6e858d.lean.js",revision:null},{url:"assets/PluginsHelp_WzryUID.md.4f786943.js",revision:null},{url:"assets/PluginsHelp_WzryUID.md.4f786943.lean.js",revision:null},{url:"assets/Started_CoreConfig.md.36235274.js",revision:null},{url:"assets/Started_CoreConfig.md.36235274.lean.js",revision:null},{url:"assets/Started_EnvCheck.md.0279d1c6.js",revision:null},{url:"assets/Started_EnvCheck.md.0279d1c6.lean.js",revision:null},{url:"assets/Started_InstallCore.md.5050c640.js",revision:null},{url:"assets/Started_InstallCore.md.5050c640.lean.js",revision:null},{url:"assets/Started_StartCore.md.32254577.js",revision:null},{url:"assets/Started_StartCore.md.32254577.lean.js",revision:null},{url:"assets/style.839727e9.css",revision:null},{url:"favicon.ico",revision:"a701077f3e3dd28b8efb0d249c8e8579"},{url:"icon.png",revision:"b6aec0ec4418eb4114d9e6d35831dbed"},{url:"MarkdownTemplate/image-20231217045602155.png",revision:"6563177853c9f41fc7d510ddca4ce02b"},{url:"MarkdownTemplate/image-20231217045637291.png",revision:"891a8ae28637f52cc26bdb1438aecc16"},{url:"MarkdownTemplate/image-20231217045705481.png",revision:"ff7b494d15e41cda770b62617a2b0bc1"},{url:"favicon.ico",revision:"a701077f3e3dd28b8efb0d249c8e8579"},{url:"icon.png",revision:"b6aec0ec4418eb4114d9e6d35831dbed"},{url:"MarkdownTemplate/image-20231217045602155.png",revision:"6563177853c9f41fc7d510ddca4ce02b"},{url:"MarkdownTemplate/image-20231217045637291.png",revision:"891a8ae28637f52cc26bdb1438aecc16"},{url:"MarkdownTemplate/image-20231217045705481.png",revision:"ff7b494d15e41cda770b62617a2b0bc1"},{url:"manifest.webmanifest",revision:"42cc81492e00ec87f91282ffdad4fc8c"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(/^https:\/\/fonts.googleapis.com\/.*/i,new s.CacheFirst({cacheName:"google-font-style-cache",plugins:[new s.ExpirationPlugin({maxEntries:10,maxAgeSeconds:31536e3}),new s.CacheableResponsePlugin({statuses:[0,200]})]}),"GET"),s.registerRoute(/^https:\/\/fonts.gstatic.com\/.*/i,new s.CacheFirst({cacheName:"google-fonts-cache",plugins:[new s.ExpirationPlugin({maxEntries:10,maxAgeSeconds:31536e3}),new s.CacheableResponsePlugin({statuses:[0,200]})]}),"GET"),s.registerRoute(/^https:\/\/cdn.jsdelivr.net\/.*/i,new s.CacheFirst({cacheName:"jsdelivr-cdn-cache",plugins:[new s.ExpirationPlugin({maxEntries:10,maxAgeSeconds:31536e3}),new s.CacheableResponsePlugin({statuses:[0,200]})]}),"GET"),s.registerRoute(/^https:\/\/(((raw|user-images|camo).githubusercontent.com))\/.*/i,new s.CacheFirst({cacheName:"githubusercontent-images-cache",plugins:[new s.ExpirationPlugin({maxEntries:10,maxAgeSeconds:31536e3}),new s.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
