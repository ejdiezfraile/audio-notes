## ✅ Checklist del Plan de Acción para la Aplicación de Notas de Voz

### 🔧 Configuración Inicial del Proyecto
- [ ] Crear proyecto base con Astro y TypeScript.
- [ ] Configurar Tailwind CSS y Shadcn/ui para estilos y componentes.
- [ ] Integrar Turso con base de datos SQLite.
- [ ] Integrar sistema de autenticación (Better-Auth o alternativa).

### 🔐 Autenticación de Usuarios
- [ ] Implementar login y registro por email y contraseña.
- [ ] Implementar login social con GitHub.
- [ ] Proteger rutas y endpoints para que solo usuarios autenticados accedan.

### 🎙️ Funcionalidad de Grabación de Audio
- [ ] Crear pantalla principal con botón de "Grabar".
- [ ] Implementar visualizador de onda de audio en tiempo real.
- [ ] Agregar botones de "Pausar" y "Parar".
- [ ] Añadir contador regresivo de 2 minutos para límite de grabación.
- [ ] Validar detención automática al llegar a 0 segundos.

### 🧪 Gestión del Audio Grabado
- [ ] Permitir reproducción del audio grabado antes de enviarlo.
- [ ] Habilitar descarga del archivo en `.webm` o `.mp3`.
- [ ] Implementar botón "Enviar a transcribir".

### 🤖 Transcripción con IA (Groq)
- [ ] Crear endpoint `POST /api/transcribe`.
- [ ] Enviar archivo de audio a la API de Groq para transcripción.
- [ ] Mostrar estado `loading` mientras se procesa.
- [ ] Mostrar transcripción recibida en modal editable.

### 📝 Edición, Análisis y Almacenamiento de la Nota
- [ ] Permitir edición del texto transcrito.
- [ ] Enviar texto final a la API `POST /api/notes`.
  - [ ] Obtener título generado por IA.
  - [ ] Obtener tags generados por IA.
- [ ] Guardar datos en la tabla `notes` (title, content, tags, created_at, user_id).
- [ ] Validar estructura del modelo de datos `notes`.

### 📋 Visualización de Notas (Dashboard)
- [ ] Crear vista tipo dashboard para listar notas.
- [ ] Ordenar notas cronológicamente (descendente).
- [ ] Implementar buscador por título.
- [ ] Agregar filtros por fecha y tags/categorías.

### 🌐 Endpoints API
- [ ] `POST /api/transcribe`: Recibe audio y retorna texto.
- [ ] `POST /api/notes`: Recibe texto, genera título/tags y guarda en DB.
- [ ] `GET /api/notes`: Lista notas del usuario con filtros (`?tag=...`, `?q=...`).

### 🚫 Reglas y Consideraciones Especiales
- [ ] Asegurarse de **no guardar archivos de audio** en el servidor.
- [ ] Limitar grabaciones a 2 minutos para cumplir con plan gratuito.
- [ ] Garantizar feedback visual constante (loading, errores, éxito).
- [ ] Asegurar protección de datos en todos los endpoints API.

