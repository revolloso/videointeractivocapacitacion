// @ts-check
import { defineConfig } from 'astro/config';

// En GitHub Pages el sitio vive en /videointeractivocapacitacion/.
// Para otro hosting basta con quitar `base` o cambiarlo.
export default defineConfig({
  site: 'https://revolloso.github.io',
  base: process.env.BASE_PATH ?? '/videointeractivocapacitacion',
});
