import type { Nodo } from '../data/escenario';

type Datos = {
  curso: { titulo: string; inicio: string; puntajeMaximo: number };
  nodos: Record<string, Nodo>;
  base: string;
};

type Paso = { nodo: Nodo; opcion: string; puntos: number };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export function iniciarReproductor() {
  const datos: Datos = JSON.parse($('datos-curso').textContent ?? '{}');
  const { nodos, curso, base } = datos;

  const contenedor = $('reproductor');
  const video = $<HTMLVideoElement>('video');
  const portada = $('portada');
  const opciones = $('opciones');
  const pregunta = $('pregunta');
  const botones = $('botones');
  const barra = $('barra');
  const retro = $('retro');
  const resultado = $('resultado');
  const escena = $('escena');
  const pausa = $('pausa');
  const sonido = $('sonido');

  let actual: Nodo = nodos[curso.inicio];
  let ruta: Paso[] = [];
  let puntos = 0;
  let decisionVisible = false;
  let decidido = false;
  let restante = 0; // ms que quedan para decidir
  let ultimoTic = 0;
  let animacion = 0;
  let ocultarRetro = 0;

  const url = (archivo: string) => `${base}/${archivo}`;

  // Precarga los clips siguientes para que el cambio sea instantáneo.
  const precargados = new Set<string>();
  function precargar(nodo: Nodo) {
    for (const o of nodo.opciones ?? []) {
      const sig = nodos[o.siguiente];
      if (!sig || precargados.has(sig.video)) continue;
      precargados.add(sig.video);
      fetch(url(sig.video)).catch(() => precargados.delete(sig.video));
    }
  }

  function reproducir(nodo: Nodo) {
    actual = nodo;
    decisionVisible = false;
    decidido = false;
    opciones.hidden = true;
    escena.textContent = nodo.titulo;
    video.src = url(nodo.video);
    video.play().catch(() => {});
    marcarMapa();
    precargar(nodo);
  }

  function mostrarDecision() {
    if (!actual.opciones || decisionVisible) return;
    decisionVisible = true;
    pregunta.textContent = actual.pregunta ?? '';
    botones.replaceChildren(
      ...actual.opciones.map((o, i) => {
        const b = document.createElement('button');
        b.innerHTML = `<span class="tecla">${i + 1}</span>`;
        b.append(o.texto);
        b.addEventListener('click', () => elegir(i));
        return b;
      }),
    );
    opciones.hidden = false;
    restante = (actual.tiempoLimite ?? 10) * 1000;
    ultimoTic = performance.now();
    cancelAnimationFrame(animacion);
    animacion = requestAnimationFrame(cuentaRegresiva);
  }

  // El tiempo corre como en Netflix; si nadie elige se toma la opción por defecto.
  function cuentaRegresiva(ahora: number) {
    if (!decisionVisible || decidido) return;
    if (!video.paused || video.ended) restante -= ahora - ultimoTic;
    ultimoTic = ahora;
    const total = (actual.tiempoLimite ?? 10) * 1000;
    barra.style.transform = `scaleX(${Math.max(0, restante / total)})`;
    if (restante <= 0) return elegir(actual.porDefecto ?? 0, true);
    animacion = requestAnimationFrame(cuentaRegresiva);
  }

  function elegir(indice: number, porTiempo = false) {
    const opcion = actual.opciones?.[indice];
    if (!opcion || decidido) return;
    decidido = true;
    cancelAnimationFrame(animacion);
    ruta.push({ nodo: actual, opcion: opcion.texto + (porTiempo ? ' (se acabó el tiempo)' : ''), puntos: opcion.puntos });
    puntos += opcion.puntos;
    avisar(opcion.retro, opcion.puntos > 0 && opcion.puntos >= 10 ? 'bien' : opcion.puntos === 0 ? 'mal' : '');
    reproducir(nodos[opcion.siguiente]);
  }

  function avisar(texto: string, tono: string) {
    retro.textContent = texto;
    retro.className = `retro ${tono}`;
    retro.hidden = false;
    clearTimeout(ocultarRetro);
    ocultarRetro = window.setTimeout(() => (retro.hidden = true), 4000);
  }

  function mostrarResultado() {
    const f = actual.final;
    if (!f) return;
    retro.hidden = true;
    resultado.className = `capa resultado ${f.tipo}`;
    $('res-tipo').textContent = f.tipo === 'exito' ? 'Final correcto' : 'Final a mejorar';
    $('res-titulo').textContent = f.titulo;
    $('res-mensaje').textContent = f.mensaje;
    $('res-puntos').textContent = `${puntos} / ${curso.puntajeMaximo}`;
    $('res-leccion').textContent = f.leccion;
    $('res-ruta').replaceChildren(
      ...ruta.map((p) => {
        const li = document.createElement('li');
        li.className = p.puntos >= 10 ? 'bien' : p.puntos === 0 ? 'mal' : '';
        li.innerHTML = `<span class="p"></span> `;
        li.querySelector('.p')!.textContent = `${p.nodo.titulo}:`;
        li.append(` ${p.opcion}`);
        return li;
      }),
    );
    resultado.hidden = false;
    // Evento para enviar el resultado a un LMS (SCORM/xAPI) o a analítica.
    contenedor.dispatchEvent(new CustomEvent('curso:terminado', {
      bubbles: true,
      detail: { final: actual.id, tipo: f.tipo, puntos, maximo: curso.puntajeMaximo, ruta: ruta.map((p) => ({ escena: p.nodo.id, eleccion: p.opcion })) },
    }));
  }

  function marcarMapa() {
    const visitados = new Set([...ruta.map((p) => p.nodo.id), actual.id]);
    document.querySelector('.mapa')?.classList.add('con-ruta');
    document.querySelectorAll<HTMLElement>('[data-nodo]').forEach((el) => {
      el.classList.toggle('visitado', visitados.has(el.dataset.nodo!));
      el.classList.toggle('actual', el.dataset.nodo === actual.id);
    });
  }

  function comenzar() {
    ruta = [];
    puntos = 0;
    portada.hidden = true;
    resultado.hidden = true;
    reproducir(nodos[curso.inicio]);
  }

  video.addEventListener('timeupdate', () => {
    if (actual.decisionEn !== undefined && video.currentTime >= actual.decisionEn) mostrarDecision();
  });
  video.addEventListener('ended', () => {
    if (actual.final) mostrarResultado();
    else mostrarDecision(); // por si el clip es más corto que el punto de decisión
  });
  video.addEventListener('play', () => (pausa.textContent = '❚❚'));
  video.addEventListener('pause', () => (pausa.textContent = '▶'));

  $('comenzar').addEventListener('click', comenzar);
  $('reintentar').addEventListener('click', comenzar);
  pausa.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  sonido.addEventListener('click', () => {
    video.muted = !video.muted;
    sonido.textContent = video.muted ? '🔇' : '🔊';
  });
  $('pantalla').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedor.requestFullscreen?.();
  });

  document.addEventListener('keydown', (e) => {
    if (decisionVisible && !decidido && /^[1-9]$/.test(e.key)) elegir(Number(e.key) - 1);
    if (e.key === ' ' && portada.hidden && e.target === document.body) {
      e.preventDefault();
      video.paused ? video.play() : video.pause();
    }
  });
}
