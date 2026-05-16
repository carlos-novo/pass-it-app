import { v4 as uuidv4 } from 'uuid';
import { Equipo, IdSala, EventosSocket } from '@tipos-compartidos';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';

/**
 * CASO DE USO: Crear Sala
 *
 * Genera un código de sala único de 6 caracteres alfanuméricos en mayúsculas
 * y persiste la sala en Redis con el primer equipo como host.
 */
export class CrearSalaUseCase {
  private static readonly CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private static readonly LONGITUD_CODIGO = 6;

  constructor(private readonly repositorioSalas: IRepositorioSalas) {}

  async ejecutar(nombreEquipo: string): Promise<EventosSocket.SalaCreadaPayload> {
    const codigoSala = this.generarCodigo();

    const equipo: Equipo = {
      id: uuidv4(),
      nombre: nombreEquipo,
      puntuacion: 0,
      conectadoEn: Date.now(),
    };

    await this.repositorioSalas.crearSala(equipo, codigoSala);

    return {
      codigoSala,
      equipo,
    };
  }

  /**
   * Genera un código alfanumérico aleatorio de 6 caracteres.
   * Excluye caracteres ambiguos (O, I, 0, 1) para mejorar la legibilidad.
   */
  private generarCodigo(): IdSala {
    let codigo = '';
    for (let i = 0; i < CrearSalaUseCase.LONGITUD_CODIGO; i++) {
      const indice = Math.floor(Math.random() * CrearSalaUseCase.CARACTERES.length);
      codigo += CrearSalaUseCase.CARACTERES[indice];
    }
    return codigo;
  }
}
