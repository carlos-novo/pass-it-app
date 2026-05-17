import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { IRepositorioTorneos } from '@dominio/repositorios/interfaces-repositorio-torneo';
import { Torneo, IdTorneo, IdSala, TipoMinijuego } from '@tipos-compartidos';

@Injectable()
export class RedisRepositorioTorneos implements IRepositorioTorneos, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly prefixTorneo = 'torneo:';
  private readonly prefixSalaATorneo = 'sala-torneo:';
  private readonly logger = new Logger(RedisRepositorioTorneos.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<string>('REDIS_PORT', '6379'));
    this.ttl = Number(this.configService.get<string>('SALA_TTL_SEGUNDOS', '7200'));

    this.redis = new Redis({
      host,
      port,
      lazyConnect: true,
      retryStrategy: (times: number): number | null => {
        if (times > 10) return null;
        return Math.min(times * 500, 30_000);
      },
    });

    this.redis.on('ready', () => this.logger.log('Redis Torneos: conexión lista ✅'));
    this.redis.on('error', (err: Error) =>
      this.logger.error(`Redis Torneos: error — ${err.message}`),
    );

    this.redis.connect().catch((err: Error) =>
      this.logger.error(`Redis Torneos: fallo conexión inicial — ${err.message}`),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async guardarTorneo(torneo: Torneo): Promise<IdTorneo> {
    try {
      const keyTorneo = `${this.prefixTorneo}${torneo.id}`;
      const keySala = `${this.prefixSalaATorneo}${torneo.idSala}`;

      await this.redis.set(keyTorneo, JSON.stringify(torneo), 'EX', this.ttl);
      // Índice inverso: sala → idTorneo (para recuperar por sala)
      await this.redis.set(keySala, torneo.id, 'EX', this.ttl);

      this.logger.log(`Torneo ${torneo.id} guardado para sala ${torneo.idSala}`);
      return torneo.id;
    } catch (err) {
      this.logger.error(`guardarTorneo: error`, err);
      throw new Error('ERROR_REDIS_GUARDAR_TORNEO');
    }
  }

  async obtenerTorneoPorSala(codigoSala: IdSala): Promise<Torneo | null> {
    try {
      const keySala = `${this.prefixSalaATorneo}${codigoSala}`;
      const idTorneo = await this.redis.get(keySala);
      if (!idTorneo) return null;

      const keyTorneo = `${this.prefixTorneo}${idTorneo}`;
      const data = await this.redis.get(keyTorneo);
      if (!data) return null;

      return JSON.parse(data) as Torneo;
    } catch (err) {
      this.logger.error(`obtenerTorneoPorSala: error en sala ${codigoSala}`, err);
      return null;
    }
  }

  async actualizarTorneo(torneo: Torneo): Promise<void> {
    try {
      const key = `${this.prefixTorneo}${torneo.id}`;
      await this.redis.set(key, JSON.stringify(torneo), 'EX', this.ttl);
    } catch (err) {
      this.logger.error(`actualizarTorneo: error en torneo ${torneo.id}`, err);
    }
  }

  async registrarMinijuegoUsado(idTorneo: IdTorneo, tipo: TipoMinijuego): Promise<void> {
    try {
      const key = `${this.prefixTorneo}${idTorneo}`;
      const data = await this.redis.get(key);
      if (!data) return;

      const torneo = JSON.parse(data) as Torneo;
      if (!torneo.minijuegosUsadosEnTorneo.includes(tipo)) {
        torneo.minijuegosUsadosEnTorneo.push(tipo);
        await this.redis.set(key, JSON.stringify(torneo), 'EX', this.ttl);
      }
    } catch (err) {
      this.logger.error(`registrarMinijuegoUsado: error`, err);
    }
  }
}
