// Zreports.js - VERSIÓN MEJORADA Y CORREGIDA
class ReportManager {
    constructor(storage) {
        this.storage = storage;
        this.currentReportPeriod = 'current-month';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReportPreview();
    }

    setupEventListeners() {
        const reportPeriod = document.getElementById('report-period');
        const generatePdf = document.getElementById('generate-pdf');
        const startMonth = document.getElementById('start-month');
        const endMonth = document.getElementById('end-month');

        if (reportPeriod) {
            reportPeriod.addEventListener('change', (e) => {
                this.currentReportPeriod = e.target.value;
                this.handleReportPeriodChange(e.target.value);
            });
        }

        if (generatePdf) {
            generatePdf.addEventListener('click', () => {
                this.generatePDF();
            });
        }

        if (startMonth && endMonth) {
            [startMonth, endMonth].forEach(input => {
                input.addEventListener('change', () => {
                    if (document.getElementById('report-period').value === 'custom') {
                        this.currentReportPeriod = 'custom';
                        this.loadReportPreview('custom');
                    }
                });
            });
        }

        // Establecer valores por defecto
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        
        if (startMonth) startMonth.value = `${currentYear}-${currentMonth}`;
        if (endMonth) endMonth.value = `${currentYear}-${currentMonth}`;
    }

    handleReportPeriodChange(period) {
        const customPeriod = document.getElementById('custom-period');
        
        if (period === 'custom') {
            customPeriod.style.display = 'flex';
            this.loadReportPreview('custom');
        } else {
            customPeriod.style.display = 'none';
            this.loadReportPreview(period);
        }
    }

    loadReportPreview(period = 'current-month') {
        console.log('📋 Cargando vista previa del reporte:', period);
        this.currentReportPeriod = period;
        
        try {
            const reportData = this.getReportData(period);
            this.renderReportPreview(reportData);
            this.showNotification('Vista previa actualizada', 'success');
        } catch (error) {
            console.error('❌ Error cargando vista previa:', error);
            this.showNotification('Error al cargar la vista previa', 'error');
        }
    }

    getReportData(period) {
        switch(period) {
            case 'last-month':
                return this.getLastMonthReportData();
            case 'custom':
                return this.getCustomPeriodReportData();
            default:
                return this.getCurrentMonthReportData();
        }
    }

    getCurrentMonthReportData() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        return {
            period: 'current-month',
            monthStats: this.storage.getMonthStats(year, month),
            typeStats: this.storage.getPredicacionTypeStats(year, month),
            weeklyStats: this.storage.getWeeklyStats(year, month),
            monthHours: this.storage.getMonthHours(year, month),
            config: this.storage.getConfig(),
            year: year,
            month: month,
            monthName: currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        };
    }

    getLastMonthReportData() {
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const year = lastMonth.getFullYear();
        const month = lastMonth.getMonth() + 1;
        
        return {
            period: 'last-month',
            monthStats: this.storage.getMonthStats(year, month),
            typeStats: this.storage.getPredicacionTypeStats(year, month),
            weeklyStats: this.storage.getWeeklyStats(year, month),
            monthHours: this.storage.getMonthHours(year, month),
            config: this.storage.getConfig(),
            year: year,
            month: month,
            monthName: lastMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        };
    }

    getCustomPeriodReportData() {
        const startMonthInput = document.getElementById('start-month');
        const endMonthInput = document.getElementById('end-month');
        
        if (!startMonthInput || !endMonthInput) {
            console.warn('⚠️ Campos de periodo personalizado no encontrados, usando mes actual');
            return this.getCurrentMonthReportData();
        }

        const startValue = startMonthInput.value;
        const endValue = endMonthInput.value;
        
        if (!startValue || !endValue) {
            console.warn('⚠️ Periodo personalizado no especificado, usando mes actual');
            return this.getCurrentMonthReportData();
        }

        // Para simplificar, usamos el mes de inicio
        const [startYear, startMonth] = startValue.split('-').map(Number);
        
        return {
            period: 'custom',
            monthStats: this.storage.getMonthStats(startYear, startMonth),
            typeStats: this.storage.getPredicacionTypeStats(startYear, startMonth),
            weeklyStats: this.storage.getWeeklyStats(startYear, startMonth),
            monthHours: this.storage.getMonthHours(startYear, startMonth),
            config: this.storage.getConfig(),
            year: startYear,
            month: startMonth,
            monthName: new Date(startYear, startMonth - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        };
    }

    // NUEVO: Método para obtener datos según el periodo actual
    getCurrentReportData() {
        return this.getReportData(this.currentReportPeriod);
    }

    renderReportPreview(data) {
        this.renderExecutiveSummary(data);
        this.renderTypeDistribution(data);
        this.renderWeeklyActivity(data);
        this.renderMonthComparison(data);
        this.renderDailyDetail(data);
        this.updateReportMetadata(data);
    }

    renderExecutiveSummary(data) {
        const totalHours = data.monthStats.totalHours;
        const daysWorked = data.monthStats.daysWithHours;
        const avgDaily = data.monthStats.averagePerDay;
        const goal = data.config.monthlyGoal;
        const goalAchievement = goal > 0 ? (totalHours / goal) * 100 : 0;

        document.getElementById('report-total-hours').textContent = totalHours.toFixed(1);
        document.getElementById('report-days-worked').textContent = daysWorked;
        document.getElementById('report-avg-daily').textContent = avgDaily.toFixed(2);
        
        const achievementElement = document.getElementById('report-goal-achievement');
        if (goalAchievement >= 100) {
            achievementElement.innerHTML = '✅ ' + goalAchievement.toFixed(1) + '%';
        } else if (goalAchievement >= 75) {
            achievementElement.innerHTML = '🟡 ' + goalAchievement.toFixed(1) + '%';
        } else {
            achievementElement.innerHTML = '🔴 ' + goalAchievement.toFixed(1) + '%';
        }
    }

    renderTypeDistribution(data) {
        const container = document.getElementById('report-type-distribution');
        const typeStats = data.typeStats || {};
        
        let html = '';
        Object.entries(typeStats).forEach(([type, stats]) => {
            const percentage = data.monthStats.totalHours > 0 ? 
                ((stats.hours / data.monthStats.totalHours) * 100).toFixed(1) : 0;
            
            html += `
                <div class="type-item">
                    <span class="type-name">${type}</span>
                    <span class="type-stats">${stats.hours.toFixed(1)}h (${stats.days} días) - ${percentage}%</span>
                </div>
            `;
        });

        container.innerHTML = html || '<p class="no-data">No hay datos de tipos de predicación</p>';
    }

    renderWeeklyActivity(data) {
        const container = document.getElementById('report-weekly-activity');
        const weeklyStats = data.weeklyStats || {};
        
        let html = '';
        Object.entries(weeklyStats).forEach(([week, stats]) => {
            if (stats.hours > 0) {
                html += `
                    <div class="week-item">
                        <span class="week-name">${week.replace('semana', 'Semana ')}</span>
                        <span class="week-stats">${stats.hours.toFixed(1)}h - ${stats.days} días</span>
                    </div>
                `;
            }
        });

        container.innerHTML = html || '<p class="no-data">No hay datos semanales</p>';
    }

    renderMonthComparison(data) {
        const container = document.getElementById('report-comparison');
        const currentStats = data.monthStats;
        const lastMonthData = this.getLastMonthReportData();
        const lastMonthStats = lastMonthData.monthStats;

        const comparison = {
            current: currentStats.totalHours,
            previous: lastMonthStats.totalHours,
            difference: currentStats.totalHours - lastMonthStats.totalHours,
            percentage: lastMonthStats.totalHours > 0 ? 
                ((currentStats.totalHours - lastMonthStats.totalHours) / lastMonthStats.totalHours * 100) : 0
        };

        const differenceText = comparison.difference >= 0 ? 
            `+${comparison.difference.toFixed(1)}h` : 
            `${comparison.difference.toFixed(1)}h`;

        const percentageText = comparison.percentage >= 0 ?
            `+${comparison.percentage.toFixed(1)}%` :
            `${comparison.percentage.toFixed(1)}%`;

        const differenceColor = comparison.difference >= 0 ? '#27ae60' : '#e74c3c';
        const differenceEmoji = comparison.difference >= 0 ? '📈' : '📉';

        const html = `
            <div class="month-item">
                <span class="month-name">📅 ${data.monthName}</span>
                <span class="month-stats">${comparison.current.toFixed(1)}h</span>
            </div>
            <div class="month-item">
                <span class="month-name">📅 ${lastMonthData.monthName}</span>
                <span class="month-stats">${comparison.previous.toFixed(1)}h</span>
            </div>
            <div class="month-item" style="border-left-color: ${differenceColor}">
                <span class="month-name">${differenceEmoji} Diferencia</span>
                <span class="month-stats" style="color: ${differenceColor}">${differenceText} (${percentageText})</span>
            </div>
        `;

        container.innerHTML = html;
    }

    renderDailyDetail(data) {
        const container = document.getElementById('report-daily-detail');
        const monthHours = data.monthHours || {};
        
        let html = '';
        Object.entries(monthHours)
            .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
            .forEach(([day, dayData]) => {
                if (dayData.hours > 0) {
                    const typeIcon = this.getTypeIcon(dayData.predicacionType);
                    html += `
                        <div class="day-item">
                            <span class="day-date">📅 Día ${day}</span>
                            <span class="day-hours">${dayData.hours}h</span>
                            <span class="day-type">${typeIcon} ${dayData.predicacionType || 'Sin tipo'}</span>
                            <span class="day-notes">${dayData.notes || 'Sin notas'}</span>
                        </div>
                    `;
                }
            });

        container.innerHTML = html || '<p class="no-data">No hay registros diarios</p>';
    }

    getTypeIcon(type) {
        const icons = {
            'Informal': '💬',
            'Casa en Casa': '🏠',
            'Carta': '✉️',
            'Revisitas': '🔄',
            'Curso': '📚',
            'Día largo': '🌅'
        };
        return icons[type] || '📋';
    }

    updateReportMetadata(data) {
        const periodDisplay = document.getElementById('report-period-display');
        const reportDate = document.getElementById('report-date');

        if (periodDisplay) {
            periodDisplay.textContent = `Periodo: ${data.monthName}`;
        }

        if (reportDate) {
            reportDate.textContent = `Generado: ${new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
    }

    async generatePDF() {
        let generateBtn;
        
        try {
            generateBtn = document.getElementById('generate-pdf');
            if (!generateBtn) {
                throw new Error('Botón generar PDF no encontrado');
            }

            // Efecto de loading mejorado
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.7';

            // Verificar dependencias
            if (typeof window.jspdf === 'undefined') {
                throw new Error('Librería jsPDF no cargada. Asegúrate de incluir: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Configuración inicial
            pdf.setFont('helvetica');
            let yPosition = 20;
            const pageWidth = pdf.internal.pageSize.width;
            const margin = 20;

            // Obtener datos del reporte según el periodo seleccionado
            const reportData = this.getCurrentReportData();
            if (!reportData.monthStats) {
                throw new Error('Datos del reporte no disponibles');
            }

            console.log('📊 Generando PDF para periodo:', reportData.monthName);

            // ===== ENCABEZADO =====
            pdf.setFillColor(44, 62, 80);
            pdf.rect(0, 0, pageWidth, 60, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text('INFORME DE PRECURSORADO', pageWidth / 2, 25, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Periodo: ${reportData.monthName}`, pageWidth / 2, 35, { align: 'center' });
            pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 42, { align: 'center' });

            yPosition = 70;

            // ===== RESUMEN EJECUTIVO =====
            pdf.setTextColor(44, 62, 80);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RESUMEN EJECUTIVO', margin, yPosition);
            yPosition += 10;

            // Línea decorativa
            pdf.setDrawColor(52, 152, 219);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            // Estadísticas en cuadros
            const stats = [
                { 
                    label: 'Horas Totales', 
                    value: `${reportData.monthStats.totalHours.toFixed(1)}h`, 
                    color: [52, 152, 219] 
                },
                { 
                    label: 'Días Trabajados', 
                    value: reportData.monthStats.daysWithHours.toString(), 
                    color: [39, 174, 96] 
                },
                { 
                    label: 'Promedio Diario', 
                    value: `${reportData.monthStats.averagePerDay.toFixed(2)}h`, 
                    color: [243, 156, 18] 
                }
            ];

            const goalPercentage = reportData.config.monthlyGoal > 0 ? 
                ((reportData.monthStats.totalHours / reportData.config.monthlyGoal) * 100) : 0;
            
            stats.push({
                label: 'Cumplimiento Meta',
                value: `${goalPercentage.toFixed(1)}%`,
                color: goalPercentage >= 100 ? [39, 174, 96] : 
                       goalPercentage >= 75 ? [243, 156, 18] : [231, 76, 60]
            });

            const boxWidth = (pageWidth - 2 * margin - 15) / 4;
            stats.forEach((stat, index) => {
                const x = margin + index * (boxWidth + 5);
                
                // Fondo del cuadro
                pdf.setFillColor(...stat.color);
                pdf.roundedRect(x, yPosition, boxWidth, 25, 3, 3, 'F');
                
                // Texto
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.text(stat.label, x + boxWidth/2, yPosition + 8, { align: 'center' });
                
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(stat.value, x + boxWidth/2, yPosition + 18, { align: 'center' });
            });

            yPosition += 40;

            // ===== DISTRIBUCIÓN POR TIPO =====
            if (Object.keys(reportData.typeStats || {}).length > 0) {
                this.addSectionTitle(pdf, 'DISTRIBUCIÓN POR TIPO DE PREDICACIÓN', margin, yPosition);
                yPosition += 15;

                const typeStats = reportData.typeStats;
                Object.entries(typeStats).forEach(([type, stats]) => {
                    if (yPosition > 250) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    const percentage = reportData.monthStats.totalHours > 0 ? 
                        ((stats.hours / reportData.monthStats.totalHours) * 100).toFixed(1) : 0;
                    
                    pdf.setFontSize(10);
                    pdf.setTextColor(44, 62, 80);
                    pdf.text(`${type}:`, margin, yPosition);
                    pdf.text(`${stats.hours.toFixed(1)}h (${stats.days} días) - ${percentage}%`, pageWidth - margin, yPosition, { align: 'right' });
                    
                    // Barra de progreso
                    pdf.setFillColor(236, 240, 241);
                    pdf.rect(margin, yPosition + 3, pageWidth - 2 * margin, 4, 'F');
                    pdf.setFillColor(52, 152, 219);
                    pdf.rect(margin, yPosition + 3, (pageWidth - 2 * margin) * (percentage / 100), 4, 'F');
                    
                    yPosition += 12;
                });
                yPosition += 10;
            }

            // ===== ACTIVIDAD SEMANAL =====
            if (Object.keys(reportData.weeklyStats || {}).length > 0) {
                this.addSectionTitle(pdf, 'ACTIVIDAD SEMANAL', margin, yPosition);
                yPosition += 15;

                const weeklyStats = reportData.weeklyStats;
                Object.entries(weeklyStats).forEach(([week, stats]) => {
                    if (stats.hours > 0) {
                        pdf.setFontSize(10);
                        pdf.setTextColor(44, 62, 80);
                        pdf.text(`${week.replace('semana', 'Semana ')}:`, margin, yPosition);
                        pdf.text(`${stats.hours.toFixed(1)}h - ${stats.days} días`, pageWidth - margin, yPosition, { align: 'right' });
                        yPosition += 8;
                    }
                });
                yPosition += 10;
            }

            // ===== DETALLE DIARIO =====
            if (Object.keys(reportData.monthHours || {}).length > 0) {
                this.addSectionTitle(pdf, 'DETALLE DIARIO', margin, yPosition);
                yPosition += 10;

                const monthHours = reportData.monthHours;
                Object.entries(monthHours)
                    .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                    .forEach(([day, dayData]) => {
                        if (dayData.hours > 0) {
                            if (yPosition > 250) {
                                pdf.addPage();
                                yPosition = 20;
                            }
                            
                            pdf.setFontSize(9);
                            pdf.setTextColor(44, 62, 80);
                            
                            const dayText = `Día ${day}: ${dayData.hours}h - ${dayData.predicacionType || 'Sin tipo'}`;
                            pdf.text(dayText, margin, yPosition);
                            
                            if (dayData.notes) {
                                yPosition += 4;
                                pdf.setFontSize(8);
                                pdf.setTextColor(149, 165, 166);
                                const notesText = dayData.notes.length > 50 ? 
                                    dayData.notes.substring(0, 47) + '...' : dayData.notes;
                                pdf.text(`Notas: ${notesText}`, margin + 5, yPosition);
                                yPosition += 8;
                            } else {
                                yPosition += 8;
                            }
                        }
                    });
            }

            // ===== PIE DE PÁGINA =====
            pdf.setFontSize(8);
            pdf.setTextColor(149, 165, 166);
            pdf.text('Generado con Calendario del Precursor', pageWidth / 2, 290, { align: 'center' });

            // Generar nombre de archivo seguro
            const fileName = `informe-precursorado-${reportData.monthName.toLowerCase().replace(/ /g, '-')}.pdf`;
            
            // Guardar el PDF
            pdf.save(fileName);

            this.showNotification(`✅ PDF generado para ${reportData.monthName}`, 'success');
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            this.showNotification(`❌ Error al generar PDF: ${error.message}`, 'error');
        } finally {
            // Restaurar botón en cualquier caso
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="fas fa-download"></i> Generar PDF';
                generateBtn.disabled = false;
                generateBtn.style.opacity = '1';
            }
        }
    }

    addSectionTitle(pdf, title, x, y) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text(title, x, y);
        
        pdf.setDrawColor(52, 152, 219);
        pdf.setLineWidth(0.5);
        pdf.line(x, y + 2, x + 60, y + 2);
    }

    getSafeFileName(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9áéíóúüñ]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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
        }, 4000);
    }
}