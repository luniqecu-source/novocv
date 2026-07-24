import type { ReactNode, RefObject } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useUi } from '@/store/uiStore'

/** Instrumento flotante. Se mantiene fuera del flujo para no mover la hoja. */
export function ZoomBar({ containerRef }: { containerRef: RefObject<HTMLDivElement> }) {
  const zoom = useUi((s) => s.zoom)
  const zoomBy = useUi((s) => s.zoomBy)
  const setZoom = useUi((s) => s.setZoom)
  const fitToWidth = useUi((s) => s.fitToWidth)

  return (
    <div className="no-print sticky bottom-5 z-20 mx-auto flex w-fit items-center gap-1 rounded-full border border-edge bg-ink-800/90 p-1.5 shadow-lift backdrop-blur">
      <IconButton label="Alejar" onClick={() => zoomBy(-0.1)}>
        <ZoomOut size={15} />
      </IconButton>

      <button
        onClick={() => setZoom(1)}
        className="min-w-[52px] rounded-full px-2 py-1 font-mono text-[11px] text-chalk transition-colors hover:bg-ink-700"
        title="Volver al 100 %"
      >
        {Math.round(zoom * 100)}%
      </button>

      <IconButton label="Acercar" onClick={() => zoomBy(0.1)}>
        <ZoomIn size={15} />
      </IconButton>

      <span className="mx-1 h-4 w-px bg-edge" />

      <IconButton
        label="Ajustar al ancho"
        onClick={() => containerRef.current && fitToWidth(containerRef.current.clientWidth)}
      >
        <Maximize2 size={15} />
      </IconButton>
    </div>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-full p-1.5 text-muted transition-colors hover:bg-ink-700 hover:text-chalk"
    >
      {children}
    </button>
  )
}
