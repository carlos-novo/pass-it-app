import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SalasModule } from './salas/salas.module';
import { TorneoModule } from './torneo/torneo.module';

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
    SalasModule,
    TorneoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
