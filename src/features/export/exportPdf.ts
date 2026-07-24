/**
 * Exportacion a PDF.
 *
 * Hay dos rutas y el orden importa:
 *
 * 1. Impresion del navegador (recomendada). El texto sale vectorial y
 *    seleccionable, que es la condicion para que un filtro ATS pueda leer el
 *    documento. Ademas pesa poco y no depende de ninguna libreria.
 * 2. Rasterizado con html2canvas + jsPDF. Convierte la hoja en imagen. No es
 *    legible por maquina, pero conserva los fondos partidos entre hojas, que
 *    es justo lo que la impresion no puede garantizar.
 */

export function printToPdf(): void {
  window.print()
}

export interface RasterOptions {
  filename?: string
  /** Multiplicador de resolucion. 2 basta para imprimir; 3 pesa mucho mas. */
  scale?: number
}

const MM_WIDTH = 210
const MM_HEIGHT = 297

export async function rasterToPdf({ filename = 'hoja-de-vida.pdf', scale = 2 }: RasterOptions = {}): Promise<void> {
  const paper = document.querySelector<HTMLElement>('.paper')
  if (!paper) throw new Error('No se encontró la hoja para exportar.')

  // Carga diferida: son cientos de kilobytes que solo hacen falta por esta via.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const source = await html2canvas(paper, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // El lienzo esta escalado por el zoom; sin fijar el tamano, html2canvas
    // captura a la escala visible y la imagen sale borrosa o recortada.
    width: paper.offsetWidth,
    height: paper.offsetHeight,
    windowWidth: paper.offsetWidth,
    windowHeight: paper.offsetHeight,
    scrollX: 0,
    scrollY: 0,
  })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })

  // Altura de una hoja A4 medida en pixeles de la imagen capturada.
  const pageHeightPx = Math.floor((source.width * MM_HEIGHT) / MM_WIDTH)
  const pages = Math.max(1, Math.ceil(source.height / pageHeightPx - 0.02))

  /*
   * Se recorta una porcion por hoja en vez de repetir la imagen completa
   * desplazada. Repetirla obliga al PDF a cargar la imagen entera tantas veces
   * como paginas, y cualquier redondeo desplaza el contenido medio milimetro
   * en cada corte.
   */
  const slice = document.createElement('canvas')
  const context = slice.getContext('2d')
  if (!context) throw new Error('El navegador no permitió preparar la imagen.')

  for (let page = 0; page < pages; page++) {
    const top = page * pageHeightPx
    const height = Math.min(pageHeightPx, source.height - top)

    slice.width = source.width
    slice.height = pageHeightPx
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, slice.width, slice.height)
    context.drawImage(source, 0, top, source.width, height, 0, 0, source.width, height)

    if (page > 0) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, MM_WIDTH, MM_HEIGHT)
  }

  pdf.save(filename)
}
