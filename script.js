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

    const PER_BURST = 22;
    const MAX_ACTIVE = 400;
    let activeCount = 0;

    btn.addEventListener('click', (e) => {
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
        for (let i = 0; i < PER_BURST; i++) {
            if (activeCount >= MAX_ACTIVE) return;

            const heart = document.createElement('span');
            heart.className = 'confetti-heart ' +
                (Math.random() < 0.33 ? 'c2' : Math.random() < 0.5 ? 'c3' : '');

            const size = 14 + Math.random() * 20;
            heart.style.width = size + 'px';
            heart.style.height = size + 'px';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';

            const startOffsetX = (Math.random() - 0.5) * 30;
            const startOffsetY = (Math.random() - 0.5) * 16;

            // Разлёт веером ВВЕРХ: плотный конус около вертикали
            const angle = -(Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.55);
            const velocity = 320 + Math.random() * 320;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            const rotStart = (Math.random() - 0.5) * 60;
            const rotEnd = rotStart + (Math.random() - 0.5) * 540;

            // Длительность больше — плавнее и дольше
            const duration = 2400 + Math.random() * 1600;

            layer.appendChild(heart);
            activeCount++;

            const anim = heart.animate(
                [
                    {
                        transform: `translate(${startOffsetX}px, ${startOffsetY}px) rotate(${rotStart}deg) scale(0.4)`,
                        opacity: 0,
                        easing: 'cubic-bezier(0.18, 0.9, 0.3, 1)',
                    },
                    {
                        transform: `translate(${dx * 0.9}px, ${dy * 0.9}px) rotate(${rotStart + (rotEnd - rotStart) * 0.4}deg) scale(1.15)`,
                        opacity: 1,
                        offset: 0.45,
                        easing: 'cubic-bezier(0.35, 0, 0.65, 1)',
                    },
                    {
                        transform: `translate(${dx * 1.05}px, ${dy * 0.4}px) rotate(${rotEnd}deg) scale(1)`,
                        opacity: 1,
                        offset: 0.7,
                        easing: 'cubic-bezier(0.4, 0, 0.7, 0.5)',
                    },
                    {
                        transform: `translate(${dx * 1.1}px, ${dy + 700}px) rotate(${rotEnd + 40}deg) scale(0.95)`,
                        opacity: 0,
                    },
                ],
                {
                    duration: duration,
                    easing: 'linear',
                    fill: 'forwards',
                }
            );

            anim.onfinish = () => { heart.remove(); activeCount--; };
            anim.oncancel = () => { heart.remove(); activeCount--; };
        }
    }
})();
