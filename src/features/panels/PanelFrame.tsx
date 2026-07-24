import type { ReactNode } from 'react'

/** Marco comun de todos los paneles: titulo, explicacion breve y contenido. */
export function PanelFrame({
  title,
  hint,
  action,
  children,
}: {
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-edge px-4 py-3.5">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-chalk">{title}</h2>
          {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-edge px-4 py-6 text-center text-[12.5px] text-muted">
      {message}
    </p>
  )
}
