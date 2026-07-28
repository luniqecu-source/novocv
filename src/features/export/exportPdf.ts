/**
 * Exportacion a PDF sin dependencias externas.
 *
 * El problema de las vias anteriores:
 * - window.print() sobre la app imprimia toda la interfaz (modal, barra
 *   lateral, fondo oscuro), porque imprime lo que hay en pantalla.
 * - html2canvas + jsPDF requieren instalar librerias que no siempre estan
 *   presentes; si faltan, el boton no hacia nada.
 *
 * Esta via abre una ventana nueva que contiene UNICAMENTE la hoja y sus
 * estilos, y lanza la impresion sobre ella. El navegador muestra su dialogo
 * "Guardar como PDF" con una sola cosa dentro: el CV en A4, con texto
 * seleccionable. No depende de ninguna libreria ni del estado del editor.
 */

/**
 * Abre la hoja aislada en una ventana e invoca la impresion del navegador.
 *
 * Se copian los estilos de la pagina (hojas de estilo y <style> en linea) para
 * que la hoja se vea igual que en el editor. La ventana se cierra sola tras
 * imprimir.
 */
export function exportSheetToPdf(): void {
  const paper = document.querySelector<HTMLElement>('.paper')
  if (!paper) throw new Error('No se encontró la hoja para exportar.')

  const win = window.open('', '_blank', 'width=900,height=1200')
  if (!win) {
    throw new Error('El navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio y vuelve a intentar.')
  }

  // Reunir todos los estilos del documento actual: <style> en linea y <link>
  // a hojas externas. Copiarlos asegura que la hoja se vea idéntica.
  const styleTags = Array.from(document.querySelectorAll('style'))
    .map((tag) => `<style>${tag.innerHTML}</style>`)
    .join('\n')
  const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`)
    .join('\n')

  // Copiar las variables de tema definidas en la propia hoja (color, fuentes,
  // tamanos), que viven como estilo en linea del elemento .paper.
  const paperInlineStyle = paper.getAttribute('style') ?? ''

  win.document.open()
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Hoja de vida</title>
  ${linkTags}
  ${styleTags}
  <style>
    /* La ventana solo contiene la hoja: sin margenes de pagina ni fondos. */
    @page { size: A4; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    /* La hoja a tamano real; su contenido ya sabe paginarse por bloques. */
    .print-root {
      width: 210mm;
    }
    .print-root .paper {
      box-shadow: none !important;
      margin: 0 !important;
      width: 210mm !important;
      overflow: visible !important;
    }
    /* Los colores de fondo deben salir. */
    .print-root .paper,
    .print-root .paper * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  </style>
</head>
<body>
  <div class="print-root">
    <article class="paper" style="${escapeAttr(paperInlineStyle)}">
      ${paper.innerHTML}
    </article>
  </div>
  <script>
    // Esperar a que fuentes e imagenes carguen antes de imprimir, o el
    // dialogo aparece con la hoja a medio dibujar.
    (function () {
      function done() {
        setTimeout(function () {
          window.focus();
          window.print();
        }, 120);
      }
      window.addEventListener('afterprint', function () { window.close(); });
      var imgs = Array.prototype.slice.call(document.images);
      var pending = imgs.filter(function (i) { return !i.complete; }).length;
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { if (pending === 0) done(); });
      }
      if (pending === 0) { done(); return; }
      imgs.forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', check);
        img.addEventListener('error', check);
      });
      function check() { pending -= 1; if (pending <= 0) done(); }
    })();
  </script>
</body>
</html>`)
  win.document.close()
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;')
}

// Nombres compatibles con el resto del codigo.
export const printToPdf = exportSheetToPdf
export const rasterToPdf = async (): Promise<void> => exportSheetToPdf()
