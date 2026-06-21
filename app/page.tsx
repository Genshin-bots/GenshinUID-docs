import { redirect } from 'next/navigation'

// 根路径重定向到默认语言
export default function RootPage(): never {
  redirect('/zh-CN/')
}
