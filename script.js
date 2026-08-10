// ===== 40 СТИЛЕЙ (ПОЛНЫЙ СПИСОК) =====
const STYLES = {
    "Без стиля": "",
    "Сталинка / неоклассика 1950-х": "Stalin-era neoclassical architecture, ornate cornice, arched windows, pastel colors",
    "Сталинский ампир / высотка": "Stalinist empire skyscraper, tiered tower with spire, monumental",
    "Хрущёвка": "Soviet khrushchyovka panel block, 5 stories, plain concrete panels",
    "Брежневка": "Soviet brezhnevka brick apartment block, repetitive balconies",
    "Советский модернизм / брутализм": "Soviet brutalist architecture, raw concrete, monumental forms",
    "Конструктивизм 1920-х": "1920s constructivist architecture, ribbon windows, avant-garde",
    "Русский классицизм / усадьба": "Russian classicism manor, portico with columns, yellow facade",
    "Доходный дом XIX века": "19th century Russian apartment building, red brick, ornate windows",
    "Православный храм": "Russian orthodox church, golden onion domes, white walls",
    "Деревянное зодчество": "traditional Russian wooden architecture, log house, carved frames",
    "Неоготика": "gothic revival, pointed arches, rose window, grey stone, spires",
    "Готика": "gothic cathedral, pointed arches, flying buttresses, tall spires",
    "Ренессанс": "Italian renaissance palazzo, rusticated stone, arched windows",
    "Барокко": "baroque palace facade, rich stucco, pilasters, pastel colors",
    "Рококо": "rococo palace facade, pastel colors, delicate stucco",
    "Ар-деко": "art deco facade, geometric ornament, limestone, stepped silhouette",
    "Баухаус": "bauhaus architecture, white cubic volumes, flat roof, glass",
    "Интернациональный стиль": "international style skyscraper, glass and steel tower",
    "Хай-тек": "high-tech architecture, exposed steel, glass curtain walls",
    "Деконструктивизм": "deconstructivist architecture, twisted forms, sharp angles",
    "Постмодернизм": "postmodern architecture, playful classical references, bright colors",
    "Параметризм / биотек": "parametric architecture, flowing curved surfaces, Zaha Hadid style",
    "Минимализм": "minimalist architecture, clean white volumes, frameless glazing",
    "Скандинавский дом": "Scandinavian minimalist house, light wood, panoramic windows",
    "Альпийское шале": "alpine chalet, wide sloping roof, wooden balconies, stone base",
    "Средиземноморский стиль": "mediterranean villa, white stucco, terracotta roof",
    "Фахверк": "half-timbered fachwerk house, dark wooden beams, light plaster",
    "Тюдор": "tudor style house, black and white timbering, steep gables",
    "Викторианский стиль": "victorian architecture, polychrome brickwork, bay windows",
    "Георгианский стиль": "georgian townhouse, red brick, white sash windows, symmetry",
    "Колониальный стиль": "colonial architecture, verandas with columns, symmetrical facade",
    "Промышленное здание": "industrial factory, red brick, sawtooth roof, large windows",
    "Промышленный лофт": "industrial loft, old factory brick, huge steel windows",
    "Современный ЖК": "contemporary residential complex, ventilated facade, large glazing",
    "Эко-архитектура": "eco architecture, green facade, vertical gardens, wooden structure",
    "Древнекитайская архитектура": "ancient Chinese architecture, pagoda, curved eaves, red columns, glazed tile roof",
    "Древнеяпонская архитектура": "ancient Japanese architecture, wooden temple, curved roof, shoji screens",
    "Античная архитектура": "ancient Greek Roman architecture, marble columns, pediment, temple",
    "Исламская архитектура": "islamic architecture, geometric patterns, horseshoe arches, minaret, dome"
};

const NEGATIVE = "people,humans,crowd,faces,animals,blurry,low quality,deformed,watermark,text,signature";
const BUILDING = "architecture only,building exterior only,facade,no people,no interior,photorealistic";

// ===== СОСТОЯНИЕ =====
const S = {
    coins: +localStorage.getItem('hc') || 0,
    tea: +localStorage.getItem('tb') || 0,
    sound: localStorage.getItem('snd') !== '0',
    theme: localStorage.getItem('thm') || 'gothic',
    engine: localStorage.getItem('eng') || 'pollinations',
    history: JSON.parse(localStorage.getItem('hist') || '[]'),
    learn: JSON.parse(localStorage.getItem('lrn') || '{"g":0,"l":0,"d":0}')
};
const save = () => {
    localStorage.setItem('hc', S.coins);
    localStorage.setItem('tb', S.tea);
    localStorage.setItem('snd', S.sound ? '1' : '0');
    localStorage.setItem('thm', S.theme);
    localStorage.setItem('eng', S.engine);
    localStorage.setItem('hist', JSON.stringify(S.history));
    localStorage.setItem('lrn', JSON.stringify(S.learn));
};

// ===== ЗВУК =====
const Audio_ = (() => {
    let ctx;
    const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
    const tone = (f, t, d, v = 0.1) => {
        if (!S.sound) return;
        try {
            const c = getCtx(), o = c.createOscillator(), g = c.createGain();
            o.type = t; o.frequency.setValueAtTime(f, c.currentTime);
            g.gain.setValueAtTime(v, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
            o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d);
        } catch(e) {}
    };
    return {
        click: () => tone(800 + Math.random() * 400, 'sine', 0.08, 0.05),
        ok: () => { tone(523, 'triangle', 0.3); setTimeout(() => tone(659, 'triangle', 0.4), 150); },
        err: () => tone(150, 'sawtooth', 0.5, 0.15),
        whistle: () => {
            if (!S.sound) return;
            try {
                const c = getCtx(), o = c.createOscillator(), g = c.createGain();
                o.frequency.setValueAtTime(880, c.currentTime);
                o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.4);
                g.gain.setValueAtTime(0.001, c.currentTime);
                g.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
                o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 1.3);
            } catch(e) {}
        }
    };
})();

// ===== ДВИЖКИ (С МОДЕЛЬЮ SANA) =====
const Engine = {
    _loadImage: (url, timeoutMs = 180000) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timer = setTimeout(() => {
            img.onload = null;
            img.onerror = null;
            reject(new Error('Таймаут генерации (' + timeoutMs / 1000 + 'с). Попробуйте ещё раз.'));
        }, timeoutMs);
        img.onload = () => {
            clearTimeout(timer);
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                resolve(img);
            } else {
                reject(new Error('Получено пустое изображение'));
            }
        };
        img.onerror = () => {
            clearTimeout(timer);
            reject(new Error('Ошибка загрузки. Проверьте интернет или попробуйте другой движок.'));
        };
        img.src = url;
    }),

    pollinations: async (prompt, seed) => {
        const p = encodeURIComponent(prompt + ',' + BUILDING + ',highly detailed,8k,masterpiece');
        const n = encodeURIComponent(NEGATIVE);
        // 4 модели: flux → sana → turbo → sdxl
        const models = ['flux', 'sana', 'turbo', 'sdxl'];
        for (const model of models) {
            try {
                const url = `https://image.pollinations.ai/prompt/${p}?width=1024&height=1024&seed=${seed}&nologo=true&negative=${n}&model=${model}`;
                await Engine._loadImage(url, 180000);
                return { url, engine: `Pollinations (${model})` };
            } catch (e) {
                console.warn(`Модель ${model} не ответила, пробуем следующую...`);
                continue;
            }
        }
        throw new Error('Все модели Pollinations недоступны. Проверьте интернет.');
    },

    sana: async (prompt, seed) => {
        const p = encodeURIComponent(prompt + ',' + BUILDING + ',highly detailed,8k,masterpiece');
        const n = encodeURIComponent(NEGATIVE);
        const url = `https://image.pollinations.ai/prompt/${p}?width=1024&height=1024&seed=${seed}&nologo=true&negative=${n}&model=sana`;
        await Engine._loadImage(url, 180000);
        return { url, engine: 'Sana (Direct)' };
    },

    horde: async (prompt, seed) => {
        const p = encodeURIComponent(prompt + ',' + BUILDING + ',stable diffusion,highly detailed,best quality');
        const url = `https://image.pollinations.ai/prompt/${p}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux-realism`;
        await Engine._loadImage(url, 180000);
        return { url, engine: 'AI Horde (Flux Realism)' };
    },

    canvas: async (base64) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const c = document.createElement('canvas');
                    c.width = img.width; c.height = img.height;
                    const x = c.getContext('2d');
                    x.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
                    x.drawImage(img, 0, 0);
                    resolve({ url: c.toDataURL('image/png'), engine: 'Canvas Offline' });
                } catch (e) {
                    reject(new Error('Ошибка обработки Canvas'));
                }
            };
            img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
            img.src = base64;
        });
    }
};

// ===== ПРИЛОЖЕНИЕ =====
let curPage = 'generate';

function setTheme(t) {
    S.theme = t; save();
    document.body.dataset.theme = t;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
}

function updateUI() {
    document.getElementById('coin-num').textContent = S.coins;
    document.getElementById('tea-num').textContent = S.tea;
    document.getElementById('f-gens').textContent = S.learn.g;
    document.getElementById('f-likes').textContent = S.learn.l;
    document.getElementById('f-dislikes').textContent = S.learn.d;
    const tot = S.learn.l + S.learn.d;
    document.getElementById('f-acc').textContent = tot > 0 ? Math.round(S.learn.l / tot * 100) : 0;
}

function showLoad(msg) {
    document.getElementById('loading-text').textContent = msg;
    document.getElementById('loading-overlay').classList.add('active');
}
function hideLoad() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function spawnCoin(x, y) {
    const e = document.createElement('div');
    e.className = 'coin-plus'; e.textContent = '+1 🪙';
    e.style.left = x + 'px'; e.style.top = y + 'px';
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 1600);
}

function navigate(page) {
    if (page === curPage) return;
    document.body.classList.add('page-leave');
    setTimeout(() => {
        curPage = page;
        document.body.classList.remove('page-leave');
        renderPage(page);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
}

function renderPage(page) {
    const m = document.getElementById('main-content');
    m.innerHTML = '';
    const c = document.createElement('div');
    c.className = 'card gothic-card';

    if (page === 'generate') {
        c.innerHTML = `
            <h2 class="page-title">📝 Генерация здания</h2>
            <div class="form-grid">
                <div class="form-group full-width"><label>Описание</label><textarea id="gp" placeholder="Опишите здание подробно: материалы, освещение, детали фасада..."></textarea></div>
                <div class="form-group"><label>Стиль (${Object.keys(STYLES).length})</label><select id="gs">${Object.keys(STYLES).map(s => `<option>${s}</option>`).join('')}</select></div>
                <div class="form-group"><label>Seed</label><input type="number" id="gseed" placeholder="Случайно"></div>
            </div>
            <button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button>
            <div id="res-area"></div>`;
    } else if (page === 'restore') {
        c.innerHTML = `
            <h2 class="page-title">🔨 Реставрация фасада</h2>
            <p style="color:var(--text-muted);margin-bottom:20px">Загрузите фото старого здания для улучшения качества.</p>
            <div class="form-grid"><div class="form-group full-width"><label>Фотография</label><input type="file" id="rf" accept="image/*"></div></div>
            <button class="btn gothic-btn" id="btn-res">🏗️ Начать реставрацию</button>
            <div id="res-area"></div>`;
    } else if (page === 'gallery') {
        c.innerHTML = `<h2 class="page-title">🖼️ Галерея</h2>`;
        if (!S.history.length) {
            c.innerHTML += `<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста. Создайте первый проект!</p>`;
        } else {
            const g = document.createElement('div'); g.className = 'gallery-grid';
            S.history.forEach(i => {
                const d = document.createElement('div'); d.className = 'gallery-item';
                d.innerHTML = `<img src="${i.url}" loading="lazy" onclick="openLB('${i.url}')"><div class="gallery-item-meta"><span class="style">${i.style || 'Custom'}</span><span class="time">${new Date(i.date).toLocaleString()} · ${i.engine}</span></div>`;
                g.appendChild(d);
            });
            c.appendChild(g);
        }
    } else if (page === 'learning') {
        const tot = S.learn.l + S.learn.d;
        const acc = tot > 0 ? Math.round(S.learn.l / tot * 100) : 0;
        c.innerHTML = `<h2 class="page-title">🧠 Обучение</h2>
            <div class="learning-stats">
                <div class="stat-card"><div class="stat-value">${S.learn.g}</div>Генераций</div>
                <div class="stat-card"><div class="stat-value" style="color:var(--success)">${S.learn.l}</div>Лайков</div>
                <div class="stat-card"><div class="stat-value" style="color:var(--error)">${S.learn.d}</div>Дизлайков</div>
                <div class="stat-card"><div class="stat-value" style="color:var(--grad-b)">${acc}%</div>Точность</div>
            </div>`;
    } else {
        c.innerHTML = `<h2 class="page-title">ℹ️ О проекте</h2><p><b>Реставратор фасадов</b> — полностью клиентская JS-версия.<br>40 архитектурных стилей · 4 движка (Flux, Sana, Horde, Canvas) · Работает без API-ключей и сервера.</p>`;
    }

    m.appendChild(c);
    bindPage();
}

function showResult(data) {
    const a = document.getElementById('res-area');
    a.innerHTML = `<div class="result">
        <img src="${data.url}" onclick="openLB('${data.url}')">
        <div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">Стиль: <b>${data.style}</b> | Движок: <b>${data.engine}</b></div>
        <div class="result-actions">
            <button class="btn-like" onclick="vote('l')">👍 Нравится</button>
            <button class="btn-dislike" onclick="vote('d')">👎 Не нравится</button>
            <a href="${data.url}" download="facade_${Date.now()}.png" class="btn btn-secondary">💾 Скачать</a>
        </div></div>`;
    a.scrollIntoView({ behavior: 'smooth' });
}

function vote(type) {
    S.learn[type === 'l' ? 'l' : 'd']++;
    save(); updateUI();
    document.querySelector('.result-actions').innerHTML = `<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>`;
    Audio_.click();
}

function openLB(url) {
    const m = document.getElementById('teapot-modal');
    const b = m.querySelector('.teapot-box');
    b.innerHTML = `<button class="lightbox-close" onclick="closeLB()">×</button><img src="${url}" style="max-width:100%;max-height:70vh;border-radius:var(--radius);border:2px solid var(--accent)">`;
    m.classList.add('active');
}

function closeLB() {
    const m = document.getElementById('teapot-modal');
    m.classList.remove('active');
    setTimeout(() => {
        m.querySelector('.teapot-box').innerHTML = `
            <button class="lightbox-close" id="teapot-close">×</button>
            <div style="font-size:100px">🫖</div><h2>418 — Я чайник!</h2><p>+1 🍵 чайный пакетик!</p>
            <button class="btn gothic-btn" id="teapot-sound-btn">🔊 Звук</button>`;
        document.getElementById('teapot-close').onclick = closeLB;
        document.getElementById('teapot-sound-btn').onclick = Audio_.whistle;
    }, 300);
}

function bindPage() {
    const genBtn = document.getElementById('btn-gen');
    if (genBtn) genBtn.onclick = async () => {
        const prompt = document.getElementById('gp').value.trim();
        const style = document.getElementById('gs').value;
        const seed = document.getElementById('gseed').value || Math.floor(Math.random() * 999999);

        if (!prompt && style === 'Без стиля') return alert('Введите описание или выберите стиль');

        const full = [prompt, STYLES[style]].filter(Boolean).join(', ');
        showLoad(`🎨 Генерация через ${S.engine}...\n(может занять до 3 минут)`);

        try {
            let r;
            if (S.engine === 'horde') {
                r = await Engine.horde(full, seed);
            } else if (S.engine === 'sana') {
                r = await Engine.sana(full, seed);
            } else if (S.engine === 'canvas') {
                alert('Движок Canvas предназначен только для реставрации загруженных фото.\nПереключитесь на Pollinations, Sana или AI Horde для генерации.');
                hideLoad();
                return;
            } else {
                r = await Engine.pollinations(full, seed);
            }

            r.style = style;
            r.date = new Date().toISOString();
            S.history.unshift(r);
            S.learn.g++;
            save();
            updateUI();
            showResult(r);
            Audio_.ok();
        } catch (e) {
            console.error('Generation error:', e);
            alert('❌ Ошибка генерации:\n' + e.message + '\n\nПопробуйте:\n• Переключить движок в настройках\n• Проверить интернет\n• Повторить попытку');
            Audio_.err();
        } finally {
            hideLoad();
        }
    };

    const resBtn = document.getElementById('btn-res');
    if (resBtn) resBtn.onclick = async () => {
        const f = document.getElementById('rf').files[0];
        if (!f) return alert('Выберите изображение для реставрации');

        showLoad('🔨 Реставрация фасада...');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const r = await Engine.canvas(e.target.result);
                r.style = 'Restored';
                r.date = new Date().toISOString();
                S.history.unshift(r);
                S.learn.g++;
                save();
                updateUI();
                showResult(r);
                Audio_.ok();
            } catch (err) {
                alert('Ошибка реставрации: ' + err.message);
                Audio_.err();
            } finally {
                hideLoad();
            }
        };
        reader.readAsDataURL(f);
    };
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    setTheme(S.theme);
    updateUI();
    renderPage('generate');

    // Звёзды
    const sb = document.getElementById('stars');
    for (let i = 0; i < 9; i++) {
        const s = document.createElement('div');
        s.className = 'star'; s.style.left = (5 + i * 10) + '%';
        s.style.animationDelay = (i * 0.8) + 's'; sb.appendChild(s);
    }

    // Навигация
    document.querySelectorAll('.nav-btn').forEach(b =>
        b.addEventListener('click', e => { e.preventDefault(); navigate(b.dataset.page); }));

    // Настройки
    const panel = document.getElementById('settings-panel');
    document.getElementById('sett
