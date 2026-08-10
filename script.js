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

function toBase64(url) {
    return new Promise((res, rej) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => {
            const c = document.createElement('canvas');
            let w = i.naturalWidth, h = i.naturalHeight;
            const m = 800;
            if (w > m || h > m) { const r = Math.min(m / w, m / h); w = Math.round(w * r); h = Math.round(h * r); }
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(i, 0, 0, w, h);
            res(c.toDataURL('image/jpeg', 0.7));
        };
        i.onerror = rej;
        i.src = url;
    });
}

const Aud = (() => {
    let c;
    const g = () => { if (!c) c = new (window.AudioContext || window.webkitAudioContext)(); return c; };
    const t = (f, tp, d, v) => {
        if (!S.sound) return;
        try {
            const x = g(), o = x.createOscillator(), gn = x.createGain();
            o.type = tp; o.frequency.setValueAtTime(f, x.currentTime);
            gn.gain.setValueAtTime(v || 0.1, x.currentTime);
            gn.gain.exponentialRampToValueAtTime(0.001, x.currentTime + d);
            o.connect(gn); gn.connect(x.destination); o.start(); o.stop(x.currentTime + d);
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
                o.connect(gn); gn.connect(x.destination); o.start(); o.stop(x.currentTime + 1.3);
            } catch (e) {}
        }
    };
})();

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
        try { return await generate(prompt, seed, m); }
        catch (e) { errs.push(m + ': ' + (e.message || 'unknown')); console.warn(m + ' failed:', e.message); }
    }
    throw new Error('Все модели недоступны:\n' + errs.join('\n'));
}

async function restoreImage(originalBase64, description, style) {
    const styleDesc = STYLES[style] || '';
    const analysis = await new Promise((res) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = 32; c.height = 32;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, 32, 32);
            const data = ctx.getImageData(0, 0, 32, 32).data;
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
            r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
            const lum = 0.299*r + 0.587*g + 0.114*b;
            const tone = lum < 90 ? 'dark moody atmosphere' : (lum > 170 ? 'bright daylight' : 'soft natural light');
            let hue = 'gray weathered stone';
            if (r > g + 20 && r > b + 20) hue = 'reddish brick walls';
            else if (g > r + 10 && g > b + 10) hue = 'greenish overgrown facade';
            else if (b > r + 10 && b > g + 10) hue = 'bluish stone facade';
            else if (r > 150 && g > 130 && b < 100) hue = 'warm yellow plaster walls';
            res(tone + ', ' + hue + ', aged texture, weathered surface');
        };
        img.onerror = () => res('old building, weathered facade, aged texture');
        img.src = originalBase64;
    });
    const restorePrompt = [
        'beautiful restored building facade', 'pristine condition', 'newly repaired walls',
        'intact complete windows with glass', 'clean restored facade', 'no damage no cracks no ruins',
        'fully reconstructed', 'architectural photography', analysis, description, styleDesc, BLD
    ].filter(Boolean).join(', ');
    const p = encodeURIComponent(restorePrompt);
    const n = encodeURIComponent(NEG + ',ruins,damage,cracks,broken,destroyed,abandoned,graffiti,dirt,stains');
    const seed = Math.floor(Math.random() * 999999);
    const models = ['flux', 'sana', 'turbo', 'sdxl'];
    const errs = [];
    for (const model of models) {
        try {
            const url = 'https://image.pollinations.ai/prompt/' + p + '?width=1024&height=1024&seed=' + seed + '&nologo=true&negative=' + n + '&model=' + model;
            const b64 = await toBase64(url);
            return { url: b64, engine: 'Restoration (' + model + ')' };
        } catch (e) { errs.push(model + ': ' + (e.message || 'unknown error')); console.warn('Restore ' + model + ' failed:', e.message); }
    }
    throw new Error('Реставрация не удалась:\n' + errs.join('\n'));
}

// ===== КОНЕЦ ЧАСТИ 1 =====
// ===== НАЧАЛО ЧАСТИ 2 =====

let curPage = 'generate';
let lastPrompt = '';
let lastStyle = '';

function setTheme(t) { S.theme = t; save(); document.body.dataset.theme = t; document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === t)); }

function updateUI() {
    document.getElementById('coin-num').textContent = S.coins;
    document.getElementById('tea-num').textContent = S.tea;
    document.getElementById('f-gens').textContent = S.learn.g;
    document.getElementById('f-likes').textContent = S.learn.l;
    document.getElementById('f-dislikes').textContent = S.learn.d;
    const tot = S.learn.l + S.learn.d;
    document.getElementById('f-acc').textContent = tot ? Math.round(S.learn.l / tot * 100) : 0;
}

function showLoad(msg) { document.getElementById('loading-text').textContent = msg; document.getElementById('loading-overlay').classList.add('active'); }
function hideLoad() { document.getElementById('loading-overlay').classList.remove('active'); }

function spawnCoin(x, y) {
    const e = document.createElement('div'); e.className = 'coin-plus'; e.textContent = '+1 🪙';
    e.style.left = x + 'px'; e.style.top = y + 'px'; document.body.appendChild(e); setTimeout(() => e.remove(), 1600);
}

function navigate(page) {
    if (page === curPage) return;
    document.body.classList.add('page-leave');
    setTimeout(() => { curPage = page; document.body.classList.remove('page-leave'); renderPage(page); document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page)); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 450);
}

function renderPage(page) {
    const m = document.getElementById('main-content'); m.innerHTML = '';
    const c = document.createElement('div'); c.className = 'card gothic-card';
    if (page === 'generate') {
        c.innerHTML = '<h2 class="page-title">📝 Генерация здания</h2><div class="form-grid"><div class="form-group full-width"><label>Описание</label><textarea id="gp" placeholder="Опишите здание подробно..."></textarea></div><div class="form-group"><label>Стиль (' + Object.keys(STYLES).length + ')</label><select id="gs">' + Object.keys(STYLES).map(s => '<option>' + s + '</option>').join('') + '</select></div><div class="form-group"><label>Seed</label><input type="number" id="gseed" placeholder="Случайно"></div></div><button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button><div id="res-area"></div>';
    } else if (page === 'restore') {
        c.innerHTML = '<h2 class="page-title">🔨 Реставрация фасада</h2><p style="color:var(--text-muted);margin-bottom:20px">Загрузите фото разрушенного здания. ИИ достроит утраченные части.</p><div class="form-grid"><div class="form-group full-width"><label>Фото здания</label><input type="file" id="rf" accept="image/*"></div><div class="form-group full-width"><label>Что восстановить?</label><textarea id="rp" placeholder="Например: достроить крышу, восстановить окна, убрать трещины, вернуть лепнину..."></textarea></div><div class="form-group"><label>Стиль здания</label><select id="rs">' + Object.keys(STYLES).map(s => '<option>' + s + '</option>').join('') + '</select></div></div><button class="btn gothic-btn" id="btn-res">🏗️ Реставрировать</button><div id="res-area"></div>';
    } else if (page === 'gallery') {
        c.innerHTML = '<h2 class="page-title">🖼️ Галерея</h2>';
        if (!S.history.length) { c.innerHTML += '<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста. Создайте первый проект!</p>'; }
        else {
            c.innerHTML += '<div style="margin-bottom:20px;text-align:right"><button class="btn btn-secondary" id="btn-clear-gallery" style="border-color:var(--error);color:var(--error);padding:8px 16px;font-size:.85rem;min-height:auto">🗑️ Удалить всё</button></div>';
            const g = document.createElement('div'); g.className = 'gallery-grid';
            S.history.forEach((item, idx) => {
                const d = document.createElement('div'); d.className = 'gallery-item';
                d.innerHTML = '<img src="' + item.url + '" loading="lazy" onclick="openLB(' + idx + ')"><div class="gallery-item-meta"><span class="style">' + (item.style || 'Custom') + '</span><span class="time">' + new Date(item.date).toLocaleString() + ' · ' + item.engine + '</span></div><button class="btn-delete-single" data-idx="' + idx + '">🗑️ Удалить</button>';
                g.appendChild(d);
            });
            c.appendChild(g);
        }
    } else if (page === 'learning') {
        const tot = S.learn.l + S.learn.d; const acc = tot ? Math.round(S.learn.l / tot * 100) : 0;
        c.innerHTML = '<h2 class="page-title">🧠 Обучение</h2><div class="learning-stats"><div class="stat-card"><div class="stat-value">' + S.learn.g + '</div>Генераций</div><div class="stat-card"><div class="stat-value" style="color:var(--success)">' + S.learn.l + '</div>Лайков</div><div class="stat-card"><div class="stat-value" style="color:var(--error)">' + S.learn.d + '</div>Дизлайков</div><div class="stat-card"><div class="stat-value" style="color:var(--grad-b)">' + acc + '%</div>Точность</div></div>';
    } else {
        c.innerHTML = '<h2 class="page-title">ℹ️ О проекте</h2><p><b>Реставратор фасадов</b> — полностью клиентская JS-версия.<br>40 архитектурных стилей · Sana + Flux + Turbo + Horde<br>Реставрация анализирует фото и генерирует восстановленную версию.<br>Галерея сохраняется локально в браузере.</p>';
    }
    m.appendChild(c); bindPage(); bindGalleryButtons();
}

function showResult(data) {
    const a = document.getElementById('res-area');
    a.innerHTML = '<div class="result"><img src="' + data.url + '" onclick="openLB(0)"><div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">Стиль: <b>' + data.style + '</b> | Движок: <b>' + data.engine + '</b></div><div class="result-actions"><button class="btn-like" onclick="vote(\'l\')">👍 Нравится</button><button class="btn-dislike" onclick="vote(\'d\')">👎 Не нравится</button><a href="' + data.url + '" download="facade_' + Date.now() + '.jpg" class="btn btn-secondary">💾 Скачать</a></div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    const a = document.getElementById('res-area');
    a.innerHTML = '<div class="result" style="border-color:var(--error)"><div style="font-size:3rem;margin-bottom:15px">⚠️</div><h3 style="color:var(--error);margin-bottom:10px">Ошибка</h3><p style="color:var(--text-muted);margin-bottom:20px;white-space:pre-line;font-size:.9rem">' + msg + '</p><div class="result-actions"><button class="btn btn-secondary" onclick="document.getElementById(\'res-area\').innerHTML=\'\'">✕ Закрыть</button></div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function vote(type) { S.learn[type === 'l' ? 'l' : 'd']++; save(); updateUI(); document.querySelector('.result-actions').innerHTML = '<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>'; Aud.click(); }

function openLB(idx) {
    const item = S.history[idx]; if (!item) return;
    const modal = document.getElementById('teapot-modal'); const box = modal.querySelector('.teapot-box');
    box.innerHTML = '<button class="lightbox-close" onclick="closeLB()">×</button><img src="' + item.url + '" style="max-width:100%;max-height:70vh;border-radius:var(--radius);border:2px solid var(--accent)"><div style="margin-top:10px;color:var(--text-muted);font-size:.85rem">' + (item.style || '') + ' · ' + item.engine + '</div>';
    modal.classList.add('active');
}

function closeLB() {
    const modal = document.getElementById('teapot-modal'); modal.classList.remove('active');
    setTimeout(() => { modal.querySelector('.teapot-box').innerHTML = '<button class="lightbox-close" id="teapot-close">×</button><div style="font-size:100px">🫖</div><h2>418 — Я чайник!</h2><p>+1 🍵 чайный пакетик!</p><button class="btn gothic-btn" id="teapot-sound-btn">🔊 Звук</button>'; document.getElementById('teapot-close').onclick = closeLB; document.getElementById('teapot-sound-btn').onclick = Aud.whistle; }, 300);
}

async function doGen(prompt, style) {
    lastPrompt = prompt; lastStyle = style;
    const seed = Math.floor(Math.random() * 999999);
    const full = [prompt, STYLES[style]].filter(Boolean).join(', ');
    showLoad('🎨 Генерация через ' + S.engine + '...');
    try {
        let r;
        if (S.engine === 'horde') { r = await generate(full, seed, 'flux-realism'); r.engine = 'AI Horde'; }
        else if (S.engine === 'canvas') { alert('Движок Canvas только для офлайн-обработки.\nВыберите Pollinations или AI Horde.'); hideLoad(); return; }
        else { r = await genWithFallback(full, seed); }
        r.style = style; r.date = new Date().toISOString();
        S.history.unshift(r); if (S.history.length > 50) S.history = S.history.slice(0, 50);
        S.learn.g++; save(); updateUI(); showResult(r); Aud.ok();
    } catch (e) { console.error('Generation error:', e); showError(e.message + '\n\nПопробуйте другой движок ⚙️'); Aud.err(); }
    finally { hideLoad(); }
}

function bindPage() {
    const gb = document.getElementById('btn-gen');
    if (gb) { gb.onclick = () => { const p = document.getElementById('gp').value.trim(); const s = document.getElementById('gs').value; if (!p && s === 'Без стиля') return alert('Введите описание или выберите стиль'); doGen(p, s); }; }
    const rb = document.getElementById('btn-res');
    if (rb) { rb.onclick = async () => {
        const fileInput = document.getElementById('rf'); const desc = document.getElementById('rp').value.trim(); const style = document.getElementById('rs').value;
        if (!fileInput.files[0]) return alert('Загрузите фото здания');
        if (!desc) return alert('Опишите, что нужно восстановить');
        showLoad('🏗️ Реставрация фасада...\nИИ анализирует фото и достраивает утраченные части');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const r = await restoreImage(e.target.result, desc, style);
                r.style = style; r.date = new Date().toISOString();
                S.history.unshift(r); if (S.history.length > 50) S.history = S.history.slice(0, 50);
                S.learn.g++; save(); updateUI(); showResult(r); Aud.ok();
            } catch (err) { console.error('Restore error:', err); showError(err.message + '\n\nПопробуйте:\n• Упростить описание\n• Выбрать другой стиль\n• Повторить попытку'); Aud.err(); }
            finally { hideLoad(); }
        };
        reader.readAsDataURL(fileInput.files[0]);
    }; }
}

function bindGalleryButtons() {
    document.querySelectorAll('.btn-delete-single').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); const idx = parseInt(btn.dataset.idx); if (confirm('Удалить эту генерацию?')) { S.history.splice(idx, 1); save(); renderPage('gallery'); Aud.click(); } });
    });
    const clearBtn = document.getElementById('btn-clear-gallery');
    if (clearBtn) { clearBtn.addEventListener('click', () => { if (confirm('Удалить ВСЕ генерации из галереи?')) { S.history = []; save(); renderPage('gallery'); Aud.err(); } }); }
}

document.addEventListener('DOMContentLoaded', () => {
    setTheme(S.theme); updateUI(); renderPage('generate');
    const sb = document.getElementById('stars');
    for (let i = 0; i < 9; i++) { const s = document.createElement('div'); s.className = 'star'; s.style.left = (5 + i * 10) + '%'; s.style.animationDelay = (i * 0.8) + 's'; sb.appendChild(s); }
    document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', e => { e.preventDefault(); navigate(b.dataset.page); }));
    const panel = document.getElementById('settings-panel');
    document.getElementById('settings-btn').addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('open'); });
    document.addEventListener('click', e => { if (!panel.contains(e.target) && e.target.id !== 'settings-btn') panel.classList.remove('open'); });
    document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => { setTheme(b.dataset.theme); Aud.click(); }));
    document.getElementById('sound-on').checked = S.sound;
    document.getElementById('sound-on').addEventListener('change', e => { S.sound = e.target.checked; save(); });
    document.getElementById('engine-select').value = S.engine;
    document.getElementById('engine-select').addEventListener('change', e => { S.engine = e.target.value; save(); Aud.click(); });
    document.getElementById('reset-coins').addEventListener('click', () => { S.coins = 0; S.tea = 0; save(); updateUI(); Aud.click(); });
    const ham = document.getElementById('hamster');
    ham.addEventListener('click', e => { e.stopPropagation(); ham.classList.remove('tap'); void ham.offsetWidth; ham.classList.add('tap'); S.coins++; save(); updateUI(); spawnCoin(e.clientX, e.clientY); Aud.click(); });
    document.getElementById('teapot-link').addEventListener('click', e => { e.preventDefault(); document.getElementById('teapot-modal').classList.add('active'); S.tea++; save(); updateUI(); Aud.whistle(); });
    document.getElementById('teapot-close').onclick = closeLB;
    document.getElementById('teapot-sound-btn').onclick = Aud.whistle;
});
