# SafeTECS

SafeTECS es una aplicación web moderna y responsiva para la **gestión de accesos, emergencias y perfiles** en campus, instituciones educativas o empresas. Permite a los usuarios gestionar su información personal, generar códigos de acceso, consultar su historial de entradas y salidas, y activar alertas de emergencia de forma rápida y segura.

---

## 🚀 Características principales

- **Perfil de usuario:** Visualiza y edita tu información personal y foto de perfil.
- **Código de acceso:** Genera y muestra tu código de barras personal para el ingreso al campus.
- **Historial de accesos:** Consulta un historial detallado de tus entradas y salidas, con filtros por fecha y opciones de exportación.
- **Emergencias:** Acceso rápido a botón de pánico, contactos de emergencia y estado de seguridad.
- **Diseño profesional:** Interfaz moderna, responsiva y atractiva, optimizada para dispositivos móviles y escritorio.
- **Seguridad:** Manejo seguro de datos y acciones críticas.
- **Fácil integración:** Pensado para integrarse con sistemas backend y hardware de control de acceso.

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** HTML5, CSS3 (Glassmorphism, animaciones modernas), JavaScript
- **Frameworks/Librerías:**  
  - [Poppins](https://fonts.google.com/specimen/Poppins) (tipografía)
  - [Material Icons](https://fonts.google.com/icons) (iconos)
  - [JsBarcode](https://github.com/lindell/JsBarcode) (códigos de barras)
- **Backend:** Node.js (opcional, según implementación)
- **Control de versiones:** Git y GitHub

---

## 📁 Estructura del proyecto

```
SafeTECS/
│
├── assets/              # Imágenes y recursos estáticos
├── css/                 # Hojas de estilo (profile.css, emergency.css, historial.css, etc.)
├── js/                  # Scripts JavaScript
├── backend/             # (Opcional) Código backend (Node.js, API, etc.)
├── perfil.html          # Vista de perfil de usuario
├── emergencia.html      # Vista de emergencias
├── historial.html       # Vista de historial de accesos
├── dashboard.html       # Panel principal
├── .gitignore           # Archivos y carpetas ignorados por Git
└── README.md            # Este archivo
```

---

## ⚡ Instalación y uso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/SafeTECS.git
   ```
2. **Abre la carpeta en Visual Studio Code.**
3. **Instala dependencias backend (si aplica):**
   ```bash
   cd backend
   npm install
   ```
4. **Ejecuta el backend (opcional):**
   ```bash
   node server.js
   ```
5. **Abre `perfil.html`, `emergencia.html` o `historial.html` en tu navegador.**

---

## 🧩 Personalización

- Modifica los archivos en `/css` y `/js` para adaptar la interfaz y funcionalidades a tus necesidades.
- Integra tu propio backend en la carpeta `/backend` para conectar con bases de datos o hardware de control de acceso.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!  
Por favor, abre un **issue** para reportar errores o sugerir mejoras, o envía un **pull request** para colaborar directamente.

---

## 📬 Contacto

¿Tienes dudas, sugerencias o quieres colaborar?  
Puedes contactarme por GitHub o abrir un issue en este repositorio.

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.  
Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**SafeTECS** – Seguridad y control de accesos para tu campus, fácil y moderno.
