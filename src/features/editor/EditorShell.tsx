import { useEffect } from 'react'
import { useCv } from '@/store/cvStore'
import { Topbar } from './Topbar'
import { SectionRail } from './SectionRail'
import { Inspector } from './Inspector'
import { ApiKeyModal } from './ApiKeyModal'
import { PreviewModal } from './PreviewModal'
import { Canvas } from '@/features/canvas/Canvas'
import { Toaster } from '@/components/ui/Toaster'

/** Composicion de la aplicacion. Sin logica propia: solo ensambla las piezas. */
export function EditorShell() {
  useKeyboardShortcuts()

  return (
    <div className="flex h-full flex-col">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <SectionRail />
        <Inspector />
        <Canvas />
      </div>
      <ApiKeyModal />
      <PreviewModal />
      <Toaster />
    </div>
  )
}

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (!meta) return

      if (e.key.toLowerCase() === 'z') {
        // Dentro de un campo editable gana el deshacer nativo del navegador.
        const target = e.target as HTMLElement | null
        if (target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
        e.preventDefault()
        e.shiftKey ? useCv.getState().redo() : useCv.getState().undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
