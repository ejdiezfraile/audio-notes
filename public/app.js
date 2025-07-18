class VoiceNotesApp {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.recordingStartTime = null
    this.recordingTimer = null
    this.currentTempFileName = null

    this.initializeElements()
    this.bindEvents()
    this.loadNotes()
  }

  initializeElements() {
    // Elementos de grabación
    this.recordBtn = document.getElementById("recordBtn")
    this.stopBtn = document.getElementById("stopBtn")
    this.processBtn = document.getElementById("processBtn")
    this.audioPreview = document.getElementById("audioPreview")
    this.audioPlayer = document.getElementById("audioPlayer")
    this.recordingStatus = document.getElementById("recordingStatus")
    this.recordingTimer = document.getElementById("recordingTimer")

    // Elementos de procesamiento
    this.processingSection = document.getElementById("processingSection")

    // Elementos de edición
    this.editingSection = document.getElementById("editingSection")
    this.editForm = document.getElementById("editForm")
    this.noteTitle = document.getElementById("noteTitle")
    this.noteTranscription = document.getElementById("noteTranscription")
    this.noteTags = document.getElementById("noteTags")
    this.cancelBtn = document.getElementById("cancelBtn")
    this.saveBtn = document.getElementById("saveBtn")

    // Elementos de notas
    this.notesList = document.getElementById("notesList")
    this.refreshBtn = document.getElementById("refreshBtn")
  }

  bindEvents() {
    this.recordBtn.addEventListener("click", () => this.startRecording())
    this.stopBtn.addEventListener("click", () => this.stopRecording())
    this.processBtn.addEventListener("click", () => this.processAudio())
    this.editForm.addEventListener("submit", (e) => this.saveNote(e))
    this.cancelBtn.addEventListener("click", () => this.cancelEditing())
    this.refreshBtn.addEventListener("click", () => this.loadNotes())
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
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        this.audioPlayer.src = audioUrl
        this.audioPreview.style.display = "block"

        // Detener todas las pistas de audio
        stream.getTracks().forEach((track) => track.stop())
      }

      this.mediaRecorder.start(1000) // Grabar en chunks de 1 segundo

      // Actualizar UI
      this.recordBtn.disabled = true
      this.recordBtn.classList.add("recording")
      this.stopBtn.disabled = false
      this.audioPreview.style.display = "none"

      // Iniciar timer
      this.recordingStartTime = Date.now()
      this.startRecordingTimer()

      this.updateRecordingStatus("🔴 Grabando...", true)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      alert("Error al acceder al micrófono. Por favor, permite el acceso y recarga la página.")
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop()

      // Actualizar UI
      this.recordBtn.disabled = false
      this.recordBtn.classList.remove("recording")
      this.stopBtn.disabled = true

      // Detener timer
      this.stopRecordingTimer()

      this.updateRecordingStatus("✅ Grabación completada", false)
    }
  }

  startRecordingTimer() {
    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.recordingStartTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)

      const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      this.recordingTimer.textContent = timeString
    }, 1000)
  }

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
      this.recordingTimer = null
    }
  }

  updateRecordingStatus(text, isRecording) {
    const statusText = this.recordingStatus.querySelector(".status-text")
    statusText.textContent = text
    statusText.style.color = isRecording ? "#ff4757" : "#27ae60"
  }

  async processAudio() {
    try {
      // Mostrar sección de procesamiento
      this.processingSection.style.display = "block"
      this.processBtn.disabled = true
      this.processBtn.textContent = "⏳ Procesando..."

      // Crear FormData con el audio
      const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      // Enviar al servidor
      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Guardar referencia del archivo temporal
        this.currentTempFileName = result.tempFileName

        // Llenar formulario de edición
        this.noteTitle.value = result.suggestedTitle
        this.noteTranscription.value = result.transcription
        this.noteTags.value = result.suggestedTags.join(", ")

        // Mostrar sección de edición
        this.processingSection.style.display = "none"
        this.editingSection.style.display = "block"

        // Scroll hacia la sección de edición
        this.editingSection.scrollIntoView({ behavior: "smooth" })
      } else {
        throw new Error(result.error || "Error procesando el audio")
      }
    } catch (error) {
      console.error("Error procesando audio:", error)
      alert(`Error procesando el audio: ${error.message}`)

      // Restaurar UI
      this.processingSection.style.display = "none"
      this.processBtn.disabled = false
      this.processBtn.innerHTML = "<span>🧠 Procesar con IA</span>"
    }
  }

  async saveNote(event) {
    event.preventDefault()

    try {
      this.saveBtn.disabled = true
      this.saveBtn.textContent = "💾 Guardando..."

      const noteData = {
        tempFileName: this.currentTempFileName,
        title: this.noteTitle.value.trim(),
        transcription: this.noteTranscription.value.trim(),
        tags: this.noteTags.value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      }

      const response = await fetch("/api/save-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Limpiar formularios y ocultar secciones
        this.resetRecordingInterface()
        this.editingSection.style.display = "none"

        // Recargar lista de notas
        await this.loadNotes()

        // Mostrar mensaje de éxito
        this.showSuccessMessage("✅ Nota guardada exitosamente")

        // Scroll hacia las notas
        this.notesList.scrollIntoView({ behavior: "smooth" })
      } else {
        throw new Error(result.error || "Error guardando la nota")
      }
    } catch (error) {
      console.error("Error guardando nota:", error)
      alert(`Error guardando la nota: ${error.message}`)
    } finally {
      this.saveBtn.disabled = false
      this.saveBtn.textContent = "💾 Guardar Nota"
    }
  }

  cancelEditing() {
    this.editingSection.style.display = "none"
    this.resetRecordingInterface()
  }

  resetRecordingInterface() {
    // Limpiar audio chunks
    this.audioChunks = []
    this.currentTempFileName = null

    // Resetear UI
    this.audioPreview.style.display = "none"
    this.audioPlayer.src = ""
    this.recordingTimer.textContent = "00:00"
    this.updateRecordingStatus("Listo para grabar", false)

    // Resetear botones
    this.recordBtn.disabled = false
    this.recordBtn.classList.remove("recording")
    this.stopBtn.disabled = true
    this.processBtn.disabled = false
    this.processBtn.innerHTML = "<span>🧠 Procesar con IA</span>"

    // Limpiar formulario
    this.editForm.reset()
  }

  async loadNotes() {
    try {
      this.notesList.innerHTML = '<div class="loading-notes">Cargando notas...</div>'

      const response = await fetch("/api/notes")
      const notes = await response.json()

      if (notes.length === 0) {
        this.notesList.innerHTML = `
                    <div class="empty-notes">
                        <div class="empty-notes-icon">📝</div>
                        <p>No tienes notas aún</p>
                        <p>¡Graba tu primera nota de voz!</p>
                    </div>
                `
        return
      }

      this.notesList.innerHTML = notes.map((note) => this.createNoteHTML(note)).join("")
    } catch (error) {
      console.error("Error cargando notas:", error)
      this.notesList.innerHTML = '<div class="loading-notes">Error cargando notas</div>'
    }
  }

  createNoteHTML(note) {
    const createdDate = new Date(note.createdAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const tagsHTML = note.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join("")

    return `
            <div class="note-item">
                <div class="note-header">
                    <h4 class="note-title">${note.title}</h4>
                    <span class="note-date">${createdDate}</span>
                </div>
                <div class="note-transcription">${note.transcription}</div>
                ${note.tags.length > 0 ? `<div class="note-tags">${tagsHTML}</div>` : ""}
                <div class="note-audio">
                    <audio controls preload="none">
                        <source src="/audio/${note.audioFile}" type="audio/webm">
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            </div>
        `
  }

  showSuccessMessage(message) {
    // Crear elemento de mensaje
    const messageEl = document.createElement("div")
    messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
        `
    messageEl.textContent = message

    document.body.appendChild(messageEl)

    // Remover después de 3 segundos
    setTimeout(() => {
      messageEl.remove()
    }, 3000)
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new VoiceNotesApp()
})
