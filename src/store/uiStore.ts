import { create } from 'zustand'
import { uid } from '@/lib/id'

/**
 * Estado que no pertenece al documento.
 *
 * Se separa a proposito: el zoom o el panel abierto no deben viajar en el
 * archivo exportado, ni ensuciar el historial de deshacer.
 */

export type PanelId =
  | 'diseno'
  | 'importar'
  | 'personal'
  | 'perfil'
  | 'experiencia'
  | 'educacion'
  | 'herramientas'
  | 'competencias'
  | 'referencias'
  | 'paginas'
  | 'asistente'

export type ToastKind = 'ok' | 'error' | 'info'

export interface BlockInfo {
  id: string
  label: string
  kind: 'seccion' | 'entrada'
  page: number
}

function sameBlocks(a: BlockInfo[], b: BlockInfo[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, i) => item.id === b[i].id && item.label === b[i].label && item.page === b[i].page)
}

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

const API_KEY_STORAGE = 'folio.gemini.key'

interface UiStore {
  panel: PanelId
  setPanel: (panel: PanelId) => void

  zoom: number
  setZoom: (zoom: number) => void
  zoomBy: (delta: number) => void
  fitToWidth: (containerWidth: number) => void

  toasts: Toast[]
  notify: (message: string, kind?: ToastKind) => void
  dismiss: (id: string) => void

  apiKey: string
  setApiKey: (key: string) => void
  keyModalOpen: boolean
  setKeyModalOpen: (open: boolean) => void

  busy: string | null
  setBusy: (label: string | null) => void

  pageCount: number
  setPageCount: (count: number) => void

  /** Bloques detectados en la hoja, en orden de documento. Los publica el motor. */
  blocks: BlockInfo[]
  setBlocks: (blocks: BlockInfo[]) => void
}

const A4_WIDTH_PX = 794 // 210 mm a 96 ppp
export const A4_HEIGHT_PX = (297 * 96) / 25.4 // 1122.52 px; redondear desalinea el corte

export const useUi = create<UiStore>((set, get) => ({
  panel: 'diseno',
  setPanel: (panel) => set({ panel }),

  zoom: 0.72,
  setZoom: (zoom) => set({ zoom: clamp(zoom, 0.3, 2) }),
  zoomBy: (delta) => set({ zoom: clamp(get().zoom + delta, 0.3, 2) }),
  fitToWidth: (containerWidth) =>
    set({ zoom: clamp((containerWidth - 96) / A4_WIDTH_PX, 0.3, 1.4) }),

  toasts: [],
  notify: (message, kind = 'info') => {
    const toast: Toast = { id: uid('ts'), kind, message }
    set({ toasts: [...get().toasts, toast] })
    setTimeout(() => get().dismiss(toast.id), 4200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  apiKey: localStorage.getItem(API_KEY_STORAGE) ?? '',
  setApiKey: (key) => {
    localStorage.setItem(API_KEY_STORAGE, key)
    set({ apiKey: key })
  },
  keyModalOpen: false,
  setKeyModalOpen: (keyModalOpen) => set({ keyModalOpen }),

  busy: null,
  setBusy: (busy) => set({ busy }),

  pageCount: 1,
  setPageCount: (pageCount) => {
    if (get().pageCount !== pageCount) set({ pageCount })
  },

  blocks: [],
  setBlocks: (blocks) => {
    // El motor corre en cada tecla; sin esta comparacion el gestor se
    // redibujaria entero por cada pulsacion sin que nada hubiera cambiado.
    if (!sameBlocks(get().blocks, blocks)) set({ blocks })
  },
}))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
