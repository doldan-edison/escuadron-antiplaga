# Escuadrón Antiplaga

Juego de navegador para PC y celular. Las hormigas van directo al picnic y tu escuadrón de fumigadores tiene que frenarlas.

**Jugar:** https://doldan-edison.github.io/escuadron-antiplaga/

## Cómo se juega

- Deslizá el dedo (o mové el mouse, o usá las flechas) para mover al escuadrón. Dispara solo.
- Pasá por la puerta azul y esquivá la roja. Si le disparás a una puerta de suma o resta, el número sube.
- Rompé las cajas a tiros para ganar refuerzos, cadencia o daño.
- Pasá por encima de los regalos (paquetes rosados): escudo, bomba insecticida, hielo, drones, furia o refuerzos. Se activan solos.
- Al final de cada nivel se abre un portal y sale un jefe: Escarabajo Rinoceronte, Araña Tejedora, Avispa Furiosa, Escorpión Dorado y Hormiga Reina. Al vencerlo, el escuadrón cruza el portal hacia el nivel siguiente.
- Después de cada nivel elegís 1 de 3 tarjetas: una mejora que dura toda la partida o un arma nueva (lanzallamas desde el nivel 1, rayo eléctrico desde el 3). El arma se puede cambiar en la pausa.

Son 5 niveles, unos 10 minutos. Desde el nivel 2 la dificultad sube de a poco: rojas en zigzag, hormigas que escupen, acorazadas, puertas que cruzan sus mitades, una hormiga gigante y jefes que se enfurecen con poca vida.

## Cómo está hecho

Todo el juego está en `index.html`: canvas 2D, sin dependencias. Las puertas, los disparos, los regalos, el portal, los efectos y el sonido se generan por código.

La dificultad de cada nivel se ajusta en la tabla `LV` (`press` = cuánto exigen las oleadas, `merced` = cuánto se ablanda el enemigo si venís con poco escuadrón). Para medirla sin jugar, en la consola del navegador: `__antSim(nivel, mejoras, acierto, n, torpeza, ayuda, arma)` corre una partida con piloto automático y devuelve el resultado.

El suelo usa texturas en perspectiva: el césped se genera por código y el camino sale de `arte/tierra.webp`; las dos se tiñen según el nivel. Las plantas, las piedras y la caja son imágenes de `arte/` hechas con IA, igual que los personajes.

Los personajes (los cinco jefes, las tres hormigas y el fumigador) son imágenes de `arte/`, generadas con IA en Google Flow sobre fondo magenta y recortadas con `herramientas/recortar.mjs` (necesita Node y ffmpeg). Si una imagen no carga, el juego dibuja ese personaje por código.

Todos los personajes además están animados (jefes, hormigas y fumigador): cada uno tiene una hoja de 12 cuadros (`arte/*-anim.webp`) sacada de un video corto generado en Flow. `herramientas/hoja-animacion.mjs` busca en el video un ciclo que cierre en bucle, le quita el fondo a cada cuadro y arma la hoja. La hoja de cada jefe se descarga recién al llegar a su nivel.

Por las imágenes, para probarlo en la PC conviene servir la carpeta en vez de abrir el archivo suelto:

```bash
python -m http.server 8377
```
