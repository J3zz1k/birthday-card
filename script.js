/* ============================================================
   1. ГИРЛЯНДА С ДАТАМИ
   ============================================================ */
(function buildGarland() {
    const garland = document.querySelector('.garland');
    if (!garland) return;

    const count = 20;
    const datePositions = {
        4:  '14.02',
        9:  '14.05',
        15: '14.11',
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
   2. ГИРЛЯНДА ПО БОКАМ
   ============================================================ */
(function buildSideGarland() {
    const left = document.querySelector('.side-garland-left');
    const right = document.querySelector('.side-garland-right');
    if (!left || !right) return;

    const count = 8;
    [left, right].forEach(container => {
        for (let i = 0; i < count; i++) {
            const h = document.createElement('span');
            h.className = 's-h ' + (i % 3 === 0 ? 'c2' : i % 3 === 1 ? 'c3' : '');
            const topPercent = ((i + 0.5) / count) * 100;
            h.style.top = topPercent + '%';
            h.style.animationDelay = (i * 0.4) + 's';
            container.appendChild(h);
        }
    });
})();

/* ============================================================
   3. ПАДАЮЩИЕ СЕРДЕЧКИ
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
   4. СВИТОК ПИСЬМА
   ============================================================ */
(function scrollLetter() {
    const p = document.getElementById('letterText');
    const scroll = document.getElementById('scroll');
    const scrollBody = document.getElementById('scrollBody');
    const toggle = document.getElementById('scrollToggle');
    const toggleText = document.getElementById('scrollToggleText');
    if (!p || !scroll || !scrollBody || !toggle) return;

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

    function measureFullHeight() {
        charSpans.forEach(s => s.classList.add('shown'));
        scrollBody.style.maxHeight = 'none';
        const h = scrollBody.scrollHeight;
        scrollBody.style.maxHeight = '';
        charSpans.forEach(s => s.classList.remove('shown'));
        return h;
    }

    let fullHeight = 0;
    const COLLAPSED_HEIGHT = 60;

    function initMeasure() {
        fullHeight = measureFullHeight();
        scrollBody.style.maxHeight = COLLAPSED_HEIGHT + 'px';
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(initMeasure);
    } else {
        window.addEventListener('load', initMeasure);
        setTimeout(initMeasure, 300);
    }

    let isOpen = false;
    let revealTimer = null;
    let revealIndex = 0;
    let rafId = null;

    const CHAR_INTERVAL_MS = 22;
    const REVEAL_START_DELAY = 400;

    function smoothExpandTo(targetHeight) {
        cancelAnimationFrame(rafId);
        const startHeight = parseFloat(scrollBody.style.maxHeight) || COLLAPSED_HEIGHT;
        const startTime = performance.now();
        const duration = 220;

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const h = startHeight + (targetHeight - startHeight) * eased;
            scrollBody.style.maxHeight = h + 'px';
            if (t < 1) rafId = requestAnimationFrame(step);
        }
        rafId = requestAnimationFrame(step);
    }

    function smoothCollapseTo(targetHeight) {
        cancelAnimationFrame(rafId);
        const startHeight = parseFloat(scrollBody.style.maxHeight) || COLLAPSED_HEIGHT;
        const startTime = performance.now();
        const duration = 500;

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const h = startHeight + (targetHeight - startHeight) * eased;
            scrollBody.style.maxHeight = h + 'px';
            if (t < 1) rafId = requestAnimationFrame(step);
        }
        rafId = requestAnimationFrame(step);
    }

    function startReveal() {
        clearInterval(revealTimer);
        cancelAnimationFrame(rafId);
        revealIndex = 0;

        charSpans.forEach(s => s.classList.remove('shown'));
        scrollBody.style.maxHeight = COLLAPSED_HEIGHT + 'px';

        if (!fullHeight) fullHeight = measureFullHeight();

        setTimeout(() => {
            revealTimer = setInterval(() => {
                if (revealIndex >= charSpans.length) {
                    clearInterval(revealTimer);
                    smoothExpandTo(fullHeight + 40);
                    return;
                }

                const span = charSpans[revealIndex];
                span.classList.add('shown');
                revealIndex++;

                if (revealIndex % 3 === 0 || revealIndex === charSpans.length) {
                    const progress = revealIndex / charSpans.length;
                    const target = COLLAPSED_HEIGHT + (fullHeight - COLLAPSED_HEIGHT) * progress;
                    smoothExpandTo(target);
                }
            }, CHAR_INTERVAL_MS);
        }, REVEAL_START_DELAY);
    }

    function hideAll() {
        clearInterval(revealTimer);
        cancelAnimationFrame(rafId);
        charSpans.forEach(s => s.classList.remove('shown'));
        revealIndex = 0;
        smoothCollapseTo(COLLAPSED_HEIGHT);
    }

    function open() {
        scroll.classList.add('open');
        toggleText.textContent = 'Свернуть письмо';
        isOpen = true;
        startReveal();
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
})();

/* ============================================================
   5. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
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
   6. СЧЁТЧИК ВМЕСТЕ
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
   7. СЛЕДЫ КОТА
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
   8. КОНФЕТТИ + ГИРОСКОП + ДОЛГОЕ НАЖАТИЕ
   ============================================================ */
(function heartsConfetti() {
    const btn = document.getElementById('heartsBtn');
    const layer = document.getElementById('confettiLayer');
    if (!btn || !layer) return;

    const PER_BURST = 22;
    const MAX_ACTIVE = 600;
    let activeCount = 0;

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
        const GYRO_GRAV_Y = 1600;
        const DRAG = 0.99;

        const startTime = performance.now();
        let lastTime = startTime;
        const lifeMs = 3600 + Math.random() * 1400;

        function frame(now) {
            const dt = Math.min(40, now - lastTime) / 1000;
            lastTime = now;
            const elapsed = now - startTime;

            const tiltForward = Math.max(0, -gravity.y);
            const extraUp = tiltForward * 1200;

            const ax = gravity.x * GYRO_GRAV_X;
            const ay = BASE_GRAV + gravity.y * GYRO_GRAV_Y - extraUp;

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

            heart.style.transform = `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${scale})`;
            heart.style.opacity = opacity;

            const bottomLimit = window.innerHeight + 300;
            const rightLimit  = window.innerWidth  + 300;
            const leftLimit   = -300;

            if (elapsed >= lifeMs || py > bottomLimit || px > rightLimit || px < leftLimit) {
                heart.remove();
                activeCount--;
                return;
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
})();

/* ============================================================
   9. СЕКРЕТНОЕ ПОСЛАНИЕ (долгое нажатие на кота)
   ============================================================ */
(function secretMessage() {
    const cat = document.getElementById('catSecret');
    const modal = document.getElementById('secretModal');
    const closeBtn = document.getElementById('secretClose');
    if (!cat || !modal || !closeBtn) return;

    let pressTimer = null;

    function show() {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }

    function hide() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    cat.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(show, 900);
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
        cat.addEventListener(ev, () => {
            clearTimeout(pressTimer);
        });
    });

    closeBtn.addEventListener('click', hide);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hide();
    });
})();

/* ============================================================
   10. СЕКРЕТНЫЙ ФИНАЛ (долгое бездействие внизу)
   ============================================================ */
(function finalSecret() {
    const block = document.getElementById('finalSecret');
    if (!block) return;

    // Добавляем кнопку закрытия прямо в блок
    const closeBtn = document.createElement('button');
    closeBtn.className = 'final-secret-close';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.textContent = '✕';
    block.style.position = 'fixed';
    block.appendChild(closeBtn);

    let idleTimer = null;
    let hideTimer = null;
    let shown = false;
    let dismissed = false; // если пользователь нажал крестик — больше не показываем

    function show() {
        if (shown || dismissed) return;
        block.classList.add('show');
        block.classList.remove('hide');
        block.setAttribute('aria-hidden', 'false');
        shown = true;

        // Автоматически скрываем через 8 секунд
        hideTimer = setTimeout(hide, 8000);
    }

    function hide() {
        clearTimeout(hideTimer);
        block.classList.remove('show');
        block.classList.add('hide');
        block.setAttribute('aria-hidden', 'true');
        shown = false;
    }

    function dismiss() {
        dismissed = true;
        hide();
    }

    closeBtn.addEventListener('click', dismiss);

    function resetIdle() {
        if (dismissed) return;
        if (shown) return;

        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
            if (isAtBottom) show();
        }, 10000);
    }

    ['scroll', 'touchstart', 'touchmove', 'mousemove', 'keydown'].forEach(ev => {
        window.addEventListener(ev, resetIdle, { passive: true });
    });

    resetIdle();
})();

/* ============================================================
   11. ИСКРЫ ВОКРУГ ЗАГОЛОВКА
   ============================================================ */
(function sparkles() {
    const container = document.getElementById('sparkles');
    const title = document.getElementById('mainTitle');
    if (!container || !title) return;

    setTimeout(() => {
        const rect = title.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const COUNT = 18;
        for (let i = 0; i < COUNT; i++) {
            const spark = document.createElement('span');
            spark.className = 'sparkle';
            const angle = (Math.PI * 2 * i) / COUNT;
            const dist = 80 + Math.random() * 80;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            spark.style.left = centerX + 'px';
            spark.style.top = centerY + 'px';
            spark.style.setProperty('--dx', dx + 'px');
            spark.style.setProperty('--dy', dy + 'px');
            spark.style.animationDelay = (Math.random() * 0.3) + 's';
            container.appendChild(spark);

            setTimeout(() => spark.remove(), 2500);
        }
    }, 1000);
})();

/* ============================================================
   12. КНОПКА "ПОДЕЛИТЬСЯ"
   ============================================================ */
(function shareBtn() {
    const btn = document.getElementById('shareBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const shareData = {
            title: 'С 9 месяцами 💖',
            text: 'Открытка для тебя 💖',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                btn.textContent = '✅ Ссылка скопирована';
                setTimeout(() => { btn.textContent = '🔗 Поделиться'; }, 2000);
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.warn('Share error:', e);
            }
        }
    });
})();
