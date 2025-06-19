// js/scan_access.js
import { ApiService } from '../services/ApiService.js';
import { UIUtils } from '../utils/UIUtils.js';

class AccessScanner {
    constructor() {
        this.elements = {
            scannerContainer: document.getElementById('scanner-container'),
            startScanButton: document.getElementById('start-scan-btn'),
            stopScanButton: document.getElementById('stop-scan-btn'),
            scannedCodeElement: document.getElementById('scanned-code-result'),
            userScannedInfoElement: document.getElementById('user-scanned-info'),
            eventTypeEntryRadio: document.getElementById('event-type-entry'),
            eventTypeExitRadio: document.getElementById('event-type-exit'),
            scannerFeedbackDiv: document.getElementById('scanner-feedback'),
            pageErrorMessage: document.getElementById('page-error-message'),
            scannerPlaceholder: document.querySelector('#scanner-container .scanner-placeholder')
        };
        this.quaggaConfig = {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: this.elements.scannerContainer, // Set here, Quagga re-evaluates this before init
                constraints: {
                    width: { min: 640, ideal: 640 },
                    height: { min: 480, ideal: 480 },
                    facingMode: "environment",
                },
                area: { top: "20%", right: "5%", left: "5%", bottom: "20%" }
            },
            locator: { patchSize: "medium", halfSample: true },
            numOfWorkers: Math.max(1, (navigator.hardwareConcurrency || 4) - 1),
            decoder: {
                readers: ["code_128_reader"],
                debug: { drawBoundingBox: true, drawScanline: true }
            },
            locate: true,
            multiple: false
        };
        this.lastScannedCode = null;
        this.lastScanTime = 0;
        this.scanDebounceTime = 3000;
        this.processingDetection = false;
        this.isScannerInitialized = false;
        this.isScannerActive = false;

        this.init();
    }

    init() {
        if (!this.elements.scannerContainer || !this.elements.startScanButton || !this.elements.stopScanButton ||
            !this.elements.scannedCodeElement || !this.elements.userScannedInfoElement ||
            !this.elements.eventTypeEntryRadio || !this.elements.eventTypeExitRadio ||
            !this.elements.scannerFeedbackDiv || !this.elements.pageErrorMessage || !this.elements.scannerPlaceholder) {
            console.error("Scanner page critical elements not found. Cannot initialize.");
            // Attempt to display error on page even if some elements are missing
            const errorDisplay = this.elements.pageErrorMessage || document.body;
            UIUtils.displayMessage(errorDisplay, "Error de configuración de la página del scanner.", "error");
            return;
        }
        this.setupEventListeners();
        this.updateUIForScannerState(false);
        UIUtils.displayMessage(this.elements.scannerFeedbackDiv, "Listo para escanear.", "info");
    }

    setupEventListeners() {
        this.elements.startScanButton.addEventListener('click', () => this.startScanner());
        this.elements.stopScanButton.addEventListener('click', () => this.stopScanner());
    }

    updateUIForScannerState(isScanning) {
        this.isScannerActive = isScanning;
        this.elements.startScanButton.disabled = isScanning;
        this.elements.stopScanButton.disabled = !isScanning;
        this.elements.stopScanButton.style.display = isScanning ? 'inline-flex' : 'none'; // Show/hide
        this.elements.startScanButton.style.display = isScanning ? 'none' : 'inline-flex'; // Show/hide

        if (this.elements.scannerPlaceholder) {
            this.elements.scannerPlaceholder.style.display = isScanning ? 'none' : 'flex';
        }
        if (isScanning) {
            UIUtils.displayMessage(this.elements.scannerFeedbackDiv, "Scanner activo. Buscando código...", "info");
            this.clearScanResults(); // Clear previous results when starting a new scan session
        } else {
            // Check if Quagga was ever initialized to avoid "Scanner stopped" on page load
            if (this.isScannerInitialized && this.elements.scannerFeedbackDiv) {
                 UIUtils.displayMessage(this.elements.scannerFeedbackDiv, "Scanner detenido.", "info");
            }
        }
    }

    clearScanResults() {
        if (this.elements.scannedCodeElement) this.elements.scannedCodeElement.textContent = "- Ninguno -";
        if (this.elements.userScannedInfoElement) this.elements.userScannedInfoElement.innerHTML = "- Esperando escaneo -";
        // Do not hide pageErrorMessage here, it might contain init errors.
        // UIUtils.hideMessage(this.elements.pageErrorMessage);
    }

    startScanner() {
        if (typeof Quagga === 'undefined') {
            console.error("QuaggaJS library not loaded.");
            UIUtils.displayMessage(this.elements.scannerFeedbackDiv || this.elements.pageErrorMessage, 'Librería del scanner no cargada.', 'error');
            return;
        }

        UIUtils.setButtonLoading(this.elements.startScanButton, true, "Iniciando...");
        if (this.elements.scannerFeedbackDiv) UIUtils.hideMessage(this.elements.scannerFeedbackDiv);
        if (this.elements.pageErrorMessage) UIUtils.hideMessage(this.elements.pageErrorMessage);


        // Ensure target is correctly assigned before init if it can change or is dynamically created
        this.quaggaConfig.inputStream.target = this.elements.scannerContainer;

        const initOrStartQuagga = () => {
            Quagga.init(this.quaggaConfig, (err) => {
                UIUtils.setButtonLoading(this.elements.startScanButton, false);
                if (err) {
                    console.error("QuaggaJS initialization failed:", err);
                    let errMsg = `Error al iniciar scanner: ${err.message || err}`;
                    if (err.name === "NotAllowedError" || (err.message && err.message.includes("Permission denied"))) {
                        errMsg = "Acceso a la cámara denegado. Revisa los permisos.";
                    } else if (err.name === "NotFoundError" || (err.message && err.message.includes("Requested device not found"))) {
                        errMsg = "No se encontró cámara. Asegúrate que esté conectada.";
                    } else if (err.name === "NotReadableError" || (err.message && err.message.includes("Could not start video source"))) {
                        errMsg = "La cámara está ocupada o no se pudo iniciar.";
                    }
                    UIUtils.displayMessage(this.elements.scannerFeedbackDiv || this.elements.pageErrorMessage, errMsg, 'error');
                    this.isScannerInitialized = false;
                    this.updateUIForScannerState(false); // Ensure UI reflects scanner is off
                    return;
                }
                console.log("QuaggaJS initialization finished. Ready to start.");
                this.isScannerInitialized = true;
                Quagga.start();
                this.updateUIForScannerState(true);
                Quagga.onProcessed(this.handleQuaggaProcessed.bind(this));
                Quagga.onDetected(this.handleBarcodeDetected.bind(this));
            });
        };

        // If Quagga is already running (e.g. from a previous failed detection that stopped it without full deinit)
        if (this.isScannerActive) {
             UIUtils.setButtonLoading(this.elements.startScanButton, false);
             return; // Already running or trying to start
        }

        if (this.isScannerInitialized && Quagga.initialized) {
            Quagga.start(); // If previously initialized and stopped, just start
            this.updateUIForScannerState(true);
            UIUtils.setButtonLoading(this.elements.startScanButton, false);
        } else {
            initOrStartQuagga(); // Full initialization
        }
    }

    stopScanner() {
        if (typeof Quagga !== 'undefined' && this.isScannerActive) { // Check isScannerActive
            Quagga.stop();
            console.log("Scanner stopped.");
            // Note: Quagga.onDetected and onProcessed might still fire briefly after stop.
            // The processingDetection flag should prevent issues.
        }
        this.updateUIForScannerState(false); // Update UI after stopping
        this.processingDetection = false;
    }

    handleQuaggaProcessed(result) {
        if (!this.isScannerActive) return; // Don't draw if scanner isn't supposed to be active
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(box => box !== result.box)
                           .forEach(box => Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 }));
            }
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }
        }
    }

    async _fetchUserDetails(scannedCode) {
        let userName = 'Desconocido';
        let userDetailsHtml = `<strong>Código:</strong> ${scannedCode}<br>`;
        try {
            const userResponse = await ApiService.get(`/users/bycode/${scannedCode}`);
            if (userResponse && userResponse.usuario) {
                userName = userResponse.usuario.nombre;
                userDetailsHtml += `<strong>Nombre:</strong> ${userName}<br><strong>Rol:</strong> ${userResponse.usuario.rol || 'N/A'}`;
            } else { // User explicitly not found by API (e.g. API returns success but no user object)
                userDetailsHtml += `<span class="error-message">Usuario con código ${scannedCode} no encontrado.</span>`;
            }
        } catch (userError) {
            console.warn('Error fetching user details:', userError);
            if (userError.status === 404) {
                userDetailsHtml += `<span class="error-message">Usuario con código ${scannedCode} no encontrado.</span>`;
            } else {
                userDetailsHtml += `<span class="error-message">Error al verificar usuario: ${userError.message || 'Servicio no disponible'}.</span>`;
            }
        }
        if(this.elements.userScannedInfoElement) this.elements.userScannedInfoElement.innerHTML = userDetailsHtml;
        return userName; // Return userName for the next step
    }

    async _recordAccessLog(scannedCode, eventType, userName) {
        const recordResponse = await ApiService.post('/accesslogs/record', { user_code: scannedCode, event_type: eventType });
        if (recordResponse.success) {
            UIUtils.showToast(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} para ${userName} registrada.`, 'success');
            if(this.elements.userScannedInfoElement) {
                this.elements.userScannedInfoElement.innerHTML += `<br><strong class="success-message" style="display:block; margin-top: var(--space-sm);">Acceso (${eventType}) ¡REGISTRADO!</strong>`;
            }
        } else { // API call was successful but operation failed (e.g. backend validation)
            const errorMessage = recordResponse.error || recordResponse.message || 'Error desconocido al registrar acceso.';
            UIUtils.displayMessage(this.elements.userScannedInfoElement || this.elements.scannerFeedbackDiv, errorMessage, 'error');
            UIUtils.showToast(errorMessage, 'error');
        }
    }

    async handleBarcodeDetected(data) {
        if (this.processingDetection) return;

        const currentTime = Date.now();
        if (data && data.codeResult && data.codeResult.code) {
            const scannedCode = data.codeResult.code;

            if (scannedCode === this.lastScannedCode && (currentTime - this.lastScanTime) < this.scanDebounceTime) {
                console.log(`Debounced duplicate scan: ${scannedCode}`);
                this.processingDetection = false; // Allow next different scan immediately
                return;
            }

            this.processingDetection = true;
            this.lastScannedCode = scannedCode;
            this.lastScanTime = currentTime;

            UIUtils.showToast(`Código detectado: ${scannedCode}`, 'info');
            this.stopScanner();

            if(this.elements.scannedCodeElement) this.elements.scannedCodeElement.textContent = ` ${scannedCode}`;
            if(this.elements.userScannedInfoElement) this.elements.userScannedInfoElement.innerHTML = 'Procesando información...';

            const eventType = this.elements.eventTypeEntryRadio.checked ? 'entry' : (this.elements.eventTypeExitRadio.checked ? 'exit' : null);
            if (!eventType) {
                UIUtils.displayMessage(this.elements.userScannedInfoElement || this.elements.scannerFeedbackDiv, 'Selecciona tipo de evento (Entrada/Salida).', 'error');
                this.processingDetection = false;
                this.updateUIForScannerState(false); // Make sure start button is enabled
                return;
            }

            UIUtils.setButtonLoading(this.elements.startScanButton, true, 'Procesando...');

            try {
                const userName = await this._fetchUserDetails(scannedCode);
                // Proceed to record log only if user lookup was successful or if policy allows logging unknown codes
                // Current backend validates user before logging, so if user not found, log will also fail.
                await this._recordAccessLog(scannedCode, eventType, userName);
            } catch (apiError) { // Catch errors from ApiService (network, non-ok status)
                console.error('Error processing barcode with API:', apiError);
                let errorMsg = 'Error al procesar el código.';
                if (apiError.data && apiError.data.error) errorMsg = apiError.data.error; // Error from backend JSON
                else if (apiError.message) errorMsg = apiError.message; // Error from ApiService or network

                UIUtils.displayMessage(this.elements.userScannedInfoElement || this.elements.scannerFeedbackDiv, errorMsg, 'error');
                UIUtils.showToast(errorMsg, 'error');
            } finally {
                UIUtils.setButtonLoading(this.elements.startScanButton, false);
                this.processingDetection = false;
                // UI state is already set to 'stopped' by stopScanner() and updateUIForScannerState(false)
            }
        } else if (this.processingDetection) {
            this.processingDetection = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('scanner-container')) {
        new AccessScanner();
    }
});
