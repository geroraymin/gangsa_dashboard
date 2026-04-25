function updateDashboard() {
        const totalHours = lectureData.reduce((sum, row) => sum + row['강의 시간'], 0);
        const totalSessions = lectureData.length;
        const uniqueInstructors = new Set(lectureData.map(row => row['강사명']));
        const uniquePrograms = new Set(lectureData.map(row => row['프로그램명']));

        document.getElementById('totalHours').textContent = totalHours.toFixed(1);
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('totalInstructors').textContent = uniqueInstructors.size;
        document.getElementById('totalPrograms').textContent = uniquePrograms.size;

        updateMonthlyTrendChart();
        updateTopCharts();
        updateInstructorSection();
        updateProgramSection();
        updateEquipmentSection();
    }

    function getAggregatedData(key) {
        const aggregation = lectureData.reduce((acc, row) => {
            const item = row[key];
            if (item) {
                if (!acc[item]) {
                    acc[item] = { sessions: 0, hours: 0 };
                }
                acc[item].sessions += 1;
                acc[item].hours += row['강의 시간'];
            }
            return acc;
        }, {});
        return Object.entries(aggregation).map(([name, data]) => ({ name, ...data }));
    }
function updateInstructorSection() {
        const instructorData = getAggregatedData('강사명').sort((a, b) => b.hours - a.hours);
        const tableBody = document.getElementById('instructorTableBody');
        tableBody.innerHTML = '';
        instructorData.forEach(instructor => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50 cursor-pointer';
            row.innerHTML = `
                <td class="px-6 py-4 font-medium whitespace-nowrap">${instructor.name}</td>
                <td class="px-6 py-4 text-right">${instructor.hours.toFixed(1)}</td>
                <td class="px-6 py-4 text-right">${instructor.sessions}</td>
            `;
            row.addEventListener('click', () => {
                updateInstructorDetail(instructor.name);
                tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('bg-amber-100'));
                row.classList.add('bg-amber-100');
            });
            tableBody.appendChild(row);
        });
    }

    function updateInstructorDetail(instructorName) {
        document.getElementById('instructorDetailName').textContent = `${instructorName} 강사 상세 분석`;
        document.getElementById('instructorDetailContent').classList.remove('hidden');

        const instructorAllData = lectureData.filter(row => row['강사명'] === instructorName);
        const totalHours = instructorAllData.reduce((sum, row) => sum + row['강의 시간'], 0);
        const totalSessions = instructorAllData.length;

        document.getElementById('instructorDetailHours').textContent = `${totalHours.toFixed(1)} 시간`;
        document.getElementById('instructorDetailSessions').textContent = `${totalSessions} 세션`;

        const contentAggregation = instructorAllData.reduce((acc, row) => {
            const content = row['담당 콘텐츠'];
            if(content) {
                acc[content] = (acc[content] || 0) + row['강의 시간'];
            }
            return acc;
        }, {});
        const sortedContent = Object.entries(contentAggregation).sort((a, b) => b[1] - a[1]);
        
        charts.instructorContent.data.labels = sortedContent.map(d => d[0]);
        charts.instructorContent.data.datasets[0].data = sortedContent.map(d => d[1]);
        charts.instructorContent.update();

        const programAggregation = instructorAllData.reduce((acc, row) => {
            const program = row['프로그램명'];
            if(program) {
                acc[program] = (acc[program] || 0) + 1;
            }
            return acc;
        }, {});
        const sortedPrograms = Object.entries(programAggregation).sort((a, b) => b[1] - a[1]);

        charts.instructorProgram.data.labels = sortedPrograms.map(d => d[0]);
        charts.instructorProgram.data.datasets[0].data = sortedPrograms.map(d => d[1]);
        charts.instructorProgram.update();
    }
    
    function updateProgramSection() {
        const programData = getAggregatedData('프로그램명').sort((a, b) => a.hours - b.hours);
        const contentData = getAggregatedData('담당 콘텐츠').sort((a, b) => a.hours - b.hours);

        charts.programHours.data.labels = programData.map(d => d.name);
        charts.programHours.data.datasets[0].data = programData.map(d => d.hours);
        charts.programHours.update();
        
        charts.contentHours.data.labels = contentData.map(d => d.name);
        charts.contentHours.data.datasets[0].data = contentData.map(d => d.hours);
        charts.contentHours.update();
    }

    function updateEquipmentSection() {
        const equipmentData = getAggregatedData('장비명').filter(item => item.name && item.name.trim() !== '');
        
        // 상위 10개 장비별 활용 횟수 차트
        const topUsageData = equipmentData.sort((a, b) => b.sessions - a.sessions).slice(0, 10);
        charts.equipmentUsage.data.labels = topUsageData.map(d => d.name);
        charts.equipmentUsage.data.datasets[0].data = topUsageData.map(d => d.sessions);
        charts.equipmentUsage.update();

        // 상위 10개 장비별 총 강의 시간 차트
        const topHoursData = equipmentData.sort((a, b) => b.hours - a.hours).slice(0, 10);
        charts.equipmentHours.data.labels = topHoursData.map(d => d.name);
        charts.equipmentHours.data.datasets[0].data = topHoursData.map(d => d.hours);
        charts.equipmentHours.update();

        // 장비별 상세 테이블 업데이트
        updateEquipmentTable(equipmentData);
    }

    function updateEquipmentTable(equipmentData) {
        const tableBody = document.getElementById('equipmentTableBody');
        tableBody.innerHTML = '';
        
        // 각 장비별로 담당 강사 수 계산
        const equipmentWithInstructors = equipmentData.map(equipment => {
            const instructors = new Set();
            lectureData.forEach(row => {
                if (row['장비명'] === equipment.name) {
                    instructors.add(row['강사명']);
                }
            });
            return {
                ...equipment,
                instructorCount: instructors.size,
                avgHours: equipment.sessions > 0 ? (equipment.hours / equipment.sessions).toFixed(1) : 0
            };
        });

        // 총 강의 시간 기준으로 정렬
        equipmentWithInstructors.sort((a, b) => b.hours - a.hours);

        equipmentWithInstructors.forEach(equipment => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 font-medium whitespace-nowrap">${equipment.name}</td>
                <td class="px-6 py-4 text-right">${equipment.sessions}</td>
                <td class="px-6 py-4 text-right">${equipment.hours.toFixed(1)}</td>
                <td class="px-6 py-4 text-right">${equipment.avgHours}</td>
                <td class="px-6 py-4 text-center">${equipment.instructorCount}</td>
            `;
            tableBody.appendChild(row);
        });
    }
window.sortTable = function(tableId, columnIndex) {
        const table = document.getElementById(tableId);
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        const isNumeric = columnIndex === 1 || columnIndex === 2 || columnIndex === 3 || columnIndex === 4;
        
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            if (isNumeric) {
                const aNum = parseFloat(aValue) || 0;
                const bNum = parseFloat(bValue) || 0;
                return bNum - aNum; // 내림차순 정렬
            } else {
                return aValue.localeCompare(bValue); // 오름차순 정렬
            }
        });
        
        // 정렬된 행들을 다시 테이블에 추가
        rows.forEach(row => tbody.appendChild(row));
    };

    // 비밀번호 모달 로직
