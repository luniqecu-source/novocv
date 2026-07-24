import { useRef } from 'react'
import { Camera, Trash2, Plus, Link2 } from 'lucide-react'
import { useCv, selectData } from '@/store/cvStore'
import { useUi } from '@/store/uiStore'
import { Field, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { PanelFrame } from './PanelFrame'

export function PersonalPanel() {
  const personal = useCv((s) => selectData(s).personal)
  const editPath = useCv((s) => s.editPath)
  const addLink = useCv((s) => s.addLink)
  const removeLink = useCv((s) => s.removeLink)
  const notify = useUi((s) => s.notify)
  const fileRef = useRef<HTMLInputElement>(null)

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 2_500_000) {
      notify('La foto supera 2,5 MB. Usa una versión más liviana.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      editPath('personal.photo', reader.result as string)
      notify('Foto actualizada', 'ok')
    }
    reader.readAsDataURL(file)
  }

  return (
    <PanelFrame title="Datos personales" hint="También puedes escribir directamente sobre la hoja.">
      <div className="flex items-center gap-3">
        {personal.photo ? (
          <img src={personal.photo} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-saffron/60" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-edge text-muted">
            <Camera size={16} />
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            {personal.photo ? 'Cambiar' : 'Subir foto'}
          </Button>
          {personal.photo && (
            <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => editPath('personal.photo', null)}>
              Quitar
            </Button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPhoto(e.target.files?.[0])}
        />
      </div>

      {(
        [
          ['fullName', 'Nombre completo', 'Valentina Ocampo Ríos'],
          ['headline', 'Cargo o especialidad', 'Analista de operaciones'],
          ['phone', 'Teléfono', '+593 99 123 4567'],
          ['email', 'Correo', 'nombre@correo.com'],
          ['location', 'Ciudad', 'Cuenca, Ecuador'],
          ['documentId', 'Documento de identidad', '0102345678'],
          ['license', 'Licencia de conducir', 'Tipo B'],
        ] as const
      ).map(([key, label, placeholder]) => (
        <Field key={key} label={label}>
          <TextInput
            value={personal[key] ?? ''}
            placeholder={placeholder}
            onChange={(e) => editPath(`personal.${key}`, e.target.value)}
          />
        </Field>
      ))}

      <div className="border-t border-edge pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <Link2 size={12} /> Enlaces
          </span>
          <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={addLink}>
            Añadir
          </Button>
        </div>

        {personal.links.length === 0 ? (
          <p className="rounded-lg border border-dashed border-edge px-3 py-3 text-center text-[12px] text-muted">
            LinkedIn, portafolio o repositorio.
          </p>
        ) : (
          <div className="space-y-2">
            {personal.links.map((link, i) => (
              <div key={link.id} className="flex items-center gap-2">
                <TextInput
                  className="w-24 shrink-0"
                  value={link.label}
                  placeholder="LinkedIn"
                  onChange={(e) => editPath(`personal.links.${i}.label`, e.target.value)}
                />
                <TextInput
                  value={link.url}
                  placeholder="linkedin.com/in/usuario"
                  onChange={(e) => editPath(`personal.links.${i}.url`, e.target.value)}
                />
                <Button size="sm" variant="danger" onClick={() => removeLink(link.id)} aria-label="Eliminar enlace">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelFrame>
  )
}
