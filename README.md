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