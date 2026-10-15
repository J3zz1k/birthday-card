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
   3. СВИТОК ПИСЬМА — РАЗВОРАЧИВАНИЕ ПО ТАПУ + ПОБУКВЕННОЕ ПОЯВЛЕНИЕ
   ============================================================ */
(function scrollLetter() {
    const p = document.getElementById('letterText');
    const scroll = document.getElementById('scroll');
    const toggle = document.getElementById('scrollToggle');
    const toggleText = document.getElementById('scrollToggleText');
    if (!p || !scroll || !toggle) return;

    // Сохраняем оригинальный текст и разбиваем его на буквы
    const fullText = p.textContent;
    p.textContent = '';
    p.setAttribute('aria-label', fullText);

    const charSpans = [];
    for (let i = 0; i < fullText.length; i++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = fullText[i];
        p.appendChild(span);
        charSpans.push(span);
    }

    let isOpen = false;
    let revealTimer = null;
    let revealIndex = 0;

    // Скорость появления: 1 буква примерно каждые 18 мс
    const CHAR_INTERVAL_MS = 18;

    function startReveal() {
        clearInterval(revealTimer);
        revealIndex = 0;
        charSpans.forEach(s => s.classList.remove('shown'));

        // Небольшая задержка, чтобы свиток успел раскрыться
        setTimeout(() => {
            revealTimer = setInterval(() => {
                if (revealIndex >= charSpans.length) {
                    clearInterval(revealTimer);
                    return;
                }
                const span = charSpans[revealIndex];
                span.classList.add('shown');
                revealIndex++;
            }, CHAR_INTERVAL_MS);
        }, 500);
    }

    function hideAll() {
        clearInterval(revealTimer);
        charSpans.forEach(s => s.classList.remove('shown'));
        revealIndex = 0;
    }

    function open() {
        scroll.classList.add('open');
        toggleText.textContent = 'Свернуть письмо';
        isOpen = true;
        startReveal();

        setTimeout(() => {
            const rect = scroll.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight * 0.4) {
                scroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    function close() {
        scroll.classList.remove('open');
        toggleText.textContent = 'Развернуть письмо';
        isOpen = false;
        hideAll();
    }

    toggle.addEventListener('click', () => {
        if (isOpen) close();
        else open();
    });

    // НИКАКОГО автооткрытия — только по тапу пользователя
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

    // ---- ГИРОСКОП ----
    const gravity = { x: 0, y: 0 };
    let gyroEnabled = false;

    const gyroBtn = document.getElementById('gyroBtn');

    const needsPermission = typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function';

    if (needsPermission && gyroBtn) {
        gyroBtn.hidden = false;
        gyroBtn.addEventListener('click', async () => {
            try {
                const state = await DeviceOrientationEvent.requestPermission();
                if (state === 'granted') {
                    attachGyroListener();
                    gyroBtn.textContent = '✨ Гироскоп включён';
                    setTimeout(() => { gyroBtn.hidden = true; }, 1200);
                } else {
                    gyroBtn.textContent = '🎈 Разрешение отклонено';
                    setTimeout(() => { gyroBtn.hidden = true; }, 2000);
                }
            } catch (e) {
                console.warn('gyro error', e);
                gyroBtn.hidden = true;
            }
        });
    } else if (!needsPermission && typeof DeviceOrientationEvent !== 'undefined') {
        attachGyroListener();
    }

    async function ensureGyro() {
        if (gyroEnabled) return true;
        if (!needsPermission) return true;
        try {
            const state = await DeviceOrientationEvent.requestPermission();
            if (state === 'granted') {
                attachGyroListener();
                if (gyroBtn) gyroBtn.hidden = true;
                return true;
            }
        } catch (e) {}
        return false;
    }

    function attachGyroListener() {
        gyroEnabled = true;
        window.addEventListener('deviceorientation', (e) => {
            let gx = (e.gamma || 0) / 30;
            let gy = ((e.beta || 0) - 45) / 30;
            gx = Math.max(-1, Math.min(1, gx));
            gy = Math.max(-1, Math.min(1, gy));
            gravity.x = gravity.x * 0.8 + gx * 0.2;
            gravity.y = gravity.y * 0.8 + gy * 0.2;
        }, true);
    }

    // ---- ЛОГИКА НАЖАТИЙ ----
    let holdTimer = null;
    let isHolding = false;
    let holdInterval = null;
    let longPressTriggered = false;
    const HOLD_MS = 600;

    function onPointerDown() {
        longPressTriggered = false;
        isHolding = false;

        ensureGyro();

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

    // ---- ВСПЛЕСКИ ----
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

    // ---- ФИЗИКА ----
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

        const startOffsetX = (Math.random() - 0.5) * 30;
        const startOffsetY = (Math.random() - 0.5) * 16;

        // Разлёт веером ВВЕРХ: угол от -75° до -105°, высоко.
        const angle = -(Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.55);
        const speed = 320 + Math.random() * 320;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        let px = startOffsetX;
        let py = startOffsetY;

        const rotStart = (Math.random() - 0.5) * 60;
        const rotSpeed = (Math.random() - 0.5) * 220;
        let rot = rotStart;

        const BASE_GRAV   = 900;
        const GYRO_GRAV_X = 2200;
        const GYRO_GRAV_Y = 1100;
        const DRAG = 0.99;

        const startTime = performance.now();
        let lastTime = startTime;
        const lifeMs = 3200 + Math.random() * 1200;

        function frame(now) {
            const dt = Math.min(40, now - lastTime) / 1000;
            lastTime = now;
            const elapsed = now - startTime;

            const ax = gravity.x * GYRO_GRAV_X;
            const ay = BASE_GRAV + gravity.y * GYRO_GRAV_Y;

            vx += ax * dt;
            vy += ay * dt;

            vx *= DRAG;
            vy *= DRAG;

            px += vx * dt;
            py += vy * dt;

            rot += rotSpeed * dt;

            const lifeRatio = elapsed / lifeMs;
            const scale = 1 - lifeRatio * 0.15;

            let opacity = 1;
            if (lifeRatio > 0.7)  opacity = 1 - (lifeRatio - 0.7) / 0.3;
            if (lifeRatio < 0.05) opacity = lifeRatio / 0.05;

            heart.style.transform =
                `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${scale})`;
            heart.style.opacity = opacity;

            const bottomLimit = window.innerHeight + 200;
            const topLimit    = -200;
            const rightLimit  = window.innerWidth  + 240;
            const leftLimit   = -240;

            if (elapsed >= lifeMs ||
                py > bottomLimit || py < topLimit ||
                px > rightLimit  || px < leftLimit) {
                heart.remove();
                activeCount--;
                return;
            }

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }
})();
