import { ref } from 'vue'
import type { Ref } from 'vue'

export interface MessageContent {
  type: 'text' | 'markdown' | 'image' | 'audio' | 'video' | 'record'
  data: string
}

export interface UseMessageRendererReturn {
  isMarkdownMode: Ref<boolean>
  escapeHtml: (unsafe: string) => string
  renderContent: (content: MessageContent[]) => string
  renderMarkdown: (text: string) => string
  toggleMarkdownMode: () => void
}

export function useMessageRenderer(): UseMessageRendererReturn {
  const isMarkdownMode = ref(false)

  function escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;')
  }

  function renderContent(content: MessageContent[]): string {
    const htmlParts = content.map((msg) => {
      switch (msg.type) {
        case 'text': {
          const safeHtml = escapeHtml(msg.data)
          const formattedHtml = safeHtml.replace(/\n/g, '<br>')
          return `<div class="chat-text">${formattedHtml}</div>`
        }
        case 'markdown': {
          return renderMarkdown(msg.data)
        }
        case 'image': {
          if (msg.data && typeof msg.data === 'string') {
            let src = msg.data
            if (src.startsWith('base64://'))
              src = `data:image/jpeg;base64,${src.substring(9)}`
            else if (src.startsWith('link://'))
              src = src.substring(7)

            return `<img src="${src}" alt="image" class="chat-image chat-media-item" style="max-width: 300px; max-height: 300px; cursor: zoom-in;" onclick="window.dispatchEvent(new CustomEvent('chat:mediaClick', { detail: { src: '${src.replace(/'/g, '\\\'')}', type: 'image' } }))" />`
          }
          return '<div>[图片]</div>'
        }
        case 'audio':
        case 'record': {
          if (msg.data && typeof msg.data === 'string') {
            let src = msg.data

            if (src.startsWith('base64://')) {
              // 使用标准的 audio/mpeg MIME 类型（这是 MP3 的标准 MIME 类型）
              const base64Data = src.substring(9)
              src = `data:audio/mpeg;base64,${base64Data}`
            }
            else if (src.startsWith('link://')) {
              src = src.substring(7)
            }

            // 使用 preload="metadata" 确保音频时长正确显示，添加尺寸限制
            return `<audio controls class="chat-audio chat-media-item" src="${src}" preload="metadata" style="max-width: 300px;" onclick="window.dispatchEvent(new CustomEvent('chat:mediaClick', { detail: { src: '${src.replace(/'/g, '\\\'')}', type: 'audio' } }))" />`
          }
          return '<div>[音频]</div>'
        }
        case 'video': {
          if (msg.data && typeof msg.data === 'string') {
            let src = msg.data
            if (src.startsWith('base64://')) {
              // 处理视频 base64 数据，移除可能的 Python bytes 表示前缀 b'
              let base64Data = src.substring(9)

              // 移除 Python bytes 表示的 b' 前缀和 ' 后缀
              if (base64Data.startsWith('b\'') && base64Data.endsWith('\''))
                base64Data = base64Data.slice(2, -1)

              src = `data:video/mp4;base64,${base64Data}`
            }
            else if (src.startsWith('link://')) {
              src = src.substring(7)
            }

            return `<video controls class="chat-video chat-media-item" src="${src}" preload="metadata" style="max-width: 300px; max-height: 200px;" onclick="window.dispatchEvent(new CustomEvent('chat:mediaClick', { detail: { src: '${src.replace(/'/g, '\\\'')}', type: 'video' } }))" />`
          }
          return '<div>[视频]</div>'
        }
        default:
          return null
      }
    })
    return htmlParts.filter((part): part is string => part !== null).join('')
  }

  function renderMarkdown(text: string): string {
    let html = escapeHtml(text)

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>')

    // Links
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" target="_blank">$1</a>')

    // Lists
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // Line breaks
    html = html.replace(/\n/g, '<br>')

    return `<div class="chat-markdown">${html}</div>`
  }

  function toggleMarkdownMode() {
    isMarkdownMode.value = !isMarkdownMode.value
  }

  return {
    isMarkdownMode,
    escapeHtml,
    renderContent,
    renderMarkdown,
    toggleMarkdownMode,
  }
}
