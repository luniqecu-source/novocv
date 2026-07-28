import { useUi } from '@/store/uiStore'
import { DisenoPanel } from '@/features/panels/DisenoPanel'
import { ImportarPanel } from '@/features/panels/ImportarPanel'
import { PersonalPanel } from '@/features/panels/PersonalPanel'
import { PerfilPanel } from '@/features/panels/PerfilPanel'
import { ExperienciaPanel } from '@/features/panels/ExperienciaPanel'
import { EducacionPanel } from '@/features/panels/EducacionPanel'
import { NivelPanel } from '@/features/panels/NivelPanel'
import { ReferenciasPanel } from '@/features/panels/ReferenciasPanel'
import { SeccionesPanel } from '@/features/panels/SeccionesPanel'
import { PaginasPanel } from '@/features/panels/PaginasPanel'
import { AsistentePanel } from '@/features/panels/AsistentePanel'

/**
 * Unico lugar donde se decide que panel se muestra.
 * Agregar una seccion nueva es una entrada aqui y otra en SectionRail.
 */
export function Inspector() {
  const panel = useUi((s) => s.panel)

  return (
    <aside className="no-print w-[336px] shrink-0 border-r border-edge bg-ink-900">
      {panel === 'diseno' && <DisenoPanel />}
      {panel === 'importar' && <ImportarPanel />}
      {panel === 'personal' && <PersonalPanel />}
      {panel === 'perfil' && <PerfilPanel />}
      {panel === 'experiencia' && <ExperienciaPanel />}
      {panel === 'educacion' && <EducacionPanel />}
      {panel === 'herramientas' && <NivelPanel list="tools" />}
      {panel === 'competencias' && <NivelPanel list="skills" />}
      {panel === 'referencias' && <ReferenciasPanel />}
      {panel === 'secciones' && <SeccionesPanel />}
      {panel === 'paginas' && <PaginasPanel />}
      {panel === 'asistente' && <AsistentePanel />}
    </aside>
  )
}
