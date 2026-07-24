/** Formateo compartido entre plantillas para que las fechas se vean igual. */

export function dateRange(start: string, end: string, current: boolean): string {
  const to = current ? 'Actualidad' : end.trim()
  if (!start.trim() && !to) return ''
  if (!to) return start
  if (!start.trim()) return to
  return `${start} — ${to}`
}

export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}
