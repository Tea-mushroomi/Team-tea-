/**
 * 🏛️ РЕСТАВРАТОР ФАСАДОВ v3.2 (FULL JS)
 * Полный список стилей, 3 движка, пасхалки и аналитика
 */

// ==========================================
// 1. ПОЛНЫЙ СПИСОК 40 СТИЛЕЙ (БЕЗ СОКРАЩЕНИЙ)
// ==========================================
const STYLES = {
    "Без стиля": "",
    "Сталинка / Неоклассика": "stalinist neoclassical architecture, ornate cornice, arched windows, pastel colors, monumental",
    "Сталинский Ампир / Высотка": "stalinist empire skyscraper, tiered tower with spire, monumental, red brick",
    "Хрущёвка": "soviet khrushchyovka panel block, 5 stories, plain concrete panels, repetitive balconies",
    "Брежневка": "soviet brezhnevka brick apartment block, repetitive balconies, utilitarian, 9-12 stories",
    "Советский Модернизм": "soviet modernism, brutalist forms, raw concrete, geometric shapes, mosaic art",
    "Конструктивизм 1920-х": "1920s constructivism, ribbon windows, avant-garde geometry, red brick and white plaster",
    "Русский Классицизм": "russian classicism manor, portico with columns, yellow facade, symmetrical, pediment",
    "Доходный дом XIX века": "19th century russian apartment building, red brick, ornate window frames, eclectic facade",
    "Православный Храм": "russian orthodox church, golden onion domes, white walls, intricate details, crosses",
    "Деревянное Зодчество": "traditional russian wooden architecture, log house, carved window frames (nalichniki), wood texture",
    "Неоготика": "gothic revival, pointed arches, rose window, grey stone, spires, intricate masonry",
    "Готика": "gothic cathedral, flying buttresses, tall spires, stained glass, verticality, dark stone",
    "Ренессанс": "italian renaissance palazzo, rusticated stone, arched windows, symmetry, harmonious proportions",
    "Барокко": "baroque palace facade, rich stucco, pilasters, pastel colors, dramatic lighting, gold accents",
    "Рококо": "rococo architecture, delicate ornamentation, pastel pink/blue, shell motifs, elegant curves",
    "Ар-Деко": "art deco facade, geometric ornament, limestone, stepped silhouette, luxury materials, zigzags",
    "Баухаус": "bauhaus architecture, white cubic volumes, flat roof, glass curtain wall, functionalism, primary colors",
    "Интернациональный стиль": "international style skyscraper, glass and steel tower, rectangular prism, minimalist",
    "Хай-Тек": "high-tech architecture, exposed steel structures, glass curtain walls, technological aesthetic, pipes",
    "Деконструктивизм": "deconstructivism, twisted forms, sharp angles, fragmented geometry, zaha hadid style, titanium",
    "Постмодернизм": "postmodern architecture, playful classical references, bright colors, irony, mixed styles",
    "Параметризм / Биотек": "parametric architecture, flowing curved surfaces, organic shapes, futuristic white concrete",
    "Минимализм": "minimalist architecture, clean white volumes, frameless glazing, pure geometry, zen garden",
    "Скандинавский дом": "scandinavian minimalist house, light wood cladding, panoramic windows, cozy atmosphere, pine trees",
    "Альпийское Шале": "alpine chalet, wide sloping roof, wooden balconies, stone base, mountain setting, snow",
    "Средиземноморский": "mediterranean villa, white stucco walls, terracotta roof tiles, arched doorways, vines",
    "Фахверк": "half-timbered fachwerk house, dark wooden beams, light plaster infill, german style, flower boxes",
    "Тюдор": "tudor style house, black and white timbering, steep gables, leaded glass windows, brick chimney",
    "Викторианский стиль": "victorian architecture, polychrome brickwork, bay windows, ornate trim, steep roof, turrets",
    "Георгианский стиль": "georgian townhouse, red brick, white sash windows, perfect symmetry, classical proportions",
    "Колониальный стиль": "colonial architecture, verandas with columns, symmetrical facade, shutters, tropical setting",
    "Промышленное здание": "industrial factory, red brick, sawtooth roof, large windows, smokestacks, utilitarian",
    "Промышленный Лофт": "industrial loft conversion, old factory brick, huge steel windows, fire escape, urban vibe",
    "Современный ЖК": "contemporary residential complex, ventilated facade, large glazing, balconies, landscaping",
    "Эко-архитектура": "eco architecture, green facade, vertical gardens, wooden structure, solar panels, sustainable",
    "Древнекитайская": "ancient chinese architecture, pagoda, curved eaves, red columns, glazed tile roof, dougong brackets",
    "Древнеяпонская": "ancient japanese architecture, wooden temple, curved roof, shoji screens, torii gate, zen",
    "Античная архитектура": "ancient greek roman temple, marble columns, pediment, classical orders, ruins, acropolis",
    "Исламская архитектура": "islamic architecture, geometric patterns, horseshoe arches, minaret, dome, zellige tiles, courtyard",
    "Киберпанк Здание": "cyberpunk architecture, neon lights, futuristic facade, rain-slicked, dystopian, holograms"
};

const ENHANCER_TAGS = ["architectural photography", "shot on Hasselblad", "8k resolution", "hyperrealistic", "sharp focus", "volumetric lighting"];
const NEGATIVE_PROMPT = "people, humans, crowd, cars, blurry, low quality, watermark, text, signature";

// ==========================================
// 2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ (STATE)
// ==========================================
const STATE = {
    page: 'generate',
    coins: parseInt(localStorage.getItem('rf_coins') || '0'),
    tea: parseInt(localStorage.getItem('rf_tea') || '0'),
    sound: localStorage.getItem('rf_sound') !== 'false',
    theme: localStorage.getItem('rf_theme') || 'gothic',
    token: localStorage.getItem('rf_token') || '',
    engine: localStorage.getItem('rf_engine') || 'pollinations',
    autoEnhance: localStorage.getItem('rf_enhance') !== 'false',
    history: JSON.parse(localStorage.getItem('rf_history') || '[]'),
    learning: JSON.parse(localStorage.getItem('rf_learning') || '{"gens":0,"likes":0,"dislikes":0,"styles":{}}')
};

const save = () => {
    localStorage.setItem('rf_coins', STATE.coins);
    localStorage.setItem('rf_tea', STATE.tea);
    localStorage.setItem('rf_sound', STATE.sound);
    localStorage.setItem('rf_theme', STATE.theme);
    localStorage.setItem('rf_token', STATE.token);
    localStorage.setItem('rf_engine', STATE.engine);
    localStorage.setItem('rf_enhance', STATE.autoEnhance);
    localStorage.setItem('rf_history', JSON.stringify(STATE.history));
    localStorage.setItem('rf_learning', JSON.stringify(STATE.learning));
};

// ==========================================
// 3. АУДИО ДВИЖОК
// ==========================================
const AudioEngine = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, type, dur, vol = 0.1) => {
        if (!STATE.sound) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + dur);
    };
    return {
        click: () => playTone(800 + Math.random() * 200, 'sine', 0.1, 0.05),
        coin: () => { if(!STATE.sound) return; playTone(1200, 'sine', 0.1, 0.1); setTimeout(() => playTone(1800, 'sine', 0.2, 0.1), 50); },
        success: () => { playTone(523.25, 'triangle', 0.3); setTimeout(() => playTone(659.25, 'triangle', 0.4), 150); },
        error: () => playTone(150, 'sawtooth', 0.5, 0.15),
        whistle: () => {
            if (!STATE.sound) return;
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 1.3);
        }
    };
})();

// ==========================================
// 4. ДВИЖКИ ГЕНЕРАЦИИ (3 ШТУКИ)
// ==========================================
const Engines = {
    // 1. Pollinations (Основной)
    pollinations: async (prompt, seed) => {
        const encoded = encodeURIComponent(`${prompt}, architectural photography, 8k, ultra detailed`);
        const neg = encodeURIComponent(NEGATIVE_PROMPT);
        const tokenParam = STATE.token ? `&token=${STATE.token}` : '';
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&negative=${neg}${tokenParam}&model=flux`;
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; setTimeout(() => rej(new Error("Timeout")), 90000); });
        return { url, engine: "Pollinations Flux" };
    },
    // 2. AI Horde (Симуляция через Flux Realism)
    horde: async (prompt, seed) => {
        const encoded = encodeURIComponent(`${prompt}, stable diffusion, highly detailed`);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux-realism`;
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = url;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; setTimeout(() => rej(new Error("Horde Timeout")), 120000); });
        return { url, engine: "AI Horde (Simulated)" };
    },
    // 3. Canvas Offline (Локальная обработка)
    canvas: async (base64) => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
                const ctx = c.getContext('2d');
                // Применяем фильтры "реставрации"
                ctx.filter = 'contrast(1.2) saturate(1.3) brightness(1.1)';
                ctx.drawImage(img, 0, 0);
                resolve({ url: c.toDataURL('image/png'), engine: "Canvas Offline Filter" });
            };
            img.src = base64;
        });
    }
};

// ==========================================
// 5. ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
// ==========================================
const App = {
    init: () => {
        App.applyTheme(); App.renderNav(); App.renderPage(STATE.page); App.updateBadges(); App.initFX(); App.bindGlobal();
    },
    applyTheme: () => {
        document.body.dataset.theme = STATE.theme;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === STATE.theme));
    },
    updateBadges: () => {
        document.getElementById('coin-num').textContent = STATE.coins;
        document.getElementById('tea-num').textContent = STATE.tea;
        document.getElementById('f-gens').textContent = STATE.learning.gens;
        const total = STATE.learning.likes + STATE.learning.dislikes;
        document.getElementById('f-acc').textContent = (total > 0 ? Math.round((STATE.learning.likes / total) * 100) : 0) + '%';
    },
    showLoading: (msg) => {
        document.getElementById('loading-msg').textContent = msg;
        document.getElementById('loading-overlay').classList.add('active');
        const bar = document.getElementById('progress-bar');
        bar.style.width = '0%'; setTimeout(() => bar.style.width = '40%', 100); setTimeout(() => bar.style.width = '70%', 800);
    },
    hideLoading: () => {
        document.getElementById('progress-bar').style.width = '100%';
        setTimeout(() => document.getElementById('loading-overlay').classList.remove('active'), 300);
    },
    spawnParticle: (x, y, text) => {
        const p = document.createElement('div'); p.className = 'particle'; p.textContent = text;
        p.style.left = x + 'px'; p.style.top = y + 'px'; document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },
    renderNav: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === STATE.page);
            btn.onclick = () => { STATE.page = btn.dataset.target; App.renderNav(); App.renderPage(STATE.page); AudioEngine.click(); };
        });
    },
    renderPage: (page) => {
        const container = document.getElementById('app-content');
        container.innerHTML = '<div class="card glass"></div>';
        const card = container.querySelector('.card');
        
        if (page === 'generate') {
            card.innerHTML = `
                <h2 class="page-title">📝 Генератор фасада</h2>
                <div class="form-grid">
                    <div class="form-group full"><label>Описание здания</label><textarea id="gen-prompt" placeholder="Опишите фасад детально..."></textarea></div>
                    <div class="form-group"><label>Архитектурный стиль (${Object.keys(STYLES).length})</label><select id="gen-style">${Object.keys(STYLES).map(s=>`<option>${s}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Seed (зерно)</label><input type="number" id="gen-seed" placeholder="Random"></div>
                </div>
                <button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button>
                <div id="result-area" class="result-area"></div>
            `;
        } else if (page === 'restore') {
            card.innerHTML = `<h2 class="page-title">🔨 Реставрация фасада</h2><p>Загрузите фото старого здания. Движок: ${STATE.engine}</p>
            <input type="file" id="res-file" accept="image/*" style="margin:20px 0">
            <button class="btn gothic-btn" id="btn-res">🏗️ Начать реставрацию</button><div id="res-result"></div>`;
        } else if (page === 'gallery') {
             card.innerHTML = `<h2 class="page-title">🖼️ Галерея проектов</h2><div class="gallery-grid">${STATE.history.map(i=>`<div class="gallery-item"><img src="${i.url}" onclick="App.openLB('${i.url}')"><div class="gallery-meta"><span class="gallery-style">${i.style||'Custom'}</span></div></div>`).join('') || '<p>Галерея пуста</p>'}</div>`;
        } else if (page === 'learning') {
            card.innerHTML = `<h2 class="page-title">🧠 Аналитика реставратора</h2><p>Всего генераций: ${STATE.learning.gens}<br>Положительных оценок: ${STATE.learning.likes}</p>`;
        } else {
            card.innerHTML = `<h2 class="page-title">ℹ️ О проекте</h2><p><strong>Реставратор фасадов</strong> v3.2.<br>Локальное приложение для генерации и восстановления архитектурных обликов.</p>`;
        }
        App.bindPageEvents();
    },
    bindPageEvents: () => {
        // Кнопка генерации
        const genBtn = document.getElementById('btn-gen');
        if(genBtn) genBtn.onclick = async () => {
            const prompt = document.getElementById('gen-prompt').value;
            const style = document.getElementById('gen-style').value;
            const seed = document.getElementById('gen-seed').value || Math.floor(Math.random()*999999);
            
            let finalPrompt = `${prompt}, ${STYLES[style] || ''}`;
            if(STATE.autoEnhance) finalPrompt += `, ${ENHANCER_TAGS.sort(()=>0.5-Math.random()).slice(0,3).join(', ')}`;
            
            App.showLoading(`🎨 Генерация через ${STATE.engine}...`);
            try {
                let result;
                if(STATE.engine === 'horde') result = await Engines.horde(finalPrompt, seed);
                else result = await Engines.pollinations(finalPrompt, seed);
                
                STATE.history.unshift({ ...result, style, date: new Date().toISOString() });
                STATE.learning.gens++; save(); App.updateBadges();
                
                document.getElementById('result-area').innerHTML = `
                    <img src="${result.url}" class="result-img" onclick="App.openLB('${result.url}')">
                    <div class="result-actions">
                        <button class="btn gothic-btn" onclick="App.vote('like')">👍 Отлично</button>
                        <a href="${result.url}" download="facade_${Date.now()}.png" class="btn btn-secondary">💾 Скачать</a>
                    </div>`;
                AudioEngine.success();
            } catch(e) { alert("Ошибка: "+e.message); AudioEngine.error(); }
            finally { App.hideLoading(); }
        };

        // Кнопка реставрации
        const resBtn = document.getElementById('btn-res');
        if(resBtn) resBtn.onclick = async () => {
            const file = document.getElementById('res-file').files[0];
            if(!file) return alert("Выберите изображение");
            App.showLoading("🖌️ Обработка изображения...");
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = await Engines.canvas(e.target.result);
                document.getElementById('res-result').innerHTML = `<img src="${result.url}" class="result-img"><br><a href="${result.url}" download="restored.png" class="btn gothic-btn">💾 Скачать результат</a>`;
                App.hideLoading(); AudioEngine.success();
            };
            reader.readAsDataURL(file);
        };
    },
    vote: (type) => { STATE.learning[type==='like'?'likes':'dislikes']++; save(); App.updateBadges(); AudioEngine.click(); },
    openLB: (url) => { const lb = document.getElementById('lightbox'); lb.querySelector('img').src = url; lb.classList.add('active'); },
    
    bindGlobal: () => {
        // Настройки верхней панели
        document.querySelectorAll('.theme-btn').forEach(b => b.onclick = () => { STATE.theme=b.dataset.theme; save(); App.applyTheme(); });
        document.getElementById('default-engine').onchange = (e) => { STATE.engine=e.target.value; save(); if(STATE.page==='generate') App.renderPage('generate'); };
        document.getElementById('sound-on').onchange = (e) => { STATE.sound=e.target.checked; save(); };
        document.getElementById('auto-enhance').onchange = (e) => { STATE.autoEnhance=e.target.checked; save(); };
        
        // Меню данных
        const dd = document.getElementById('data-dropdown');
        document.getElementById('data-menu-btn').onclick = (e) => { e.stopPropagation(); dd.classList.toggle('open'); };
        document.addEventListener('click', () => dd.classList.remove('open'));
        dd.onclick = (e) => e.stopPropagation();
        
        document.getElementById('api-token').onchange = (e) => { STATE.token=e.target.value; save(); };
        document.getElementById('export-data').onclick = () => {
            const blob = new Blob([JSON.stringify(STATE, null, 2)], {type: 'application/json'});
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `restaurator_backup_${Date.now()}.json`; a.click();
        };
        document.getElementById('import-trigger').onclick = () => document.getElementById('import-file').click();
        document.getElementById('import-file').onchange = (e) => {
            const f = e.target.files[0]; if(!f) return;
            const r = new FileReader(); r.onload = (ev) => { try { Object.assign(STATE, JSON.parse(ev.target.result)); save(); location.reload(); } catch(err) { alert("Ошибка импорта"); } }; r.readAsText(f);
        };
        document.getElementById('reset-all').onclick = () => { if(confirm("Сбросить все данные реставратора?")) { localStorage.clear(); location.reload(); } };

         // Хомяк с частицами
        const hamster = document.getElementById('hamster');
        hamster.addEventListener('mousedown', (e) => {
            e.preventDefault(); STATE.coins++; save(); App.updateBadges(); AudioEngine.coin();
            App.spawnParticle(e.clientX, e.clientY, '+1 🪙');
            App.spawnParticle(e.clientX - 20, e.clientY - 20, '✨');
            hamster.style.transform = 'translateX(-50%) scale(0.9)';
            setTimeout(() => hamster.style.transform = 'translateX(-50%) scale(1)', 100);
        });

        // СКРЫТЫЙ ЧАЙНИК (точка в футере)
        document.getElementById('secret-teapot-trigger').onclick = () => {
            document.getElementById('teapot-modal').classList.add('active');
            STATE.tea++; save(); App.updateBadges(); AudioEngine.whistle();
        };
        document.querySelector('#teapot-modal .close-btn').onclick = () => document.getElementById('teapot-modal').classList.remove('active');
        document.getElementById('teapot-sound-btn').onclick = AudioEngine.whistle;
        document.querySelector('.lb-close').onclick = () => document.getElementById('lightbox').classList.remove('active');

        // Инициализация значений при загрузке
        document.getElementById('sound-on').checked = STATE.sound;
        document.getElementById('auto-enhance').checked = STATE.autoEnhance;
        document.getElementById('api-token').value = STATE.token;
        document.getElementById('default-engine').value = STATE.engine;
        
        // Эффект шума на фоне
        const nc = document.getElementById('noise-canvas'); const nctx = nc.getContext('2d');
        const resize = () => { nc.width=window.innerWidth; nc.height=window.innerHeight; };
        window.onresize = resize; resize();
        setInterval(() => { const w=nc.width, h=nc.height; const idata = nctx.createImageData(w,h); const buf = new Uint32Array(idata.data.buffer); for(let i=0;i<buf.length;i++) buf[i] = ((Math.random()*0xFFFFFF)|0xFF000000)>>>0; nctx.putImageData(idata,0,0); }, 100);
    }
};

document.addEventListener('DOMContentLoaded', App.init);
