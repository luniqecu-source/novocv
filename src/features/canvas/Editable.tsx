import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import { useCv } from '@/store/cvStore'
import { getIn, type Path } from '@/lib/path'
import { cn } from '@/lib/cn'

/**
 * Escritura directa sobre el documento.
 *
 * Recibe una ruta del modelo y se encarga de leerla y de confirmarla al salir
 * del campo. Gracias a esto una plantilla nueva no necesita ni un manejador
 * de eventos propio: declara donde va cada dato y ya es editable.
 */
export function Editable({
  path,
  as: Tag = 'span',
  className,
  style,
  placeholder,
  multiline = false,
}: {
  path: Path
  as?: ElementType
  className?: string
  style?: CSSProperties
  placeholder?: string
  multiline?: boolean
}) {
  const value = useCv((s) => String(getIn(s.doc.data, path) ?? ''))
  const editPath = useCv((s) => s.editPath)
  const ref = useRef<HTMLElement | null>(null)
  // El tag es dinamico: JSX no puede verificar sus props ni el ref de forma util.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Node = Tag as any
  const editing = useRef(false)

  // Solo se reescribe el nodo cuando el cambio viene de fuera (deshacer,
  // importacion, IA). Mientras el usuario escribe no se toca: eso destruiria
  // la posicion del cursor.
  useEffect(() => {
    const node = ref.current
    if (!node || editing.current) return
    if (node.innerText !== value) node.innerText = value
  }, [value])

  return (
    <Node
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      tabIndex={0}
      data-placeholder={placeholder}
      className={cn('editable', className)}
      style={style}
      onFocus={() => {
        editing.current = true
      }}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        editing.current = false
        const next = normalise(e.currentTarget.innerText, multiline)
        if (next !== value) editPath(path, next)
        else e.currentTarget.innerText = value
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          e.currentTarget.blur()
          return
        }
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      // Pegar siempre como texto plano: la hoja no debe heredar estilos de Word.
      onPaste={(e: ClipboardEvent<HTMLElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, multiline ? text : text.replace(/\s+/g, ' '))
      }}
    />
  )
}

function normalise(raw: string, multiline: boolean): string {
  const trimmed = raw.replace(/\u00a0/g, ' ').trim()
  return multiline ? trimmed : trimmed.replace(/\s*\n\s*/g, ' ')
}
