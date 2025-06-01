class ProfileManager {
    constructor() {
        this.userAvatar = document.getElementById('userAvatar');
        this.editAvatarBtn = document.querySelector('.edit-avatar-btn');
        this.userNameElement = document.getElementById('userName');
        this.userCodeElement = document.getElementById('userCode');
        this.userEmailElement = document.getElementById('userEmail');
        this.userCareerElement = document.getElementById('userCareer');
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
    }

    loadUserData() {
        // Simular carga de datos del usuario
        setTimeout(() => {
            this.userNameElement.textContent = 'María González';
            this.userCodeElement.textContent = 'ALUMNO-20230045';
            this.userEmailElement.textContent = 'maria.gonzalez@tecs.edu';
            this.userCareerElement.textContent = 'Ingeniería en Sistemas';
            
            // Simular carga de imagen (en producción sería desde una API)
            this.userAvatar.src = 'assets/img/user-default.png';
        }, 500);
    }

    setupEventListeners() {
        this.editAvatarBtn.addEventListener('click', () => {
            this.changeAvatar();
        });
    }

    changeAvatar() {
        // Crear input de tipo file dinámicamente
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    this.userAvatar.src = event.target.result;
                    this.showToast('Foto actualizada', 'success');
                    
                    // Aquí normalmente subirías la imagen al servidor
                    // this.uploadAvatar(file);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        fileInput.click();
    }

    uploadAvatar(file) {
        // Simular subida de imagen
        const formData = new FormData();
        formData.append('avatar', file);
        
        // En producción sería una llamada fetch a tu API
        console.log('Subiendo imagen...', formData);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('userName').textContent = usuario.nombre || '';
    document.getElementById('userEmail').textContent = usuario.correo || '';
    document.getElementById('userCode').textContent = usuario.codigo || '';
    document.getElementById('userCareer').textContent = usuario.carrera || '';
    document.getElementById('userRole').textContent = usuario.rol || '';

    const barcodeText = document.getElementById('barcodeText');
    barcodeText.textContent = usuario.codigo || '';

    // Generar código de barras real
    if (usuario.codigo && window.JsBarcode) {
        JsBarcode("#barcode", usuario.codigo, {
            format: "CODE128",
            lineColor: "#222",
            width: 2,
            height: 60,
            displayValue: false // El texto lo pones tú abajo
        });
    }

    document.getElementById('editAvatarBtn').addEventListener('click', function() {
        document.getElementById('avatarInput').click();
    });

    document.getElementById('avatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById('userAvatar').src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});