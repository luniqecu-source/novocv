/**
 * Modelo de datos del documento.
 *
 * Es el unico contrato entre el editor, las plantillas, el importador,
 * la IA y la exportacion. Si algo necesita un campo nuevo, se agrega aqui
 * primero y el resto del sistema se adapta.
 */

export type Id = string

export interface Link {
  id: Id
  label: string
  url: string
}

export interface Personal {
  fullName: string
  headline: string
  phone: string
  email: string
  location: string
  documentId: string
  license: string
  birthDate: string
  photo: string | null
  links: Link[]
}

export interface ExperienceItem {
  id: Id
  role: string
  company: string
  location: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface EducationItem {
  id: Id
  degree: string
  institution: string
  location: string
  start: string
  end: string
  note: string
}

/** Skills y herramientas comparten forma: nombre + dominio de 0 a 100. */
export interface LeveledItem {
  id: Id
  name: string
  level: number
}

export type ReferenceKind = 'personal' | 'profesional'

export interface ReferenceItem {
  id: Id
  kind: ReferenceKind
  name: string
  relation: string
  company: string
  phone: string
}

export type CustomKind = 'lista' | 'texto'

export interface CustomSection {
  id: Id
  kind: CustomKind
  title: string
  /** Usado si kind === 'texto'. */
  body: string
  /** Usado si kind === 'lista'. */
  items: string[]
}

export interface CvData {
  personal: Personal
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: LeveledItem[]
  tools: LeveledItem[]
  references: ReferenceItem[]
  custom: CustomSection[]
}

export type Density = 'compacta' | 'normal' | 'amplia'
export type TextAlign = 'izquierda' | 'justificado'

export interface BlockSetting {
  /** Empieza en hoja nueva. */
  breakBefore?: boolean
  /** Se mueve entero si no cabe, en vez de continuar en la hoja siguiente. */
  keep?: boolean
  /** Espacio extra antes del bloque, en milimetros. */
  space?: number
}

export interface DesignSettings {
  templateId: string
  primary: string
  surface: string
  surfaceText: string
  accent: string
  fontHeading: string
  fontBody: string
  fontSize: number
  lineHeight: number
  /** Multiplicador del tamano de los titulos de seccion (1 = normal). */
  headingScale: number
  /** Multiplicador del tamano del nombre en la cabecera (1 = normal). */
  nameScale: number
  sectionGap: number
  density: Density
  textAlign: TextAlign
  /** Partir palabras al final de linea. Solo tiene efecto si esta justificado. */
  hyphenate: boolean
  /** Margen superior e inferior reservado en cada hoja, en milimetros. */
  pageMargin: number
  /** Por defecto las entradas no se parten. Apagarlo deja que todas fluyan. */
  keepBlocks: boolean
  /**
   * Ajustes de maquetacion por bloque, indexados por su identificador.
   * Las secciones usan claves estables ("experiencia", "competencias") para
   * que la configuracion sobreviva a un cambio de plantilla; las entradas
   * usan el id del propio elemento.
   */
  blocks: Record<string, BlockSetting>
  /**
   * Orden de las secciones, por clave. Las plantillas recorren esta lista en
   * vez de tener el orden escrito, asi que reordenar es reordenar el arreglo.
   * Las claves ausentes se anaden al final con su orden natural.
   */
  sectionOrder: string[]
  /** Secciones ocultas, por clave. Mas simple que un booleano por seccion. */
  hiddenSections: string[]
  showPhoto: boolean
  showDocumentId: boolean
  showLicense: boolean
  showBirthDate: boolean
  showLinks: boolean
  showSkillLevels: boolean
  showToolLevels: boolean
  photoSize: number
  photoRadius: number
  photoBorder: number
}

/** Lo que se guarda en disco. La version habilita migraciones futuras. */
export interface CvDocument {
  version: number
  data: CvData
  design: DesignSettings
}

export const DOC_VERSION = 5
