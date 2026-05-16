import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {
  IRepositorioSalas,
} from '@dominio/repositorios/interfaces-repositorio';
import { Equipo, IdSala } from '@tipos-compartidos';

@Injectable()
export class RedisRepositorioSalas implements IRepositorioSalas {
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly prefix = 'sala:';

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    this.ttl = Number(this.configService.get<number>('SALA_TTL_SEGUNDOS', 7200));
    this.redis = new Redis({ host, port });
  }

  private key(codigoSala: IdSala): string {
    return `${this.prefix}${codigoSala}`;
  }

  async crearSala(primerEquipo: Equipo, codigoSala: IdSala): Promise<IdSala> {
    const key = this.key(codigoSala);
    const equipos = [primerEquipo];
    await this.redis.set(key, JSON.stringify(equipos), 'EX', this.ttl);
    return codigoSala;
  }

  async unirseASala(codigoSala: IdSala, equipo: Equipo): Promise<void> {
    const key = this.key(codigoSala);
    const data = await this.redis.get(key);
    if (!data) throw new Error('SALA_NO_ENCONTRADA');
    const equipos: Equipo[] = JSON.parse(data) as Equipo[];
    equipos.push(equipo);
    await this.redis.set(key, JSON.stringify(equipos), 'EX', this.ttl);
  }

  async obtenerEquiposDeSala(codigoSala: IdSala): Promise<Equipo[] | null> {
    const key = this.key(codigoSala);
    const data = await this.redis.get(key);
    if (!data) return null;
    const equipos: Equipo[] = JSON.parse(data) as Equipo[];
    return equipos;
  }

  async eliminarEquipoDeSala(codigoSala: IdSala, idEquipo: string): Promise<void> {
    const key = this.key(codigoSala);
    const data = await this.redis.get(key);
    if (!data) return;
    const equipos: Equipo[] = JSON.parse(data) as Equipo[];
    const filtrados = equipos.filter((e) => e.id !== idEquipo);
    if (filtrados.length === 0) {
      await this.redis.del(key);
    } else {
      await this.redis.set(key, JSON.stringify(filtrados), 'EX', this.ttl);
    }
  }
}
