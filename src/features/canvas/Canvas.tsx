import { useEffect, useRef } from 'react'
import { useCv, selectData, selectDesign } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { designToCssVars } from '@/data/design'
import { templateById } from '@/features/templates/registry'
import { ZoomBar } from './ZoomBar'
import { PageGuides } from './PageGuides'
import { usePageLayout } from './usePageLayout'

/**
 * La mesa de trabajo.
 *
 * Solo hace cuatro cosas: aplicar el zoom, traducir los ajustes de diseno a
 * variables CSS, montar la plantilla activa y medir cuantas hojas ocupa.
 * Toda la maquetacion del documento vive en la plantilla, no aqui.
 */
export function Canvas() {
  const data = useCv(selectData)
  const design = useCv(selectDesign)
  const zoom = useUi((s) => s.zoom)
  const fitToWidth = useUi((s) => s.fitToWidth)
  const pageCount = useUi((s) => s.pageCount)

  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLElement>(null)

  const template = templateById(design.templateId)
  const Template = template.component

  // Ajuste inicial al ancho disponible: la hoja debe verse entera al abrir.
  useEffect(() => {
    if (containerRef.current) fitToWidth(containerRef.current.clientWidth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ctrl + rueda hace zoom, como en cualquier herramienta de diseno.
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      useUi.getState().zoomBy(e.deltaY > 0 ? -0.06 : 0.06)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  // Empuja los bloques marcados al inicio de hoja y mantiene el conteo al dia.
  usePageLayout(paperRef)

  return (
    <div ref={containerRef} className="lighttable relative flex-1 overflow-auto">
      <div className="canvas-zoom flex justify-center px-12 py-10" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        <div className="paper-stack relative flex flex-col gap-8">
          <article
            ref={paperRef}
            key={design.templateId}
            className="paper rise"
            // La hoja mide siempre paginas enteras: sin esto la ultima queda
            // recortada al alto del contenido y no se ve el margen inferior.
            style={{ ...designToCssVars(design), minHeight: `${pageCount * 297}mm` }}
            aria-label={`Hoja de vida, plantilla ${template.name}`}
          >
            <Template data={data} design={design} />
          </article>
          <PageGuides />
        </div>
      </div>

      <ZoomBar containerRef={containerRef} />
    </div>
  )
}
