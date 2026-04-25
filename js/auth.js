const lockBtn = document.getElementById('lockBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const pwInput = document.getElementById('pwInput');
    const pwConfirm = document.getElementById('pwConfirm');
    const pwError = document.getElementById('pwError');
    const anonBadge = document.getElementById('anonBadge');

    lockBtn.addEventListener('click', () => {
        if (isAuthenticated) {
            // 잠금: 다시 익명화
            isAuthenticated = false;
            lectureData = anonymizeData(rawProcessedData);
            updateDashboard();
            lockBtn.textContent = '🔒';
            anonBadge.style.display = 'inline-block';
        } else {
            pwInput.value = '';
            pwError.style.display = 'none';
            modalOverlay.classList.add('active');
            pwInput.focus();
        }
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    pwConfirm.addEventListener('click', () => {
        if (pwInput.value === PASSWORD) {
            isAuthenticated = true;
            modalOverlay.classList.remove('active');
            lectureData = rawProcessedData;
            updateDashboard();
            lockBtn.textContent = '🔓';
            anonBadge.style.display = 'none';
        } else {
            pwError.style.display = 'block';
            pwInput.value = '';
            pwInput.focus();
        }
    });

    pwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pwConfirm.click();
    });
