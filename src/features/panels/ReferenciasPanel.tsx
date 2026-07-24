import { Plus, Trash2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { Field, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/Controls'
import { SortableList } from '@/components/ui/SortableList'
import { PanelFrame, EmptyState } from './PanelFrame'
import type { ReferenceKind } from '@/types/cv'

export function ReferenciasPanel() {
  const references = useCv((s) => selectData(s).references)
  const editPath = useCv((s) => s.editPath)
  const add = useCv((s) => s.addReference)
  const remove = useCv((s) => s.removeFrom)
  const reorder = useCv((s) => s.reorder)

  return (
    <PanelFrame
      title="Referencias"
      hint="Confirma con cada persona antes de publicar su teléfono."
      action={
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => add('profesional')}>
          Añadir
        </Button>
      }
    >
      {references.length === 0 && <EmptyState message="Sin referencias registradas." />}

      <SortableList
        items={references}
        onReorder={(from, to) => reorder('references', from, to)}
        renderItem={(item, i) => (
          <div className="space-y-2.5">
            <SegmentedControl<ReferenceKind>
              value={item.kind}
              options={[
                { value: 'profesional', label: 'Profesional' },
                { value: 'personal', label: 'Personal' },
              ]}
              onChange={(kind) => editPath(`references.${i}.kind`, kind)}
            />
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Field label="Nombre">
                  <TextInput value={item.name} onChange={(e) => editPath(`references.${i}.name`, e.target.value)} placeholder="Marcelo Peñafiel" />
                </Field>
              </div>
              <Button size="sm" variant="danger" onClick={() => remove('references', item.id)} aria-label="Eliminar referencia">
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Relación">
                <TextInput value={item.relation} onChange={(e) => editPath(`references.${i}.relation`, e.target.value)} placeholder="Jefe directo" />
              </Field>
              <Field label="Empresa">
                <TextInput value={item.company} onChange={(e) => editPath(`references.${i}.company`, e.target.value)} placeholder="Distribuidora Andina" />
              </Field>
            </div>
            <Field label="Teléfono">
              <TextInput value={item.phone} onChange={(e) => editPath(`references.${i}.phone`, e.target.value)} placeholder="+593 98 765 4321" />
            </Field>
          </div>
        )}
      />
    </PanelFrame>
  )
}
