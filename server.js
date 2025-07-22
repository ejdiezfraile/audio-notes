import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Crear directorio para grabaciones si no existe
const recordingsDir = path.join(__dirname, "recordings")
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir)
}

// Configurar multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir)
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    cb(null, `recording-${timestamp}.webm`)
  },
})

const upload = multer({ storage })

// Servir archivos estáticos
app.use(express.static("public"))

// Endpoint para subir audio
app.post("/upload-audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió archivo de audio" })
  }

  console.log("Audio guardado:", req.file.filename)
  res.json({
    message: "Audio guardado exitosamente",
    filename: req.file.filename,
    path: req.file.path,
  })
})

// Endpoint para listar grabaciones
app.get("/recordings", (req, res) => {
  fs.readdir(recordingsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Error al leer directorio" })
    }

    const audioFiles = files.filter((file) => file.endsWith(".webm"))
    res.json(audioFiles)
  })
})

// Servir grabaciones
app.use("/recordings", express.static(recordingsDir))

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
  console.log(`Grabaciones se guardan en: ${recordingsDir}`)
})
