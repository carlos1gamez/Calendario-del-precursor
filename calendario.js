// js/calendar.js
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
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = '';

        // Obtener información del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

        // Ajustar para que la semana empiece en Lunes (1) en lugar de Domingo (0)
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;

        // Agregar días vacíos al inicio para alinear el primer día
        for (let i = 0; i < adjustedStartingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Obtener horas guardadas para este mes
        const monthHours = this.storage.getMonthHours(this.currentYear, this.currentMonth + 1);

        // Generar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.innerHTML = `<span class="day-number">${day}</span>`;

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
                    dayElement.title = dayData.notes;
                }
            }

            // Event listener para hacer click en el día
            dayElement.addEventListener('click', () => {
                this.selectDate(day);
            });

            calendarGrid.appendChild(dayElement);
        }

        // Actualizar estadísticas
        this.updateStats();
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
            hoursCount.value = 1;
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
        if (!this.selectedDate) return;

        const hoursCount = document.getElementById('hours-count');
        const hoursNotes = document.getElementById('hours-notes');

        const hours = parseFloat(hoursCount.value);
        const notes = hoursNotes.value.trim();

        if (isNaN(hours) || hours < 0) {
            alert('Por favor ingresa un número válido de horas');
            return;
        }

        const success = this.storage.saveDayHours(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate(),
            {
                hours: hours,
                notes: notes
            }
        );

        if (success) {
            this.closeHoursModal();
            this.generateCalendar(); // Refrescar calendario
            this.showNotification('Horas guardadas correctamente', 'success');
        } else {
            this.showNotification('Error al guardar las horas', 'error');
        }
    }

    deleteHours() {
        if (!this.selectedDate || !confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            return;
        }

        const success = this.storage.saveDayHours(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            this.selectedDate.getDate(),
            { hours: 0, notes: '' }
        );

        if (success) {
            this.closeHoursModal();
            this.generateCalendar(); // Refrescar calendario
            this.showNotification('Registro eliminado correctamente', 'success');
        } else {
            this.showNotification('Error al eliminar el registro', 'error');
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
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateMonthDisplay();
        this.generateCalendar();
    }

    updateMonthDisplay() {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const currentMonthDisplay = document.getElementById('current-month-display');
        const currentMonthHeader = document.getElementById('current-month');

        if (currentMonthDisplay) {
            currentMonthDisplay.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        if (currentMonthHeader) {
            currentMonthHeader.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
    }

    updateStats() {
        const config = this.storage.getConfig();
        const stats = this.storage.getMonthStats(this.currentYear, this.currentMonth + 1);

        const monthlyGoal = document.getElementById('monthly-goal');
        const hoursDone = document.getElementById('hours-done');
        const hoursRemaining = document.getElementById('hours-remaining');
        const progressPercent = document.getElementById('progress-percent');

        if (monthlyGoal) {
            monthlyGoal.textContent = config.monthlyGoal;
        }

        if (hoursDone) {
            hoursDone.textContent = stats.totalHours.toFixed(1);
        }

        if (hoursRemaining) {
            const remaining = Math.max(0, config.monthlyGoal - stats.totalHours);
            hoursRemaining.textContent = remaining.toFixed(1);
        }

        if (progressPercent) {
            const percent = config.monthlyGoal > 0 ? (stats.totalHours / config.monthlyGoal) * 100 : 0;
            progressPercent.textContent = Math.min(100, Math.max(0, percent)).toFixed(1) + '%';
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

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);