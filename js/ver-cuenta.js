// js/ver-cuenta.js
// Muestra los datos del usuario y genera el código de barras solo una vez

document.addEventListener('DOMContentLoaded', () => {
    const userDataDiv = document.getElementById('user-data');
    const barcodeSection = document.getElementById('barcode-section');
    const barcodeSvg = document.getElementById('barcode');

    // Intenta obtener los datos del usuario
    let usuario = null;
    try {
        usuario = JSON.parse(localStorage.getItem('usuario'));
    } catch (e) {
        usuario = null;
    }

    if (!usuario) {
        userDataDiv.innerHTML = '<span style="color:#e74c3c;">No hay datos de usuario. Regístrate primero.</span>';
        barcodeSection.style.display = 'none';
        return;
    }

    // Muestra los datos del usuario
    userDataDiv.innerHTML = `
        <p><strong>Nombre:</strong> ${usuario.nombre || ''}</p>
        <p><strong>Correo:</strong> ${usuario.correo || ''}</p>
        <p><strong>Código de Alumno:</strong> ${usuario.codigo || ''}</p>
        <p><strong>Carrera:</strong> ${usuario.carrera || ''}</p>
        <p><strong>Rol:</strong> ${usuario.rol || ''}</p>
    `;

    // Muestra el código de barras si existe
    if (usuario.codigo) {
        barcodeSection.style.display = 'block';
        JsBarcode(barcodeSvg, usuario.codigo, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 60,
            displayValue: true
        });
    } else {
        barcodeSection.style.display = 'none';
    }
});
