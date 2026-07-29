import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { useCv } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { readPdf } from '@/features/import/pdfReader'
import { readDocx, readPlainText } from '@/features/import/docxReader'
import { parseCv } from '@/features/import/cvParser'
import { Button } from '@/components/ui/Button'
import { PanelFrame } from './PanelFrame'
import { cn } from '@/lib/cn'

export function ImportarPanel() {
  const edit = useCv((s) => s.edit)
  const notify = useUi((s) => s.notify)
  const [progress, setProgress] = useState<number | null>(null)
  const [notes, setNotes] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const handle = async (file: File | undefined) => {
    if (!file) return

    setProgress(0)
    setNotes([])

    try {
      const name = file.name.toLowerCase()
      let text: string

      if (name.endsWith('.pdf')) {
        text = await readPdf(file, setProgress)
      } else if (name.endsWith('.docx')) {
        text = await readDocx(file)
      } else if (name.endsWith('.txt') || name.endsWith('.md')) {
        text = await readPlainText(file)
      } else {
        throw new Error('Formato no admitido. Usa PDF, DOCX o TXT.')
      }

      if (text.trim().length < 40) {
        throw new Error(
          'El archivo casi no tiene texto. Si es un PDF escaneado, hace falta OCR.'
        )
      }

      const {
        data,
        confidence,
        notes: parseNotes,
      } = parseCv(text)

      edit((draft) => {
        if (data.personal) {
          Object.assign(draft.data.personal, data.personal)
        }

        if (data.summary) {
          draft.data.summary = data.summary
        }

        if (data.experience?.length) {
          draft.data.experience = data.experience
        }

        if (data.education?.length) {
          draft.data.education = data.education
        }

        if (data.skills?.length) {
          draft.data.skills = data.skills
        }

        if (data.tools?.length) {
          draft.data.tools = data.tools
        }

        if (data.references?.length) {
          draft.data.references = data.references
        }
      })

      setNotes(parseNotes)

      notify(
        `Documento leído (${Math.round(confidence * 100)} % reconocido). Revisa los campos.`,
        'ok'
      )
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : 'No se pudo leer el archivo.',
        'error'
      )
    } finally {
      setProgress(null)
    }
  }

  return (
    <PanelFrame
      title="Importar"
      hint="Parte de un CV anterior en lugar de escribir desde cero."
    >
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handle(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors duration-150 ease-snap',
          dragging
            ? 'border-saffron bg-saffron/5'
            : 'border-edge hover:border-edge/70'
        )}
      >
        {progress === null ? (
          <Upload size={22} className="text-saffron" />
        ) : (
          <Loader2
            size={22}
            className="animate-spin text-saffron"
          />
        )}

        <span className="text-[13px] text-chalk">
          Suelta el archivo aquí
        </span>

        <span className="text-[11.5px] text-muted">
          PDF, DOCX o TXT
        </span>

        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </label>

      {progress !== null && (
        <div className="h-1 overflow-hidden rounded-full bg-ink-600">
          <div
            className="h-full rounded-full bg-saffron transition-all"
            style={{
              width: `${Math.round(progress * 100)}%`,
            }}
          />
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-xl border border-edge bg-ink-800/60 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-chalk">
            <FileText size={13} />
            Qué revisar
          </p>

          <ul className="space-y-1 text-[12px] text-muted">
            {notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-muted">
        La lectura es heurística: reconoce encabezados en español y rangos de años.
        Si el resultado queda desordenado, el asistente puede reinterpretar el mismo
        texto con más precisión.
      </p>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          if (
            confirm(
              'Se descartará el contenido actual. ¿Continuar?'
            )
          ) {
            useCv.getState().reset()
          }
        }}
      >
        Empezar de cero
      </Button>
    </PanelFrame>
  )
}