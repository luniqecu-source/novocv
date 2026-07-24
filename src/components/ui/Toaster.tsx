import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useUi } from '@/store/uiStore'

const icons = {
  ok: <CheckCircle2 size={15} className="text-emerald-400" />,
  error: <AlertCircle size={15} className="text-red-400" />,
  info: <Info size={15} className="text-signal" />,
}

export function Toaster() {
  const toasts = useUi((s) => s.toasts)

  return (
    <div className="no-print pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rise flex items-center gap-2.5 rounded-full border border-edge bg-ink-800/95 py-2 pl-3 pr-4 text-[13px] text-chalk shadow-lift backdrop-blur"
        >
          {icons[toast.kind]}
          {toast.message}
        </div>
      ))}
    </div>
  )
}
