import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { IniciarTorneoUseCase } from '@aplicacion/iniciar-torneo.use-case';
import { AvanzarRondaUseCase } from '@aplicacion/avanzar-ronda.use-case';
import { EventosSocket, ModalidadEliminatoria } from '@tipos-compartidos';

interface IniciarTorneoBody {
  codigoSala: string;
  modalidad: ModalidadEliminatoria;
}

interface AvanzarRondaBody {
  codigoSala: string;
  idEnfrentamiento: string;
  idEquipoGanador: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class TorneoGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TorneoGateway.name);

  constructor(
    @Inject(IniciarTorneoUseCase)
    private readonly iniciarTorneoUseCase: IniciarTorneoUseCase,
    @Inject(AvanzarRondaUseCase)
    private readonly avanzarRondaUseCase: AvanzarRondaUseCase,
  ) {}

  /**
   * Evento: iniciar_torneo
   * Solo puede emitirlo el host (primer equipo conectado a la sala).
   * Emite: torneo_iniciado + mostrar_emparejamiento a toda la sala.
   */
  @SubscribeMessage('iniciar_torneo')
  async handleIniciarTorneo(
    @MessageBody() body: IniciarTorneoBody,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      const { torneoIniciado, emparejamientosIniciales } =
        await this.iniciarTorneoUseCase.ejecutar(body.codigoSala, body.modalidad);

      this.server.to(body.codigoSala).emit('torneo_iniciado', torneoIniciado);
      
      for (const emp of emparejamientosIniciales) {
        this.server.to(body.codigoSala).emit('mostrar_emparejamiento', emp);
      }

      this.logger.log(
        `Torneo iniciado en sala ${body.codigoSala} | Modalidad: Al mejor de ${body.modalidad}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(`iniciar_torneo: ${error.message}`);
      const errPayload: EventosSocket.ErrorPayload = {
        codigo: error.message,
        mensaje: this.traducirError(error.message),
      };
      socket.emit('error', errPayload);
    }
  }

  /**
   * Evento: resultado_minijuego
   * Notifica quién ganó un minijuego y avanza la ronda.
   */
  @SubscribeMessage('resultado_minijuego')
  async handleResultadoMinijuego(
    @MessageBody() body: AvanzarRondaBody,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      const resultado = await this.avanzarRondaUseCase.ejecutar(
        body.codigoSala,
        body.idEnfrentamiento,
        body.idEquipoGanador,
      );

      switch (resultado.tipo) {
        case 'siguiente_minijuego':
          this.server.to(body.codigoSala).emit('mostrar_emparejamiento', resultado.payload);
          break;

        case 'enfrentamiento_ganado':
          this.server.to(body.codigoSala).emit('minijuego_finalizado', resultado.payload);
          break;

        case 'final_iniciada':
          this.server.to(body.codigoSala).emit('minijuego_finalizado', {
            ganadorRonda: body.idEquipoGanador,
            enfrentamiento: resultado.semifinalFinalizada,
          });
          this.server.to(body.codigoSala).emit('mostrar_emparejamiento', resultado.minijuego);
          break;

        case 'torneo_finalizado':
          this.server.to(body.codigoSala).emit('torneo_finalizado', resultado.payload);
          break;
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(`resultado_minijuego: ${error.message}`);
      socket.emit('error', {
        codigo: error.message,
        mensaje: 'Error procesando el resultado del minijuego.',
      } as EventosSocket.ErrorPayload);
    }
  }

  private traducirError(codigo: string): string {
    const mensajes: Record<string, string> = {
      CANTIDAD_EQUIPOS_INVALIDA: 'El torneo solo se puede iniciar con exactamente 2 o 4 equipos.',
      TORNEO_NO_ENCONTRADO: 'No existe un torneo activo para esta sala.',
      ENFRENTAMIENTO_NO_ENCONTRADO: 'El enfrentamiento indicado no existe en el torneo.',
    };
    return mensajes[codigo] ?? 'Error desconocido en el motor del torneo.';
  }
}
