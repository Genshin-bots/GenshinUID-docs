import{_ as l}from"./chunks/PageInfo.vue_vue_type_script_setup_true_lang.576d70b4.js";import{_ as p}from"./chunks/Badge.167f4610.js";import{_ as c,o as i,c as r,k as e,a as s,H as n,Q as a}from"./chunks/framework.d8868ba7.js";import"./chunks/commonjsHelpers.725317a4.js";const I=JSON.parse('{"title":"NoneBot2","description":"","frontmatter":{},"headers":[],"relativePath":"LinkBots/NoneBot2.md","filePath":"LinkBots/NoneBot2.md","lastUpdated":1703080381000}'),d={name:"LinkBots/NoneBot2.md"},_={id:"nonebot2",tabindex:"-1"},h=e("a",{class:"header-anchor",href:"#nonebot2","aria-label":'Permalink to "NoneBot2<Badge type="tip" text="简单" />"'},"​",-1),y={id:"安装插件",tabindex:"-1"},E=e("a",{class:"header-anchor",href:"#安装插件","aria-label":'Permalink to "安装插件<Badge type="tip" text="用户模式" />"'},"​",-1),u=a('<ul><li>进入机器人项目文件夹内，输入命令安装本插件</li></ul><div class="language-sh vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#B392F0;">nb</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">plugin</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">install</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">nonebot-plugin-genshinuid</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6F42C1;">nb</span><span style="color:#24292E;"> </span><span style="color:#032F62;">plugin</span><span style="color:#24292E;"> </span><span style="color:#032F62;">install</span><span style="color:#24292E;"> </span><span style="color:#032F62;">nonebot-plugin-genshinuid</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div>',2),g={id:"安装插件-1",tabindex:"-1"},m=e("a",{class:"header-anchor",href:"#安装插件-1","aria-label":'Permalink to "安装插件<Badge type="danger" text="开发者模式" />"'},"​",-1),b=a('<div class="warning custom-block"><p class="custom-block-title">🚨 警告</p><p>需要配置好<code>.env</code>文件（SUPERUSER等）</p><p>插件开发者可选此模式，对应nb创建项目模板<code>simple</code></p></div><ul><li>cd至插件文件夹内，一般位于<code>{Bot目录}/src/plugins</code>下</li><li>输入安装命令（前提安装过git）</li></ul><div class="language-sh vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#B392F0;">git</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">clone</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">-b</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">v4-nonebot2</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">https://ghproxy.com/https://github.com/KimigaiiWuyi/GenshinUID.git</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">--depth=1</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">--single-branch</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6F42C1;">git</span><span style="color:#24292E;"> </span><span style="color:#032F62;">clone</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">-b</span><span style="color:#24292E;"> </span><span style="color:#032F62;">v4-nonebot2</span><span style="color:#24292E;"> </span><span style="color:#032F62;">https://ghproxy.com/https://github.com/KimigaiiWuyi/GenshinUID.git</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">--depth=1</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">--single-branch</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><ul><li>使用命令<code>cd GenshinUID</code>进入插件文件夹</li><li>安装依赖<code>pip install -r requirements.txt</code>(如果你的<code>Nonebot2</code>运行在虚拟环境，需要进入虚拟环境安装依赖)</li><li>回到<code>Bot目录</code>下，使用命令<code>nb run</code>启动Bot</li></ul>',4);function B(F,v,C,k,x,f){const o=p,t=l;return i(),r("div",null,[e("h1",_,[s("NoneBot2"),n(o,{type:"tip",text:"简单"}),s(),h]),n(t,{readTime:"1",words:"196"}),e("h2",y,[s("安装插件"),n(o,{type:"tip",text:"用户模式"}),s(),E]),u,e("h2",g,[s("安装插件"),n(o,{type:"danger",text:"开发者模式"}),s(),m]),b])}const V=c(d,[["render",B]]);export{I as __pageData,V as default};