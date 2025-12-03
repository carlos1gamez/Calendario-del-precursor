// Zcharts.js - VERSIÓN MEJORADA Y CORREGIDA
class ChartManager {
    constructor(storage) {
        this.storage = storage;
        this.charts = {};
        this.currentPeriod = 'month';
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Cargar gráficos después de un breve delay para asegurar que el DOM esté listo
        setTimeout(() => this.loadCharts(), 100);
    }

    setupEventListeners() {
        // Event listener para selector de periodo
        const chartPeriod = document.getElementById('chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadCharts(e.target.value);
            });
        }

        // Event listener para botón de actualizar
        const refreshCharts = document.getElementById('refresh-charts');
        if (refreshCharts) {
            refreshCharts.addEventListener('click', () => {
                this.refreshCharts();
            });
        }

        console.log('✅ Event listeners de gráficos configurados');
    }

    refreshCharts() {
        const refreshBtn = document.getElementById('refresh-charts');
        
        // Efecto de loading
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        refreshBtn.disabled = true;

        this.loadCharts(this.currentPeriod);

        // Restaurar botón después de 1 segundo
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
            refreshBtn.disabled = false;
            
            // Efecto visual de éxito
            refreshBtn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            setTimeout(() => {
                refreshBtn.style.background = '';
            }, 1000);
        }, 1000);
    }

    loadCharts(period = 'month') {
        console.log('📊 Cargando gráficos para periodo:', period);
        
        try {
            const data = this.getChartData(period);
            this.renderAllCharts(data);
            this.showNotification('Gráficos actualizados correctamente', 'success');
        } catch (error) {
            console.error('❌ Error cargando gráficos:', error);
            this.showNotification('Error al cargar los gráficos', 'error');
        }
    }

    getChartData(period) {
        const currentDate = new Date();
        
        switch(period) {
            case 'last-month':
                return this.getLastMonthData();
            case '3months':
                return this.getMultipleMonthsData(3);
            case '6months':
                return this.getMultipleMonthsData(6);
            case 'year':
                return this.getYearlyData();
            default:
                return this.getCurrentMonthData();
        }
    }

    getCurrentMonthData() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        const monthStats = this.storage.getMonthStats(year, month);
        const typeStats = this.storage.getPredicacionTypeStats(year, month);
        const weeklyStats = this.storage.getWeeklyStats(year, month);
        const config = this.storage.getConfig();

        console.log('📈 Datos del mes actual:', { monthStats, typeStats, weeklyStats });

        return {
            type: 'month',
            monthStats: monthStats,
            typeStats: typeStats,
            weeklyStats: weeklyStats,
            config: config,
            year: year,
            month: month
        };
    }

    getLastMonthData() {
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const year = lastMonth.getFullYear();
        const month = lastMonth.getMonth() + 1;
        
        return {
            type: 'month',
            monthStats: this.storage.getMonthStats(year, month),
            typeStats: this.storage.getPredicacionTypeStats(year, month),
            weeklyStats: this.storage.getWeeklyStats(year, month),
            config: this.storage.getConfig(),
            year: year,
            month: month
        };
    }

    getMultipleMonthsData(monthsCount) {
        const monthsData = this.storage.getMultipleMonthsStats(monthsCount);
        return {
            type: 'multiple',
            months: monthsData,
            config: this.storage.getConfig()
        };
    }

    getYearlyData() {
        const currentDate = new Date();
        const yearlyData = this.storage.getYearlyStats(currentDate.getFullYear());
        return {
            type: 'year',
            yearlyStats: yearlyData,
            config: this.storage.getConfig()
        };
    }

    renderAllCharts(data) {
        this.renderProgressChart(data);
        this.renderTypeDistributionChart(data);
        this.renderComparisonChart(data);
        this.renderDailyAverageChart(data);
        this.renderWeeklyTrendChart(data);
    }

    renderProgressChart(data) {
        const ctx = document.getElementById('progressChart');
        if (!ctx) {
            console.error('❌ No se encontró el canvas progressChart');
            this.showChartError('progressChart', 'Gráfico de progreso no disponible');
            return;
        }

        // Destruir gráfico anterior de forma segura
        if (this.charts.progressChart) {
            try {
                this.charts.progressChart.destroy();
            } catch (error) {
                console.warn('⚠️ Error destruyendo gráfico anterior:', error);
            }
        }

        const goal = data.config?.monthlyGoal || 50;
        const completed = data.monthStats?.totalHours || 0;
        const remaining = Math.max(0, goal - completed);

        // Validar datos
        if (goal <= 0) {
            this.showChartError('progressChart', 'Meta mensual no configurada');
            return;
        }

        try {
            this.charts.progressChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        `Completado: ${completed.toFixed(1)}h`,
                        `Restante: ${remaining.toFixed(1)}h`
                    ],
                    datasets: [{
                        data: [completed, remaining],
                        backgroundColor: [
                            completed >= goal ? '#27ae60' : '#3498db',
                            '#e74c3c'
                        ],
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverOffset: 10,
                        hoverBackgroundColor: [
                            completed >= goal ? '#219a52' : '#2980b9',
                            '#c0392b'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const percentage = ((context.parsed / goal) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1000
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error creando gráfico de progreso:', error);
            this.showChartError('progressChart', 'Error al crear el gráfico');
        }
    }

    renderTypeDistributionChart(data) {
        const ctx = document.getElementById('typeDistributionChart');
        if (!ctx) {
            console.error('❌ No se encontró el canvas typeDistributionChart');
            return;
        }

        if (this.charts.typeDistributionChart) {
            this.charts.typeDistributionChart.destroy();
        }

        const typeStats = data.typeStats || {};
        const labels = Object.keys(typeStats);
        const hours = Object.values(typeStats).map(stats => stats.hours);
        const days = Object.values(typeStats).map(stats => stats.days);

        // Colores para los tipos de predicación
        const backgroundColors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#34495e', '#e67e22', '#16a085'
        ];

        this.charts.typeDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels.length > 0 ? labels : ['Sin datos'],
                datasets: [{
                    data: hours.length > 0 ? hours : [1],
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 11,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                const dayCount = days[context.dataIndex] || 0;
                                return `${label}: ${value}h (${percentage}%) - ${dayCount} días`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    renderComparisonChart(data) {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;

        if (this.charts.comparisonChart) {
            this.charts.comparisonChart.destroy();
        }

        if (data.type === 'multiple' && data.months) {
            const labels = data.months.map(item => 
                `${item.monthName.substring(0, 3)} ${item.year.toString().substring(2)}`
            );
            const hours = data.months.map(item => item.totalHours);

            this.charts.comparisonChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Horas Totales',
                        data: hours,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: 'rgba(41, 128, 185, 1)',
                        borderWidth: 2,
                        borderRadius: 5,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Horas',
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Meses',
                                font: {
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    renderDailyAverageChart(data) {
        const ctx = document.getElementById('dailyAverageChart');
        if (!ctx) return;

        if (this.charts.dailyAverageChart) {
            this.charts.dailyAverageChart.destroy();
        }

        const avg = data.monthStats?.averagePerDay || 0;
        const goalAvg = (data.config.monthlyGoal || 50) / 30;
        const goalPercentage = goalAvg > 0 ? (avg / goalAvg) * 100 : 0;

        this.charts.dailyAverageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tu Promedio', 'Meta Diaria'],
                datasets: [{
                    data: [avg, goalAvg],
                    backgroundColor: [
                        avg >= goalAvg ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)',
                        'rgba(52, 152, 219, 0.6)'
                    ],
                    borderColor: [
                        avg >= goalAvg ? 'rgba(39, 174, 96, 1)' : 'rgba(231, 76, 60, 1)',
                        'rgba(41, 128, 185, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Horas por Día',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.toFixed(2);
                                if (context.label === 'Tu Promedio') {
                                    return `Promedio: ${value}h (${goalPercentage.toFixed(1)}% de la meta)`;
                                }
                                return `Meta: ${value}h`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderWeeklyTrendChart(data) {
        const ctx = document.getElementById('weeklyTrendChart');
        if (!ctx) return;

        if (this.charts.weeklyTrendChart) {
            this.charts.weeklyTrendChart.destroy();
        }

        const weeklyStats = data.weeklyStats || {};
        const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
        const hours = labels.map((_, index) => weeklyStats[`semana${index + 1}`]?.hours || 0);

        this.charts.weeklyTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Horas por Semana',
                    data: hours,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Horas',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Semanas del Mes',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Horas: ${context.parsed}h`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Método para mostrar errores en gráficos
    showChartError(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.style.display = 'none';
            const parent = canvas.parentElement;
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chart-error';
            errorDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            `;
            errorDiv.style.cssText = `
                text-align: center;
                padding: 2rem;
                color: #7f8c8d;
                background: #f8f9fa;
                border-radius: 8px;
                border: 2px dashed #bdc3c7;
            `;
            parent.appendChild(errorDiv);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'chart-line' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            font-size: 0.9rem;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.parentNode.removeChild(notification), 300);
            }
        }, 3000);
    }

    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}