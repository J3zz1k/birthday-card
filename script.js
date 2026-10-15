/* ============================================================
   1. ГИРЛЯНДА С ДАТАМИ
   ============================================================ */
(function buildGarland() {
    const garland = document.querySelector('.garland');
    if (!garland) return;

    const count = 20;
    // на каких позициях будут даты (0..19)
    const datePositions = {
        4:  '04.02',
        9:  '14.02',
        15: '14.10',
    };

    for (let i = 0; i < count; i++) {
        const h = document.createElement('span');
        h.className = 'h ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');

        if (datePositions[i]) {
            h.classList.add('dated');
            const label = document.createElement('span');
            label.className = 'date-label';
            label.textContent = datePositions[i];
            h.appendChild(label);
        }

        const leftPercent = (i / (count - 1)) * 100;
        const halfWidth = datePositions[i] ? 15 : 11;
        h.style.left = `calc(${leftPercent}% - ${halfWidth}px)`;
        h.style.top = `${4 + Math.sin(i * 1.3) * 4}px`;
        garland.appendChild(h);
    }
})();

/* ============================================================
   2. ПАДАЮЩИЕ СЕРДЕЧКИ (фон) — останавливаются при скролле
   ============================================================ */
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

/* ============================================================
   3. РАЗВОРАЧИВАНИЕ ПИСЬМА + ПОСТРОЧНОЕ ПОЯВЛЕНИЕ
   ============================================================ */
(function revealLetter() {
    const p = document.getElementById('letterText');
    const letter = document.getElementById('letter');
    if (!p || !letter) return;

    const text = p.textContent;
    p.textContent = '';

    const parts = text.split(/(?<=[.!?])\s+/);
    let delay = 0.6;

    parts.forEach((part, idx) => {
        const span = document.createElement('span');
        span.className = 'reveal-line';
        span.textContent = part + (idx < parts.length - 1 ? ' ' : '');
        span.style.animationDelay = delay + 's';
        p.appendChild(span);
        delay += 0.35;
    });

    // Анимация свитка стартует, когда письмо попадает в зону видимости
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                letter.classList.add('unroll');
                observer.disconnect();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(letter);
})();

/* ============================================================
   4. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (с анимацией солнца/луны)
   ============================================================ */
(function themeSwitch() {
    const btn = document.getElementById('themeToggle');
    const fx = document.getElementById('themeFx');
    if (!btn) return;

    const saved = localStorage.getItem('card-theme');
    if (saved === 'dark') document.body.classList.add('dark');

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('card-theme', isDark ? 'dark' : 'light');

        // всплывающий символ
        if (fx) {
            fx.textContent = isDark ? '🌙' : '☀️';
            fx.classList.remove('play');
            void fx.offsetWidth;
            fx.classList.add('play');
        }
    });
})();

/* ============================================================
   5. СЧЁТЧИК ВМЕСТЕ
   ============================================================ */
(function togetherCounter() {
    const daysEl  = document.getElementById('daysCount');
    const hoursEl = document.getElementById('hoursCount');
    const minsEl  = document.getElementById('minsCount');
    if (!daysEl) return;

    // Начало: 14.02.2026
    const START = new Date(2026, 1, 14, 0, 0, 0); // месяц 1 = февраль

    function update() {
        const now = new Date();
        let diff = now - START;
        if (diff < 0) diff = 0; // если ещё не наступило

        const totalMinutes = Math.floor(diff / 60000);
        const days  = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const mins  = totalMinutes % 60;

        daysEl.textContent  = days;
        hoursEl.textContent = hours;
        minsEl.textContent  = mins;
    }

    update();
    setInterval(update, 30000); // каждые 30 секунд
})();

/* ============================================================
   6. СЛЕДЫ КОТА ПРИ СКРОЛЛЕ / КАСАНИИ
   ============================================================ */
(function pawTrail() {
    const layer = document.getElementById('pawTrail');
    if (!layer) return;

    const MAX_PRINTS = 40;
    let lastX = null;
    let lastY = null;
    const MIN_DISTANCE = 70;   // между следами

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function addPrint(x, y) {
        // расстояние от последнего
        if (lastX !== null) {
            const dx = x - lastX;
            const dy = y - lastY;
            if (Math.hypot(dx, dy) < MIN_DISTANCE) return;
        }
        lastX = x;
        lastY = y;

        const print = document.createElement('span');
        print.className = 'paw-print';
        print.style.left = x + 'px';
        print.style.top  = y + 'px';
        // случайный поворот, как будто кот идёт под углом
        print.style.setProperty('--rot', ((Math.random() - 0.5) * 30) + 'deg');

        layer.appendChild(print);

        // убираем старые
        while (layer.children.length > MAX_PRINTS) {
            layer.removeChild(layer.firstChild);
        }

        // самоудаление после анимации
        setTimeout(() => {
            if (print.parentNode) print.parentNode.removeChild(print);
        }, 2300);
    }

    // Для тач-устройств — следы в точке касания при скролле
    let touchStartY = 0;
    let touchCurrentY = 0;

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartY = t.clientY;
        touchCurrentY = t.clientY;
        addPrint(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        touchCurrentY = t.clientY;
        addPrint(t.clientX, t.clientY);
    }, { passive: true });

    // Для ПК — следы вдоль курсора при скролле
    if (!isTouchDevice()) {
        let mouseX = -100, mouseY = -100;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        window.addEventListener('scroll', () => {
            if (mouseX > 0 && mouseY > 0) {
                addPrint(mouseX, mouseY + 20);
            }
        }, { passive: true });
    }
})();

/* ============================================================
   7. КОНФЕТТИ ИЗ СЕРДЕЧЕК + ГИРОСКОП + ДОЛГОЕ НАЖАТИЕ
   ============================================================ */
(function heartsConfetti() {
    const btn = document.getElementById('heartsBtn');
    const layer = document.getElementById('confettiLayer');
    if (!btn || !layer) return;

    const PER_BURST = 22;
    const MAX_ACTIVE = 400;
    let activeCount = 0;

    // Гироскоп: наклон = сила гравитации, применяемая к сердечкам
    const gravity = { x: 0, y: 0 };
    let gyroEnabled = false;
    const gyroBtn = document.getElementById('gyroBtn');

    // ---- Запрос разрешения на гироскоп (только iOS 13+) ----
    const needsPermission = typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function';

    if (needsPermission) {
        // Показываем кнопку разрешения
        if (gyroBtn) {
            gyroBtn.hidden = false;
            gyroBtn.addEventListener('click', async () => {
                try {
                    const state = await DeviceOrientationEvent.requestPermission();
                    if (state === 'granted') {
                        startGyro();
                        gyroBtn.hidden = true;
                    } else {
                        gyroBtn.textContent = '🎈 Разрешение отклонено';
                        setTimeout(() => { gyroBtn.hidden = true; }, 2000);
                    }
                } catch (e) {
                    gyroBtn.hidden = true;
                }
            });
        }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
        // Android и другие — просто включаем
        startGyro();
    }

    function startGyro() {
        gyroEnabled = true;
        window.addEventListener('deviceorientation', (e) => {
            if (!gyroEnabled) return;
            // e.gamma — наклон влево/вправо (-90..90)
            // e.beta  — наклон вперёд/назад (-180..180)
            const gx = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
            const gy = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
            gravity.x = gx;
            gravity.y = gy;
        }, true);
    }

    // ---- Обычный клик ----
    let holdTimer = null;
    let isHolding = false;
    let holdInterval = null;
    let longPressTriggered = false;

    const HOLD_MS = 600;      // через сколько мс считаем нажатие «долгим»

    function onPointerDown(e) {
        longPressTriggered = false;
        isHolding = false;

        holdTimer = setTimeout(() => {
            isHolding = true;
            longPressTriggered = true;
            btn.classList.add('holding');

            // ОГРОМНЫЙ всплеск на весь экран
            megaBurst();

            // И продолжаем сыпать, пока держат
            holdInterval = setInterval(() => {
                megaBurst(0.6);
            }, 180);
        }, HOLD_MS);
    }

    function onPointerUp() {
        clearTimeout(holdTimer);
        clearInterval(holdInterval);
        btn.classList.remove('holding');

        // Если долгого нажатия не было — обычный клик
        if (!longPressTriggered) {
            const rect = btn.getBoundingClientRect();
            spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        isHolding = false;
        holdInterval = null;
    }

    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointerup', onPointerUp);
    btn.addEventListener('pointercancel', onPointerUp);
    btn.addEventListener('pointerleave', () => {
        if (isHolding) onPointerUp();
    });

    // ---- Обычный всплеск (клик) ----
    function spawnBurst(x, y) {
        for (let i = 0; i < PER_BURST; i++) {
            if (activeCount >= MAX_ACTIVE) return;
            createHeart(x, y, 1);
        }
    }

    // ---- Огромный всплеск (долгое нажатие) ----
    function megaBurst(intensity = 1) {
        const count = Math.round(60 * intensity);
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        for (let i = 0; i < count; i++) {
            if (activeCount >= MAX_ACTIVE + 400) return;

            // Из нескольких точек по низу/центру экрана — заполняем весь экран
            const startX = Math.random() < 0.5
                ? vw * 0.5 + (Math.random() - 0.5) * vw * 0.9
                : Math.random() * vw;
            const startY = vh - 10 - Math.random() * 40;

            createHeart(startX, startY, 1.6, true);
        }
    }

    // ---- Создание сердечка с анимацией ----
    function createHeart(x, y, scaleMul = 1, isMega = false) {
        const heart = document.createElement('span');
        heart.className = 'confetti-heart ' +
            (Math.random() < 0.33 ? 'c2' : Math.random() < 0.5 ? 'c3' : '');

        const baseSize = isMega ? 16 + Math.random() * 22 : 14 + Math.random() * 20;
        const size = baseSize * scaleMul;
        heart.style.width = size + 'px';
        heart.style.height = size + 'px';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';

        const startOffsetX = (Math.random() - 0.5) * 30;
        const startOffsetY = (Math.random() - 0.5) * 16;

        const angle = -(Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.55);
        const velocity = 320 + Math.random() * 320;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        const rotStart = (Math.random() - 0.5) * 60;
        const rotEnd = rotStart + (Math.random() - 0.5) * 540;

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
                    // падение вниз с учётом гравитации (гироскоп)
                    transform: `translate(${dx * 1.1 + gravity.x * 180}px, ${dy + 700 + Math.abs(gravity.y) * 100}px) rotate(${rotEnd + 40}deg) scale(0.95)`,
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
})();
