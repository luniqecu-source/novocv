/** Identificadores locales para las listas. No necesitan ser globales. */
export function uid(prefix = 'it'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`
}
