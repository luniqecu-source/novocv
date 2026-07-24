import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-saffron text-ink-950 hover:bg-saffron-soft font-semibold shadow-lift',
  ghost: 'text-muted hover:text-chalk hover:bg-ink-700',
  outline: 'border border-edge text-chalk hover:border-saffron/60 hover:text-saffron',
  danger: 'text-muted hover:text-red-300 hover:bg-red-500/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[12px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-lg',
}

export function Button({ variant = 'ghost', size = 'md', icon, children, className, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 ease-snap',
        'disabled:opacity-40 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
