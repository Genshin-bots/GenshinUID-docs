import { twMerge } from 'tailwind-merge'

/**
 * 合并 className
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(inputs.filter(Boolean).join(' '))
}
