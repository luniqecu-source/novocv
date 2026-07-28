import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, ContactRow, LevelBar, Links, Photo, Section, SectionTitle, contactEntries, visibleLinks, blockLabel } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/** Barra lateral en color solido. El formato mas legible para filtros ATS. */
export default function ColumnaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references , custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)
  const personales = references.filter((r) => r.kind === 'personal')
  const profesionales = references.filter((r) => r.kind === 'profesional')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '34% 1fr', minHeight: '297mm' }}>
      <aside
        style={{
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          padding: 'var(--cv-pad)',
        }}
      >
        {design.showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--cv-gap)' }}>
            <Photo personal={personal} design={design} />
          </div>
        )}

        <OrderedSections design={design} custom={custom} customIds={[]}>
<Section first id="contacto" label="Contacto">
          <SectionTitle tone="surface">Contacto</SectionTitle>
          {contacts.map((entry) => (
            <ContactRow
              key={entry.key}
              icon={<entry.icon size={11} />}
              path={entry.path}
              placeholder={entry.placeholder}
              tone="surface"
            />
          ))}
          {links.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <Links links={links} tone="surface" separator=" " />
            </div>
          )}
        </Section>

        {tools.length > 0 && (
          <Section id="herramientas" label="Herramientas">
            <SectionTitle tone="surface">Herramientas</SectionTitle>
            {tools.map((tool, i) => (
              <div key={tool.id} style={{ marginBottom: 7 }}>
                <Editable
                  path={`tools.${i}.name`}
                  placeholder="Herramienta"
                  style={{ display: 'block', marginBottom: 3 }}
                />
                {design.showToolLevels && <LevelBar level={tool.level} tone="surface" />}
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section id="competencias" label="Competencias">
            <SectionTitle tone="surface">Competencias</SectionTitle>
            {skills.map((skill, i) => (
              <div key={skill.id} style={{ marginBottom: 7 }}>
                <Editable
                  path={`skills.${i}.name`}
                  placeholder="Competencia"
                  style={{ display: 'block', marginBottom: 3 }}
                />
                {design.showSkillLevels && <LevelBar level={skill.level} tone="surface" />}
              </div>
            ))}
          </Section>
        )}

        {personales.length > 0 && (
          <Section id="referencias-personales" label="Referencias personales">
            <SectionTitle tone="surface">Referencias personales</SectionTitle>
            {personales.map((ref) => {
              const i = references.indexOf(ref)
              return (
                <div key={ref.id} data-line style={{ marginBottom: 6 }}>
                  <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 600, display: 'block' }} />
                  <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ opacity: 0.8, display: 'block' }} />
                  <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ opacity: 0.8 }} />
                </div>
              )
            })}
          </Section>
)}
        </OrderedSections>
      </aside>

      <main style={{ padding: 'var(--cv-pad)' }}>
        <header style={{ marginBottom: 'var(--cv-gap)' }}>
          <Editable
            path="personal.fullName"
            as="h1"
            placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.15em * var(--cv-name-scale, 1))', lineHeight: 1.05, fontWeight: 800, color: 'var(--cv-surface)' }}
          />
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{
              display: 'block',
              marginTop: 4,
              fontSize: '1.15em',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--cv-primary)',
              fontWeight: 600,
            }}
          />
        </header>

        <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
<Section first id="perfil" label="Perfil">
          <SectionTitle>Perfil profesional</SectionTitle>
          <Editable path="summary" multiline placeholder="Dos o tres frases sobre lo que haces y el resultado que dejas." />
        </Section>

        {experience.length > 0 && (
          <Section id="experiencia" label="Experiencia">
            <SectionTitle>Experiencia</SectionTitle>
            {experience.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <Editable path={`experience.${i}.role`} placeholder="Cargo" style={{ fontWeight: 700, color: 'var(--cv-surface)' }} />
                  <span style={{ fontSize: '0.88em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {dateRange(item.start, item.end, item.current)}
                  </span>
                </div>
                <div style={{ fontStyle: 'italic', opacity: 0.85 }}>
                  <Editable path={`experience.${i}.company`} placeholder="Empresa" />
                  {item.location && <span> · </span>}
                  <Editable path={`experience.${i}.location`} placeholder="" />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <Editable path={`education.${i}.degree`} placeholder="Título" style={{ fontWeight: 700, color: 'var(--cv-surface)' }} />
                  <span style={{ fontSize: '0.88em', color: 'var(--cv-primary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {dateRange(item.start, item.end, false)}
                  </span>
                </div>
                <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ fontStyle: 'italic', opacity: 0.85, display: 'block' }} />
                <Editable path={`education.${i}.note`} placeholder="" multiline style={{ display: 'block', opacity: 0.8 }} />
              </article>
            ))}
          </Section>
        )}

        {profesionales.length > 0 && (
          <Section id="referencias-profesionales" label="Referencias profesionales">
            <SectionTitle>Referencias profesionales</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap-sm)' }}>
              {profesionales.map((ref) => {
                const i = references.indexOf(ref)
                return (
                  <div key={ref.id} data-line>
                    <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                    <Editable path={`references.${i}.relation`} placeholder="Cargo" style={{ display: 'block', opacity: 0.85 }} />
                    <Editable path={`references.${i}.company`} placeholder="Empresa" style={{ display: 'block', opacity: 0.85 }} />
                    <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
                  </div>
                )
              })}
            </div>
          </Section>
)}
        </OrderedSections>
      </main>
    </div>
  )
}
