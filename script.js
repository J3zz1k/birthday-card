/* ============ ГИРЛЯНДА ============ */
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
    for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('span');
        d.className = 'drop ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
        d.style.left = Math.random() * 100 + '%';
        d.style.animationDuration = (9 + Math.random() * 9) + 's';
        d.style.animationDelay = (Math.random() * 10) + 's';
        const size = 12 + Math.random() * 14;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        rain.appendChild(d);
    }

    let stopped = false;
    const letter = document.getElementById('letter');

    function checkScroll() {
        if (stopped || !letter) return;
        const rect = letter.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4) {
            stopped = true;
            rain.classList.add('fade-out');
            setTimeout(() => { rain.innerHTML = ''; }, 2200);
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    setTimeout(checkScroll, 600);
})();

/* ============ ПОЯВЛЕНИЕ ТЕКСТА ============ */
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
    if (saved === 'dark') document.body.classList.add('dark');

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('card-theme', isDark ? 'dark' : 'light');
    });
})();

/* ============ КОНФЕТТИ ИЗ СЕРДЕЧЕК ============ */
(function heartsConfetti() {
    const btn = document.getElementById('heartsBtn');
    const layer = document.getElementById('confettiLayer');
    if (!btn || !layer) return;

    // сколько сердечек вылетает за один клик
    const PER_BURST = 22;

    // сколько всего сердечек может быть одновременно (мягкий предел для производительности)
    const MAX_ACTIVE = 400;

    let activeCount = 0;

    btn.addEventListener('click', (e) => {
        // позиция кнопки в момент клика (или центр кнопки, если клик по клавиатуре)
        const rect = btn.getBoundingClientRect();
        const originX = (e.clientX && e.clientX !== 0)
            ? e.clientX
            : rect.left + rect.width / 2;
        const originY = (e.clientY && e.clientY !== 0)
            ? e.clientY
            : rect.top + rect.height / 2;

        spawnBurst(originX, originY);
    });

    function spawnBurst(x, y) {
        const count = PER_BURST;

        for (let i = 0; i < count; i++) {
            // ограничиваем, чтобы не залагало при очень частых кликах
            if (activeCount >= MAX_ACTIVE) return;

            const heart = document.createElement('span');
            heart.className = 'confetti-heart ' +
                (Math.random() < 0.33 ? 'c2' : Math.random() < 0.5 ? 'c3' : '');

            // размер
            const size = 12 + Math.random() * 18;
            heart.style.width = size + 'px';
            heart.style.height = size + 'px';

            // позиция
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';

            // начальный сдвиг внутри кнопки, чтобы сердечки вылетали «изнутри»
            const startOffsetX = (Math.random() - 0.5) * 40;
            const startOffsetY = (Math.random() - 0.5) * 20;

            // разлёт: вверх и в стороны
            const angle = (Math.random() * Math.PI) - (Math.PI / 2); // -90°..90°
            const velocity = 120 + Math.random() * 220;              // px
            const dx = Math.sin(angle) * velocity;
            const dy = -Math.abs(Math.cos(angle)) * velocity - 40;   // всегда вверх

            // поворот и вращение
            const rotStart = (Math.random() - 0.5) * 60;
            const rotEnd = rotStart + (Math.random() - 0.5) * 720;

            const duration = 1400 + Math.random() * 1400; // 1.4–2.8 сек

            layer.appendChild(heart);
            activeCount++;

            const anim = heart.animate(
                [
                    {
                        transform: `translate(${startOffsetX}px, ${startOffsetY}px) rotate(${rotStart}deg) scale(0.4)`,
                        opacity: 0,
                    },
                    {
                        transform: `translate(${startOffsetX * 0.5 + dx * 0.25}px, ${startOffsetY + dy * 0.25}px) rotate(${rotStart + (rotEnd - rotStart) * 0.25}deg) scale(1.1)`,
                        opacity: 1,
                        offset: 0.15,
                    },
                    {
                        transform: `translate(${dx}px, ${dy}px) rotate(${rotEnd}deg) scale(1)`,
                        opacity: 1,
                        offset: 0.7,
                    },
                    {
                        transform: `translate(${dx * 1.05}px, ${dy + 420}px) rotate(${rotEnd + 60}deg) scale(0.9)`,
                        opacity: 0,
                    },
                ],
                {
                    duration: duration,
                    easing: 'cubic-bezier(0.22, 0.9, 0.35, 1)',
                    fill: 'forwards',
                }
            );

            anim.onfinish = () => {
                heart.remove();
                activeCount--;
            };
            anim.oncancel = () => {
                heart.remove();
                activeCount--;
            };
        }
    }
})();
