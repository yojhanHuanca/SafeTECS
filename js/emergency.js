// js/emergency.js
import { ApiService } from '../services/ApiService.js';
import { UIUtils } from '../utils/UIUtils.js';

class EmergencySystem {
    constructor() {
        this.elements = {
            panicButton: document.getElementById('panicButton'),
            emergencyStatus: document.getElementById('emergencyStatus'),
            emergencyInfo: document.getElementById('emergencyInfo'),
            confirmationModal: document.getElementById('confirmationModal'),
            cancelEmergencyBtn: document.getElementById('cancelEmergency'),
            confirmEmergencyBtn: document.getElementById('confirmEmergency'),
            userLocationElement: document.getElementById('userLocation'),
            responseTimeElement: document.getElementById('responseTime'),
            staffAlertedElement: document.getElementById('staffAlerted'),
            pageErrorMessage: document.getElementById('page-error-message') // For general errors
        };
        
        this.pressTimer = null;
        this.emergencyActive = false;
        this.userLocation = null;
        
        this.init();
    }

    init() {
        if (!this.elements.panicButton) { // Basic check if on the right page
            // console.warn("Emergency elements not found. EmergencySystem will not initialize.");
            return;
        }
        this.setupEventListeners();
        this.checkGeolocationPermission();
    }

    setupEventListeners() {
        this.elements.panicButton.addEventListener('touchstart', this.startPressTimer.bind(this), { passive: false });
        this.elements.panicButton.addEventListener('touchend', this.cancelPressTimer.bind(this));
        this.elements.panicButton.addEventListener('mousedown', this.startPressTimer.bind(this));
        this.elements.panicButton.addEventListener('mouseup', this.cancelPressTimer.bind(this));
        this.elements.panicButton.addEventListener('mouseleave', this.cancelPressTimer.bind(this));
        
        this.elements.cancelEmergencyBtn.addEventListener('click', this.cancelEmergency.bind(this));
        this.elements.confirmEmergencyBtn.addEventListener('click', this.activateEmergency.bind(this));
    }

    startPressTimer(e) {
        e.preventDefault(); // Prevent text selection or other unwanted default actions
        UIUtils.setButtonLoading(this.elements.panicButton, true, "Mantén presionado..."); // Visual feedback on press
        this.pressTimer = setTimeout(() => {
            this.showConfirmationModal();
            // No need to stop loading here, modal confirmation will handle it or cancelPressTimer
        }, 3000);
    }

    cancelPressTimer() {
        UIUtils.setButtonLoading(this.elements.panicButton, false); // Reset button state
        if (this.pressTimer) {
            clearTimeout(this.pressTimer);
            this.pressTimer = null;
        }
    }

    showConfirmationModal() {
        if (this.elements.confirmationModal) this.elements.confirmationModal.classList.remove('hidden');
    }

    hideConfirmationModal() {
        if (this.elements.confirmationModal) this.elements.confirmationModal.classList.add('hidden');
    }

    cancelEmergency() {
        this.hideConfirmationModal();
        UIUtils.showToast('Emergencia cancelada.', 'warning');
        UIUtils.setButtonLoading(this.elements.panicButton, false); // Ensure panic button is reset
    }

    async activateEmergency() {
        this.hideConfirmationModal();
        UIUtils.setButtonLoading(this.elements.confirmEmergencyBtn, true, "Activando..."); // Loading on confirm button

        try {
            await this.getCurrentLocation();
            
            this.elements.emergencyStatus.classList.add('alert');
            this.elements.emergencyStatus.innerHTML = `
                <div class="status-icon"><span class="material-icons">warning</span></div>
                <p>EMERGENCIA ACTIVADA</p>`;
            this.elements.emergencyInfo.classList.remove('hidden');
            
            // Simulate updating UI based on alert
            this.elements.staffAlertedElement.textContent = "Personal de seguridad notificado...";
            this.elements.responseTimeElement.textContent = "Estimado: 2-5 minutos...";
            
            await this.sendEmergencyAlert({ location: this.userLocation, type: 'general' });
            
            this.elements.staffAlertedElement.textContent = "Personal de seguridad NOTIFICADO.";
            this.elements.responseTimeElement.textContent = "Respuesta estimada: 2-5 MINUTOS.";
            UIUtils.showToast('¡Alerta de emergencia enviada!', 'success');
            this.emergencyActive = true; // Set flag
            // Potentially disable panic button after successful activation or change its state
            // UIUtils.setButtonLoading(this.elements.panicButton, false); // Or change its text/function
            this.elements.panicButton.innerHTML = '<span class="material-icons">report</span> Emergencia Activa';


        } catch (error) {
            console.error('Error en activación de emergencia:', error);
            UIUtils.showToast(error.message || 'Error al activar emergencia.', 'error');
            if (this.elements.pageErrorMessage) UIUtils.displayMessage(this.elements.pageErrorMessage, error.message || 'No se pudo activar la emergencia.', 'error');
        } finally {
            UIUtils.setButtonLoading(this.elements.confirmEmergencyBtn, false);
            // Do not reset panic button loading here if it's meant to stay in "active" state
            if (!this.emergencyActive) {
                 UIUtils.setButtonLoading(this.elements.panicButton, false);
            }
        }
    }

    async getCurrentLocation() {
        this.elements.userLocationElement.textContent = "Obteniendo ubicación...";
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.elements.userLocationElement.textContent = "Geolocalización no disponible.";
                reject(new Error('Geolocalización no soportada por este navegador.'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.userLocation = { latitude, longitude };
                    this.elements.userLocationElement.textContent = `Detectada: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                    // In a real app, use a reverse geocoding service here
                    resolve();
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error.message);
                    this.elements.userLocationElement.textContent = "No se pudo obtener ubicación.";
                    reject(new Error(`Error de Geolocalización: ${error.message}`));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Increased timeout
            );
        });
    }

    async sendEmergencyAlert(alertData) {
        // UIUtils.setButtonLoading(this.elements.panicButton, true, "Enviando Alerta..."); // Already handled by activateEmergency
        // Simulate API call for now
        // Future: return ApiService.post('/emergency/alert', alertData);
        console.log('Enviando alerta a API:', alertData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate for simulation
                    console.log('Alerta enviada con ubicación:', this.userLocation);
                    resolve({ success: true, message: "Alerta recibida por el servidor." });
                } else {
                    console.error('Simulated API error sending alert.');
                    reject(new Error("El servidor no pudo procesar la alerta. Intente de nuevo."));
                }
            }, 1500);
        });
    }

    checkGeolocationPermission() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' })
                .then(permissionStatus => {
                    if (permissionStatus.state === 'denied') {
                        UIUtils.showToast('Los permisos de ubicación están desactivados. Actívalos para la función de emergencia.', 'warning', 5000);
                        this.elements.userLocationElement.textContent = "Permisos de ubicación desactivados.";
                    }
                    permissionStatus.onchange = () => {
                        if (permissionStatus.state === 'denied') {
                            UIUtils.showToast('Permisos de ubicación desactivados.', 'warning');
                            this.elements.userLocationElement.textContent = "Permisos de ubicación desactivados.";
                        } else if (permissionStatus.state === 'granted') {
                             UIUtils.showToast('Permisos de ubicación activados.', 'info');
                             this.getCurrentLocation().catch(err => console.warn(err.message)); // Try to get location if granted
                        }
                    };
                });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('panicButton')) { // Check if on emergency page
        new EmergencySystem();
    }
});