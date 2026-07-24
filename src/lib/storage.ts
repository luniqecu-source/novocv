/**
 * Persistencia local con esquema versionado.
 *
 * Se aisla aqui para que cambiar localStorage por IndexedDB o por una API
 * remota sea tocar un archivo y no medio proyecto.
 */
import { DOC_VERSION, type CvDocument } from '@/types/cv'
import { defaultDocument } from '@/data/defaultCv'

const KEY = 'folio.document.v1'

export function loadDocument(): CvDocument | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CvDocument
    return migrate(parsed)
  } catch {
    return null
  }
}

export function saveDocument(doc: CvDocument): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(doc))
  } catch {
    // Cuota llena (suele ser la foto en base64). Se ignora: el trabajo en
    // memoria sigue intacto y el usuario ya vera el aviso al exportar.
  }
}

export function clearDocument(): void {
  localStorage.removeItem(KEY)
}

/**
 * Punto unico donde crecen las migraciones cuando cambie el modelo.
 *
 * Los ajustes de diseno se completan siempre contra los valores por defecto:
 * si una version nueva agrega un campo, un documento viejo lo recibe en vez
 * de dejar una variable CSS en `undefined`, que es un fallo silencioso y
 * dificil de rastrear.
 */
function migrate(doc: CvDocument): CvDocument {
  const base = defaultDocument()
  return {
    version: DOC_VERSION,
    data: { ...base.data, ...doc.data },
    design: { ...base.design, ...doc.design },
  }
}

/** Descarga el documento como .json para respaldo o para moverlo de equipo. */
export function downloadJson(doc: CvDocument, filename = 'hoja-de-vida.folio.json') {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
