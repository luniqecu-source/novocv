import ColumnaTemplate from './ColumnaTemplate'
import BandaTemplate from './BandaTemplate'
import SobrioTemplate from './SobrioTemplate'
import CronologiaTemplate from './CronologiaTemplate'
import NocturnoTemplate from './NocturnoTemplate'
import VidrioTemplate from './VidrioTemplate'
import InfografiaTemplate from './InfografiaTemplate'
import SuizaTemplate from './SuizaTemplate'
import TramaTemplate from './TramaTemplate'
import ReticulaTemplate from './ReticulaTemplate'
import DiagonalTemplate from './DiagonalTemplate'
import FranjasTemplate from './FranjasTemplate'
import EsquinasTemplate from './EsquinasTemplate'
import RecorteTemplate from './RecorteTemplate'
import SenderoTemplate from './SenderoTemplate'
import BloquesTemplate from './BloquesTemplate'
import type { TemplateMeta } from './types'

/**
 * Registro de plantillas.
 *
 * Este archivo es el unico punto de contacto entre el editor y las plantillas.
 * Para agregar una nueva: crear el componente que cumpla TemplateProps,
 * importarlo aqui y anadir su entrada. Nada mas cambia en el proyecto.
 */
export const templates: TemplateMeta[] = [
  {
    id: 'columna',
    name: 'Columna',
    description: 'Barra lateral en color. Legible para filtros automáticos.',
    swatch: ['#12263A', '#FFFFFF'],
    component: ColumnaTemplate,
  },
  {
    id: 'banda',
    name: 'Banda',
    description: 'Franja superior ancha y cuerpo a dos columnas.',
    swatch: ['#1F5F8B', '#F6F8FA'],
    component: BandaTemplate,
  },
  {
    id: 'sobrio',
    name: 'Sobrio',
    description: 'Solo tipografía. La opción más segura para banca y sector público.',
    swatch: ['#FFFFFF', '#3D4451'],
    component: SobrioTemplate,
  },
  {
    id: 'cronologia',
    name: 'Cronología',
    description: 'Línea de tiempo continua entre experiencia y formación.',
    swatch: ['#F6F8FA', '#E0A458'],
    component: CronologiaTemplate,
  },
  {
    id: 'nocturno',
    name: 'Nocturno',
    description: 'Hoja completa en oscuro. Requiere imprimir con fondos activados.',
    swatch: ['#12263A', '#E0A458'],
    component: NocturnoTemplate,
  },
  {
    id: 'vidrio',
    name: 'Vidrio',
    description: 'Tarjetas superpuestas sobre una banda de color.',
    swatch: ['#1F5F8B', '#FFFFFF'],
    component: VidrioTemplate,
  },
  {
    id: 'infografia',
    name: 'Infografía',
    description: 'Cifras y anillos de nivel. Para perfiles comerciales y creativos.',
    swatch: ['#FFFFFF', '#E0A458'],
    component: InfografiaTemplate,
  },
  {
    id: 'suiza',
    name: 'Suiza',
    description: 'Retícula editorial con filetes finos. Imprime igual en blanco y negro.',
    swatch: ['#FFFFFF', '#12263A'],
    component: SuizaTemplate,
  },
  {
    id: 'trama',
    name: 'Trama',
    description: 'Retícula de puntos en la banda lateral. Minimalista con textura.',
    swatch: ['#FFFFFF', '#12263A'],
    component: TramaTemplate,
  },
  {
    id: 'reticula',
    name: 'Retícula',
    description: 'Secciones numeradas sobre malla modular. Ordenada y muy legible.',
    swatch: ['#F6F8FA', '#1F5F8B'],
    component: ReticulaTemplate,
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    description: 'Encabezado cortado en ángulo. La más gráfica del conjunto.',
    swatch: ['#12263A', '#E0A458'],
    component: DiagonalTemplate,
  },
  {
    id: 'franjas',
    name: 'Franjas',
    description: 'Separadores de rayas finas, casi monocroma. Se parte entre hojas sin perder nada.',
    swatch: ['#FFFFFF', '#3D4451'],
    component: FranjasTemplate,
  },
  {
    id: 'esquinas',
    name: 'Esquinas',
    description: 'Banda lateral con triángulos de color. Enérgica y muy visual.',
    swatch: ['#12263A', '#E0A458'],
    component: EsquinasTemplate,
  },
  {
    id: 'recorte',
    name: 'Recorte',
    description: 'Cabecera en bloque con la foto biselada. Moderna y con carácter.',
    swatch: ['#8C2F39', '#F2B705'],
    component: RecorteTemplate,
  },
  {
    id: 'sendero',
    name: 'Sendero',
    description: 'Banda de color y línea de tiempo de puntos. Trayectoria clara de un vistazo.',
    swatch: ['#C64B3C', '#1B2A38'],
    component: SenderoTemplate,
  },
  {
    id: 'bloques',
    name: 'Bloques',
    description: 'Cada sección es una tarjeta. El orden se lee al instante; ideal para reordenar.',
    swatch: ['#0F766E', '#F97316'],
    component: BloquesTemplate,
  },
]

export const templateById = (id: string): TemplateMeta => templates.find((t) => t.id === id) ?? templates[0]
