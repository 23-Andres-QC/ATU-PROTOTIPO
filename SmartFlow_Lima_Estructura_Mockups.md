# SmartFlow Lima — Estructura de Mockups

> Plataforma de movilidad urbana inteligente para Lima y Callao.
> Tres productos en una sola plataforma: **App Pasajero/Chofer** (mobile), **Dashboard ATU** (web), **Sistema de Reportería** (web/embebido).

---

## 0. Sistema de diseño base

Define esto primero para que los tres productos se vean consistentes.

### Paleta de colores
- **Primario:** Azul ATU (#1A4E8C) — institucional, encabezados.
- **Secundario:** Verde (#2BB673) — confirmaciones, "todo bien", flujo libre.
- **Alerta media:** Amarillo (#F5A623) — congestión moderada, espera 5–10 min.
- **Alerta alta:** Rojo (#E63946) — congestión crítica, accidentes, paraderos saturados.
- **Neutros:** Blanco #FFFFFF, gris claro #F4F6F8, gris medio #8A94A6, texto #1B2230.

### Tipografía
- **Headings:** Inter / Poppins / SF Pro (sans-serif moderna, peso 600-700).
- **Body:** Inter / Roboto, peso 400-500.
- **Mono (datos, IDs):** JetBrains Mono o Roboto Mono.

### Iconografía
- Sistema unificado: Lucide / Phosphor (estilo de línea, no relleno).
- Íconos especiales: bus, tren, paradero, alerta, chat, perfil, semáforo, cámara.

### Componentes base reutilizables
Botones (primario, secundario, ghost, destructivo), inputs, cards, badges, tabs, modales, toasts, drawer/bottom sheet, mapa, marcadores, polylines, ruta animada, timeline.

---

## 1. APP MOBILE — Pasajero / Chofer

> Modo dual: una sola app que cambia interfaz según el rol del usuario logueado (pasajero o chofer).

### 1.1 Onboarding y Login
- **Splash screen** con logo SmartFlow Lima + tagline "Tu ciudad, en tiempo real".
- **3 pantallas de onboarding** (carrusel deslizable):
  1. "Sabe cuándo llega tu bus" — ilustración de paradero + bus + tiempo.
  2. "Reporta lo que ves" — ilustración de cámara + alerta.
  3. "Viaja informado" — ilustración de mapa con rutas activas.
- **Selección de rol:** Pasajero / Chofer / Invitado.
- **Login:** correo + contraseña, o login con Google / Facebook / DNI.
- **Permisos:** ubicación, notificaciones, cámara (para reportes).

### 1.2 Pantalla principal — Modo Pasajero (la del boceto)

**Estructura visual (de arriba a abajo):**

#### Header
- Avatar del usuario (esquina superior izquierda).
- Título dinámico: "Hola, [Nombre]" o "Buenos días".
- Botón "rutas temp" (rutas temporales/desvíos activos) — bullet rojo si hay alertas activas.
- Ícono de notificaciones (campana) con badge numérico.

#### Buscador de rutas
- Input "¿A dónde vas?" con ícono de búsqueda.
- Sugerencias rápidas: Casa, Trabajo, Universidad.
- Historial de viajes recientes.

#### Mapa central (la zona principal del boceto)
- Mapa interactivo con:
  - **Línea roja sólida:** ruta principal del bus/Metro.
  - **Línea celeste paralela:** ruta del pasajero a pie hasta el paradero.
  - **Línea amarilla curva:** desvío temporal o ruta alternativa sugerida.
  - **Pin verde:** paradero de origen ("PARADERO T = 2 min").
  - **Pin rojo:** paradero de destino ("PARADERO T = 2 min").
  - **Bus animado:** icono del bus moviéndose en tiempo real sobre la ruta.
  - **Marcadores de incidencia:** icono triángulo (accidente/interferencia) con tooltip clickeable.

#### Tarjeta flotante de información (sobre el mapa, parte inferior)
- Tiempo estimado de llegada del próximo bus.
- Próximas 3 unidades: "Bus 1 → 2 min · Bus 2 → 8 min · Bus 3 → 15 min".
- Nivel de ocupación del bus (3 puntitos: verde/amarillo/rojo).
- Botón "REPORTAR INTERFERENCIA" (rojo, prominente).

#### Bottom Navigation (4 tabs, como en el boceto)
1. **Seguimiento de ruta** (default) — mapa con ruta activa.
2. **Recarga** — recarga de tarjeta TIT/Metropolitano/Metro.
3. **CHAT** — agente conversacional IA (ver sección 1.6).
4. **Perfil** — datos del usuario, historial, configuración.

### 1.3 Pantalla principal — Modo Chofer

#### Diferencias clave vs Pasajero:
- Header con número de unidad: "Unidad MT-2347" + estado (En ruta / En paradero / Fuera de servicio).
- Mapa muestra la ruta asignada con el progreso del recorrido.
- Tarjeta inferior con:
  - Siguiente paradero + distancia.
  - Pasajeros estimados que esperan en el siguiente paradero (basado en validaciones históricas).
  - Cumplimiento de horario (en verde si va a tiempo, rojo si va atrasado).
- Botones rápidos: **Reportar incidencia · Solicitar apoyo · Comunicarse con base**.

### 1.4 Recarga de tarjeta
- Saldo actual destacado en grande.
- Selector de monto: S/ 5, 10, 20, 50, otro.
- Métodos de pago: Yape, Plin, tarjeta, transferencia, agente físico.
- Historial de recargas con fecha y monto.

### 1.5 Reportar interferencia / incidencia
Modal o pantalla completa con:
- **Tipo de reporte:** Accidente · Congestión severa · Paradero bloqueado · Bus averiado · Semáforo malogrado · Otro.
- **Ubicación:** autodetectada por GPS (con opción de ajustar en el mapa).
- **Foto opcional:** botón para abrir cámara.
- **Descripción:** input de texto corto.
- **Botón "Enviar reporte"**.
- Mensaje de confirmación: "Reporte enviado. La ATU lo revisará en minutos. Gracias por contribuir."

### 1.6 Chat — Agente conversacional IA

**Funcionalidad clave del producto.** El chat es un asistente que entiende lenguaje natural y responde sobre rutas, tiempos, recargas e incidencias.

#### Interfaz
- Lista de conversaciones (estilo WhatsApp).
- Burbujas con avatares (usuario derecha azul, IA izquierda gris).
- Sugerencias rápidas al iniciar: "¿Cómo llego a [destino]?" · "¿Cuándo pasa el próximo bus?" · "¿Por qué hay tráfico hoy?" · "¿Cómo recargo mi tarjeta?".
- Input de texto + ícono de micrófono (input por voz) + ícono de imagen.

#### Ejemplos de interacción
- Usuario: *"Estoy en Naranjal, ¿cuánto demoro al Estadio Nacional?"* → IA: muestra mapa embebido en el chat con ruta, tiempo (28 ± 5 min), próximos buses, y costo.
- Usuario: *"Reporta que el bus 2347 está vacío"* → IA: registra el reporte y agradece.
- Usuario: *"¿Por qué está demorando tanto?"* → IA: consulta incidencias activas en la ruta y responde con explicación (ej. "Accidente en Estación México, retraso estimado 12 min").

### 1.7 Perfil
- Foto + nombre + correo.
- Tarjetas vinculadas (TIT, Metropolitano, Metro) con saldo individual.
- Historial de viajes (últimos 30 días) con mapa de calor de zonas frecuentes.
- Estadísticas personales: viajes/mes, ahorro estimado vs taxi, CO₂ ahorrado.
- Configuración: notificaciones, idioma (Español/Quechua/Inglés), tema (claro/oscuro), privacidad.
- Cerrar sesión.

### 1.8 Pantallas secundarias
- Notificaciones (alertas push históricas).
- Detalle de incidencia (al tocar un marcador en el mapa).
- Planificador de viaje (origen, destino, fecha/hora, modo: más rápido / más barato / menos transbordos).
- Detalle de ruta (paso a paso con instrucciones).

---

## 2. WEB — Dashboard ATU (la del boceto, lado superior derecho)

> Centro de control operacional para personal de la ATU. Modo escritorio, optimizado para pantallas grandes.

### 2.1 Estructura general
- **Sidebar izquierda fija** con navegación principal.
- **Header superior** con búsqueda global, notificaciones y perfil del usuario ATU.
- **Área central** con el contenido del módulo seleccionado.

### 2.2 Navegación principal (sidebar)
1. **Inicio / Vista general** — resumen del día.
2. **Monitoreo de tráfico** ← (la pantalla del boceto).
3. **Crear ruta** — diseño de nuevas rutas o desvíos temporales.
4. **Reclamos** — gestión de reclamos ciudadanos.
5. **Alertas** — alertas activas del sistema.
6. **Reportería** ← (la del boceto, parte inferior verde).
7. **Cámaras** — feed de cámaras urbanas.
8. **Semáforos** — gestión semafórica.
9. **Flota** — monitoreo GPS de buses.
10. **Configuración**.

### 2.3 Vista "Monitoreo de tráfico" (la del boceto)

**Split view en dos paneles:**

#### Panel izquierdo — Mapa con semáforos
- Vista de calles con cuadrícula de intersecciones.
- Cada intersección con su semáforo representado por 3 círculos (verde/amarillo/rojo).
- Estado en tiempo real: si el círculo está relleno, ese color está activo.
- Click sobre un semáforo abre detalle: tiempo de ciclo, recomendación de ajuste, histórico.
- Botón flecha (→) en esquina para expandir el mapa.

#### Panel derecho — Mapa de rutas activas
- Vista zoom-out de toda la ciudad con todas las rutas trazadas en rojo.
- Marcador estrella (★) sobre puntos críticos.
- Botón "ver" al lado de cada incidencia activa.
- Click sobre estrella → abre modal con detalle del incidente.

#### Barra inferior de tabs
- **monitoreo · crear ruta · reclamos · alertas** (como en el boceto).

### 2.4 Vista "Crear ruta"
- Editor de mapa con herramientas de dibujo.
- Origen, destino, paradas intermedias.
- Tipo de ruta: regular, temporal/desvío, exprés.
- Horarios de operación.
- Asignación de buses/flota.
- Botón "Publicar ruta" — al publicar, las apps de chofer y pasajero la reciben automáticamente.

### 2.5 Vista "Reclamos"
- Tabla con todos los reclamos recibidos.
- Filtros: tipo, fecha, estado, prioridad, corredor.
- Columnas: ID, fecha, usuario, tipo, ubicación, estado, asignado a, acción.
- Click en fila → detalle con foto, ubicación en mapa, historial de gestión.
- Botón "Asignar a equipo de campo".

### 2.6 Vista "Alertas"
- Lista de alertas activas en tiempo real.
- Codificadas por severidad: roja (crítica), amarilla (media), verde (informativa).
- Tipos: accidente, congestión severa, paradero saturado, bus averiado, ruta cortada, evento masivo.
- Cada alerta con: hora, ubicación, descripción, fuente (cámara/GPS/reporte ciudadano), acción tomada.

### 2.7 Vista "Sistema de Reportería" (la del boceto, parte inferior verde)

> Generador de reportes operacionales y estadísticos.

- **Selector de tipo de reporte:**
  - Validaciones por estación
  - Validaciones por tramo
  - Pasaje promedio
  - Incidencias por corredor
  - Cumplimiento de rutas
  - Flota operativa
  - Reclamos por servicio
- **Selector de periodo:** rango de fechas, mes, año, comparativo entre periodos.
- **Filtros adicionales:** corredor, estación, tipo de día, tipo de tarjeta.
- **Vista previa del reporte** con gráficas (líneas, barras, mapa de calor).
- **Botones:** Exportar a Excel · Exportar a PDF · Programar envío automático · Compartir link.

### 2.8 Vista "Cámaras"
- Grid de feeds en vivo de cámaras urbanas (4, 9 o 16 simultáneas).
- Cada feed con etiqueta de ubicación.
- Detección IA superpuesta: conteo de vehículos, peatones, alertas automáticas.
- Click sobre cámara → vista expandida con controles de zoom, históricos, snapshots.

### 2.9 Vista "Flota GPS"
- Mapa con todos los buses en tiempo real (puntos coloreados por estado).
- Lista lateral con cada unidad: ID, ruta, chofer, velocidad, próximo paradero, cumplimiento.
- Click sobre unidad → detalle con historial de la jornada.

---

## 3. WEB — Portal público (consulta ciudadana)

> Versión web del producto pasajero para quienes no usan la app móvil.

- Buscador de rutas como Google Maps.
- Mapa interactivo con todas las rutas del sistema.
- Estado del servicio en tiempo real.
- Sección de noticias y alertas oficiales.
- Sección "datos abiertos" con visualizaciones públicas.
- Login opcional para sincronizar con la app móvil.

---

## 4. Flujos críticos para mockuppear primero

Si vas a hacer mockups con foco en lo esencial para el pitch, prioriza estos 5 flujos:

| # | Flujo | Pantallas |
|---|-------|-----------|
| 1 | Pasajero busca tiempo de llegada de su bus | Home pasajero (con mapa) → Detalle de ruta → Notificación push de llegada |
| 2 | Pasajero usa el chat para preguntar ruta | Tab CHAT → Conversación con IA → Mapa embebido con respuesta |
| 3 | Pasajero reporta una incidencia | Botón "REPORTAR INTERFERENCIA" → Formulario → Confirmación |
| 4 | ATU monitorea el tráfico en vivo | Dashboard inicio → Monitoreo de tráfico → Detalle de semáforo problemático |
| 5 | ATU genera un reporte de validaciones | Sistema de Reportería → Selección de tipo → Vista previa → Exportar |

---

## 5. Herramientas recomendadas para los mockups

### Para hacerlo rápido
- **Figma** (gratis, colaborativo, librerías de componentes prearmadas).
  - Plugin recomendado: "Mapsicle" para insertar mapas reales.
  - Librería: Material Design 3 o Apple HIG para componentes nativos.
- **Penpot** (open source, similar a Figma).

### Para alta fidelidad
- **Figma + Anima** para exportar a HTML/React.
- **Framer** si quieren mockups animados/interactivos.

### Si no hay tiempo
- **Excalidraw** o **tldraw** para wireframes rápidos en estilo boceto (perfecto para presentar el concepto sin perder tiempo en pixel-perfect).

---

## 6. Recomendación para el pitch del hackathon

No hagas mockups de todas las pantallas. Para los 15 minutos de pitch necesitas:

1. **3 pantallas mobile** alta fidelidad: Home pasajero (con mapa), Chat IA, Reporte de incidencia.
2. **2 pantallas web** alta fidelidad: Monitoreo de tráfico, Sistema de Reportería.
3. **1 diagrama de arquitectura** mostrando cómo se conectan los datos abiertos ATU, el motor de IA, las cámaras y los tres productos finales.
4. **1 prototipo clickeable en Figma** que muestre el flujo "pasajero busca su bus → ve tiempo → recibe alerta" — esto es lo que el jurado va a recordar.

El resto puede ir como bocetos rápidos en el mismo estilo que la imagen que enviaste, para mostrar la visión completa del producto sin invertir días en diseñarlo todo.
