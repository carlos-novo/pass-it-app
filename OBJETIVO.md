# 🏆 Pass It - Documento de Arquitectura y Visión (La Biblia)

## 📖 Contexto del Proyecto
"Pass It" es un *Party Game* multijugador diseñado para jugarse presencialmente en fiestas o reuniones. La mecánica principal gira en torno a equipos (hasta un máximo de 4), donde cada equipo utiliza un **único teléfono móvil** que los jugadores se van pasando de mano en mano ("Pass It"). 

El sistema orquesta un modo torneo en tiempo real emparejando a los equipos para competir en una serie de minijuegos frenéticos.

## ⚙️ Mecánicas Principales
- **Equipos y Dispositivos:** Exactamente 2 o 4 equipos (3 equipos no permitidos). 1 dispositivo por equipo.
- **Modo Torneo:** 
  - 4 equipos: Semifinales y Final.
  - 2 equipos: Final directa.
- **Formato de Eliminatoria:** Los enfrentamientos pueden configurarse "Al mejor de 1", "Al mejor de 3" o "Al mejor de 5" minijuegos.
- **Selección de Juegos:** Aleatoria desde el servidor. Un minijuego **nunca** se repite durante el mismo torneo.

## 🎮 Pool de Minijuegos (El Decálogo)
1. **Reflejos Puros:** La pantalla cambia de rojo a verde en un tiempo aleatorio. El primero en tocar, gana.
2. **Cronómetro Ciego:** Detener un cronómetro (que se oculta tras el primer segundo) exactamente en `5.00s`.
3. **Duelo de Pulsaciones:** Aporrear un botón gigante 100 veces lo más rápido posible.
4. **Simón Dice:** Replicar una secuencia creciente de colores y sonidos.
5. **Patrón de Desbloqueo:** Memorizar y replicar un patrón de 9 puntos que desaparece rápidamente.
6. **Cálculo Extremo:** Resolver una operación matemática contra reloj.
7. **La Bomba:** Decir en voz alta una palabra de una categoría dada, tocar la pantalla y pasar el móvil. El tiempo está oculto; quien lo tenga cuando explote, pierde.
8. **El Reto de la RAE:** Formar la palabra válida en español más larga posible con 12 letras aleatorias.
9. **El Intruso:** Encontrar el emoji diferente en una cuadrícula densa de 100 emojis similares.
10. **Memoria Fotográfica:** Observar una pantalla llena de objetos durante 3 segundos y responder cuántos objetos de un tipo específico había.

---

## 🏗️ Propuesta de Stack Tecnológico y Arquitectura

Como Arquitecto de Software y Tech Lead, mi prioridad es garantizar que el código sea mantenible, escalable y ofrezca una experiencia de usuario (UX) impecable, con animaciones fluidas y sin latencia perceptible en la sincronización.

### 📱 Frontend (Aplicación Móvil)
- **Framework:** `React Native` con `Expo`.
  - *Justificación:* Permite compilar nativamente para iOS y Android compartiendo casi el 100% del código base. Expo simplifica enormemente el acceso a APIs nativas (vibración, haptics, sonido) y el proceso de despliegue. Para juegos 2D basados en UI y mecánicas rápidas, React Native tiene un rendimiento excelente y evita la sobrecarga de motores pesados como Unity.
- **Lenguaje:** `TypeScript`.
  - *Justificación:* Tipado estático para prevenir errores en tiempo de compilación. Las interfaces garantizarán que los payloads de los WebSockets estén siempre estructurados y sincronizados con el backend.
- **Gestión del Estado:** `Zustand`.
  - *Justificación:* Mucho más ligero y sin el *boilerplate* de Redux. Perfecto para estados efímeros como la puntuación actual de la sala o el progreso interno de un minijuego.
- **Animaciones:** `React Native Reanimated` + `Moti`.
  - *Justificación:* Ejecutan animaciones directamente en el *UI thread* a 60 fps. Vital para minijuegos como "Reflejos Puros" o "Cronómetro Ciego" donde un pequeño *lag* arruinaría la experiencia de juego justa.

### 🔌 Backend (Servidor y Sincronización)
- **Framework:** `Node.js` con `NestJS`.
  - *Justificación:* NestJS obliga a utilizar una arquitectura modular y orientada a inyección de dependencias. Facilita enormemente aplicar principios SOLID y *Clean Architecture*, separando completamente los Controladores (Sockets) de los Casos de Uso (Lógica del Torneo).
- **Lenguaje:** `TypeScript`.
  - *Justificación:* Permite compartir tipos (monorepo o librerías) entre el Backend y el Frontend asegurando consistencia en la comunicación bidireccional.
- **Comunicación en Tiempo Real:** `Socket.io`.
  - *Justificación:* Estándar robusto para WebSockets. Maneja reconexiones automáticas, y su concepto nativo de "Salas" (*Rooms*) encaja perfectamente con el diseño de emparejamiento de equipos en lobbies separados.
- **Almacenamiento de Estado:** `Redis`.
  - *Justificación:* Un torneo es un evento rápido y temporal. No necesitamos base de datos persistente (SQL/NoSQL) salvo para estadísticas futuras. Redis almacena en memoria el estado de las salas, los minijuegos jugados y las puntuaciones, permitiendo lecturas/escrituras en milisegundos para una sincronización instantánea.

### 📐 Arquitectura Limpia (Clean Architecture)
El núcleo del sistema será totalmente independiente de los frameworks visuales o de red:
1. **Capa de Dominio (Entities):** Modelos de `Torneo`, `Equipo`, `Minijuego`, `Ronda`. Reglas de negocio puras (ej. *un juego no se puede repetir*, *solo avanzan 2 equipos a la final*).
2. **Capa de Aplicación (Use Cases):** Orquestadores como `AvanzarRondaUseCase`, `ResolverMinijuegoUseCase`, `AsignarEmparejamientosUseCase`.
3. **Capa de Adaptadores/Infraestructura:** Controladores de Socket.io, Repositorios de Redis, e Implementaciones React Native en el cliente.
