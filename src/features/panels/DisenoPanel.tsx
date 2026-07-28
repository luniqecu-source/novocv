import { AlertTriangle } from 'lucide-react'
import { useCv, selectDesign } from '@/store/cvStore'
import { templates } from '@/features/templates/registry'
import { palettes, headingFonts, bodyFonts, contrastRatio } from '@/data/design'
import { Field, Select } from '@/components/ui/Field'
import { ColorField, SegmentedControl, Slider, Toggle } from '@/components/ui/Controls'
import { cn } from '@/lib/cn'
import { PanelFrame } from './PanelFrame'
import type { Density, TextAlign } from '@/types/cv'

export function DisenoPanel() {
  const design = useCv(selectDesign)
  const setDesign = useCv((s) => s.setDesign)

  // Aviso, no bloqueo: quien diseña puede tener una razón para forzar el contraste.
  const ratio = contrastRatio(design.surface, design.surfaceText)
  const lowContrast = ratio < 4.5

  return (
    <PanelFrame title="Diseño" hint="Los cambios se ven en la hoja al instante.">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Plantilla</p>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => {
            const active = design.templateId === template.id
            return (
              <button
                key={template.id}
                onClick={() => setDesign({ templateId: template.id })}
                title={template.description}
                className={cn(
                  'group overflow-hidden rounded-xl border text-left transition-all duration-150 ease-snap',
                  active ? 'border-saffron shadow-lift' : 'border-edge hover:border-edge/80',
                )}
              >
                <span
                  className="block h-11 w-full"
                  style={{
                    background: `linear-gradient(105deg, ${template.swatch[0]} 0 38%, ${template.swatch[1]} 38% 100%)`,
                  }}
                />
                <span className={cn('block px-2.5 py-1.5 text-[12px]', active ? 'text-saffron' : 'text-chalk')}>
                  {template.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Paleta</p>
        <div className="flex flex-wrap gap-2">
          {palettes.map((palette) => (
            <button
              key={palette.id}
              title={palette.name}
              aria-label={palette.name}
              onClick={() =>
                setDesign({
                  primary: palette.primary,
                  surface: palette.surface,
                  surfaceText: palette.surfaceText,
                  accent: palette.accent,
                })
              }
              className={cn(
                'h-8 w-8 overflow-hidden rounded-lg border transition-transform duration-150 ease-snap hover:scale-110',
                design.primary === palette.primary ? 'border-saffron' : 'border-edge',
              )}
            >
              <span className="flex h-full w-full">
                <span className="h-full w-1/2" style={{ background: palette.surface }} />
                <span className="h-full w-1/2" style={{ background: palette.accent }} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Principal" value={design.primary} onChange={(primary) => setDesign({ primary })} />
        <ColorField label="Acento" value={design.accent} onChange={(accent) => setDesign({ accent })} />
        <ColorField label="Bloque" value={design.surface} onChange={(surface) => setDesign({ surface })} />
        <ColorField label="Texto del bloque" value={design.surfaceText} onChange={(surfaceText) => setDesign({ surfaceText })} />
      </div>

      {lowContrast && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          El texto sobre el bloque de color tiene un contraste de {ratio.toFixed(1)}:1. Por debajo de 4,5:1 cuesta leerlo impreso.
        </p>
      )}

      <Field label="Tipografía de títulos">
        <Select value={design.fontHeading} onChange={(e) => setDesign({ fontHeading: e.target.value })}>
          {headingFonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </Select>
      </Field>

      <Field label="Tipografía del texto">
        <Select value={design.fontBody} onChange={(e) => setDesign({ fontBody: e.target.value })}>
          {bodyFonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </Select>
      </Field>

      <Slider label="Tamaño del texto" unit=" pt" min={7} max={16} step={0.5} value={design.fontSize} onChange={(fontSize) => setDesign({ fontSize })} />
      <Slider label="Tamaño del nombre" unit="×" min={0.7} max={1.6} step={0.05} value={design.nameScale ?? 1} onChange={(nameScale) => setDesign({ nameScale })} />
      <Slider label="Tamaño de títulos" unit="×" min={0.7} max={1.6} step={0.05} value={design.headingScale ?? 1} onChange={(headingScale) => setDesign({ headingScale })} />
      <Slider label="Interlineado" min={1.2} max={1.8} step={0.05} value={design.lineHeight} onChange={(lineHeight) => setDesign({ lineHeight })} />
      <Slider label="Separación entre secciones" unit=" px" min={8} max={34} value={design.sectionGap} onChange={(sectionGap) => setDesign({ sectionGap })} />

      <SegmentedControl<Density>
        label="Densidad"
        value={design.density}
        options={[
          { value: 'compacta', label: 'Compacta' },
          { value: 'normal', label: 'Normal' },
          { value: 'amplia', label: 'Amplia' },
        ]}
        onChange={(density) => setDesign({ density })}
      />

      <SegmentedControl<TextAlign>
        label="Alineación del texto"
        value={design.textAlign}
        options={[
          { value: 'izquierda', label: 'Izquierda' },
          { value: 'justificado', label: 'Justificado' },
        ]}
        onChange={(textAlign) => setDesign({ textAlign })}
      />

      {design.textAlign === 'justificado' && (
        <>
          <Toggle
            label="Partir palabras al final de línea"
            checked={design.hyphenate}
            onChange={(hyphenate) => setDesign({ hyphenate })}
          />
          <p className="-mt-2 text-[11.5px] leading-relaxed text-muted">
            En columnas estrechas el texto justificado abre huecos entre palabras. Partir palabras
            los cierra, a cambio de guiones al final de algunas líneas.
          </p>
        </>
      )}

      <div className="border-t border-edge pt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Datos visibles</p>
        <div className="space-y-2">
          <Toggle label="Fotografía" checked={design.showPhoto} onChange={(showPhoto) => setDesign({ showPhoto })} />
          <Toggle label="Documento de identidad" checked={design.showDocumentId} onChange={(showDocumentId) => setDesign({ showDocumentId })} />
          <Toggle label="Licencia de conducir" checked={design.showLicense} onChange={(showLicense) => setDesign({ showLicense })} />
          <Toggle label="Año de nacimiento" checked={design.showBirthDate} onChange={(showBirthDate) => setDesign({ showBirthDate })} />
          <Toggle label="Enlaces" checked={design.showLinks} onChange={(showLinks) => setDesign({ showLinks })} />
          <Toggle label="Nivel en competencias" checked={design.showSkillLevels} onChange={(showSkillLevels) => setDesign({ showSkillLevels })} />
          <Toggle label="Nivel en herramientas" checked={design.showToolLevels} onChange={(showToolLevels) => setDesign({ showToolLevels })} />
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Se aplica a las ocho plantillas por igual. Apagar un campo lo oculta de la hoja sin
          borrar lo que escribiste.
        </p>
      </div>

      {design.showPhoto && (
        <>
          <Slider label="Tamaño de la foto" unit=" px" min={70} max={170} value={design.photoSize} onChange={(photoSize) => setDesign({ photoSize })} />
          <Slider label="Redondeo" unit=" px" min={0} max={999} value={design.photoRadius} onChange={(photoRadius) => setDesign({ photoRadius })} />
          <Slider label="Grosor del borde" unit=" px" min={0} max={8} value={design.photoBorder} onChange={(photoBorder) => setDesign({ photoBorder })} />
        </>
      )}
    </PanelFrame>
  )
}
