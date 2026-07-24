import { useState } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { ask, parseJsonReply } from '@/features/ai/client'
import { SYSTEM_ES, summaryPrompt } from '@/features/ai/prompts'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { PanelFrame } from './PanelFrame'

export function PerfilPanel() {
  const data = useCv(selectData)
  const editPath = useCv((s) => s.editPath)
  const { apiKey, notify, setKeyModalOpen } = useUi()
  const [target, setTarget] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const words = data.summary.trim() ? data.summary.trim().split(/\s+/).length : 0

  const generate = async () => {
    if (!apiKey) {
      setKeyModalOpen(true)
      return
    }
    setLoading(true)
    try {
      const reply = await ask({ system: SYSTEM_ES, prompt: summaryPrompt(data, target), apiKey, json: true })
      setOptions(parseJsonReply<string[]>(reply))
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo generar el perfil.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PanelFrame title="Perfil profesional" hint="Entre 45 y 65 palabras funciona mejor que un párrafo largo.">
      <Field label="Tu resumen" hint={`${words} palabras`}>
        <TextArea
          rows={7}
          value={data.summary}
          onChange={(e) => editPath('summary', e.target.value)}
          placeholder="Analista con seis años coordinando cadenas de abastecimiento…"
        />
      </Field>

      <div className="rounded-xl border border-edge bg-ink-800/60 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-chalk">
          <Sparkles size={13} className="text-saffron" /> Redactar con el asistente
        </p>
        <Field label="Cargo al que aspiras" hint="Opcional">
          <TextInput value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Jefe de logística" />
        </Field>
        <Button
          variant="primary"
          size="sm"
          className="mt-2.5 w-full"
          disabled={loading}
          onClick={generate}
          icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        >
          {loading ? 'Redactando' : 'Proponer tres versiones'}
        </Button>

        {options.length > 0 && (
          <div className="mt-3 space-y-2">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => {
                  editPath('summary', option)
                  notify('Perfil actualizado', 'ok')
                }}
                className="w-full rounded-lg border border-edge bg-ink-950/50 p-2.5 text-left text-[12px] leading-relaxed text-chalk transition-colors hover:border-saffron/70"
              >
                <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-saffron">
                  <Check size={11} /> Versión {i + 1}
                </span>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </PanelFrame>
  )
}
