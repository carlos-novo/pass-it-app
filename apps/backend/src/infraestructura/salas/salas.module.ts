import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SalasGateway } from './salas.gateway';
import { RedisRepositorioSalas } from './redis-repositorio-salas';
import { REPOSITORIO_SALAS } from '@dominio/repositorios/interfaces-repositorio';
import { CrearSalaUseCase } from '@aplicacion/crear-sala.use-case';
import { UnirseASalaUseCase } from '@aplicacion/unirse-a-sala.use-case';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';

@Module({
  imports: [ConfigModule],
  providers: [
    SalasGateway,
    { provide: REPOSITORIO_SALAS, useClass: RedisRepositorioSalas },
    {
      provide: CrearSalaUseCase,
      useFactory: (repositorio: IRepositorioSalas) => new CrearSalaUseCase(repositorio),
      inject: [REPOSITORIO_SALAS],
    },
    {
      provide: UnirseASalaUseCase,
      useFactory: (repositorio: IRepositorioSalas) => new UnirseASalaUseCase(repositorio),
      inject: [REPOSITORIO_SALAS],
    },
  ],
  exports: [],
})
export class SalasModule {}
