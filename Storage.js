js/storage.js
class StorageManager {
    constructor() {
        this.prefix = 'precursorApp_';
    }

    // Guardar datos
    set(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    // Obtener datos
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            return defaultValue;
        }
    }

    // Eliminar datos
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error eliminando datos:', error);
            return false;
        }
    }

    // Obtener configuración
    getConfig() {
        return this.get('config', {
            precursorType: '50',
            customHours: 50,
            monthlyGoal: 50
        });
    }

    // Guardar configuración
    saveConfig(config) {
        return this.set('config', config);
    }

    // Obtener horas por mes
    getMonthHours(year, month) {
        const key = `hours_${year}_${month}`;
        return this.get(key, {});
    }

    // Guardar horas por mes
    saveMonthHours(year, month, hours) {
        const key = `hours_${year}_${month}`;
        return this.set(key, hours);
    }

    // Obtener horas de un día específico
    getDayHours(year, month, day) {
        const monthHours = this.getMonthHours(year, month);
        return monthHours[day] || null;
    }// MODIFICAR este método para guardar datos de predicación
saveDayHours(year, month, day, hoursData) {
    const monthHours = this.getMonthHours(year, month);
    
    if (hoursData.hours === 0) {
        // Si las horas son 0, eliminar el registro
        delete monthHours[day];
    } else {
        // Actualizar o crear registro con datos completos de predicación
        monthHours[day] = {
            hours: hoursData.hours,
            notes: hoursData.notes || '',
            tipo: hoursData.tipo || '',
            publicaciones: hoursData.publicaciones || 0,
            timestamp: new Date().toISOString()
        };
    }

    return this.saveMonthHours(year, month, monthHours);
}

    // Guardar horas de un día
    saveDayHours(year, month, day, hoursData) {
        const monthHours = this.getMonthHours(year, month);
        
        if (hoursData.hours === 0) {
            // Si las horas son 0, eliminar el registro
            delete monthHours[day];
        } else {
            // Actualizar o crear registro
            monthHours[day] = {
                hours: hoursData.hours,
                notes: hoursData.notes || '',
                timestamp: new Date().toISOString()
            };
        }

        return this.saveMonthHours(year, month, monthHours);
    }

    // Obtener estadísticas del mes
    getMonthStats(year, month) {
        const monthHours = this.getMonthHours(year, month);
        let totalHours = 0;
        let daysWithHours = 0;

        Object.values(monthHours).forEach(day => {
            totalHours += day.hours;
            daysWithHours++;
        });

        return {
            totalHours,
            daysWithHours,
            averagePerDay: daysWithHours > 0 ? totalHours / daysWithHours : 0
        };
    }
}