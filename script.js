// ===== 40 СТИЛЕЙ =====
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

const NEG = "people,humans,crowd,faces,animals,blurry,low quality,deformed,watermark,text";
const BLD = "architecture only,building exterior,facade,no people,no interior,photorealistic,8k";

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

// ===== КОНВЕРТАЦИЯ В BASE64 =====
function toBase64(url) {
    return new Promise((res, rej) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => {
            const c = document.createElement('canvas');
            let w = i.naturalWidth, h = i.naturalHeight;
            const m = 800;
            if (w > m || h > m) {
                const r = Math.min(m / w, m / h);
                w = Math.round(w * r);
                h = Math.round(h * r);
            }
            c.width = w;
            c.height = h;
            c.getContext('2d').drawImage(i, 0, 0, w, h);
            res(c.toDataURL('image/jpeg', 0.7));
        };
        i.onerror = rej;
        i.src = url;
    });
}

// ===== ЗВУК =====
const Aud = (() => {
    let c;
    const g = () => { if (!c) c = new (window.AudioContext || window.webkitAudioContext)(); return c; };
    const t = (f, tp, d, v = 0.1) => {
        if (!S.sound) return;
        try {
            const x = g(), o = x.createOscillator(), gn = x.createGain();
            o.type = tp;
            o.frequency.setValueAtTime(f, x.currentTime);
            gn.gain.setValueAtTime(v, x.currentTime);
            gn.gain.exponentialRampToValueAtTime(0.001, x.currentTime + d);
            o.connect(gn); gn.connect(x.destination);
            o.start(); o.stop(x.currentTime + d);
        } catch (e) {}
    };
    return {
        click: () => t(800 + Math.random() * 400, 'sine', 0.08, 0.05),
        ok: () => { t(523, 'triangle', 0.3); setTimeout(() => t(659, 'triangle', 0.4), 150); },
        err: () => t(150, 'sawtooth', 0.5, 0.15),
        whistle: () => {
            if (!S.sound) return;
            try {
                const x = g(), o = x.createOscillator(), gn = x.createGain();
                o.frequency.setValueAtTime(880, x.currentTime);
                o.frequency.exponentialRampToValueAtTime(1760, x.currentTime + 0.4);
                gn.gain.setValueAtTime(0.001, x.currentTime);
                gn.gain.linearRampToValueAtTime(0.3, x.currentTime + 0.1);
                gn.gain.exponentialRampToValueAtTime(0.001, x.currentTime + 1.2);
                o.connect(gn); gn.connect(x.destination);
                o.start(); o.stop(x.currentTime + 1.3);
            } catch (e) {}
        }
    };
})();

// ===== ГЕНЕРАЦИЯ =====
async function generate(prompt, seed, model) {
    const p = encodeURIComponent(prompt + ',' + BLD);
    const n = encodeURIComponent(NEG);
    const url = 'https://image.pollinations.ai/prompt/' + p + '?width=1024&height=1024&seed=' + seed + '&nologo=true&negative=' + n + '&model=' + model;
    const b64 = await toBase64(url);
    return { url: b64, rawUrl: url, engine: model };
}

async function genWithFallback(prompt, seed) {
    const models = ['sana', 'flux', 'turbo', 'sdxl'];
    const errs = [];
    for (const m of models) {
        try {
            return await generate(prompt, seed, m);
        } catch (e) {
            errs.push(m + ': ' + e.message);
            console.warn(m + ' failed:', e.message);
        }
    }
    throw new Error('Все модели недоступны:\n' + errs.join('\n'));
}

async function genCanvas(base64) {
    return new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => {
            const c = document.createElement('canvas');
            let w = i.naturalWidth, h = i.naturalHeight;
            const m = 800;
            if (w > m || h > m) {
                const r = Math.min(m / w, m / h);
                w = Math.round(w * r);
                h = Math.round(h * r);
            }
            c.width = w; c.height = h;
            const x = c.getContext('2d');
            x.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
            x.drawImage(i, 0, 0, w, h);
            res({ url: c.toDataURL('image/jpeg', 0.7), engine: 'Canvas Offline' });
        };
        i.onerror = () => rej(new Error('Не удалось прочитать изображение'));
        i.src = base64;
    });
}

// ===== ПРИЛОЖЕНИЕ =====
let curPage = 'generate';
let lastPrompt = '';
let lastStyle = '';

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
    document.getElementById('f-acc').textContent = tot ? Math.round(S.learn.l / tot * 100) : 0;
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
    e.className = 'coin-plus';
    e.textContent = '+1 🪙';
    e.style.left = x + 'px';
    e.style.top = y + 'px';
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
        c.innerHTML = '<h2 class="page-title">📝 Генерация здания</h2>' +
            '<div class="form-grid">' +
            '<div class="form-group full-width"><label>Описание</label><textarea id="gp" placeholder="Опишите здание подробно..."></textarea></div>' +
            '<div class="form-group"><label>Стиль (' + Object.keys(STYLES).length + ')</label><select id="gs">' +
            Object.keys(STYLES).map(s => '<option>' + s + '</option>').join('') +
            '</select></div>' +
            '<div class="form-group"><label>Seed</label><input type="number" id="gseed" placeholder="Случайно"></div>' +
            '</div>' +
            '<button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button>' +
            '<div id="res-area"></div>';

    } else if (page === 'restore') {
        c.innerHTML = '<h2 class="page-title">🔨 Реставрация фасада</h2>' +
            '<p style="color:var(--text-muted);margin-bottom:20px">Загрузите фото старого здания для улучшения качества.</p>' +
            '<div class="form-grid"><div class="form-group full-width"><label>Фотография</label><input type="file" id="rf" accept="image/*"></div></div>' +
            '<button class="btn gothic-btn" id="btn-res">🏗️ Начать реставрацию</button>' +
            '<div id="res-area"></div>';

    } else if (page === 'gallery') {
        c.innerHTML = '<h2 class="page-title">🖼️ Галерея</h2>';
        if (!S.history.length) {
            c.innerHTML += '<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста. Создайте первый проект!</p>';
        } else {
            const g = document.createElement('div');
            g.className = 'gallery-grid';
            S.history.forEach((item, idx) => {
                const d = document.createElement('div');
                d.className = 'gallery-item';
                d.innerHTML = '<img src="' + item.url + '" loading="lazy" onclick="openLB(' + idx + ')">' +
                    '<div class="gallery-item-meta"><span class="style">' + (item.style || 'Custom') + '</span>' +
                    '<span class="time">' + new Date(item.date).toLocaleString() + ' · ' + item.engine + '</span></div>';
                g.appendChild(d);
            });
            c.appendChild(g);
        }

    } else if (page === 'learning') {
        const tot = S.learn.l + S.learn.d;
        const acc = tot ? Math.round(S.learn.l / tot * 100) : 0;
        c.innerHTML = '<h2 class="page-title">🧠 Обучение</h2>' +
            '<div class="learning-stats">' +
            '<div class="stat-card"><div class="stat-value">' + S.learn.g + '</div>Генераций</div>' +
            '<div class="stat-card"><div class="stat-value" style="color:var(--success)">' + S.learn.l + '</div>Лайков</div>' +
            '<div class="stat-card"><div class="stat-value" style="color:var(--error)">' + S.learn.d + '</div>Дизлайков</div>' +
            '<div class="stat-card"><div class="stat-value" style="color:var(--grad-b)">' + acc + '%</div>Точность</div>' +
            '</div>';

    } else {
        c.innerHTML = '<h2 class="page-title">ℹ️ О проекте</h2>' +
            '<p><b>Реставратор фасадов</b> — полностью клиентская JS-версия.<br>' +
            '40 архитектурных стилей · Sana + Flux + Turbo + Horde<br>' +
            'Галерея сохраняется локально в браузере.</p>';
    }

    m.appendChild(c);
    bindPage();
}

function showResult(data) {
    const a = document.getElementById('res-area');
    a.innerHTML = '<div class="result">' +
        '<img src="' + data.url + '" onclick="openLB(0)">' +
        '<div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">Стиль: <b>' + data.style + '</b> | Движок: <b>' + data.engine + '</b></div>' +
        '<div class="result-actions">' +
        '<button class="btn-like" onclick="vote(\'l\')">👍 Нравится</button>' +
        '<button class="btn-dislike" onclick="vote(\'d\')">👎 Не нравится</button>' +
        '<a href="' + data.url + '" download="facade_' + Date.now() + '.jpg" class="btn btn-secondary">💾 Скачать</a>' +
        '</div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    const a = document.getElementById('res-area');
    a.innerHTML = '<div class="result" style="border-color:var(--error)">' +
        '<div style="font-size:3rem;margin-bottom:15px">⚠️</div>' +
        '<h3 style="color:var(--error);margin-bottom:10px">Ошибка генерации</h3>' +
        '<p style="color:var(--text-muted);margin-bottom:20px;white-space:pre-line;font-size:.9rem">' + msg + '</p>' +
        '<div class="result-actions">' +
        '<button class="btn gothic-btn" id="btn-retry">🔄 Повторить</button>' +
        '<button class="btn btn-secondary" onclick="document.getElementById(\'res-area\').innerHTML=\'\'">✕ Закрыть</button>' +
        '</div></div>';
    document.getElementById('btn-retry').onclick = () => doGen(lastPrompt, lastStyle);
    a.scrollIntoView({ behavior: 'smooth' });
}

function vote(type) {
    S.learn[type === 'l' ? 'l' : 'd']++;
    save(); updateUI();
    document.querySelector('.result-actions').innerHTML = '<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>';
    Aud.click();
}

function openLB(idx) {
    const item = S.history[idx];
    if (!item) return;
    const m = document.getElementById('teapot-modal');
    const b = m.querySelector('.teapot-box');
    b.innerHTML = '<button class="lightbox-close" onclick="closeLB()">×</button>' +
        '<img src="' + item.url + '" style="max-width:100%;max-height:70vh;border-radius:var(--radius);border:2px solid var(--accent)">' +
        '<div style="margin-top:10px;color:var(--text-muted);font-size:.85rem">' + (item.style || '') + ' · ' + item.engine + '</div>';
    m.classList.add('active');
}

function closeLB() {
    const m = document.getElementById('teapot-modal');
    m.classList.remove('active');
    setTimeout(() => {
        m.querySelector('.teapot-box').innerHTML =
            '<button class="lightbox-close" id="teapot-close">×</button>' +
            '<div style="font-size:100px">🫖</div>' +
            '<h2>418 — Я чайник!</h2>' +
            '<p>+1 🍵 чайный пакетик!</p>' +
            '<button class="btn gothic-btn" id="teapot-sound-btn">🔊 Звук</button>';
        document.getElementById('teapot-close').onclick = closeLB;
        document.getElementById('teapot-sound-btn').onclick = Aud.whistle;
    }, 300);
}

async function doGen(prompt, style) {
    lastPrompt = prompt;
    lastStyle = style;
    const seed = Math.floor(Math.random() * 999999);
    const full = [prompt, STYLES[style]].filter(Boolean).join(', ');

    showLoad('🎨 Генерация через ' + S.engine + '...');

    try {
        let r;
        if (S.engine === 'horde') {
            r = await generate(full, seed, 'flux-realism');
            r.engine = 'AI Horde';
        } else if (S.engine === 'canvas') {
            alert('Движок Canvas только для реставрации.\nВыберите Pollinations или AI Horde.');
            hideLoad();
            return;
        } else {
            r = await genWithFallback(full, seed);
        }

        r.style = style;
        r.date = new Date().toISOString();
        S.history.unshift(r);
        if (S.history.length > 50) S.history = S.history.slice(0, 50);
        S.learn.g++;
        save();
        updateUI();
        showResult(r);
        Aud.ok();
    } catch (e) {
        console.error('Generation error:', e);
        showError(e.message + '\n\nПопробуйте другой движок в настройках ⚙️');
        Aud.err();
    } finally {
        hideLoad();
    }
}

function bindPage() {
    const gb = document.getElementById('btn-gen');
    if (gb) gb.onclick = () => {
        const p = document.getElementById('gp').value.trim();
        const s = document.getElementById('gs').value;
        if (!p && s === 'Без стиля') return alert('Введите описание или выберите стиль');
        doGen(p, s);
    };

    const rb = document.getElementById('btn-res');
    if (rb) rb.onclick = async () => {
        const f = document.getElementById('rf').files[0];
        if (!f) return alert('Выберите изображение для реставрации');
        showLoad('🔨 Реставрация фасада...');
        const rd = new FileReader();
        rd.onload = async (e) => {
            try {
                const r = await genCanvas(e.target.result);
                r.style = 'Restored';
                r.date = new Date().toISOString();
                S.history.unshift(r);
                if (S.history.length > 50) S.history = S.history.slice(0, 50);
                S.learn.g++;
                save();
                updateUI();
                showResult(r);
                Aud.ok();
            } catch (err) {
                showError(err.message);
                Aud.err();
            } finally {
                hideLoad();
            }
        };
        rd.readAsDataURL(f);
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
        s.className = 'star';
        s.style.left = (5 + i * 10) + '%';
        s.style.animationDelay = (i * 0.8) + 's';
        sb.appendChild(s);
    }

    // Навигация
    document.querySelectorAll('.nav-btn').forEach(b =>
        b.addEventListener('click', e => { e.preventDefault(); navigate(b.dataset.page); })
    );

    // Панель настроек
    const panel = document.getElementById('settings-panel');
    document.getElementById('settings-btn').addEventListener('click', e => {
        e.stopPropagation(); panel.classList.toggle('open');
    });
    document.addEventListener('click', e => {
        if (!panel.contains(e.target) && e.target.id !== 'settings-btn') panel.classList.remove('open');
    });

    // Тема
    document.querySelectorAll('.theme-btn').forEach(b =>
        b.addEventListener('click', () => { setTheme(b.dataset.theme); Aud.click(); })
    );

    // Звук
    document.getElementById('sound-on').checked = S.sound;
    document.getElementById('sound-on').addEventListener('change', e => { S.sound = e.target.checked; save(); });

    // Движок
    document.getElementById('engine-select').value = S.engine;
    document.getElementById('engine-select').addEventListener('change', e => { S.engine = e.target.value; save(); Aud.click(); });

    // Сброс
    document.getElementById('reset-coins').addEventListener('click', () => {
        S.coins = 0; S.tea = 0; save(); updateUI(); Aud.click();
    });

    // Хомяк
    const ham = document.getElementById('hamster');
    ham.addEventListener('click', e => {
        e.stopPropagation();
        ham.classList.remove('tap'); void ham.offsetWidth; ham.classList.add('tap');
        S.coins++; save(); updateUI();
        spawnCoin(e.clientX, e.clientY);
        Aud.click();
    });

    // Чайник (скрытая пасхалка)
    document.getElementById('teapot-link').addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('teapot-modal').classList.add('active');
        S.tea++; save(); updateUI();
        Aud.whistle();
    });

    document.getElementById('teapot-close').onclick = closeLB;
    document.getElementById('teapot-sound-btn').onclick = Aud.whistle;
});
