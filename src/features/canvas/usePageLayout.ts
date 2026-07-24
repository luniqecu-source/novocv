import { useLayoutEffect, type RefObject } from 'react'
import { useCv, selectData, selectDesign } from '@/store/cvStore'
import { useUi, A4_HEIGHT_PX, type BlockInfo } from '@/store/uiStore'
import type { BlockSetting } from '@/types/cv'

/**
 * Paginacion en pantalla.
 *
 * El navegador sabe cortar en hojas al imprimir, pero no enseña nada de eso
 * mientras se edita ni reserva margen al reanudar. Este modulo hace ese
 * trabajo sobre el lienzo, de modo que lo que se ve es lo que sale.
 *
 * Hay dos clases de elemento y la distincion importa:
 *
 * - `data-group` (las secciones) fluye por defecto. Una experiencia con seis
 *   cargos ocupa las hojas que necesite; solo se evita que su encabezado
 *   quede solo al pie.
 * - `data-block` (cada cargo, cada titulo academico) se mantiene entero por
 *   defecto: si no cabe en lo que resta de hoja, baja completo.
 *
 * Cualquiera de las dos preferencias se invierte por bloque desde el gestor.
 */
export function usePageLayout(paperRef: RefObject<HTMLElement>) {
  const data = useCv(selectData)
  const design = useCv(selectDesign)
  const setPageCount = useUi((s) => s.setPageCount)
  const setBlocks = useUi((s) => s.setBlocks)

  useLayoutEffect(() => {
    const paper = paperRef.current
    if (!paper) return

    const marginPx = mmToPx(design.pageMargin)
    let corriendo = false

    /**
     * Una pasada no basta.
     *
     * Al empujar un bloque cambian las posiciones de todos los de abajo, y un
     * empuje puede provocar otro. Se repite hasta que la altura total deja de
     * moverse, con un tope por seguridad. `paginate` limpia antes de calcular,
     * asi que repetirla converge en vez de acumular.
     */
    const run = () => {
      if (corriendo) return
      corriendo = true

      let encontrados = paginate(paper, marginPx, design.keepBlocks, design.blocks)
      let alto = paper.offsetHeight

      for (let vuelta = 0; vuelta < 3; vuelta++) {
        encontrados = paginate(paper, marginPx, design.keepBlocks, design.blocks)
        const nuevo = paper.offsetHeight
        if (Math.abs(nuevo - alto) < 1) break
        alto = nuevo
      }

      setPageCount(pagesOf(paper))
      setBlocks(encontrados)
      corriendo = false
    }

    run()

    let cancelado = false
    const reintentar = () => {
      if (!cancelado) run()
    }

    // Las tipografias web llegan despues del primer diseno y cambian las
    // alturas. Sin esperarlas, la primera medicion siempre sale corta.
    document.fonts?.ready.then(reintentar)

    // La fotografia tambien reordena la hoja al terminar de decodificarse.
    for (const img of Array.from(paper.querySelectorAll('img'))) {
      if (!img.complete) img.addEventListener('load', reintentar, { once: true })
    }

    /*
     * El observador recalcula, no solo mide.
     *
     * Antes solo volvia a contar hojas: cuando algo reordenaba la pagina mas
     * tarde, los empujes quedaban obsoletos y el corte caia donde ya no
     * correspondia. El guardia de reentrada evita el bucle, y como el calculo
     * es determinista la segunda pasada no cambia nada y el observador se
     * calla solo.
     */
    const observer = new ResizeObserver(reintentar)
    observer.observe(paper)

    return () => {
      cancelado = true
      observer.disconnect()
    }
  }, [data, design, paperRef, setPageCount, setBlocks])
}

const mmToPx = (mm: number) => Math.round(mm * (96 / 25.4))
const pagesOf = (paper: HTMLElement) => Math.max(1, Math.ceil(paper.offsetHeight / A4_HEIGHT_PX - 0.02))

function paginate(
  paper: HTMLElement,
  marginPx: number,
  keepBlocks: boolean,
  settings: Record<string, BlockSetting>,
): BlockInfo[] {
  const nodes = Array.from(paper.querySelectorAll<HTMLElement>('[data-group], [data-block], [data-line]'))

  /*
   * El empuje se aplica con padding, no con margin.
   *
   * Las plantillas ya usan margin-top para separar secciones. Limpiarlo antes
   * de recalcular borraba esa separacion y dejaba las secciones pegadas unas a
   * otras. El padding esta libre en estos elementos, asi que ambas cosas
   * conviven sin pisarse.
   */
  for (const node of nodes) node.style.paddingTop = ''

  const usable = A4_HEIGHT_PX - marginPx * 2
  // Espacio minimo bajo un encabezado de seccion para que no se lea como un
  // titulo huerfano al pie de la hoja.
  const HEAD_ROOM = 96

  const found: BlockInfo[] = []

  // En orden de documento: cada empuje desplaza a los de abajo, asi que la
  // posicion se vuelve a leer en cada vuelta.
  for (const node of nodes) {
    const height = node.offsetHeight
    if (height === 0) continue

    const id = node.dataset.blockId
    const setting = (id && settings[id]) || {}
    const isGroup = node.hasAttribute('data-group')
    // Una linea (una vineta, un renglon suelto) siempre se mantiene entera y
    // nunca aparece en el gestor: son demasiadas y no se administran a mano.
    const isLine = node.hasAttribute('data-line')

    const top = offsetWithin(node, paper)
    // El espacio manual se suma antes de decidir: mueve el contenido y puede
    // ser justo lo que hace que el bloque ya no quepa donde estaba.
    const start = top + mmToPx(setting.space ?? 0)

    const pageIndex = Math.floor(start / A4_HEIGHT_PX)
    const pageTop = pageIndex * A4_HEIGHT_PX
    // La primera hoja ya trae el margen de la propia plantilla; las siguientes
    // empiezan pegadas al borde y son las que necesitan la reserva.
    const contentTop = pageIndex === 0 ? pageTop : pageTop + marginPx
    const contentBottom = pageTop + A4_HEIGHT_PX - marginPx
    const nextContentTop = (pageIndex + 1) * A4_HEIGHT_PX + marginPx
    const room = contentBottom - start

    let target = start

    if (setting.breakBefore) {
      if (start > contentTop + 6) target = nextContentTop
    } else if (start < contentTop - 1) {
      // Nada arranca dentro del margen superior.
      target = contentTop
    } else {
      // Por defecto los grupos fluyen y las entradas se mantienen enteras.
      // `keep` invierte lo que corresponda; solo se aplica si el bloque cabe
      // en una hoja, porque uno mas alto no tiene donde ir.
      const keep = isLine || ((setting.keep ?? (!isGroup && keepBlocks)) && height <= usable)

      if (keep && height <= usable && start + height > contentBottom) target = nextContentTop
      else if (!keep && isGroup && room < Math.min(HEAD_ROOM, height)) target = nextContentTop
      else if (!keep && !isGroup && room < 40) target = nextContentTop
    }

    // Siempre padding, nunca margin: los margenes verticales adyacentes se
    // colapsan entre si y con el del contenedor, asi que el empuje acabaria
    // absorbido o aplicado fuera del elemento que se queria mover.
    if (target > top) node.style.paddingTop = `${(target - top).toFixed(2)}px`

    if (id && !isLine) {
      found.push({
        id,
        label: node.dataset.blockLabel || id,
        kind: isGroup ? 'seccion' : 'entrada',
        page: Math.floor(target / A4_HEIGHT_PX) + 1,
      })
    }
  }

  return found
}

/**
 * Distancia vertical hasta el ancestro indicado.
 *
 * Se suma `offsetTop` en lugar de usar getBoundingClientRect porque el lienzo
 * esta escalado por el zoom: las coordenadas de pantalla vendrian multiplicadas
 * y el corte caeria en el sitio equivocado a cualquier escala distinta de 100 %.
 */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement): number {
  let total = 0
  let current: HTMLElement | null = node

  while (current && current !== ancestor) {
    total += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  return total
}
