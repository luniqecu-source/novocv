import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, ContactText, LevelBar, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import { OrderedSections } from './OrderedSections'
import type { TemplateProps } from './types'

/**
 * Esquinas: banda lateral oscura con triangulos de acento en las esquinas.
 *
 * Los triangulos se hacen con clip-path sobre capas de color, no con imagenes:
 * el patron sobrevive a la impresion y escala sin perder nitidez. La foto se
 * monta sobre la banda, cruzando el borde con la columna clara.
 */
export default function EsquinasTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references, custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const corner = (pos: 'tl' | 'br', color: string) => (
    <div
      style={{
        position: 'absolute',
        width: 90,
        height: 90,
        background: color,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        ...(pos === 'tl'
          ? { top: 0, left: 0, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }
          : { bottom: 0, right: 0, clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }),
      }}
      aria-hidden
    />
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '35% 1fr', minHeight: '297mm' }}>
      <aside
        style={{
          position: 'relative',
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          padding: 'var(--cv-pad)',
          overflow: 'hidden',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {corner('tl', 'var(--cv-accent)')}
        {corner('br', 'var(--cv-primary)')}

        {design.showPhoto && (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 'var(--cv-gap)' }}>
            <Photo personal={personal} design={design} />
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <OrderedSections design={design} custom={custom} customIds={[]}>
            <Section first id="contacto" label="Contacto">
              <SectionTitle tone="surface">Contacto</SectionTitle>
              {contacts.map((entry) => (
                <div key={entry.key} style={{ marginBottom: 3, fontSize: '0.94em' }}>
                  <ContactText entry={entry} />
                </div>
              ))}
              {links.length > 0 && <Links links={links} tone="surface" separator=" " />}
            </Section>

            {skills.length > 0 && (
              <Section id="competencias" label="Competencias">
                <SectionTitle tone="surface">Competencias</SectionTitle>
                {skills.map((skill, i) => (
                  <div key={skill.id} style={{ marginBottom: 6 }}>
                    <Editable path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block', marginBottom: 3, fontSize: '0.95em' }} />
                    {design.showSkillLevels && <LevelBar level={skill.level} tone="surface" />}
                  </div>
                ))}
              </Section>
            )}

            {references.length > 0 && (
              <Section id="referencias" label="Referencias">
                <SectionTitle tone="surface">Referencias</SectionTitle>
                {references.map((ref, i) => (
                  <div key={ref.id} data-line style={{ marginBottom: 6, fontSize: '0.92em' }}>
                    <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                    <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.75 }} />
                    <Editable path={`references.${i}.phone`} placeholder="Teléfono" />
                  </div>
                ))}
              </Section>
            )}
          </OrderedSections>
        </div>
      </aside>

      <main style={{ padding: 'var(--cv-pad)' }}>
        <header style={{ marginBottom: 'var(--cv-gap)' }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.4em * var(--cv-name-scale, 1))', fontWeight: 800, lineHeight: 1.02 }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', marginTop: 4, color: 'var(--cv-primary)', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.98em', fontWeight: 600 }} />
        </header>

        <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
          <Section first id="perfil" label="Perfil">
            <SectionTitle>Sobre mí</SectionTitle>
            <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
          </Section>

          {experience.length > 0 && (
            <Section id="experiencia" label="Experiencia">
              <SectionTitle>Experiencia</SectionTitle>
              {experience.map((item, i) => (
                <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                    <Editable path={`experience.${i}.role`} style={{ fontWeight: 700, fontSize: '1.05em' }} placeholder="Cargo" />
                    <span style={{ fontSize: '0.86em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {dateRange(item.start, item.end, item.current)}
                    </span>
                  </div>
                  <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', fontStyle: 'italic', opacity: 0.8 }} />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                    <Editable path={`education.${i}.degree`} style={{ fontWeight: 700 }} placeholder="Título" />
                    <span style={{ fontSize: '0.86em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {dateRange(item.start, item.end, false)}
                    </span>
                  </div>
                  <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', fontStyle: 'italic', opacity: 0.8 }} />
                </article>
              ))}
            </Section>
          )}

          {tools.length > 0 && (
            <Section id="herramientas" label="Herramientas">
              <SectionTitle>Herramientas</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {tools.map((tool, i) => (
                  <div key={tool.id}>
                    <Editable path={`tools.${i}.name`} placeholder="Herramienta" style={{ display: 'block', fontSize: '0.94em', marginBottom: 2 }} />
                    {design.showToolLevels && <LevelBar level={tool.level} />}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </OrderedSections>
      </main>
    </div>
  )
}
