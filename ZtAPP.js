// zAPP.js - VERSIÓN MEJORADA Y CORREGIDA CON INSTALADOR PWA
class PrecursorApp {
    constructor() {
        this.storage = new StorageManager();
        this.calendar = new Calendar(this.storage);
        this.chartManager = new ChartManager(this.storage);
        this.reportManager = new ReportManager(this.storage);
        this.currentSection = 'control-panel';
        
        // NUEVO: Inicializar instalador PWA
        this.appInstaller = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Calendario del Precursor...');
        
        // Inicializar componentes
        this.calendar.generateCalendar();

        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar configuración
        this.loadConfig();
        
        // NUEVO: Inicializar instalador después de un breve delay
        setTimeout(() => {
            this.initializeAppInstaller();
        }, 1000);
        
        console.log('✅ Aplicación iniciada correctamente');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

        // ===== NAVEGACIÓN PRINCIPAL =====
        this.setupNavigation();

        // Navegación del mes
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendar.previousMonth();
            this.refreshAllData();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.calendar.nextMonth();
            this.refreshAllData();
        });

        // Tipo de precursorado
        document.getElementById('precursor-type').addEventListener('change', (e) => {
            this.handlePrecursorTypeChange(e.target.value);
            this.updateGoalDisplay();
        });

        // Horas personalizadas
        document.getElementById('custom-hours').addEventListener('input', (e) => {
            this.updateGoalDisplay();
        });

        // Guardar configuración
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfig();
        });

        // Modal de horas
        document.getElementById('save-hours').addEventListener('click', () => {
            this.saveHoursAndRefresh();
        });

        document.getElementById('delete-hours').addEventListener('click', () => {
            this.calendar.deleteHours();
            this.refreshAllData();
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.calendar.closeHoursModal();
        });

        // Selector de tipos de predicación
        document.getElementById('predicacion-type').addEventListener('change', (e) => {
            this.handlePredicacionTypeChange(e.target.value);
        });

        // Eventos del modal
        document.getElementById('hours-modal').addEventListener('click', (e) => {
            if (e.target.id === 'hours-modal') {
                this.calendar.closeHoursModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.calendar.closeHoursModal();
            }
            if (e.key === 'Enter' && document.getElementById('hours-modal').classList.contains('show')) {
                this.saveHoursAndRefresh();
            }
        });

        console.log('✅ Todos los event listeners configurados');
    }

    // ===== SISTEMA DE NAVEGACIÓN MEJORADO =====
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = button.getAttribute('data-section');
                this.showSection(targetSection);
                
                // Actualizar botones activos
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Efecto visual en el botón
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Mostrar sección por defecto
        this.showSection('control-panel');
    }

    showSection(sectionId) {
        // Validar sección existente
        const validSections = ['control-panel', 'charts-section', 'reports-section'];
        if (!validSections.includes(sectionId)) {
            console.error('❌ Sección no válida:', sectionId);
            return;
        }

        // Ocultar todas las secciones con animación
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            if (section.classList.contains('active')) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    section.classList.remove('active');
                    section.style.display = 'none';
                }, 300);
            }
        });

        // Mostrar sección seleccionada
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                setTimeout(() => {
                    targetSection.classList.add('active');
                    this.currentSection = sectionId;
                    
                    // Animación de entrada
                    setTimeout(() => {
                        targetSection.style.opacity = '1';
                        targetSection.style.transform = 'translateY(0)';
                    }, 50);
                    
                    // Actualizar componentes según la sección
                    this.updateSectionContent(sectionId);
                }, 50);
            }
        }, 300);
    }

    updateSectionContent(sectionId) {
        switch(sectionId) {
            case 'charts-section':
                setTimeout(() => {
                    this.chartManager.loadCharts();
                }, 100);
                break;
            case 'reports-section':
                setTimeout(() => {
                    this.reportManager.loadReportPreview();
                }, 100);
                break;
            case 'control-panel':
                this.calendar.updateStats();
                break;
        }
    }

    // ===== MÉTODOS MEJORADOS =====
    saveHoursAndRefresh() {
        this.calendar.saveHours();
        this.refreshAllData();
    }

    refreshAllData() {
        // Actualizar calendario
        this.calendar.generateCalendar();
        this.calendar.updateStats();
        
        // Actualizar gráficos si están visibles
        if (this.currentSection === 'charts-section') {
            setTimeout(() => {
                this.chartManager.loadCharts();
            }, 500);
        }
        
        // Actualizar informes si están visibles
        if (this.currentSection === 'reports-section') {
            setTimeout(() => {
                this.reportManager.loadReportPreview();
            }, 500);
        }
        
        // Actualizar display de metas
        this.updateGoalDisplay();
    }

    handlePredicacionTypeChange(type) {
        const notesInput = document.getElementById('hours-notes');
        const predicacionType = document.getElementById('predicacion-type');
        
        // Efecto visual al cambiar tipo
        if (predicacionType) {
            predicacionType.style.borderColor = type ? '#27ae60' : '#e0e0e0';
        }
        
        if (type && !notesInput.value) {
            const suggestions = {
                'Informal': 'Conversación espontánea en lugares públicos...',
                'Casa en Casa': 'Visita domiciliaria en sector...',
                'Carta': 'Correspondencia con interesados...',
                'Revisitas': 'Seguimiento a personas interesadas...',
                'Curso': 'Preparación o impartición de curso bíblico...',
                'Día largo': 'Jornada extensa de predicación...'
            };
            notesInput.placeholder = suggestions[type] || 'Detalles de la actividad...';
        }
    }

    handlePrecursorTypeChange(type) {
        const customContainer = document.getElementById('custom-hours-container');
        const customHours = document.getElementById('custom-hours');

        if (type === 'custom') {
            customContainer.style.display = 'block';
            setTimeout(() => {
                customHours.focus();
                customHours.select();
            }, 100);
        } else {
            customContainer.style.display = 'none';
            const hours = parseInt(type);
            if (!isNaN(hours)) {
                customHours.value = hours;
            }
        }
        this.updateGoalDisplay();
    }

    updateGoalDisplay() {
        const precursorType = document.getElementById('precursor-type').value;
        const customHoursInput = document.getElementById('custom-hours');
        let monthlyGoal = 50;

        if (precursorType === 'custom') {
            monthlyGoal = customHoursInput ? parseInt(customHoursInput.value) || 50 : 50;
        } else {
            monthlyGoal = parseInt(precursorType) || 50;
        }

        // Actualizar elementos de la UI
        const monthlyGoalElement = document.getElementById('monthly-goal');
        if (monthlyGoalElement) {
            monthlyGoalElement.textContent = monthlyGoal;
            monthlyGoalElement.style.color = '#3498db';
            monthlyGoalElement.style.fontWeight = 'bold';
        }

        const hoursDoneElement = document.getElementById('hours-done');
        const hoursDone = hoursDoneElement ? parseFloat(hoursDoneElement.textContent) || 0 : 0;
        const hoursRemaining = Math.max(0, monthlyGoal - hoursDone);
        
        const hoursRemainingElement = document.getElementById('hours-remaining');
        if (hoursRemainingElement) {
            hoursRemainingElement.textContent = hoursRemaining.toFixed(1);
            // Cambiar color según las horas restantes
            if (hoursRemaining === 0) {
                hoursRemainingElement.style.color = '#27ae60';
            } else if (hoursRemaining <= monthlyGoal * 0.25) {
                hoursRemainingElement.style.color = '#f39c12';
            } else {
                hoursRemainingElement.style.color = '#e74c3c';
            }
        }

        this.updateProgressPercentage(monthlyGoal, hoursDone);
    }

    updateProgressPercentage(monthlyGoal, hoursDone) {
        const progressPercentElement = document.getElementById('progress-percent');
        if (!progressPercentElement) return;

        let percent = 0;
        if (monthlyGoal > 0) {
            percent = (hoursDone / monthlyGoal) * 100;
        }

        const displayPercent = Math.min(100, Math.max(0, percent));
        
        // Actualizar con emojis y colores
        let emoji = '🔴';
        let color = '#e74c3c';
        
        if (displayPercent >= 100) {
            emoji = '✅';
            color = '#27ae60';
        } else if (displayPercent >= 75) {
            emoji = '🟡';
            color = '#f39c12';
        } else if (displayPercent >= 50) {
            emoji = '🟠';
            color = '#f39c12';
        }

        progressPercentElement.innerHTML = `${emoji} ${displayPercent.toFixed(1)}%`;
        progressPercentElement.style.color = color;
        progressPercentElement.style.fontWeight = 'bold';

        // Actualizar barra de progreso si existe
        this.updateProgressBar(displayPercent);
    }

    updateProgressBar(percent) {
        let progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            // Crear barra de progreso si no existe
            const summaryCard = document.querySelector('.summary-card:last-child .card-content');
            if (summaryCard) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.innerHTML = '<div class="progress-fill"></div>';
                summaryCard.appendChild(progressBar);
            }
        }

        if (progressBar) {
            const progressFill = progressBar.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${percent}%`;
                
                // Cambiar color según el progreso
                if (percent >= 100) {
                    progressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
                } else if (percent >= 75) {
                    progressFill.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
                } else if (percent >= 50) {
                    progressFill.style.background = 'linear-gradient(90deg, #e67e22, #f39c12)';
                } else {
                    progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #e67e22)';
                }
            }
        }
    }

    loadConfig() {
        const config = this.storage.getConfig();
        const precursorType = document.getElementById('precursor-type');
        const customHours = document.getElementById('custom-hours');

        if (precursorType && config.precursorType) {
            precursorType.value = config.precursorType;
        }

        if (customHours && config.customHours) {
            customHours.value = config.customHours;
        }

        this.handlePrecursorTypeChange(config.precursorType);
        this.updateGoalDisplay();
        console.log('⚙️ Configuración cargada:', config);
    }

    saveConfig() {
        console.log('💾 Iniciando guardado de configuración...');
        
        const precursorType = document.getElementById('precursor-type').value;
        const customHoursInput = document.getElementById('custom-hours');
        const customHours = customHoursInput ? parseInt(customHoursInput.value) : 50;

        // Validaciones exhaustivas
        if (precursorType === 'custom') {
            if (isNaN(customHours) || customHours <= 0) {
                this.showNotification('❌ Por favor ingresa un número válido para las horas personalizadas', 'error');
                customHoursInput.focus();
                customHoursInput.style.borderColor = '#e74c3c';
                return;
            }
            if (customHours > 200) {
                this.showNotification('❌ Las horas personalizadas no pueden ser más de 200', 'error');
                customHoursInput.focus();
                customHoursInput.style.borderColor = '#e74c3c';
                return;
            }
            if (customHours < 10) {
                this.showNotification('⚠️ Las horas personalizadas son muy bajas para precursorado', 'warning');
            }
        }

        const monthlyGoal = precursorType === 'custom' ? customHours : parseInt(precursorType);
        
        const config = {
            precursorType: precursorType,
            customHours: customHours,
            monthlyGoal: monthlyGoal,
            lastConfigUpdate: new Date().toISOString()
        };

        if (this.storage.saveConfig(config)) {
            this.showNotification('✅ Configuración guardada correctamente', 'success');
            this.updateGoalDisplay();
            this.calendar.updateStats();
            
            // Efecto visual mejorado en el botón
            const saveButton = document.getElementById('save-config');
            const originalHTML = saveButton.innerHTML;
            const originalBackground = saveButton.style.background;
            
            saveButton.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
            saveButton.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            saveButton.disabled = true;
            
            setTimeout(() => {
                saveButton.innerHTML = originalHTML;
                saveButton.style.background = originalBackground;
                saveButton.disabled = false;
            }, 2000);
            
        } else {
            this.showNotification('❌ Error al guardar la configuración', 'error');
        }
    }

    // ===== NUEVO: MÉTODOS PARA INSTALADOR PWA =====
    initializeAppInstaller() {
        // Verificar si el script de instalación ya se cargó
        if (typeof window.appInstaller !== 'undefined') {
            this.appInstaller = window.appInstaller;
            console.log('📱 Instalador PWA inicializado');
            
            // Agregar botón de instalación a la UI si es necesario
            setTimeout(() => {
                this.addInstallButtonToUI();
            }, 2000);
        } else {
            console.log('⚠️ Instalador PWA no disponible');
        }
    }

    addInstallButtonToUI() {
        const header = document.querySelector('.app-header');
        if (header && !document.getElementById('install-btn-header')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'install-btn-header';
            installBtn.className = 'btn btn-success';
            installBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Instalar App';
            installBtn.style.cssText = `
                margin-left: 15px;
                padding: 8px 16px;
                font-size: 0.9rem;
                border-radius: 20px;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                border: none;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            installBtn.addEventListener('mouseenter', () => {
                installBtn.style.transform = 'scale(1.05)';
                installBtn.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.4)';
            });
            
            installBtn.addEventListener('mouseleave', () => {
                installBtn.style.transform = 'scale(1)';
                installBtn.style.boxShadow = 'none';
            });
            
            installBtn.addEventListener('click', () => {
                if (this.appInstaller && this.appInstaller.deferredPrompt) {
                    this.appInstaller.installApp();
                } else {
                    this.showNotification(
                        'Para instalar: Usa el menú de tu navegador (⋮ o ⋯) y busca "Instalar aplicación" o "Agregar a pantalla de inicio"', 
                        'info'
                    );
                }
            });
            
            header.appendChild(installBtn);
        }
    }

    // ===== MÉTODO DE NOTIFICACIONES =====
    showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.parentNode.removeChild(notification), 300);
            }
        }, 4000);
    }

    // Método para exportar datos
    exportData() {
        const data = {
            config: this.storage.getConfig(),
            hours: this.getAllHoursData(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `precursor-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('📊 Datos exportados correctamente', 'success');
    }

    getAllHoursData() {
        // Obtener todos los meses con datos
        const allData = {};
        const currentDate = new Date();
        
        // Buscar datos de los últimos 12 meses
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            
            const monthHours = this.storage.getMonthHours(year, month);
            if (Object.keys(monthHours).length > 0) {
                allData[monthKey] = monthHours;
            }
        }
        
        return allData;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM completamente cargado - Iniciando aplicación');
    window.precursorApp = new PrecursorApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('💥 Error global:', e.error);
});

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: #ecf0f1;
        border-radius: 10px;
        margin: 10px 0;
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .progress-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.5s ease, background 0.5s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(style);