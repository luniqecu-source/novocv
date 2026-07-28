import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, Links, MarginLabel, contactEntries, visibleLinks, blockLabel, ContactText, Photo } from './parts'
import type { TemplateProps } from './types'

/**
 * Reticula editorial: columna de etiquetas a la izquierda, contenido a la
 * derecha, filetes de un cuarto de punto y un unico acento de color.
 *
 * Sin bloques rellenos ni graficos, asi que imprime identico en cualquier
 * impresora y sobrevive al blanco y negro.
 */
export default function SuizaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const row = {
    display: 'grid',
    gridTemplateColumns: '23% 1fr',
    gap: 'var(--cv-gap)',
    paddingTop: 'var(--cv-gap-sm)',
    marginTop: 'var(--cv-gap-sm)',
    borderTop: '0.5px solid var(--cv-primary-line)',
  } as const

  return (
    <div style={{ padding: 'calc(var(--cv-pad) * 1.1)' }}>
      <header style={{ paddingBottom: 'var(--cv-gap)', display: 'flex', alignItems: 'flex-end', gap: 'var(--cv-gap)' }}>
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1, minWidth: 0 }}>
        <Editable
          path="personal.fullName"
          as="h1"
          placeholder="Tu nombre"
          style={{ fontSize: 'calc(3.1em * var(--cv-name-scale, 1))', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.95 }}
        />
        <div style={{ ...row, alignItems: 'baseline', borderTop: '2px solid var(--cv-primary)', marginTop: 'var(--cv-gap-sm)' }}>
          <MarginLabel>Perfil</MarginLabel>
          <Editable
            path="personal.headline"
            placeholder="Cargo o especialidad"
            style={{ fontSize: '1.2em', fontWeight: 600, color: 'var(--cv-primary)' }}
          />
        </div>
        </div>
      </header>

      <div data-group data-block-id="contacto" data-block-label="Contacto" style={row}>
        <MarginLabel>Contacto</MarginLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 20px' }}>
          {contacts.map((entry) => (
            <ContactText key={entry.key} entry={entry} />
          ))}
          {links.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Links links={links} />
            </div>
          )}
        </div>
      </div>

      <div data-group data-block-id="perfil" data-block-label="Resumen" style={row}>
        <MarginLabel>Resumen</MarginLabel>
        <Editable path="summary" multiline placeholder="Dos o tres frases sobre tu aporte." style={{ display: 'block' }} />
      </div>

      {experience.length > 0 && (
        <div data-group data-block-id="experiencia" data-block-label="Experiencia" style={row}>
          <MarginLabel>Experiencia</MarginLabel>
          <div>
            {experience.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <Editable path={`experience.${i}.role`} style={{ fontWeight: 700, fontSize: '1.08em' }} placeholder="Cargo" />
                  <span style={{ fontFamily: 'var(--cv-font-heading)', fontSize: '0.85em', letterSpacing: '0.06em', whiteSpace: 'nowrap', opacity: 0.75 }}>
                    {dateRange(item.start, item.end, item.current)}
                  </span>
                </div>
                <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', color: 'var(--cv-primary)', fontWeight: 600 }} />
                <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
              </article>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div data-group data-block-id="formacion" data-block-label="Formación" style={row}>
          <MarginLabel>Formación</MarginLabel>
          <div>
            {education.map((item, i) => (
              <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <Editable path={`education.${i}.degree`} style={{ fontWeight: 700 }} placeholder="Título" />
                  <span style={{ fontFamily: 'var(--cv-font-heading)', fontSize: '0.85em', letterSpacing: '0.06em', whiteSpace: 'nowrap', opacity: 0.75 }}>
                    {dateRange(item.start, item.end, false)}
                  </span>
                </div>
                <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', color: 'var(--cv-primary)', fontWeight: 600 }} />
                <Editable path={`education.${i}.note`} multiline placeholder="" style={{ display: 'block', opacity: 0.8 }} />
              </article>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div data-group data-block-id="competencias" data-block-label="Competencias" style={row}>
          <MarginLabel>Competencias</MarginLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 20px' }}>
            {skills.map((skill, i) => (
              <Editable key={skill.id} path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block' }} />
            ))}
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <div data-group data-block-id="herramientas" data-block-label="Herramientas" style={row}>
          <MarginLabel>Herramientas</MarginLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 20px' }}>
            {tools.map((tool, i) => (
              <Editable key={tool.id} path={`tools.${i}.name`} placeholder="Herramienta" style={{ display: 'block' }} />
            ))}
          </div>
        </div>
      )}

      {references.length > 0 && (
        <div data-group data-block-id="referencias" data-block-label="Referencias" style={row}>
          <MarginLabel>Referencias</MarginLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap-sm) 20px' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.8 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
