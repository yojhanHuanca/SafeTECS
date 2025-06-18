// js/utils/UIUtils.js

export const UIUtils = {
    /**
     * Sets a loading state on a button.
     * @param {HTMLButtonElement} button - The button element.
     * @param {boolean} isLoading - True to show loading, false to hide.
     * @param {string} [loadingText='Cargando...'] - Text to show while loading (if no spinner).
     */
    setButtonLoading: (button, isLoading, loadingText = 'Cargando...') => {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML; // Store original content
            const spinner = button.querySelector('.spinner'); // Check if a spinner element exists
            const btnText = button.querySelector('.btn-text'); // Check if a text element exists

            if (spinner) {
                spinner.style.display = 'inline-block';
                if (btnText) btnText.style.display = 'none'; // Hide text if spinner is present
                else button.innerHTML = `<span class="spinner" style="display: inline-block;"></span>`; // Fallback if only text
            } else {
                // If no spinner, just change text (consider adding a simple text spinner)
                button.innerHTML = loadingText;
            }
            button.classList.add('loading');
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
            // If originalText was not set (e.g. button only had an icon),
            // this will restore it. If it was text, it's restored.
            // If it had a spinner that was added, originalText will put it back.
            // Consider more robust restoration if innerHTML was complex.
            const spinner = button.querySelector('.spinner');
            const btnText = button.querySelector('.btn-text');
            if (spinner) spinner.style.display = 'none';
            if (btnText) btnText.style.display = 'inline';

            button.classList.remove('loading');
        }
    },

    /**
     * Displays a message in a specified element.
     * @param {HTMLElement} element - The HTML element to display the message in.
     * @param {string} message - The message to display.
     * @param {'error' | 'success' | 'info'} [type='error'] - The type of message.
     */
    displayMessage: (element, message, type = 'error') => {
        if (!element) return;
        element.textContent = message;
        // Remove existing type classes
        element.classList.remove('error-message', 'success-message', 'info-message');

        if (type === 'error') {
            element.classList.add('error-message'); // Ensure .error-message is styled (e.g., color: var(--error-color))
        } else if (type === 'success') {
            element.classList.add('success-message'); // Ensure .success-message is styled (e.g., color: var(--success-color))
        } else {
            element.classList.add('info-message'); // Ensure .info-message is styled
        }
        element.style.display = 'block';
    },

    /**
     * Hides a message element.
     * @param {HTMLElement} element - The message element to hide.
     */
    hideMessage: (element) => {
        if (!element) return;
        element.textContent = '';
        element.style.display = 'none';
    },


    /**
     * Shows a simple toast notification.
     * @param {string} message - The message for the toast.
     * @param {'info' | 'success' | 'error' | 'warning'} [type='info'] - Type of toast.
     * @param {number} [duration=3000] - Duration in ms.
     */
    showToast: (message, type = 'info', duration = 3000) => {
        // console.log(`Toast (${type}): ${message}`); // Fallback for now

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`; // Style these in CSS
        toast.textContent = message;

        // Style directly or ensure CSS classes are present in base.css / component css
        // Basic styles for demonstration:
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md, 8px)',
            zIndex: '1001',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out',
            boxShadow: 'var(--shadow-lg, 0 4px 15px rgba(0,0,0,0.2))'
        });

        if (type === 'success') {
            toast.style.backgroundColor = 'var(--success-color, green)';
            toast.style.color = 'var(--text-color-light, white)';
        } else if (type === 'error') {
            toast.style.backgroundColor = 'var(--error-color, red)';
            toast.style.color = 'var(--text-color-light, white)';
        } else if (type === 'warning') {
            toast.style.backgroundColor = 'var(--warning-color, orange)';
            toast.style.color = 'var(--text-color-dark, black)';
        } else { // info
            toast.style.backgroundColor = 'var(--primary-color, #007bff)';
            toast.style.color = 'var(--text-color-light, white)';
        }

        document.body.appendChild(toast);

        // Trigger animation and visibility
        requestAnimationFrame(() => { // Ensures the element is in the DOM before adding class
            toast.classList.add('show');
        });

        // Remove toast after duration
        setTimeout(() => {
            toast.classList.remove('show');
            // Allow time for fade-out animation before removing from DOM
            toast.addEventListener('transitionend', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, { once: true }); // Ensure event listener is removed after execution
        }, duration);
    }
};

// Example basic CSS for toast and spinner (to be added to base.css or similar)
/*
In base.css:

.error-message { color: var(--error-color); }
.success-message { color: var(--success-color); }
.info-message { color: var(--primary-color); }

// Basic spinner (if not using one from a framework)
.spinner {
    display: none; // Hidden by default
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-spin 0.75s linear infinite;
    margin-right: 0.5rem;
}
@keyframes spinner-spin {
    to { transform: rotate(360deg); }
}

// Toast base styles (can be expanded)
.toast-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    z-index: 1001; // Above most content
    opacity: 0;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    box-shadow: var(--shadow-lg);
    font-size: var(--font-size-base);
}
.toast-message.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
.toast-message.toast-info {
    background-color: var(--primary-color);
    color: var(--text-color-light);
}
.toast-message.toast-success {
    background-color: var(--success-color);
    color: var(--text-color-light);
}
.toast-message.toast-error {
    background-color: var(--error-color);
    color: var(--text-color-light);
}
.toast-message.toast-warning {
    background-color: var(--warning-color);
    color: var(--text-color-dark); // Warning often has dark text on yellow
}

*/
