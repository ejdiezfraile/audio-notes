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