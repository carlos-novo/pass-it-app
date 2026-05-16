import { NestFactory } from '@nestjs/core';
import { AppModule } from './infraestructura/app.module';

/**
 * Punto de entrada de la aplicación NestJS.
 * Arranca el servidor HTTP y el servidor de WebSockets de Socket.io.
 */
async function arrancar(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
  });

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);

  console.log(`🚀 Servidor Pass It escuchando en el puerto ${puerto}`);
  console.log(`📡 WebSockets de Socket.io activos`);
}

arrancar();
