'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import CustomSearchDialog from '@/components/SearchDialog';
import type { Language } from '@/lib/i18n';
import { i18nUI } from '@/lib/layout.shared';

interface ProvidersProps {
  lang: Language;
  children: ReactNode;
}

/**
 * 客户端 Provider 包裹：必须是 client component，因为自定义搜索弹窗
 * （带 CJK 分词器）无法从 server component 序列化传给 RootProvider。
 */
export function Providers({ lang, children }: ProvidersProps) {
  return (
    <RootProvider
      i18n={i18nUI.provider(lang)}
      theme={{ defaultTheme: 'light', enableSystem: false }}
      search={{ SearchDialog: CustomSearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
