'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/Badge';

interface PluginData {
  link: string;
  avatar: string;
  cover: string;
  branch: string;
  type: string;
  content: string;
  info: string;
  installMsg: string;
  alias: string[];
}

interface PluginList {
  plugins: Record<string, PluginData>;
  fun_plugins: string[];
  tool_plugins: string[];
  extra: any;
}

const DEFAULT_PLUGIN_LIST: PluginList = {
  plugins: {},
  fun_plugins: [],
  tool_plugins: [],
  extra: null,
};

function isDeprecated(data: PluginData): boolean {
  return data.content === '停止维护' || data.type === 'danger';
}

function sortPlugins(plugins: { name: string; data: PluginData }[]) {
  return plugins.sort((a, b) => {
    const aDeprecated = isDeprecated(a.data);
    const bDeprecated = isDeprecated(b.data);
    if (aDeprecated === bDeprecated) return 0;
    return aDeprecated ? 1 : -1;
  });
}

function getBadgeType(
  type: string,
): 'tip' | 'danger' | 'info' | 'warning' | undefined {
  if (
    type === 'tip' ||
    type === 'danger' ||
    type === 'info' ||
    type === 'warning'
  ) {
    return type;
  }
  return undefined;
}

// GitHub 的 https://github.com/user.png URL 在某些情况下会重定向到一个透明的 1x1 图。
// 用 onError 兜住，失败时显示首字母占位。
function PluginAvatar({ name, src }: { name: string; src: string }) {
  const [errored, setErrored] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  if (errored || !src) {
    return (
      <div className="fd-plugin-avatar-fallback" aria-hidden>
        {initial}
      </div>
    );
  }

  return (
    <img
      loading="lazy"
      src={src}
      alt={`${name}'s avatar`}
      onError={() => setErrored(true)}
    />
  );
}

function PluginCard({ name, data }: { name: string; data: PluginData }) {
  const deprecated = isDeprecated(data);

  function goToPage() {
    setTimeout(() => {
      window.open(data.link, '_blank');
    }, 140);
  }

  return (
    <div
      className={`fd-plugin-card ${deprecated ? 'fd-plugin-card-deprecated' : ''}`}
      onClick={goToPage}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') goToPage();
      }}
    >
      <div className="fd-plugin-icon">
        <img src={data.cover || data.avatar} alt="" />
      </div>
      <div className="fd-plugin-info">
        <div className="fd-plugin-title">
          <span>{name}</span>
          <Badge type={getBadgeType(data.type)} text={data.content} />
        </div>
        <p className="fd-plugin-description">{data.info}</p>
      </div>
      <div className="fd-plugin-avatar">
        <PluginAvatar name={name} src={data.avatar} />
      </div>
      <div className="fd-plugin-arrow">
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export function Card() {
  const [pluginList, setPluginList] = useState<PluginList>(DEFAULT_PLUGIN_LIST);

  useEffect(() => {
    fetch('/plugin_list.json')
      .then((r) => (r.ok ? r.json() : DEFAULT_PLUGIN_LIST))
      .then(setPluginList)
      .catch(() => setPluginList(DEFAULT_PLUGIN_LIST));
  }, []);

  const funPlugins = sortPlugins(
    pluginList.fun_plugins
      .map((name) => ({ name, data: pluginList.plugins[name] }))
      .filter((item) => item.data !== undefined),
  );
  const toolPlugins = sortPlugins(
    pluginList.tool_plugins
      .map((name) => ({ name, data: pluginList.plugins[name] }))
      .filter((item) => item.data !== undefined),
  );

  return (
    <div>
      <h2 className="fd-section-title">
        <span className="fd-section-title-text">🛠️ 工具插件</span>
      </h2>
      <div className="fd-plugin-list">
        {toolPlugins.map((item) => (
          <PluginCard key={item.name} name={item.name} data={item.data} />
        ))}
      </div>

      <h2 className="fd-section-title">
        <span className="fd-section-title-text">🎮 娱乐插件</span>
      </h2>
      <div className="fd-plugin-list">
        {funPlugins.map((item) => (
          <PluginCard key={item.name} name={item.name} data={item.data} />
        ))}
      </div>
    </div>
  );
}
