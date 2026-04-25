document.getElementById('updateDataBtn').addEventListener('click', () => {
        const fileInput = document.getElementById('csvFileInput');
        const file = fileInput.files[0];
        // 업로드 전 데이터 초기화
        lectureData = [];
        updateDashboard();
        if (!file) {
            alert('먼저 파일을 선택해주세요.');
            return;
        }
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newCsvData = e.target.result;
                const newData = parseCSV(newCsvData);
                const processedNewData = processData(newData);
                lectureData = processedNewData;
                alert('CSV 데이터가 성공적으로 추가되었습니다. 대시보드를 업데이트합니다.');
                updateDashboard();
            };
            reader.readAsText(file, 'UTF-8');
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                // jsonData의 키를 CSV와 맞추기 위해 트림
                const normalizedData = jsonData.map(row => {
                    const obj = {};
                    Object.keys(row).forEach(key => {
                        obj[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
                    });
                    return obj;
                });
                const processedNewData = processData(normalizedData);
                lectureData = processedNewData;
                alert('엑셀 데이터가 성공적으로 추가되었습니다. 대시보드를 업데이트합니다.');
                updateDashboard();
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('CSV 또는 엑셀(xlsx) 파일만 업로드할 수 있습니다.');
        }
    });

    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const targetId = button.dataset.target;
            contentSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
function init() {
        initializeCharts();
        // 구글 드라이브 CSV 로드
        fetch(DRIVE_CSV_URL)
            .then(res => {
                if (!res.ok) throw new Error('fetch failed');
                return res.text();
            })
            .then(csvText => {
                loadData(csvText);
            })
            .catch(() => {
                // 드라이브 실패 시 하드코딩 데이터 폴백
                console.warn('드라이브 CSV 로드 실패, 기본 데이터 사용');
                loadData(initialCSVData);
            });
    }

    // 테이블 정렬 함수
    init();
