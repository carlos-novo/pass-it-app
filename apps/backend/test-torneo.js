/**
 * Script de Verificación Visual para el Motor del Torneo (Módulo 3)
 *
 * Este script simula un torneo completo con 4 equipos (Alpha, Beta, Gamma, Delta).
 * Muestra visualmente por consola cómo se genera el Bracket inicial, cómo avanza cada
 * semifinal y cómo se corona al campeón en la gran final, todo en tiempo real.
 */

const { io } = require('socket.io-client');

const BACKEND_URL = 'http://localhost:3000';
const codigoSala = 'TEST3D'; // Sala fija de pruebas
const MODALIDAD = 3; // Al mejor de 3 (se necesitan 2 victorias para pasar)

const nombresEquipos = ['Equipo Alpha', 'Equipo Beta', 'Equipo Gamma', 'Equipo Delta'];
const sockets = [];
let enfrentamientosActivos = [];
let torneoActivo = null;

function conectarCliente(nombre) {
  return new Promise((resolve) => {
    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

function formatearBracket(torneo) {
  console.log('\n  ┌────────────────────────────────────────────────────────┐');
  console.log('  │             📊 ESTADO ACTUAL DEL BRACKET               │');
  console.log('  └────────────────────────────────────────────────────────┘');

  // Semifinales
  const semis = torneo.enfrentamientos.filter((e) => e.fase === 'semifinal');
  const final = torneo.enfrentamientos.find((e) => e.fase === 'final');

  console.log('\n  [SEMIFINALES]');
  semis.forEach((s, idx) => {
    const eq1 = torneo.equipos.find((e) => e.id === s.idEquipo1).nombre;
    const eq2 = torneo.equipos.find((e) => e.id === s.idEquipo2).nombre;
    const v1 = s.victorias[s.idEquipo1] ?? 0;
    const v2 = s.victorias[s.idEquipo2] ?? 0;
    const estado = s.estado === 'finalizado' ? '✅ FIN' : s.estado === 'en_progreso' ? '⚡ JUGANDO' : '⏳ ESPERA';

    console.log(`    ${idx + 1}. ${eq1} (${v1}) vs ${eq2} (${v2})  [${estado}]`);
    if (s.ganador) {
      const g = torneo.equipos.find((e) => e.id === s.ganador).nombre;
      console.log(`       👉 Ganador: ${g}`);
    }
  });

  console.log('\n  [GRAN FINAL]');
  if (final) {
    const eq1 = torneo.equipos.find((e) => e.id === final.idEquipo1)?.nombre ?? 'Ganador Semi 1';
    const eq2 = torneo.equipos.find((e) => e.id === final.idEquipo2)?.nombre ?? 'Ganador Semi 2';
    const v1 = final.victorias[final.idEquipo1] ?? 0;
    const v2 = final.victorias[final.idEquipo2] ?? 0;
    const estado = final.estado === 'finalizado' ? '🏆 CAMPEÓN!' : final.estado === 'en_progreso' ? '⚡ JUGANDO' : '⏳ ESPERA';

    console.log(`    🔥 ${eq1} (${v1}) vs ${eq2} (${v2})  [${estado}]`);
  } else {
    console.log('    ⏳ Esperando que terminen las Semifinales...');
  }
  console.log('\n  ──────────────────────────────────────────────────────────\n');
}

async function simularTorneo() {
  console.clear();
  console.log('==========================================================');
  console.log('   🎮 SIMULADOR INTERACTIVO Y VISUAL DEL MOTOR (MÓDULO 3)  ');
  console.log('==========================================================');
  console.log('🔌 Conectando equipos al servidor de Socket.io...');

  let codigoGenerado = '';

  // 1. Conectar y registrar a los 4 equipos
  for (let i = 0; i < 4; i++) {
    const nombre = nombresEquipos[i];
    const socket = await conectarCliente(nombre);
    sockets.push(socket);

    // Unirse a la sala común
    if (i === 0) {
      // El primero crea la sala
      socket.emit('crear_sala', { nombreEquipo: nombre });
      codigoGenerado = await new Promise((r) => socket.once('sala_creada', (payload) => {
        console.log(`🏠 Sala creada con código: ${payload.codigoSala}`);
        r(payload.codigoSala);
      }));
    } else {
      socket.emit('unirse_a_sala', { codigoSala: codigoGenerado, nombreEquipo: nombre });
      await new Promise((r) => socket.once('equipo_unido', () => r()));
    }
    console.log(`✅ [${nombre}] registrado y listo.`);
  }

  const hostSocket = sockets[0];

  // 2. Suscribirse a los eventos del torneo en el host
  hostSocket.on('torneo_iniciado', (payload) => {
    torneoActivo = payload.torneo;
    console.log('\n🚀 ¡Torneo iniciado de forma exitosa por el Servidor!');
    formatearBracket(torneoActivo);
  });

  hostSocket.on('mostrar_emparejamiento', async (payload) => {
    const { enfrentamiento, minijuegoActual, numeroRonda } = payload;
    
    if (torneoActivo) {
      const idx = torneoActivo.enfrentamientos.findIndex(
        (e) => e.idEnfrentamiento === enfrentamiento.idEnfrentamiento
      );
      if (idx !== -1) {
        torneoActivo.enfrentamientos[idx] = enfrentamiento;
      }
    }

    const eq1 = torneoActivo.equipos.find((e) => e.id === enfrentamiento.idEquipo1).nombre;
    const eq2 = torneoActivo.equipos.find((e) => e.id === enfrentamiento.idEquipo2).nombre;

    console.log(`\n🎮 [RONDA ${numeroRonda}] - Juego: ${minijuegoActual}`);
    console.log(`🥊 Compiten: ${eq1} vs ${eq2}`);
    formatearBracket(torneoActivo);

    // Simular un retraso para la UX visual y luego reportar un ganador aleatorio de este juego
    setTimeout(() => {
      const ganador = Math.random() > 0.5 ? enfrentamiento.idEquipo1 : enfrentamiento.idEquipo2;
      const nombreGanador = torneoActivo.equipos.find((e) => e.id === ganador).nombre;
      console.log(`✨ ¡Ronda ganada por: ${nombreGanador}!`);

      hostSocket.emit('resultado_minijuego', {
        codigoSala: codigoGenerado,
        idEnfrentamiento: enfrentamiento.idEnfrentamiento,
        idEquipoGanador: ganador,
      });
    }, 1500);
  });

  hostSocket.on('minijuego_finalizado', (payload) => {
    // Actualizar el estado del enfrentamiento localmente para el bracket
    if (payload.enfrentamiento) {
      const idx = torneoActivo.enfrentamientos.findIndex(
        (e) => e.idEnfrentamiento === payload.enfrentamiento.idEnfrentamiento
      );
      if (idx !== -1) {
        torneoActivo.enfrentamientos[idx] = payload.enfrentamiento;
      }
    }
    console.log('📌 Un enfrentamiento ha sumado una ronda.');
    formatearBracket(torneoActivo);
  });

  hostSocket.on('torneo_finalizado', (payload) => {
    console.clear();
    console.log('==========================================================');
    console.log('          🏆 ¡EL TORNEO HA FINALIZADO CON ÉXITO!           ');
    console.log('==========================================================');
    console.log(`\n👑 ¡EL CAMPEÓN ABSOLUTO ES: ${payload.campeon.nombre}! 👑\n`);
    console.log('🎯 Historial de juegos usados durante el torneo (Sin repetir):');
    console.log(JSON.stringify(payload.torneo.minijuegosUsadosEnTorneo, null, 2));

    // Desconectar sockets
    sockets.forEach((s) => s.disconnect());
    process.exit(0);
  });

  // Suscribirse a actualizaciones del torneo para cuando se crea la final
  hostSocket.on('sala_actualizada', (payload) => {
    // Si avanza a la final, el gateway puede enviar sala_actualizada con el torneo actualizado
  });

  // Modificar para capturar transiciones de fase
  // Si un minijuego finaliza y crea la final, se actualiza el bracket
  hostSocket.on('connect_error', (err) => {
    console.error('Error de conexión:', err.message);
  });

  // 3. Iniciar el torneo
  console.log('\n⚡ Emitiendo iniciar_torneo (Al mejor de 3)...');
  hostSocket.emit('iniciar_torneo', { codigoSala: codigoGenerado, modalidad: MODALIDAD });

  // Timeout de seguridad
  setTimeout(() => {
    console.log('⏰ Fin de simulación por límite de tiempo.');
    sockets.forEach((s) => s.disconnect());
    process.exit(0);
  }, 25000);
}

simularTorneo().catch((err) => {
  console.error(err);
  process.exit(1);
});
