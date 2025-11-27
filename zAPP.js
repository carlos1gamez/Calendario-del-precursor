// zAPP.js - VERSIÓN CORREGIDA
class PrecursorApp {
    constructor() {
        this.storage = new StorageManager();
        this.calendar = new Calendar(this.storage);
        this.init();
    }

    init() {
        console.log('Inicializando Calendario del Precursor...');
        
        // Inicializar calendario
        this.calendar.generateCalendar();

        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar configuración
        this.loadConfig();
        
        console.log('Aplicación iniciada correctamente');
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');

        // Navegación del mes
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendar.previousMonth();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.calendar.nextMonth();
        });

        // Tipo de precursorado - ACTUALIZAR EN TIEMPO REAL
        document.getElementById('precursor-type').addEventListener('change', (e) => {
            this.handlePrecursorTypeChange(e.target.value);
            this.updateGoalDisplay(); // Actualizar meta inmediatamente
        });

        // Horas personalizadas - ACTUALIZAR EN TIEMPO REAL
        document.getElementById('custom-hours').addEventListener('input', (e) => {
            this.updateGoalDisplay(); // Actualizar meta inmediatamente
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

        // Enter para guardar horas
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('hours-modal').classList.contains('show')) {
                this.calendar.saveHours();
            }
        });

        console.log('Todos los event listeners configurados');
    }

    handlePrecursorTypeChange(type) {
        const customContainer = document.getElementById('custom-hours-container');
        const customHours = document.getElementById('custom-hours');

        if (type === 'custom') {
            customContainer.style.display = 'block';
            customHours.focus();
        } else {
            customContainer.style.display = 'none';
            // Establecer horas según el tipo seleccionado
            const hours = parseInt(type);
            if (!isNaN(hours)) {
                customHours.value = hours;
            }
        }
        this.updateGoalDisplay(); // Actualizar meta al cambiar tipo
    }

    // MÉTODO: Actualizar visualización de meta en tiempo real
    updateGoalDisplay() {
        const precursorType = document.getElementById('precursor-type').value;
        const customHoursInput = document.getElementById('custom-hours');
        let monthlyGoal = 50; // Valor por defecto

        if (precursorType === 'custom') {
            monthlyGoal = customHoursInput ? parseInt(customHoursInput.value) || 50 : 50;
        } else {
            monthlyGoal = parseInt(precursorType) || 50;
        }

        // Actualizar display de meta inmediatamente
        const monthlyGoalElement = document.getElementById('monthly-goal');
        if (monthlyGoalElement) {
            monthlyGoalElement.textContent = monthlyGoal;
        }

        // También actualizar horas restantes
        const hoursDoneElement = document.getElementById('hours-done');
        const hoursDone = hoursDoneElement ? parseFloat(hoursDoneElement.textContent) || 0 : 0;
        const hoursRemaining = Math.max(0, monthlyGoal - hoursDone);
        
        const hoursRemainingElement = document.getElementById('hours-remaining');
        if (hoursRemainingElement) {
            hoursRemainingElement.textContent = hoursRemaining.toFixed(1);
        }

        // Actualizar porcentaje
        this.updateProgressPercentage(monthlyGoal, hoursDone);
    }

    // MÉTODO: Actualizar porcentaje de progreso
    updateProgressPercentage(monthlyGoal, hoursDone) {
        const progressPercentElement = document.getElementById('progress-percent');
        if (!progressPercentElement) return;

        let percent = 0;
        if (monthlyGoal > 0) {
            percent = (hoursDone / monthlyGoal) * 100;
        }

        const displayPercent = Math.min(100, Math.max(0, percent));
        progressPercentElement.textContent = displayPercent.toFixed(1) + '%';

        // Cambiar color según el progreso
        if (displayPercent >= 100) {
            progressPercentElement.style.color = '#27ae60';
            progressPercentElement.innerHTML = '✅ ' + displayPercent.toFixed(1) + '%';
        } else if (displayPercent >= 75) {
            progressPercentElement.style.color = '#f39c12';
            progressPercentElement.innerHTML = '🟡 ' + displayPercent.toFixed(1) + '%';
        } else if (displayPercent >= 50) {
            progressPercentElement.style.color = '#f39c12';
            progressPercentElement.innerHTML = '🟠 ' + displayPercent.toFixed(1) + '%';
        } else {
            progressPercentElement.style.color = '#e74c3c';
            progressPercentElement.innerHTML = '🔴 ' + displayPercent.toFixed(1) + '%';
        }
    }

    loadConfig() {
        const config = this.storage.getConfig();
        const precursorType = document.getElementById('precursor-type');
        const customHours = document.getElementById('custom-hours');

        if (precursorType) {
            precursorType.value = config.precursorType;
        }

        if (customHours) {
            customHours.value = config.customHours;
        }

        this.handlePrecursorTypeChange(config.precursorType);
        this.updateGoalDisplay(); // Actualizar display al cargar
        console.log('Configuración cargada:', config);
    }

    saveConfig() {
        console.log('🔧 Iniciando guardado de configuración...');
        
        // 1. OBTENER VALORES DE LOS FORMULARIOS
        const precursorType = document.getElementById('precursor-type').value;
        const customHoursInput = document.getElementById('custom-hours');
        const customHours = customHoursInput ? parseInt(customHoursInput.value) : 50;

        console.log('📊 Valores obtenidos:', { precursorType, customHours });

        // 2. VALIDACIONES
        if (precursorType === 'custom' && (isNaN(customHours) || customHours <= 0)) {
            this.calendar.showNotification('Por favor ingresa un número válido para las horas personalizadas', 'error');
            customHoursInput.focus();
            return;
        }

        if (precursorType === 'custom' && customHours > 200) {
            this.calendar.showNotification('Las horas personalizadas no pueden ser más de 200', 'error');
            customHoursInput.focus();
            return;
        }

        // 3. CALCULAR META MENSUAL
        const monthlyGoal = precursorType === 'custom' ? customHours : parseInt(precursorType);
        console.log('🎯 Meta mensual calculada:', monthlyGoal);

        // 4. CREAR OBJETO DE CONFIGURACIÓN
        const config = {
            precursorType: precursorType,
            customHours: customHours,
            monthlyGoal: monthlyGoal
        };

        console.log('💾 Configuración a guardar:', config);

        // 5. GUARDAR EN LOCALSTORAGE
        if (this.storage.saveConfig(config)) {
            console.log('✅ Configuración guardada en localStorage');
            
            // 6. MOSTRAR NOTIFICACIÓN DE ÉXITO
            this.calendar.showNotification('✅ Configuración guardada correctamente', 'success');
            
            // 7. ✅ ACTUALIZAR INMEDIATAMENTE LA INTERFAZ
            this.updateGoalDisplay();
            
            // 8. ✅ ACTUALIZAR ESTADÍSTICAS DEL CALENDARIO
            this.calendar.updateStats();
            
            console.log('🔄 Interfaz actualizada correctamente');
            
        } else {
            console.error('❌ Error al guardar configuración');
            this.calendar.showNotification('❌ Error al guardar la configuración', 'error');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado');
    new PrecursorApp();
}); // ✅ PARÉNTESIS CERRADO CORRECTAMENTE

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});