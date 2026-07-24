import type { CvData, ExperienceItem } from '@/types/cv'

/**
 * Las instrucciones viven separadas del cliente y de la interfaz.
 * Asi se afinan sin recompilar mentalmente el resto del modulo, y se pueden
 * revisar de un vistazo cuando una respuesta sale mal.
 */

export const SYSTEM_ES =
  'Eres un asistente de empleabilidad en español latinoamericano. Escribes en frases cortas, ' +
  'con verbos concretos y cifras cuando existan. No inventas experiencia, títulos ni resultados ' +
  'que no aparezcan en los datos. No usas adjetivos vacíos como proactivo, dinámico o apasionado. ' +
  'Cuando te pidan JSON, respondes únicamente con el JSON, sin texto alrededor.'

export const summaryPrompt = (data: CvData, target: string) => `
Redacta tres versiones distintas del resumen profesional para esta persona.

Cargo al que aspira: ${target || data.personal.headline || 'no especificado'}

Datos disponibles:
${JSON.stringify({ personal: data.personal, experience: data.experience, education: data.education, skills: data.skills }, null, 2)}

Cada versión: entre 45 y 65 palabras, en primera persona implícita (sin "yo"), y arranca con el rol y los años de experiencia.
Las tres deben diferenciarse en el enfoque, no solo en las palabras: una centrada en resultados medibles,
otra en la especialidad técnica y otra en el liderazgo o el trato con personas.

Devuelve un arreglo JSON de tres cadenas de texto.`

export const atsPrompt = (data: CvData, jobDescription: string) => `
Compara esta hoja de vida contra la oferta y devuelve un diagnóstico.

Oferta:
"""${jobDescription}"""

Hoja de vida:
${JSON.stringify(data, null, 2)}

Devuelve este JSON:
{
  "puntaje": 0-100,
  "faltantes": ["palabra clave de la oferta ausente en el CV"],
  "presentes": ["palabra clave ya cubierta"],
  "ajustes": ["cambio concreto y accionable en el CV"],
  "veredicto": "dos frases sobre la viabilidad real de la candidatura"
}`

export const letterPrompt = (data: CvData, jobDescription: string, company: string) => `
Escribe una carta de presentación para ${company || 'la empresa'} a partir de esta oferta:
"""${jobDescription}"""

Datos de la persona:
${JSON.stringify({ personal: data.personal, summary: data.summary, experience: data.experience }, null, 2)}

Máximo 200 palabras, cuatro párrafos, sin fórmulas de cortesía recargadas.
El segundo párrafo debe citar un logro con cifra tomado de la experiencia real.
Devuelve solo el texto de la carta, sin encabezado ni firma.`

/**
 * Redaccion de logros a partir de notas sueltas.
 *
 * La persona escribe lo que hacia en ese trabajo con sus propias palabras y
 * recibe tres versiones completas del bloque de logros, no tres frases sueltas:
 * un bloque se elige entero, y comparar tres redacciones parciales no ayuda.
 */
export const experiencePrompt = (item: ExperienceItem, notes: string) => `
Convierte estas notas en logros para una hoja de vida.

Cargo: ${item.role || 'no especificado'}
Empresa: ${item.company || 'no especificada'}
Periodo: ${item.start || '?'} a ${item.current ? 'la actualidad' : item.end || '?'}

Lo que la persona hizo, en sus palabras:
"""${notes}"""

${item.bullets.filter(Boolean).length > 0 ? `Logros que ya tiene escritos (mejóralos, no los repitas tal cual):\n${item.bullets.filter(Boolean).map((b) => `- ${b}`).join('\n')}` : ''}

Reglas:
- Cada logro empieza con un verbo de acción en pasado y termina en un resultado.
- Si las notas traen una cifra, úsala. Si no la traen, deja el marcador [cifra] para que la persona lo complete. Nunca inventes números.
- Entre 12 y 24 palabras por logro.
- Nada de adjetivos de relleno ni de frases sobre "ambiente colaborativo".

Genera tres versiones alternativas del bloque completo, con enfoques distintos:
1. "resultados": prioriza impacto y números.
2. "responsabilidades": prioriza alcance, equipo y procesos a cargo.
3. "tecnica": prioriza herramientas, métodos y cómo se hizo.

Devuelve este JSON:
[
  { "enfoque": "resultados", "logros": ["...", "..."] },
  { "enfoque": "responsabilidades", "logros": ["...", "..."] },
  { "enfoque": "tecnica", "logros": ["...", "..."] }
]

Cada versión debe traer entre 3 y 5 logros.`
