import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Links, Section, SectionTitle, contactEntries, visibleLinks, blockLabel, ContactText, Photo } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/**
 * Sin bloques de color ni graficos. Tipografia y espacio hacen todo el trabajo.
 * Es la version que mejor sobrevive a la lectura automatica y a la fotocopia.
 */
export default function SobrioTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references, custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ padding: 'calc(var(--cv-pad) * 1.15)' }}>
      <header style={{ textAlign: 'center', paddingBottom: 'var(--cv-gap)', borderBottom: '2px solid var(--cv-primary)' }}>
        {design.showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--cv-gap-sm)' }}>
            <Photo personal={personal} design={design} />
          </div>
        )}
        <Editable
          path="personal.fullName"
          as="h1"
          placeholder="Tu nombre"
          style={{ fontSize: 'calc(2.4em * var(--cv-name-scale, 1))', fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1.1 }}
        />
        <Editable
          path="personal.headline"
          placeholder="Cargo o especialidad"
          style={{
            display: 'block',
            marginTop: 4,
            fontSize: '1.08em',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--cv-primary)',
          }}
        />
        <div style={{ marginTop: 9, fontSize: '0.94em', opacity: 0.85 }}>
          {contacts.map((entry, i) => (
            <span key={entry.key}>
              {i > 0 && <span style={{ margin: '0 8px', color: 'var(--cv-accent)' }}>|</span>}
              <ContactText entry={entry} />
            </span>
          ))}
        </div>
        {links.length > 0 && (
          <div style={{ marginTop: 3, fontSize: '0.92em' }}>
            <Links links={links} />
          </div>
        )}
      </header>

      <OrderedSections design={design} custom={custom}>
<Section id="perfil" label="Perfil">
        <SectionTitle rule={false}>Perfil</SectionTitle>
        <Editable path="summary" multiline placeholder="Escribe tu resumen profesional." />
      </Section>

      {experience.length > 0 && (
        <Section id="experiencia" label="Experiencia">
          <SectionTitle rule={false}>Experiencia</SectionTitle>
          {experience.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)', display: 'grid', gridTemplateColumns: '22% 1fr', gap: 12 }}>
              <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)', fontWeight: 600, paddingTop: 1 }}>
                {dateRange(item.start, item.end, item.current)}
              </div>
              <div>
                <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700 }} />
                <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', fontStyle: 'italic', opacity: 0.85 }} />
                <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
              </div>
            </article>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section id="formacion" label="Formación">
          <SectionTitle rule={false}>Formación</SectionTitle>
          {education.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)', display: 'grid', gridTemplateColumns: '22% 1fr', gap: 12 }}>
              <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)', fontWeight: 600, paddingTop: 1 }}>
                {dateRange(item.start, item.end, false)}
              </div>
              <div>
                <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', fontStyle: 'italic', opacity: 0.85 }} />
                <Editable path={`education.${i}.note`} multiline placeholder="" style={{ display: 'block', opacity: 0.8 }} />
              </div>
            </article>
          ))}
        </Section>
      )}

      {(skills.length > 0 || tools.length > 0) && (
        <Section id="competencias" label="Competencias y herramientas">
          <SectionTitle rule={false}>Competencias y herramientas</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px' }}>
            {skills.map((skill, i) => (
              <div key={skill.id}>
                <span style={{ color: 'var(--cv-accent)', marginRight: 6 }}>—</span>
                <Editable path={`skills.${i}.name`} placeholder="Competencia" />
              </div>
            ))}
            {tools.map((tool, i) => (
              <div key={tool.id}>
                <span style={{ color: 'var(--cv-accent)', marginRight: 6 }}>—</span>
                <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {references.length > 0 && (
        <Section id="referencias" label="Referencias">
          <SectionTitle rule={false}>Referencias</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap-sm) 24px' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700 }} />
                <span style={{ opacity: 0.6, fontSize: '0.85em' }}> ({ref.kind})</span>
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.85 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
              </div>
            ))}
          </div>
        </Section>
)}
      </OrderedSections>
    </div>
  )
}
