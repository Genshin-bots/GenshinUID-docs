'use client';

import { create } from '@orama/orama';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { useMemo } from 'react';

/**
 * 为 CJK 构建查询用的 Orama 实例：分词器必须与服务端建索引时一致
 * （见 app/api/search/route.ts），否则中文/日文搜不到结果。
 */
async function initOrama(locale?: string) {
  if (locale === 'zh-CN') {
    const { createTokenizer } = await import('@orama/tokenizers/mandarin');
    return create({
      schema: { _: 'string' },
      components: { tokenizer: createTokenizer() },
    });
  }
  if (locale === 'ja') {
    const { createTokenizer } = await import('@orama/tokenizers/japanese');
    return create({
      schema: { _: 'string' },
      components: { tokenizer: createTokenizer() },
    });
  }
  return create({ schema: { _: 'string' }, language: 'english' });
}

/**
 * 自定义静态搜索弹窗：默认弹窗的 static client 不支持自定义分词器，
 * 因此按官方推荐自行重建（https://fumadocs.dev/docs/search/orama）。
 */
export default function CustomSearchDialog(props: SharedProps) {
  const { locale } = useI18n();

  const client = useMemo(
    () =>
      oramaStaticClient({
        from: '/api/search',
        locale,
        initOrama,
      }),
    [locale],
  );

  const { search, setSearch, query } = useDocsSearch({ client });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
