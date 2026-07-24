import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Chip, LevelBar, Links, Photo, Section, SectionTitle, contactEntries, visibleLinks, blockLabel, ContactText } from './parts'
import type { TemplateProps } from './types'

/**
 * Linea de tiempo continua. La numeracion visual aqui si aporta informacion:
 * la trayectoria se lee como una secuencia, que es justo lo que evalua quien
 * revisa el documento.
 */
export default function CronologiaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ padding: 'var(--cv-pad)' }}>
      <header style={{ display: 'flex', gap: 'var(--cv-gap)', alignItems: 'center', marginBottom: 'var(--cv-gap)' }}>
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1 }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre" style={{ fontSize: '2.2em', fontWeight: 800, lineHeight: 1.05 }} />
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{ display: 'block', color: 'var(--cv-primary)', fontWeight: 600, fontSize: '1.1em', marginTop: 2 }}
          />
          <div style={{ marginTop: 6, fontSize: '0.92em', opacity: 0.85 }}>
            {contacts.map((entry, i) => (
              <span key={entry.key}>
                {i > 0 && <span style={{ color: 'var(--cv-accent)', margin: '0 6px' }}>·</span>}
                <ContactText entry={entry} />
              </span>
            ))}
            {links.length > 0 && <span style={{ color: 'var(--cv-accent)', margin: '0 6px' }}>·</span>}
            <Links links={links} />
          </div>
        </div>
      </header>

      <div
        style={{
          background: 'var(--cv-primary-soft)',
          borderLeft: '3px solid var(--cv-accent)',
          padding: 'var(--cv-gap-sm) var(--cv-gap)',
          marginBottom: 'var(--cv-gap)',
        }}
      >
        <Editable path="summary" multiline placeholder="Resume tu trayectoria." style={{ display: 'block' }} />
      </div>

      <Section first id="experiencia" label="Trayectoria">
        <SectionTitle>Trayectoria</SectionTitle>
        <div style={{ position: 'relative', paddingLeft: 22 }}>
          <span style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: 'var(--cv-primary-line)' }} />
          {experience.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ position: 'relative', marginBottom: 'var(--cv-gap-sm)' }}>
              <span
                style={{
                  position: 'absolute',
                  left: -22,
                  top: 5,
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: 'var(--cv-accent)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px var(--cv-primary-line)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.05em' }} />
                <span style={{ fontSize: '0.85em', fontWeight: 700, color: 'var(--cv-primary)', whiteSpace: 'nowrap' }}>
                  {dateRange(item.start, item.end, item.current)}
                </span>
              </div>
              <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', color: 'var(--cv-accent)', fontWeight: 600 }} />
              <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
            </article>
          ))}

          {education.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ position: 'relative', marginBottom: 'var(--cv-gap-sm)' }}>
              <span
                style={{
                  position: 'absolute',
                  left: -22,
                  top: 5,
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: '#fff',
                  border: '2px solid var(--cv-primary)',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                <span style={{ fontSize: '0.85em', fontWeight: 700, color: 'var(--cv-primary)', whiteSpace: 'nowrap' }}>
                  {dateRange(item.start, item.end, false)}
                </span>
              </div>
              <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', opacity: 0.85, fontStyle: 'italic' }} />
            </article>
          ))}
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap)' }}>
        {skills.length > 0 && (
          <Section id="competencias" label="Competencias">
            <SectionTitle>Competencias</SectionTitle>
            {skills.map((skill, i) => (
              <div key={skill.id} style={{ marginBottom: 6 }}>
                <Editable path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block', marginBottom: 3, fontSize: '0.95em' }} />
                {design.showSkillLevels && <LevelBar level={skill.level} />}
              </div>
            ))}
          </Section>
        )}
        {tools.length > 0 && (
          <Section id="herramientas" label="Herramientas">
            <SectionTitle>Herramientas</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {tools.map((tool, i) => (
                <Chip key={tool.id}>
                  <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                </Chip>
              ))}
            </div>
          </Section>
        )}
      </div>

      {references.length > 0 && (
        <Section id="referencias" label="Referencias">
          <SectionTitle>Referencias</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--cv-gap-sm)' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line style={{ fontSize: '0.94em' }}>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.85 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
