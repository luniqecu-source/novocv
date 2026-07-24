import { DOC_VERSION, type CvDocument } from '@/types/cv'
import { uid } from '@/lib/id'

/**
 * Documento de arranque. Contenido de ejemplo realista y no de relleno:
 * el usuario ve como se comporta cada bloque antes de escribir nada.
 */
export const defaultDocument = (): CvDocument => ({
  version: DOC_VERSION,
  data: {
    personal: {
      fullName: 'Valentina Ocampo Ríos',
      headline: 'Analista de operaciones logísticas',
      phone: '+593 99 123 4567',
      email: 'valentina.ocampo@correo.com',
      location: 'Cuenca, Ecuador',
      documentId: '0102345678',
      license: 'Tipo B',
      birthDate: '1994',
      photo: null,
      links: [
        { id: uid('ln'), label: 'LinkedIn', url: 'linkedin.com/in/vocampo' },
      ],
    },
    summary:
      'Analista con seis años coordinando cadenas de abastecimiento en retail y manufactura. Reduje el costo por envío un 18 % rediseñando rutas y renegociando con transportistas. Trabajo cómoda entre el dato y el andén: escribo las consultas y también camino la bodega.',
    experience: [
      {
        id: uid('ex'),
        role: 'Coordinadora de operaciones',
        company: 'Distribuidora Andina',
        location: 'Cuenca',
        start: 'Mar 2022',
        end: '',
        current: true,
        bullets: [
          'Rediseñé el ruteo de 14 vehículos y bajé el costo por envío de $4,10 a $3,36.',
          'Implementé un tablero de indicadores que redujo el cierre mensual de 5 días a 1.',
          'Dirijo un equipo de 9 personas entre bodega y despacho.',
        ],
      },
      {
        id: uid('ex'),
        role: 'Analista de inventarios',
        company: 'Textiles del Austro',
        location: 'Cuenca',
        start: 'Ene 2020',
        end: 'Feb 2022',
        current: false,
        bullets: [
          'Llevé la exactitud de inventario del 87 % al 98,4 % en tres trimestres.',
          'Automaticé la conciliación de stock en SQL y ahorré 20 horas al mes.',
        ],
      },
    ],
    education: [
      {
        id: uid('ed'),
        degree: 'Ingeniería en Producción y Operaciones',
        institution: 'Universidad del Azuay',
        location: 'Cuenca',
        start: '2013',
        end: '2018',
        note: 'Tesis sobre optimización de rutas de última milla.',
      },
    ],
    skills: [
      { id: uid('sk'), name: 'Análisis de datos', level: 90 },
      { id: uid('sk'), name: 'Negociación con proveedores', level: 80 },
      { id: uid('sk'), name: 'Liderazgo de equipo', level: 75 },
      { id: uid('sk'), name: 'Inglés B2', level: 65 },
    ],
    tools: [
      { id: uid('tl'), name: 'Excel avanzado', level: 95 },
      { id: uid('tl'), name: 'SQL', level: 80 },
      { id: uid('tl'), name: 'Power BI', level: 75 },
      { id: uid('tl'), name: 'SAP MM', level: 60 },
    ],
    references: [
      {
        id: uid('rf'),
        kind: 'profesional',
        name: 'Marcelo Peñafiel',
        relation: 'Gerente de operaciones',
        company: 'Distribuidora Andina',
        phone: '+593 98 765 4321',
      },
      {
        id: uid('rf'),
        kind: 'personal',
        name: 'Lucía Bermeo',
        relation: 'Colega',
        company: 'Textiles del Austro',
        phone: '+593 99 555 1212',
      },
    ],
  },
  design: {
    templateId: 'columna',
    primary: '#1F5F8B',
    surface: '#12263A',
    surfaceText: '#F4F7FB',
    accent: '#E0A458',
    fontHeading: 'Manrope',
    fontBody: 'Public Sans',
    fontSize: 10.5,
    lineHeight: 1.45,
    sectionGap: 18,
    density: 'normal',
    textAlign: 'justificado',
    hyphenate: true,
    pageMargin: 12,
    keepBlocks: true,
    blocks: {},
    showPhoto: true,
    showDocumentId: true,
    showLicense: true,
    showBirthDate: false,
    showLinks: true,
    showSkillLevels: false,
    showToolLevels: true,
    photoSize: 108,
    photoRadius: 999,
    photoBorder: 3,
  },
})
