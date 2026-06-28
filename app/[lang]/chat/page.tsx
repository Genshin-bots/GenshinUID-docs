import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChatStandalone } from '@/components/chat/ChatStandalone';
import { i18n, type Language } from '@/lib/i18n';

interface ChatPageProps {
  params: Promise<{ lang: string }>;
}

const PAGE_META: Record<Language, { title: string; description: string }> = {
  'zh-CN': {
    title: '在线聊天室',
    description: 'GsCore AI 聊天演示页面，可与 AI 直接对话体验效果。',
  },
  en: {
    title: 'Online Chat',
    description:
      'GsCore AI chat demo — talk to the AI directly in your browser.',
  },
  ja: {
    title: 'オンラインチャット',
    description: 'GsCore AI チャットデモ — ブラウザで AI と直接対話できます。',
  },
};

/**
 * 独立全页聊天路由 /[lang]/chat
 * --------------------------------------------------------------------------
 * · 完全脱离 /docs 网格 —— 没有侧边栏 / TOC；
 * · 保留顶栏 DocsNav（在 layout.tsx 中注入）；
 * · 整张聊天卡片撑满 `100vh - Header`，类似 VitePress 时代的 `ChatLayout`。
 */
export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { lang } = await params;
  const meta = PAGE_META[lang as Language] ?? PAGE_META['zh-CN'];
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { lang } = await params;

  if (!i18n.languages.includes(lang as Language)) {
    notFound();
  }

  return <ChatStandalone />;
}
