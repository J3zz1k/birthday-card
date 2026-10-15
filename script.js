/* ============ ГИРЛЯНДА ИЗ СЕРДЕЧЕК ============ */
(function buildGarland() {
    const garland = document.querySelector('.garland');
    if (!garland) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
        const h = document.createElement('span');
        h.className = 'h ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
        // распределяем по ширине с небольшим случайным сдвигом
        const leftPercent = (i / (count - 1)) * 100;
        h.style.left = `calc(${leftPercent}% - 11px)`;
        // случайное вертикальное смещение для «живой» нити
        h.style.top = `${4 + Math.sin(i * 1.3) * 4}px`;
        garland.appendChild(h);
    }
})();

/* ============ ПАДАЮЩИЕ СЕРДЕЧКИ ============ */
(function heartRain() {
    const rain = document.getElementById('rain');
    if (!rain) return;

    const COUNT = 22;
    const drops = [];

    for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('span');
        d.className = 'drop ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
        d.style.left = Math.random() * 100 + '%';
        d.style.animationDuration = (5 + Math.random() * 5) + 's';
        d.style.animationDelay = (Math.random() * 6) + 's';
        const size = 12 + Math.random() * 12;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        rain.appendChild(d);
        drops.push(d);
    }

    // Останавливаем дождь, когда пользователь доскроллил до письма
    let stopped = false;
    const letter = document.getElementById('letter');

    function checkScroll() {
        if (stopped || !letter) return;
        const rect = letter.getBoundingClientRect();
        // как только верх письма поднялся выше 40% высоты экрана — плавно гасим дождь
        if (rect.top < window.innerHeight * 0.4) {
            stopped = true;
            rain.classList.add('fade-out');
            setTimeout(() => {
                rain.innerHTML = '';
            }, 1400);
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    // первичная проверка (вдруг страница уже прокручена)
    setTimeout(checkScroll, 600);
})();

/* ============ ПОЯВЛЕНИЕ ТЕКСТА ПИСЬМА ============ */
(function revealText() {
    const p = document.getElementById('letterText');
    if (!p) return;

    const text = p.textContent;
    p.textContent = '';

    // Разбиваем на строки по предложениям, чтобы анимация была плавной
    const parts = text.split(/(?<=[.!?])\s+/);
    let delay = 0.4;

    parts.forEach((part, idx) => {
        const span = document.createElement('span');
        span.className = 'reveal-line';
        span.textContent = part + (idx < parts.length - 1 ? ' ' : '');
        span.style.animationDelay = delay + 's';
        p.appendChild(span);
        delay += 0.35;
    });
})();

/* ============ ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ============ */
(function themeSwitch() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const saved = localStorage.getItem('card-theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('card-theme', isDark ? 'dark' : 'light');
    });
})();

/* ============ СОХРАНИТЬ КАК КАРТИНКУ ============ */
(function saveAsImage() {
    const btn = document.getElementById('saveBtn');
    const card = document.getElementById('card');
    if (!btn || !card) return;

    btn.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') {
            alert('Не удалось загрузить библиотеку. Проверьте интернет.');
            return;
        }

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Сохраняю...';

        try {
            const canvas = await html2canvas(card, {
                backgroundColor: document.body.classList.contains('dark') ? '#3a2230' : '#fff5fa',
                scale: window.devicePixelRatio > 1 ? 2 : 1.5,
                useCORS: true,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = 'с-днем-рождения.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error(e);
            alert('Не получилось сохранить картинку 😔');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
})();