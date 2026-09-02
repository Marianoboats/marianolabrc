"""
Genera las versiones del logotipo que usa la web a partir de img/logo.jpg
(el original: trazo azul petróleo sobre fondo crema).

    python crear_logos.py

Crea:
  img/logo-negro.png   -> trazo crema sobre fondo negro (la que usa la web)
  img/logo-marca.png   -> trazo crema sobre fondo transparente

Requiere Pillow:  pip install pillow
"""
from PIL import Image, ImageOps

ORIGEN = "img/logo.jpg"
ART = (240, 235, 223)   # color del trazo (crema)
BG  = (13, 15, 20)      # color del fondo negro (= variable --bar del CSS)
ANCHO = 520             # ancho de salida en píxeles

src = Image.open(ORIGEN).convert("RGB")
inv = ImageOps.invert(src.convert("L"))          # crema -> oscuro, trazo -> claro

# recorte al contenido
mascara = inv.point(lambda p: 255 if p > 40 else 0)
l, t, r, b = mascara.getbbox()
pad = 22
l = max(0, l - pad); t = max(0, t - pad)
r = min(src.width, r + pad); b = min(src.height, b + pad)
inv = inv.crop((l, t, r, b))

alto = round(inv.height * ANCHO / inv.width)
inv = inv.resize((ANCHO, alto), Image.LANCZOS)

# --- fondo negro sólido ---
ImageOps.colorize(inv, black=BG, white=ART).convert("RGB") \
    .quantize(colors=48, method=Image.FASTOCTREE) \
    .save("img/logo-negro.png", optimize=True)

# --- fondo transparente ---
alpha = inv.point(lambda p: 0 if p < 8 else min(255, int((p - 8) * 1.75)))
marca = Image.new("RGBA", (ANCHO, alto), ART + (0,))
marca.putalpha(alpha)
marca.save("img/logo-marca.png", optimize=True)

print("Hecho: img/logo-negro.png  y  img/logo-marca.png")
