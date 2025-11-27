// Vstorage.js - VERSIÓN COMPLETAMENTE CORREGIDA
class StorageManager {
    constructor() {
        this.prefix = 'precursorApp_';
        this.init();
    }

    init() {
        // Inicializar configuración por defecto si no existe
        if (!this.getConfig()) {
            const defaultConfig = {
                precursorType: '50',
                customHours: 50,
                monthlyGoal: 50
            };
            this.saveConfig(defaultConfig);
        }
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

    // Guardar configuración
    saveConfig(config) {
        return this.set('config', config);
    }

    // Obtener configuración
    getConfig() {
        return this.get('config', {
            precursorType: '50',
            customHours: 50,
            monthlyGoal: 50
        });
    }

    // Guardar horas del día
    saveDayHours(year, month, day, hoursData) {
        const monthHours = this.getMonthHours(year, month);
        
        if (hoursData.hours === 0) {
            // Eliminar registro si las horas son 0
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
    }

    // Obtener estadísticas del mes
    getMonthStats(year, month) {
        const monthHours = this.getMonthHours(year, month);
        let totalHours = 0;
        let daysWithHours = 0;

        Object.values(monthHours).forEach(day => {
            if (day.hours > 0) {
                totalHours += day.hours;
                daysWithHours++;
            }
        });

        return {
            totalHours: parseFloat(totalHours.toFixed(2)),
            daysWithHours: daysWithHours,
            averagePerDay: daysWithHours > 0 ? parseFloat((totalHours / daysWithHours).toFixed(2)) : 0
        };
    }

    // Limpiar todos los datos
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }}
