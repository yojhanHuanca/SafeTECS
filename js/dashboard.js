// js/dashboard.js
import { ApiService } from '../services/ApiService.js'; // Prepare for future API calls
import { UIUtils } from '../utils/UIUtils.js';

class Dashboard {
    constructor() {
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            menuBtn: document.getElementById('menuBtn'),
            closeSidebarBtn: document.getElementById('closeSidebar'),
            notificationsBtn: document.getElementById('notificationsBtn'),
            logoutBtn: document.getElementById('logoutBtn'),
            userNameDisplay: document.getElementById('userName'), // For header
            sidebarUserNameDisplay: document.getElementById('sidebarUserName'), // For sidebar
            sidebarUserCodeDisplay: document.getElementById('sidebarUserCode'), // For sidebar
            recentAccessContainer: document.querySelector('.access-list'), // For recent activity
            pageErrorMessage: document.getElementById('page-error-message') // For general errors
            // Add a main content loader if needed: e.g. mainContentLoader: document.getElementById('main-content-loader')
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
    }

    async loadDashboardData() {
        // Example: Show a general page loader if you have one
        // if (this.elements.mainContentLoader) this.elements.mainContentLoader.style.display = 'flex';

        try {
            await this.loadUserData(); // Still from localStorage for now
            await this.loadRecentAccess(); // Simulated
        } catch (error) {
            if (this.elements.pageErrorMessage) {
                UIUtils.displayMessage(this.elements.pageErrorMessage, error.message || 'Error al cargar datos del dashboard.', 'error');
            } else {
                UIUtils.showToast(error.message || 'Error al cargar datos del dashboard.', 'error');
            }
        } finally {
            // if (this.elements.mainContentLoader) this.elements.mainContentLoader.style.display = 'none';
        }
    }

    setupEventListeners() {
        if (this.elements.menuBtn) this.elements.menuBtn.addEventListener('click', this.openSidebar.bind(this));
        if (this.elements.closeSidebarBtn) this.elements.closeSidebarBtn.addEventListener('click', this.closeSidebar.bind(this));
        if (this.elements.sidebarOverlay) this.elements.sidebarOverlay.addEventListener('click', this.closeSidebar.bind(this));
        if (this.elements.logoutBtn) this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        if (this.elements.notificationsBtn) this.elements.notificationsBtn.addEventListener('click', this.showNotifications.bind(this));
        this.setupSwipeGestures();
    }

    openSidebar() {
        if (this.elements.sidebar) this.elements.sidebar.classList.add('open');
        if (this.elements.sidebarOverlay) this.elements.sidebarOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        if (this.elements.sidebar) this.elements.sidebar.classList.remove('open');
        if (this.elements.sidebarOverlay) this.elements.sidebarOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    setupSwipeGestures() {
        if (!this.elements.sidebar) return;
        let touchStartX = 0;
        this.elements.sidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        this.elements.sidebar.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            if (touchStartX - touchEndX > 50) { // Swipe left to close
                this.closeSidebar();
            }
        }, { passive: true });
    }

    async loadUserData() {
        // This method remains largely the same, using localStorage.
        // Could be refactored to use ApiService.get('/api/user/profile') in the future.
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                if (this.elements.userNameDisplay) this.elements.userNameDisplay.textContent = currentUser.nombre;
                if (this.elements.sidebarUserNameDisplay) this.elements.sidebarUserNameDisplay.textContent = currentUser.nombre;
                if (this.elements.sidebarUserCodeDisplay) this.elements.sidebarUserCodeDisplay.textContent = currentUser.codigo || 'N/A';
            } else {
                // Handle case where user data is not found, possibly redirect to login
                // UIUtils.showToast('Por favor, inicia sesión.', 'error');
                // window.location.href = 'index.html';
                throw new Error('No se encontraron datos de usuario. Por favor, inicie sesión.');
            }
        } catch (e) { // Catches JSON.parse errors or other sync errors
            console.error("Error loading user data from localStorage:", e);
            throw new Error('Error al procesar datos de usuario.');
        }
    }

    async loadRecentAccess() {
        // UIUtils.setButtonLoading(someButton, true); // If triggered by a button
        // For now, this remains a simulation.
        // Future: const activity = await ApiService.get('/api/dashboard/activity');
        return new Promise(resolve => {
            setTimeout(() => {
                if (this.elements.recentAccessContainer) {
                    // Example: Clear previous and add new, or update existing
                    // this.elements.recentAccessContainer.innerHTML = '<p>Simulated recent activity loaded.</p>';
                }
                console.log('Simulated recent access loaded.');
                resolve();
            }, 500);
        });
        // UIUtils.setButtonLoading(someButton, false);
    }

    showNotifications() {
        // Replace alert with UIUtils.showToast or a proper notification UI
        UIUtils.showToast('Mostrando notificaciones... (simulado)', 'info');
    }

    handleLogout() {
        // UIUtils.setButtonLoading(this.elements.logoutBtn, true); // Logout is usually quick, but good practice if API call involved
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken'); // Just in case
            // UIUtils.showToast('Has cerrado sesión.', 'success'); // Feedback before redirect
            window.location.href = 'index.html';
        } else {
            // UIUtils.setButtonLoading(this.elements.logoutBtn, false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.app-header')) { // Check if on dashboard page
        new Dashboard();
    }
});