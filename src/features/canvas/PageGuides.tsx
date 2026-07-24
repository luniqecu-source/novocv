import { useCv, selectDesign } from '@/store/cvStore'
import { useUi, A4_HEIGHT_PX } from '@/store/uiStore'

/**
 * Guias de hoja.
 *
 * Se dibujan tres cosas por corte: la linea de corte, la franja de margen a
 * ambos lados y el limite del area util. Ver el espacio reservado explica por
 * que un bloque bajo a la hoja siguiente, que de otro modo parece arbitrario.
 *
 * Son ayudas de pantalla: llevan `no-print` y nunca llegan al papel.
 */
export function PageGuides() {
  const pageCount = useUi((s) => s.pageCount)
  const design = useCv(selectDesign)
  if (pageCount < 2) return null

  const marginPx = Math.round(design.pageMargin * (96 / 25.4))

  return (
    <div className="no-print pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: pageCount - 1 }, (_, i) => {
        const cut = (i + 1) * A4_HEIGHT_PX
        return (
          <div key={i}>
            {marginPx > 0 && (
              <>
                {/* Franja reservada: nada puede empezar ni terminar aqui. */}
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: cut - marginPx,
                    height: marginPx * 2,
                    background:
                      'repeating-linear-gradient(45deg, rgba(232,163,61,.10) 0 6px, transparent 6px 12px)',
                  }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-saffron/45"
                  style={{ top: cut - marginPx }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-saffron/45"
                  style={{ top: cut + marginPx }}
                />
              </>
            )}

            <div className="absolute left-0 right-0 h-px bg-saffron/80" style={{ top: cut }} />

            <span
              className="absolute right-0 rounded-l bg-saffron px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-950"
              style={{ top: cut + marginPx + 4 }}
            >
              Página {i + 2}
            </span>
            {marginPx > 0 && (
              <span
                className="absolute left-0 rounded-r bg-saffron/85 px-1.5 py-0.5 font-mono text-[9px] text-ink-950"
                style={{ top: cut - marginPx - 16 }}
              >
                margen {design.pageMargin} mm
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
