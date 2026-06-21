'use client'

import { useEffect, useState } from 'react'
import type { NodeContent, NodeMessage } from './types'

interface NodeMessagePanelProps {
  visible: boolean
  nodeData: NodeContent[]
  onClose: () => void
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderMessage(msg: NodeMessage): string {
  switch (msg.type) {
    case 'text':
      return escapeHtml(msg.data).replace(/\n/g, '<br>')
    case 'image': {
      let src = msg.data
      if (src.startsWith('base64://')) src = `data:image/jpeg;base64,${src.substring(9)}`
      else if (src.startsWith('link://')) src = src.substring(7)
      return `<img src="${src}" alt="image" class="node-image" />`
    }
    case 'audio':
    case 'record': {
      let audioSrc = msg.data
      if (audioSrc.startsWith('base64://')) audioSrc = `data:audio/mpeg;base64,${audioSrc.substring(9)}`
      else if (audioSrc.startsWith('link://')) audioSrc = audioSrc.substring(7)
      return `<audio controls src="${audioSrc}" class="node-audio" />`
    }
    case 'video': {
      let videoSrc = msg.data
      if (videoSrc.startsWith('base64://')) {
        let base64Data = msg.data.substring(9)
        if (base64Data.startsWith('b\'') && base64Data.endsWith('\'')) {
          base64Data = base64Data.slice(2, -1)
        }
        videoSrc = `data:video/mp4;base64,${base64Data}`
      }
      else if (videoSrc.startsWith('link://')) {
        videoSrc = videoSrc.substring(7)
      }
      return `<video controls src="${videoSrc}" class="node-video" />`
    }
    default:
      return `<span class="node-unknown">${escapeHtml(msg.data)}</span>`
  }
}

export function NodeMessagePanel({ visible, nodeData, onClose }: NodeMessagePanelProps) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setFade(true), 10)
      return () => clearTimeout(t)
    }
    else {
      setFade(false)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      className={`fd-node-panel-overlay ${fade ? 'fade-in' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="fd-node-panel">
        <div className="fd-node-panel-header">
          <span className="fd-node-panel-title">聊天记录</span>
          <button type="button" className="fd-node-panel-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="fd-node-panel-content">
          {nodeData.map((node, index) => (
            <div key={index} className="fd-node-item">
              <div className="fd-node-item-header">
                <img src={node.avatar} alt="avatar" className="fd-node-avatar" />
                <span className="fd-node-username">服务器</span>
              </div>
              <div className="fd-node-messages">
                {node.messages.map((msg, msgIndex) => (
                  <div
                    key={msgIndex}
                    className="fd-node-message"
                    dangerouslySetInnerHTML={{ __html: renderMessage(msg) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
