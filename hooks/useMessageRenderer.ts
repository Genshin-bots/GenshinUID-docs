'use client';

import { useCallback, useState } from 'react';
import { resolveMediaUrl } from '@/lib/media';

type ContentType = 'text' | 'markdown' | 'image' | 'audio' | 'video';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderImage(src: string): string {
  const url = resolveMediaUrl(src, 'image');
  return `<img src="${escapeHtml(url)}" alt="image" class="chat-image" style="max-width: 200px; border-radius: 8px; display: block; cursor: pointer; margin: 0.2rem 0;" />`;
}

function renderAudio(src: string): string {
  const url = resolveMediaUrl(src, 'audio');
  return `<audio controls src="${escapeHtml(url)}" style="max-width: 100%; margin: 0.2rem 0;"></audio>`;
}

function renderVideo(src: string): string {
  const url = resolveMediaUrl(src, 'video');
  return `<video controls src="${escapeHtml(url)}" style="max-width: 100%; max-height: 200px; margin: 0.2rem 0;"></video>`;
}

function renderText(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function renderMarkdown(text: string): string {
  // 简单的 Markdown 渲染（实际可使用 marked 或其他库）
  let html = escapeHtml(text);
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // 代码
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  // 链接
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

export function useMessageRenderer() {
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);

  const renderContent = useCallback(
    (content: Array<{ type: string; data: string }>): string => {
      if (!content || content.length === 0) return '';

      const parts: string[] = [];
      for (const item of content) {
        switch (item.type as ContentType) {
          case 'text':
            parts.push(`<p>${renderText(item.data)}</p>`);
            break;
          case 'markdown':
            parts.push(renderMarkdown(item.data));
            break;
          case 'image':
            parts.push(renderImage(item.data));
            break;
          case 'audio':
            parts.push(renderAudio(item.data));
            break;
          case 'video':
            parts.push(renderVideo(item.data));
            break;
          default:
            parts.push(`<p>${escapeHtml(item.data)}</p>`);
        }
      }
      return parts.join('');
    },
    [],
  );

  const toggleMarkdownMode = useCallback(() => {
    setIsMarkdownMode((prev) => !prev);
  }, []);

  return {
    isMarkdownMode,
    renderContent,
    toggleMarkdownMode,
  };
}
