// js/registro.js
// Lógica de registro, validación y generación de código de barras

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('error-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const codigo = document.getElementById('codigo').value.trim();
        const carrera = document.getElementById('carrera').value.trim();
        const rol = document.getElementById('rol').value;
        const contrasena = document.getElementById('contrasena').value;

        // Validación básica
        if (!nombre || !correo || !codigo || !carrera || !rol || !contrasena) {
            errorDiv.textContent = "Completa todos los campos.";
            errorDiv.style.display = "block";
            return;
        }

        // Obtener usuarios existentes
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        // Verificar si el correo ya está registrado
        if (usuarios.some(u => u.correo === correo)) {
            errorDiv.textContent = "El correo ya está registrado.";
            errorDiv.style.display = "block";
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = { nombre, correo, codigo, carrera, rol, contrasena };

        // Guardar usuario en el array y en localStorage
        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Guardar usuario activo para la sesión
        localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

        // Redirigir a ver-cuenta.html
        window.location.href = "ver-cuenta.html";
    });
});

// ...en js/profile.js o donde lo necesites
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (usuario) {
  document.getElementById('userName').textContent = usuario.nombre;
  document.getElementById('userCode').textContent = usuario.codigo_barra;
  document.getElementById('userEmail').textContent = usuario.correo;
  document.getElementById('userCareer').textContent = usuario.carrera;
}
