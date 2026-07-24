import { cn } from '@/lib/cn'
import { Label } from './Field'

/** Deslizador con lectura numerica en monoespaciada: se ajusta mirando el numero. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div>
      <Label hint={`${round(value)}${unit}`}>{label}</Label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-600 accent-saffron"
      />
    </div>
  )
}

const round = (n: number) => (Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, ''))

/** Selector de color con muestra grande: el codigo hex importa menos que el tono. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-edge bg-ink-950/60 p-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-[11px] uppercase text-chalk outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-edge bg-ink-950/40 px-3 py-2 text-[13px] text-chalk transition-colors hover:border-edge/80"
    >
      {label}
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-200 ease-snap',
          checked ? 'bg-saffron' : 'bg-ink-600',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-transform duration-200 ease-snap',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

/** Grupo de opciones excluyentes, mas rapido de leer que un desplegable corto. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-1 rounded-lg border border-edge bg-ink-950/50 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-[12px] transition-colors duration-150 ease-snap',
              value === option.value
                ? 'bg-saffron text-ink-950 font-semibold'
                : 'text-muted hover:text-chalk',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
