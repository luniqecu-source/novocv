import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, ContactText, Links, Photo, Section, blockLabel, contactEntries, visibleLinks } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/**
 * Reticula: secciones numeradas sobre una malla modular visible.
 *
 * Las cifras no son decorativas. Dan al lector un indice implicito del
 * documento, que es exactamente lo que hace un revisor al ojear una hoja.
 */
export default function ReticulaTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references , custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const numero = (n: string, texto: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 'var(--cv-gap-sm)' }}>
      <span style={{ fontFamily: 'var(--cv-font-heading)', fontSize: '0.82em', color: 'var(--cv-accent)', fontWeight: 700 }}>{n}</span>
      <span style={{ fontFamily: 'var(--cv-font-heading)', fontSize: '0.94em', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
        {texto}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--cv-primary-line)' }} />
    </div>
  )

  return (
    <div
      style={{
        padding: 'var(--cv-pad)',
        minHeight: '297mm',
        backgroundImage:
          'linear-gradient(to right, var(--cv-primary-soft) 1px, transparent 1px)',
        backgroundSize: '25% 100%',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <header style={{ display: 'flex', gap: 'var(--cv-gap)', alignItems: 'center', paddingBottom: 'var(--cv-gap)', borderBottom: '2px solid var(--cv-primary)' }}>
        {design.showPhoto && <Photo personal={personal} design={design} />}
        <div style={{ flex: 1 }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: 'calc(2.5em * var(--cv-name-scale, 1))', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', marginTop: 4, color: 'var(--cv-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.95em' }} />
        </div>
      </header>

      <OrderedSections design={design} custom={custom}>
<Section first id="contacto" label="Contacto">
        {numero('01', 'Contacto')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 16px', fontSize: '0.94em' }}>
          {contacts.map((entry) => (
            <ContactText key={entry.key} entry={entry} />
          ))}
          {links.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Links links={links} />
            </div>
          )}
        </div>
      </Section>

      <Section id="perfil" label="Perfil">
        {numero('02', 'Perfil')}
        <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
      </Section>

      {experience.length > 0 && (
        <Section id="experiencia" label="Experiencia">
          {numero('03', 'Experiencia')}
          {experience.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id}
              style={{ display: 'grid', gridTemplateColumns: '25% 1fr', gap: 12, marginBottom: 'var(--cv-gap-sm)' }}>
              <div style={{ fontSize: '0.85em', fontFamily: 'var(--cv-font-heading)', color: 'var(--cv-primary)', letterSpacing: '0.04em' }}>
                {dateRange(item.start, item.end, item.current)}
              </div>
              <div>
                <Editable path={`experience.${i}.role`} as="h3" placeholder="Cargo" style={{ fontWeight: 700 }} />
                <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', color: 'var(--cv-accent)', fontWeight: 600, fontSize: '0.92em' }} />
                <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
              </div>
            </article>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section id="formacion" label="Formación">
          {numero('04', 'Formación')}
          {education.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id}
              style={{ display: 'grid', gridTemplateColumns: '25% 1fr', gap: 12, marginBottom: 'var(--cv-gap-sm)' }}>
              <div style={{ fontSize: '0.85em', fontFamily: 'var(--cv-font-heading)', color: 'var(--cv-primary)' }}>
                {dateRange(item.start, item.end, false)}
              </div>
              <div>
                <Editable path={`education.${i}.degree`} as="h3" placeholder="Título" style={{ fontWeight: 700 }} />
                <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', color: 'var(--cv-accent)', fontSize: '0.92em' }} />
              </div>
            </article>
          ))}
        </Section>
      )}

      {(skills.length > 0 || tools.length > 0) && (
        <Section id="competencias" label="Competencias">
          {numero('05', 'Competencias')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 16px', fontSize: '0.95em' }}>
            {skills.map((skill, i) => (
              <Editable key={skill.id} path={`skills.${i}.name`} placeholder="Competencia" style={{ display: 'block' }} />
            ))}
            {tools.map((tool, i) => (
              <Editable key={tool.id} path={`tools.${i}.name`} placeholder="Herramienta" style={{ display: 'block', color: 'var(--cv-primary)' }} />
            ))}
          </div>
        </Section>
      )}

      {references.length > 0 && (
        <Section id="referencias" label="Referencias">
          {numero('06', 'Referencias')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--cv-gap-sm) 16px', fontSize: '0.93em' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.75 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-primary)' }} />
              </div>
            ))}
          </div>
        </Section>
)}
      </OrderedSections>
    </div>
  )
}
