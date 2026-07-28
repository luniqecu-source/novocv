import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import {
  Bullets, ContactText, Links, Photo, Section, SectionTitle,
  blockLabel, contactEntries, visibleLinks,
} from './parts'
import { OrderedSections } from './OrderedSections'
import type { TemplateProps } from './types'

/**
 * Sendero: banda lateral de color y cuerpo con linea de tiempo de puntos.
 *
 * Cada empleo y cada estudio cuelga de un hilo vertical con un nodo. El hilo
 * se dibuja con un pseudo-borde por entrada, no con una linea absoluta unica,
 * para que la paginacion pueda partir la lista sin dejar el hilo colgando.
 */
export default function SenderoTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references, custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const node = (i: number, total: number) => (
    <div style={{ position: 'relative', width: 22, flexShrink: 0 }}>
      <span
        style={{
          position: 'absolute',
          left: 4,
          top: 6,
          width: 11,
          height: 11,
          borderRadius: 99,
          background: 'var(--cv-primary)',
          border: '2px solid #fff',
          boxShadow: '0 0 0 1.5px var(--cv-primary)',
          zIndex: 1,
        }}
      />
      {i < total - 1 && (
        <span style={{ position: 'absolute', left: 9, top: 14, bottom: -14, width: 1.5, background: 'var(--cv-primary-line)' }} />
      )}
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '33% 1fr', minHeight: '297mm' }}>
      <aside
        style={{
          background: 'var(--cv-surface)',
          color: 'var(--cv-surface-text)',
          padding: 'var(--cv-pad)',
          textAlign: 'center',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        {design.showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--cv-gap-sm)' }}>
            <Photo personal={personal} design={design} />
          </div>
        )}

        <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
          style={{ fontSize: 'calc(1.7em * var(--cv-name-scale, 1))', fontWeight: 800, lineHeight: 1.1 }} />
        <Editable path="personal.headline" placeholder="Cargo"
          style={{ display: 'block', marginTop: 3, marginBottom: 'var(--cv-gap)', color: 'var(--cv-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.82em' }} />

        <div style={{ textAlign: 'left' }}>
          <OrderedSections design={design} custom={custom} customIds={[]}>
            <Section first id="perfil" label="Perfil">
              <Editable path="summary" multiline placeholder="Sobre ti." style={{ display: 'block', fontSize: '0.9em', opacity: 0.92, textAlign: 'center' }} />
            </Section>

            <Section id="contacto" label="Contacto">
              <SectionTitle tone="surface" rule={false}>Contacto</SectionTitle>
              <div style={{ textAlign: 'center' }}>
                {contacts.map((entry) => (
                  <div key={entry.key} style={{ marginBottom: 3, fontSize: '0.9em' }}>
                    <ContactText entry={entry} />
                  </div>
                ))}
                {links.length > 0 && <Links links={links} tone="surface" separator=" " />}
              </div>
            </Section>

            {skills.length > 0 && (
              <Section id="competencias" label="Habilidades">
                <SectionTitle tone="surface" rule={false}>Habilidades</SectionTitle>
                <div style={{ textAlign: 'center' }}>
                  {skills.map((skill, i) => (
                    <div key={skill.id} style={{ marginBottom: 3, fontSize: '0.9em' }}>
                      <Editable path={`skills.${i}.name`} placeholder="Habilidad" />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {tools.length > 0 && (
              <Section id="herramientas" label="Herramientas">
                <SectionTitle tone="surface" rule={false}>Herramientas</SectionTitle>
                <div style={{ textAlign: 'center' }}>
                  {tools.map((tool, i) => (
                    <div key={tool.id} style={{ marginBottom: 3, fontSize: '0.9em' }}>
                      <Editable path={`tools.${i}.name`} placeholder="Herramienta" />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </OrderedSections>
        </div>
      </aside>

      <main style={{ padding: 'var(--cv-pad)' }}>
        <OrderedSections design={design} custom={custom} customIds={custom.map((c) => c.id)}>
          {experience.length > 0 && (
            <Section first id="experiencia" label="Empleos">
              <SectionTitle>Empleos</SectionTitle>
              {experience.map((item, i) => (
                <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ display: 'flex', gap: 4, marginBottom: 'var(--cv-gap-sm)' }}>
                  {node(i, experience.length)}
                  <div style={{ flex: 1 }}>
                    <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.02em' }} />
                    <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)', fontWeight: 600 }}>
                      <Editable path={`experience.${i}.company`} placeholder="Empresa" />
                      <span> · {dateRange(item.start, item.end, item.current)}</span>
                    </div>
                    <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
                  </div>
                </article>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="formacion" label="Estudios">
              <SectionTitle>Estudios</SectionTitle>
              {education.map((item, i) => (
                <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ display: 'flex', gap: 4, marginBottom: 'var(--cv-gap-sm)' }}>
                  {node(i, education.length)}
                  <div style={{ flex: 1 }}>
                    <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                    <div style={{ fontSize: '0.88em', color: 'var(--cv-primary)', fontWeight: 600 }}>
                      <Editable path={`education.${i}.institution`} placeholder="Institución" />
                      <span> · {dateRange(item.start, item.end, false)}</span>
                    </div>
                    <Editable path={`education.${i}.note`} multiline placeholder="" style={{ display: 'block', opacity: 0.8, fontSize: '0.9em' }} />
                  </div>
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
  )
}
