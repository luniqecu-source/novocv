import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Chip, LevelRing, Links, Photo, Section, SectionTitle, contactEntries, visibleLinks, blockLabel, ContactText } from './parts'
import type { TemplateProps } from './types'

/**
 * Version visual: cifras grandes arriba, anillos para las cuatro competencias
 * principales y experiencia comprimida.
 *
 * Las cifras se calculan de los datos, no se escriben a mano: si el usuario
 * agrega un cargo, la banda se actualiza sola. Es lo que evita que una hoja
 * infografica termine mintiendo sobre su propio contenido.
 */
export default function InfografiaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const years = countYears(experience)
  const stats = [
    { value: years > 0 ? `${years}+` : '—', label: 'Años de experiencia' },
    { value: String(experience.length), label: experience.length === 1 ? 'Cargo' : 'Cargos' },
    { value: String(tools.length), label: 'Herramientas' },
    { value: String(education.length), label: education.length === 1 ? 'Título' : 'Títulos' },
  ]

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 4)

  return (
    <div style={{ padding: 'var(--cv-pad)' }}>
      <header style={{ display: 'flex', gap: 'var(--cv-gap)', alignItems: 'center' }}>
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1 }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre" style={{ fontSize: '2.25em', fontWeight: 800, lineHeight: 1.03 }} />
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{ display: 'block', color: 'var(--cv-primary)', fontWeight: 600, fontSize: '1.08em', marginTop: 2 }}
          />
          <div style={{ marginTop: 5, fontSize: '0.9em', opacity: 0.85 }}>
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

      {/* Banda de cifras derivadas del propio documento. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--cv-primary-line)',
          border: '1px solid var(--cv-primary-line)',
          borderRadius: 8,
          overflow: 'hidden',
          margin: 'var(--cv-gap) 0',
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: '#fff', padding: 'var(--cv-gap-sm)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--cv-font-heading)', fontSize: '1.9em', fontWeight: 800, color: 'var(--cv-primary)', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.82em', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7, marginTop: 3 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <Section first id="competencias" label="Competencias">
        <SectionTitle>Perfil</SectionTitle>
        <Editable path="summary" multiline placeholder="Resume tu trayectoria." style={{ display: 'block' }} />
      </Section>

      {skills.length > 0 && (
        <Section id="competencias" label="Competencias">
          <SectionTitle>Competencias principales</SectionTitle>
          {design.showSkillLevels ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${topSkills.length}, 1fr)`, gap: 'var(--cv-gap-sm)' }}>
              {topSkills.map((skill) => (
                <LevelRing key={skill.id} level={skill.level} label={skill.name || 'Sin nombre'} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((skill, i) => (
                <Chip key={skill.id}>
                  <Editable path={`skills.${i}.name`} placeholder="Competencia" />
                </Chip>
              ))}
            </div>
          )}
        </Section>
      )}

      {experience.length > 0 && (
        <Section id="experiencia" label="Experiencia">
          <SectionTitle>Experiencia</SectionTitle>
          {experience.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <span>
                  <Editable path={`experience.${i}.role`} style={{ fontWeight: 700, fontSize: '1.05em' }} placeholder="Cargo" />
                  <span style={{ color: 'var(--cv-accent)', margin: '0 6px' }}>·</span>
                  <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ opacity: 0.85 }} />
                </span>
                <span
                  style={{
                    fontSize: '0.82em',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    background: 'var(--cv-primary-soft)',
                    color: 'var(--cv-primary)',
                    padding: '2px 8px',
                    borderRadius: 99,
                  }}
                >
                  {dateRange(item.start, item.end, item.current)}
                </span>
              </div>
              <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
            </article>
          ))}
        </Section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap)' }}>
        {education.length > 0 && (
          <Section id="formacion" label="Formación">
            <SectionTitle>Formación</SectionTitle>
            {education.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                  <Editable path={`education.${i}.institution`} placeholder="Institución" />
                  <span> · {dateRange(item.start, item.end, false)}</span>
                </div>
              </article>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--cv-gap-sm)', fontSize: '0.94em' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.8 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

/**
 * Años de experiencia a partir del primer año que aparezca en los cargos.
 * Deliberadamente conservador: si no hay un año reconocible, devuelve 0 y la
 * banda muestra un guion en vez de inventar una cifra.
 */
function countYears(experience: { start: string; end: string; current: boolean }[]): number {
  const years = experience
    .map((item) => Number(item.start.match(/(19|20)\d{2}/)?.[0]))
    .filter((year) => Number.isFinite(year))

  if (years.length === 0) return 0
  return Math.max(0, new Date().getFullYear() - Math.min(...years))
}
