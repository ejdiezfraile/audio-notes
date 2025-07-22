class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.startTime = null
    this.timerInterval = null

    this.initializeElements()
    this.bindEvents()
    this.loadRecordings()
  }

  initializeElements() {
    this.startBtn = document.getElementById("startBtn")
    this.stopBtn = document.getElementById("stopBtn")
    this.playBtn = document.getElementById("playBtn")
    this.refreshBtn = document.getElementById("refreshBtn")
    this.status = document.getElementById("status")
    this.timer = document.getElementById("timer")
    this.audioPlayback = document.getElementById("audioPlayback")
    this.recordingsList = document.getElementById("recordingsList")
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.startRecording())
    this.stopBtn.addEventListener("click", () => this.stopRecording())
    this.playBtn.addEventListener("click", () => this.playRecording())
    this.refreshBtn.addEventListener("click", () => this.loadRecordings())
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.processRecording()
      }

      this.mediaRecorder.start(1000) // Capturar datos cada segundo
      this.isRecording = true
      this.startTime = Date.now()

      this.updateUI()
      this.startTimer()
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      this.status.textContent = "Error: No se pudo acceder al micrófono"
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      this.isRecording = false
      this.stopTimer()
      this.updateUI()
    }
  }

  processRecording() {
    const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
    const audioUrl = URL.createObjectURL(audioBlob)

    this.audioPlayback.src = audioUrl
    this.audioPlayback.style.display = "block"
    this.playBtn.disabled = false

    this.uploadAudio(audioBlob)
  }

  async uploadAudio(audioBlob) {
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.webm")

    try {
      this.status.textContent = "Guardando grabación..."

      const response = await fetch("/upload-audio", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        this.status.textContent = `✅ Grabación guardada: ${result.filename}`
        this.loadRecordings()
      } else {
        this.status.textContent = `❌ Error: ${result.error}`
      }
    } catch (error) {
      console.error("Error al subir audio:", error)
      this.status.textContent = "❌ Error al guardar la grabación"
    }
  }

  playRecording() {
    this.audioPlayback.play()
  }

  async loadRecordings() {
    try {
      const response = await fetch("/recordings")
      const recordings = await response.json()

      this.recordingsList.innerHTML = ""

      if (recordings.length === 0) {
        this.recordingsList.innerHTML = '<li style="text-align: center; color: #666;">No hay grabaciones guardadas</li>'
        return
      }

      recordings.forEach((filename) => {
        const li = document.createElement("li")
        li.innerHTML = `
                    <span class="recording-name">🎵 ${filename}</span>
                    <div class="recording-controls">
                        <button class="play-recording" onclick="playServerRecording('${filename}')">▶️ Reproducir</button>
                        <button class="download-recording" onclick="downloadRecording('${filename}')">⬇️ Descargar</button>
                    </div>
                `
        this.recordingsList.appendChild(li)
      })
    } catch (error) {
      console.error("Error al cargar grabaciones:", error)
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      this.timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  updateUI() {
    if (this.isRecording) {
      this.startBtn.disabled = true
      this.stopBtn.disabled = false
      this.status.textContent = "🔴 Grabando..."
    } else {
      this.startBtn.disabled = false
      this.stopBtn.disabled = true
      this.status.textContent = "Grabación completada"
    }
  }
}

// Funciones globales para los controles de grabaciones
window.playServerRecording = (filename) => {
  const audio = new Audio(`/recordings/${filename}`)
  audio.play()
}

window.downloadRecording = (filename) => {
  const link = document.createElement("a")
  link.href = `/recordings/${filename}`
  link.download = filename
  link.click()
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  new AudioRecorder()
})
