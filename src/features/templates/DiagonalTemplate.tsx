import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, Chip, ContactText, LevelBar, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import type { TemplateProps } from './types'

/**
 * Diagonal: encabezado cortado en angulo.
 *
 * El corte se hace con clip-path sobre una capa de fondo, no deformando el
 * texto: la diagonal es decorado y el contenido sigue en horizontal, que es
 * lo unico que un lector agradece.
 */
export default function DiagonalTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div style={{ minHeight: '297mm' }}>
      <header style={{ position: 'relative', padding: 'var(--cv-pad)', paddingBottom: 'calc(var(--cv-pad) * 1.5)', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--cv-surface)',
            clipPath: 'polygon(0 0, 100% 0, 100% 74%, 0 100%)',
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          }}
          aria-hidden
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--cv-accent)',
            clipPath: 'polygon(0 100%, 100% 74%, 100% 78%, 0 104%)',
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          }}
          aria-hidden
        />

        <div style={{ position: 'relative', display: 'flex', gap: 'var(--cv-gap)', alignItems: 'center', color: 'var(--cv-surface-text)' }}>
          {design.showPhoto && <Photo personal={personal} design={design} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
              style={{ fontSize: '2.5em', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em' }} />
            <Editable path="personal.headline" placeholder="Cargo o especialidad"
              style={{ display: 'block', marginTop: 4, color: 'var(--cv-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.95em', fontWeight: 600 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 9, fontSize: '0.92em' }}>
              {contacts.map((entry) => (
                <ContactText key={entry.key} entry={entry} />
              ))}
              {links.length > 0 && <Links links={links} tone="surface" />}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 var(--cv-pad) var(--cv-pad)' }}>
        <Section first id="perfil" label="Perfil">
          <SectionTitle>Perfil</SectionTitle>
          <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 'var(--cv-gap)' }}>
          <div>
            {experience.length > 0 && (
              <Section id="experiencia" label="Experiencia">
                <SectionTitle>Experiencia</SectionTitle>
                {experience.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.06em' }} />
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
                <SectionTitle>Formación</SectionTitle>
                {education.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                    <div style={{ fontSize: '0.9em', color: 'var(--cv-primary)' }}>
                      <Editable path={`education.${i}.institution`} placeholder="Institución" />
                      <span> · {dateRange(item.start, item.end, false)}</span>
                    </div>
                  </article>
                ))}
              </Section>
            )}
          </div>

          <div>
            {skills.length > 0 && (
              <Section id="competencias" label="Competencias">
                <SectionTitle>Competencias</SectionTitle>
                {skills.map((skill, i) => (
                  <div key={skill.id} data-line style={{ marginBottom: 5 }}>
                    <Editable path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block', fontSize: '0.95em' }} />
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

            {references.length > 0 && (
              <Section id="referencias" label="Referencias">
                <SectionTitle>Referencias</SectionTitle>
                {references.map((ref, i) => (
                  <div key={ref.id} data-line style={{ marginBottom: 6, fontSize: '0.93em' }}>
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
