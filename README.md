# Escuadrón Antiplaga

Juego de navegador para PC y celular. Las hormigas van directo al picnic y tu escuadrón de fumigadores tiene que frenarlas.

**Jugar:** https://doldan-edison.github.io/escuadron-antiplaga/

## Cómo se juega

- Deslizá el dedo (o mové el mouse, o usá las flechas) para mover al escuadrón. Dispara solo.
- Pasá por la puerta azul y esquivá la roja. Si le disparás a una puerta de suma o resta, el número sube.
- Rompé las cajas a tiros para ganar refuerzos, cadencia o daño.
- Al final de cada nivel hay un jefe: Escarabajo Rinoceronte, Araña Tejedora, Avispa Furiosa, Escorpión Dorado y Hormiga Reina.
- Después de cada nivel elegís una mejora que dura toda la partida.

Son 5 niveles, unos 10 minutos.

## Cómo está hecho

Todo el juego está en `index.html`: canvas 2D, sin dependencias. Las puertas, los disparos, los efectos y el sonido se generan por código.

El suelo usa texturas en perspectiva: el césped se genera por código y el camino sale de `arte/tierra.webp`; las dos se tiñen según el nivel. Las plantas, las piedras y la caja son imágenes de `arte/` hechas con IA, igual que los personajes.

Los personajes (los cinco jefes, las tres hormigas y el fumigador) son imágenes de `arte/`, generadas con IA en Google Flow sobre fondo magenta y recortadas con `herramientas/recortar.mjs` (necesita Node y ffmpeg). Si una imagen no carga, el juego dibuja ese personaje por código.

Todos los personajes además están animados (jefes, hormigas y fumigador): cada uno tiene una hoja de 12 cuadros (`arte/*-anim.webp`) sacada de un video corto generado en Flow. `herramientas/hoja-animacion.mjs` busca en el video un ciclo que cierre en bucle, le quita el fondo a cada cuadro y arma la hoja. La hoja de cada jefe se descarga recién al llegar a su nivel.

Por las imágenes, para probarlo en la PC conviene servir la carpeta en vez de abrir el archivo suelto:

```bash
python -m http.server 8377
```
