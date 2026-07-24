/**
 * Cliente del asistente (Gemini).
 *
 * Toda la aplicacion habla con este modulo a traves de `ask`. Cambiar de
 * proveedor fue tocar este archivo y las cadenas de `prompts.ts`: ni un panel
 * ni una plantilla se enteraron. Esa es la razon de que los efectos
 * secundarios vivan fuera de React.
 *
 * Seguridad: llamar a la API desde el navegador expone la clave a cualquiera
 * que abra las herramientas de desarrollo. Para uso personal es aceptable y
 * por eso existe el modo directo; para publicar la aplicacion hay que definir
 * VITE_AI_PROXY_URL y guardar la clave en el servidor.
 */

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash'
const PROXY = import.meta.env.VITE_AI_PROXY_URL

/** Modelo activo: el guardado por el usuario gana sobre la variable de entorno. */
const MODEL_STORAGE = 'folio.gemini.model'

export function getModel(): string {
  return localStorage.getItem(MODEL_STORAGE) || MODEL
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE, model)
}

export interface ModelInfo {
  id: string
  label: string
}

/**
 * Modelos que acepta esta clave concreta.
 *
 * Preguntarselo a la API evita mantener una lista fija que caduca cada pocos
 * meses, y evita que el usuario tenga que salir a la terminal a averiguarlo.
 */
export async function listModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch(`${BASE_URL}?pageSize=200`, {
    headers: { 'x-goog-api-key': apiKey },
  })

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as GeminiResponse | null
    throw new Error(describeError(response.status, detail))
  }

  const payload = (await response.json()) as {
    models?: { name?: string; displayName?: string; supportedGenerationMethods?: string[] }[]
  }

  return (payload.models ?? [])
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => ({
      id: (model.name ?? '').replace(/^models\//, ''),
      label: model.displayName || (model.name ?? '').replace(/^models\//, ''),
    }))
    .filter((model) => model.id && !/embedding|aqa|imagen|veo/i.test(model.id))
    .sort((a, b) => a.id.localeCompare(b.id))
}

export interface AskOptions {
  system: string
  prompt: string
  apiKey: string
  maxTokens?: number
  /** Pide a Gemini que responda JSON valido en vez de texto libre. */
  json?: boolean
}

export async function ask({ system, prompt, apiKey, maxTokens = 1200, json = false }: AskOptions): Promise<string> {
  const usingProxy = Boolean(PROXY)

  if (!usingProxy && !apiKey) {
    throw new Error('Falta la clave de la API. Configúrala en el panel del asistente.')
  }

  const headers: Record<string, string> = { 'content-type': 'application/json' }
  // La cabecera x-goog-api-key es la forma vigente; el parametro ?key= sigue
  // funcionando por compatibilidad, pero no conviene dejar la clave en la URL.
  if (!usingProxy) headers['x-goog-api-key'] = apiKey

  const model = getModel()
  const response = await fetch(usingProxy ? PROXY! : `${BASE_URL}/${model}:generateContent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.8,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  })

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as GeminiResponse | null
    throw new Error(describeError(response.status, detail))
  }

  const payload = (await response.json()) as GeminiResponse
  const candidate = payload.candidates?.[0]

  // Un corte por longitud o por filtro de seguridad devuelve 200 con el texto
  // truncado o vacio. Sin esta comprobacion el fallo aparece mucho despues,
  // como un JSON invalido, y cuesta rastrearlo.
  if (candidate?.finishReason === 'SAFETY') {
    throw new Error('El modelo bloqueó la respuesta por sus filtros de contenido.')
  }
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('La respuesta se cortó por longitud. Reduce el texto de entrada.')
  }

  const text = (candidate?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('\n')
    .trim()

  if (!text) throw new Error('El asistente devolvió una respuesta vacía.')
  return text
}

/** Extrae JSON aunque el modelo lo devuelva envuelto en un bloque de codigo. */
export function parseJsonReply<T>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
  const start = cleaned.search(/[[{]/)
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
  if (start === -1 || end === -1) throw new Error('La respuesta no contenía datos legibles.')
  return JSON.parse(cleaned.slice(start, end + 1)) as T
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] }
    finishReason?: string
  }[]
  error?: { message?: string; status?: string }
}

function describeError(status: number, detail: GeminiResponse | null): string {
  const reason = detail?.error?.status ?? ''
  const message = detail?.error?.message ?? ''

  if (status === 400 && /api key/i.test(message)) return 'La clave de la API no es válida.'
  if (status === 400) return `Petición rechazada: ${message || 'revisa el modelo configurado.'}`
  if (status === 403) return 'La clave no tiene permiso para este modelo, o el proyecto no lo habilita.'
  if (status === 404) return `El modelo "${getModel()}" no existe para tu clave. Elige otro en el panel del asistente.`
  if (status === 429 || reason === 'RESOURCE_EXHAUSTED') return 'Se alcanzó el límite de peticiones o de cuota. Espera un momento.'
  if (status >= 500) return 'Gemini no está disponible en este momento. Vuelve a intentarlo.'
  return `El asistente respondió con error ${status}.`
}
