import { useState, useEffect } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useUi } from '@/store/uiStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, Select } from '@/components/ui/Field'
import { listModels, getModel, setModel, type ModelInfo } from '@/features/ai/client'

/**
 * Clave y modelo del asistente.
 *
 * La lista de modelos se pide a la propia API en vez de mantenerse escrita:
 * los nombres de Gemini cambian cada pocos meses y una lista fija garantiza
 * un error 404 mas adelante.
 */
export function ApiKeyModal() {
  const { keyModalOpen, setKeyModalOpen, apiKey, setApiKey, notify } = useUi()
  const [draft, setDraft] = useState(apiKey)
  const [model, setLocalModel] = useState(getModel())
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDraft(apiKey)
    setLocalModel(getModel())
  }, [apiKey, keyModalOpen])

  const load = async () => {
    const key = draft.trim()
    if (!key) {
      notify('Escribe primero la clave.', 'error')
      return
    }
    setLoading(true)
    try {
      const available = await listModels(key)
      setModels(available)
      // Si el modelo guardado ya no existe, se cambia por el primer flash.
      if (!available.some((m) => m.id === model)) {
        const fallback = available.find((m) => m.id.includes('flash')) ?? available[0]
        if (fallback) setLocalModel(fallback.id)
      }
      notify(`${available.length} modelos disponibles para esta clave`, 'ok')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo consultar la lista.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={keyModalOpen} title="Clave de Gemini" onClose={() => setKeyModalOpen(false)}>
      <Field label="Clave de la API de Gemini">
        <TextInput
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="AIza..."
          spellCheck={false}
          autoComplete="off"
        />
      </Field>

      <div className="mt-3">
        <Field label="Modelo" hint={models.length > 0 ? `${models.length} disponibles` : 'sin consultar'}>
          {models.length > 0 ? (
            <Select value={model} onChange={(e) => setLocalModel(e.target.value)}>
              {models.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.id}
                </option>
              ))}
            </Select>
          ) : (
            <TextInput value={model} onChange={(e) => setLocalModel(e.target.value)} spellCheck={false} />
          )}
        </Field>

        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          disabled={loading}
          onClick={load}
          icon={loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        >
          {loading ? 'Consultando' : 'Ver los modelos que acepta mi clave'}
        </Button>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        La clave se genera en{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-saffron underline underline-offset-2"
        >
          Google AI Studio
        </a>
        . Se guarda únicamente en este navegador y viaja directo a Google.
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        Para publicar la aplicación en internet, define{' '}
        <code className="font-mono text-saffron">VITE_AI_PROXY_URL</code> y deja la clave en el
        servidor: cualquiera podría leerla desde el navegador.
      </p>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setKeyModalOpen(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => {
            setApiKey(draft.trim())
            setModel(model.trim())
            setKeyModalOpen(false)
            notify(draft.trim() ? `Listo, usando ${model.trim()}` : 'Clave eliminada', 'ok')
          }}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  )
}
