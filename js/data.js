function buildAnonMap(data) {
        const names = [...new Set(data.map(r => r['강사명']))].sort();
        const map = {};
        names.forEach((name, i) => {
            map[name] = `강사 ${i + 1}`;
        });
        return map;
    }

    function anonymizeData(data) {
        const anonMap = buildAnonMap(data);
        return data.map(row => ({ ...row, '강사명': anonMap[row['강사명']] || row['강사명'] }));
    }
function parseCSV(csv) {
        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',');
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const obj = {};
            const currentline = lines[i].split(',');
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = currentline[j] ? currentline[j].trim() : '';
            }
            result.push(obj);
        }
        return result;
    }

    function processData(data) {
        return data.map(row => ({
            ...row,
            '강의 시간': parseFloat(row['강의 시간']) || 0,
            '날짜': row['날짜'] ? new Date(row['날짜'].replace(/\.\s/g, '-')) : null
        })).filter(row => row['강사명'] && row['날짜'] && !isNaN(row['날짜'].getTime()));
    }
function loadData(csvText) {
        const parsed = parseCSV(csvText);
        rawProcessedData = processData(parsed);
        lectureData = isAuthenticated ? rawProcessedData : anonymizeData(rawProcessedData);
        updateDashboard();
    }
