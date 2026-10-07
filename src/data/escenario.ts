// Guion del curso interactivo. Cada nodo es un clip de video.
// Para usar videos reales solo hay que cambiar `video` por el archivo filmado
// y ajustar `decisionEn` al segundo donde aparecen las opciones.

export type Opcion = {
  texto: string;
  siguiente: string;
  puntos: number;
  /** Mensaje corto que se muestra al elegir (retroalimentación inmediata). */
  retro: string;
};

export type Final = {
  tipo: 'exito' | 'fallo';
  titulo: string;
  mensaje: string;
  /** Lección clave que se repasa al terminar. */
  leccion: string;
};

export type Nodo = {
  id: string;
  titulo: string;
  video: string;
  /** Segundo del clip en que aparecen las opciones. */
  decisionEn?: number;
  /** Segundos para decidir antes de que se elija la opción por defecto. */
  tiempoLimite?: number;
  pregunta?: string;
  opciones?: Opcion[];
  /** Índice de la opción que se toma si se acaba el tiempo. */
  porDefecto?: number;
  final?: Final;
};

export const curso = {
  titulo: 'Turno seguro: fuego en el almacén',
  subtitulo: 'Capacitación interactiva de seguridad industrial',
  inicio: 'inicio',
  puntajeMaximo: 30,
};

export const nodos: Record<string, Nodo> = {
  inicio: {
    id: 'inicio',
    titulo: 'Humo en el tablero eléctrico',
    video: 'videos/01-inicio.mp4',
    decisionEn: 9,
    tiempoLimite: 10,
    pregunta: 'Ves humo saliendo del tablero eléctrico. ¿Qué haces?',
    porDefecto: 2,
    opciones: [
      {
        texto: 'Activar la alarma y avisar',
        siguiente: 'alarma',
        puntos: 10,
        retro: 'Correcto: primero se da la alerta para proteger a todos.',
      },
      {
        texto: 'Tomar el extintor más cercano',
        siguiente: 'extintor',
        puntos: 5,
        retro: 'Puede funcionar si el fuego es pequeño y sabes qué extintor usar.',
      },
      {
        texto: 'Seguir trabajando, seguro no es nada',
        siguiente: 'final-ignorar',
        puntos: 0,
        retro: 'Ignorar una señal de humo es el error más común antes de un incendio.',
      },
    ],
  },

  alarma: {
    id: 'alarma',
    titulo: 'Alarma activada',
    video: 'videos/02-alarma.mp4',
    decisionEn: 8,
    tiempoLimite: 10,
    pregunta: 'Suena la alarma y hay que evacuar el segundo piso. ¿Por dónde sales?',
    porDefecto: 0,
    opciones: [
      {
        texto: 'Elevador, es más rápido',
        siguiente: 'final-elevador',
        puntos: 0,
        retro: 'En un incendio el elevador puede detenerse o llevarte al piso del fuego.',
      },
      {
        texto: 'Escaleras de emergencia',
        siguiente: 'escaleras',
        puntos: 10,
        retro: 'Correcto: la ruta de evacuación señalizada es siempre por escaleras.',
      },
    ],
  },

  escaleras: {
    id: 'escaleras',
    titulo: 'Ruta de evacuación',
    video: 'videos/03-escaleras.mp4',
    decisionEn: 7,
    tiempoLimite: 10,
    pregunta: 'Ya estás afuera. ¿Qué haces ahora?',
    porDefecto: 1,
    opciones: [
      {
        texto: 'Ir al punto de reunión y reportarte',
        siguiente: 'final-exito-evacuacion',
        puntos: 10,
        retro: 'Correcto: así la brigada sabe que nadie quedó adentro.',
      },
      {
        texto: 'Regresar por tus cosas',
        siguiente: 'final-regresar',
        puntos: 0,
        retro: 'Nunca se regresa a un edificio en evacuación.',
      },
    ],
  },

  extintor: {
    id: 'extintor',
    titulo: 'Frente al gabinete de extintores',
    video: 'videos/04-extintor.mp4',
    decisionEn: 7,
    tiempoLimite: 10,
    pregunta: 'Es un fuego eléctrico (clase C). ¿Qué extintor usas?',
    porDefecto: 0,
    opciones: [
      {
        texto: 'Extintor de agua',
        siguiente: 'final-agua',
        puntos: 0,
        retro: 'El agua conduce la electricidad: riesgo de electrocución.',
      },
      {
        texto: 'Extintor de CO₂',
        siguiente: 'tecnica',
        puntos: 10,
        retro: 'Correcto: el CO₂ no conduce electricidad ni deja residuos.',
      },
    ],
  },

  tecnica: {
    id: 'tecnica',
    titulo: 'Técnica PASE',
    video: 'videos/05-tecnica.mp4',
    decisionEn: 10,
    tiempoLimite: 10,
    pregunta: '¿Hacia dónde apuntas la boquilla?',
    porDefecto: 1,
    opciones: [
      {
        texto: 'A la base del fuego',
        siguiente: 'final-exito-extintor',
        puntos: 10,
        retro: 'Correcto: se ataca la base, donde está el combustible.',
      },
      {
        texto: 'A las llamas más altas',
        siguiente: 'final-llamas',
        puntos: 0,
        retro: 'Apuntar a las llamas desperdicia el agente y el fuego sigue.',
      },
    ],
  },

  'final-exito-evacuacion': {
    id: 'final-exito-evacuacion',
    titulo: 'Evacuación exitosa',
    video: 'videos/06-final-exito-evacuacion.mp4',
    final: {
      tipo: 'exito',
      titulo: '¡Evacuación exitosa!',
      mensaje: 'Diste la alerta, usaste la ruta correcta y te reportaste en el punto de reunión.',
      leccion: 'Alertar, evacuar por escaleras y reportarse salva vidas.',
    },
  },
  'final-exito-extintor': {
    id: 'final-exito-extintor',
    titulo: 'Conato controlado',
    video: 'videos/07-final-exito-extintor.mp4',
    final: {
      tipo: 'exito',
      titulo: '¡Conato controlado!',
      mensaje: 'Elegiste el extintor correcto y aplicaste bien la técnica PASE.',
      leccion: 'Aun controlado, el incidente se reporta y se revisa el tablero.',
    },
  },
  'final-ignorar': {
    id: 'final-ignorar',
    titulo: 'El fuego se propagó',
    video: 'videos/08-final-ignorar.mp4',
    final: {
      tipo: 'fallo',
      titulo: 'El fuego se propagó',
      mensaje: 'El humo era el inicio de un incendio y nadie dio la alerta a tiempo.',
      leccion: 'Ante humo u olor a quemado: alerta inmediata, siempre.',
    },
  },
  'final-elevador': {
    id: 'final-elevador',
    titulo: 'Atrapado en el elevador',
    video: 'videos/09-final-elevador.mp4',
    final: {
      tipo: 'fallo',
      titulo: 'Atrapado en el elevador',
      mensaje: 'Con la alarma se corta la energía y el elevador se detuvo entre pisos.',
      leccion: 'En una emergencia nunca se usan elevadores.',
    },
  },
  'final-regresar': {
    id: 'final-regresar',
    titulo: 'Regresaste al edificio',
    video: 'videos/10-final-regresar.mp4',
    final: {
      tipo: 'fallo',
      titulo: 'Te pusiste en riesgo',
      mensaje: 'La brigada tuvo que entrar a buscarte porque no estabas en el punto de reunión.',
      leccion: 'Los objetos se reponen; las personas no. No regreses.',
    },
  },
  'final-agua': {
    id: 'final-agua',
    titulo: 'Descarga eléctrica',
    video: 'videos/11-final-agua.mp4',
    final: {
      tipo: 'fallo',
      titulo: 'Riesgo de electrocución',
      mensaje: 'El agua sobre un tablero energizado conduce la corriente hacia ti.',
      leccion: 'Fuego eléctrico (clase C): CO₂ o polvo químico seco, nunca agua.',
    },
  },
  'final-llamas': {
    id: 'final-llamas',
    titulo: 'El extintor se vació',
    video: 'videos/12-final-llamas.mp4',
    final: {
      tipo: 'fallo',
      titulo: 'El extintor se vació',
      mensaje: 'Apuntaste a las llamas y el fuego siguió creciendo desde la base.',
      leccion: 'PASE: Presiona, Apunta a la base, Sujeta y Esparce de lado a lado.',
    },
  },
};
