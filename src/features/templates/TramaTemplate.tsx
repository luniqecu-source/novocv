import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, Chip, ContactText, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import type { TemplateProps } from './types'

/**
 * Trama: retícula de puntos impresa sobre la banda lateral.
 *
 * El patron se genera con un gradiente radial repetido, no con una imagen:
 * pesa cero, escala a cualquier resolucion y se imprime nitido.
 */
export default function TramaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 31%', minHeight: '297mm' }}>
      <main style={{ padding: 'var(--cv-pad)' }}>
        <header style={{ marginBottom: 'var(--cv-gap)' }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: '2.6em', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1 }} />
          <div style={{ height: 3, width: 54, background: 'var(--cv-accent)', margin: '10px 0' }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', color: 'var(--cv-primary)', fontSize: '1.05em', letterSpacing: '0.16em', textTransform: 'uppercase' }} />
        </header>

        <Section first id="perfil" label="Perfil">
          <SectionTitle rule={false}>Perfil</SectionTitle>
          <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
        </Section>

        {experience.length > 0 && (
          <Section id="experiencia" label="Experiencia">
            <SectionTitle rule={false}>Experiencia</SectionTitle>
            {experience.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id}
                style={{ marginBottom: 'var(--cv-gap-sm)', paddingLeft: 14, borderLeft: '1px solid var(--cv-primary-line)' }}>
                <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 600, fontSize: '1.06em' }} />
                <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)', letterSpacing: '0.05em' }}>
                  <Editable path={`experience.${i}.company`} placeholder="Empresa" />
                  <span> · {dateRange(item.start, item.end, item.current)}</span>
                </div>
                <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
              </article>
            ))}
          </Section>
        )}

        {education.length > 0 && (
          <Section id="formacion" label="Formación">
            <SectionTitle rule={false}>Formación</SectionTitle>
            {education.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id}
                style={{ marginBottom: 'var(--cv-gap-sm)', paddingLeft: 14, borderLeft: '1px solid var(--cv-primary-line)' }}>
                <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 600 }} />
                <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)' }}>
                  <Editable path={`education.${i}.institution`} placeholder="Institución" />
                  <span> · {dateRange(item.start, item.end, false)}</span>
                </div>
              </article>
            ))}
          </Section>
        )}
      </main>

      <aside
        style={{
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          padding: 'var(--cv-pad)',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--cv-accent) 1px, transparent 0)',
          backgroundSize: '12px 12px',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {design.showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--cv-gap)' }}>
            <Photo personal={personal} design={design} />
          </div>
        )}

        <Section first id="contacto" label="Contacto">
          <SectionTitle tone="surface" rule={false}>Contacto</SectionTitle>
          <div style={{ background: 'var(--cv-surface)', padding: '2px 0' }}>
            {contacts.map((entry) => (
              <div key={entry.key} style={{ marginBottom: 3, fontSize: '0.94em' }}>
                <ContactText entry={entry} />
              </div>
            ))}
            {links.length > 0 && <Links links={links} tone="surface" separator=" " />}
          </div>
        </Section>

        {tools.length > 0 && (
          <Section id="herramientas" label="Herramientas">
            <SectionTitle tone="surface" rule={false}>Herramientas</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {tools.map((tool, i) => (
                <Chip key={tool.id} tone="surface">
                  <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                </Chip>
              ))}
            </div>
          </Section>
        )}

        {skills.length > 0 && (
          <Section id="competencias" label="Competencias">
            <SectionTitle tone="surface" rule={false}>Competencias</SectionTitle>
            <div style={{ background: 'var(--cv-surface)' }}>
              {skills.map((skill, i) => (
                <div key={skill.id} style={{ marginBottom: 3, fontSize: '0.94em' }}>
                  <span style={{ color: 'var(--cv-accent)', marginRight: 6 }}>—</span>
                  <Editable path={`skills.${i}.name`} placeholder="Competencia" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {references.length > 0 && (
          <Section id="referencias" label="Referencias">
            <SectionTitle tone="surface" rule={false}>Referencias</SectionTitle>
            {references.map((ref, i) => (
              <div key={ref.id} data-line style={{ marginBottom: 6, fontSize: '0.92em', background: 'var(--cv-surface)' }}>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.75 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" />
              </div>
            ))}
          </Section>
        )}
      </aside>
    </div>
  )
}
