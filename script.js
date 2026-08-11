// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js (часть 1 из 2)
// 4 движка: HORDE (по умолчанию) + Sana + Flux + Turbo
// 5 вариаций дизайна
// =============================================

var STYLES = {
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

var NEGATIVE_PROMPT = "people,humans,crowd,faces,animals,blurry,low quality,deformed,watermark,text";
var BUILDING_BOOST = "architecture only,building exterior,facade,no people,no interior,photorealistic,8k";

var STATE = {
    coins: parseInt(localStorage.getItem('hc')) || 0,
    tea: parseInt(localStorage.getItem('tb')) || 0,
    soundEnabled: localStorage.getItem('snd') !== '0',
    theme: localStorage.getItem('thm') || 'gothic',
    design: localStorage.getItem('dsg') || 'classic',
    selectedModel: localStorage.getItem('mdl') || 'horde',
    history: JSON.parse(localStorage.getItem('hist') || '[]'),
    learning: JSON.parse(localStorage.getItem('lrn') || '{"generations":0,"likes":0,"dislikes":0}')
};

function saveState() {
    localStorage.setItem('hc', STATE.coins);
    localStorage.setItem('tb', STATE.tea);
    localStorage.setItem('snd', STATE.soundEnabled ? '1' : '0');
    localStorage.setItem('thm', STATE.theme);
    localStorage.setItem('dsg', STATE.design);
    localStorage.setItem('mdl', STATE.selectedModel);
    localStorage.setItem('hist', JSON.stringify(STATE.history));
    localStorage.setItem('lrn', JSON.stringify(STATE.learning));
}

// ===== POLLINATIONS (img без CORS) =====
function buildImageUrl(prompt, modelName) {
    var fullPrompt = prompt + ', ' + BUILDING_BOOST;
    var encodedPrompt = encodeURIComponent(fullPrompt);
    var encodedNegative = encodeURIComponent(NEGATIVE_PROMPT);
    var seed = Math.floor(Math.random() * 999999);
    return 'https://image.pollinations.ai/prompt/' + encodedPrompt
        + '?width=1024&height=1024&seed=' + seed
        + '&nologo=true&negative=' + encodedNegative
        + '&model=' + modelName;
}

function waitForImageLoad(url) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        var timeoutId = setTimeout(function() {
            img.src = '';
            reject(new Error('Таймаут 180 секунд'));
        }, 180000);
        img.onload = function() {
            clearTimeout(timeoutId);
            if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve(url);
            else reject(new Error('Пустое изображение'));
        };
        img.onerror = function() {
            clearTimeout(timeoutId);
            reject(new Error('Ошибка загрузки'));
        };
        img.src = url;
    });
}

// ===== AI HORDE (асинхронная генерация, анонимный ключ) =====
async function generateViaHorde(prompt) {
    var fullPrompt = prompt + ', ' + BUILDING_BOOST;

    // 1. Отправляем задачу
    var postResponse = await fetch('https://aihorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': '0000000000'
        },
        body: JSON.stringify({
            prompt: fullPrompt,
            params: {
                width: 512,
                height: 512,
                steps: 20,
                n: 1
            },
            models: ['stable_diffusion_2.1'],
            nsfw: false
        })
    });

    if (!postResponse.ok) {
        throw new Error('Horde HTTP ' + postResponse.status);
    }
    var postData = await postResponse.json();
    var jobId = postData.id;
    if (!jobId) throw new Error('Horde: не получен id задачи');

    // 2. Ждём результат (опрос каждые 3 сек, до 180 сек)
    for (var attempt = 0; attempt < 60; attempt++) {
        await new Promise(function(r) { setTimeout(r, 3000); });

        var checkResponse = await fetch('https://aihorde.net/api/v2/generate/check/' + jobId);
        var checkData = await checkResponse.json();

        if (checkData.faulted) throw new Error('Horde: задача сломалась');

        if (checkData.done) {
            var statusResponse = await fetch('https://aihorde.net/api/v2/generate/status/' + jobId);
            var statusData = await statusResponse.json();
            if (statusData.generations && statusData.generations.length > 0 && statusData.generations[0].img) {
                return { url: statusData.generations[0].img, engine: 'horde' };
            }
            throw new Error('Horde: нет результата');
        }
    }
    throw new Error('Horde: таймаут ожидания');
}

// ===== ОБЩАЯ ГЕНЕРАЦИЯ С ФОЛБЭКОМ =====
// preferHorde=true — для реставратора (horde всегда первый)
async function generateWithFallback(prompt, preferHorde) {
    var modelsToTry;
    if (preferHorde) {
        modelsToTry = ['horde', STATE.selectedModel, 'sana', 'flux', 'turbo'];
    } else {
        modelsToTry = [STATE.selectedModel, 'horde', 'sana', 'flux', 'turbo'];
    }

    // Убираем дубликаты
    var uniqueModels = [];
    var i;
    for (i = 0; i < modelsToTry.length; i++) {
        if (uniqueModels.indexOf(modelsToTry[i]) === -1) {
            uniqueModels.push(modelsToTry[i]);
        }
    }

    var errors = [];
    for (i = 0; i < uniqueModels.length; i++) {
        var model = uniqueModels[i];
        try {
            if (model === 'horde') {
                return await generateViaHorde(prompt);
            }
            var url = buildImageUrl(prompt, model);
            await waitForImageLoad(url);
            return { url: url, engine: model };
        } catch (error) {
            errors.push(model + ': ' + (error.message || 'ошибка'));
            console.warn('Модель ' + model + ' не сработала:', error.message);
        }
    }
    throw new Error(
        'Все модели недоступны:\n' + errors.join('\n')
        + '\n\nПодождите 15 секунд и попробуйте снова.'
    );
}

// ===== РЕСТАВРАЦИЯ (horde по умолчанию) =====
function analyzeImage(base64Data) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 32, 32);
            var pixels = ctx.getImageData(0, 0, 32, 32).data;
            var totalR = 0, totalG = 0, totalB = 0, count = 0;
            for (var i = 0; i < pixels.length; i += 4) {
                totalR += pixels[i];
                totalG += pixels[i + 1];
                totalB += pixels[i + 2];
                count++;
            }
            var avgR = Math.round(totalR / count);
            var avgG = Math.round(totalG / count);
            var avgB = Math.round(totalB / count);
            var lum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
            var tone = 'soft natural light';
            if (lum < 90) tone = 'dark moody atmosphere';
            else if (lum > 170) tone = 'bright daylight';
            var hue = 'gray weathered stone';
            if (avgR > avgG + 20 && avgR > avgB + 20) hue = 'reddish brick walls';
            else if (avgG > avgR + 10 && avgG > avgB + 10) hue = 'greenish overgrown facade';
            else if (avgB > avgR + 10 && avgB > avgG + 10) hue = 'bluish stone facade';
            else if (avgR > 150 && avgG > 130 && avgB < 100) hue = 'warm yellow plaster walls';
            resolve(tone + ', ' + hue + ', aged texture, weathered surface');
        };
        img.onerror = function() {
            resolve('old building, weathered facade, aged texture');
        };
        img.src = base64Data;
    });
}

async function restoreBuilding(originalBase64, description, styleName) {
    var styleDesc = STYLES[styleName] || '';
    var analysis = await analyzeImage(originalBase64);
    var parts = [
        'beautiful restored building facade',
        'pristine condition',
        'newly repaired walls',
        'intact complete windows with glass',
        'clean restored facade',
        'no damage no cracks no ruins',
        'fully reconstructed',
        'architectural photography',
        analysis,
        description,
        styleDesc
    ];
    var filtered = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i].length > 0) filtered.push(parts[i]);
    }
    // preferHorde = true — реставратор всегда сначала пробует horde
    return await generateWithFallback(filtered.join(', '), true);
}

// ===== ЗВУК =====
var AudioEngine = (function() {
    var audioCtx = null;
    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    function playTone(freq, type, duration, volume) {
        if (!STATE.soundEnabled) return;
        try {
            var c = getCtx();
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(volume || 0.1, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start();
            osc.stop(c.currentTime + duration);
        } catch (e) {}
    }
    return {
        click: function() { playTone(800 + Math.random() * 400, 'sine', 0.08, 0.05); },
        success: function() {
            playTone(523, 'triangle', 0.3);
            setTimeout(function() { playTone(659, 'triangle', 0.4); }, 150);
        },
        error: function() { playTone(150, 'sawtooth', 0.5, 0.15); },
        whistle: function() {
            if (!STATE.soundEnabled) return;
            try {
                var c = getCtx();
                var o = c.createOscillator();
                var g = c.createGain();
                o.frequency.setValueAtTime(880, c.currentTime);
                o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.4);
                g.gain.setValueAtTime(0.001, c.currentTime);
                g.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
                o.connect(g);
                g.connect(c.destination);
                o.start();
                o.stop(c.currentTime + 1.3);
            } catch (e) {}
        }
    };
})();

// ===== ЧАТ ПОДДЕРЖКИ =====
var CHAT_RESPONSES = {
    generate: "🔧 <b>Генерация:</b><br>• 4 движка: Horde, Sana, Flux, Turbo<br>• Если один упал — пробуется следующий<br>• Лимит бесплатного API: 1 запрос / 15 сек<br>• Генерация: 10-60 секунд",
    restore: "🔧 <b>Реставрация:</b><br>• По умолчанию идёт через <b>Horde</b><br>• Анализирует цвета фото<br>• Генерирует восстановленную версию<br>• Чем подробнее описание — тем лучше",
    gallery: "🔧 <b>Галерея:</b><br>• Хранится в localStorage<br>• Лимит 50 изображений<br>• 🗑️ под картинкой — удалить одну<br>• «Удалить всё» — очистить",
    footer: "🔧 <b>Подвал:</b><br>• Просмотр картинок — отдельная модалка<br>• Не связана с чайником<br>• Не ломает подвал",
    hamster: "🐹 <b>Хомяк:</b><br>• Появляется во время генерации<br>• Тапайте для монет 🪙<br>• Монеты сохраняются",
    teapot: "🫖 <b>Чайник:</b><br>• Секретная пасхалка!<br>• Ищите 🫖 в подвале сайта<br>• Полупрозрачный, правый нижний угол<br>• +1 чайный пакетик 🍵 при клике",
    slow: "🔧 <b>Скорость:</b><br>• Horde — медленный но качественный (до 2-3 мин)<br>• Turbo — самая быстрая<br>• Sana и Flux — баланс<br>• Переключите модель в ⚙️",
    styles: "🎨 <b>40 стилей:</b><br>• От Хрущёвки до Киберпанка<br>• Все в выпадающем списке",
    design: "🎨 <b>Дизайн:</b><br>• 5 вариаций в настройках ⚙️<br>• Классика, Брутализм, Винтаж, Неон, Мягкий<br>• Чтобы сайт не выглядел как шаблон"
};

function handleChatQuestion(key) {
    var msgs = document.getElementById('chat-messages');
    var labels = {
        generate: 'Не генерирует', restore: 'Не реставрирует',
        gallery: 'Галерея', footer: 'Подвал глючит',
        hamster: 'Хомяк', teapot: 'Где чайник?',
        slow: 'Медленно', styles: 'Стили', design: 'Дизайн'
    };
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.textContent = labels[key] || key;
    msgs.appendChild(userMsg);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function() {
        var botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.innerHTML = CHAT_RESPONSES[key] || 'Не знаю ответа.';
        msgs.appendChild(botMsg);
        msgs.scrollTop = msgs.scrollHeight;
    }, 300);
}

// ===== КОНЕЦ ЧАСТИ 1 ИЗ 2 =====
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js (часть 2 из 2)
// =============================================

var currentPage = 'generate';

function setTheme(name) {
    STATE.theme = name;
    saveState();
    document.body.dataset.theme = name;
    var btns = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('active', btns[i].dataset.theme === name);
    }
}

function setDesign(name) {
    STATE.design = name;
    saveState();
    document.body.dataset.design = name;
}

function updateUI() {
    document.getElementById('coin-num').textContent = STATE.coins;
    document.getElementById('tea-num').textContent = STATE.tea;
    document.getElementById('f-gens').textContent = STATE.learning.generations;
    document.getElementById('f-likes').textContent = STATE.learning.likes;
    document.getElementById('f-dislikes').textContent = STATE.learning.dislikes;
    var total = STATE.learning.likes + STATE.learning.dislikes;
    document.getElementById('f-acc').textContent = total > 0 ? Math.round(STATE.learning.likes / total * 100) : 0;
}

function showLoading(msg) {
    document.getElementById('loading-text').textContent = msg;
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function spawnCoin(x, y) {
    var el = document.createElement('div');
    el.className = 'coin-plus';
    el.textContent = '+1 🪙';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 1600);
}

function navigateTo(page) {
    if (page === currentPage) return;
    document.body.classList.add('page-leave');
    setTimeout(function() {
        currentPage = page;
        document.body.classList.remove('page-leave');
        renderPage(page);
        var btns = document.querySelectorAll('.nav-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].dataset.page === page);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
}

// ===== РЕНДЕРИНГ СТРАНИЦ =====
function renderPage(page) {
    var main = document.getElementById('main-content');
    main.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'card gothic-card';
    var styleKeys = Object.keys(STYLES);
    var opts = '';
    for (var i = 0; i < styleKeys.length; i++) {
        opts += '<option>' + styleKeys[i] + '</option>';
    }

    if (page === 'generate') {
        card.innerHTML = '<h2 class="page-title">📝 Генерация здания</h2>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width"><label>Описание</label>'
            + '<textarea id="gp" placeholder="Опишите здание подробно..."></textarea></div>'
            + '<div class="form-group"><label>Стиль (' + styleKeys.length + ')</label>'
            + '<select id="gs">' + opts + '</select></div>'
            + '<div class="form-group"><label>Seed</label>'
            + '<input type="number" id="gseed" placeholder="Случайно"></div>'
            + '</div><button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button>'
            + '<div id="res-area"></div>';

    } else if (page === 'restore') {
        card.innerHTML = '<h2 class="page-title">🔨 Реставрация фасада</h2>'
            + '<p style="color:var(--text-muted);margin-bottom:20px">'
            + 'Загрузите фото разрушенного здания. ИИ (Horde по умолчанию) сгенерирует восстановленную версию.</p>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width"><label>Фото здания</label>'
            + '<input type="file" id="rf" accept="image/*"></div>'
            + '<div class="form-group full-width"><label>Что восстановить?</label>'
            + '<textarea id="rp" placeholder="достроить крышу, восстановить окна..."></textarea></div>'
            + '<div class="form-group"><label>Стиль здания</label>'
            + '<select id="rs">' + opts + '</select></div>'
            + '</div><button class="btn gothic-btn" id="btn-res">🏗️ Реставрировать</button>'
            + '<div id="res-area"></div>';

    } else if (page === 'gallery') {
        card.innerHTML = '<h2 class="page-title">🖼️ Галерея</h2>';
        if (STATE.history.length === 0) {
            card.innerHTML += '<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста!</p>';
        } else {
            card.innerHTML += '<div style="margin-bottom:20px;text-align:right">'
                + '<button class="btn btn-secondary" id="btn-clear-all" '
                + 'style="border-color:var(--error);color:var(--error);padding:8px 16px;font-size:.85rem;min-height:auto">'
                + '🗑️ Удалить всё</button></div>';
            var grid = document.createElement('div');
            grid.className = 'gallery-grid';
            for (var k = 0; k < STATE.history.length; k++) {
                var item = STATE.history[k];
                var d = document.createElement('div');
                d.className = 'gallery-item';
                d.innerHTML = '<img src="' + item.url + '" loading="lazy" onclick="openLightbox(' + k + ')">'
                    + '<div class="gallery-item-meta"><span class="style">' + (item.style || 'Custom') + '</span>'
                    + '<span class="time">' + new Date(item.date).toLocaleString() + ' · ' + item.engine + '</span></div>'
                    + '<button class="btn-del" data-idx="' + k + '">🗑️ Удалить</button>';
                grid.appendChild(d);
            }
            card.appendChild(grid);
        }

    } else if (page === 'learning') {
        var total = STATE.learning.likes + STATE.learning.dislikes;
        var acc = total > 0 ? Math.round(STATE.learning.likes / total * 100) : 0;
        card.innerHTML = '<h2 class="page-title">🧠 Обучение</h2><div class="learning-stats">'
            + '<div class="stat-card"><div class="stat-value">' + STATE.learning.generations + '</div>Генераций</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--success)">' + STATE.learning.likes + '</div>Лайков</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--error)">' + STATE.learning.dislikes + '</div>Дизлайков</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--grad-b)">' + acc + '%</div>Точность</div></div>';

    } else {
        card.innerHTML = '<h2 class="page-title">ℹ️ О проекте</h2>'
            + '<p><b>Реставратор фасадов</b> — клиентская JS-версия.<br>'
            + '40 стилей · 4 движка: Horde (по умолчанию для реставрации) + Sana + Flux + Turbo<br>'
            + '5 вариаций дизайна в настройках ⚙️<br>'
            + 'Чат поддержки 💬 слева внизу.</p>';
    }

    main.appendChild(card);
    bindPageEvents();
    bindGalleryEvents();
}

// ===== РЕЗУЛЬТАТЫ И ЛАЙТБОКС =====
function showResult(data) {
    var a = document.getElementById('res-area');
    a.innerHTML = '<div class="result">'
        + '<img src="' + data.url + '" onclick="openLightbox(0)">'
        + '<div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">'
        + 'Стиль: <b>' + data.style + '</b> | Модель: <b>' + data.engine + '</b></div>'
        + '<div class="result-actions">'
        + '<button class="btn-like" onclick="handleVote(\'like\')">👍 Нравится</button>'
        + '<button class="btn-dislike" onclick="handleVote(\'dislike\')">👎 Не нравится</button>'
        + '<a href="' + data.url + '" download="facade_' + Date.now() + '.jpg" class="btn btn-secondary" target="_blank">💾 Скачать</a>'
        + '</div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    var a = document.getElementById('res-area');
    a.innerHTML = '<div class="result" style="border-color:var(--error)">'
        + '<div style="font-size:3rem;margin-bottom:15px">⚠️</div>'
        + '<h3 style="color:var(--error);margin-bottom:10px">Ошибка</h3>'
        + '<p style="color:var(--text-muted);margin-bottom:20px;white-space:pre-line;font-size:.9rem">' + msg + '</p>'
        + '<div class="result-actions"><button class="btn btn-secondary" '
        + 'onclick="document.getElementById(\'res-area\').innerHTML=\'\'">✕ Закрыть</button></div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function handleVote(type) {
    if (type === 'like') STATE.learning.likes++;
    else STATE.learning.dislikes++;
    saveState();
    updateUI();
    var actions = document.querySelector('.result-actions');
    if (actions) actions.innerHTML = '<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>';
    AudioEngine.click();
}

function openLightbox(idx) {
    var item = STATE.history[idx];
    if (!item) return;
    document.getElementById('lb-img').src = item.url;
    document.getElementById('lb-info').textContent = (item.style || '') + ' · ' + item.engine;
    document.getElementById('lightbox-modal').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('active');
    document.getElementById('lb-img').src = '';
}

// ===== ГЕНЕРАЦИЯ =====
async function performGeneration(prompt, styleName) {
    var parts = [prompt];
    if (STYLES[styleName] && STYLES[styleName].length > 0) parts.push(STYLES[styleName]);
    var fullPrompt = parts.join(', ');
    showLoading('🎨 Генерация... (10-180 сек, horde может быть медленным)');
    try {
        var result = await generateWithFallback(fullPrompt, false);
        result.style = styleName;
        result.date = new Date().toISOString();
        STATE.history.unshift(result);
        if (STATE.history.length > 50) STATE.history = STATE.history.slice(0, 50);
        STATE.learning.generations++;
        saveState();
        updateUI();
        showResult(result);
        AudioEngine.success();
    } catch (e) {
        console.error(e);
        showError(e.message || 'Неизвестная ошибка');
        AudioEngine.error();
    } finally {
        hideLoading();
    }
}

// ===== ОБРАБОТЧИКИ =====
function bindPageEvents() {
    var gb = document.getElementById('btn-gen');
    if (gb) {
        gb.onclick = function() {
            var p = document.getElementById('gp').value.trim();
            var s = document.getElementById('gs').value;
            if (!p && s === 'Без стиля') return alert('Введите описание или выберите стиль');
            performGeneration(p, s);
        };
    }
    var rb = document.getElementById('btn-res');
    if (rb) {
        rb.onclick = function() {
            var fi = document.getElementById('rf');
            var desc = document.getElementById('rp').value.trim();
            var style = document.getElementById('rs').value;
            if (!fi.files || !fi.files[0]) return alert('Загрузите фото');
            if (!desc) return alert('Опишите что восстановить');
            showLoading('🏗️ Реставрация через Horde... (может занять до 3 минут)');
            var reader = new FileReader();
            reader.onload = async function(ev) {
                try {
                    var r = await restoreBuilding(ev.target.result, desc, style);
                    r.style = style;
                    r.date = new Date().toISOString();
                    STATE.history.unshift(r);
                    if (STATE.history.length > 50) STATE.history = STATE.history.slice(0, 50);
                    STATE.learning.generations++;
                    saveState();
                    updateUI();
                    showResult(r);
                    AudioEngine.success();
                } catch (err) {
                    console.error(err);
                    showError(err.message || 'Ошибка реставрации');
                    AudioEngine.error();
                } finally {
                    hideLoading();
                }
            };
            reader.readAsDataURL(fi.files[0]);
        };
    }
}

function bindGalleryEvents() {
    var dels = document.querySelectorAll('.btn-del');
    for (var i = 0; i < dels.length; i++) {
        dels[i].addEventListener('click', function(e) {
            e.stopPropagation();
            var idx = parseInt(this.dataset.idx);
            if (confirm('Удалить?')) {
                STATE.history.splice(idx, 1);
                saveState();
                renderPage('gallery');
                AudioEngine.click();
            }
        });
    }
    var cb = document.getElementById('btn-clear-all');
    if (cb) {
        cb.addEventListener('click', function() {
            if (confirm('Удалить ВСЕ?')) {
                STATE.history = [];
                saveState();
                renderPage('gallery');
                AudioEngine.error();
            }
        });
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    setTheme(STATE.theme);
    setDesign(STATE.design);
    updateUI();
    renderPage('generate');

    var sb = document.getElementById('stars');
    for (var i = 0; i < 9; i++) {
        var s = document.createElement('div');
        s.className = 'star';
        s.style.left = (5 + i * 10) + '%';
        s.style.animationDelay = (i * 0.8) + 's';
        sb.appendChild(s);
    }

    var navBtns = document.querySelectorAll('.nav-btn');
    for (var n = 0; n < navBtns.length; n++) {
        navBtns[n].addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.dataset.page);
        });
    }

    var panel = document.getElementById('settings-panel');
    document.getElementById('settings-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        panel.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && e.target.id !== 'settings-btn') {
            panel.classList.remove('open');
        }
    });

    var themeBtns = document.querySelectorAll('.theme-btn');
    for (var t = 0; t < themeBtns.length; t++) {
        themeBtns[t].addEventListener('click', function() {
            setTheme(this.dataset.theme);
            AudioEngine.click();
        });
    }

    document.getElementById('sound-on').checked = STATE.soundEnabled;
    document.getElementById('sound-on').addEventListener('change', function(e) {
        STATE.soundEnabled = e.target.checked;
        saveState();
    });

    document.getElementById('model-select').value = STATE.selectedModel;
    document.getElementById('model-select').addEventListener('change', function(e) {
        STATE.selectedModel = e.target.value;
        saveState();
        AudioEngine.click();
    });

    document.getElementById('design-select').value = STATE.design;
    document.getElementById('design-select').addEventListener('change', function(e) {
        setDesign(e.target.value);
        AudioEngine.click();
    });

    document.getElementById('reset-coins').addEventListener('click', function() {
        STATE.coins = 0;
        STATE.tea = 0;
        saveState();
        updateUI();
        AudioEngine.click();
    });

    var ham = document.getElementById('hamster');
    ham.addEventListener('click', function(e) {
        e.stopPropagation();
        ham.classList.remove('tap');
        void ham.offsetWidth;
        ham.classList.add('tap');
        STATE.coins++;
        saveState();
        updateUI();
        spawnCoin(e.clientX, e.clientY);
        AudioEngine.click();
    });

    document.getElementById('lb-close-btn').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-modal').addEventListener('click', function(e) {
        if (e.target === document.getElementById('lightbox-modal')) closeLightbox();
    });

    document.getElementById('teapot-link').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('teapot-modal').classList.add('active');
        STATE.tea++;
        saveState();
        updateUI();
        AudioEngine.whistle();
    });
    document.getElementById('teapot-close-btn').addEventListener('click', function() {
        document.getElementById('teapot-modal').classList.remove('active');
    });
    document.getElementById('teapot-sound-btn').addEventListener('click', function() {
        AudioEngine.whistle();
    });

    var chatPanel = document.getElementById('chat-panel');
    document.getElementById('chat-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        chatPanel.classList.toggle('open');
    });
    document.getElementById('chat-close').addEventListener('click', function() {
        chatPanel.classList.remove('open');
    });
    document.addEventListener('click', function(e) {
        if (!chatPanel.contains(e.target) && e.target.id !== 'chat-btn') {
            chatPanel.classList.remove('open');
        }
    });
    chatPanel.addEventListener('click', function(e) { e.stopPropagation(); });

    var chatQs = document.querySelectorAll('.chat-q');
    for (var q = 0; q < chatQs.length; q++) {
        chatQs[q].addEventListener('click', function() {
            handleChatQuestion(this.dataset.q);
        });
    }
});

// ===== КОНЕЦ ФАЙЛА =====
