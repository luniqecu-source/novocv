import {
  Palette,
  Upload,
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  Gauge,
  Users,
  Sparkles,
  FileStack,
} from 'lucide-react'
import { useUi, type PanelId } from '@/store/uiStore'
import { cn } from '@/lib/cn'

const items: { id: PanelId; label: string; icon: typeof Palette }[] = [
  { id: 'diseno', label: 'Diseño', icon: Palette },
  { id: 'importar', label: 'Importar', icon: Upload },
  { id: 'personal', label: 'Datos', icon: User },
  { id: 'perfil', label: 'Perfil', icon: AlignLeft },
  { id: 'experiencia', label: 'Experiencia', icon: Briefcase },
  { id: 'educacion', label: 'Formación', icon: GraduationCap },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'competencias', label: 'Competencias', icon: Gauge },
  { id: 'referencias', label: 'Referencias', icon: Users },
  { id: 'paginas', label: 'Páginas', icon: FileStack },
  { id: 'asistente', label: 'Asistente', icon: Sparkles },
]

/** Navegacion primaria. Iconos con etiqueta: en un editor la ambiguedad cuesta clics. */
export function SectionRail() {
  const panel = useUi((s) => s.panel)
  const setPanel = useUi((s) => s.setPanel)

  return (
    <nav className="no-print flex w-[76px] shrink-0 flex-col gap-0.5 border-r border-edge bg-ink-900 py-3" aria-label="Secciones">
      {items.map(({ id, label, icon: Icon }) => {
        const active = panel === id
        return (
          <button
            key={id}
            onClick={() => setPanel(id)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative mx-2 flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition-colors duration-150 ease-snap',
              active ? 'bg-ink-700 text-saffron' : 'text-muted hover:bg-ink-800 hover:text-chalk',
            )}
          >
            {active && <span className="absolute left-[-8px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-saffron" />}
            <Icon size={17} strokeWidth={1.9} />
            <span className="text-[9.5px] leading-tight">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
