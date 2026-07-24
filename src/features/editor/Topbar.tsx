import { useState, type ReactNode } from 'react'
import { Undo2, Redo2, Printer, FileDown, Save, ChevronDown, Loader2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { printToPdf, rasterToPdf } from '@/features/export/exportPdf'
import { downloadJson } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { templateById } from '@/features/templates/registry'

export function Topbar() {
  const { doc, undo, redo, past, future } = useCv()
  const name = useCv((s) => selectData(s).personal.fullName)
  const notify = useUi((s) => s.notify)
  const pageCount = useUi((s) => s.pageCount)
  const [exporting, setExporting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const template = templateById(doc.design.templateId)

  const exportRaster = async () => {
    setMenuOpen(false)
    setExporting(true)
    try {
      await rasterToPdf({ filename: fileName(name, 'pdf') })
      notify('PDF generado como imagen', 'ok')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'La exportación falló.', 'error')
    } finally {
      setExporting(false)
    }
  }

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

      <div className="relative">
        <div className="flex">
          <Button size="sm" variant="primary" icon={<Printer size={14} />} onClick={printToPdf} className="rounded-r-none pr-2.5">
            Exportar PDF
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Más opciones de exportación"
            className="rounded-l-none border-l border-ink-950/25 px-1.5"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
          </Button>
        </div>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="rise absolute right-0 top-11 z-20 w-72 rounded-xl border border-edge bg-ink-800 p-1.5 shadow-lift">
              <MenuItem
                icon={<Printer size={14} />}
                title="Imprimir a PDF"
                detail="Texto seleccionable. Es la opción que leen los filtros automáticos."
                onClick={() => {
                  setMenuOpen(false)
                  printToPdf()
                }}
              />
              <MenuItem
                icon={<FileDown size={14} />}
                title="PDF como imagen"
                detail="Conserva el diseño exacto, pero el texto deja de ser legible por máquina."
                onClick={exportRaster}
              />
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function MenuItem({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-ink-700">
      <span className="mt-0.5 text-saffron">{icon}</span>
      <span>
        <span className="block text-[12.5px] font-medium text-chalk">{title}</span>
        <span className="block text-[11.5px] leading-snug text-muted">{detail}</span>
      </span>
    </button>
  )
}

function fileName(name: string, extension: string) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'hoja-de-vida'
  return `${slug}.${extension}`
}
