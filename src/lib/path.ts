/**
 * Acceso por ruta ("experience.0.role").
 *
 * Es lo que permite que la edicion directa sobre la hoja sea generica:
 * un componente <Editable path="personal.fullName" /> sirve para cualquier
 * campo sin escribir un manejador por campo.
 *
 * Extension para secciones personalizadas: un segmento con la forma
 * "custom:ID" se resuelve a la posicion real de esa seccion dentro del
 * arreglo `custom`. Asi la vista no depende del orden del arreglo, que puede
 * cambiar, sino de un id estable.
 */

export type Path = string

const segments = (path: Path) => path.split('.')

/** Traduce un segmento "custom:ID" al indice numerico dentro del arreglo. */
function resolveSegment(container: unknown, key: string): string | undefined {
  if (!key.startsWith('custom:')) return key
  const id = key.slice('custom:'.length)
  const list = (container as { custom?: { id: string }[] })?.custom
  if (!Array.isArray(list)) return undefined
  const index = list.findIndex((item) => item.id === id)
  return index >= 0 ? `custom.${index}` : undefined
}

/** Expande cualquier segmento "custom:ID" a "custom.N" antes de recorrer. */
function expand(source: unknown, path: Path): string[] {
  const out: string[] = []
  for (const key of segments(path)) {
    const resolved = resolveSegment(source, key)
    if (resolved === undefined) return []
    out.push(...resolved.split('.'))
  }
  return out
}

export function getIn(source: unknown, path: Path): unknown {
  return expand(source, path).reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    return (acc as Record<string, unknown>)[key]
  }, source)
}

/** Escribe sobre un borrador de Immer. Muta a proposito. */
export function setIn(target: unknown, path: Path, value: unknown): void {
  const keys = expand(target, path)
  const last = keys.pop()
  if (!last) return

  let node = target as Record<string, unknown>
  for (const key of keys) {
    const next = node[key]
    if (next === null || typeof next !== 'object') return
    node = next as Record<string, unknown>
  }
  node[last] = value
}
