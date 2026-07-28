import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Chip, LevelDots, Links, Photo, Section, SectionTitle, contactEntries, visibleLinks, blockLabel } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/** Franja superior ancha. Gana espacio horizontal para hojas con mucho texto. */
export default function BandaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references , custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  return (
    <div>
      <header
        style={{
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          padding: 'var(--cv-pad)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cv-gap)',
        }}
      >
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Editable
            path="personal.fullName"
            as="h1"
            placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.3em * var(--cv-name-scale, 1))', lineHeight: 1.03, fontWeight: 800 }}
          />
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{
              display: 'block',
              marginTop: 5,
              fontSize: '1.1em',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--cv-accent)',
              fontWeight: 600,
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 10, fontSize: '0.94em' }}>
            {contacts.map((entry) => (
              <span key={entry.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <entry.icon size={11} style={{ color: 'var(--cv-accent)' }} />
                <Editable path={entry.path} placeholder={entry.placeholder} />
              </span>
            ))}
            {links.length > 0 && <Links links={links} tone="surface" />}
          </div>
        </div>
      </header>

      <div style={{ padding: 'var(--cv-pad)' }}>
        <OrderedSections design={design} custom={custom} customIds={[]}>
<Section first id="perfil" label="Perfil">
          <SectionTitle>Perfil profesional</SectionTitle>
          <Editable path="summary" multiline placeholder="Resume tu aporte en dos o tres frases." />
        </Section>
</OrderedSections>

        <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 'var(--cv-gap)' }}>
          <div>
            <OrderedSections design={design} custom={custom} customIds={[]}>
{experience.length > 0 && (
              <Section id="experiencia" label="Experiencia">
                <SectionTitle>Experiencia</SectionTitle>
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
                <SectionTitle>Formación</SectionTitle>
                {education.map((item, i) => (
                  <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                    <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                    <div style={{ fontSize: '0.9em', color: 'var(--cv-primary)', fontWeight: 600 }}>
                      <Editable path={`education.${i}.institution`} placeholder="Institución" />
                      <span> · {dateRange(item.start, item.end, false)}</span>
                    </div>
                    <Editable path={`education.${i}.note`} multiline placeholder="" style={{ display: 'block', opacity: 0.85 }} />
                  </article>
                ))}
              </Section>
)}
            </OrderedSections>
          </div>

          <div>
              <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
            {skills.length > 0 && (
<Section id="competencias" label="Competencias">
                <SectionTitle>Competencias</SectionTitle>
                {skills.map((skill, i) => (
                  <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 5, alignItems: 'center' }}>
                    <Editable path={`skills.${i}.name`} placeholder="Competencia" />
                    {design.showSkillLevels && <LevelDots level={skill.level} />}
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
                  <div key={ref.id} data-line style={{ marginBottom: 6 }}>
                    <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                    <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.85 }} />
                    <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
                  </div>
                ))}
              </Section>
)}

            </OrderedSections>
          </div>
        </div>
      </div>
    </div>
  )
}
