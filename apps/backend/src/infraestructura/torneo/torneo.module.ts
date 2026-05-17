import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TorneoGateway } from './torneo.gateway';
import { RedisRepositorioTorneos } from './redis-repositorio-torneos';
import { REPOSITORIO_TORNEOS } from '@dominio/repositorios/interfaces-repositorio-torneo';
import { REPOSITORIO_SALAS } from '@dominio/repositorios/interfaces-repositorio';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';
import { IRepositorioTorneos } from '@dominio/repositorios/interfaces-repositorio-torneo';
import { IniciarTorneoUseCase } from '@aplicacion/iniciar-torneo.use-case';
import { AvanzarRondaUseCase } from '@aplicacion/avanzar-ronda.use-case';
import { SalasModule } from '../salas/salas.module';

@Module({
  imports: [ConfigModule, SalasModule],
  providers: [
    TorneoGateway,
    { provide: REPOSITORIO_TORNEOS, useClass: RedisRepositorioTorneos },
    {
      provide: IniciarTorneoUseCase,
      useFactory: (repoSalas: IRepositorioSalas, repoTorneos: IRepositorioTorneos) =>
        new IniciarTorneoUseCase(repoSalas, repoTorneos),
      inject: [REPOSITORIO_SALAS, REPOSITORIO_TORNEOS],
    },
    {
      provide: AvanzarRondaUseCase,
      useFactory: (repoSalas: IRepositorioSalas, repoTorneos: IRepositorioTorneos) =>
        new AvanzarRondaUseCase(repoSalas, repoTorneos),
      inject: [REPOSITORIO_SALAS, REPOSITORIO_TORNEOS],
    },
  ],
})
export class TorneoModule {}
