import { Plus, Trash2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { Field, TextInput, TextArea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Controls'
import { SortableList } from '@/components/ui/SortableList'
import { PanelFrame, EmptyState } from './PanelFrame'
import { BulletAssistant } from './BulletAssistant'

export function ExperienciaPanel() {
  const experience = useCv((s) => selectData(s).experience)
  const editPath = useCv((s) => s.editPath)
  const edit = useCv((s) => s.edit)
  const add = useCv((s) => s.addExperience)
  const remove = useCv((s) => s.removeFrom)
  const reorder = useCv((s) => s.reorder)

  return (
    <PanelFrame
      title="Experiencia"
      hint="Arrastra para cambiar el orden. Lo más reciente arriba."
      action={
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={add}>
          Añadir
        </Button>
      }
    >
      {experience.length === 0 && <EmptyState message="Aún no hay cargos registrados." />}

      <SortableList
        items={experience}
        onReorder={(from, to) => reorder('experience', from, to)}
        renderItem={(item, i) => (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2.5">
                <Field label="Cargo">
                  <TextInput value={item.role} onChange={(e) => editPath(`experience.${i}.role`, e.target.value)} placeholder="Coordinadora de operaciones" />
                </Field>
                <Field label="Empresa">
                  <TextInput value={item.company} onChange={(e) => editPath(`experience.${i}.company`, e.target.value)} placeholder="Distribuidora Andina" />
                </Field>
              </div>
              <Button size="sm" variant="danger" onClick={() => remove('experience', item.id)} aria-label="Eliminar cargo">
                <Trash2 size={14} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Desde">
                <TextInput value={item.start} onChange={(e) => editPath(`experience.${i}.start`, e.target.value)} placeholder="Mar 2022" />
              </Field>
              <Field label="Hasta">
                <TextInput
                  value={item.end}
                  disabled={item.current}
                  onChange={(e) => editPath(`experience.${i}.end`, e.target.value)}
                  placeholder="Feb 2024"
                />
              </Field>
            </div>

            <Toggle
              label="Sigo en este cargo"
              checked={item.current}
              onChange={(checked) => editPath(`experience.${i}.current`, checked)}
            />

            <Field label="Logros" hint="Una línea por logro">
              <TextArea
                rows={4}
                value={item.bullets.join('\n')}
                placeholder={'Rediseñé el ruteo de 14 vehículos y bajé el costo por envío un 18 %.'}
                onChange={(e) =>
                  edit((draft) => {
                    draft.data.experience[i].bullets = e.target.value.split('\n')
                  })
                }
              />
            </Field>

            <BulletAssistant item={item} index={i} />
          </div>
        )}
      />
    </PanelFrame>
  )
}
