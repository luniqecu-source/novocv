import type { ReactNode } from 'react'
import { Editable } from '@/features/canvas/Editable'
import { initials } from '@/lib/format'
import type { DesignSettings, Personal } from '@/types/cv'
import { Phone, Mail, MapPin, Fingerprint, Car, Cake } from 'lucide-react'

/**
 * Piezas compartidas por las plantillas.
 * Cada plantilla decide composicion y jerarquia; estas piezas garantizan
 * que un titulo de seccion o una barra de nivel se comporten igual en todas.
 */

export function SectionTitle({
  children,
  tone = 'primary',
  rule = true,
}: {
  children: ReactNode
  tone?: 'primary' | 'surface'
  rule?: boolean
}) {
  const color = tone === 'primary' ? 'var(--cv-primary)' : 'var(--cv-surface-text)'
  return (
    <h2
      style={{
        color,
        fontSize: 'calc(1.02em * var(--cv-heading-scale, 1))',
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        marginBottom: 'var(--cv-gap-sm)',
        paddingBottom: rule ? 'calc(var(--cv-gap-sm) * 0.5)' : 0,
        borderBottom: rule ? `1.5px solid ${tone === 'primary' ? 'var(--cv-primary-line)' : 'var(--cv-accent)'}` : 'none',
      }}
    >
      {children}
    </h2>
  )
}

export function Section({
  children,
  first = false,
  id,
  label,
}: {
  children: ReactNode
  first?: boolean
  /** Clave estable de la seccion, compartida entre plantillas. */
  id?: string
  /** Nombre legible que aparece en el gestor de paginas. */
  label?: string
}) {
  // data-group, no data-block: una seccion puede continuar en la hoja
  // siguiente. Lo unico que el motor le garantiza por defecto es que su
  // encabezado no quede solo al pie de una hoja.
  return (
    <section
      data-group
      data-block-id={id}
      data-block-label={label}
      style={{ marginTop: first ? 0 : 'var(--cv-gap)' }}
    >
      {children}
    </section>
  )
}

export function LevelBar({ level, tone = 'primary' }: { level: number; tone?: 'primary' | 'surface' }) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 99,
        background: tone === 'primary' ? 'var(--cv-primary-soft)' : 'rgba(255,255,255,.16)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, level))}%`,
          height: '100%',
          borderRadius: 99,
          background: tone === 'primary' ? 'var(--cv-primary)' : 'var(--cv-accent)',
          transition: 'width .3s cubic-bezier(.2,.8,.2,1)',
        }}
      />
    </div>
  )
}

export function LevelDots({ level, tone = 'primary' }: { level: number; tone?: 'primary' | 'surface' }) {
  const filled = Math.round((level / 100) * 5)
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 99,
            background:
              i < filled
                ? tone === 'primary'
                  ? 'var(--cv-primary)'
                  : 'var(--cv-accent)'
                : tone === 'primary'
                  ? 'var(--cv-primary-soft)'
                  : 'rgba(255,255,255,.2)',
          }}
        />
      ))}
    </span>
  )
}

export function Chip({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'surface' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        borderRadius: 99,
        fontSize: '0.92em',
        background: tone === 'primary' ? 'var(--cv-primary-soft)' : 'rgba(255,255,255,.12)',
        color: tone === 'primary' ? 'var(--cv-primary)' : 'var(--cv-surface-text)',
      }}
    >
      {children}
    </span>
  )
}

export function Photo({ personal, design }: { personal: Personal; design: DesignSettings }) {
  if (!design.showPhoto) return null
  const size = 'var(--cv-photo-size)'
  const common = {
    width: size,
    height: size,
    borderRadius: 'var(--cv-photo-radius)',
    border: 'var(--cv-photo-border) solid var(--cv-accent)',
    objectFit: 'cover' as const,
    display: 'block',
  }

  if (personal.photo) return <img src={personal.photo} alt="" style={common} />

  return (
    <div
      style={{
        ...common,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--cv-primary-soft)',
        color: 'var(--cv-primary)',
        fontWeight: 700,
        fontSize: '1.8em',
        letterSpacing: '0.04em',
      }}
      aria-hidden
    >
      {initials(personal.fullName) || '··'}
    </div>
  )
}

/** Fila de contacto. `path` la vuelve editable directamente sobre la hoja. */
export function ContactRow({
  icon,
  path,
  placeholder,
  tone = 'primary',
}: {
  icon: ReactNode
  path: string
  placeholder: string
  tone?: 'primary' | 'surface'
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 3 }}>
      <span
        style={{
          color: tone === 'primary' ? 'var(--cv-primary)' : 'var(--cv-accent)',
          flexShrink: 0,
          fontSize: '0.9em',
        }}
      >
        {icon}
      </span>
      <Editable path={path} placeholder={placeholder} style={{ flex: 1, wordBreak: 'break-word' }} />
    </div>
  )
}

/**
 * Vinetas de logros.
 *
 * Cada `li` lleva `data-line`: el motor de paginacion la trata como unidad
 * indivisible. Sin esto, una lista larga cruza el corte y parte una linea de
 * texto por la mitad, que es el peor resultado posible.
 *
 * El punto va como hermano en un flex, no en posicion absoluta: asi el empuje
 * de pagina lo arrastra junto al texto en vez de dejarlo anclado arriba.
 */
export function Bullets({ basePath, bullets }: { basePath: string; bullets: string[] }) {
  return (
    <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
      {bullets.map((_, i) => (
        <li key={i} data-line style={{ display: 'flex', gap: '0.55em', marginBottom: 2 }}>
          <span
            style={{
              flexShrink: 0,
              width: 4,
              height: 4,
              borderRadius: 99,
              background: 'var(--cv-accent)',
              marginTop: '0.52em',
            }}
            aria-hidden
          />
          <Editable
            path={`${basePath}.${i}`}
            placeholder="Describe un logro con su resultado"
            multiline
            style={{ flex: 1 }}
          />
        </li>
      ))}
    </ul>
  )
}

/** Enlaces profesionales. Se ocultan solos cuando la lista esta vacia. */
export function Links({
  links,
  tone = 'primary',
  separator = ' · ',
}: {
  links: { id: string; label: string; url: string }[]
  tone?: 'primary' | 'surface'
  separator?: string
}) {
  if (links.length === 0) return null
  const color = tone === 'primary' ? 'var(--cv-primary)' : 'var(--cv-accent)'

  return (
    <span>
      {links.map((link, i) => (
        <span key={link.id}>
          {i > 0 && <span style={{ color, margin: '0 2px' }}>{separator}</span>}
          {link.label && (
            <Editable path={`personal.links.${i}.label`} style={{ color, fontWeight: 600, marginRight: 4 }} />
          )}
          <Editable path={`personal.links.${i}.url`} placeholder="enlace" style={{ wordBreak: 'break-all' }} />
        </span>
      ))}
    </span>
  )
}

/** Anillo de progreso para plantillas que necesitan un dato visual, no una barra. */
export function LevelRing({ level, size = 54, label }: { level: number; size?: number; label: string }) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(100, level)) / 100) * circumference

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--cv-primary-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--cv-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 13, fontWeight: 700, fill: 'var(--cv-primary)', fontFamily: 'var(--cv-font-heading)' }}
        >
          {level}
        </text>
      </svg>
      <div style={{ marginTop: 4, fontSize: '0.88em', lineHeight: 1.25 }}>{label}</div>
    </div>
  )
}

/** Etiqueta de margen para retículas editoriales. */
export function MarginLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--cv-font-heading)',
        fontSize: '0.78em',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--cv-primary)',
        paddingTop: 2,
      }}
    >
      {children}
    </div>
  )
}


/**
 * Que datos de contacto se muestran.
 *
 * Fuente unica para las ocho plantillas: cada una decide como pintarlos, pero
 * ninguna decide cuales. Antes cada plantilla traia su propia lista y por eso
 * la cedula aparecia en unas y en otras no, sin que el usuario pudiera elegir.
 */
export interface ContactEntry {
  key: string
  label: string
  path: string
  placeholder: string
  value: string
  icon: typeof Phone
  /** Texto que precede al valor donde no hay icono ni etiqueta. */
  prefix?: string
}

export function contactEntries(personal: Personal, design: DesignSettings): ContactEntry[] {
  const all: (ContactEntry & { visible: boolean })[] = [
    { key: 'phone', label: 'Teléfono', path: 'personal.phone', placeholder: 'Teléfono', value: personal.phone, icon: Phone, visible: true },
    { key: 'email', label: 'Correo', path: 'personal.email', placeholder: 'Correo', value: personal.email, icon: Mail, visible: true },
    { key: 'location', label: 'Ciudad', path: 'personal.location', placeholder: 'Ciudad', value: personal.location, icon: MapPin, visible: true },
    { key: 'documentId', label: 'Documento', path: 'personal.documentId', placeholder: 'Documento', value: personal.documentId, icon: Fingerprint, prefix: 'C.I.', visible: design.showDocumentId },
    { key: 'license', label: 'Licencia', path: 'personal.license', placeholder: 'Licencia', value: personal.license, icon: Car, prefix: 'Licencia', visible: design.showLicense },
    { key: 'birthDate', label: 'Nacimiento', path: 'personal.birthDate', placeholder: 'Año', value: personal.birthDate, icon: Cake, prefix: 'Nac.', visible: design.showBirthDate },
  ]

  // Un campo apagado no se pinta; uno encendido pero vacio si, para que se
  // pueda escribir directamente sobre la hoja sin pasar por el formulario.
  return all.filter((entry) => entry.visible).map(({ visible, ...entry }) => entry)
}

export function visibleLinks(personal: Personal, design: DesignSettings) {
  return design.showLinks ? personal.links : []
}


/** Nombre de una entrada tal como aparece en el gestor de paginas. */
export function blockLabel(item: { role?: string; degree?: string; company?: string; institution?: string }): string {
  return item.role || item.degree || item.company || item.institution || 'Bloque sin título'
}


/**
 * Dato de contacto en linea.
 *
 * Donde no hay icono ni columna de etiquetas, "Tipo B" a secas no se entiende.
 * El prefijo solo aparece en los campos que lo necesitan: un telefono o un
 * correo se reconocen solos y anteponerles una etiqueta seria ruido.
 */
export function ContactText({ entry }: { entry: ContactEntry }) {
  return (
    <span>
      {entry.prefix && <span style={{ opacity: 0.6 }}>{entry.prefix} </span>}
      <Editable path={entry.path} placeholder={entry.placeholder} />
    </span>
  )
}
