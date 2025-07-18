### **Documento Técnico: Prototipo de Notas de Voz con NodeJS y Groq API**

**Objetivo:** Construir una aplicación web minimalista para grabar notas de voz, que son procesadas por Groq para transcripción y análisis, y guardadas en un único fichero JSON local.

#### **1. Pila Tecnológica (Tech Stack)**

*   **Backend:** **Node.js** con el framework **Express.js**.
*   **Frontend:** **HTML, CSS y JavaScript (sin frameworks)** para máxima simplicidad.
*   **API de IA (Todo en uno):** **Groq Cloud**.
    *   **Para Transcripción:** Usaremos el endpoint de `audio/transcriptions` de Groq, que utiliza el modelo Whisper.
    *   **Para Título y Tags:** Usaremos el endpoint de `chat/completions` con un modelo rápido como `llama3-8b-8192`.
*   **Almacenamiento:**
    *   **Metadatos:** Un único fichero **`notes.json`** que contendrá un array con todas las notas (título, transcripción, tags, etc.).
    *   **Audio:** Una carpeta **`/audio`** donde se guardarán los ficheros de voz originales, referenciados desde el fichero JSON.

#### **2. Flujo de Datos Simplificado con Groq**

Este flujo es ahora mucho más directo, ya que todo el trabajo de IA lo hace el backend.

1.  **🎤 Grabar (Navegador):** El usuario graba su nota de voz en la página web y pulsa "Procesar".
2.  **📤 Enviar Audio (Navegador → Servidor):** El navegador envía **únicamente el fichero de audio** a un endpoint en tu servidor Node.js (ej: `POST /api/process-audio`).
3.  **🧠 Procesamiento IA (Servidor → Groq):** Tu servidor Node.js recibe el audio y realiza dos llamadas seguidas a la API de Groq:
    *   **Llamada 1 (Transcripción):** Envía el fichero de audio al endpoint de transcripción de Groq. Groq devuelve el texto transcrito.
    *   **Llamada 2 (Análisis):** Envía el texto transcrito al endpoint de chat de Groq con un *prompt* para que genere un título y unas etiquetas. Groq devuelve un objeto JSON con el título y los tags.
4.  **🧐 Revisar (Servidor → Navegador):** Tu servidor empaqueta la transcripción, el título sugerido y los tags sugeridos, y se lo envía todo al navegador del usuario.
5.  **📝 Editar y Confirmar (Navegador):** El usuario ve toda la información en un formulario. Puede corregir la transcripción, cambiar el título o ajustar las etiquetas. Cuando está listo, pulsa **"Confirmar y Guardar"**.
6.  **💾 Guardado Final (Navegador → Servidor):**
    *   El navegador envía todos los datos de texto **finales y corregidos** a un nuevo endpoint (ej: `POST /api/save-note`). **Importante:** también debe enviar una referencia al audio que el servidor procesó, para que sepa qué fichero de audio guardar.
    *   Tu servidor recibe los datos finales, guarda el fichero de audio original en la carpeta `/audio` y añade un nuevo objeto al array del fichero `notes.json`.

#### **3. Guía de Implementación**

##### **Estructura del Proyecto**

```
/tu-proyecto/
  ├── public/          <-- Aquí van tu HTML, CSS y JS
  │   ├── index.html
  │   └── app.js
  ├── audio/           <-- Aquí se guardan los .ogg o .mp3
  ├── notes.json       <-- Tu "base de datos"
  └── server.js        <-- Tu lógica de Node.js
```

##### **Backend (`server.js`)**

1.  **Instala las dependencias:**
    `npm install express multer groq-sdk uuid`

2.  **Código del servidor:**
    ```javascript
    const express = require('express');
    const multer = require('multer');
    const Groq = require('groq-sdk');
    const fs = require('fs').promises;
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');

    const app = express();
    app.use(express.json());
    app.use(express.static('public'));

    // Configura Groq con tu API Key
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Configura Multer para guardar el audio temporalmente
    const upload = multer({ dest: 'temp_audio/' });

    const dbPath = path.join(__dirname, 'notes.json');
    const audioPath = path.join(__dirname, 'audio');

    // Endpoint para procesar el audio y devolver sugerencias
    app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
        try {
            // 1. Transcripción con Groq
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(req.file.path),
                model: 'whisper-large-v3',
            });
            const transcriptText = transcription.text;

            // 2. Análisis (Título y Tags) con Groq
            const prompt = `A partir del siguiente texto, genera un título y 3 etiquetas. Devuelve SÓLO un objeto JSON con las claves "title" y "tags". Texto: "${transcriptText}"`;
            
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama3-8b-8192',
            });
            
            const analysisJSON = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

            // 3. Devolver todo para revisión del usuario
            res.json({
                transcript: transcriptText,
                suggestedTitle: analysisJSON.title || 'Título no generado',
                suggestedTags: analysisJSON.tags || [],
                tempAudioPath: req.file.path // Importante para saber qué audio guardar después
            });
        } catch (error) {
            console.error('Error procesando el audio:', error);
            res.status(500).send('Error en el servidor');
        }
    });

    // Endpoint para guardar la nota final
    app.post('/api/save-note', async (req, res) => {
        const { title, transcript, tags, tempAudioPath } = req.body;
        const noteId = uuidv4();
        const finalAudioPath = path.join(audioPath, `${noteId}.ogg`);

        try {
            // Mover el audio desde la carpeta temporal a la definitiva
            await fs.rename(tempAudioPath, finalAudioPath);

            // Leer, actualizar y escribir en el fichero JSON
            let notes = [];
            try {
                const data = await fs.readFile(dbPath, 'utf8');
                notes = JSON.parse(data);
            } catch (e) { /* El fichero no existe, se creará uno nuevo */ }

            const newNote = {
                id: noteId,
                title,
                transcript,
                tags,
                audioFile: `${noteId}.ogg`,
                createdAt: new Date().toISOString()
            };
            notes.push(newNote);

            await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
            
            res.status(201).json(newNote);
        } catch (error) {
            console.error('Error guardando la nota:', error);
            res.status(500).send('Error al guardar');
        }
    });

    // (Aquí irían los endpoints GET /api/notes y DELETE /api/notes/:id)

    app.listen(3000, () => {
        console.log('Servidor en http://localhost:3000');
        // Asegurarse de que los directorios existen
        fs.mkdir(audioPath, { recursive: true });
        fs.mkdir('temp_audio', { recursive: true });
    });
    ```

##### **Frontend (`app.js`)**

Tu JavaScript será ahora más sencillo.

1.  **Graba y envía el audio:**
    ```javascript
    // Al detener la grabación...
    const audioBlob = new Blob(audioChunks, { type: 'audio/ogg' });
    const formData = new FormData();
    formData.append('audio', audioBlob);

    // Enviar a procesar
    fetch('/api/process-audio', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            // Rellenar el formulario de revisión con data.transcript, data.suggestedTitle, etc.
            // Guardar data.tempAudioPath en una variable global o un campo oculto del formulario.
            document.getElementById('editArea').style.display = 'block';
        });
    ```

2.  **Confirma y guarda:**
    ```javascript
    // Al pulsar el botón de guardar final...
    const finalData = {
        title: document.getElementById('titleInput').value,
        transcript: document.getElementById('transcriptInput').value,
        tags: /* Lógica para obtener las tags del input */,
        tempAudioPath: /* La ruta temporal que guardaste antes */
    };

    fetch('/api/save-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
    })
    .then(res => res.json())
    .then(savedNote => {
        console.log('¡Nota guardada con éxito!', savedNote);
        // Limpiar formulario y actualizar la lista de notas en pantalla
    });
    ```

#### **4. Próximos Pasos**

1.  **Obtén tu API Key de Groq:** Ve a la web de Groq, regístrate y consigue tu clave de API gratuita.
2.  **Monta el `server.js`:** Copia la estructura anterior y pon tu API key (idealmente como una variable de entorno: `process.env.GROQ_API_KEY`).
3.  **Crea el `index.html`:** Diseña un formulario simple para la grabación y la revisión.
4.  **Desarrolla el `app.js`:** Implementa la lógica de grabación y las dos llamadas `fetch` que hemos descrito.
5.  **Añade Funcionalidades:** Crea los endpoints `GET` para leer `notes.json` y mostrar todas las notas, y `DELETE` para quitarlas del array y volver a guardar el fichero.
