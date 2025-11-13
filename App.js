js/app.js
class PrecursorApp {
    constructor() {
        this.storage = new StorageManager();
        this.calendar = new Calendar(this.storage);
        this.init();
    }

    init() {
        // Inicializar calendario
        this.calendar.generateCalendar();

        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar configuración
        this.loadConfig();
    }

    setupEventListeners() {
        // Navegación del mes
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendar.previousMonth();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.calendar.nextMonth();
        });

        // Tipo de precursorado
        document.getElementById('precursor-type').addEventListener('change', (e) => {
            this.handlePrecursorTypeChange(e.target.value);
        });

        // Guardar configuración
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfig();
        });

        // Modal de horas
        document.getElementById('save-hours').addEventListener('click', () => {
            this.calendar.saveHours();
        });

        document.getElementById('delete-hours').addEventListener('click', () => {
            this.calendar.deleteHours();
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.calendar.closeHoursModal();
        });

        // Cerrar modal al hacer click fuera
        document.getElementById('hours-modal').addEventListener('click', (e) => {
            if (e.target.id === 'hours-modal') {
                this.calendar.closeHoursModal();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.calendar.closeHoursModal();
            }
        });
    }

    handlePrecursorTypeChange(type) {
        const customContainer = document.getElementById('custom-hours-container');
        const customHours = document.getElementById('custom-hours');

        if (type === 'custom') {
            customContainer.style.display = 'block';
        } else {
            customContainer.style.display = 'none';
            // Establecer horas según el tipo seleccionado
            const hours = parseInt(type);
            customHours.value = hours;
        }
    }

    loadConfig() {
        const config = this.storage.getConfig();
        const precursorType = document.getElementById('precursor-type');
        const customHours = document.getElementById('custom-hours');

        precursorType.value = config.precursorType;
        customHours.value = config.customHours;

        this.handlePrecursorTypeChange(config.precursorType);
    }

    saveConfig() {
        const precursorType = document.getElementById('precursor-type').value;
        const customHours = document.getElementById('custom-hours').value;

        const config = {
            precursorType: precursorType,
            customHours: parseInt(customHours),
            monthlyGoal: precursorType === 'custom' ? parseInt(customHours) : parseInt(precursorType)
        };

        if (this.storage.saveConfig(config)) {
            alert('Configuración guardada correctamente');
            this.calendar.generateCalendar(); // Refrescar con nueva configuración
        } else {
            alert('Error al guardar la configuración');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PrecursorApp();
});