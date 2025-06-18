// js/profile.js
import { ApiService } from '../services/ApiService.js'; // Prepare for future API calls
import { UIUtils } from '../utils/UIUtils.js';

class ProfileManager {
    constructor() {
        this.elements = {
            userAvatar: document.getElementById('userAvatar'),
            editAvatarBtn: document.getElementById('editAvatarBtn'), // Changed from querySelector
            avatarInput: document.getElementById('avatarInput'),
            userNameDisplay: document.getElementById('userName'),
            userCodeDisplay: document.getElementById('userCode'),
            userEmailDisplay: document.getElementById('userEmail'),
            userCareerDisplay: document.getElementById('userCareer'),
            userRoleDisplay: document.getElementById('userRole'),
            barcodeSvg: document.getElementById('barcode'),
            barcodeText: document.getElementById('barcodeText'),
            pageErrorMessage: document.getElementById('page-error-message') // For general errors
            // Add downloadBarcodeBtn, shareBarcodeBtn if they need event listeners here
        };
        this.currentUser = null;
        this.init();
    }

    init() {
        if (!this.elements.userNameDisplay) { // Basic check for being on the profile page
            // console.warn("Profile elements not found. ProfileManager will not initialize.");
            return;
        }
        this.loadUserProfileData();
        this.setupEventListeners();
    }

    async loadUserProfileData() {
        // For now, primarily uses localStorage. Could be augmented with API call.
        // UIUtils.setLoading(someIndicator, true); // If there's a general page loader
        try {
            const userData = localStorage.getItem('currentUser');
            if (!userData) {
                UIUtils.showToast('No se encontraron datos de usuario. Por favor, inicie sesión.', 'error');
                // Consider redirecting to login if no user data is critical
                // window.location.href = 'index.html';
                throw new Error("Usuario no encontrado en localStorage.");
            }
            this.currentUser = JSON.parse(userData);

            if (this.elements.userNameDisplay) this.elements.userNameDisplay.textContent = this.currentUser.nombre || '';
            if (this.elements.userEmailDisplay) this.elements.userEmailDisplay.textContent = this.currentUser.correo || '';
            if (this.elements.userCodeDisplay) this.elements.userCodeDisplay.textContent = this.currentUser.codigo || ''; // Assuming 'codigo' is the user code/ID
            if (this.elements.userCareerDisplay) this.elements.userCareerDisplay.textContent = this.currentUser.carrera || '';
            if (this.elements.userRoleDisplay) this.elements.userRoleDisplay.textContent = this.currentUser.rol || '';
            
            if (this.elements.barcodeText) this.elements.barcodeText.textContent = this.currentUser.codigo || '';
            this.generateBarcode();

            // Simulate loading avatar if an avatar URL were stored in currentUser
            if (this.elements.userAvatar && this.currentUser.avatarUrl) {
                this.elements.userAvatar.src = this.currentUser.avatarUrl;
            } else if (this.elements.userAvatar) {
                this.elements.userAvatar.src = 'assets/img/user-default.png'; // Default
            }

        } catch (error) {
            console.error("Error loading profile data:", error);
            if(this.elements.pageErrorMessage) UIUtils.displayMessage(this.elements.pageErrorMessage, error.message || 'Error al cargar el perfil.', 'error');
            else UIUtils.showToast(error.message || 'Error al cargar el perfil.', 'error');
        } finally {
            // UIUtils.setLoading(someIndicator, false);
        }
    }

    generateBarcode() {
        if (this.currentUser && this.currentUser.codigo && this.elements.barcodeSvg && window.JsBarcode) {
            try {
                JsBarcode(this.elements.barcodeSvg, this.currentUser.codigo, {
                    format: "CODE128",
                    lineColor: "#222", // Consider using CSS variable: var(--text-color-dark)
                    width: 2,
                    height: 60,
                    displayValue: false // Text is displayed separately via barcodeText element
                });
            } catch (e) {
                console.error("Error generating barcode:", e);
                if(this.elements.barcodeText) this.elements.barcodeText.textContent = "Error al generar código";
                UIUtils.showToast("No se pudo generar el código de barras.", "error");
            }
        }
    }

    setupEventListeners() {
        if (this.elements.editAvatarBtn) {
            this.elements.editAvatarBtn.addEventListener('click', () => {
                if (this.elements.avatarInput) this.elements.avatarInput.click();
            });
        }

        if (this.elements.avatarInput) {
            this.elements.avatarInput.addEventListener('change', this.handleAvatarChange.bind(this));
        }
        
        // Add listeners for download/share barcode if those buttons are interactive
        // const downloadBtn = document.getElementById('downloadBarcode');
        // if(downloadBtn) downloadBtn.addEventListener('click', this.handleDownloadBarcode.bind(this));
    }

    handleAvatarChange(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (this.elements.userAvatar) this.elements.userAvatar.src = event.target.result;
                UIUtils.showToast('Foto de perfil actualizada (simulado).', 'success');
                // In a real app, call uploadAvatar here
                // this.uploadAvatar(file);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            UIUtils.showToast('Por favor, selecciona un archivo de imagen.', 'warning');
        }
    }

    async uploadAvatar(file) {
        // UIUtils.setButtonLoading(this.elements.editAvatarBtn, true); // Or a dedicated save button
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            // const response = await ApiService.post('/api/profile/avatar', formData, {
            //     headers: { 'Content-Type': 'multipart/form-data' } // ApiService needs to handle this
            // });
            // if (response.avatarUrl) {
            //     this.currentUser.avatarUrl = response.avatarUrl;
            //     localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            //     if(this.elements.userAvatar) this.elements.userAvatar.src = response.avatarUrl;
            //     UIUtils.showToast('Avatar subido con éxito!', 'success');
            // }
            console.log('Simulating avatar upload...', formData.get('avatar').name);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            UIUtils.showToast('Avatar subido (simulado).', 'success');

        } catch (error) {
            console.error("Error uploading avatar:", error);
            UIUtils.showToast(error.message || 'Error al subir el avatar.', 'error');
        } finally {
            // UIUtils.setButtonLoading(this.elements.editAvatarBtn, false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the profile page by looking for a unique element
    if (document.getElementById('userAvatar')) {
        new ProfileManager();
    }
});