import { Editable } from '@/features/canvas/Editable'
import { Bullets, Section, SectionTitle } from './parts'
import type { CustomSection } from '@/types/cv'

/**
 * Seccion personalizada sobre la hoja.
 *
 * Usa las mismas piezas que las secciones fijas (Section, SectionTitle,
 * Bullets), asi que hereda el estilo de la plantilla activa y la paginacion
 * sin nada especial. El titulo y el contenido se editan directamente.
 *
 * Las rutas usan la forma "custom:ID.campo"; el sistema de rutas la traduce
 * a la posicion real dentro del arreglo, de modo que la vista no depende del
 * orden y sobrevive a que se reordenen o borren otras secciones.
 */
export function CustomSectionView({ section, first }: { section: CustomSection; first?: boolean }) {
  return (
    <Section id={`custom:${section.id}`} label={section.title || 'Sección'} first={first}>
      <SectionTitle>
        <Editable path={`custom:${section.id}.title`} placeholder="Título de la sección" />
      </SectionTitle>

      {section.kind === 'texto' ? (
        <Editable
          path={`custom:${section.id}.body`}
          multiline
          placeholder="Escribe el contenido de esta sección."
          style={{ display: 'block' }}
        />
      ) : (
        <Bullets basePath={`custom:${section.id}.items`} bullets={section.items} />
      )}
    </Section>
  )
}
