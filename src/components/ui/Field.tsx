import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

const base =
  'w-full bg-ink-950/60 border border-edge rounded-lg px-3 py-2 text-[13px] text-chalk ' +
  'placeholder:text-muted/60 transition-colors duration-150 ease-snap ' +
  'hover:border-edge/80 focus:border-saffron/70 focus:outline-none'

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{children}</span>
      {hint && <span className="text-[10px] text-muted/70">{hint}</span>}
    </span>
  )
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      {children}
    </label>
  )
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...rest} />
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'resize-y leading-relaxed', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'cursor-pointer', className)} {...rest}>
      {children}
    </select>
  )
}
