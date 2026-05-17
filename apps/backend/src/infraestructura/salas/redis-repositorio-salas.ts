import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';
import { Equipo, IdSala } from '@tipos-compartidos';

@Injectable()
export class RedisRepositorioSalas implements IRepositorioSalas, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly prefix = 'sala:';
  private readonly logger = new Logger(RedisRepositorioSalas.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<string>('REDIS_PORT', '6379'));
    this.ttl = Number(this.configService.get<string>('SALA_TTL_SEGUNDOS', '7200'));

    this.redis = new Redis({
      host,
      port,
      // No conectar automáticamente — conectamos cuando sea necesario
      lazyConnect: true,
      // Reintentar con backoff exponencial (máx 30 s)
      retryStrategy: (times: number): number | null => {
        if (times > 10) {
          this.logger.error(`Redis: ${times} intentos fallidos. Dejando de reintentar.`);
          return null; // Detiene los reintentos
        }
        const delay = Math.min(times * 500, 30_000);
        this.logger.warn(`Redis: reintentando conexión en ${delay}ms (intento ${times})`);
        return delay;
      },
    });

    // Registrar todos los eventos del ciclo de vida de Redis
    this.redis.on('connect', () => this.logger.log('Redis: conectando...'));
    this.redis.on('ready', () => this.logger.log('Redis: conexión lista ✅'));
    this.redis.on('error', (err: Error) =>
      this.logger.error(`Redis: error de conexión — ${err.message}`),
    );
    this.redis.on('close', () => this.logger.warn('Redis: conexión cerrada'));
    this.redis.on('reconnecting', () => this.logger.warn('Redis: reconectando...'));

    // Iniciar conexión de forma diferida (no bloquea el arranque de Nest)
    this.redis.connect().catch((err: Error) =>
      this.logger.error(`Redis: fallo en la conexión inicial — ${err.message}`),
    );
  }

  /** Libera la conexión cuando NestJS destruye el módulo */
  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
    this.logger.log('Redis: conexión cerrada correctamente');
  }

  private key(codigoSala: IdSala): string {
    return `${this.prefix}${codigoSala}`;
  }

  async crearSala(primerEquipo: Equipo, codigoSala: IdSala): Promise<IdSala> {
    try {
      const key = this.key(codigoSala);
      await this.redis.set(key, JSON.stringify([primerEquipo]), 'EX', this.ttl);
      this.logger.log(`Sala creada: ${codigoSala} | TTL: ${this.ttl}s`);
      return codigoSala;
    } catch (err) {
      this.logger.error(`crearSala: error al persistir sala ${codigoSala}`, err);
      throw new Error('ERROR_REDIS_CREAR_SALA');
    }
  }

  async unirseASala(codigoSala: IdSala, equipo: Equipo): Promise<void> {
    try {
      const key = this.key(codigoSala);
      const data = await this.redis.get(key);
      if (!data) throw new Error('SALA_NO_ENCONTRADA');
      const equipos: Equipo[] = JSON.parse(data) as Equipo[];
      equipos.push(equipo);
      await this.redis.set(key, JSON.stringify(equipos), 'EX', this.ttl);
      this.logger.log(`Equipo "${equipo.nombre}" unido a sala ${codigoSala}`);
    } catch (err) {
      this.logger.error(`unirseASala: error en sala ${codigoSala}`, err);
      throw err; // Re-lanzar para que el caso de uso lo capture
    }
  }

  async obtenerEquiposDeSala(codigoSala: IdSala): Promise<Equipo[] | null> {
    try {
      const key = this.key(codigoSala);
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as Equipo[];
    } catch (err) {
      this.logger.error(`obtenerEquiposDeSala: error en sala ${codigoSala}`, err);
      return null;
    }
  }

  async eliminarEquipoDeSala(codigoSala: IdSala, idEquipo: string): Promise<void> {
    try {
      const key = this.key(codigoSala);
      const data = await this.redis.get(key);
      if (!data) return;
      const equipos: Equipo[] = JSON.parse(data) as Equipo[];
      const filtrados = equipos.filter((e) => e.id !== idEquipo);
      if (filtrados.length === 0) {
        await this.redis.del(key);
        this.logger.log(`Sala ${codigoSala} eliminada de Redis (sin equipos)`);
      } else {
        await this.redis.set(key, JSON.stringify(filtrados), 'EX', this.ttl);
        this.logger.log(`Equipo ${idEquipo} eliminado de sala ${codigoSala}`);
      }
    } catch (err) {
      this.logger.error(`eliminarEquipoDeSala: error en sala ${codigoSala}`, err);
    }
  }
}
