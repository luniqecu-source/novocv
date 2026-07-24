import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, Check } from 'lucide-react'
import { useCv } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { ask, parseJsonReply } from '@/features/ai/client'
import { SYSTEM_ES, experiencePrompt } from '@/features/ai/prompts'
import { TextArea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { ExperienceItem } from '@/types/cv'

interface Option {
  enfoque: string
  logros: string[]
}

const ENFOQUE_LABEL: Record<string, string> = {
  resultados: 'Resultados',
  responsabilidades: 'Responsabilidades',
  tecnica: 'Técnica',
}

/**
 * Redaccion asistida de los logros de un cargo.
 *
 * Aplica el bloque completo, no logro por logro: una hoja de vida se lee
 * como un conjunto, y mezclar tres redacciones distintas produce un texto
 * que suena a cuatro personas escribiendo por turnos.
 */
export function BulletAssistant({ item, index }: { item: ExperienceItem; index: number }) {
  const edit = useCv((s) => s.edit)
  const { apiKey, notify, setKeyModalOpen } = useUi()

  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!apiKey) {
      setKeyModalOpen(true)
      return
    }
    if (notes.trim().length < 25) {
      notify('Cuenta un poco más sobre lo que hacías en este cargo.', 'error')
      return
    }

    setLoading(true)
    try {
      const reply = await ask({
        system: SYSTEM_ES,
        prompt: experiencePrompt(item, notes),
        apiKey,
        maxTokens: 1600,
        json: true,
      })
      const parsed = parseJsonReply<Option[]>(reply).filter((o) => Array.isArray(o.logros) && o.logros.length > 0)
      if (parsed.length === 0) throw new Error('El asistente no devolvió ninguna versión utilizable.')
      setOptions(parsed)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudieron redactar los logros.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const apply = (option: Option) => {
    edit((draft) => {
      draft.data.experience[index].bullets = option.logros
    })
    notify('Logros actualizados. Puedes deshacer con Ctrl + Z.', 'ok')
  }

  return (
    <div className="rounded-lg border border-edge bg-ink-950/40">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-2.5 py-2 text-[12px] text-muted transition-colors hover:text-chalk"
        aria-expanded={open}
      >
        <Sparkles size={13} className="text-saffron" />
        Redactar los logros con IA
        <ChevronDown size={13} className={cn('ml-auto transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-edge p-2.5">
          <TextArea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cuenta con tus palabras qué hacías aquí. Ejemplo: manejaba las rutas de reparto, negociaba con los transportistas y armaba el reporte mensual para gerencia."
          />

          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={loading}
            onClick={generate}
            icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          >
            {loading ? 'Redactando' : options.length > 0 ? 'Generar otras tres' : 'Proponer tres versiones'}
          </Button>

          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => apply(option)}
              className="w-full rounded-lg border border-edge bg-ink-800/70 p-2.5 text-left transition-colors hover:border-saffron/70"
            >
              <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-saffron">
                <Check size={11} />
                {ENFOQUE_LABEL[option.enfoque] ?? `Versión ${i + 1}`}
              </span>
              <ul className="space-y-1 text-[12px] leading-relaxed text-chalk">
                {option.logros.map((logro, j) => (
                  <li key={j} className="flex gap-1.5">
                    <span className="text-muted">·</span>
                    {logro}
                  </li>
                ))}
              </ul>
            </button>
          ))}

          {options.length > 0 && (
            <p className="text-[11px] leading-relaxed text-muted">
              Revisa los marcadores <span className="font-mono text-saffron">[cifra]</span>: el asistente los deja
              cuando no le diste un número, y no debe llegar así a la hoja.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
