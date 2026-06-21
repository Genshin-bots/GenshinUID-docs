'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LLMCopyButtonProps {
  markdownUrl: string
}

export function LLMCopyButton({ markdownUrl }: LLMCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      const res = await fetch(markdownUrl)
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs font-medium',
        'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
        'transition-colors',
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
      {copied ? '已复制' : '复制为 Markdown'}
    </button>
  )
}

interface ViewOptionsProps {
  markdownUrl: string
  githubUrl: string
}

export function ViewOptions({ githubUrl }: ViewOptionsProps) {
  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs font-medium',
        'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
        'transition-colors',
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      在 GitHub 上编辑
    </a>
  )
}
