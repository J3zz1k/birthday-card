/* ============================================================
   1. ГИРЛЯНДА С ДАТАМИ
   ============================================================ */
(function buildGarland() {
    const garland = document.querySelector('.garland');
    if (!garland) return;

    const count = 20;
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
   2. ПАДАЮЩИЕ СЕРДЕЧКИ (фон)
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
   4. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
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

    const START = new Date(2026, 1, 14, 0, 0, 0);

    function update() {
        const now = new Date();
        let diff = now - START;
        if (diff < 0) diff = 0;

        const totalMinutes = Math.floor(diff / 60000);
        const days  = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const mins  = totalMinutes % 60;

        daysEl.textContent  = days;
        hoursEl.textContent = hours;
        minsEl.textContent  = mins;
    }

    update();
    setInterval(update, 30000);
})();

/* ============================================================
   6. СЛЕДЫ КОТА
   ============================================================ */
(function pawTrail() {
    const layer = document.getElementById('pawTrail');
    if (!layer) return;

    const MAX_PRINTS = 40;
    let lastX = null;
    let lastY = null;
    const MIN_DISTANCE = 70;

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function addPrint(x, y) {
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
        print.style.setProperty('--rot', ((Math.random() - 0.5) * 30) + 'deg');

        layer.appendChild(print);

        while (layer.children.length > MAX_PRINTS) {
            layer.removeChild(layer.firstChild);
        }

        setTimeout(() => {
            if (print.parentNode) print.parentNode.removeChild(print);
        }, 2300);
    }

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        addPrint(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        addPrint(t.clientX, t.clientY);
    }, { passive: true });

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
   7. КОНФЕТТИ + ГИРОСКОП + ДОЛГОЕ НАЖАТИЕ
   ============================================================ */
(function heartsConfetti() {
    const btn = document.getElementById('heartsBtn');
    const layer = document.getElementById('confettiLayer');
    if (!btn || !layer) return;

    const PER_BURST = 22;
    const MAX_ACTIVE = 600;
    let activeCount = 0;

    // ============ ГИРОСКОП ============
    // gravity.x: -1 (влево) ... +1 (вправо)
    // gravity.y: -1 (вверх ногами) ... +1 (вниз)
    const gravity = { x: 0, y: 0 };
    let gyroEnabled = false;

    const gyroBtn = document.getElementById('gyroBtn');

    // На iPhone нужно запросить разрешение ИМЕННО в обработчике тапа.
    // Поэтому запрос делаем при первом нажатии на кнопку "Сердечки".
    const needsPermission = typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function';

    // Если это Android — просто включаем сразу
    if (!needsPermission && typeof DeviceOrientationEvent !== 'undefined') {
        attachGyroListener();
    }

    async function requestGyroPermissionOnce() {
        if (!needsPermission) return true;
        if (gyroEnabled) return true;

        try {
            const state = await DeviceOrientationEvent.requestPermission();
            if (state === 'granted') {
                attachGyroListener();
                if (gyroBtn) gyroBtn.hidden = true;
                return true;
            } else {
                if (gyroBtn) {
                    gyroBtn.textContent = '🎈 Разрешение отклонено';
                    setTimeout(() => { gyroBtn.hidden = true; }, 2000);
                }
                return false;
            }
        } catch (e) {
            console.warn('gyro permission error', e);
            return false;
        }
    }

    function attachGyroListener() {
        gyroEnabled = true;
        window.addEventListener('deviceorientation', (e) => {
            // gamma: -90..+90 — наклон влево/вправо
            // beta:  -180..+180 — наклон вперёд/назад
            let gx = (e.gamma || 0) / 45;
            let gy = ((e.beta || 0) - 45) / 45;

            // Ограничиваем -1..+1
            gx = Math.max(-1, Math.min(1, gx));
            gy = Math.max(-1, Math.min(1, gy));

            // Плавное сглаживание, чтобы не дёргалось
            gravity.x = gravity.x * 0.85 + gx * 0.15;
            gravity.y = gravity.y * 0.85 + gy * 0.15;
        }, true);
    }

    // ============ ЛОГИКА НАЖАТИЙ ============
    let holdTimer = null;
    let isHolding = false;
    let holdInterval = null;
    let longPressTriggered = false;
    const HOLD_MS = 600;

    function onPointerDown(e) {
        longPressTriggered = false;
        isHolding = false;

        // Запрашиваем разрешение гироскопа при первом же взаимодействии
        requestGyroPermissionOnce();

        holdTimer = setTimeout(() => {
            isHolding = true;
            longPressTriggered = true;
            btn.classList.add('holding');
            megaBurst();
            holdInterval = setInterval(() => {
                megaBurst(0.6);
            }, 180);
        }, HOLD_MS);
    }

    function onPointerUp() {
        clearTimeout(holdTimer);
        clearInterval(holdInterval);
        btn.classList.remove('holding');

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

    // ============ ВСПЛЕСКИ ============
    function spawnBurst(x, y) {
        for (let i = 0; i < PER_BURST; i++) {
            if (activeCount >= MAX_ACTIVE) return;
            createHeart(x, y, 1);
        }
    }

    function megaBurst(intensity = 1) {
        const count = Math.round(60 * intensity);
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        for (let i = 0; i < count; i++) {
            if (activeCount >= MAX_ACTIVE + 400) return;
            const startX = Math.random() < 0.5
                ? vw * 0.5 + (Math.random() - 0.5) * vw * 0.9
                : Math.random() * vw;
            const startY = vh - 10 - Math.random() * 40;
            createHeart(startX, startY, 1.6, true);
        }
    }

    /* ========================================================
       ФИЗИКА ЧАСТИЦЫ ЧЕРЕЗ requestAnimationFrame
       (гравитация от гироскопа действует ВСЁ время полёта)
       ======================================================== */
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
        heart.style.position = 'fixed';
        heart.style.transformOrigin = '50% 50%';
        heart.style.willChange = 'transform, opacity';

        layer.appendChild(heart);
        activeCount++;

        // --- начальные параметры частицы ---
        const startOffsetX = (Math.random() - 0.5) * 30;
        const startOffsetY = (Math.random() - 0.5) * 16;

        const angle = -(Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.55);
        const speed = 320 + Math.random() * 320;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        // позиция относительно старта
        let px = startOffsetX;
        let py = startOffsetY;

        const rotStart = (Math.random() - 0.5) * 60;
        const rotSpeed = (Math.random() - 0.5) * 240; // градусов в сек
        let rot = rotStart;

        // физика
        const GRAV = 900;        // базовая гравитация вниз, px/s^2
        const DRAG = 0.985;      // сопротивление воздуха (за кадр)
        const GYRO_FORCE = 900;  // насколько сильно гироскоп тянет в сторону

        const startTime = performance.now();
        let lastTime = startTime;

        // длительность жизни — 3.2..4.4 сек
        const lifeMs = 3200 + Math.random() * 1200;

        function frame(now) {
            const dt = Math.min(40, now - lastTime) / 1000;
            lastTime = now;
            const elapsed = now - startTime;

            // гравитация: всегда вниз + тяга от наклона телефона
            const ax = gravity.x * GYRO_FORCE;
            const ay = GRAV + gravity.y * GYRO_FORCE * 0.6;

            vx += ax * dt;
            vy += ay * dt;

            // сопротивление
            vx *= DRAG;
            vy *= DRAG;

            px += vx * dt;
            py += vy * dt;

            rot += rotSpeed * dt;

            // масштаб чуть уменьшается к концу
            const lifeRatio = elapsed / lifeMs;
            const scale = 1 - lifeRatio * 0.15;

            // прозрачность — плавно гаснет в последнюю треть
            let opacity = 1;
            if (lifeRatio > 0.66) {
                opacity = 1 - (lifeRatio - 0.66) / 0.34;
            }
            if (lifeRatio < 0.06) {
                opacity = lifeRatio / 0.06;
            }

            heart.style.transform =
                `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${scale})`;
            heart.style.opacity = opacity;

            // условие завершения
            const screenBottom = window.innerHeight + 80;
            const screenRight = window.innerWidth + 120;
            const screenLeft = -120;

            if (elapsed >= lifeMs || py > screenBottom || px > screenRight || px < screenLeft) {
                heart.remove();
                activeCount--;
                return;
            }

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }
})();
