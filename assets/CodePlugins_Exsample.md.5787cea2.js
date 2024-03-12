import{_ as o}from"./chunks/PageInfo.vue_vue_type_script_setup_true_lang.576d70b4.js";import{_ as e}from"./chunks/Badge.167f4610.js";import{_ as c,o as t,c as r,k as a,a as s,H as n,Q as E}from"./chunks/framework.d8868ba7.js";import"./chunks/commonjsHelpers.725317a4.js";const g=JSON.parse('{"title":"简单参考","description":"","frontmatter":{},"headers":[],"relativePath":"CodePlugins/Exsample.md","filePath":"CodePlugins/Exsample.md","lastUpdated":1710270164000}'),y={name:"CodePlugins/Exsample.md"},i={id:"简单参考",tabindex:"-1"},F=a("a",{class:"header-anchor",href:"#简单参考","aria-label":'Permalink to "简单参考 <Badge type="tip" text="普通" />"'},"​",-1),b=E(`<div class="tip custom-block"><p class="custom-block-title">💡 提醒</p><p>该文件位于<code>gsuid_core/plugins/gs_test.py</code></p></div><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> asyncio</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.bot </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Bot</span></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.sv </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">SL</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">SV</span></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.models </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Event</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">sv_switch </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> SV(</span><span style="color:#9ECBFF;">&#39;测试开关&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_prefix</span><span style="color:#E1E4E8;">((</span><span style="color:#9ECBFF;">&#39;关闭&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;开启&#39;</span><span style="color:#E1E4E8;">))</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_switch_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    name </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> ev.text</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">not</span><span style="color:#E1E4E8;"> name:</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">return</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[关闭/开启开关]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> name </span><span style="color:#F97583;">in</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">SL</span><span style="color:#E1E4E8;">.lst:</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> ev.command </span><span style="color:#F97583;">==</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;关闭&#39;</span><span style="color:#E1E4E8;">:</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#79B8FF;">SL</span><span style="color:#E1E4E8;">.lst[name].disable()</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;关闭成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">else</span><span style="color:#E1E4E8;">:</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#79B8FF;">SL</span><span style="color:#E1E4E8;">.lst[name].enable()</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;开启成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">else</span><span style="color:#E1E4E8;">:</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;未找到该服务...&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_fullmatch</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;全匹配测试&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_fullmatch_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[全匹配测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[全匹配测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_fullmatch</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;开始游戏&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_resp_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[开始游戏测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[开始游戏测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    resp </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.receive_resp(</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&#39;请选择一个选项!&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        [</span><span style="color:#9ECBFF;">&#39;🎨可爱的丛林&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;🚀遥远的星空&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;📝不如在家写作业&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;✨或者看星星&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;🚧这里是维护选项&#39;</span><span style="color:#E1E4E8;">],</span></span>
<span class="line"><span style="color:#E1E4E8;">    )</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> resp </span><span style="color:#F97583;">is</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">not</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">None</span><span style="color:#E1E4E8;">:</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#F97583;">f</span><span style="color:#9ECBFF;">&#39;你输入的是</span><span style="color:#79B8FF;">{</span><span style="color:#E1E4E8;">resp.text</span><span style="color:#79B8FF;">}</span><span style="color:#9ECBFF;">&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_prefix</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;前缀测试&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_prefix_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[前缀测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[前缀测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_suffix</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;后缀测试&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_suffix_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[后缀测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[后缀测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_keyword</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;关键词测试&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_keyword_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[关键词测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[关键词测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#B392F0;">@sv_switch.on_regex</span><span style="color:#E1E4E8;">(</span><span style="color:#F97583;">r</span><span style="color:#9ECBFF;">&#39;</span><span style="color:#79B8FF;">\\d</span><span style="color:#F97583;">+</span><span style="color:#9ECBFF;">&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">def</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">get_regex_msg</span><span style="color:#E1E4E8;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;正在进行[正则测试]&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> asyncio.sleep(</span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> bot.send(</span><span style="color:#9ECBFF;">&#39;[正则测试]校验成功！&#39;</span><span style="color:#E1E4E8;">)</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> asyncio</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.bot </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Bot</span></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.sv </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">SL</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">SV</span></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.models </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Event</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">sv_switch </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> SV(</span><span style="color:#032F62;">&#39;测试开关&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_prefix</span><span style="color:#24292E;">((</span><span style="color:#032F62;">&#39;关闭&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;开启&#39;</span><span style="color:#24292E;">))</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_switch_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    name </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> ev.text</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">not</span><span style="color:#24292E;"> name:</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">return</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[关闭/开启开关]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> name </span><span style="color:#D73A49;">in</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">SL</span><span style="color:#24292E;">.lst:</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> ev.command </span><span style="color:#D73A49;">==</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;关闭&#39;</span><span style="color:#24292E;">:</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#005CC5;">SL</span><span style="color:#24292E;">.lst[name].disable()</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;关闭成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">else</span><span style="color:#24292E;">:</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#005CC5;">SL</span><span style="color:#24292E;">.lst[name].enable()</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;开启成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">else</span><span style="color:#24292E;">:</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;未找到该服务...&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_fullmatch</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;全匹配测试&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_fullmatch_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[全匹配测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[全匹配测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_fullmatch</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;开始游戏&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_resp_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[开始游戏测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[开始游戏测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    resp </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.receive_resp(</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&#39;请选择一个选项!&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        [</span><span style="color:#032F62;">&#39;🎨可爱的丛林&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;🚀遥远的星空&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;📝不如在家写作业&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;✨或者看星星&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;🚧这里是维护选项&#39;</span><span style="color:#24292E;">],</span></span>
<span class="line"><span style="color:#24292E;">    )</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> resp </span><span style="color:#D73A49;">is</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">not</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">None</span><span style="color:#24292E;">:</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#D73A49;">f</span><span style="color:#032F62;">&#39;你输入的是</span><span style="color:#005CC5;">{</span><span style="color:#24292E;">resp.text</span><span style="color:#005CC5;">}</span><span style="color:#032F62;">&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_prefix</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;前缀测试&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_prefix_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[前缀测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[前缀测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_suffix</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;后缀测试&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_suffix_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[后缀测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[后缀测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_keyword</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;关键词测试&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_keyword_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[关键词测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[关键词测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;">@sv_switch.on_regex</span><span style="color:#24292E;">(</span><span style="color:#D73A49;">r</span><span style="color:#032F62;">&#39;</span><span style="color:#005CC5;">\\d</span><span style="color:#D73A49;">+</span><span style="color:#032F62;">&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">def</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">get_regex_msg</span><span style="color:#24292E;">(bot: Bot, ev: Event):</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;正在进行[正则测试]&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> asyncio.sleep(</span><span style="color:#005CC5;">2</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> bot.send(</span><span style="color:#032F62;">&#39;[正则测试]校验成功！&#39;</span><span style="color:#24292E;">)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br></div></div>`,2);function m(d,u,_,C,B,w){const p=e,l=o;return t(),r("div",null,[a("h1",i,[s("简单参考 "),n(p,{type:"tip",text:"普通"}),s(),F]),n(l,{readTime:"1",words:"386"}),b])}const h=c(y,[["render",m]]);export{g as __pageData,h as default};