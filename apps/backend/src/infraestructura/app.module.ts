import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Módulo raíz de la aplicación.
 * En futuras iteraciones importará:
 * - SalasModule (Módulo 2)
 * - TorneoModule (Módulo 3)
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
