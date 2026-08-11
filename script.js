
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js (часть 1 из 3)
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

// Усиленная цензура: никаких крупных людей
var NEGATIVE_PROMPT = "close-up person,foreground person,detailed person,portrait,face,faces,woman,man,girl,boy,lady,gentleman,crowd of people,dress,gown,hair,hairstyle,makeup,nsfw,naked,blurry,low quality,deformed,watermark,text,animals";

// Люди — только крошечными силуэтами вдали
var BUILDING_BOOST = "architecture only,building exterior,facade,no interior,8k,people only as tiny distant silhouettes far away,no faces visible,no person in dress,no figure in foreground";

// ===== ГЕНЕРАТОР РАЗНООБРАЗИЯ =====
var DIV_TIME = ['golden hour light', 'soft morning light', 'harsh noon sun', 'blue hour dusk', 'night with warm window lights', 'overcast diffused light'];
var DIV_WEATHER = ['clear sky', 'light fog', 'after rain wet pavement', 'snow falling', 'dramatic clouds', 'spring bloom'];
var DIV_ANGLE = ['street level view', 'low angle looking up', 'aerial drone view', 'corner perspective', 'straight-on facade view', 'close-up detail view'];
var DIV_MOOD = ['cozy atmosphere', 'majestic monumental', 'quiet serene mood', 'lively urban scene', 'dramatic contrast', 'nostalgic vintage feel'];
var DIV_DETAIL = ['with birds on the roof', 'with old street lamps', 'with climbing ivy', 'with balconies full of flowers', 'with visible brick texture', 'with ornate entrance door', 'with cats on the windowsill'];
var DIV_RENDER = ['photorealistic photo', 'detailed architectural photography', 'realistic cinematic shot', 'professional real estate photo'];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function addDiversity(prompt) {
    var extras = [pickRandom(DIV_TIME), pickRandom(DIV_WEATHER), pickRandom(DIV_ANGLE), pickRandom(DIV_MOOD), pickRandom(DIV_RENDER)];
    if (Math.random() < 0.6) extras.push(pickRandom(DIV_DETAIL));
    return prompt + ', ' + extras.join(', ') + ', unique composition';
}

// ===== ЦЕНЗОР: вырезаем людей и внешность =====
var BANNED_STEMS = [
    'женщин', 'мужчин', 'человек', 'люд', 'девушк', 'девочк', 'мальчик',
    'ребенок', 'ребёнок', 'ребят', 'парень', 'парня', 'парнем',
    'портрет', 'фигур', 'толп', 'лицо', 'лица', 'лицом',
    'плать', 'юбк', 'блузк', 'волос', 'прическ', 'причёск', 'глаз', 'губ',
    'ресниц', 'макияж', 'красавиц', 'дама', 'госпож', 'принцесс', 'королев',
    'богин', 'незнакомк', 'героин', 'актрис', 'модел', 'тело', 'кожа',
    'сексуальн', 'элегантн', 'прекрасн', 'очаровательн', 'улыба', 'позирует',
    'woman', 'people', 'person', 'human', 'girl', 'boy', 'lady', 'gentleman',
    'portrait', 'figure', 'crowd', 'face', 'dress', 'gown', 'hair',
    'hairstyle', 'makeup', 'beautiful', 'elegant', 'stunning', 'gorgeous',
    'sexy', 'fashion'
];
var EXACT_BANNED = ['man', 'men', 'women', 'humans', 'persons', 'kid', 'kids', 'faces', 'figures', 'beauty', 'она', 'он', 'её', 'ее'];

// ===== ДЕТЕКТОР ЛЮДЕЙ (радикальная цензура) =====
var PERSON_DETECT_STEMS = BANNED_STEMS.concat(['молод', 'кружев', 'плеч', 'груд', 'декольте', 'красот', 'миловид', 'секс', 'обнаж']);

function containsPersonWords(text) {
    if (!text) return false;
    var words = (text.toLowerCase() || '').split(/[^a-zа-яё0-9]+/);
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.length < 3) continue;
        if (EXACT_BANNED.indexOf(w) !== -1) return true;
        for (var s = 0; s < PERSON_DETECT_STEMS.length; s++) {
            if (w.indexOf(PERSON_DETECT_STEMS[s]) === 0) return true;
        }
    }
    return false;
}

function sanitizePrompt(text) {
    if (!text) return '';
    var words = text.split(/(\s+|[,.!?;:()«»])/);
    var out = [];
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var low = w.toLowerCase();
        var banned = false;
        if (low.length > 2) {
            if (EXACT_BANNED.indexOf(low) !== -1) {
                banned = true;
            } else {
                for (var s = 0; s < BANNED_STEMS.length; s++) {
                    if (low.indexOf(BANNED_STEMS[s]) === 0) { banned = true; break; }
                }
            }
        }
        if (!banned) out.push(w);
    }
    return out.join('')
        .replace(/\s+/g, ' ')
        .replace(/\s+([,.!?;:])/g, '$1')
        .replace(/([,.!?;:])\s*([,.!?;:])/g, '$1')
        .replace(/^[\s,]+|[\s,]+$/g, '')
        .trim();
}

// ===== ПЕРЕВОДЧИК-ЯКОРЬ: русские слова → английские теги =====
var RU_EN_TAGS = [
    ['здани', 'building'], ['дом', 'house'], ['фасад', 'facade'],
    ['храм', 'temple'], ['церк', 'church'], ['собор', 'cathedral'],
    ['башн', 'tower'], ['крыш', 'roof'], ['окн', 'windows'],
    ['двер', 'door'], ['вход', 'entrance'], ['балкон', 'balcony'],
    ['колонн', 'columns'], ['арк', 'arches'], ['лестниц', 'stairs'],
    ['стен', 'walls'], ['этаж', 'storey building'],
    ['акварель', 'watercolor painting'], ['графит', 'graphite gray tones'],
    ['сер', 'gray palette'], ['дымк', 'light haze'], ['туман', 'fog'],
    ['бумаг', 'paper texture'], ['кирпич', 'brick'], ['дерев', 'wooden'],
    ['бетон', 'concrete'], ['стекл', 'glass'], ['усадьб', 'manor'],
    ['дворец', 'palace'], ['замок', 'castle'], ['мечет', 'mosque'],
    ['пагод', 'pagoda'], ['фахверк', 'half-timbered'], ['шале', 'chalet'],
    ['вилл', 'villa'], ['завод', 'factory'], ['фабрик', 'factory'],
    ['мост', 'bridge'], ['улиц', 'street'], ['площад', 'square']
];

function extractEnglishTags(text) {
    var low = (text || '').toLowerCase();
    var tags = [];
    for (var i = 0; i < RU_EN_TAGS.length; i++) {
        var ru = RU_EN_TAGS[i][0];
        var en = RU_EN_TAGS[i][1];
        if (low.indexOf(ru) !== -1 && en && tags.indexOf(en) === -1) {
            tags.push(en);
        }
    }
    return tags;
}

// ===== СОСТОЯНИЕ =====
var STATE = {
    coins: parseInt(localStorage.getItem('hc')) || 0,
    tea: parseInt(localStorage.getItem('tb')) || 0,
    soundEnabled: localStorage.getItem('snd') !== '0',
    fastMode: localStorage.getItem('fst') !== '0',
    theme: localStorage.getItem('thm') || 'gothic',
    design: localStorage.getItem('dsg') || 'classic',
    selectedModel: localStorage.getItem('mdl') || 'turbo',
    resolution: localStorage.getItem('res') || '768',
    history: JSON.parse(localStorage.getItem('hist') || '[]'),
    learning: JSON.parse(localStorage.getItem('lrn') || '{"generations":0,"likes":0,"dislikes":0}')
};

function saveState() {
    localStorage.setItem('hc', STATE.coins);
    localStorage.setItem('tb', STATE.tea);
    localStorage.setItem('snd', STATE.soundEnabled ? '1' : '0');
    localStorage.setItem('fst', STATE.fastMode ? '1' : '0');
    localStorage.setItem('thm', STATE.theme);
    localStorage.setItem('dsg', STATE.design);
    localStorage.setItem('mdl', STATE.selectedModel);
    localStorage.setItem('res', STATE.resolution);
    localStorage.setItem('hist', JSON.stringify(STATE.history));
    localStorage.setItem('lrn', JSON.stringify(STATE.learning));
}

function on(id, evt, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
    return el;
}

// ===== СВОЯ КАРТИНКА ЧАЙНИКА =====
var teapotCustomUrl = null;
['teapot.png', 'teapot.jpg', 'teapot.gif', 'teapot.webp'].forEach(function(name) {
    var t = new Image();
    t.onload = function() { if (!teapotCustomUrl) teapotCustomUrl = name; };
    t.src = name;
});

// ===== ТАЙМЕР И КУЛДАУН =====
var loadTimerId = null;
var loadStart = 0;
var cooldownRemaining = 0;
var lastApiCall = 0;

function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

async function waitCooldown() {
    var wait = 15000 - (Date.now() - lastApiCall);
    if (wait > 0) {
        cooldownRemaining = wait;
        while (cooldownRemaining > 0) {
            await sleep(500);
            cooldownRemaining = 15000 - (Date.now() - lastApiCall);
        }
        cooldownRemaining = 0;
    }
    lastApiCall = Date.now();
}

// ===== УТИЛИТЫ =====
function blobToDataUrl(blob) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onloadend = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function downscale(dataUrl, maxSize) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var w = img.naturalWidth, h = img.naturalHeight;
            if (!w || !h) { resolve(dataUrl); return; }
            if (w > maxSize || h > maxSize) {
                var r = Math.min(maxSize / w, maxSize / h);
                w = Math.round(w * r);
                h = Math.round(h * r);
            }
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(c.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = function() { resolve(dataUrl); };
        img.src = dataUrl;
    });
}

// ===== POLLINATIONS =====
function buildImageUrl(prompt, modelName) {
    var fullPrompt = prompt + ', ' + BUILDING_BOOST;
    var encodedPrompt = encodeURIComponent(fullPrompt);
    var encodedNegative = encodeURIComponent(NEGATIVE_PROMPT);
    var seed = Math.floor(Math.random() * 9999999);
    return 'https://image.pollinations.ai/prompt/' + encodedPrompt
        + '?width=' + STATE.resolution + '&height=' + STATE.resolution + '&seed=' + seed
        + '&negative=' + encodedNegative
        + '&model=' + modelName;
}

function waitForImageLoad(url) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        var timeoutId = setTimeout(function() {
            img.src = '';
            reject(new Error('Таймаут 90 секунд'));
        }, 90000);
        img.onload = function() {
            clearTimeout(timeoutId);
            if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve();
            else reject(new Error('Пустое изображение'));
        };
        img.onerror = function() {
            clearTimeout(timeoutId);
            reject(new Error('Ошибка загрузки'));
        };
        img.src = url;
    });
}

async function generateViaPollinations(prompt, model) {
    var url = buildImageUrl(prompt, model);
    try {
        var res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var blob = await res.blob();
        if (blob.size < 1000) throw new Error('Пустой ответ сервера');
        var dataUrl = await blobToDataUrl(blob);
        var small = await downscale(dataUrl, 800);
        return { url: small, engine: model };
    } catch (fetchError) {
        await waitForImageLoad(url);
        return { url: url, engine: model };
    }
}

// ===== AI HORDE (текст-в-картинку) =====
async function generateViaHorde(prompt) {
    var fullPrompt = prompt + ', ' + BUILDING_BOOST;
    var postResponse = await fetch('https://aihorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' },
        body: JSON.stringify({
            prompt: fullPrompt,
            params: { width: 512, height: 512, steps: 12, n: 1 },
            models: ['stable_diffusion_2.1'],
            nsfw: false
        })
    });
    if (!postResponse.ok) throw new Error('Horde HTTP ' + postResponse.status);
    var postData = await postResponse.json();
    var jobId = postData.id;
    if (!jobId) throw new Error('Horde: нет id задачи');
    for (var attempt = 0; attempt < 40; attempt++) {
        await sleep(3000);
        var checkResponse = await fetch('https://aihorde.net/api/v2/generate/check/' + jobId);
        var checkData = await checkResponse.json();
        if (checkData.faulted) throw new Error('Horde: задача сломалась');
        if (checkData.done) {
            var statusResponse = await fetch('https://aihorde.net/api/v2/generate/status/' + jobId);
            var statusData = await statusResponse.json();
            if (statusData.generations && statusData.generations.length > 0 && statusData.generations[0].img) {
                var stored = await urlToStored(statusData.generations[0].img);
                return { url: stored, engine: 'horde' };
            }
            throw new Error('Horde: нет результата');
        }
    }
    throw new Error('Horde: таймаут');
}

// ===== КОНЕЦ ЧАСТИ 1 ИЗ 3 =====
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js (часть 2 из 3)
// =============================================

// ===== ПАРАЛЛЕЛЬНАЯ ГОНКА МОДЕЛЕЙ =====
function raceModels(prompt, models) {
    return new Promise(function(resolve, reject) {
        var pending = models.length;
        var errors = [];
        var settled = false;
        models.forEach(function(model) {
            generateViaPollinations(prompt, model)
                .then(function(result) {
                    if (!settled) { settled = true; resolve(result); }
                })
                .catch(function(e) {
                    errors.push(model + ': ' + (e.message || 'ошибка'));
                    pending--;
                    if (pending === 0 && !settled) {
                        settled = true;
                        reject(new Error(errors.join('\n')));
                    }
                });
        });
    });
}

// ===== УМНАЯ ГЕНЕРАЦИЯ =====
async function smartGenerate(prompt, preferHorde) {
    await waitCooldown();
    var diverse = addDiversity(prompt);
    var errors = [];

    if (STATE.selectedModel === 'horde' && !STATE.fastMode) {
        try { return await generateViaHorde(diverse); }
        catch (e) { errors.push('horde: ' + e.message); }
    }

    try {
        return await raceModels(diverse, ['turbo', 'flux', 'sana']);
    } catch (e) {
        errors.push(e.message);
    }

    try { return await generateViaHorde(diverse); }
    catch (e) { errors.push('horde: ' + e.message); }

    throw new Error('Все модели недоступны:\n' + errors.join('\n') + '\n\nПодождите 15 секунд и попробуйте снова.');
}

// ===== АНАЛИЗ ФОТО (запасной вариант) =====
function analyzeImage(base64Data) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 32, 32);
            var pixels = ctx.getImageData(0, 0, 32, 32).data;
            var totalR = 0, totalG = 0, totalB = 0, count = 0;
            for (var i = 0; i < pixels.length; i += 4) {
                totalR += pixels[i]; totalG += pixels[i + 1]; totalB += pixels[i + 2]; count++;
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
        img.onerror = function() { resolve('old building, weathered facade, aged texture'); };
        img.src = base64Data;
    });
}

// ===== ПОДГОТОВКА ФОТО ДЛЯ IMG2IMG =====
function prepareSourceBase64(base64Data) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var w = img.naturalWidth, h = img.naturalHeight;
            if (!w || !h) { resolve(null); return; }
            var max = 512;
            var r = Math.min(max / w, max / h, 1);
            w = Math.max(64, Math.round((w * r) / 64) * 64);
            h = Math.max(64, Math.round((h * r) / 64) * 64);
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve({
                base64: c.toDataURL('image/jpeg', 0.85).split(',')[1],
                width: w,
                height: h
            });
        };
        img.onerror = function() { resolve(null); };
        img.src = base64Data;
    });
}

// ===== СОХРАНЕНИЕ РЕЗУЛЬТАТА =====
async function urlToStored(url) {
    try {
        var res = await fetch(url);
        if (!res.ok) throw new Error('http');
        var blob = await res.blob();
        var dataUrl = await blobToDataUrl(blob);
        return await downscale(dataUrl, 800);
    } catch (e) {
        return url;
    }
}

// ===== НАСТОЯЩАЯ РЕСТАВРАЦИЯ: img2img =====
async function restoreViaHordeImg2Img(source, prompt) {
    var postResponse = await fetch('https://aihorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' },
        body: JSON.stringify({
            prompt: prompt + ', high quality, detailed',
            params: {
                width: source.width,
                height: source.height,
                steps: 18,
                n: 1,
                denoising_strength: 0.6,
                cfg_scale: 7
            },
            source_image: source.base64,
            source_processing: 'img2img',
            models: ['stable_diffusion_2.1'],
            nsfw: false
        })
    });
    if (!postResponse.ok) throw new Error('Horde HTTP ' + postResponse.status);
    var postData = await postResponse.json();
    var jobId = postData.id;
    if (!jobId) throw new Error('Horde: нет id задачи');

    for (var attempt = 0; attempt < 60; attempt++) {
        await sleep(3000);
        var checkResponse = await fetch('https://aihorde.net/api/v2/generate/check/' + jobId);
        var checkData = await checkResponse.json();
        if (checkData.faulted) throw new Error('Horde: задача сломалась');
        if (checkData.done) {
            var statusResponse = await fetch('https://aihorde.net/api/v2/generate/status/' + jobId);
            var statusData = await statusResponse.json();
            if (statusData.generations && statusData.generations.length > 0 && statusData.generations[0].img) {
                var stored = await urlToStored(statusData.generations[0].img);
                return { url: stored, engine: 'horde-img2img' };
            }
            throw new Error('Horde: нет результата');
        }
    }
    throw new Error('Horde: таймаут');
}

// ===== РЕСТАВРАЦИЯ (радикальная цензура + якорь) =====
async function restoreBuilding(originalBase64, description, styleName) {
    var styleDesc = STYLES[styleName] || '';
    var personDetected = containsPersonWords(description);
    var cleanDesc = personDetected ? '' : sanitizePrompt(description);
    var descTags = extractEnglishTags(description);

    var prompt = [
        'restored building facade',
        'repaired walls',
        'intact complete windows with glass',
        'clean restored facade',
        'no damage no cracks no ruins no graffiti',
        'same building same composition',
        'people only as tiny distant silhouettes far away',
        descTags.join(', '),
        cleanDesc,
        styleDesc,
        'architectural photography'
    ].filter(Boolean).join(', ');

    // 1) Настоящий img2img: твоё фото = основа
    var source = await prepareSourceBase64(originalBase64);
    if (source) {
        try {
            return await restoreViaHordeImg2Img(source, prompt);
        } catch (e) {
            console.warn('img2img не сработал, запасной вариант:', e.message);
        }
    }

    // 2) Запасной: генерация по тексту с анализом цветов фото
    var analysis = await analyzeImage(originalBase64);
    return await smartGenerate(prompt + ', ' + analysis, false);
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
            var c = getCtx(), osc = c.createOscillator(), gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(volume || 0.1, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain); gain.connect(c.destination);
            osc.start(); osc.stop(c.currentTime + duration);
        } catch (e) {}
    }
    return {
        click: function() { playTone(800 + Math.random() * 400, 'sine', 0.08, 0.05); },
        success: function() { playTone(523, 'triangle', 0.3); setTimeout(function() { playTone(659, 'triangle', 0.4); }, 150); },
        error: function() { playTone(150, 'sawtooth', 0.5, 0.15); },
        whistle: function() {
            if (!STATE.soundEnabled) return;
            try {
                var c = getCtx(), o = c.createOscillator(), g = c.createGain();
                o.frequency.setValueAtTime(880, c.currentTime);
                o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.4);
                g.gain.setValueAtTime(0.001, c.currentTime);
                g.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.1);
                g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
                o.connect(g); g.connect(c.destination);
                o.start(); o.stop(c.currentTime + 1.3);
            } catch (e) {}
        }
    };
})();

// ===== ЧАТ ПОДДЕРЖКИ (дружелюбный) =====
var CHAT_RESPONSES = {
    alisa: "🤖 <b>Промпты от Алисы (Яндекс):</b><br>"
        + "• К сожалению, часто не работают как задумано 😔<br>"
        + "• Алиса описывает сцены с людьми, а наш сайт — только про здания<br>"
        + "• Цензура вырезает людей и рисует здание по тегам<br>"
        + "• Совет: просите Алису описать <b>здание без людей</b> "
        + "или вставьте свой промпт — так результат будет лучше 💛",
    generate: "🌱 <b>Не переживайте, сейчас разберёмся!</b><br>"
        + "• Генерация занимает 10–60 секунд — это нормально<br>"
        + "• Если долго — выберите разрешение 640 в настройках ⚙️<br>"
        + "• Мы запускаем 3 модели одновременно, первая готовая картинка появится сама ✨",
    restore: "🏗️ <b>Реставрация работает так:</b><br>"
        + "• Ваше фото — основа, ИИ дорисовывает разрушенное (img2img)<br>"
        + "• Опишите подробнее, что восстановить — будет точнее<br>"
        + "• Horde может занять до 3 минут, пожалуйста, подождите 💛",
    slow: "⏳ <b>Понимаю, ждать обидно! Вот что ускоряет:</b><br>"
        + "• Разрешение 640 в настройках ⚙️<br>"
        + "• Модель Turbo — самая быстрая<br>"
        + "• Пока ждёте — потапкайте хомяка 🐹 и получите монетки!",
    diverse: "🎲 <b>Каждая картинка уникальна!</b><br>"
        + "• Мы случайно меняем свет, погоду, ракурс и настроение<br>"
        + "• Даже с тем же промптом результат будет другим<br>"
        + "• Нажмите «Создать проект» ещё раз — увидите 🌟",
    censor: "🛡️ <b>Цензура на страже!</b><br>"
        + "• Люди вырезаются из промпта автоматически<br>"
        + "• Разрешены только крошечные силуэты вдали<br>"
        + "• Если промпт про человека — нарисуем здание вместо него<br>"
        + "• Так сайт остаётся про архитектуру 🏛️",
    gallery: "🖼️ <b>Галерея — ваша коллекция!</b><br>"
        + "• Все работы сохраняются в браузере<br>"
        + "• 🗑️ под картинкой — удалить одну<br>"
        + "• Нажмите на картинку, чтобы рассмотреть поближе 🔍",
    teapot: "🫖 <b>Секретик про чайник:</b><br>"
        + "• Положите файл teapot.png (или .jpg/.gif) рядом с index.html<br>"
        + "• И в пасхалке появится ВАША картинка ✨",
    emoji: "😢 <b>Стикеры серые на ПК?</b><br>"
        + "• Мы подключили цветные эмодзи Noto Color Emoji<br>"
        + "• Нажмите Ctrl+F5, чтобы обновить<br>"
        + "• Или замените эмодзи на свои картинки 🖼️",
    design: "🎨 <b>Сделайте сайт своим!</b><br>"
        + "• 6 тем + 8 дизайнов + 3 разрешения = 144 комбинации ✨<br>"
        + "• Всё в настройках ⚙️"
};

function handleChatQuestion(key) {
    var msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    var labels = {
        alisa: 'Промпт от Алисы', generate: 'Не генерирует', restore: 'Не реставрирует',
        slow: 'Долго ждать', diverse: 'Похожие картинки', censor: 'Цензура',
        gallery: 'Галерея', teapot: 'Картинка чайника', emoji: 'Стикеры на ПК',
        design: 'Темы и дизайны'
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

// ===== КОНЕЦ ЧАСТИ 2 ИЗ 3 =====

// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js (часть 3 из 3)
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
    var el;
    el = document.getElementById('coin-num'); if (el) el.textContent = STATE.coins;
    el = document.getElementById('tea-num'); if (el) el.textContent = STATE.tea;
    el = document.getElementById('f-gens'); if (el) el.textContent = STATE.learning.generations;
    el = document.getElementById('f-likes'); if (el) el.textContent = STATE.learning.likes;
    el = document.getElementById('f-dislikes'); if (el) el.textContent = STATE.learning.dislikes;
    var total = STATE.learning.likes + STATE.learning.dislikes;
    el = document.getElementById('f-acc'); if (el) el.textContent = total > 0 ? Math.round(STATE.learning.likes / total * 100) : 0;
}

function showLoading(msg) {
    var el = document.getElementById('loading-text');
    if (el) el.textContent = msg;
    var ov = document.getElementById('loading-overlay');
    if (ov) ov.classList.add('active');
    loadStart = Date.now();
    clearInterval(loadTimerId);
    loadTimerId = setInterval(function() {
        var t = document.getElementById('loading-timer');
        if (t) {
            if (cooldownRemaining > 0) {
                t.textContent = '⏳ Отдых API: ' + Math.ceil(cooldownRemaining / 1000) + ' сек';
            } else {
                t.textContent = '⏱ ' + Math.round((Date.now() - loadStart) / 1000) + ' сек';
            }
        }
    }, 500);
}

function hideLoading() {
    clearInterval(loadTimerId);
    var ov = document.getElementById('loading-overlay');
    if (ov) ov.classList.remove('active');
}

function spawnCoin(x, y) {
    var el = document.createElement('div');
    el.className = 'coin-plus';
    el.textContent = '+1 🪙';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1600);
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
    if (!main) return;
    main.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'card gothic-card';
    var styleKeys = Object.keys(STYLES);
    var opts = '';
    for (var i = 0; i < styleKeys.length; i++) opts += '<option>' + styleKeys[i] + '</option>';

    if (page === 'generate') {
        card.innerHTML = '<h2 class="page-title">📝 Генерация здания</h2>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width"><label>Описание</label><textarea id="gp" placeholder="Опишите здание подробно..."></textarea></div>'
            + '<div class="form-group"><label>Стиль (' + styleKeys.length + ')</label><select id="gs">' + opts + '</select></div>'
            + '<div class="form-group"><label>Seed</label><input type="number" id="gseed" placeholder="Случайно"></div>'
            + '</div><button class="btn gothic-btn" id="btn-gen">🎲 Создать проект</button><div id="res-area"></div>';
    } else if (page === 'restore') {
        card.innerHTML = '<h2 class="page-title">🔨 Реставрация фасада</h2>'
            + '<p style="color:var(--text-muted);margin-bottom:20px">Загрузите фото разрушенного здания. ИИ возьмёт его за основу и дорисует утраченные части (img2img).</p>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width"><label>Фото здания</label><input type="file" id="rf" accept="image/*"></div>'
            + '<div class="form-group full-width"><label>Что восстановить?</label><textarea id="rp" placeholder="достроить крышу, восстановить окна..."></textarea></div>'
            + '<div class="form-group"><label>Стиль здания</label><select id="rs">' + opts + '</select></div>'
            + '</div><button class="btn gothic-btn" id="btn-res">🏗️ Реставрировать</button><div id="res-area"></div>';
    } else if (page === 'gallery') {
        card.innerHTML = '<h2 class="page-title">🖼️ Галерея</h2>';
        if (STATE.history.length === 0) {
            card.innerHTML += '<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста!</p>';
        } else {
            card.innerHTML += '<div style="margin-bottom:20px;text-align:right"><button class="btn btn-secondary" id="btn-clear-all" style="border-color:var(--error);color:var(--error);padding:8px 16px;font-size:.85rem;min-height:auto">🗑️ Удалить всё</button></div>';
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
        card.innerHTML = '<h2 class="page-title">ℹ️ О проекте</h2><p><b>Реставратор фасадов</b> — клиентская JS-версия.<br>40 стилей · 4 движка · 6 тем · 8 дизайнов · 3 разрешения<br>🔨 Реставрация = img2img: твоё фото за основа<br>🛡️ Цензура + переводчик-якорь: люди только силуэтами вдали<br>🫖 Своя картинка чайника: teapot.png рядом с index.html</p>';
    }
    main.appendChild(card);
    bindPageEvents();
    bindGalleryEvents();
}

// ===== РЕЗУЛЬТАТЫ И ЛАЙТБОКС =====
function showResult(data) {
    var a = document.getElementById('res-area');
    if (!a) return;
    a.innerHTML = '<div class="result"><img src="' + data.url + '" onclick="openLightbox(0)">'
        + '<div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">Стиль: <b>' + data.style + '</b> | Модель: <b>' + data.engine + '</b></div>'
        + '<div class="result-actions">'
        + '<button class="btn-like" onclick="handleVote(\'like\')">👍 Нравится</button>'
        + '<button class="btn-dislike" onclick="handleVote(\'dislike\')">👎 Не нравится</button>'
        + '<a href="' + data.url + '" download="facade_' + Date.now() + '.jpg" class="btn btn-secondary" target="_blank">💾 Скачать</a>'
        + '</div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function showError(msg) {
    var a = document.getElementById('res-area');
    if (!a) return;
    a.innerHTML = '<div class="result" style="border-color:var(--error)"><div style="font-size:3rem;margin-bottom:15px">⚠️</div>'
        + '<h3 style="color:var(--error);margin-bottom:10px">Ошибка</h3>'
        + '<p style="color:var(--text-muted);margin-bottom:20px;white-space:pre-line;font-size:.9rem">' + msg + '</p>'
        + '<div class="result-actions"><button class="btn btn-secondary" onclick="document.getElementById(\'res-area\').innerHTML=\'\'">✕ Закрыть</button></div></div>';
    a.scrollIntoView({ behavior: 'smooth' });
}

function handleVote(type) {
    if (type === 'like') STATE.learning.likes++;
    else STATE.learning.dislikes++;
    saveState(); updateUI();
    var actions = document.querySelector('.result-actions');
    if (actions) actions.innerHTML = '<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>';
    AudioEngine.click();
}

function openLightbox(idx) {
    var item = STATE.history[idx];
    if (!item) return;
    var img = document.getElementById('lb-img');
    var info = document.getElementById('lb-info');
    var modal = document.getElementById('lightbox-modal');
    if (img) img.src = item.url;
    if (info) info.textContent = (item.style || '') + ' · ' + item.engine;
    if (modal) modal.classList.add('active');
}

function closeLightbox() {
    var modal = document.getElementById('lightbox-modal');
    var img = document.getElementById('lb-img');
    if (modal) modal.classList.remove('active');
    if (img) img.src = '';
}

// ===== ГЕНЕРАЦИЯ (радикальная цензура + якорь) =====
async function performGeneration(prompt, styleName) {
    var tags = extractEnglishTags(prompt);
    if (tags.length === 0) tags = ['building', 'architecture'];
    var personDetected = containsPersonWords(prompt);
    var clean = personDetected ? '' : sanitizePrompt(prompt);
    var parts = [tags.join(', '), clean];
    if (personDetected) parts.push('building only, no people, no person, no figure');
    if (STYLES[styleName] && STYLES[styleName].length > 0) parts.push(STYLES[styleName]);
    var fullPrompt = parts.join(', ');
    showLoading('🎨 Генерация (гонка моделей)...');
    try {
        var result = await smartGenerate(fullPrompt, false);
        result.style = styleName;
        result.date = new Date().toISOString();
        STATE.history.unshift(result);
        if (STATE.history.length > 50) STATE.history = STATE.history.slice(0, 50);
        STATE.learning.generations++;
        saveState(); updateUI(); showResult(result); AudioEngine.success();
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
            showLoading('🏗️ Реставрация (img2img, до 3 минут)...');
            var reader = new FileReader();
            reader.onload = async function(ev) {
                try {
                    var r = await restoreBuilding(ev.target.result, desc, style);
                    r.style = style;
                    r.date = new Date().toISOString();
                    STATE.history.unshift(r);
                    if (STATE.history.length > 50) STATE.history = STATE.history.slice(0, 50);
                    STATE.learning.generations++;
                    saveState(); updateUI(); showResult(r); AudioEngine.success();
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
                saveState(); renderPage('gallery'); AudioEngine.click();
            }
        });
    }
    var cb = document.getElementById('btn-clear-all');
    if (cb) {
        cb.addEventListener('click', function() {
            if (confirm('Удалить ВСЕ?')) {
                STATE.history = [];
                saveState(); renderPage('gallery'); AudioEngine.error();
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
    if (sb) {
        for (var i = 0; i < 9; i++) {
            var s = document.createElement('div');
            s.className = 'star';
            s.style.left = (5 + i * 10) + '%';
            s.style.animationDelay = (i * 0.8) + 's';
            sb.appendChild(s);
        }
    }

    var navBtns = document.querySelectorAll('.nav-btn');
    for (var n = 0; n < navBtns.length; n++) {
        navBtns[n].addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.dataset.page);
        });
    }

    var panel = document.getElementById('settings-panel');
    on('settings-btn', 'click', function(e) {
        e.stopPropagation();
        if (panel) panel.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (panel && !panel.contains(e.target) && e.target.id !== 'settings-btn') panel.classList.remove('open');
    });

    var themeBtns = document.querySelectorAll('.theme-btn');
    for (var t = 0; t < themeBtns.length; t++) {
        themeBtns[t].addEventListener('click', function() {
            setTheme(this.dataset.theme);
            AudioEngine.click();
        });
    }

    var dsg = on('design-select', 'change', function(e) { setDesign(e.target.value); AudioEngine.click(); });
    if (dsg) dsg.value = STATE.design;

    var rsz = on('res-select', 'change', function(e) { STATE.resolution = e.target.value; saveState(); AudioEngine.click(); });
    if (rsz) rsz.value = STATE.resolution;

    var mdl = on('model-select', 'change', function(e) { STATE.selectedModel = e.target.value; saveState(); AudioEngine.click(); });
    if (mdl) mdl.value = STATE.selectedModel;

    var fst = on('fast-mode', 'change', function(e) { STATE.fastMode = e.target.checked; saveState(); });
    if (fst) fst.checked = STATE.fastMode;

    var snd = on('sound-on', 'change', function(e) { STATE.soundEnabled = e.target.checked; saveState(); });
    if (snd) snd.checked = STATE.soundEnabled;

    on('reset-coins', 'click', function() { STATE.coins = 0; STATE.tea = 0; saveState(); updateUI(); AudioEngine.click(); });

    var ham = document.getElementById('hamster');
    if (ham) {
        ham.addEventListener('click', function(e) {
            e.stopPropagation();
            ham.classList.remove('tap');
            void ham.offsetWidth;
            ham.classList.add('tap');
            STATE.coins++;
            saveState(); updateUI();
            spawnCoin(e.clientX, e.clientY);
            AudioEngine.click();
        });
    }

    on('lb-close-btn', 'click', closeLightbox);
    var lbm = document.getElementById('lightbox-modal');
    if (lbm) lbm.addEventListener('click', function(e) { if (e.target === lbm) closeLightbox(); });

    on('teapot-link', 'click', function(e) {
        e.preventDefault();
        var tm = document.getElementById('teapot-modal');
        var ti = document.getElementById('teapot-img');
        var te = document.getElementById('teapot-emoji');
        if (teapotCustomUrl && ti) {
            ti.src = teapotCustomUrl;
            ti.style.display = 'block';
            if (te) te.style.display = 'none';
        }
        if (tm) tm.classList.add('active');
        STATE.tea++;
        saveState(); updateUI();
        AudioEngine.whistle();
    });
    on('teapot-close-btn', 'click', function() {
        var tm = document.getElementById('teapot-modal');
        if (tm) tm.classList.remove('active');
    });
    on('teapot-sound-btn', 'click', function() { AudioEngine.whistle(); });

    var chatPanel = document.getElementById('chat-panel');
    on('chat-btn', 'click', function(e) {
        e.stopPropagation();
        if (chatPanel) chatPanel.classList.toggle('open');
    });
    on('chat-close', 'click', function() { if (chatPanel) chatPanel.classList.remove('open'); });
    document.addEventListener('click', function(e) {
        if (chatPanel && !chatPanel.contains(e.target) && e.target.id !== 'chat-btn') chatPanel.classList.remove('open');
    });
    if (chatPanel) chatPanel.addEventListener('click', function(e) { e.stopPropagation(); });

    var chatQs = document.querySelectorAll('.chat-q');
    for (var q = 0; q < chatQs.length; q++) {
        chatQs[q].addEventListener('click', function() { handleChatQuestion(this.dataset.q); });
    }
});

// ===== КОНЕЦ ФАЙЛА =====
