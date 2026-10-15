/* ============ ГИРЛЯНДА ИЗ СЕРДЕЧЕК ============ */
(function buildGarland() {
    const garland = document.querySelector('.garland');
    if (!garland) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
        const h = document.createElement('span');
        h.className = 'h ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
        const leftPercent = (i / (count - 1)) * 100;
        h.style.left = `calc(${leftPercent}% - 11px)`;
        h.style.top = `${4 + Math.sin(i * 1.3) * 4}px`;
        garland.appendChild(h);
    }
})();

/* ============ ПАДАЮЩИЕ СЕРДЕЧКИ ============ */
(function heartRain() {
    const rain = document.getElementById('rain');
    if (!rain) return;

    const COUNT = 45;
    const drops = [];

    for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('span');
        d.className = 'drop ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
        d.style.left = Math.random() * 100 + '%';

        // 9-18 сек — падают заметно дольше
        d.style.animationDuration = (9 + Math.random() * 9) + 's';
        d.style.animationDelay = (Math.random() * 10) + 's';

        const size = 12 + Math.random() * 14;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        rain.appendChild(d);
        drops.push(d);
    }

    let stopped = false;
    const letter = document.getElementById('letter');

    function checkScroll() {
        if (stopped || !letter) return;
        const rect = letter.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4) {
            stopped = true;
            rain.classList.add('fade-out');
            setTimeout(() => {
                rain.innerHTML = '';
            }, 2200);
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    setTimeout(checkScroll, 600);
})();

/* ============ ПОЯВЛЕНИЕ ТЕКСТА ПИСЬМА ============ */
(function revealText() {
    const p = document.getElementById('letterText');
    if (!p) return;

    const text = p.textContent;
    p.textContent = '';

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

            // Получаем blob (файл) из canvas
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Не удалось создать изображение');

            const fileName = 'с-днем-рождения.png';
            const file = new File([blob], fileName, { type: 'image/png' });

            // Проверяем поддержку Web Share API с файлами (iPhone, Android)
            const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

            if (canShareFiles) {
                // На iPhone откроется системное меню → «Сохранить изображение» → Галерея
                try {
                    await navigator.share({
                        files: [file],
                        title: 'С днём рождения',
                        text: 'Открытка для тебя 💗',
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.warn('Share error:', err);
                    }
                }
            } else {
                // Fallback для ПК / старых браузеров — обычное скачивание
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = fileName;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch (e) {
            console.error(e);
            alert('Не получилось сохранить картинку 😔');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
})();
