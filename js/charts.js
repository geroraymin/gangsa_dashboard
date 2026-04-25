function updateMonthlyTrendChart() {
        const monthlyData = Array(12).fill(0);
        lectureData.forEach(row => {
            const month = row['날짜'].getMonth();
            monthlyData[month] += row['강의 시간'];
        });

        const chartData = {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '월별 총 강의 시간',
                data: monthlyData,
                backgroundColor: '#a1887f',
                borderColor: '#6d4c41',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        };
        charts.monthlyTrend.data = chartData;
        charts.monthlyTrend.update();
    }

    function updateTopCharts() {
        const programData = getAggregatedData('프로그램명').sort((a, b) => b.sessions - a.sessions).slice(0, 5);
        const contentData = getAggregatedData('담당 콘텐츠').sort((a, b) => b.sessions - a.sessions).slice(0, 5);

        charts.topPrograms.data.labels = programData.map(d => d.name);
        charts.topPrograms.data.datasets[0].data = programData.map(d => d.sessions);
        charts.topPrograms.update();

        charts.topContents.data.labels = contentData.map(d => d.name);
        charts.topContents.data.datasets[0].data = contentData.map(d => d.sessions);
        charts.topContents.update();
    }
function initializeCharts() {
        charts.monthlyTrend = new Chart(document.getElementById('monthlyTrendChart'), {
            type: 'line', options: { responsive: true, maintainAspectRatio: false }
        });
        charts.topPrograms = new Chart(document.getElementById('topProgramsChart'), {
            type: 'doughnut', options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } },
            data: { datasets: [{ ...chartColors }] }
        });
        charts.topContents = new Chart(document.getElementById('topContentsChart'), {
            type: 'doughnut', options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } },
            data: { datasets: [{ ...chartColors }] }
        });
        charts.instructorContent = new Chart(document.getElementById('instructorContentChart'), {
            type: 'bar', options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' },
            data: { datasets: [{ label: '강의 시간', ...chartColors }] }
        });
        charts.instructorProgram = new Chart(document.getElementById('instructorProgramChart'), {
            type: 'bar', options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' },
            data: { datasets: [{ label: '세션 수', ...chartColors }] }
        });
        charts.programHours = new Chart(document.getElementById('programHoursChart'), {
            type: 'bar', options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } },
            data: { datasets: [{ label: '총 강의 시간', ...chartColors }] }
        });
        charts.contentHours = new Chart(document.getElementById('contentHoursChart'), {
            type: 'bar', options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } },
            data: { datasets: [{ label: '총 강의 시간', ...chartColors }] }
        });
        charts.equipmentUsage = new Chart(document.getElementById('equipmentUsageChart'), {
            type: 'doughnut', options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } },
            data: { datasets: [{ label: '활용 횟수', ...chartColors }] }
        });
        charts.equipmentHours = new Chart(document.getElementById('equipmentHoursChart'), {
            type: 'bar', options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } },
            data: { datasets: [{ label: '총 강의 시간', ...chartColors }] }
        });
    }
