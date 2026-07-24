/**
 * Lectura de PDF. Se limita a devolver texto plano ordenado por posicion,
 * porque el parseo semantico vive en cvParser y debe poder probarse aparte.
 */
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export async function readPdf(file: File, onProgress?: (ratio: number) => void): Promise<string> {
  const buffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise
  const pages: string[] = []

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n)
    const content = await page.getTextContent()

    // Se reconstruyen los saltos de linea comparando la coordenada vertical:
    // sin esto todo el PDF llega como un unico parrafo continuo.
    let lastY: number | null = null
    let text = ''
    for (const item of content.items) {
      const entry = item as { str?: string; transform?: number[] }
      if (typeof entry.str !== 'string') continue
      const y = entry.transform?.[5] ?? 0
      if (lastY !== null && Math.abs(y - lastY) > 2) text += '\n'
      else if (text && !text.endsWith(' ')) text += ' '
      text += entry.str
      lastY = y
    }

    pages.push(text)
    onProgress?.(n / doc.numPages)
  }

  return pages.join('\n\n')
}
