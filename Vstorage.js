class StorageManager {
    constructor() {
        this.prefix = 'precursorApp_';
        this.init();
    }

    init() {
        if (!this.getConfig()) {
            const defaultConfig = {
                precursorType: '50',
                customHours: 50,
                monthlyGoal: 50
            };
            this.saveConfig(defaultConfig);
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            return defaultValue;
        }
    }

    saveConfig(config) {
        return this.set('config', config);
    }

    getConfig() {
        return this.get('config', {
            precursorType: '50',
            customHours: 50,
            monthlyGoal: 50
        });
    }

    saveDayHours(year, month, day, hoursData) {
        const monthHours = this.getMonthHours(year, month);
        
        if (hoursData.hours === 0) {
            delete monthHours[day];
        } else {
            monthHours[day] = {
                hours: hoursData.hours,
                notes: hoursData.notes || '',
                predicacionType: hoursData.predicacionType || '',
                timestamp: new Date().toISOString()
            };
        }

        return this.saveMonthHours(year, month, monthHours);
    }

    getMonthHours(year, month) {
        const key = `hours_${year}_${month}`;
        return this.get(key, {});
    }

    saveMonthHours(year, month, hours) {
        const key = `hours_${year}_${month}`;
        return this.set(key, hours);
    }

    getDayHours(year, month, day) {
        const monthHours = this.getMonthHours(year, month);
        return monthHours[day] || null;
    }

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

    getPredicacionTypeStats(year, month) {
        const monthHours = this.getMonthHours(year, month);
        const typeStats = {};

        Object.values(monthHours).forEach(day => {
            if (day.hours > 0 && day.predicacionType) {
                const type = day.predicacionType;
                if (!typeStats[type]) {
                    typeStats[type] = {
                        hours: 0,
                        days: 0
                    };
                }
                typeStats[type].hours += day.hours;
                typeStats[type].days += 1;
            }
        });

        return typeStats;
    }

    // NUEVO: Obtener datos para múltiples meses
    getMultipleMonthsStats(monthsCount = 6) {
        const currentDate = new Date();
        const stats = [];
        
        for (let i = 0; i < monthsCount; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const monthStats = this.getMonthStats(year, month);
            const typeStats = this.getPredicacionTypeStats(year, month);
            
            stats.push({
                year: year,
                month: month,
                monthName: date.toLocaleDateString('es-ES', { month: 'long' }),
                ...monthStats,
                typeStats: typeStats
            });
        }
        
        return stats.reverse();
    }

    // NUEVO: Obtener datos semanales
    getWeeklyStats(year, month) {
        const monthHours = this.getMonthHours(year, month);
        const weeklyStats = {
            semana1: { hours: 0, days: 0 },
            semana2: { hours: 0, days: 0 },
            semana3: { hours: 0, days: 0 },
            semana4: { hours: 0, days: 0 },
            semana5: { hours: 0, days: 0 }
        };

        Object.entries(monthHours).forEach(([day, data]) => {
            if (data.hours > 0) {
                const dayNum = parseInt(day);
                let week;
                
                if (dayNum <= 7) week = 'semana1';
                else if (dayNum <= 14) week = 'semana2';
                else if (dayNum <= 21) week = 'semana3';
                else if (dayNum <= 28) week = 'semana4';
                else week = 'semana5';
                
                weeklyStats[week].hours += data.hours;
                weeklyStats[week].days += 1;
            }
        });

        return weeklyStats;
    }

    // NUEVO: Obtener datos anuales
    getYearlyStats(year) {
        const yearlyStats = {
            totalHours: 0,
            months: {},
            typeStats: {}
        };

        for (let month = 1; month <= 12; month++) {
            const monthStats = this.getMonthStats(year, month);
            const typeStats = this.getPredicacionTypeStats(year, month);
            
            yearlyStats.totalHours += monthStats.totalHours;
            yearlyStats.months[month] = monthStats;
            
            // Consolidar estadísticas por tipo
            Object.entries(typeStats).forEach(([type, stats]) => {
                if (!yearlyStats.typeStats[type]) {
                    yearlyStats.typeStats[type] = { hours: 0, days: 0 };
                }
                yearlyStats.typeStats[type].hours += stats.hours;
                yearlyStats.typeStats[type].days += stats.days;
            });
        }

        return yearlyStats;
    }

    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}