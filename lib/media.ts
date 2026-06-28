/**
 * 媒体 URL 解析工具 —— 共享给 ChatInterface (useMessageRenderer) 与
 * 合并转发面板 (NodeMessagePanel)
 * --------------------------------------------------------------------------
 *
 * 背景：GsCore 协议里把图片 / 音频 / 视频统一用两种自定义「协议前缀」编码：
 *   - `base64://<payload>`   — payload 是裸 base64（无 `data:` 前缀）
 *   - `link://<https-url>`   — payload 是真实 http(s) URL，仅协议名替换
 *
 * 浏览器不认这两个协议，必须在渲染前翻译成合法的 `data:<mime>;base64,xxx` /
 * `https://...`。
 *
 * 这一步**原本只在 NodeMessagePanel 里**，主消息渲染的 `useMessageRenderer`
 * 漏了它，导致服务端下行的图片 / 音频 / 视频直接 broken image。统一到这里
 * 之后两处共用，避免协议规则两处分叉。
 *
 * 翻译规则（按顺序匹配，命中即返回）：
 *   1. 已经是 `data:` / `http(s):` / `blob:` 开头 → 原样
 *   2. `link://xxx` → `xxx`
 *   3. `base64://xxx` → `data:<mime-by-sniff>;base64,xxx`
 *   4. 纯 base64（无前缀）→ `data:<mime-by-sniff>;base64,xxx`
 *   5. 其它 → 原样（让浏览器自己处理）
 *
 * `kind` 仅在第 3、4 步嗅探失败时作为兜底 MIME：image→jpeg, audio→mpeg, video→mp4。
 */

/** 通过 base64 字符串的前 12 字符嗅探 MIME（解码后 ≈ 9 字节，足够识别常见格式） */
function sniffMimeFromBase64(
  b64: string,
  kind: 'image' | 'audio' | 'video' = 'image',
): string {
  const head = b64.replace(/\s+/g, '').slice(0, 12);
  // —— 图片 ——
  // JPEG: FF D8 FF
  if (head.startsWith('/9j/')) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (head.startsWith('iVBORw0KGgo')) return 'image/png';
  // GIF: 47 49 46 38
  if (head.startsWith('R0lGOD')) return 'image/gif';
  // WebP: RIFF .... WEBP
  if (head.startsWith('UklGRg')) return 'image/webp';
  // BMP: 42 4D
  if (head.startsWith('Qk0')) return 'image/bmp';
  // ICO: 00 00 01 00
  if (head.startsWith('AAABAA')) return 'image/x-icon';
  // —— 音频 ——
  // MP3: ID3 标签 / 0xFF 0xFB
  if (head.startsWith('SUQz') || head.startsWith('/+1x')) return 'audio/mpeg';
  // WAV: RIFF .... WAVE
  if (head.startsWith('UklGRi')) return 'audio/wav';
  // OGG: 4F 67 67 53
  if (head.startsWith('T2dnUw')) return 'audio/ogg';
  // —— 视频 ——
  // MP4: ftyp box 在偏移 4，第 5~8 字节
  if (head.startsWith('AAAA')) return 'video/mp4';

  // 兜底：按 kind 走最常见类型（保持与原 VitePress 时代行为一致）
  if (kind === 'audio') return 'audio/mpeg';
  if (kind === 'video') return 'video/mp4';
  return 'image/jpeg';
}

export function resolveMediaUrl(
  raw: string,
  kind: 'image' | 'audio' | 'video' = 'image',
): string {
  if (!raw) return raw;

  // 1) 已经是合法 URL
  if (/^(data:|https?:|blob:)/i.test(raw)) return raw;

  // 2) link:// 协议：剥前缀
  if (raw.startsWith('link://')) return raw.substring('link://'.length);

  // 3) base64:// 协议
  if (raw.startsWith('base64://')) {
    const payload = raw.substring('base64://'.length);
    const mime = sniffMimeFromBase64(payload, kind);
    return `data:${mime};base64,${payload}`;
  }

  // 4) 纯 base64（无前缀）：嗅探 MIME 后补上 data: 前缀
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw.slice(0, 32))) {
    const mime = sniffMimeFromBase64(raw, kind);
    return `data:${mime};base64,${raw.replace(/\s+/g, '')}`;
  }

  // 5) 兜底：原样返回
  return raw;
}
