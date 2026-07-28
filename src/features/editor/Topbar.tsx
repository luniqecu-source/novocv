import { Undo2, Redo2, Save, Eye } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { downloadJson } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { templateById } from '@/features/templates/registry'

export function Topbar() {
  const { doc, undo, redo, past, future } = useCv()
  const name = useCv((s) => selectData(s).personal.fullName)
  const notify = useUi((s) => s.notify)
  const pageCount = useUi((s) => s.pageCount)
  const setPreviewOpen = useUi((s) => s.setPreviewOpen)

  const template = templateById(doc.design.templateId)


  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-edge bg-ink-900 px-4">
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-[17px] font-extrabold tracking-tight text-chalk">Folio</span>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted sm:inline">
          {template.name} · A4 · {pageCount} {pageCount === 1 ? 'página' : 'páginas'}
        </span>
      </div>

      <div className="ml-3 flex items-center gap-0.5">
        <Button size="sm" onClick={undo} disabled={past.length === 0} aria-label="Deshacer" title="Deshacer">
          <Undo2 size={15} />
        </Button>
        <Button size="sm" onClick={redo} disabled={future.length === 0} aria-label="Rehacer" title="Rehacer">
          <Redo2 size={15} />
        </Button>
      </div>

      <span className="ml-auto hidden items-center gap-1.5 text-[11.5px] text-muted md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Guardado en este navegador
      </span>

      <Button
        size="sm"
        variant="ghost"
        icon={<Save size={14} />}
        onClick={() => {
          downloadJson(doc, fileName(name, 'folio.json'))
          notify('Copia de respaldo descargada', 'ok')
        }}
      >
        Respaldo
      </Button>

      <Button
        size="sm"
        variant="primary"
        icon={<Eye size={14} />}
        onClick={() => setPreviewOpen(true)}
      >
        Vista previa y PDF
      </Button>

    </header>
  )
}


function fileName(name: string, extension: string) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'hoja-de-vida'
  return `${slug}.${extension}`
}
