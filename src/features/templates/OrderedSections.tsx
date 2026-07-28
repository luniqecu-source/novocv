import { type ReactNode, type ReactElement, Children, cloneElement, isValidElement } from 'react'
import type { CustomSection as CustomSectionType, DesignSettings } from '@/types/cv'
import { CustomSectionView } from './CustomSection'

/**
 * Ordenador de secciones.
 *
 * Cada plantilla declara sus <Section id="..."> en el orden que le resulte
 * natural. Este componente aplica el orden y la visibilidad definidos en el
 * gestor, e intercala las secciones personalizadas.
 *
 * Diseno clave: los hijos que NO son <Section> (cabeceras, divisores, texto)
 * se dejan intactos en su posicion. Solo el bloque de secciones se reordena,
 * y las secciones personalizadas se insertan donde caeria su clave. Asi una
 * plantilla se envuelve entera sin desmontar su estructura, y reordenar u
 * ocultar funciona igual en las doce sin tocar ninguna.
 *
 * Solo actua sobre el eje vertical de su propio contenedor. En las plantillas
 * de dos columnas, cada columna envuelve sus secciones por separado, asi que
 * ningun bloque salta de lado.
 */
export function OrderedSections({
  children,
  design,
  custom,
  /** Solo se colocan aqui las personalizadas cuyo id este en esta lista. */
  customIds,
}: {
  children: ReactNode
  design: DesignSettings
  custom: CustomSectionType[]
  customIds?: string[]
}) {
  const items = Children.toArray(children)

  // Se separan las secciones (con id) del resto, conservando la posicion de
  // los no-secciones para reinsertarlos igual.
  const sections = new Map<string, ReactElement>()
  const passthrough: { index: number; node: ReactNode }[] = []

  items.forEach((child, index) => {
    if (isValidElement(child) && typeof (child.props as { id?: string }).id === 'string') {
      sections.set((child.props as { id: string }).id, child)
    } else {
      passthrough.push({ index, node: child })
    }
  })

  const allowedCustom = custom.filter((section) => !customIds || customIds.includes(section.id))
  const customByKey = new Map(allowedCustom.map((section) => [`custom:${section.id}`, section]))

  // Secuencia final de claves: primero el orden guardado, luego lo que la
  // plantilla trae y aun no esta ordenado.
  const ordered = design.sectionOrder.filter((key) => sections.has(key) || customByKey.has(key))
  const missing = [...sections.keys(), ...customByKey.keys()].filter((key) => !ordered.includes(key))
  const sequence = [...ordered, ...missing]

  const orderedNodes: ReactElement[] = []
  for (const key of sequence) {
    if (design.hiddenSections.includes(key)) continue
    const fixed = sections.get(key)
    if (fixed) {
      orderedNodes.push(fixed)
      continue
    }
    const custom = customByKey.get(key)
    if (custom) orderedNodes.push(<CustomSectionView key={custom.id} section={custom} />)
  }

  // El atributo `first` (sin margen superior) va ligado a la posicion, no a la
  // seccion. Tras reordenar, se fuerza en la que realmente quede primera para
  // que el espaciado superior sea correcto en cualquier orden.
  const spaced = orderedNodes.map((node, i) =>
    cloneElement(node, { first: i === 0 } as Partial<{ first: boolean }>),
  )

  // Se reconstruye el arbol: los no-secciones vuelven a su hueco original y el
  // bloque de secciones reordenado ocupa el lugar de la primera seccion.
  const firstSectionIndex = items.findIndex(
    (child) => isValidElement(child) && typeof (child.props as { id?: string }).id === 'string',
  )

  const result: ReactNode[] = []
  items.forEach((child, index) => {
    const isSection =
      isValidElement(child) && typeof (child.props as { id?: string }).id === 'string'
    if (!isSection) {
      result.push(child)
    } else if (index === firstSectionIndex) {
      result.push(...spaced)
    }
    // Las demas secciones ya estan dentro de orderedNodes; se omiten aqui.
  })

  return <>{result}</>
}
