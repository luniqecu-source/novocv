import type { ComponentType } from 'react'
import type { CvData, DesignSettings } from '@/types/cv'

/** Contrato que cumple toda plantilla. Recibe datos, no el store. */
export interface TemplateProps {
  data: CvData
  design: DesignSettings
}

export interface TemplateMeta {
  id: string
  name: string
  description: string
  /** Colores de la miniatura del selector. */
  swatch: [string, string]
  component: ComponentType<TemplateProps>
}
