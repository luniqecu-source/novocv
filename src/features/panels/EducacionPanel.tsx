import { Plus, Trash2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { Field, TextInput, TextArea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { SortableList } from '@/components/ui/SortableList'
import { PanelFrame, EmptyState } from './PanelFrame'

export function EducacionPanel() {
  const education = useCv((s) => selectData(s).education)
  const editPath = useCv((s) => s.editPath)
  const add = useCv((s) => s.addEducation)
  const remove = useCv((s) => s.removeFrom)
  const reorder = useCv((s) => s.reorder)

  return (
    <PanelFrame
      title="Formación"
      hint="Títulos, certificaciones y cursos relevantes."
      action={
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={add}>
          Añadir
        </Button>
      }
    >
      {education.length === 0 && <EmptyState message="Aún no hay estudios registrados." />}

      <SortableList
        items={education}
        onReorder={(from, to) => reorder('education', from, to)}
        renderItem={(item, i) => (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Field label="Título">
                  <TextInput value={item.degree} onChange={(e) => editPath(`education.${i}.degree`, e.target.value)} placeholder="Ingeniería en Producción" />
                </Field>
              </div>
              <Button size="sm" variant="danger" onClick={() => remove('education', item.id)} aria-label="Eliminar estudio">
                <Trash2 size={14} />
              </Button>
            </div>
            <Field label="Institución">
              <TextInput value={item.institution} onChange={(e) => editPath(`education.${i}.institution`, e.target.value)} placeholder="Universidad del Azuay" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Desde">
                <TextInput value={item.start} onChange={(e) => editPath(`education.${i}.start`, e.target.value)} placeholder="2013" />
              </Field>
              <Field label="Hasta">
                <TextInput value={item.end} onChange={(e) => editPath(`education.${i}.end`, e.target.value)} placeholder="2018" />
              </Field>
            </div>
            <Field label="Detalle" hint="Opcional">
              <TextArea rows={2} value={item.note} onChange={(e) => editPath(`education.${i}.note`, e.target.value)} placeholder="Tesis sobre optimización de rutas." />
            </Field>
          </div>
        )}
      />
    </PanelFrame>
  )
}
