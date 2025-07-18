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
