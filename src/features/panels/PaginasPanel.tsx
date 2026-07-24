import { CornerDownRight, FileStack, Lock, Unlock, Minus, Plus } from 'lucide-react'
import { useCv, selectDesign } from '@/store/cvStore'
import { useUi, type BlockInfo } from '@/store/uiStore'
import { Slider, Toggle } from '@/components/ui/Controls'
import { cn } from '@/lib/cn'
import { PanelFrame, EmptyState } from './PanelFrame'
import type { BlockSetting } from '@/types/cv'

/**
 * Gestor de paginas.
 *
 * La lista no esta escrita a mano: la publica el motor de paginacion con lo
 * que encuentra en la hoja. Asi refleja siempre la plantilla activa, y una
 * plantilla nueva aparece aqui sin tocar este archivo.
 */
export function PaginasPanel() {
  const design = useCv(selectDesign)
  const setDesign = useCv((s) => s.setDesign)
  const pageCount = useUi((s) => s.pageCount)
  const blocks = useUi((s) => s.blocks)

  const patch = (id: string, change: Partial<BlockSetting>) => {
    const next = { ...design.blocks }
    const merged = { ...next[id], ...change }
    // Un bloque sin nada configurado se borra del mapa: evita acumular
    // basura y que el documento guardado crezca sin motivo.
    if (!merged.breakBefore && merged.keep === undefined && !merged.space) delete next[id]
    else next[id] = merged
    setDesign({ blocks: next })
  }

  const ajustados = Object.keys(design.blocks).length

  return (
    <PanelFrame title="Páginas" hint="Mueve cada bloque a mano: dónde empieza y si puede partirse.">
      <div className="flex items-center gap-3 rounded-xl border border-edge bg-ink-800/60 p-3.5">
        <FileStack size={20} className="shrink-0 text-saffron" />
        <div>
          <p className="font-mono text-[13px] text-chalk">
            {pageCount} {pageCount === 1 ? 'hoja' : 'hojas'}
          </p>
          <p className="text-[11.5px] leading-snug text-muted">
            {ajustados === 0 ? 'Sin ajustes manuales.' : `${ajustados} ${ajustados === 1 ? 'bloque ajustado' : 'bloques ajustados'}`}
          </p>
        </div>
        {ajustados > 0 && (
          <button
            onClick={() => setDesign({ blocks: {} })}
            className="ml-auto rounded-md px-2 py-1 text-[11.5px] text-muted transition-colors hover:text-chalk"
          >
            Restablecer
          </button>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-edge bg-ink-800/60 p-3.5">
        <Slider
          label="Margen de las hojas"
          unit=" mm"
          min={0}
          max={28}
          value={design.pageMargin}
          onChange={(pageMargin) => setDesign({ pageMargin })}
        />
        <Toggle
          label="Mantener las entradas enteras"
          checked={design.keepBlocks}
          onChange={(keepBlocks) => setDesign({ keepBlocks })}
        />
        <p className="text-[11.5px] leading-relaxed text-muted">
          Valor por defecto para los cargos y títulos. Cada bloque de la lista puede llevarle
          la contraria.
        </p>
      </div>

      {blocks.length === 0 ? (
        <EmptyState message="Aún no hay bloques en la hoja." />
      ) : (
        <div className="space-y-1.5">
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              setting={design.blocks[block.id] ?? {}}
              defaultKeep={block.kind === 'entrada' && design.keepBlocks}
              onPatch={(change) => patch(block.id, change)}
            />
          ))}
        </div>
      )}
    </PanelFrame>
  )
}

function BlockRow({
  block,
  setting,
  defaultKeep,
  onPatch,
}: {
  block: BlockInfo
  setting: BlockSetting
  defaultKeep: boolean
  onPatch: (change: Partial<BlockSetting>) => void
}) {
  const keep = setting.keep ?? defaultKeep
  const space = setting.space ?? 0
  const tocado = Boolean(setting.breakBefore || setting.keep !== undefined || setting.space)

  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 transition-colors duration-150 ease-snap',
        tocado ? 'border-saffron/60 bg-saffron/5' : 'border-edge bg-ink-950/40',
      )}
    >
      <div className="mb-2 flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-chalk">{block.label}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted">
          {block.kind === 'seccion' ? 'Sección' : 'Entrada'} · h{block.page}
        </span>
      </div>

      <div className="flex gap-1.5">
        <Chip
          active={Boolean(setting.breakBefore)}
          onClick={() => onPatch({ breakBefore: !setting.breakBefore })}
          icon={<CornerDownRight size={12} />}
        >
          Hoja nueva
        </Chip>
        <Chip
          active={keep}
          onClick={() => onPatch({ keep: !keep })}
          icon={keep ? <Lock size={12} /> : <Unlock size={12} />}
        >
          {keep ? 'Entero' : 'Puede partirse'}
        </Chip>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Espacio antes</span>
        <div className="ml-auto flex items-center gap-1">
          <Step onClick={() => onPatch({ space: Math.max(0, space - 2) })} disabled={space === 0}>
            <Minus size={11} />
          </Step>
          <span className="w-11 text-center font-mono text-[11px] text-chalk">{space} mm</span>
          <Step onClick={() => onPatch({ space: Math.min(120, space + 2) })} disabled={space >= 120}>
            <Plus size={11} />
          </Step>
        </div>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11.5px] transition-colors duration-150 ease-snap',
        active ? 'border-saffron bg-saffron font-semibold text-ink-950' : 'border-edge text-muted hover:text-chalk',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function Step({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-edge p-1 text-muted transition-colors hover:text-chalk disabled:opacity-30"
    >
      {children}
    </button>
  )
}
