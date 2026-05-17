# 🗺️ RUTA - Roadmap y Módulos de Desarrollo

Este documento divide el proyecto "Pass It" en módulos lógicos e iterativos. Al finalizar cada sección, deberemos marcar la casilla y realizar el commit correspondiente utilizando la convención de `Conventional Commits` (feat, fix, refactor, chore, etc.).

## 📦 Módulo 1: Setup y Arquitectura Base
- [x] Inicializar entorno de Frontend móvil (`Expo` + `TypeScript`).
- [x] Configurar linters, formateadores (`ESLint`, `Prettier`) y alias de rutas absolutas en Frontend.
- [x] Inicializar entorno de Backend (`NestJS` + `TypeScript`).
- [x] Configurar contenedor `Docker` con `Redis` para el almacenamiento en memoria local.
- [x] Crear estructura de directorios basada en `Clean Architecture` en ambos proyectos (Dominio, Aplicación, Infraestructura).

## 🔌 Módulo 2: Backend y Gestión de Salas (Lobby)
- [x] Implementar el adaptador de `Socket.io` en NestJS.
- [x] Crear el caso de uso `CrearSalaUseCase` (genera un código alfanumérico único para el lobby).
- [x] Crear el caso de uso `UnirseASalaUseCase` (los equipos se conectan usando el código).
- [x] Implementar eventos de socket: `equipo_unido`, `sala_actualizada`, `desconexion_equipo`.
- [x] Desarrollar la UI del Lobby en la App: Pantalla de inicio, crear sala, ingresar código, e introducir el nombre del equipo.

## ⚙️ Módulo 3: Motor del Torneo (Core Logic)
- [x] Definir las entidades de dominio: `Torneo`, `Equipo`, y `Match`.
- [x] Implementar `IniciarTorneoUseCase`: Valida el número de equipos, selecciona la modalidad (Al mejor de 1, 3 o 5) y genera el *bracket* (llaves de emparejamiento).
- [x] Implementar el gestor aleatorio de minijuegos, aplicando la regla de negocio estricta de **no repetición**.
- [x] Crear eventos de socket para la sincronización de las pantallas de *versus* (`mostrar_emparejamiento`).
- [x] Desarrollar la UI del *Bracket* (Cuadro del torneo animado) en la app móvil.

## 🕹️ Módulo 4: Minijuegos - Fase 1 (Precisión y Velocidad)
- [ ] **Estructura Base Minijuegos:** Crear un componente HOC/Wrapper en React Native que maneje cuentas regresivas iniciales ("3, 2, 1, ¡Ya!").
- [ ] Implementar el adaptador genérico para el envío de resultados al backend (`enviar_resultado_minijuego`).
- [ ] Desarrollar **Reflejos Puros**: UI a pantalla completa, temporizador aleatorio (rojo a verde), y detección de "falsa salida" (tocar antes de tiempo).
- [ ] Desarrollar **Cronómetro Ciego**: Timer visual, lógica de ocultamiento tras 1 segundo, botón de parada y cálculo de desviación respecto a `5.00s`.
- [ ] Desarrollar **Duelo de Pulsaciones**: Botón interactivo de impacto, contador regresivo a 100 pulsaciones y medición de tiempo total.

## 🧠 Módulo 5: Minijuegos - Fase 2 (Memoria y Lógica)
- [ ] Desarrollar **Simón Dice**: Generador de secuencias incrementales, reproductor de sonidos asociados, animaciones de botones y validación estricta de input.
- [ ] Desarrollar **Patrón de Desbloqueo**: UI de matriz 3x3 (mediante SVG o Canvas), generador de ruta aleatoria garantizando conectividad lógica, temporizador para mostrar/ocultar y validación de trazo.
- [ ] Desarrollar **Cálculo Extremo**: Motor de expresiones matemáticas equilibradas según dificultad, teclado numérico custom en pantalla y lógica de contra reloj.

## 💣 Módulo 6: Minijuegos - Fase 3 (Palabras y Percepción)
- [ ] Desarrollar **La Bomba**: Temporizador oculto variable en el backend, UI de botón "Pasar", animaciones de explosión y lógica de eliminación sincronizada en tiempo real.
- [ ] Desarrollar **El Reto de la RAE**: Generador de 12 letras (garantizando proporción de vocales/consonantes), UI interactiva de *drag and drop* para componer, y validación contra diccionario español.
- [ ] Desarrollar **El Intruso**: Renderizador optimizado de cuadrícula 10x10, selección aleatoria de parejas de emojis similares, y penalización de tiempo por toques erróneos.
- [ ] Desarrollar **Memoria Fotográfica**: Componente de distribución espacial aleatoria de objetos, visualización limitada a 3 segundos, pantalla de *input* numérico y validador de aciertos.

## 🎨 Módulo 7: Sincronización Final y Flujo de UI
- [ ] Implementar `ResolverRondaUseCase` en Backend: Evalúa tiempos/puntos de ambos equipos y declara al ganador del minijuego.
- [ ] Pantallas de transición: "Equipo A gana la ronda", "Empate" (criterios de desempate), "Avanzando de ronda".
- [ ] Desarrollar la pantalla de **Gran Final** y la **Ceremonia de Victoria** (uso de confeti digital, trofeos y animaciones con `Reanimated`).
- [ ] Resiliencia: Manejo avanzado de desconexiones (restauración del estado de la interfaz leyendo desde Redis al reconectar).

## 🚀 Módulo 8: Testing, Pulido y Preparación (Producción)
- [ ] Integración de efectos de sonido y *haptic feedback* (vibración nativa) en interacciones clave.
- [ ] Escribir Tests Unitarios en Backend (asegurar el correcto funcionamiento del emparejamiento y el control anti-repetición de juegos).
- [ ] Refinar estilos visuales (Aplicar tokens de diseño: Tipografías modernas, paleta de colores vibrantes y neones típicos de un *Party Game*).
- [ ] Pruebas cruzadas en dispositivos físicos iOS y Android (validación de rendimiento a 60 fps y latencia de red).
- [ ] Preparación de assets nativos (Icono de la App, Splash Screen) y configuración de Expo para la generación de *builds* de producción.
