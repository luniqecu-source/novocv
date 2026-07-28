import { Editable } from '@/features/canvas/Editable'
import { dateRange } from '@/lib/format'
import { Bullets, ContactText, Links, Photo, Section, blockLabel, contactEntries, visibleLinks } from './parts'
import type { TemplateProps } from './types'
import { OrderedSections } from './OrderedSections'

/**
 * Franjas: separadores de rayas finas entre secciones.
 *
 * Monocroma salvo el acento. Al no usar bloques rellenos, es de las pocas que
 * se parte entre hojas sin perder nada: no hay fondo que dejar de pintar.
 */
export default function FranjasTemplate({ data, design }: TemplateProps) {
  const { personal, experience, education, skills, tools, references , custom } = data
  const contacts = contactEntries(personal, design)
  const links = visibleLinks(personal, design)

  const rayas = {
    height: 6,
    backgroundImage: 'repeating-linear-gradient(90deg, var(--cv-primary) 0 3px, transparent 3px 7px)',
    marginBottom: 'var(--cv-gap-sm)',
    printColorAdjust: 'exact' as const,
    WebkitPrintColorAdjust: 'exact' as const,
  }

  const titulo = (texto: string) => (
    <>
      <div style={rayas} aria-hidden />
      <h2 style={{ fontSize: '0.95em', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--cv-gap-sm)' }}>
        {texto}
      </h2>
    </>
  )

  return (
    <div style={{ padding: 'calc(var(--cv-pad) * 1.1)', minHeight: '297mm' }}>
      <header style={{ display: 'flex', gap: 'var(--cv-gap)', alignItems: 'flex-start', marginBottom: 'var(--cv-gap)' }}>
        <div style={{ flex: 1 }}>
          <Editable path="personal.fullName" as="h1" placeholder="Tu nombre"
            style={{ fontSize: 'calc(3em * var(--cv-name-scale, 1))', fontWeight: 200, letterSpacing: '-0.035em', lineHeight: 0.98 }} />
          <Editable path="personal.headline" placeholder="Cargo o especialidad"
            style={{ display: 'block', marginTop: 6, fontSize: '1.05em', color: 'var(--cv-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', marginTop: 10, fontSize: '0.92em', opacity: 0.85 }}>
            {contacts.map((entry) => (
              <ContactText key={entry.key} entry={entry} />
            ))}
            {links.length > 0 && <Links links={links} />}
          </div>
        </div>
        {design.showPhoto && <Photo personal={personal} design={design} />}
      </header>

      <OrderedSections design={design} custom={custom}>
<Section first id="perfil" label="Perfil">
        {titulo('Perfil')}
        <Editable path="summary" multiline placeholder="Resume tu aporte." style={{ display: 'block' }} />
      </Section>

      {experience.length > 0 && (
        <Section id="experiencia" label="Experiencia">
          {titulo('Experiencia')}
          {experience.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <Editable path={`experience.${i}.role`} placeholder="Cargo" style={{ fontWeight: 700, fontSize: '1.05em' }} />
                <span style={{ fontSize: '0.84em', letterSpacing: '0.06em', color: 'var(--cv-accent)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {dateRange(item.start, item.end, item.current)}
                </span>
              </div>
              <Editable path={`experience.${i}.company`} placeholder="Empresa" style={{ display: 'block', opacity: 0.75, fontSize: '0.94em' }} />
              <Bullets basePath={`experience.${i}.bullets`} bullets={item.bullets} />
            </article>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section id="formacion" label="Formación">
          {titulo('Formación')}
          {education.map((item, i) => (
            <article data-block data-block-id={item.id} data-block-label={blockLabel(item)} key={item.id} style={{ marginBottom: 'var(--cv-gap-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <Editable path={`education.${i}.degree`} placeholder="Título" style={{ fontWeight: 700 }} />
                <span style={{ fontSize: '0.84em', color: 'var(--cv-accent)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {dateRange(item.start, item.end, false)}
                </span>
              </div>
              <Editable path={`education.${i}.institution`} placeholder="Institución" style={{ display: 'block', opacity: 0.75, fontSize: '0.94em' }} />
            </article>
          ))}
        </Section>
      )}

      {(skills.length > 0 || tools.length > 0) && (
        <Section id="competencias" label="Competencias">
          {titulo('Competencias y herramientas')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px', fontSize: '0.95em' }}>
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
          {titulo('Referencias')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cv-gap-sm) 20px', fontSize: '0.93em' }}>
            {references.map((ref, i) => (
              <div key={ref.id} data-line>
                <Editable path={`references.${i}.name`} placeholder="Nombre" style={{ fontWeight: 700, display: 'block' }} />
                <Editable path={`references.${i}.relation`} placeholder="Relación" style={{ display: 'block', opacity: 0.75 }} />
                <Editable path={`references.${i}.phone`} placeholder="Teléfono" style={{ color: 'var(--cv-accent)' }} />
              </div>
            ))}
          </div>
        </Section>
)}
      </OrderedSections>
    </div>
  )
}
