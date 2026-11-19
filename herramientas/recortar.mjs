// Quita el fondo liso (magenta) de una imagen generada y la deja recortada en WebP con transparencia.
// Uso: node herramientas/recortar.mjs <entrada.jpg> <salida.webp> [ancho en px, por defecto 720]
// Solo borra el fondo que está conectado con el borde o que es del color exacto del fondo,
// así los reflejos rosados dentro del personaje no se agujerean.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const FF_DIR = process.env.FFMPEG_DIR || 'C:\\EDISON\\videos\\ffmpeg';
const FF = path.join(FF_DIR, 'ffmpeg.exe'), FP = path.join(FF_DIR, 'ffprobe.exe');
const [, , entrada, salida, anchoArg] = process.argv;
if (!entrada || !salida) { console.error('Uso: node recortar.mjs <entrada> <salida.webp> [ancho]'); process.exit(1); }
const ancho = Number(anchoArg) || 720;

const run = (exe, args, input) => {
  const r = spawnSync(exe, args, { input, maxBuffer: 1 << 28 });
  if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
  return r.stdout;
};
const [W, H] = String(run(FP, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', entrada])).trim().split(',').map(Number);
const px = run(FF, ['-v', 'error', '-i', entrada, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);

// color del fondo: promedio de las cuatro esquinas
let br = 0, bg = 0, bb = 0, n = 0;
for (const [cx, cy] of [[0, 0], [W - 8, 0], [0, H - 8], [W - 8, H - 8]])
  for (let y = cy; y < cy + 8; y++) for (let x = cx; x < cx + 8; x++) { const k = (y * W + x) * 4; br += px[k]; bg += px[k + 1]; bb += px[k + 2]; n++; }
br /= n; bg /= n; bb /= n;

const D0 = 38, D1 = 135, PURO = 30;
const dist = new Float32Array(W * H);
for (let i = 0, k = 0; i < W * H; i++, k += 4) { const a = px[k] - br, b = px[k + 1] - bg, c = px[k + 2] - bb; dist[i] = Math.sqrt(a * a + b * b + c * c); }

// relleno desde el borde y desde cualquier punto con el color exacto del fondo
const fondo = new Uint8Array(W * H), pila = new Int32Array(W * H); let tope = 0;
const sembrar = i => { if (!fondo[i] && dist[i] < D1) { fondo[i] = 1; pila[tope++] = i; } };
for (let x = 0; x < W; x++) { sembrar(x); sembrar((H - 1) * W + x); }
for (let y = 0; y < H; y++) { sembrar(y * W); sembrar(y * W + W - 1); }
for (let i = 0; i < W * H; i++) if (dist[i] < PURO) sembrar(i);
while (tope) {
  const i = pila[--tope], x = i % W;
  if (x > 0) sembrar(i - 1); if (x < W - 1) sembrar(i + 1);
  if (i >= W) sembrar(i - W); if (i < W * (H - 1)) sembrar(i + W);
}

// transparencia suave en el borde y quitar el tinte del fondo de los píxeles mezclados
let x0 = W, x1 = 0, y0 = H, y1 = 0;
for (let i = 0, k = 0; i < W * H; i++, k += 4) {
  let a = 1;
  if (fondo[i]) { a = (dist[i] - D0) / (D1 - D0); a = a < .08 ? 0 : a > 1 ? 1 : a; }
  if (a > 0 && a < 1) {
    px[k] = Math.max(0, Math.min(255, (px[k] - (1 - a) * br) / a));
    px[k + 1] = Math.max(0, Math.min(255, (px[k + 1] - (1 - a) * bg) / a));
    px[k + 2] = Math.max(0, Math.min(255, (px[k + 2] - (1 - a) * bb) / a));
  }
  px[k + 3] = Math.round(a * 255);
  if (a > .05) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
}
const m = 6; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1, rec = Buffer.alloc(cw * ch * 4);
for (let y = 0; y < ch; y++) px.copy(rec, y * cw * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + cw) * 4);

const salAncho = Math.min(ancho, cw);
run(FF, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw}x${ch}`, '-i', '-', '-vf', `scale=${salAncho}:-2:flags=lanczos`, '-c:v', 'libwebp', '-q:v', '88', salida], rec);
const cubierto = Math.round(100 * (cw * ch) / (W * H));
console.log(`${path.basename(salida)}: fondo rgb(${Math.round(br)},${Math.round(bg)},${Math.round(bb)}), recorte ${cw}x${ch} (${cubierto}% del cuadro), salida ${salAncho}px de ancho, toca borde: ${x0 === 0 || y0 === 0 || x1 === W - 1 || y1 === H - 1 ? 'SI' : 'no'}`);
