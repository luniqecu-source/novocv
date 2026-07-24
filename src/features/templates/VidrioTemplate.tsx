import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Chip, LevelBar, Links, Photo, Section, SectionTitle, contactEntries, visibleLinks, blockLabel } from './parts'
import type { TemplateProps } from './types'

/**
 * Tarjetas blancas superpuestas sobre una banda de color a media hoja.
 * El bloque del nombre cruza el limite entre ambas zonas: es lo que da la
 * sensacion de capas sin recurrir a transparencias, que al imprimir se pierden.
 */
export default function VidrioTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const card = {
    background: '#ffffff',
    borderRadius: 10,
    padding: 'var(--cv-gap)',
    boxShadow: '0 1px 3px rgba(15,23,42,.13)',
  } as const

  return (
    <div style={{ position: 'relative', minHeight: '297mm' }}>
      {/* Banda de color: ocupa el tercio superior y sirve de fondo al encabezado. */}
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: '38%',
          background: 'var(--cv-surface)',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
        aria-hidden
      />

      <div style={{ position: 'relative', padding: 'var(--cv-pad)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--cv-gap)', color: 'var(--cv-surface-text)', marginBottom: 'var(--cv-gap)' }}>
          {design.showPhoto && <Photo personal={personal} design={design} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Editable path="personal.fullName" as="h1" placeholder="Tu nombre" style={{ fontSize: '2.3em', fontWeight: 800, lineHeight: 1.02 }} />
            <Editable
              path="personal.headline"
              placeholder="Cargo o especialidad"
              style={{ display: 'block', marginTop: 4, color: 'var(--cv-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.98em', fontWeight: 600 }}
            />
          </div>
        </header>

        {/* Tarjeta de contacto: cruza el borde de la banda de color. */}
        <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--cv-gap-sm)', fontSize: '0.94em', marginBottom: 'var(--cv-gap)' }}>
          {contacts.map((entry) => (
            <LabelValue key={entry.key} label={entry.label} path={entry.path} placeholder={entry.placeholder} />
          ))}
          {links.length > 0 && (
            <div>
              <div style={{ fontSize: '0.82em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cv-primary)', marginBottom: 1 }}>
                Enlaces
              </div>
              <Links links={links} />
            </div>
          )}
        </div>

        <div style={{ ...card, marginBottom: 'var(--cv-gap)' }}>
          <SectionTitle rule={false}>Perfil</SectionTitle>
          <Editable path="summary" multiline placeholder="Resume tu aporte en dos o tres frases." style={{ display: 'block' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 'var(--cv-gap)', alignItems: 'start' }}>
          <div style={card}>
            {experience.length > 0 && (
              <Section first id="experiencia" label="Experiencia">
                <SectionTitle rule={false}>Experiencia</SectionTitle>
                {experience.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.05em' }} />
                    <div style={{ fontSize: '0.9em', color: 'var(--cv-primary)', fontWeight: 600 }}>
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
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                    <div style={{ fontSize: '0.9em', color: 'var(--cv-primary)', fontWeight: 600 }}>
                      <Editable path={`education.${i}.institution`} placeholder="Institución" />
                      <span> · {dateRange(item.start, item.end, false)}</span>
                    </div>
                  </article>
                ))}
              </Section>
            )}
          </div>

          <div style={card}>
            {skills.length > 0 && (
              <Section first id="competencias" label="Competencias">
                <SectionTitle rule={false}>Competencias</SectionTitle>
                {skills.map((skill, i) => (
                  <div key={skill.id} style={{ marginBottom: 7 }}>
                    <Editable path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block', marginBottom: 3, fontSize: '0.95em' }} />
                    {design.showSkillLevels && <LevelBar level={skill.level} />}
                  </div>
                ))}
              </Section>
            )}

            {tools.length > 0 && (
              <Section id="herramientas" label="Herramientas">
                <SectionTitle rule={false}>Herramientas</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {tools.map((tool, i) => (
                    <Chip key={tool.id}>
                      <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                    </Chip>
                  ))}
                </div>
              </Section>
            )}

            {references.length > 0 && (
              <Section id="referencias" label="Referencias">
                <SectionTitle rule={false}>Referencias</SectionTitle>
                {references.map((ref, i) => (
                  <div key={ref.id} data-line style={{ marginBottom: 6, fontSize: '0.94em' }}>
                    <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                    <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.8 }} />
                    <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
                  </div>
                ))}
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelValue({ label, path, placeholder }: { label: string; path: string; placeholder: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.82em', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cv-primary)', marginBottom: 1 }}>
        {label}
      </div>
      <Editable path={path} placeholder={placeholder} style={{ wordBreak: 'break-word' }} />
    </div>
  )
}
