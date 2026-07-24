import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rise relative w-full max-w-md rounded-2xl border border-edge bg-ink-800 p-5 shadow-lift"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold text-chalk">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:text-chalk" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
