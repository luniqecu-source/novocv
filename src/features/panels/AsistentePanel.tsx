import { useState, type ReactNode } from 'react'
import { Loader2, Target, Mail, KeyRound, Copy } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { ask, parseJsonReply } from '@/features/ai/client'
import { SYSTEM_ES, atsPrompt, letterPrompt } from '@/features/ai/prompts'
import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { PanelFrame } from './PanelFrame'

interface AtsResult {
  puntaje: number
  faltantes: string[]
  presentes: string[]
  ajustes: string[]
  veredicto: string
}

export function AsistentePanel() {
  const data = useCv(selectData)
  const { apiKey, notify, setKeyModalOpen } = useUi()
  const [job, setJob] = useState('')
  const [company, setCompany] = useState('')
  const [ats, setAts] = useState<AtsResult | null>(null)
  const [letter, setLetter] = useState('')
  const [busy, setBusy] = useState<'ats' | 'letter' | null>(null)

  const guard = () => {
    if (!apiKey) {
      setKeyModalOpen(true)
      return false
    }
    if (job.trim().length < 60) {
      notify('Pega la oferta completa para que el análisis sirva de algo.', 'error')
      return false
    }
    return true
  }

  const runAts = async () => {
    if (!guard()) return
    setBusy('ats')
    try {
      const reply = await ask({ system: SYSTEM_ES, prompt: atsPrompt(data, job), apiKey, maxTokens: 1500, json: true })
      setAts(parseJsonReply<AtsResult>(reply))
    } catch (error) {
      notify(error instanceof Error ? error.message : 'El análisis falló.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const runLetter = async () => {
    if (!guard()) return
    setBusy('letter')
    try {
      setLetter(await ask({ system: SYSTEM_ES, prompt: letterPrompt(data, job, company), apiKey }))
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo redactar la carta.', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <PanelFrame
      title="Asistente"
      hint="Compara tu hoja con una oferta concreta."
      action={
        <Button size="sm" variant="ghost" icon={<KeyRound size={13} />} onClick={() => setKeyModalOpen(true)}>
          {apiKey ? 'Clave activa' : 'Configurar'}
        </Button>
      }
    >
      <Field label="Descripción de la vacante">
        <TextArea rows={7} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Pega aquí el aviso completo, con requisitos y responsabilidades." />
      </Field>

      <Button
        variant="primary"
        className="w-full"
        disabled={busy !== null}
        onClick={runAts}
        icon={busy === 'ats' ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
      >
        {busy === 'ats' ? 'Analizando' : 'Analizar compatibilidad'}
      </Button>

      {ats && (
        <div className="space-y-3 rounded-xl border border-edge bg-ink-800/60 p-3.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-saffron">{ats.puntaje}</span>
            <span className="text-[11px] text-muted">de 100 en coincidencia</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-600">
            <div className="h-full rounded-full bg-saffron transition-all duration-500 ease-snap" style={{ width: `${ats.puntaje}%` }} />
          </div>

          <p className="text-[12.5px] leading-relaxed text-chalk">{ats.veredicto}</p>

          {ats.faltantes?.length > 0 && (
            <Group title="Palabras clave ausentes">
              {ats.faltantes.map((word) => (
                <span key={word} className="rounded-full bg-red-500/12 px-2 py-0.5 text-[11px] text-red-300">{word}</span>
              ))}
            </Group>
          )}

          {ats.presentes?.length > 0 && (
            <Group title="Ya cubiertas">
              {ats.presentes.map((word) => (
                <span key={word} className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] text-emerald-300">{word}</span>
              ))}
            </Group>
          )}

          {ats.ajustes?.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Qué cambiar</p>
              <ul className="space-y-1 text-[12px] leading-relaxed text-chalk">
                {ats.ajustes.map((tip) => (
                  <li key={tip} className="flex gap-1.5">
                    <span className="text-saffron">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-edge pt-4">
        <Field label="Empresa" hint="Para la carta">
          <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Distribuidora Andina" />
        </Field>
        <Button
          variant="outline"
          className="mt-2.5 w-full"
          disabled={busy !== null}
          onClick={runLetter}
          icon={busy === 'letter' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
        >
          {busy === 'letter' ? 'Redactando' : 'Escribir carta de presentación'}
        </Button>

        {letter && (
          <div className="mt-3 rounded-xl border border-edge bg-ink-800/60 p-3.5">
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-chalk">{letter}</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2"
              icon={<Copy size={13} />}
              onClick={() => {
                navigator.clipboard.writeText(letter)
                notify('Carta copiada', 'ok')
              }}
            >
              Copiar
            </Button>
          </div>
        )}
      </div>
    </PanelFrame>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
