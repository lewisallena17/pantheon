import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for composing Tailwind class names — the shadcn/ui convention.
 * Dedupes conflicting classes (e.g. `px-4 px-2` → `px-2`) and ignores falsy.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
