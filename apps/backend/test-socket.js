/**
 * Script de prueba manual del flujo completo de Salas via Socket.io
 *
 * Uso:
 *   1. Asegúrate de que Redis esté levantado: docker-compose up -d
 *   2. Arranca el backend: npm run build && node dist/main (desde apps/backend)
 *   3. Ejecuta este script: node test-socket.js
 */

const { io } = require('socket.io-client');

const BACKEND_URL = 'http://localhost:3000';

function crearCliente(nombreEquipo) {
  return new Promise((resolve) => {
    const socket = io(BACKEND_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log(`\n✅ [${nombreEquipo}] Conectado — socketId: ${socket.id}`);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error(`❌ [${nombreEquipo}] Error de conexión: ${err.message}`);
    });

    socket.on('error', (payload) => {
      console.error(`❌ [${nombreEquipo}] Error del servidor:`, JSON.stringify(payload, null, 2));
    });
  });
}

async function ejecutarTest() {
  console.log('═══════════════════════════════════════');
  console.log('   TEST: Flujo Crear Sala + Unirse      ');
  console.log('═══════════════════════════════════════\n');

  // --- CLIENTE 1: Host que crea la sala ---
  const socketHost = await crearCliente('Equipo Alpha');

  const codigoSala = await new Promise((resolve) => {
    socketHost.on('sala_creada', (payload) => {
      console.log('\n📦 Evento: sala_creada');
      console.log(JSON.stringify(payload, null, 2));
      resolve(payload.codigoSala);
    });

    console.log('\n→ Emitiendo: crear_sala { nombreEquipo: "Equipo Alpha" }');
    socketHost.emit('crear_sala', { nombreEquipo: 'Equipo Alpha' });
  });

  console.log(`\n🔑 Código de sala obtenido: ${codigoSala}`);

  // --- CLIENTE 2: Segundo equipo que se une ---
  const socketGuest = await crearCliente('Equipo Beta');

  socketGuest.on('equipo_unido', (payload) => {
    console.log('\n📦 Evento: equipo_unido (recibido por Equipo Beta)');
    console.log(JSON.stringify(payload, null, 2));
  });

  socketHost.on('sala_actualizada', (payload) => {
    console.log('\n📦 Evento: sala_actualizada (recibido por Equipo Alpha)');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n✅ Todos los eventos funcionan correctamente.\n');

    // Cerrar conexiones tras verificar
    setTimeout(() => {
      socketHost.disconnect();
      socketGuest.disconnect();
      console.log('🔌 Conexiones cerradas. Test completado.');
      process.exit(0);
    }, 500);
  });

  // Test de sala inexistente
  socketGuest.on('error', (payload) => {
    if (payload.codigo === 'SALA_NO_ENCONTRADA') {
      console.log('\n✅ Validación SALA_NO_ENCONTRADA funciona correctamente');
    }
  });

  console.log(`\n→ Emitiendo: unirse_a_sala { codigoSala: "${codigoSala}", nombreEquipo: "Equipo Beta" }`);
  socketGuest.emit('unirse_a_sala', { codigoSala, nombreEquipo: 'Equipo Beta' });

  // Timeout de seguridad
  setTimeout(() => {
    console.error('\n⏰ Timeout: el test tardó demasiado. Verifica que el backend y Redis estén levantados.');
    process.exit(1);
  }, 10_000);
}

ejecutarTest().catch((err) => {
  console.error('Error en el test:', err);
  process.exit(1);
});
