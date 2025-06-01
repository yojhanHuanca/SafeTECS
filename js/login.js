document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  const response = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });

  const data = await response.json();
  if (data.usuario) {
    // Guarda todos los datos del usuario en localStorage
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    alert('¡Bienvenido, ' + data.usuario.nombre + '!');
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('login-error').innerText = data.error || 'Error en el login';
    document.getElementById('login-error').style.display = 'block';
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('login-error');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        const correo = form.correo.value.trim();
        const contrasena = form.contrasena.value.trim();

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        let usuario = usuarios.find(u => u.correo === correo && u.contrasena === contrasena);

        if (usuario) {
            localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
            window.location.href = "perfil.html"; // Cambia a la página que desees después de login
        } else {
            errorDiv.textContent = "Correo o contraseña incorrectos";
            errorDiv.style.display = "block";
        }
    });

    // Mostrar/ocultar contraseña
    const togglePwd = document.querySelector('.toggle-pwd');
    const pwdInput = document.getElementById('contrasena');
    if (togglePwd && pwdInput) {
        togglePwd.addEventListener('click', () => {
            if (pwdInput.type === "password") {
                pwdInput.type = "text";
                togglePwd.querySelector('span').textContent = "visibility";
            } else {
                pwdInput.type = "password";
                togglePwd.querySelector('span').textContent = "visibility_off";
            }
        });
    }
});