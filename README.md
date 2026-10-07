# Video de capacitación interactivo (demo)

Demo de un curso en video **estilo Netflix interactivo**: el video avanza y, en los momentos clave, el participante elige qué hace el personaje. Cada decisión lleva a una rama distinta de la historia, con retroalimentación inmediata, puntaje y una lección al final.

Tema del ejemplo: **seguridad industrial, conato de incendio en un almacén** (5 puntos de decisión, 7 finales).

## Probarlo

```bash
npm install
npm run dev
```

Abre http://localhost:4321/videointeractivocapacitacion/

Con cada push a `main`, el flujo de `.github/workflows/deploy.yml` lo publica en GitHub Pages (activar en *Settings → Pages → Source: GitHub Actions*).

## Cómo está armado

| Archivo | Qué hace |
| --- | --- |
| `src/data/escenario.ts` | El guion completo: clips, segundo en que aparecen las opciones, tiempo límite, opción por defecto, puntos, retroalimentación y finales. |
| `src/scripts/reproductor.ts` | Lógica del reproductor: muestra las opciones sobre el video, cuenta regresiva, cambio de rama sin cortes (precarga), puntaje y recorrido. |
| `src/components/Reproductor.astro` | Interfaz del reproductor (portada, opciones, resultado, controles). |
| `src/components/MapaDecisiones.astro` | Árbol de ramas generado del guion; se ilumina con el recorrido del participante. |
| `tools/escenas.html` + `tools/generar-videos.mjs` | Generan los clips animados de muestra (`npm run videos`, requiere Playwright y ffmpeg). |

### Cambiar a video real

1. Copia los clips filmados a `public/videos/`.
2. En `src/data/escenario.ts` cambia `video` por el nombre del archivo y `decisionEn` al segundo donde deben aparecer las opciones.
3. Conviene que cada clip de decisión tenga unos segundos de "espera" al final (el personaje dudando) para cubrir la cuenta regresiva.

### Integración con LMS / analítica

Al terminar, el reproductor emite el evento `curso:terminado` con el final alcanzado, el puntaje y la ruta elegida:

```js
document.addEventListener('curso:terminado', (e) => console.log(e.detail));
```

Desde ahí se puede reportar a SCORM, xAPI o cualquier analítica.

## Licencia de los clips

Los videos de `public/videos/` son animaciones generadas por código para este demo (sin material de terceros) y pueden usarse libremente.
