import{_ as o}from"./chunks/PageInfo.vue_vue_type_script_setup_true_lang.576d70b4.js";import{_ as e}from"./chunks/Badge.167f4610.js";import{_ as r,o as c,c as t,k as a,a as s,H as n,Q as i}from"./chunks/framework.d8868ba7.js";import"./chunks/commonjsHelpers.725317a4.js";const G=JSON.parse('{"title":"插件配置项(config.json)","description":"","frontmatter":{},"headers":[],"relativePath":"CodePlugins/PluginsConfig.md","filePath":"CodePlugins/PluginsConfig.md","lastUpdated":1710270164000}'),E={name:"CodePlugins/PluginsConfig.md"},y={id:"插件配置项-config-json",tabindex:"-1"},g=a("a",{class:"header-anchor",href:"#插件配置项-config-json","aria-label":'Permalink to "插件配置项(config.json)<Badge type="tip" text="简单" />"'},"​",-1),F=i(`<p><a href="https://github.com/qwerdvd/StarRailUID/blob/master/StarRailUID/starrailuid_config/config_default.py" target="_blank" rel="noreferrer">参考</a></p><div class="language-python vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;"># 先导入基础配置模型</span></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.utils.plugins_config.models </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> (</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#79B8FF;">GSC</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    GsStrConfig,</span></span>
<span class="line"><span style="color:#E1E4E8;">    GsBoolConfig,</span></span>
<span class="line"><span style="color:#E1E4E8;">    GsListStrConfig,</span></span>
<span class="line"><span style="color:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 建立自己插件的CONFIG_DEFAULT</span></span>
<span class="line"><span style="color:#6A737D;"># 名字无所谓, 类型一定是Dict[str, GSC]，以下为示例，可以添加无数个配置</span></span>
<span class="line"><span style="color:#79B8FF;">CONIFG_DEFAULT</span><span style="color:#E1E4E8;">: Dict[</span><span style="color:#79B8FF;">str</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">GSC</span><span style="color:#E1E4E8;">] </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#9ECBFF;">&#39;SignTime&#39;</span><span style="color:#E1E4E8;">: GsListStrConfig(</span><span style="color:#9ECBFF;">&#39;每晚签到时间设置&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;每晚米游社签到时间设置（时，分）&#39;</span><span style="color:#E1E4E8;">, [</span><span style="color:#9ECBFF;">&#39;0&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;38&#39;</span><span style="color:#E1E4E8;">]),</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#9ECBFF;">&#39;SignReportSimple&#39;</span><span style="color:#E1E4E8;">: GsBoolConfig(</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&#39;简洁签到报告&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&#39;开启后可以大大减少每日签到报告字数&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#79B8FF;">True</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    )</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 设定一个配置文件（json）保存文件路径</span></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.data_store </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> get_res_path </span><span style="color:#6A737D;"># get_res_path的用法可参考上一节</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;">CONFIG_PATH</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> get_res_path() </span><span style="color:#F97583;">/</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;StarRailUID&#39;</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">/</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;config.json&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 然后添加到GsCore网页控制台中</span></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> gsuid_core.utils.plugins_config.gs_config </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> StringConfig</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> .config_default </span><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">CONIFG_DEFAULT</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 分别传入 配置总名称（不要和其他插件重复），配置路径，以及配置模型</span></span>
<span class="line"><span style="color:#E1E4E8;">srconfig </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> StringConfig(</span><span style="color:#9ECBFF;">&#39;StarRailUID&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">CONFIG_PATH</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">CONIFG_DEFAULT</span><span style="color:#E1E4E8;">)</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;"># 先导入基础配置模型</span></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.utils.plugins_config.models </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> (</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#005CC5;">GSC</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    GsStrConfig,</span></span>
<span class="line"><span style="color:#24292E;">    GsBoolConfig,</span></span>
<span class="line"><span style="color:#24292E;">    GsListStrConfig,</span></span>
<span class="line"><span style="color:#24292E;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 建立自己插件的CONFIG_DEFAULT</span></span>
<span class="line"><span style="color:#6A737D;"># 名字无所谓, 类型一定是Dict[str, GSC]，以下为示例，可以添加无数个配置</span></span>
<span class="line"><span style="color:#005CC5;">CONIFG_DEFAULT</span><span style="color:#24292E;">: Dict[</span><span style="color:#005CC5;">str</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">GSC</span><span style="color:#24292E;">] </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#032F62;">&#39;SignTime&#39;</span><span style="color:#24292E;">: GsListStrConfig(</span><span style="color:#032F62;">&#39;每晚签到时间设置&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;每晚米游社签到时间设置（时，分）&#39;</span><span style="color:#24292E;">, [</span><span style="color:#032F62;">&#39;0&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;38&#39;</span><span style="color:#24292E;">]),</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#032F62;">&#39;SignReportSimple&#39;</span><span style="color:#24292E;">: GsBoolConfig(</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&#39;简洁签到报告&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&#39;开启后可以大大减少每日签到报告字数&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#005CC5;">True</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    )</span></span>
<span class="line"><span style="color:#24292E;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 设定一个配置文件（json）保存文件路径</span></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.data_store </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> get_res_path </span><span style="color:#6A737D;"># get_res_path的用法可参考上一节</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;">CONFIG_PATH</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> get_res_path() </span><span style="color:#D73A49;">/</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;StarRailUID&#39;</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">/</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;config.json&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 然后添加到GsCore网页控制台中</span></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> gsuid_core.utils.plugins_config.gs_config </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> StringConfig</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">from</span><span style="color:#24292E;"> .config_default </span><span style="color:#D73A49;">import</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">CONIFG_DEFAULT</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;"># 分别传入 配置总名称（不要和其他插件重复），配置路径，以及配置模型</span></span>
<span class="line"><span style="color:#24292E;">srconfig </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> StringConfig(</span><span style="color:#032F62;">&#39;StarRailUID&#39;</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">CONFIG_PATH</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">CONIFG_DEFAULT</span><span style="color:#24292E;">)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br></div></div>`,2);function _(m,b,u,C,f,d){const p=e,l=o;return c(),t("div",null,[a("h1",y,[s("插件配置项(config.json)"),n(p,{type:"tip",text:"简单"}),s(),g]),n(l,{readTime:"1",words:"224"}),F])}const B=r(E,[["render",_]]);export{G as __pageData,B as default};
