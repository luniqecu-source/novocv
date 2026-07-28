import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, Chip, ContactText, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import { OrderedSections } from './OrderedSections'
import type { TemplateProps } from './types'

/**
 * Bloques: cada seccion es una tarjeta con su cabecera de color.
 *
 * El sistema modular hace que reordenar se lea muy claro: las tarjetas se
 * apilan y el orden salta a la vista. Las cabeceras usan el color de acento
 * como fondo, asi que dependen de print-color-adjust (ya forzado en la hoja).
 */
export default function BloquesTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references, custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ padding: 'var(--cv-pad)', minHeight: '297mm' }}>
      <header
        style={{
          display: 'flex',
          gap: 'var(--cv-gap)',
          alignItems: 'center',
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          borderRadius: 12,
          padding: 'var(--cv-gap)',
          marginBottom: 'var(--cv-gap)',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.2em * var(--cv-name-scale, 1))', fontWeight: 800, lineHeight: 1.02 }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', marginTop: 3, color: 'var(--cv-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.95em', fontWeight: 600 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 8, fontSize: '0.9em', opacity: 0.9 }}>
            {contacts.map((entry) => (
              <ContactText key={entry.key} entry={entry} />
            ))}
            {links.length > 0 && <Links links={links} tone="surface" />}
          </div>
        </div>
      </header>

      <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
        <Card first id="perfil" label="Perfil">
          <SectionTitle>Perfil</SectionTitle>
          <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
        </Card>

        {experience.length > 0 && (
          <Card id="experiencia" label="Experiencia">
            <SectionTitle>Experiencia</SectionTitle>
            {experience.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <Editable path={`experience.${i}.role`} style={{ fontWeight: 700, fontSize: '1.04em' }} placeholder="Cargo" />
                  <span style={{ fontSize: '0.85em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {dateRange(item.start, item.end, item.current)}
                  </span>
                </div>
                <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', color: 'var(--cv-accent)', fontWeight: 600, fontSize: '0.92em' }} />
                <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
              </article>
            ))}
          </Card>
        )}

        {education.length > 0 && (
          <Card id="formacion" label="Formación">
            <SectionTitle>Formación</SectionTitle>
            {education.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <Editable path={`education.${i}.degree`} style={{ fontWeight: 700 }} placeholder="Título" />
                  <span style={{ fontSize: '0.85em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {dateRange(item.start, item.end, false)}
                  </span>
                </div>
                <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', opacity: 0.8 }} />
              </article>
            ))}
          </Card>
        )}

        {(skills.length > 0 || tools.length > 0) && (
          <Card id="competencias" label="Competencias">
            <SectionTitle>Competencias y herramientas</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((skill, i) => (
                <Chip key={skill.id}>
                  <Editable path={`skills.${i}.name`} placeholder="Competencia" />
                </Chip>
              ))}
              {tools.map((tool, i) => (
                <Chip key={tool.id} tone="surface">
                  <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                </Chip>
              ))}
            </div>
          </Card>
        )}

        {references.length > 0 && (
          <Card id="referencias" label="Referencias">
            <SectionTitle>Referencias</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap-sm)' }}>
              {references.map((ref, i) => (
                <div key={ref.id} data-line style={{ fontSize: '0.92em' }}>
                  <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                  <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.8 }} />
                  <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </OrderedSections>
    </div>
  )
}

/**
 * Tarjeta de seccion. Reenvia id/label/first para que OrderedSections la
 * reconozca igual que a una <Section>, envolviendo el contenido en un panel.
 */
function Card({
  children,
  id,
  label,
  first,
}: {
  children: React.ReactNode
  id?: string
  label?: string
  first?: boolean
}) {
  return (
    <Section id={id} label={label} first={first}>
      <div
        style={{
          border: '1px solid var(--cv-primary-line)',
          borderRadius: 12,
          padding: 'var(--cv-gap)',
          borderTop: '3px solid var(--cv-accent)',
        }}
      >
        {children}
      </div>
    </Section>
  )
}
