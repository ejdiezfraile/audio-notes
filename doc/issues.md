
# Inicializar proyecto con Astro y TypeScript

**Descripción**  
Crear la estructura base del proyecto utilizando Astro con soporte para TypeScript para establecer el entorno de desarrollo inicial.

**Checklist de criterios de aceptación**

* [ ] Proyecto creado con `npm create astro@latest` o similar
* [ ] TypeScript habilitado y configurado
* [ ] Repositorio con estructura base funcional

> Etiquetas: setup, frontend

---

# Configurar Tailwind CSS en el proyecto

**Descripción**  
Instalar y configurar Tailwind CSS para el diseño y maquetación de componentes en la aplicación.

**Checklist de criterios de aceptación**

* [ ] Tailwind CSS instalado y funcionando
* [ ] Archivo `tailwind.config.ts` personalizado
* [ ] Estilos aplicables desde los componentes

> Etiquetas: setup, estilos, frontend

---

# Integrar biblioteca de componentes shadcn/ui

**Descripción**  
Añadir y configurar la librería Shadcn/ui para utilizar componentes preconstruidos accesibles en el frontend.

**Checklist de criterios de aceptación**

* [ ] Instalación completa de Shadcn/ui
* [ ] Al menos un componente de prueba visualizado correctamente
* [ ] Integración con Tailwind confirmada

> Etiquetas: setup, frontend, diseño

---

# Configurar entorno local con SQLite (Turso)

**Descripción**  
Preparar entorno de base de datos local utilizando Turso con SQLite. Asegurar que se puede establecer conexión desde el backend Astro.

**Checklist de criterios de aceptación**

* [ ] Cuenta y proyecto en Turso creados
* [ ] Base de datos accesible desde el entorno local
* [ ] Conexión a Turso desde Astro API establecida

> Etiquetas: backend, base de datos, setup

---

# Añadir variables de entorno para claves de API

**Descripción**  
Crear sistema para almacenar y leer variables de entorno (Groq, Turso, Better-Auth) de forma segura.

**Checklist de criterios de aceptación**

* [ ] Archivo `.env` configurado con claves simuladas
* [ ] Variables accesibles desde código del backend
* [ ] Documentación mínima para nuevos desarrolladores

> Etiquetas: seguridad, setup, entorno

---

# Integrar Better-Auth para autenticación

**Descripción**  
Implementar autenticación de usuario utilizando Better-Auth, habilitando login por email y GitHub.

**Checklist de criterios de aceptación**

* [ ] Better-Auth instalado e integrado
* [ ] Autenticación por email funcionando
* [ ] Login por GitHub funcionando
* [ ] Sesión mantenida correctamente

> Etiquetas: backend, autenticación, seguridad

---

# Proteger rutas privadas tras login

**Descripción**  
Restringir el acceso a las rutas de grabación, dashboard y API solo a usuarios autenticados.

**Checklist de criterios de aceptación**

* [ ] Middleware o lógica de protección implementada
* [ ] Usuarios no autenticados redirigidos al login
* [ ] Verificación en el backend de cada endpoint protegido

> Etiquetas: autenticación, seguridad, backend

---

# Crear página de grabación de notas

**Descripción**  
Implementar la UI para grabar notas de voz, accesible tras login. Incluir visualizador de audio, botones y temporizador.

**Checklist de criterios de aceptación**

* [ ] Botón de grabar, pausar y detener funcionales
* [ ] Visualizador de onda en tiempo real implementado
* [ ] Temporizador de cuenta atrás funcional (2 minutos máximo)

> Etiquetas: frontend, grabación, UX

---

# Almacenar audio temporalmente en memoria

**Descripción**  
Asegurar que el audio grabado se almacena solo en memoria del cliente y no se persiste en el servidor.

**Checklist de criterios de aceptación**

* [ ] Audio accesible para reproducción y descarga
* [ ] No se guarda en disco ni se sube automáticamente
* [ ] Eliminación del audio tras transcripción confirmada

> Etiquetas: privacidad, grabación, frontend

---

# Crear endpoint POST /api/transcribe

**Descripción**  
Crear el endpoint para recibir audio desde el cliente y procesarlo mediante la API de Groq para obtener texto transcrito.

**Checklist de criterios de aceptación**

* [ ] Recibe `FormData` con archivo de audio
* [ ] Llama a Groq correctamente y obtiene transcripción
* [ ] Devuelve JSON con transcripción

> Etiquetas: backend, API, transcripción

---

# Mostrar estado de carga durante la transcripción

**Descripción**  
Añadir feedback visual en la interfaz mientras se espera la transcripción de la nota.

**Checklist de criterios de aceptación**

* [ ] Componente de "cargando..." visible al usuario
* [ ] Estado desaparece al terminar la transcripción
* [ ] Manejados los errores en UI

> Etiquetas: frontend, UX, transcripción

---

# Permitir edición del texto transcrito en modal

**Descripción**  
Mostrar la transcripción en un modal editable para que el usuario corrija errores antes de guardar.

**Checklist de criterios de aceptación**

* [ ] Modal emergente con campo de texto editable
* [ ] Botón de guardar habilitado tras edición
* [ ] Cambios reflejados antes de enviar a backend

> Etiquetas: frontend, edición, UX

---

# Crear endpoint POST /api/notes

**Descripción**  
Crear endpoint que recibe texto editado, genera título y tags con IA, y guarda la nota completa en base de datos.

**Checklist de criterios de aceptación**

* [ ] Recibe texto y llama a Groq para título y tags
* [ ] Inserta entrada en la tabla `notes`
* [ ] Devuelve objeto JSON con los datos de la nota

> Etiquetas: backend, API, base de datos

---

# Crear tabla `notes` e integrarla con Turso

**Descripción**  
Diseñar e implementar el esquema de la tabla `notes` en SQLite (Turso) y permitir su uso desde Astro.

**Checklist de criterios de aceptación**

* [ ] Tabla con campos: id, user_id, title, content, tags, created_at
* [ ] Migración creada y aplicada correctamente
* [ ] Consultas de prueba funcionando

> Etiquetas: base de datos, backend

---

# Crear dashboard de usuario con listado de notas

**Descripción**  
Página que muestra las notas del usuario autenticado, con filtros y buscador.

**Checklist de criterios de aceptación**

* [ ] Notas ordenadas por fecha descendente
* [ ] Buscador funcional por título
* [ ] Filtros por fecha y tag implementados

> Etiquetas: frontend, dashboard, búsqueda

---

# Crear endpoint GET /api/notes

**Descripción**  
Endpoint autenticado que permite listar notas del usuario con soporte para búsqueda y filtrado.

**Checklist de criterios de aceptación**

* [ ] Endpoint protegido y accesible solo por usuarios autenticados
* [ ] Soporta parámetros `?q=`, `?tag=`
* [ ] Devuelve notas correctamente filtradas

> Etiquetas: backend, API, seguridad

---

# Validar que el flujo completo funciona correctamente

**Descripción**  
Realizar pruebas de extremo a extremo para verificar que el flujo completo (grabación, transcripción, edición y guardado) funciona sin errores.

**Checklist de criterios de aceptación**

* [ ] Flujo ejecutado sin fallos por usuarios reales
* [ ] Indicadores visuales claros en cada paso
* [ ] Mensajes de error visibles si algo falla

> Etiquetas: testing, QA, UX

---

# Preparar entorno de producción y deploy

**Descripción**  
Configurar el entorno de producción para el despliegue de la aplicación, asegurando persistencia y seguridad.

**Checklist de criterios de aceptación**

* [ ] Build funcional para producción
* [ ] Conexión a Turso persistente en entorno productivo
* [ ] Variables de entorno gestionadas con seguridad

> Etiquetas: deployment, entorno, producción

---

# Realizar pruebas end-to-end en entorno de producción

**Descripción**  
Validar en producción que la aplicación completa funciona como se espera, incluyendo autenticación, flujo de notas y seguridad.

**Checklist de criterios de aceptación**

* [ ] Registro/login funcional
* [ ] Flujo de notas completo comprobado
* [ ] API protegida y sin fugas de datos

> Etiquetas: testing, producción, QA

---
