// js/historial.js
import { ApiService } from '../services/ApiService.js'; // Adjusted path
import { UIUtils } from '../utils/UIUtils.js'; // Adjusted path

class HistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10; // Define items per page
        this.totalPages = 1;
        this.currentFilters = { // Renamed from 'filters' to avoid conflict with any potential global 'filters'
            startDate: '',
            endDate: '',
            type: 'all'
        };
        
        this.elements = {
            loadingIndicator: document.getElementById('loadingState'), // Renamed for clarity
            accessListContainer: document.getElementById('accessList'), // Renamed for clarity
            filterBtn: document.getElementById('filterBtn'),
            filtersDropdown: document.getElementById('filtersDropdown'),
            startDateInput: document.getElementById('startDate'), // Renamed
            endDateInput: document.getElementById('endDate'), // Renamed
            accessTypeSelect: document.getElementById('accessType'), // Renamed
            applyFiltersBtn: document.getElementById('applyFilters'), // Renamed
            resetFiltersBtn: document.getElementById('resetFilters'), // Renamed
            prevPageBtn: document.getElementById('prevPageMobile'), // Renamed
            nextPageBtn: document.getElementById('nextPageMobile'), // Renamed
            pageInfoMobile: document.getElementById('pageInfoMobile'),
            exportModal: document.getElementById('exportModal'),
            exportPDFBtn: document.getElementById('exportPDF'), // Renamed
            exportExcelBtn: document.getElementById('exportExcel'), // Renamed
            closeExportModalBtn: document.getElementById('closeExportModal'), // Renamed
            errorMessageDiv: document.getElementById('historial-error-message') // Added for error messages
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.loadAccessHistory(); // Initial data load
    }

    setDefaultDates() {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        
        this.elements.startDateInput.valueAsDate = weekAgo;
        this.elements.endDateInput.valueAsDate = today;
        this.elements.startDateInput.max = today.toISOString().split('T')[0];
        this.elements.endDateInput.max = today.toISOString().split('T')[0];
    }

    setupEventListeners() {
        this.elements.filterBtn.addEventListener('click', () => this.toggleFilters());
        this.elements.applyFiltersBtn.addEventListener('click', () => this.handleApplyFilters());
        this.elements.resetFiltersBtn.addEventListener('click', () => this.handleResetFilters());
        this.elements.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPageBtn.addEventListener('click', () => this.changePage(1));
        
        this.elements.exportPDFBtn.addEventListener('click', () => this.exportData('pdf'));
        this.elements.exportExcelBtn.addEventListener('click', () => this.exportData('excel'));
        this.elements.closeExportModalBtn.addEventListener('click', () => this.closeModal());
    }

    async fetchAccessHistory(page = 1, filters = {}) {
        this.showLoadingState(true);
        if(this.elements.errorMessageDiv) UIUtils.hideMessage(this.elements.errorMessageDiv);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));

        // In a real scenario:
        // try {
        //     const params = { ...filters, page, limit: this.itemsPerPage };
        //     const response = await ApiService.get('/historial', params);
        //     return { data: response.data, total: response.meta.totalItems }; // Adjust based on actual API
        // } catch (error) {
        //     console.error('Error fetching access history:', error.status, error.message, error.data);
        //     if(this.elements.errorMessageDiv) UIUtils.displayMessage(this.elements.errorMessageDiv, error.message || 'Error al cargar el historial.', 'error');
        //     return { data: [], total: 0 };
        // } finally {
        //     this.showLoadingState(false);
        // }

        // Mock data generation
        const mockData = [];
        const statuses = ['success', 'error'];
        const types = ['entry', 'exit'];
        const locations = ['Edificio A', 'Edificio B', 'Edificio C', 'Biblioteca', 'Gimnasio'];
        const totalMockItems = 50;
        for (let i = 0; i < totalMockItems; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
            mockData.push({
                id: i + 1,
                date: date.toISOString(),
                type: types[Math.floor(Math.random() * types.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        let filteredData = mockData.filter(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            const matchesDate = (
                (!filters.startDate || itemDate >= filters.startDate) &&
                (!filters.endDate || itemDate <= filters.endDate)
            );
            const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type;
            return matchesDate && matchesType;
        });
        
        const startIdx = (page - 1) * this.itemsPerPage;
        const paginatedData = filteredData.slice(startIdx, startIdx + this.itemsPerPage);
        
        this.showLoadingState(false); // Moved here for mock
        return { data: paginatedData, total: filteredData.length };
    }

    async loadAccessHistory() {
        const response = await this.fetchAccessHistory(this.currentPage, this.currentFilters);
        this.renderAccessList(response.data);
        this.updatePaginationControls(response.total);
    }

    renderAccessList(data) {
        if (!this.elements.accessListContainer) return;
        if (data.length === 0) {
            this.elements.accessListContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">info_outline</span>
                    <p>No se encontraron registros para los filtros seleccionados.</p>
                </div>
            `;
            return;
        }
        
        this.elements.accessListContainer.innerHTML = data.map(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            return `
                <div class="access-item ${item.status} ${item.type}">
                    <div class="access-icon">
                        <span class="material-icons">${item.type === 'entry' ? 'login' : 'logout'}</span>
                    </div>
                    <div class="access-info">
                        <h3>${item.type === 'entry' ? 'Entrada' : 'Salida'} - ${item.location}</h3>
                        <p>${formattedDate} &bull; ${time}</p>
                    </div>
                    <span class="access-status">${item.status === 'success' ? '✓' : '✗'}</span>
                </div>
            `;
        }).join('');
    }

    updatePaginationControls(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
        if (this.totalPages < 1) this.totalPages = 1;
        this.elements.pageInfoMobile.textContent = `Pág. ${this.currentPage}/${this.totalPages}`;
        this.elements.prevPageBtn.disabled = this.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.currentPage >= this.totalPages;
    }

    showLoadingState(show) {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
        if (this.elements.accessListContainer) {
            this.elements.accessListContainer.style.display = show ? 'none' : 'flex';
        }
    }

    toggleFilters() {
        this.elements.filtersDropdown.classList.toggle('hidden');
    }

    handleApplyFilters() {
        UIUtils.setButtonLoading(this.elements.applyFiltersBtn, true);
        this.currentFilters = {
            startDate: this.elements.startDateInput.value,
            endDate: this.elements.endDateInput.value,
            type: this.elements.accessTypeSelect.value
        };
        this.currentPage = 1;
        this.loadAccessHistory().finally(() => {
            UIUtils.setButtonLoading(this.elements.applyFiltersBtn, false);
        });
        if(!this.elements.filtersDropdown.classList.contains('hidden')) {
            this.elements.filtersDropdown.classList.add('hidden');
        }
    }

    handleResetFilters() {
        this.setDefaultDates();
        this.elements.accessTypeSelect.value = 'all';

        this.currentFilters = { startDate: this.elements.startDateInput.value, endDate: this.elements.endDateInput.value, type: 'all' };
        this.currentPage = 1;
        this.loadAccessHistory();
        if(!this.elements.filtersDropdown.classList.contains('hidden')) {
            this.elements.filtersDropdown.classList.add('hidden');
        }
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage < 1 || newPage > this.totalPages) return;
        
        this.currentPage = newPage;
        const btnToLoad = delta > 0 ? this.elements.nextPageBtn : this.elements.prevPageBtn;
        UIUtils.setButtonLoading(btnToLoad, true);
        this.loadAccessHistory().finally(() => {
            UIUtils.setButtonLoading(btnToLoad, false);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    exportData(format) {
        UIUtils.showToast(`Exportando historial a ${format.toUpperCase()}...`, 'info');
        console.log(`Simulating export to ${format.toUpperCase()}`);
        this.closeModal();
        setTimeout(() => {
            UIUtils.showToast(`Historial exportado a ${format.toUpperCase()} (simulado).`, 'success');
        }, 1500);
    }

    openModal() {
        if (this.elements.exportModal) this.elements.exportModal.classList.remove('hidden');
    }

    closeModal() {
        if (this.elements.exportModal) this.elements.exportModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('accessList')) {
        const historyManager = new HistoryManager();

        const exportBtnHeader = document.querySelector('.history-header #exportBtn');
        if (exportBtnHeader) {
            exportBtnHeader.addEventListener('click', () => historyManager.openModal());
        }
    }
});