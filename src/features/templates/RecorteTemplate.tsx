import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, ContactText, LevelBar, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import { OrderedSections } from './OrderedSections'
import type { TemplateProps } from './types'

/**
 * Recorte: cabecera en bloque de color con la foto en esquina biselada.
 *
 * La foto y el bloque comparten un corte diagonal (clip-path) que los engrana,
 * el gesto de la referencia. Debajo, columna unica con barra lateral fina de
 * contacto para que la cabecera respire.
 */
export default function RecorteTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references, custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ minHeight: '297mm' }}>
      <header style={{ display: 'flex', alignItems: 'stretch', minHeight: 190 }}>
        {design.showPhoto && (
          <div
            style={{
              width: '34%',
              flexShrink: 0,
              clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)',
              overflow: 'hidden',
            }}
          >
            {personal.photo ? (
              <img src={personal.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--cv-primary-soft)', display: 'grid', placeItems: 'center' }}>
                <Photo personal={personal} design={design} />
              </div>
            )}
          </div>
        )}

        <div
          style={{
            flex: 1,
            background: 'var(--cv-surface)',
            color: 'var(--cv-surface-text)',
            padding: 'var(--cv-pad)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: design.showPhoto ? -40 : 0,
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          }}
        >
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.5em * var(--cv-name-scale, 1))', fontWeight: 800, lineHeight: 1.02 }} />
          <div style={{ height: 3, width: 60, background: 'var(--cv-accent)', margin: '8px 0' }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', fontSize: '1.02em', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cv-accent)', fontWeight: 600 }} />
          <Editable path="summary" multiline placeholder="Una frase de presentación."
            style={{ display: 'block', marginTop: 10, fontSize: '0.94em', opacity: 0.9 }} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '30% 1fr' }}>
        <aside style={{ padding: 'var(--cv-pad)', borderRight: '2px solid var(--cv-primary-line)' }}>
          <OrderedSections design={design} custom={custom} customIds={[]}>
            <Section first id="contacto" label="Contacto">
              <SectionTitle>Contacto</SectionTitle>
              {contacts.map((entry) => (
                <div key={entry.key} style={{ marginBottom: 3, fontSize: '0.92em' }}>
                  <ContactText entry={entry} />
                </div>
              ))}
              {links.length > 0 && <div style={{ marginTop: 3 }}><Links links={links} /></div>}
            </Section>

            {skills.length > 0 && (
              <Section id="competencias" label="Aptitudes">
                <SectionTitle>Aptitudes</SectionTitle>
                {skills.map((skill, i) => (
                  <div key={skill.id} style={{ marginBottom: 5 }}>
                    <Editable path={`skills.${i}.name`} placeholder="Aptitud" style={{ display: 'block', fontSize: '0.93em', marginBottom: 2 }} />
                    {design.showSkillLevels && <LevelBar level={skill.level} />}
                  </div>
                ))}
              </Section>
            )}

            {tools.length > 0 && (
              <Section id="herramientas" label="Herramientas">
                <SectionTitle>Herramientas</SectionTitle>
                {tools.map((tool, i) => (
                  <div key={tool.id} style={{ marginBottom: 5 }}>
                    <Editable path={`tools.${i}.name`} placeholder="Herramienta" style={{ display: 'block', fontSize: '0.93em', marginBottom: 2 }} />
                    {design.showToolLevels && <LevelBar level={tool.level} />}
                  </div>
                ))}
              </Section>
            )}
          </OrderedSections>
        </aside>

        <main style={{ padding: 'var(--cv-pad)' }}>
          <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
            {education.length > 0 && (
              <Section first id="formacion" label="Formación">
                <SectionTitle>Formación</SectionTitle>
                {education.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                      <Editable path={`education.${i}.degree`} style={{ fontWeight: 700 }} placeholder="Título" />
                      <span style={{ fontSize: '0.86em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {dateRange(item.start, item.end, false)}
                      </span>
                    </div>
                    <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', opacity: 0.8 }} />
                  </article>
                ))}
              </Section>
            )}

            {experience.length > 0 && (
              <Section id="experiencia" label="Experiencia">
                <SectionTitle>Historial laboral</SectionTitle>
                {experience.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                      <Editable path={`experience.${i}.role`} style={{ fontWeight: 700, fontSize: '1.04em' }} placeholder="Cargo" />
                      <span style={{ fontSize: '0.86em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {dateRange(item.start, item.end, item.current)}
                      </span>
                    </div>
                    <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', color: 'var(--cv-accent)', fontWeight: 600, fontSize: '0.92em' }} />
                    <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
                  </article>
                ))}
              </Section>
            )}

            {references.length > 0 && (
              <Section id="referencias" label="Referencias">
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
              </Section>
            )}
          </OrderedSections>
        </main>
      </div>
    </div>
  )
}
