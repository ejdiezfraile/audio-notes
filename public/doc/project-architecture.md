## 🏗️ Documento de Arquitectura: Aplicación de Transcripción de Notas de Voz

### 1. Arquitectura General
La aplicación está basada en una arquitectura de tipo **SPA (Single Page Application)** con separación clara de responsabilidades entre frontend, backend (API Routes) y servicios externos.

```
[ Cliente (Navegador) ]  <-->  [ Astro API Routes (Servidor) ]  <-->  [ Servicios Externos: Groq, Turso ]
```

### 2. Capas de la Aplicación

#### 🧑‍🎨 Capa de Presentación (Frontend)
- **Tecnologías**: Astro (SPA), TypeScript, TailwindCSS, Shadcn/ui.
- **Responsabilidades**:
  - Interfaz de usuario.
  - Grabación de audio.
  - Visualización del audio (waveform).
  - Mostrar estados de carga y errores.
  - Gestión de sesión (login/logout).
  - Interacción con la API del backend vía `fetch`.

#### ⚙️ Capa de Lógica de Aplicación (API Routes - Backend en Astro)
- **Ubicación**: `/pages/api/`
- **Tecnologías**: TypeScript.
- **Responsabilidades**:
  - Recepción y manejo de blobs de audio.
  - Comunicación con API de Groq para transcripción y generación de títulos/tags.
  - Validación de sesión/autenticación.
  - Gestión y persistencia de notas en la base de datos (Turso).

#### 💾 Capa de Persistencia (Base de Datos en Turso)
- **Tecnología**: SQLite vía Turso.
- **Tablas principales**:
  - `users` (gestionada por sistema de autenticación).
  - `notes` (contenido transcrito, título, tags, timestamps).

#### 🌐 Servicios Externos
- **Groq API**:
  - Transcripción de audio.
  - Generación automática de títulos y tags.
- **Better-Auth** (o similar):
  - Gestión de usuarios y sesiones (auth por email y GitHub).

### 3. Flujo de Comunicación

1. **Autenticación**:
   - El usuario se autentica (email o GitHub).
   - Se genera una sesión y se guarda en el cliente (cookie o token).

2. **Grabación de Audio**:
   - El usuario inicia la grabación.
   - El audio se captura en el navegador y se representa con waveform.

3. **Transcripción**:
   - Al finalizar la grabación, el cliente envía el audio (`FormData`) al endpoint `POST /api/transcribe`.
   - El backend reenvía el audio a Groq API.
   - Se recibe texto transcrito y se devuelve al cliente.

4. **Edición y Guardado**:
   - El usuario edita el texto.
   - El cliente envía el texto a `POST /api/notes`.
   - El backend solicita a Groq el título y los tags.
   - Se almacena en Turso como una nueva entrada en `notes`.

5. **Dashboard y Consulta**:
   - El cliente consulta `GET /api/notes`.
   - El backend filtra por `user_id` autenticado.
   - Se devuelven todas las notas en formato JSON.

### 4. Seguridad y Consideraciones
- Todas las rutas de la API requieren autenticación activa.
- Los archivos de audio **no se almacenan** en el servidor.
- Límites de tiempo (2 minutos) y manejo de errores visibles al usuario.
- Comunicación segura (HTTPS) obligatoria.

### 5. Diagrama de Componentes (Simplificado)

```
┌──────────────────────────────┐
│        Cliente Web (SPA)     │
│ ┌──────────────────────────┐ │
│ │ UI/UX (Tailwind + UI)    │ │
│ │ Grabación de Audio       │ │
│ │ Sesión/Autenticación     │ │
│ │ Fetch a API              │ │
│ └──────────────────────────┘ │
└─────────────▲────────────────┘
              │
              ▼
┌──────────────────────────────┐
│        Astro API Routes      │
│ ┌──────────────────────────┐ │
│ │ /api/transcribe          │ │ → Groq (Transcripción)
│ │ /api/notes               │ │ → Groq (Título/Tags)
│ │ /api/notes [GET]         │ │ ← Turso (DB)
│ └──────────────────────────┘ │
└─────────────▲────────────────┘
              │
              ▼
     ┌────────────┬────────────┐
     ▼                         ▼
 Groq API                Turso (SQLite)
```

---

Este diseño modular y con capas bien separadas permite escalar, mantener y extender la aplicación fácilmente.

