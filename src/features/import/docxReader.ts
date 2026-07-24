/** Lectura de Word. Mammoth se carga bajo demanda para no pesar en el arranque. */
export async function readDocx(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value
}

export async function readPlainText(file: File): Promise<string> {
  return file.text()
}
