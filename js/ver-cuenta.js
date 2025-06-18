// js/ver-cuenta.js
import { UIUtils } from '../utils/UIUtils.js';

class VerCuenta {
    constructor() {
        this.elements = {
            userDataDiv: document.getElementById('user-data'),
            barcodeSection: document.getElementById('barcode-section'),
            barcodeSvg: document.getElementById('barcode'),
            // Assuming a generic page error message div might be added to ver-cuenta.html
            pageErrorMessage: document.getElementById('page-error-message')
        };
        this.currentUser = null;
        this.init();
    }

    init() {
        if (!this.elements.userDataDiv) {
            // console.warn("User data div not found. VerCuenta will not initialize.");
            return;
        }
        this.loadUserDataAndBarcode();
    }

    loadUserDataAndBarcode() {
        try {
            const userDataString = localStorage.getItem('currentUser');
            if (!userDataString) {
                const message = 'No hay datos de usuario. Regístrate o inicia sesión primero.';
                if (this.elements.pageErrorMessage) {
                    UIUtils.displayMessage(this.elements.pageErrorMessage, message, 'error');
                } else if (this.elements.userDataDiv) { // Fallback to userDataDiv if page-error not present
                    UIUtils.displayMessage(this.elements.userDataDiv, message, 'error');
                } else {
                    UIUtils.showToast(message, 'error');
                }
                if (this.elements.barcodeSection) this.elements.barcodeSection.style.display = 'none';
                return;
            }
            this.currentUser = JSON.parse(userDataString);

            if (this.elements.userDataDiv) {
                this.elements.userDataDiv.innerHTML = `
                    <p><strong>Nombre:</strong> ${this.currentUser.nombre || 'N/A'}</p>
                    <p><strong>Correo:</strong> ${this.currentUser.correo || 'N/A'}</p>
                    <p><strong>Código:</strong> ${this.currentUser.codigo || 'N/A'}</p>
                    <p><strong>Carrera:</strong> ${this.currentUser.carrera || 'N/A'}</p>
                    <p><strong>Rol:</strong> ${this.currentUser.rol || 'N/A'}</p>
                `;
            }

            this.generateBarcode();

        } catch (error) {
            console.error("Error loading user data for VerCuenta:", error);
            const message = 'Error al cargar los datos de la cuenta.';
            if (this.elements.pageErrorMessage) {
                UIUtils.displayMessage(this.elements.pageErrorMessage, message, 'error');
            } else if (this.elements.userDataDiv) {
                 this.elements.userDataDiv.innerHTML = ''; // Clear potentially partial data
                 UIUtils.displayMessage(this.elements.userDataDiv, message, 'error');
            } else {
                UIUtils.showToast(message, 'error');
            }
            if (this.elements.barcodeSection) this.elements.barcodeSection.style.display = 'none';
        }
    }

    generateBarcode() {
        if (this.currentUser && this.currentUser.codigo && this.elements.barcodeSvg && window.JsBarcode) {
            try {
                this.elements.barcodeSection.style.display = 'block';
                JsBarcode(this.elements.barcodeSvg, this.currentUser.codigo, {
                    format: "CODE128",
                    lineColor: "var(--text-color-dark, #000)", // Use CSS variable
                    width: 2,
                    height: 60,
                    displayValue: true // This displays the value below barcode
                });
            } catch (e) {
                console.error("Error generating barcode:", e);
                if (this.elements.barcodeSection) this.elements.barcodeSection.style.display = 'none';
                UIUtils.showToast("No se pudo generar el código de barras.", "error");
            }
        } else {
            if (this.elements.barcodeSection) this.elements.barcodeSection.style.display = 'none';
            if (this.currentUser && !this.currentUser.codigo) {
                 UIUtils.showToast("No hay código disponible para generar el código de barras.", "warning");
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('user-data') && document.getElementById('barcode')) {
        new VerCuenta();
    }
});
