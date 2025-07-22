# 🎤 Audio Recorder WebApp

Una aplicación web sencilla y moderna para grabar audio usando Node.js 21 y la Web Audio API. Permite grabar, reproducir, guardar y descargar grabaciones de audio directamente desde el navegador.

## ✨ Características

- 🎙️ **Grabación de audio en tiempo real** usando MediaRecorder API
- 💾 **Guardado automático** en el servidor local
- ▶️ **Reproducción inmediata** de grabaciones
- 📁 **Gestión de archivos** con lista de grabaciones guardadas
- ⬇️ **Descarga de archivos** de audio
- ⏱️ **Timer en tiempo real** durante la grabación
- 📱 **Diseño responsive** para móviles y escritorio
- 🎨 **Interfaz moderna** con gradientes y animaciones
- 🔊 **Audio de alta calidad** (44.1kHz, formato WebM/Opus)

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js 21+ con ES Modules
- **Framework**: Express.js
- **Upload de archivos**: Multer
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Audio API**: MediaRecorder API, Web Audio API
- **Formato de audio**: WebM con códec Opus

## 📁 Estructura del Proyecto

```
audio-recorder-webapp/
├── server.js              # Servidor Express principal
├── package.json           # Dependencias y scripts
├── README.md             # Documentación del proyecto
├── public/               # Archivos estáticos del frontend
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos CSS
│   └── script.js         # Lógica JavaScript del cliente
└── recordings/           # Carpeta de grabaciones (se crea automáticamente)
    └── recording-*.webm  # Archivos de audio grabados
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js versión 21 o superior
- npm (incluido con Node.js)
- Navegador web moderno con soporte para MediaRecorder API

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes el código en un repositorio
   git clone <url-del-repositorio>
   cd audio-recorder-webapp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**
   ```bash
   # Modo producción
   npm start
   
   # Modo desarrollo (con auto-reload)
   npm run dev
   ```

4. **Abrir en el navegador**




# groq-whisper-transcribe

Script Node.js para transcribir archivos de audio usando la API de Groq y el modelo Whisper (`whisper-large-v3-turbo`).  

La transcripción se guarda automáticamente en un archivo `.txt` con el mismo nombre y ubicación que el archivo de audio original.

## Requisitos

- Node.js v18 o superior (recomendado v20+)
- Una clave API de Groq (`GROQ_API_KEY`)
- Instalar dependencias:
  ```sh
  npm install formdata-node
  ```

## Uso

1. Exporta tu clave de Groq en el entorno:
   ```sh
   export GROQ_API_KEY=tu_clave_de_groq
   ```

2. Ejecuta el script:
   ```sh
   node transcribeAudioGroq.js ruta/al/audio.mp3 [idioma]
   ```

   - El parámetro `idioma` es opcional (ejemplo: `es` para español, `en` para inglés). Si no se indica, Groq detecta el idioma automáticamente.

3. La transcripción se guarda en el mismo directorio, con extensión `.txt`:
   - Ejemplo: `audio.mp3` → `audio.txt`

## Ejemplo

```sh
node transcribeAudioGroq.js ./grabacion.mp3 es
```

## Notas

- El modelo por defecto es `whisper-large-v3-turbo`.
- Si tienes dudas o quieres transcribir en otro idioma, simplemente añade el parámetro correspondiente.
- El script no requiere el SDK de Groq.
