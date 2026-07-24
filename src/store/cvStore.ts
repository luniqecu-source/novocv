import { create } from 'zustand'
import { produce } from 'immer'
import type {
  CvData,
  CvDocument,
  DesignSettings,
  EducationItem,
  ExperienceItem,
  LeveledItem,
  ReferenceItem,
  ReferenceKind,
} from '@/types/cv'
import { defaultDocument } from '@/data/defaultCv'
import { loadDocument, saveDocument, clearDocument } from '@/lib/storage'
import { setIn, type Path } from '@/lib/path'
import { uid } from '@/lib/id'

/**
 * Fuente unica de verdad del documento.
 *
 * Regla del proyecto: ningun componente lee ni escribe el DOM para conocer
 * el estado. La hoja que se ve en pantalla es una funcion pura de `doc`.
 * Eso es lo que hace que deshacer, guardar, importar y exportar funcionen
 * sin coordinacion especial entre ellos.
 */

const HISTORY_LIMIT = 60

export interface CvStore {
  doc: CvDocument
  past: CvDocument[]
  future: CvDocument[]

  /** Mutacion general del documento sobre un borrador de Immer. */
  edit: (recipe: (draft: CvDocument) => void, trackHistory?: boolean) => void
  /** Edicion puntual por ruta, usada por la escritura directa sobre la hoja. */
  editPath: (path: Path, value: unknown) => void
  setDesign: (patch: Partial<DesignSettings>) => void
  replaceData: (data: CvData) => void
  reset: () => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  addExperience: () => void
  addEducation: () => void
  addLeveled: (list: 'skills' | 'tools') => void
  addReference: (kind: ReferenceKind) => void
  addLink: () => void
  removeLink: (id: string) => void
  removeFrom: (list: ListKey, id: string) => void
  reorder: (list: ListKey, from: number, to: number) => void
}

export type ListKey = 'experience' | 'education' | 'skills' | 'tools' | 'references'

export const useCv = create<CvStore>((set, get) => {
  const commit = (next: CvDocument, trackHistory: boolean) => {
    const { doc, past } = get()
    if (next === doc) return
    saveDocument(next)
    set(
      trackHistory
        ? { doc: next, past: [...past, doc].slice(-HISTORY_LIMIT), future: [] }
        : { doc: next },
    )
  }

  return {
    doc: loadDocument() ?? defaultDocument(),
    past: [],
    future: [],

    edit: (recipe, trackHistory = true) => commit(produce(get().doc, recipe), trackHistory),

    editPath: (path, value) =>
      commit(
        produce(get().doc, (draft) => {
          setIn(draft.data, path, value)
        }),
        true,
      ),

    // El diseno no entra al historial: el usuario arrastra un control de
    // tamano decenas de veces y no quiere deshacer paso a paso despues.
    setDesign: (patch) =>
      commit(
        produce(get().doc, (draft) => {
          Object.assign(draft.design, patch)
        }),
        false,
      ),

    replaceData: (data) =>
      commit(
        produce(get().doc, (draft) => {
          draft.data = data
        }),
        true,
      ),

    reset: () => {
      clearDocument()
      const fresh = defaultDocument()
      saveDocument(fresh)
      set({ doc: fresh, past: [], future: [] })
    },

    undo: () => {
      const { past, doc, future } = get()
      const previous = past[past.length - 1]
      if (!previous) return
      saveDocument(previous)
      set({ doc: previous, past: past.slice(0, -1), future: [doc, ...future].slice(0, HISTORY_LIMIT) })
    },

    redo: () => {
      const { future, doc, past } = get()
      const next = future[0]
      if (!next) return
      saveDocument(next)
      set({ doc: next, future: future.slice(1), past: [...past, doc].slice(-HISTORY_LIMIT) })
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    addExperience: () =>
      get().edit((draft) => {
        const item: ExperienceItem = {
          id: uid('ex'),
          role: '',
          company: '',
          location: '',
          start: '',
          end: '',
          current: false,
          bullets: [''],
        }
        draft.data.experience.unshift(item)
      }),

    addEducation: () =>
      get().edit((draft) => {
        const item: EducationItem = {
          id: uid('ed'),
          degree: '',
          institution: '',
          location: '',
          start: '',
          end: '',
          note: '',
        }
        draft.data.education.unshift(item)
      }),

    addLeveled: (list) =>
      get().edit((draft) => {
        const item: LeveledItem = { id: uid(list.slice(0, 2)), name: '', level: 70 }
        draft.data[list].push(item)
      }),

    addReference: (kind) =>
      get().edit((draft) => {
        const item: ReferenceItem = {
          id: uid('rf'),
          kind,
          name: '',
          relation: '',
          company: '',
          phone: '',
        }
        draft.data.references.push(item)
      }),

    addLink: () =>
      get().edit((draft) => {
        draft.data.personal.links.push({ id: uid('ln'), label: '', url: '' })
      }),

    removeLink: (id) =>
      get().edit((draft) => {
        const index = draft.data.personal.links.findIndex((link) => link.id === id)
        if (index >= 0) draft.data.personal.links.splice(index, 1)
      }),

    removeFrom: (list, id) =>
      get().edit((draft) => {
        const arr = draft.data[list] as { id: string }[]
        const index = arr.findIndex((item) => item.id === id)
        if (index >= 0) arr.splice(index, 1)
      }),

    reorder: (list, from, to) =>
      get().edit((draft) => {
        const arr = draft.data[list] as unknown[]
        if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
      }),
  }
})

/** Selectores. Mantienen los componentes suscritos solo a lo que usan. */
export const selectData = (s: CvStore) => s.doc.data
export const selectDesign = (s: CvStore) => s.doc.design
