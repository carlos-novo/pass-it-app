import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { CrearSalaUseCase } from '@aplicacion/crear-sala.use-case';
import { UnirseASalaUseCase } from '@aplicacion/unirse-a-sala.use-case';
import {
  IRepositorioSalas,
  REPOSITORIO_SALAS,
} from '@dominio/repositorios/interfaces-repositorio';
import { EventosSocket, IdSala } from '@tipos-compartidos';

@WebSocketGateway({ cors: { origin: '*' } })
export class SalasGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SalasGateway.name);

  // Map socket.id -> { codigoSala, idEquipo }
  private readonly socketMap = new Map<string, { codigoSala: IdSala; idEquipo: string }>();

  constructor(
    private readonly crearSalaUseCase: CrearSalaUseCase,
    private readonly unirseASalaUseCase: UnirseASalaUseCase,
    @Inject(REPOSITORIO_SALAS) private readonly repositorioSalas: IRepositorioSalas,
  ) {}

  @SubscribeMessage('crear_sala')
  async handleCrearSala(
    @MessageBody() payload: EventosSocket.CrearSalaPayload,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      const resultado = await this.crearSalaUseCase.ejecutar(payload.nombreEquipo);
      socket.join(resultado.codigoSala);
      this.socketMap.set(socket.id, { codigoSala: resultado.codigoSala, idEquipo: resultado.equipo.id });

      socket.emit('sala_creada', resultado);
    } catch (error) {
      this.logger.error('Error creando sala', error as unknown as string);
      const errPayload: EventosSocket.ErrorPayload = {
        codigo: 'ERROR_INTERNO',
        mensaje: 'Error al crear la sala',
      };
      socket.emit('error', errPayload);
    }
  }

  @SubscribeMessage('unirse_a_sala')
  async handleUnirseASala(
    @MessageBody() payload: EventosSocket.UnirseASalaPayload,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { codigoSala, nombreEquipo } = payload;

    const resultado = await this.unirseASalaUseCase.ejecutar(codigoSala as IdSala, nombreEquipo);

    if (!resultado.exito) {
      socket.emit('error', resultado.error);
      return;
    }

    // Unir socket a la room y mapearlo
    socket.join(resultado.codigoSala);
    this.socketMap.set(socket.id, { codigoSala: resultado.codigoSala, idEquipo: resultado.payload.equipo.id });

    // Emitir al socket que se unió y actualizar a la sala entera
    socket.emit('equipo_unido', resultado.payload);

    const salaActualizada: EventosSocket.SalaActualizadaPayload = {
      codigoSala: resultado.codigoSala,
      equipos: resultado.payload.equiposEnSala,
      estado: 'esperando',
    };

    this.server.to(resultado.codigoSala).emit('sala_actualizada', salaActualizada);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const info = this.socketMap.get(socket.id);
    if (!info) return;

    await this.repositorioSalas.eliminarEquipoDeSala(info.codigoSala, info.idEquipo);

    const equipos = await this.repositorioSalas.obtenerEquiposDeSala(info.codigoSala);

    const salaActualizada: EventosSocket.SalaActualizadaPayload = {
      codigoSala: info.codigoSala,
      equipos: equipos ?? [],
      estado: equipos && equipos.length > 0 ? 'esperando' : 'finalizada',
    };

    this.server.to(info.codigoSala).emit('sala_actualizada', salaActualizada);

    this.socketMap.delete(socket.id);
  }
}
