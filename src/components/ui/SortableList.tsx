import { useState, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Lista reordenable con arrastre nativo del navegador.
 * Sin dependencias: para listas cortas como las de un CV es suficiente y
 * evita traer una libreria de drag and drop completa.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[]
  onReorder: (from: number, to: number) => void
  renderItem: (item: T, index: number) => ReactNode
}) {
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(index)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (dragging !== null) onReorder(dragging, index)
            setDragging(null)
            setOver(null)
          }}
          className={cn(
            'group relative rounded-xl border bg-ink-800/70 transition-colors duration-150 ease-snap',
            over === index && dragging !== null && dragging !== index
              ? 'border-saffron/70'
              : 'border-edge',
            dragging === index && 'opacity-40',
          )}
        >
          <span
            draggable
            onDragStart={() => setDragging(index)}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
            }}
            className="absolute left-1 top-3 cursor-grab p-1 text-muted/50 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            aria-label="Reordenar"
          >
            <GripVertical size={14} />
          </span>
          <div className="p-3 pl-6">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  )
}
