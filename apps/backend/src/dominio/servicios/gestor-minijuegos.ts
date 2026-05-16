import { POOL_MINIJUEGOS, TipoMinijuego } from '@tipos-compartidos';

/**
 * SERVICIO DE DOMINIO: Gestor de Minijuegos
 *
 * Encapsula la regla de negocio más crítica del torneo:
 * Garantizar que ningún minijuego se repita durante todo el torneo.
 *
 * Esta clase no depende de ningún framework (NestJS, Redis, etc.).
 * Es pura lógica de negocio y puede testarse de forma unitaria sin mocks.
 */
export class GestorMinijuegos {
  /**
   * Selecciona un minijuego aleatorio que no haya sido utilizado
   * en el torneo actual.
   *
   * @param usados - Lista de minijuegos ya jugados en el torneo
   * @returns El tipo del siguiente minijuego
   * @throws Error si ya se han usado todos los minijuegos disponibles
   */
  static seleccionarSiguiente(usados: TipoMinijuego[]): TipoMinijuego {
    const disponibles = POOL_MINIJUEGOS.filter(
      (juego) => !usados.includes(juego),
    );

    if (disponibles.length === 0) {
      throw new Error(
        'No quedan minijuegos disponibles. El pool de 10 juegos se ha agotado.',
      );
    }

    const indiceAleatorio = Math.floor(Math.random() * disponibles.length);
    return disponibles[indiceAleatorio];
  }

  /**
   * Verifica si quedan suficientes minijuegos para completar
   * una eliminatoria con la modalidad indicada.
   *
   * @param usados - Minijuegos ya jugados en el torneo
   * @param modalidad - "Al mejor de" N juegos
   */
  static hayDisponiblesSuficientes(
    usados: TipoMinijuego[],
    modalidad: number,
  ): boolean {
    const disponibles = POOL_MINIJUEGOS.length - usados.length;
    return disponibles >= modalidad;
  }
}
