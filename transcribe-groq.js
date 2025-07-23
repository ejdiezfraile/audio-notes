import fs from "fs";
import path from "path";
import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";

// Obtiene la clave de la variable de entorno
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Uso: node transcribe-groq.js <ruta-audio> [idioma]
// Ejemplo: node transcribe-groq.js ./audio.mp3 es
const audioFilePath = process.argv[2];
const language = process.argv[3]; // Ejemplo: "es" o "en"

if (!GROQ_API_KEY) {
  console.error("Error: No se encontró GROQ_API_KEY en las variables de entorno");
  process.exit(1);
}

if (!audioFilePath) {
  console.error("Uso: node transcribe-groq.js <ruta-audio> [idioma]");
  process.exit(1);
}

const fileName = path.basename(audioFilePath);
const dirName = path.dirname(audioFilePath);
const txtFileName = fileName.replace(/\.[^/.]+$/, "") + ".txt";
const txtFilePath = path.join(dirName, txtFileName);

async function transcribeAudio(filePath, language) {
  const form = new FormData();
  form.append("file", await fileFromPath(filePath));
  form.append("model", "whisper-large-v3-turbo");
  if (language) {
    form.append("language", language);
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        ...form.headers
      },
      body: form
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la transcripción (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.text;
}

transcribeAudio(audioFilePath, language)
  .then(text => {
    fs.writeFileSync(txtFilePath, text, "utf8");
    console.log(`Transcripción guardada en: ${txtFilePath}`);
  })
  .catch(err => console.error("Error:", err.message));