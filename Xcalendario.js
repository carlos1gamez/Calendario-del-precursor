// Xcalendario.js - VERSIÓN COMPLETAMENTE CORREGIDA
class Calendar {
    constructor(storage) {
        this.storage = storage;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.updateMonthDisplay();
        this.generateCalendar();
        this.updateStats();
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) {
            console.error('No se encontró el elemento calendar-grid');
            return;
        }
        
        calendarGrid.innerHTML = '';

        // Obtener información del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Ajustar para que la semana empiece en Lunes (0=Lunes, 6=Domingo)
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;

        // Agregar días vacíos al inicio
        for (let i = 0; i < adjustedStartingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Obtener horas guardadas para este mes
        const monthHours = this.storage.getMonthHours(this.currentYear, this.currentMonth + 1);

        // Generar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, monthHours);
            calendarGrid.appendChild(dayElement);
        }
    }

    createDayElement(day, monthHours) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Contenido del día
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <button class="add-hours-btn" title="Agregar horas">
                <i class="fas fa-plus"></i>
            </button>
        `;

        // Verificar si es hoy
        const today = new Date();
        if (this.currentYear === today.getFullYear() && 
            this.currentMonth === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Verificar si tiene horas registradas
        const dayData = monthHours[day];
        if (dayData && dayData.hours > 0) {
            dayElement.classList.add('has-hours');
            const hoursBadge = document.createElement('div');
            hoursBadge.className = 'hours-badge';
            hoursBadge.textContent = dayData.hours + 'h';
            dayElement.appendChild(hoursBadge);
            
            // Agregar tooltip con notas si existen
            if (dayData.notes) {
                dayElement.title = `Notas: ${dayData.notes}`;
            }
        }

        // Event listeners
        const addButton = dayElement.querySelector('.add-hours-btn');
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectDate(day);
        });

        dayElement.addEventListener('click', () => {
            this.selectDate(day);
        });

        return dayElement;
    }

    selectDate(day) {
        this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
        this.openHoursModal();
    }

    openHoursModal() {
        const modal = document.getElementById('hours-modal');
        const modalDate = document.getElementById('modal-date');
        const hoursCount = document.getElementById('hours-count');
        const hoursNotes = document.getElementById('hours-notes');
        const deleteButton = document.getElementById('delete-hours');

        if (!modal || !modalDate) {
            console.error('Elementos del modal no encontrados');
            return;
        }

        // Formatear fecha mostrada
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        modalDate.textContent = this.selectedDate.toLocaleDateString('es-ES', options);

        // Cargar datos existentes si los hay
        const existingData = this.storage.getDayHours(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate()
        );

        if (existingData && existingData.hours > 0) {
            hoursCount.value = existingData.hours;
            hoursNotes.value = existingData.notes || '';
            deleteButton.style.display = 'inline-flex';
        } else {
            hoursCount.value = '1';
            hoursNotes.value = '';
            deleteButton.style.display = 'none';
        }

        // Mostrar modal
        modal.classList.add('show');
        hoursCount.focus();
    }

    closeHoursModal() {
        const modal = document.getElementById('hours-modal');
        modal.classList.remove('show');
        this.selectedDate = null;
    }

    saveHours() {
        if (!this.selectedDate) {
            this.showNotification('No hay fecha seleccionada', 'error');
            return;
        }

        const hoursCount = document.getElementById('hours-count');
        const hoursNotes = document.getElementById('hours-notes');
        const predicacionType = document.getElementById('predicacion-type');

        const hours = parseFloat(hoursCount.value);
        const notes = hoursNotes.value.trim();
        const type = predicacionType.value;

        if (isNaN(hours) || hours <= 0) {
            this.showNotification('Por favor ingresa un número válido de horas (mayor a 0)', 'error');
            hoursCount.focus();
            hoursCount.style.borderColor = '#e74c3c';
            return;
        }

        if (hours > 24) {
            this.showNotification('Las horas no pueden ser más de 24 en un día', 'error');
            hoursCount.focus();
            return;
        }

        if (!type) {
            this.showNotification('Por favor selecciona un tipo de predicación', 'error');
            predicacionType.focus();
            predicacionType.style.borderColor = '#e74c3c';
            return;
        }

        const success = this.storage.saveDayHours(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate(),
            {
                hours: hours,
                notes: notes,
                predicacionType: type
            }
        );

        if (success) {
            this.closeHoursModal();
            this.generateCalendar();
            this.updateStats();
            this.showNotification(`¡Perfecto! ${hours} horas guardadas para ${type}`, 'success');
        } else {
            this.showNotification('Error al guardar las horas', 'error');
        }
    }

    deleteHours() {
        if (!this.selectedDate) return;

        if (!confirm('¿Estás seguro de que quieres eliminar las horas de este día?')) {
            return;
        }

        const success = this.storage.saveDayHours(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate(),
            { hours: 0, notes: '', predicacionType: '' }
        );

        if (success) {
            this.closeHoursModal();
            this.generateCalendar();
            this.updateStats();
            this.showNotification('Horas eliminadas correctamente', 'success');
        } else {
            this.showNotification('Error al eliminar las horas', 'error');
        }
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.updateMonthDisplay();
        this.generateCalendar();
        this.updateStats();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateMonthDisplay();
        this.generateCalendar();
        this.updateStats();
    }

    updateMonthDisplay() {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const currentMonthDisplay = document.getElementById('current-month-display');
        const currentMonthHeader = document.getElementById('current-month');

        const monthText = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        if (currentMonthDisplay) {
            currentMonthDisplay.textContent = monthText;
        }

        if (currentMonthHeader) {
            currentMonthHeader.textContent = monthText;
        }
    }

    updateStats() {
        const config = this.storage.getConfig();
        const stats = this.storage.getMonthStats(this.currentYear, this.currentMonth + 1);

        const monthlyGoal = document.getElementById('monthly-goal');
        const hoursDone = document.getElementById('hours-done');
        const hoursRemaining = document.getElementById('hours-remaining');
        const progressPercent = document.getElementById('progress-percent');

        if (!monthlyGoal || !hoursDone || !hoursRemaining || !progressPercent) {
            console.error('Elementos de estadísticas no encontrados');
            return;
        }

        // Usar la meta de la configuración actual
        const currentMonthlyGoal = config.monthlyGoal || 50;

        // Actualizar elementos
        monthlyGoal.textContent = currentMonthlyGoal;
        hoursDone.textContent = stats.totalHours.toFixed(1);
        
        const remaining = Math.max(0, currentMonthlyGoal - stats.totalHours);
        hoursRemaining.textContent = remaining.toFixed(1);

        // Calcular y actualizar porcentaje
        const percent = currentMonthlyGoal > 0 ? (stats.totalHours / currentMonthlyGoal) * 100 : 0;
        const displayPercent = Math.min(100, Math.max(0, percent));
        
        if (displayPercent >= 100) {
            progressPercent.style.color = '#27ae60';
            progressPercent.innerHTML = '✅ ' + displayPercent.toFixed(1) + '%';
        } else if (displayPercent >= 75) {
            progressPercent.style.color = '#f39c12';
            progressPercent.innerHTML = '🟡 ' + displayPercent.toFixed(1) + '%';
        } else if (displayPercent >= 50) {
            progressPercent.style.color = '#f39c12';
            progressPercent.innerHTML = '🟠 ' + displayPercent.toFixed(1) + '%';
        } else {
            progressPercent.style.color = '#e74c3c';
            progressPercent.innerHTML = '🔴 ' + displayPercent.toFixed(1) + '%';
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // MEJORA: Método auxiliar para días vacíos
    createEmptyDayElement() {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        emptyDay.innerHTML = '<div class="day-number"></div>';
        return emptyDay;
    }
}

// Agregar estilos para las notificaciones
const notificationStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

// Solo agregar estilos si no existen
if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}