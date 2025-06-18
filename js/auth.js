class AuthUI {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('correo'); // Assuming id="correo" from index.html
        this.passwordInput = document.getElementById('contrasena'); // Assuming id="contrasena" from index.html
        this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;
        this.errorDiv = document.getElementById('error-message'); // Ensure this ID is in index.html

        // Password toggle elements
        this.togglePwdButton = this.form ? this.form.querySelector('.toggle-pwd') : null;
        this.pwdIcon = this.togglePwdButton ? this.togglePwdButton.querySelector('span.material-icons') : null;

        this.init();
    }

    init() {
        if (!this.form) {
            // console.warn('Login form not found. AuthUI will not initialize.');
            return;
        }
        this.setupEventListeners();
        // Floating labels are CSS-driven based on :not(:placeholder-shown) in the new base.css
        // so initFloatingLabels might not be needed if placeholders are set correctly.
        this.initFloatingLabels();
    }

    setupEventListeners() {
        if (this.emailInput) {
            this.emailInput.addEventListener('input', this.validateEmail.bind(this));
        }
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
        }
        
        if (this.togglePwdButton && this.passwordInput && this.pwdIcon) { // Added null check for pwdIcon
            this.togglePwdButton.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }
        
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    initFloatingLabels() {
        if (this.emailInput && this.emailInput.value) {
            if(this.emailInput.placeholder !== " ") this.emailInput.placeholder = " ";
        }
        if (this.passwordInput && this.passwordInput.value) {
            if(this.passwordInput.placeholder !== " ") this.passwordInput.placeholder = " ";
        }
    }

    validateEmail() {
        if (!this.emailInput) return false;
        const email = this.emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (!email) {
            this.showInlineError(this.emailInput, 'El correo es requerido');
            return false;
        }
        if (!isValid) {
            this.showInlineError(this.emailInput, 'Ingresa un correo válido');
            return false;
        }
        this.clearInlineError(this.emailInput);
        return true;
    }

    validatePassword() {
        if (!this.passwordInput) return false;
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showInlineError(this.passwordInput, 'La contraseña es requerida');
            return false;
        }
        if (password.length < 8) {
            this.showInlineError(this.passwordInput, 'Mínimo 8 caracteres');
            return false;
        }
        this.clearInlineError(this.passwordInput);
        return true;
    }

    togglePasswordVisibility() {
        if (this.passwordInput.type === "password") {
            this.passwordInput.type = "text";
            if (this.pwdIcon) this.pwdIcon.textContent = "visibility";
        } else {
            this.passwordInput.type = "password";
            if (this.pwdIcon) this.pwdIcon.textContent = "visibility_off";
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.errorDiv) {
            UIUtils.hideMessage(this.errorDiv);
        }

        const isEmailValid = this.validateEmail(); // Uses showInlineError
        const isPasswordValid = this.validatePassword(); // Uses showInlineError

        if (!isEmailValid || !isPasswordValid) return;

        UIUtils.setButtonLoading(this.submitBtn, true, "Ingresando...");

        try {
            // ApiService could be used here for further abstraction if desired.
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo: this.emailInput.value.trim(),
                    contrasena: this.passwordInput.value
                })
            });

            // Try to parse JSON regardless of response.ok, as backend might send JSON error details
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                // If JSON parsing fails (e.g. HTML error page), create a generic error
                throw new Error(`Error ${response.status}: ${response.statusText}. No se pudo procesar la respuesta del servidor.`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
            }

            if (data.usuario) {
                const { contrasena, ...userDataToStore } = data.usuario; // Exclude password
                localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(data.error || 'Respuesta inválida del servidor.');
            }

        } catch (error) {
            if (this.errorDiv) {
                UIUtils.displayMessage(this.errorDiv, error.message || 'Ocurrió un error. Por favor, intente más tarde.', 'error');
            } else {
                // Fallback if specific error div is not found
                UIUtils.showToast(error.message || 'Ocurrió un error. Por favor, intente más tarde.', 'error');
            }
        } finally {
            UIUtils.setButtonLoading(this.submitBtn, false);
        }
    }

    // Using UIUtils for main error, these are for inline validation errors
    showInlineError(inputElement, message) {
        const inputGroup = inputElement.closest('.form-group');
        if (!inputGroup) return;

        let errorElement = inputGroup.querySelector('.error-message-inline');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message-inline';
            inputGroup.appendChild(errorElement);
        }
        inputGroup.classList.add('has-error'); // Optional: class to style the input field itself
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearInlineError(inputElement) {
        const inputGroup = inputElement.closest('.form-group');
        if (!inputGroup) return;

        inputGroup.classList.remove('has-error');
        const errorElement = inputGroup.querySelector('.error-message-inline');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
}
// Make sure UIUtils is imported at the top of this file.
// import { UIUtils } from '../utils/UIUtils.js'; // Path might need adjustment

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        new AuthUI();
    }
});

// CSS for .error-message-inline and .form-group.has-error should be in base.css or auth.css
/*
.error-message-inline {
    color: var(--error-color);
    font-size: var(--font-size-sm);
    display: block;
    margin-top: var(--space-xs);
}
.form-group.has-error .form-control {
    border-color: var(--error-color);
    box-shadow: 0 0 0 0.2rem rgba(var(--error-color-rgb), 0.25); // Optional focus-like error state
}
*/