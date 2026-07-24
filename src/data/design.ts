import type { CSSProperties } from 'react'
import type { DesignSettings } from '@/types/cv'

/**
 * Catalogo de opciones de diseno.
 * Son datos, no codigo: agregar una paleta o una tipografia es una linea.
 */

export interface Palette {
  id: string
  name: string
  primary: string
  surface: string
  surfaceText: string
  accent: string
}

export const palettes: Palette[] = [
  { id: 'indigo', name: 'Tinta', primary: '#1F5F8B', surface: '#12263A', surfaceText: '#F4F7FB', accent: '#E0A458' },
  { id: 'grafito', name: 'Grafito', primary: '#3D4451', surface: '#22262E', surfaceText: '#F5F5F4', accent: '#B08968' },
  { id: 'bosque', name: 'Bosque', primary: '#2F6B4F', surface: '#1B3A2C', surfaceText: '#F2F7F3', accent: '#D8A657' },
  { id: 'granate', name: 'Granate', primary: '#8C2F39', surface: '#3A1B20', surfaceText: '#FBF3F3', accent: '#C9A227' },
  { id: 'oceano', name: 'Océano', primary: '#155E75', surface: '#0E3B4C', surfaceText: '#ECFAFF', accent: '#F0A868' },
  { id: 'ciruela', name: 'Ciruela', primary: '#5B3A70', surface: '#2E1F3D', surfaceText: '#F7F1FA', accent: '#D9A441' },
  { id: 'arena', name: 'Arena', primary: '#7A5C3E', surface: '#EFE7DC', surfaceText: '#2B2117', accent: '#9C6644' },
  { id: 'acero', name: 'Acero', primary: '#33566E', surface: '#E8EDF2', surfaceText: '#1B2A38', accent: '#C2703D' },
]

export const headingFonts = ['Manrope', 'Montserrat', 'Playfair Display', 'IBM Plex Sans', 'Bricolage Grotesque', 'Lato']
export const bodyFonts = ['Public Sans', 'Lato', 'IBM Plex Sans', 'Source Serif 4', 'Manrope', 'Montserrat']

export const densityScale: Record<DesignSettings['density'], number> = {
  compacta: 0.82,
  normal: 1,
  amplia: 1.22,
}

/**
 * Traduce los ajustes a variables CSS.
 * Las plantillas consumen solo estas variables, asi que ninguna necesita
 * conocer la forma del store ni volver a calcular espaciados.
 */
export function designToCssVars(design: DesignSettings): CSSProperties {
  const scale = densityScale[design.density]
  return {
    '--cv-primary': design.primary,
    '--cv-primary-soft': hexToRgba(design.primary, 0.1),
    '--cv-primary-line': hexToRgba(design.primary, 0.25),
    '--cv-surface': design.surface,
    '--cv-surface-text': design.surfaceText,
    '--cv-surface-muted': hexToRgba(design.surfaceText, 0.7),
    '--cv-accent': design.accent,
    '--cv-font-heading': `'${design.fontHeading}', sans-serif`,
    '--cv-font-body': `'${design.fontBody}', sans-serif`,
    '--cv-font-size': `${design.fontSize}pt`,
    '--cv-line-height': String(design.lineHeight),
    '--cv-text-align': design.textAlign === 'justificado' ? 'justify' : 'left',
    // La particion de palabras solo se activa junto con la justificacion:
    // en texto en bandera no aporta nada y ensucia la lectura.
    '--cv-hyphens': design.textAlign === 'justificado' && design.hyphenate ? 'auto' : 'manual',
    '--cv-gap': `${design.sectionGap * scale}px`,
    '--cv-gap-sm': `${design.sectionGap * scale * 0.45}px`,
    '--cv-pad': `${Math.round(design.sectionGap * scale * 2)}px`,
    '--cv-photo-size': `${design.photoSize}px`,
    '--cv-photo-radius': `${design.photoRadius}px`,
    '--cv-photo-border': `${design.photoBorder}px`,
  } as CSSProperties
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const int = parseInt(full, 16)
  if (Number.isNaN(int)) return hex
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Contraste relativo, para avisar cuando una combinacion no se va a leer. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
    const int = parseInt(full, 16)
    const ch = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  }
  const l1 = lum(a)
  const l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
