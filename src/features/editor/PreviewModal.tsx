import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ChevronUp, ChevronDown, Eye, EyeOff, FileDown, ZoomIn, ZoomOut } from 'lucide-react'
import { useCv, selectData, selectDesign } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { designToCssVars } from '@/data/design'
import { templateById } from '@/features/templates/registry'
import { exportSheetToPdf } from '@/features/export/exportPdf'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const FIXED_LABELS: Record<string, string> = {
  perfil: 'Perfil', experiencia: 'Experiencia', educacion: 'Formación', formacion: 'Formación',
  herramientas: 'Herramientas', competencias: 'Competencias', referencias: 'Referencias',
  contacto: 'Contacto', 'referencias-personales': 'Ref. personales', 'referencias-profesionales': 'Ref. profesionales',
}

// Ancho de una hoja A4 a 96 ppp, en pixeles.
const A4_WIDTH_PX = 794

/**
 * Visor previo a la exportacion.
 *
 * Muestra la misma hoja del lienzo a tamano real y permite reordenar las
 * secciones antes de exportar.
 *
 * Al imprimir NO se imprime el modal: lleva `.no-print` y desaparece, y el
 * navegador pagina el lienzo de fondo con las reglas @media print. Esa es la
 * via que produce un PDF con texto seleccionable. El modal solo sirve para
 * revisar y reordenar en pantalla.
 */
export function PreviewModal() {
  const open = useUi((s) => s.previewOpen)
  const setOpen = useUi((s) => s.setPreviewOpen)
  const notify = useUi((s) => s.notify)

  const data = useCv(selectData)
  const design = useCv(selectDesign)
  const move = useCv((s) => s.moveSection)
  const toggle = useCv((s) => s.toggleSectionHidden)

  const template = templateById(design.templateId)
  const Template = template.component

  const [scale, setScale] = useState(0.7)
  const [autoScale, setAutoScale] = useState(true)
  const viewRef = useRef<HTMLDivElement>(null)

  // Ajuste automatico: la hoja completa cabe a lo ancho de la zona de vista.
  useEffect(() => {
    if (!open || !autoScale) return
    const fit = () => {
      const w = viewRef.current?.clientWidth ?? 700
      setScale(Math.min(1, Math.max(0.3, (w - 56) / A4_WIDTH_PX)))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [open, autoScale])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const savePdf = useCallback(() => {
    try {
      exportSheetToPdf()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo guardar el PDF.', 'error')
    }
  }, [notify])


  if (!open) return null

  const custom = data.custom
  const customKeys = custom.map((c) => `custom:${c.id}`)
  const known = [...Object.keys(FIXED_LABELS), ...customKeys]
  const ordered = design.sectionOrder.filter((k) => known.includes(k))
  const missing = known.filter((k) => !ordered.includes(k))
  const sequence = [...ordered, ...missing]

  const labelOf = (key: string) =>
    key.startsWith('custom:')
      ? custom.find((c) => c.id === key.slice(7))?.title || 'Sección propia'
      : FIXED_LABELS[key] ?? key

  const setZoom = (next: number) => {
    setAutoScale(false)
    setScale(Math.min(1.2, Math.max(0.3, next)))
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex flex-col bg-ink-950/90 backdrop-blur-sm">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-edge bg-ink-900 px-4">
        <span className="font-display text-[15px] font-semibold text-chalk">Vista previa</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{template.name} · A4</span>

        <div className="ml-3 flex items-center gap-1">
          <button onClick={() => setZoom(scale - 0.1)} className="rounded p-1 text-muted hover:text-chalk" aria-label="Alejar">
            <ZoomOut size={15} />
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-muted">{Math.round(scale * 100)}%</span>
          <button onClick={() => setZoom(scale + 0.1)} className="rounded p-1 text-muted hover:text-chalk" aria-label="Acercar">
            <ZoomIn size={15} />
          </button>
          <button onClick={() => setAutoScale(true)} className="ml-1 rounded px-2 py-1 text-[11px] text-muted hover:text-chalk">
            Ajustar
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<FileDown size={14} />} onClick={savePdf}>
            Guardar PDF
          </Button>
          <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted hover:text-chalk" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-edge bg-ink-900 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Orden de secciones</p>
          <div className="space-y-1.5">
            {sequence.map((key, i) => {
              const hidden = design.hiddenSections.includes(key)
              return (
                <div key={key} className={cn('flex items-center gap-1 rounded-lg border border-edge bg-ink-800/60 p-1.5', hidden && 'opacity-55')}>
                  <div className="flex flex-col">
                    <button onClick={() => move(key, -1)} disabled={i === 0} className="text-muted hover:text-chalk disabled:opacity-25" aria-label="Subir">
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => move(key, 1)} disabled={i === sequence.length - 1} className="text-muted hover:text-chalk disabled:opacity-25" aria-label="Bajar">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-chalk">{labelOf(key)}</span>
                  <button onClick={() => toggle(key)} className="rounded p-0.5 text-muted hover:text-chalk" aria-label={hidden ? 'Mostrar' : 'Ocultar'}>
                    {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )
            })}
          </div>
        </aside>

        <div ref={viewRef} className="lighttable flex-1 overflow-auto p-7">
          {/* El contenedor exterior reserva el ancho ya escalado para que no se
              corte a la derecha; el interior aplica la escala. */}
          <div className="mx-auto" style={{ width: A4_WIDTH_PX * scale }}>
            <div className="" style={{ width: A4_WIDTH_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <div className="paper-stack">
                <article className="paper" style={designToCssVars(design)}>
                  <Template data={data} design={design} />
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
