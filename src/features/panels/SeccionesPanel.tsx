import { ChevronUp, ChevronDown, Eye, EyeOff, Plus, Trash2, List, AlignLeft } from 'lucide-react'
import { useCv, selectData, selectDesign } from '@/store/cvStore'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { PanelFrame } from './PanelFrame'

/** Nombres legibles de las secciones fijas, por clave. */
const FIXED_LABELS: Record<string, string> = {
  perfil: 'Perfil',
  experiencia: 'Experiencia',
  educacion: 'Formación',
  formacion: 'Formación',
  herramientas: 'Herramientas',
  competencias: 'Competencias',
  referencias: 'Referencias',
  contacto: 'Contacto',
  'referencias-personales': 'Ref. personales',
  'referencias-profesionales': 'Ref. profesionales',
}

/**
 * Gestor de secciones.
 *
 * Muestra las secciones en el orden guardado y deja reordenarlas, ocultarlas
 * y crear nuevas. El orden y la visibilidad son ajustes de diseno: las
 * plantillas los leen a traves de <OrderedSections>, asi que el efecto es
 * inmediato y sobrevive a cambiar de plantilla.
 */
export function SeccionesPanel() {
  const { custom } = useCv(selectData)
  const design = useCv(selectDesign)
  const move = useCv((s) => s.moveSection)
  const toggle = useCv((s) => s.toggleSectionHidden)
  const addCustom = useCv((s) => s.addCustomSection)
  const removeCustom = useCv((s) => s.removeCustomSection)

  // Claves fijas conocidas + personalizadas, en el orden guardado.
  const customKeys = custom.map((c) => `custom:${c.id}`)
  const known = [...Object.keys(FIXED_LABELS), ...customKeys]
  const ordered = design.sectionOrder.filter((k) => known.includes(k))
  const missing = known.filter((k) => !ordered.includes(k))
  const sequence = [...ordered, ...missing]

  const labelOf = (key: string) => {
    if (key.startsWith('custom:')) {
      const id = key.slice('custom:'.length)
      return custom.find((c) => c.id === id)?.title || 'Sección personalizada'
    }
    return FIXED_LABELS[key] ?? key
  }

  return (
    <PanelFrame
      title="Secciones"
      hint="Reordena, oculta o añade secciones. El orden se aplica a la hoja al instante."
    >
      <div className="space-y-1.5">
        {sequence.map((key, i) => {
          const hidden = design.hiddenSections.includes(key)
          const isCustom = key.startsWith('custom:')
          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border p-2 transition-colors',
                hidden ? 'border-edge bg-ink-950/30 opacity-55' : 'border-edge bg-ink-800/60',
              )}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(key, -1)}
                  disabled={i === 0}
                  className="text-muted transition-colors hover:text-chalk disabled:opacity-25"
                  aria-label="Subir"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => move(key, 1)}
                  disabled={i === sequence.length - 1}
                  className="text-muted transition-colors hover:text-chalk disabled:opacity-25"
                  aria-label="Bajar"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <span className="min-w-0 flex-1 truncate text-[12.5px] text-chalk">
                {labelOf(key)}
                {isCustom && <span className="ml-1.5 font-mono text-[9px] uppercase tracking-widest text-saffron">propia</span>}
              </span>

              <button
                onClick={() => toggle(key)}
                className="rounded p-1 text-muted transition-colors hover:text-chalk"
                aria-label={hidden ? 'Mostrar' : 'Ocultar'}
                title={hidden ? 'Mostrar' : 'Ocultar'}
              >
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>

              {isCustom && (
                <button
                  onClick={() => removeCustom(key.slice('custom:'.length))}
                  className="rounded p-1 text-muted transition-colors hover:text-red-300"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-edge pt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Añadir sección</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" icon={<List size={14} />} onClick={() => addCustom('lista')}>
            De lista
          </Button>
          <Button variant="outline" size="sm" className="flex-1" icon={<AlignLeft size={14} />} onClick={() => addCustom('texto')}>
            De texto
          </Button>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Logros, certificaciones, idiomas, voluntariado: lo que el puesto pida. Aparece al final;
          súbela desde aquí y edítala directamente sobre la hoja.
        </p>
      </div>
    </PanelFrame>
  )
}
