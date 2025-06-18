// js/registro.js
import { UIUtils } from '../utils/UIUtils.js'; // Path might need adjustment

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('error-message'); // Assumes this ID exists in registro.html
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form || !errorDiv || !submitBtn) {
        console.error("Registro form, error div, or submit button not found.");
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        UIUtils.hideMessage(errorDiv); // Use UIUtils to hide message

        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const codigo = document.getElementById('codigo').value.trim(); // This will be 'codigo_barra' for backend
        const carrera = document.getElementById('carrera').value.trim();
        const rol = document.getElementById('rol').value;
        const contrasena = document.getElementById('contrasena').value; // Plain password

        // Basic client-side validation
        if (!nombre || !correo || !codigo || !carrera || !rol || !contrasena) {
            errorDiv.textContent = "Por favor, completa todos los campos.";
            errorDiv.style.display = "block";
            return;
        }
        if (contrasena.length < 8) {
            errorDiv.textContent = "La contraseña debe tener al menos 8 caracteres.";
            errorDiv.style.display = "block";
            return;
        }
        // Add more specific client-side validation if needed (e.g., email format)

        UIUtils.setButtonLoading(submitBtn, true, "Registrando...");

        try {
            // ApiService could be used here for further abstraction
            const response = await fetch('http://localhost:3001/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    correo,
                    codigo_barra: codigo, // Map 'codigo' from form to 'codigo_barra' for backend
                    carrera,
                    rol,
                    contrasena // Send plain password to backend for hashing
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error ${response.status}`);
            }

            if (data.success) {
                // Store non-sensitive data for ver-cuenta.html or immediate use.
                // CRUCIALLY: DO NOT store 'contrasena' (password)
                const newlyRegisteredUser = {
                    nombre,
                    correo,
                    codigo, // Keep 'codigo' as the key for consistency with other client-side usage
                    carrera,
                    rol
                };
                // Storing as 'currentUser' for potential immediate use by other parts,
                // or 'newlyRegisteredUser' if ver-cuenta.html specifically looks for that.
                // Let's use 'currentUser' to align with login.
                localStorage.setItem('currentUser', JSON.stringify(newlyRegisteredUser));

                // Redirect to account verification or a page that shows the barcode
                window.location.href = "ver-cuenta.html";
            } else {
                throw new Error(data.error || "Error en el registro. Intente de nuevo.");
            }

        } catch (error) {
            UIUtils.displayMessage(errorDiv, error.message || 'Ocurrió un error durante el registro.', 'error');
        } finally {
            UIUtils.setButtonLoading(submitBtn, false);
        }
    });
});

// The setLoading function is now replaced by UIUtils.setButtonLoading.
// Ensure that the misplaced profile update code that was here is removed.
// The following lines were the misplaced code and are now deleted:
// const usuario = JSON.parse(localStorage.getItem('usuario'));
// if (usuario) {
//   document.getElementById('userName').textContent = usuario.nombre;
//   document.getElementById('userCode').textContent = usuario.codigo_barra;
//   document.getElementById('userEmail').textContent = usuario.correo;
//   document.getElementById('userCareer').textContent = usuario.carrera;
// }
