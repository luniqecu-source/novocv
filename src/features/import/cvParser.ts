import type { CvData } from '@/types/cv'
import { uid } from '@/lib/id'

/**
 * Interpretacion heuristica de un CV en texto plano.
 *
 * No pretende acertar siempre. Su trabajo es dejar al usuario con un 70 % del
 * documento poblado para que corrija en lugar de teclear desde cero. Cuando la
 * clave de IA esta configurada, el asistente puede reinterpretar el mismo texto
 * con mucha mas precision: por eso `parse` recibe texto y devuelve datos, sin
 * saber de donde salio ni quien lo va a revisar.
 */

const HEADINGS: Record<keyof Sections, RegExp> = {
  summary: /^(perfil|resumen|acerca|sobre m[ií]|objetivo|presentaci[óo]n)/i,
  experience: /^(experiencia|trayectoria|historial laboral|empleo)/i,
  education: /^(educaci[óo]n|formaci[óo]n|estudios|acad[ée]mic)/i,
  skills: /^(competencias|habilidades|aptitudes|destrezas)/i,
  tools: /^(herramientas|software|tecnolog[íi]as|conocimientos t[ée]cnicos|stack)/i,
  references: /^(referencias|contactos de referencia)/i,
}

interface Sections {
  summary: string[]
  experience: string[]
  education: string[]
  skills: string[]
  tools: string[]
  references: string[]
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]{2,}/
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/
const YEARS = /((19|20)\d{2})\s*[-–—a]{1,3}\s*((19|20)\d{2}|actualidad|presente|actual)/i

export function parseCv(raw: string): { data: Partial<CvData>; confidence: number; notes: string[] } {
  const lines = raw
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const notes: string[] = []
  const sections: Sections = { summary: [], experience: [], education: [], skills: [], tools: [], references: [] }

  let current: keyof Sections | null = null
  const header: string[] = []

  for (const line of lines) {
    const matched = (Object.keys(HEADINGS) as (keyof Sections)[]).find(
      (key) => line.length < 48 && HEADINGS[key].test(line),
    )
    if (matched) {
      current = matched
      continue
    }
    if (current) sections[current].push(line)
    else header.push(line)
  }

  const all = lines.join(' ')
  const email = all.match(EMAIL)?.[0] ?? ''
  const phone = all.match(PHONE)?.[0]?.trim() ?? ''

  // El nombre suele ser la primera linea con dos o tres palabras y sin digitos.
  const fullName =
    header.find((l) => /^[^\d@]{6,60}$/.test(l) && l.split(' ').length >= 2 && l.split(' ').length <= 5) ?? ''
  const headline = header.find((l) => l !== fullName && l.length > 5 && l.length < 70 && !EMAIL.test(l) && !PHONE.test(l)) ?? ''

  const data: Partial<CvData> = {}

  if (fullName || email || phone) {
    data.personal = {
      fullName,
      headline,
      phone,
      email,
      location: '',
      documentId: '',
      license: '',
      birthDate: '',
      photo: null,
      links: [],
    }
  } else {
    notes.push('No se reconocieron los datos de contacto.')
  }

  if (sections.summary.length) data.summary = sections.summary.join(' ')

  if (sections.experience.length) {
    data.experience = groupByDateHeading(sections.experience).map((block) => ({
      id: uid('ex'),
      role: block.title,
      company: block.subtitle,
      location: '',
      start: block.start,
      end: block.end,
      current: /actual|presente/i.test(block.end),
      bullets: block.body.length ? block.body : [''],
    }))
  } else {
    notes.push('No se encontró una sección de experiencia.')
  }

  if (sections.education.length) {
    data.education = groupByDateHeading(sections.education).map((block) => ({
      id: uid('ed'),
      degree: block.title,
      institution: block.subtitle,
      location: '',
      start: block.start,
      end: block.end,
      note: block.body.join(' '),
    }))
  }

  if (sections.skills.length) data.skills = toLeveled(sections.skills, 'sk')
  if (sections.tools.length) data.tools = toLeveled(sections.tools, 'tl')

  if (sections.references.length) {
    data.references = sections.references
      .filter((l) => l.length > 4)
      .slice(0, 6)
      .map((line) => {
        const phoneMatch = line.match(PHONE)?.[0]?.trim() ?? ''
        return {
          id: uid('rf'),
          kind: 'profesional' as const,
          name: line.replace(PHONE, '').split(/[,–—-]/)[0]?.trim() ?? line,
          relation: '',
          company: '',
          phone: phoneMatch,
        }
      })
  }

  const filled = [data.personal, data.summary, data.experience, data.education, data.skills].filter(Boolean).length
  return { data, confidence: filled / 5, notes }
}

interface Block {
  title: string
  subtitle: string
  start: string
  end: string
  body: string[]
}

/** Corta el bloque cada vez que aparece un rango de anios: ahi empieza un cargo. */
function groupByDateHeading(lines: string[]): Block[] {
  const blocks: Block[] = []
  let currentBlock: Block | null = null

  for (const line of lines) {
    const match = line.match(YEARS)
    const isBullet = /^[•·▪\-*–]/.test(line)

    if (match && !isBullet) {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = {
        title: line.replace(YEARS, '').replace(/[|,–—-]\s*$/, '').trim(),
        subtitle: '',
        start: match[1] ?? '',
        end: match[3] ?? '',
        body: [],
      }
      continue
    }

    if (!currentBlock) {
      currentBlock = { title: line, subtitle: '', start: '', end: '', body: [] }
      continue
    }

    if (!currentBlock.subtitle && !isBullet && line.length < 70) currentBlock.subtitle = line
    else currentBlock.body.push(line.replace(/^[•·▪\-*–]\s*/, ''))
  }

  if (currentBlock) blocks.push(currentBlock)
  return blocks.filter((b) => b.title)
}

function toLeveled(lines: string[], prefix: string) {
  return lines
    .flatMap((line) => line.split(/[,;•·|]/))
    .map((s) => s.replace(/^[-*–]\s*/, '').trim())
    .filter((s) => s.length > 1 && s.length < 40)
    .slice(0, 12)
    .map((name) => ({ id: uid(prefix), name, level: 75 }))
}
