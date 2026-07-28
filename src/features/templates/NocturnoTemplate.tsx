import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, LevelBar, Links, Photo, Section, contactEntries, visibleLinks, blockLabel, ContactText } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/**
 * Hoja completa en color oscuro, para perfiles de diseno y tecnologia.
 * Nota de impresion: hay que activar "graficos de fondo" en el dialogo del
 * navegador, o el fondo saldra en blanco. El aviso vive en el panel de diseno.
 */
export default function NocturnoTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references , custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const label = (text: string) => (
    <div
      style={{
        fontFamily: 'var(--cv-font-heading)',
        fontSize: '0.8em',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: 'var(--cv-accent)',
        marginBottom: 'var(--cv-gap-sm)',
      }}
    >
      {text}
    </div>
  )

  return (
    <div
      style={{
        background: 'var(--cv-surface)',
        color: 'var(--cv-surface-text)',
        minHeight: '297mm',
        padding: 'var(--cv-pad)',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <header style={{ display: 'flex', gap: 'var(--cv-gap)', alignItems: 'flex-end', paddingBottom: 'var(--cv-gap)', borderBottom: '1px solid rgba(255,255,255,.18)' }}>
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1 }}>
          <Editable
            path="personal.fullName"
            as="h1"
            placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.6em * var(--cv-name-scale, 1))', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}
          />
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{ display: 'block', marginTop: 6, color: 'var(--cv-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.95em' }}
          />
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.9em', opacity: 0.9, lineHeight: 1.7 }}>
          {contacts.map((entry) => (
            <div key={entry.key}><ContactText entry={entry} /></div>
          ))}
          {links.length > 0 && (
            <div>
              <Links links={links} tone="surface" separator=" " />
            </div>
          )}
        </div>
      </header>

      <OrderedSections design={design} custom={custom} customIds={[]}>
<Section id="perfil" label="Perfil">
        {label('Perfil')}
        <Editable path="summary" multiline placeholder="Describe tu enfoque de trabajo." style={{ display: 'block', opacity: 0.92 }} />
      </Section>
</OrderedSections>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 'var(--cv-gap)', marginTop: 'var(--cv-gap)' }}>
        <div>
          <OrderedSections design={design} custom={custom} customIds={[]}>
{experience.length > 0 && (
            <Section first id="experiencia" label="Experiencia">
              {label('Experiencia')}
              {experience.map((item, i) => (
                <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                  <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.08em' }} />
                  <div style={{ fontSize: '0.9em', opacity: 0.75 }}>
                    <Editable path={`experience.${i}.company`} placeholder="Empresa" />
                    <span> — {dateRange(item.start, item.end, item.current)}</span>
                  </div>
                  <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
                </article>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="formacion" label="Formación">
              {label('Formación')}
              {education.map((item, i) => (
                <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                  <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                  <div style={{ fontSize: '0.9em', opacity: 0.75 }}>
                    <Editable path={`education.${i}.institution`} placeholder="Institución" />
                    <span> — {dateRange(item.start, item.end, false)}</span>
                  </div>
                </article>
              ))}
            </Section>
)}
          </OrderedSections>
        </div>

        <div>
            <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
          {tools.length > 0 && (
<Section first id="herramientas" label="Stack">
              {label('Stack')}
              {tools.map((tool, i) => (
                <div key={tool.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92em', marginBottom: 3 }}>
                    <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                    {design.showToolLevels && (
                      <span style={{ opacity: 0.55, fontFamily: 'monospace', fontSize: '0.85em' }}>{tool.level}</span>
                    )}
                  </div>
                  {design.showToolLevels && <LevelBar level={tool.level} tone="surface" />}
                </div>
              ))}
            </Section>
          )}

          {skills.length > 0 && (
            <Section id="competencias" label="Competencias">
              {label('Competencias')}
              {skills.map((skill, i) => (
                <div key={skill.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: '0.92em', marginBottom: 3 }}>
                    <Editable path={`skills.${i}.name`} placeholder="Competencia" />
                  </div>
                  {design.showSkillLevels && <LevelBar level={skill.level} tone="surface" />}
                </div>
              ))}
            </Section>
          )}

          {references.length > 0 && (
            <Section id="referencias" label="Referencias">
              {label('Referencias')}
              {references.map((ref, i) => (
                <div key={ref.id} data-line style={{ marginBottom: 7, fontSize: '0.92em' }}>
                  <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                  <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.7 }} />
                  <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-accent)' }} />
                </div>
              ))}
            </Section>
)}
          </OrderedSections>
        </div>
      </div>
    </div>
  )
}
