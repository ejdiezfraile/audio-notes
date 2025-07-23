# 🎙️ Audio Recorder & Transcriber

Aplicación web para **grabar audio** desde el navegador y **transcribirlo automáticamente** usando la API de Groq con el modelo Whisper (`whisper-large-v3-turbo`).

Combina:
- **Audio Recorder WebApp**: grabación, reproducción y gestión de archivos de audio.
- **Groq Whisper Transcriber**: transcripción automática de los audios grabados.

---

## ✨ Características principales

- 🎙️ **Grabación de audio en tiempo real** (MediaRecorder API)
- 💾 **Guardado automático** de grabaciones en el servidor
- ▶️ **Reproducción inmediata** de grabaciones
- 📁 **Lista de archivos grabados**
- ⬇️ **Descarga de archivos** de audio
- 📝 **Transcripción automática** con la API de Groq y Whisper
- 🔊 **Audio de alta calidad** (44.1kHz, WebM/Opus)
- 📱 **Diseño responsive**

---

## 🛠️ Tecnologías utilizadas

- **Backend**: Node.js 21+ (grabación) y Node.js 18+ (transcripción)
- **Framework**: Express.js
- **Upload de archivos**: Multer
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **APIs**: MediaRecorder API, Web Audio API, Groq Whisper API

---

## 📁 Estructura del proyecto

```
audio-notes/
├── server.js               # Servidor Express para grabación
├── transcribe-groq.js      # Script Node.js para transcripción
├── package.json            # Dependencias y scripts
├── public/                 # Archivos estáticos del frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
└── recordings/             # Grabaciones generadas
    └── recording-*.webm
```

---

## 🚀 Instalación y uso

### ✅ Requisitos previos

- Node.js versión 21+ para la grabadora
- Navegador moderno compatible con MediaRecorder API
- Clave API de Groq (`GROQ_API_KEY`)

### 📦 Instalación

1. Clonar repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd audio-notes
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

### ▶️ Ejecutar la grabadora

```bash
# Modo producción
npm start

# Modo desarrollo (con auto-reload)
npm run dev
```

Abre en tu navegador para comenzar a grabar.

### 📝 Ejecutar la transcripción

1. Exporta tu clave de Groq en el entorno:

   ```bash
   export GROQ_API_KEY=tu_clave_de_groq
   ```

2. Ejecuta el script de transcripción:

   ```bash
   node transcribe-groq.js ruta/al/audio.webm [idioma]
   ```

   - `idioma` es opcional (ejemplo: `es` para español).

3. La transcripción se guarda en el mismo directorio con extensión `.txt`.

Ejemplo:
```bash
node transcribe-groq.js ./recordings/recording-1.webm es
```

---

## 🤝 Créditos

- 🎤 **Audio Recorder WebApp** por [ejdiezfraile]
- 📝 **Groq Whisper Transcriber** por [Tejdiezfraile]

---

## 📄 Licencia

MIT
