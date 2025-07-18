import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs/promises"
import { fileURLToPath } from "url"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const audioDir = path.join(__dirname, "temp-audio")
    try {
      await fs.mkdir(audioDir, { recursive: true })
    } catch (error) {
      console.error("Error creating temp-audio directory:", error)
    }
    cb(null, audioDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}.webm`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

// Middleware
app.use(express.json())
app.use(express.static("public"))

// Asegurar que existen las carpetas necesarias
async function ensureDirectories() {
  const dirs = ["audio", "temp-audio", "public"]
  for (const dir of dirs) {
    try {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true })
    } catch (error) {
      console.error(`Error creating ${dir} directory:`, error)
    }
  }

  // Crear notes.json si no existe
  const notesPath = path.join(__dirname, "notes.json")
  try {
    await fs.access(notesPath)
  } catch {
    await fs.writeFile(notesPath, JSON.stringify([], null, 2))
  }
}

// Endpoint para procesar audio con Groq
app.post("/api/process-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió archivo de audio" })
    }

    console.log("Procesando archivo:", req.file.filename)

    // 1. Transcripción con Groq Whisper
    const audioBuffer = await fs.readFile(req.file.path)
    const audioBlob = new Blob([audioBuffer], { type: "audio/webm" })

    // Crear FormData para la transcripción
    const formData = new FormData()
    formData.append("file", audioBlob, "audio.webm")
    formData.append("model", "whisper-large-v3")

    const transcriptionResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`Error en transcripción: ${transcriptionResponse.statusText}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcription = transcriptionData.text

    console.log("Transcripción obtenida:", transcription)

    // 2. Generar título y tags con Groq Chat
    const { text: analysisText } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt: `Analiza la siguiente transcripción de una nota de voz y genera un título descriptivo y tags relevantes.

Transcripción: "${transcription}"

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "title": "Título descriptivo de la nota",
  "tags": ["tag1", "tag2", "tag3"]
}

No incluyas explicaciones adicionales, solo el JSON.`,
    })

    console.log("Análisis obtenido:", analysisText)

    // Parsear la respuesta JSON
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch (parseError) {
      console.error("Error parseando análisis:", parseError)
      // Fallback si el parsing falla
      analysis = {
        title: "Nota de voz",
        tags: ["general"],
      }
    }

    // Responder con todos los datos procesados
    res.json({
      success: true,
      tempFileName: req.file.filename,
      transcription: transcription,
      suggestedTitle: analysis.title,
      suggestedTags: analysis.tags,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error procesando audio:", error)
    res.status(500).json({
      error: "Error procesando el audio",
      details: error.message,
    })
  }
})

// Endpoint para guardar la nota final
app.post("/api/save-note", async (req, res) => {
  try {
    const { tempFileName, title, transcription, tags } = req.body

    if (!tempFileName || !title || !transcription) {
      return res.status(400).json({ error: "Faltan datos requeridos" })
    }

    // Generar nombre único para el archivo de audio final
    const finalAudioName = `note-${Date.now()}.webm`
    const tempPath = path.join(__dirname, "temp-audio", tempFileName)
    const finalPath = path.join(__dirname, "audio", finalAudioName)

    // Mover archivo de temporal a definitivo
    await fs.rename(tempPath, finalPath)

    // Crear objeto de nota
    const note = {
      id: Date.now(),
      title: title.trim(),
      transcription: transcription.trim(),
      tags: Array.isArray(tags) ? tags : [],
      audioFile: finalAudioName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Leer notas existentes
    const notesPath = path.join(__dirname, "notes.json")
    let notes = []
    try {
      const notesData = await fs.readFile(notesPath, "utf8")
      notes = JSON.parse(notesData)
    } catch (error) {
      console.log("Creando nuevo archivo de notas")
    }

    // Añadir nueva nota
    notes.unshift(note) // Añadir al principio para mostrar las más recientes primero

    // Guardar notas actualizadas
    await fs.writeFile(notesPath, JSON.stringify(notes, null, 2))

    console.log("Nota guardada exitosamente:", note.title)

    res.json({
      success: true,
      note: note,
      message: "Nota guardada exitosamente",
    })
  } catch (error) {
    console.error("Error guardando nota:", error)
    res.status(500).json({
      error: "Error guardando la nota",
      details: error.message,
    })
  }
})

// Endpoint para obtener todas las notas
app.get("/api/notes", async (req, res) => {
  try {
    const notesPath = path.join(__dirname, "notes.json")
    const notesData = await fs.readFile(notesPath, "utf8")
    const notes = JSON.parse(notesData)
    res.json(notes)
  } catch (error) {
    console.error("Error obteniendo notas:", error)
    res.json([])
  }
})

// Endpoint para servir archivos de audio
app.get("/audio/:filename", (req, res) => {
  const filename = req.params.filename
  const audioPath = path.join(__dirname, "audio", filename)
  res.sendFile(audioPath)
})

// Limpiar archivos temporales al inicio
async function cleanTempFiles() {
  try {
    const tempDir = path.join(__dirname, "temp-audio")
    const files = await fs.readdir(tempDir)
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file))
    }
    console.log("Archivos temporales limpiados")
  } catch (error) {
    console.log("No hay archivos temporales que limpiar")
  }
}

// Inicializar servidor
async function startServer() {
  await ensureDirectories()
  await cleanTempFiles()

  app.listen(PORT, () => {
    console.log(`🎤 Servidor de notas de voz ejecutándose en http://localhost:${PORT}`)
    console.log(`📁 Notas guardadas en: ${path.join(__dirname, "notes.json")}`)
    console.log(`🔊 Audio guardado en: ${path.join(__dirname, "audio")}`)
  })
}

startServer()
