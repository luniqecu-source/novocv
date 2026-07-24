# Folio

Editor de hoja de vida A4. Se escribe directamente sobre la hoja, el diseño se ajusta en vivo y el resultado sale en PDF con texto seleccionable.

Reescritura estructurada de un prototipo de un solo archivo HTML con 56 funciones globales y el DOM como fuente de verdad.

---

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Otros comandos:

```bash
npm run build       # verificación de tipos + compilado de producción
npm run typecheck   # solo tipos
npm run preview     # servir el compilado
```

Requiere Node 18 o superior.

### Extensiones recomendadas de VS Code

`ESLint`, `Prettier`, `Tailwind CSS IntelliSense` y `TypeScript Vue Plugin` no; con `Tailwind CSS IntelliSense` basta para el autocompletado de clases.

---

## Cómo está organizado

```
src/
├── types/cv.ts          Contrato de datos. Todo lo demás depende de este archivo.
├── data/                Documento inicial, paletas, tipografías, variables CSS.
├── store/               Zustand. cvStore = documento; uiStore = interfaz.
├── lib/                 Utilidades puras: rutas, persistencia, formato.
├── components/ui/       Piezas visuales sin lógica de negocio.
└── features/
    ├── editor/          Armazón: barra superior, riel, inspector, atajos.
    ├── canvas/          Mesa de trabajo, zoom y edición directa sobre la hoja.
    ├── panels/          Un panel por sección del documento.
    ├── templates/       Plantillas + registro. Aisladas del resto.
    ├── import/          Lectura de PDF, DOCX y parser heurístico.
    ├── ai/              Cliente del asistente e instrucciones.
    └── export/          Impresión vectorial y rasterizado de respaldo.
```

### Las tres reglas que sostienen la estructura

**1. El store es la única fuente de verdad.** Ningún componente lee el DOM para saber en qué estado está el documento. La hoja que se ve en pantalla es una función pura de `doc`. Esto es lo que hace que deshacer, guardar, importar y exportar funcionen sin coordinarse entre sí: todos operan sobre el mismo objeto.

**2. Las plantillas no conocen el store.** Reciben `{ data, design }` y devuelven JSX. Leen colores y espaciados desde variables CSS, nunca desde los ajustes en crudo. Una plantilla se puede renderizar en una prueba sin montar la aplicación.

**3. Los efectos secundarios viven en módulos sin React.** `import/`, `ai/` y `export/` son TypeScript plano. `parseCv` recibe una cadena y devuelve datos; no sabe si el texto vino de un PDF, de Word o del portapapeles.

---

## Plantillas incluidas

| Plantilla | Cuándo conviene |
|---|---|
| Columna | Barra lateral en color. Formato más común y seguro. |
| Banda | Franja superior ancha. Gana espacio para hojas con mucho texto. |
| Sobrio | Solo tipografía. Banca, sector público, procesos formales. |
| Cronología | Línea de tiempo continua. Trayectorias largas y sin saltos. |
| Nocturno | Hoja completa en oscuro. Diseño y tecnología. |
| Vidrio | Tarjetas superpuestas sobre una banda de color. |
| Infografía | Cifras y anillos de nivel. Perfiles comerciales y creativos. |
| Suiza | Retícula editorial con filetes finos. Imprime igual en blanco y negro. |
| Trama | Retícula de puntos en la banda lateral. Minimalista con textura. |
| Retícula | Secciones numeradas sobre malla modular. Ordenada y muy legible. |
| Diagonal | Encabezado cortado en ángulo. La más gráfica del conjunto. |
| Franjas | Separadores de rayas finas, casi monocroma. Se parte entre hojas sin perder nada. |

Los patrones de Trama, Retícula y Franjas se generan con gradientes CSS repetidos, no con imágenes: pesan cero, escalan a cualquier resolución y se imprimen nítidos. La diagonal usa `clip-path` sobre una capa de fondo, así que el texto sigue en horizontal.

Las cifras de la plantilla Infografía se calculan de los datos del documento: los años de experiencia salen del primer año reconocible en los cargos, y si no hay ninguno se muestra un guion en vez de una cifra inventada.

## Cómo agregar una plantilla

Tres pasos, sin tocar nada más:

```tsx
// src/features/templates/MiPlantilla.tsx
import type { TemplateProps } from './types'
import { Editable } from '@/features/canvas/Editable'
import { Section, SectionTitle } from './parts'

export default function MiPlantilla({ data }: TemplateProps) {
  return (
    <div style={{ padding: 'var(--cv-pad)' }}>
      <Editable path="personal.fullName" as="h1" placeholder="Tu nombre" />
      <Section>
        <SectionTitle>Perfil</SectionTitle>
        <Editable path="summary" multiline placeholder="Tu resumen" />
      </Section>
    </div>
  )
}
```

```ts
// src/features/templates/registry.ts
{
  id: 'mi-plantilla',
  name: 'Mi plantilla',
  description: 'Para qué sirve y cuándo conviene.',
  swatch: ['#12263A', '#FFFFFF'],
  component: MiPlantilla,
}
```

Aparece sola en el panel de diseño. `Editable` se encarga de leer, escribir e integrarse con el historial de deshacer.

### Variables disponibles dentro de una plantilla

`--cv-primary`, `--cv-primary-soft`, `--cv-primary-line`, `--cv-surface`, `--cv-surface-text`, `--cv-accent`, `--cv-font-heading`, `--cv-font-body`, `--cv-font-size`, `--cv-line-height`, `--cv-gap`, `--cv-gap-sm`, `--cv-pad`, `--cv-photo-size`, `--cv-photo-radius`, `--cv-photo-border`.

Usarlas en vez de valores fijos es lo que hace que los controles de densidad y tamaño funcionen en cualquier plantilla nueva sin código adicional.

## Cómo agregar un campo al documento

1. Añádelo a la interfaz en `types/cv.ts`.
2. Dale un valor en `data/defaultCv.ts`.
3. Súbele la versión en `DOC_VERSION` y escribe la migración en `lib/storage.ts` si el cambio rompe documentos guardados.
4. Úsalo desde un panel y desde las plantillas.

El compilador señala todos los puntos que faltan por actualizar.

---

## Exportación a PDF

Hay dos rutas y el orden es deliberado:

| Ruta | Resultado | Cuándo usarla |
|---|---|---|
| Imprimir a PDF | Texto vectorial y seleccionable | Siempre que se pueda |
| PDF como imagen | Captura fiel del diseño | Cuando el documento pasa de una hoja y la plantilla tiene bloques de color |

La barra superior indica cuántas hojas ocupa el documento, y cuando pasa de una aparece una línea sobre el lienzo marcando dónde cae el corte.

### Paginación

El reparto en hojas no se delega al navegador: lo calcula `features/canvas/usePageLayout.ts` sobre el lienzo. Hay dos clases de elemento:

| Marca | Quién la lleva | Por defecto |
|---|---|---|
| `data-group` | Cada sección | Fluye. Ocupa las hojas que necesite; solo se evita que su encabezado quede solo al pie. |
| `data-block` | Cada cargo y cada título académico | Se mantiene entero: si no cabe, baja completo a la hoja siguiente. |
| `data-line` | Cada viñeta de logro y cada referencia | Nunca se parte. No aparece en el gestor: son demasiadas para administrarlas a mano. |

`data-line` es lo que evita el peor corte posible, que es una línea de texto partida por la mitad. Cuando una lista de logros es más alta que la hoja, el bloque padre fluye pero cada viñeta salta entera al área útil de la página siguiente, con su margen.

Que las secciones fluyan es deliberado. Tratarlas como indivisibles produce el peor resultado posible: una experiencia con seis cargos mide más de media hoja, se va completa a la página siguiente y deja un hueco enorme detrás.

**El empuje se aplica con `padding-top`, nunca con `margin-top`.** Las plantillas usan `margin-top` para separar secciones; limpiarlo antes de recalcular borraba esa separación y dejaba las secciones pegadas unas a otras. El padding está libre en estos elementos, así que ambas cosas conviven.

Como el motor decide las posiciones, el CSS de impresión no lleva `break-inside` ni `orphans`. Si el navegador desplazara contenido por su cuenta, el PDF dejaría de coincidir con el lienzo.

### El gestor

El panel **Páginas** lista los bloques que el motor encuentra en la hoja, con su tipo y en qué página cae cada uno. La lista no está escrita a mano: la publica el propio motor, así que refleja siempre la plantilla activa y una plantilla nueva aparece sola.

Por bloque hay tres controles independientes:

- **Hoja nueva** — fuerza el inicio de página.
- **Entero / Puede partirse** — invierte el comportamiento por defecto de ese bloque concreto.
- **Espacio antes** — milímetros extra, en pasos de 2. Es el control de ajuste fino cuando ninguna regla automática da el resultado que quieres.

Y dos globales: el **margen de las hojas** y **mantener las entradas enteras**, que fija el valor por defecto que cada bloque puede contradecir.

Las claves de sección (`perfil`, `experiencia`, `formacion`, `competencias`, `herramientas`, `referencias`) son estables entre plantillas, así que los ajustes sobreviven a un cambio de plantilla. Las entradas usan el id del propio elemento.

**Límite conocido.** Un bloque que cruza el corte no recibe margen superior en la hoja siguiente: su texto continúa desde el borde. Reservar margen a mitad de un elemento exige fragmentarlo de verdad, que es otro orden de problema.

**Colores.** El bloque de impresión fuerza `print-color-adjust: exact`, así que los fondos salen sin depender de la casilla «Gráficos de fondo» del diálogo. Firefox la respeta igualmente; si algún fondo falta, revisa esa casilla.

**Limitación conocida.** Al imprimir, un fondo de color que pertenece a un elemento partido entre dos hojas solo se pinta en la primera. Afecta a las plantillas con bloques de color a sangre: Columna, Nocturno y Vidrio. Si tu hoja de vida ocupa dos páginas, tienes tres salidas: reducir densidad y tamaño de texto hasta que quepa en una, cambiar a una plantilla sin bloques (Sobrio, Suiza, Cronología), o exportar como imagen. La solución de fondo es paginar de verdad, repartiendo el contenido en varios elementos `.paper`.

Los filtros automáticos de selección de personal leen el texto del PDF. Un PDF hecho de imágenes es, para ellos, una hoja en blanco. El prototipo original solo ofrecía la segunda ruta; invertir esa preferencia probablemente sea el cambio más útil de todo el proyecto para quien está buscando empleo.

Para la plantilla **Nocturno** hay que activar «Gráficos de fondo» en el diálogo de impresión del navegador, o el fondo oscuro sale en blanco.

---

## Asistente de IA (Gemini)

Tres funciones, todas opcionales:

| Dónde | Qué hace |
|---|---|
| Panel «Perfil» | Propone tres resúmenes con enfoques distintos: resultados, especialidad técnica, liderazgo. |
| Panel «Experiencia» | Escribes con tus palabras qué hacías en el cargo y devuelve tres versiones del bloque de logros. |
| Panel «Asistente» | Compara la hoja contra una oferta concreta y redacta la carta de presentación. |

### La clave

Se genera en [Google AI Studio](https://aistudio.google.com/apikey) y empieza por `AIza`. Pégala en el panel «Asistente» → *Configurar*. Se guarda solo en `localStorage`.

Aviso con fecha: Google anunció que a partir de septiembre de 2026 la API rechaza las claves de tipo *Standard*. Las claves nuevas creadas en AI Studio ya son del tipo correcto; si reutilizas una antigua, revisa la columna *Key Type* en la consola.

### Modo directo y modo proxy

**Directo (por defecto).** Las peticiones van del navegador a `generativelanguage.googleapis.com` con la cabecera `x-goog-api-key`. Sirve mientras trabajas en `localhost`.

**Proxy (para publicar).** Define `VITE_AI_PROXY_URL` en `.env` apuntando a un servicio propio que guarde la clave y reenvíe la petición. Si publicas en modo directo, cualquier visitante puede leer tu clave y gastar tu cuota.

### El modelo

En el diálogo de la clave, el botón **Ver los modelos que acepta mi clave** consulta la API y llena el desplegable. La elección se guarda en `localStorage` y manda sobre `VITE_AI_MODEL`, que solo fija el valor inicial.

Los nombres de los modelos de Gemini cambian cada pocos meses, así que una lista escrita en el código garantiza un error 404 más adelante. Preguntárselo a la API es lo único que no caduca.

Las peticiones que esperan datos estructurados usan `responseMimeType: application/json`, así que Gemini devuelve JSON válido en vez de texto con bloques de código. `parseJsonReply` se mantiene igual como red de seguridad.

### Cambiar de proveedor

Toda la aplicación habla con la IA a través de `ask()` en `features/ai/client.ts`. Migrar de Anthropic a Gemini fue reescribir ese archivo y ajustar las cadenas de `prompts.ts`: ningún panel, plantilla ni store cambió. Si algún día quieres volver o probar otro proveedor, ese es el único archivo que se toca.

---

## Campos visibles

`contactEntries()` en `features/templates/parts.tsx` decide **qué** datos de contacto se muestran; cada plantilla decide **cómo** pintarlos. Antes cada plantilla traía su propia lista, y por eso el documento de identidad aparecía en unas y en otras no.

Los interruptores están en el panel **Diseño**, sección «Datos visibles»: fotografía, documento de identidad, licencia de conducir, año de nacimiento, enlaces y los medidores de nivel de competencias y herramientas. Las competencias salen sin barra por defecto: un porcentaje sobre «Liderazgo» es una cifra que nadie midió, mientras que en una herramienta sí comunica algo. Apagar uno lo oculta de las ocho plantillas sin borrar lo que escribiste.

Para agregar un campo nuevo al conjunto: añádelo a `Personal` en `types/cv.ts`, agrégale un interruptor en `DesignSettings`, y súmalo al arreglo de `contactEntries`. Las ocho plantillas lo recogen solas.

## Persistencia

El documento se guarda en `localStorage` en cada cambio, con esquema versionado y un punto único de migración. El botón «Respaldo» descarga un `.json` para mover el trabajo entre equipos.

Las fotografías se guardan en base64 dentro del mismo documento. Una imagen grande puede llenar la cuota de `localStorage`; por eso el panel rechaza archivos de más de 2,5 MB.

---

## Qué quedó fuera a propósito

- **Paginación real.** El lienzo muestra una hoja continua con guías donde caerá el corte, pero el contenido no se reparte en varios elementos `.paper`. Repartirlo exige medir bloque por bloque y decidir dónde cabe cada uno; es la única forma de que los fondos de color lleguen a la segunda hoja. El lugar es `features/canvas/Canvas.tsx`.
- **Pruebas.** No hay suite configurada. Los candidatos naturales son `lib/path.ts`, `data/design.ts` y sobre todo `features/import/cvParser.ts`, que es puro y donde más rinde una prueba.
- **Reordenar secciones enteras.** Se pueden reordenar los elementos dentro de una sección, pero no mover «Formación» por encima de «Experiencia». El orden lo fija cada plantilla.
