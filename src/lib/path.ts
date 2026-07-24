/**
 * Acceso por ruta ("experience.0.role").
 *
 * Es lo que permite que la edicion directa sobre la hoja sea generica:
 * un componente <Editable path="personal.fullName" /> sirve para cualquier
 * campo sin escribir un manejador por campo.
 */

export type Path = string

const segments = (path: Path) => path.split('.')

export function getIn(source: unknown, path: Path): unknown {
  return segments(path).reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    return (acc as Record<string, unknown>)[key]
  }, source)
}

/** Escribe sobre un borrador de Immer. Muta a proposito. */
export function setIn(target: unknown, path: Path, value: unknown): void {
  const keys = segments(path)
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
