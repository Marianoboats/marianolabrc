# Mariano RC — sitio web

Web personal y portfolio de **Mariano RC** (modelismo naval de radiocontrol en madera).
Es un sitio **estático**: solo HTML, CSS y un poco de JavaScript. No necesita servidor,
base de datos ni instalación. Se abre haciendo doble clic en `index.html`.

Dominio: **marianorc.com** (ya registrado; hay que apuntarlo al hosting elegido).

## Estructura de archivos

```
Mariano/
├── index.html        ← página principal (inicio, el astillero, trabajos, bitácora, contacto)
├── bitacora.html     ← entradas largas del blog
├── styles.css        ← todo el diseño
├── script.js         ← menú móvil, filtros de la galería y visor de fotos
├── img/              ← imágenes que usa la web (ya optimizadas de nombre)
└── images/           ← carpeta original con todas las fotos de WhatsApp (copia de seguridad)
```

## ✏️ Correo de contacto

El correo de contacto es `marianojavierhernandez@gmail.com`. Si cambia, aparece en
`index.html` (3 veces: botón, texto y pie) y en `bitacora.html` (1 vez, pie de página).
Con cualquier editor de texto: *Buscar y reemplazar* → sustituir todas las apariciones.

## Cómo publicarlo en internet (opciones gratuitas)

Cualquiera de estas sirve; solo hay que subir la carpeta entera:

- **Netlify Drop** — https://app.netlify.com/drop — arrastras la carpeta y te da una URL.
- **GitHub Pages** — subes los archivos a un repositorio y lo activas en *Settings → Pages*.
- **Cloudflare Pages** o el hosting que ya tengáis.

El dominio `marianorc.com` ya está registrado: se apunta (DNS) al hosting elegido.

## Tareas habituales

### Añadir fotos a la galería

1. Copia la foto nueva dentro de `img/` con un nombre claro y sin espacios
   (por ejemplo `clasico-nueva-lancha.jpg`).
2. En `index.html`, dentro de `<div class="grid" id="grid">`, copia un bloque como este
   y cámbialo:

   ```html
   <figure class="shot" data-cat="clasicos">
     <img src="img/clasico-nueva-lancha.jpg" loading="lazy" alt="Descripción de la foto">
     <figcaption>Texto que aparece al pasar el ratón</figcaption>
   </figure>
   ```

3. `data-cat` decide en qué filtro aparece. Valores posibles:
   `clasicos`, `construccion`, `restauracion`, `competicion`, `navegando`.

> Consejo: si las fotos pesan mucho (más de ~500 KB), conviene reducirlas antes
> con https://squoosh.app para que la web cargue rápido.

### Editar o añadir una entrada de la bitácora

Las 3 entradas actuales son **de muestra**, escritas a partir de las fotos. Edítalas
libremente en `bitacora.html`. Para una entrada nueva, copia un bloque completo
`<article class="entry" id="...">…</article>` y cambia el `id`, el título, la fecha,
la foto de portada y el texto. Si quieres que salga también en la portada, copia una
de las tarjetas de la sección `bitacora-preview` en `index.html`.

### Cambiar textos de la portada

- La introducción está en `index.html`, sección `El astillero` (`id="astillero"`).
- El titular grande y el lema están en la sección `hero` (`id="inicio"`).

## Detalles de diseño

- Tipografías: *Fraunces* (títulos) e *Inter* (texto), cargadas desde Google Fonts.
- Colores tomados del logotipo (azul petróleo, crema, caoba, latón).
- Cabecera y pie sobre una barra negra (`--bar`, `#0d0f14`) que combina con el logo.
- Se adapta a móvil y respeta el modo oscuro del sistema.
- El visor de fotos (lightbox) funciona con teclado (`←` `→` `Esc`) y deslizando en móvil.

### El logotipo

El sello dice **«Mariano RC»**. `crear_logo_marianorc.py` lo compone a partir de la
copia de seguridad `images/logo.jpeg` (que aún conserva el rótulo antiguo) y guarda el
resultado en `img/logo.jpg`. A partir de ahí, `crear_logos.py` genera las dos versiones
que usa la web:

- **`img/logo-negro.png`** — trazo crema sobre fondo negro. Es la que usa la web
  (cabecera y pie).
- **`img/logo-marca.png`** — el mismo trazo crema pero con **fondo transparente**,
  por si se quiere colocar sobre otro color (firma de correo, redes, etc.).

Para regenerarlo todo: `python crear_logo_marianorc.py && python crear_logos.py`.

### El favicon (icono de la pestaña)

Es una lancha clásica dibujada, en crema sobre el negro de la marca. Archivos en la raíz:
`favicon.svg` (el que usan los navegadores modernos), `favicon.ico` (compatibilidad) y
`apple-touch-icon.png` (para cuando se guarda la web en la pantalla de inicio de un iPhone).
Se regeneran con `python crear_favicon.py`.

## Créditos

Fotografías: Mariano RC. Diseño y desarrollo del sitio: encargo personal, 2026.
