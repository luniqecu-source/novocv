import { Plus, Trash2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { SortableList } from '@/components/ui/SortableList'
import { PanelFrame, EmptyState } from './PanelFrame'

/**
 * Competencias y herramientas comparten forma, asi que comparten panel.
 * Duplicar este archivo con otro titulo seria mantener dos copias del mismo bug.
 */
export function NivelPanel({ list }: { list: 'skills' | 'tools' }) {
  const items = useCv((s) => selectData(s)[list])
  const editPath = useCv((s) => s.editPath)
  const add = useCv((s) => s.addLeveled)
  const remove = useCv((s) => s.removeFrom)
  const reorder = useCv((s) => s.reorder)

  const copy =
    list === 'skills'
      ? { title: 'Competencias', hint: 'Capacidades transversales: liderazgo, idiomas, análisis.' }
      : { title: 'Herramientas', hint: 'Software y tecnologías que dominas.' }

  return (
    <PanelFrame
      title={copy.title}
      hint={copy.hint}
      action={
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => add(list)}>
          Añadir
        </Button>
      }
    >
      {items.length === 0 && <EmptyState message="La sección se oculta de la hoja mientras esté vacía." />}

      <SortableList
        items={items}
        onReorder={(from, to) => reorder(list, from, to)}
        renderItem={(item, i) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TextInput
                value={item.name}
                placeholder={list === 'skills' ? 'Análisis de datos' : 'Excel avanzado'}
                onChange={(e) => editPath(`${list}.${i}.name`, e.target.value)}
              />
              <Button size="sm" variant="danger" onClick={() => remove(list, item.id)} aria-label="Eliminar">
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={item.level}
                onChange={(e) => editPath(`${list}.${i}.level`, Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-600 accent-saffron"
              />
              <span className="w-9 text-right font-mono text-[11px] text-muted">{item.level}</span>
            </div>
          </div>
        )}
      />
    </PanelFrame>
  )
}
