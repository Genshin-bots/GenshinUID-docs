// UI 字符串三语翻译
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const i18nUI = defineI18nUI(
  {
    defaultLanguage: 'zh-CN',
    languages: ['zh-CN', 'en', 'ja'],
  },
  {
    'zh-CN': {
      search: '搜索',
      searchNoResult: '无结果',
      toc: '💫【导航栏】',
      tocNoHeadings: '无章节',
      lastUpdate: '最后一次更新于',
      chooseLanguage: '选择语言',
      chooseTheme: '外观',
      next: '下一篇',
      previous: '上一篇',
      choosePage: '选择页面',
      editOnGithub: '在 GitHub 上编辑此页',
      sidebar: '归档',
      returnToTop: '返回顶部',
      displayName: '简体中文',
    },
    en: {
      search: 'Search',
      searchNoResult: 'No results',
      toc: '💫 On this page',
      tocNoHeadings: 'No Headings',
      lastUpdate: 'Last updated on',
      chooseLanguage: 'Choose a language',
      chooseTheme: 'Theme',
      next: 'Next',
      previous: 'Previous',
      choosePage: 'Choose a page',
      editOnGithub: 'Edit on GitHub',
      sidebar: 'Sidebar',
      returnToTop: 'Return to top',
      displayName: 'English',
    },
    ja: {
      search: '検索',
      searchNoResult: '結果なし',
      toc: '💫【目次】',
      tocNoHeadings: '見出しなし',
      lastUpdate: '最終更新日',
      chooseLanguage: '言語を選択',
      chooseTheme: '外観',
      next: '次へ',
      previous: '前へ',
      choosePage: 'ページを選択',
      editOnGithub: 'GitHub で編集',
      sidebar: 'サイドバー',
      returnToTop: 'トップへ戻る',
      displayName: '日本語',
    },
  },
);

// 保留旧导出以兼容现有代码
export const cn = i18nUI;
export const en = i18nUI;
export const ja = i18nUI;
export const translations = {
  'zh-CN': i18nUI,
  en: i18nUI,
  ja: i18nUI,
};
