import type { ReactNode } from 'react'

// 根布局：什么都不做，子布局会接管 <html> 和 <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
