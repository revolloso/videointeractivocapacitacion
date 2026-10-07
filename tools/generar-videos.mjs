// Genera los clips de muestra del demo a partir de tools/escenas.html.
// Uso: npm run videos  (requiere Playwright con Chromium y ffmpeg instalados)
//      npm run videos -- inicio alarma   (solo algunas escenas)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const salida = path.join(raiz, '..', 'public', 'videos');
const FPS = 24;

const archivos = {
  'inicio': '01-inicio',
  'alarma': '02-alarma',
  'escaleras': '03-escaleras',
  'extintor': '04-extintor',
  'tecnica': '05-tecnica',
  'final-exito-evacuacion': '06-final-exito-evacuacion',
  'final-exito-extintor': '07-final-exito-extintor',
  'final-ignorar': '08-final-ignorar',
  'final-elevador': '09-final-elevador',
  'final-regresar': '10-final-regresar',
  'final-agua': '11-final-agua',
  'final-llamas': '12-final-llamas',
};

// Audio sintético: zumbido ambiente y, donde aplica, sirena de alarma.
function audio(id, dur) {
  const ambiente = `anoisesrc=color=brown:amplitude=0.05:duration=${dur}`;
  if (id === 'alarma' || id === 'escaleras') {
    return `aevalsrc='0.18*sin(2*PI*(700+300*abs(sin(2*PI*0.8*t)))*t)':s=44100:d=${dur}`;
  }
  return ambiente;
}

function codificar(id, dur, frames) {
  const destino = path.join(salida, `${archivos[id]}.mp4`);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-i', audio(id, dur),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart',
    destino,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  return { ff, destino, listo: new Promise((ok, mal) => ff.on('close', (c) => (c === 0 ? ok() : mal(new Error(`ffmpeg ${c}`))))) };
}

const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
await pagina.goto(pathToFileURL(path.join(raiz, 'escenas.html')).href);
const duraciones = await pagina.evaluate(() => window.escenas);
fs.mkdirSync(salida, { recursive: true });

const pedidas = process.argv.slice(2);
for (const [id, dur] of Object.entries(duraciones)) {
  if (pedidas.length && !pedidas.includes(id)) continue;
  const total = Math.round(dur * FPS);
  const { ff, destino, listo } = codificar(id, dur, total);
  for (let f = 0; f < total; f++) {
    await pagina.evaluate(([i, t]) => window.render(i, t), [id, f / FPS]);
    const img = await pagina.screenshot({ type: 'jpeg', quality: 88 });
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await listo;
  // Póster del primer clip para la portada.
  if (id === 'inicio') {
    await pagina.evaluate(() => window.render('inicio', 8.5));
    await pagina.screenshot({ path: path.join(salida, 'poster.jpg'), type: 'jpeg', quality: 80 });
  }
  console.log(`✓ ${path.relative(process.cwd(), destino)} (${dur}s)`);
}
await navegador.close();
