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
    if (saved === 'dark') document.body.classList.add('dark');

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('card-theme', isDark ? 'dark' : 'light');
    });
})();

/* ============ СОХРАНИТЬ КАК КАРТИНКУ (foreignObject) ============ */
(function saveAsImage() {
    const btn = document.getElementById('saveBtn');
    const card = document.getElementById('card');
    if (!btn || !card) return;

    btn.addEventListener('click', async () => {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Сохраняю...';

        // 1) Показываем весь текст письма
        const revealLines = card.querySelectorAll('.reveal-line');
        const lineBackup = [];
        revealLines.forEach(el => {
            lineBackup.push({
                el,
                opacity: el.style.opacity,
                animation: el.style.animation,
                filter: el.style.filter,
                animationDelay: el.style.animationDelay,
            });
            el.style.animation = 'none';
            el.style.animationDelay = '0s';
            el.style.opacity = '1';
            el.style.filter = 'none';
        });

        // 2) Прячем гирлянду и дождь
        const garland = document.querySelector('.garland');
        const rain = document.getElementById('rain');
        const garlandDisplay = garland ? garland.style.display : null;
        const rainDisplay = rain ? rain.style.display : null;
        if (garland) garland.style.display = 'none';
        if (rain) rain.style.display = 'none';

        // 3) Отключаем backdrop-filter и тени
        const cardBackdrop = card.style.backdropFilter;
        const cardWebkitBackdrop = card.style.webkitBackdropFilter;
        const cardBoxShadow = card.style.boxShadow;
        card.style.backdropFilter = 'none';
        card.style.webkitBackdropFilter = 'none';
        card.style.boxShadow = 'none';

        // 4) Ждём перерисовку
        await new Promise(r => setTimeout(r, 120));

        try {
            let blob = await renderViaForeignObject(card);

            if (!blob && typeof html2canvas !== 'undefined') {
                const isDark = document.body.classList.contains('dark');
                const canvas = await html2canvas(card, {
                    backgroundColor: isDark ? '#3a2230' : '#ffffff',
                    scale: 1,
                    useCORS: true,
                    logging: false,
                });
                blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            }

            if (!blob) throw new Error('Не удалось создать изображение');

            const fileName = 'с-днем-рождения.png';
            const file = new File([blob], fileName, { type: 'image/png' });

            const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

            if (canShareFiles) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'С днём рождения',
                        text: 'Открытка для тебя 💗',
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') console.warn('Share error:', err);
                }
            } else {
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
            lineBackup.forEach(({ el, opacity, animation, filter, animationDelay }) => {
                el.style.opacity = opacity;
                el.style.animation = animation;
                el.style.filter = filter;
                el.style.animationDelay = animationDelay;
            });
            if (garland) garland.style.display = garlandDisplay;
            if (rain) rain.style.display = rainDisplay;
            card.style.backdropFilter = cardBackdrop;
            card.style.webkitBackdropFilter = cardWebkitBackdrop;
            card.style.boxShadow = cardBoxShadow;

            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    /**
     * Рендер DOM-узла в PNG через SVG <foreignObject>.
     * Нативно работает в Safari, Chrome, Firefox.
     */
    async function renderViaForeignObject(node) {
        try {
            const rect = node.getBoundingClientRect();
            const width = Math.ceil(rect.width);
            const height = Math.ceil(rect.height);

            const clone = node.cloneNode(true);
            inlineStyles(node, clone);

            const wrapper = document.createElement('div');
            wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
            wrapper.style.width = width + 'px';
            wrapper.style.height = height + 'px';
            wrapper.style.background = '#ffffff';
            wrapper.style.padding = '0';
            wrapper.style.margin = '0';
            wrapper.appendChild(clone);

            const serialized = new XMLSerializer().serializeToString(wrapper);

            const svg =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
                `<foreignObject width="100%" height="100%">` +
                serialized +
                `</foreignObject></svg>`;

            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = url;
            });

            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);

            URL.revokeObjectURL(url);

            return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        } catch (e) {
            console.warn('foreignObject failed:', e);
            return null;
        }
    }

    function inlineStyles(source, target) {
        const sourceChildren = source.querySelectorAll('*');
        const targetChildren = target.querySelectorAll('*');
        copyStyle(source, target);
        for (let i = 0; i < sourceChildren.length; i++) {
            copyStyle(sourceChildren[i], targetChildren[i]);
        }
    }

    function copyStyle(src, dst) {
        const computed = window.getComputedStyle(src);
        let css = '';
        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            if (prop === 'backdrop-filter' || prop === 'webkit-backdrop-filter') continue;
            css += `${prop}:${computed.getPropertyValue(prop)};`;
        }
        dst.setAttribute('style', css);
    }
})();
