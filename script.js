
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js
// Часть 1 из 4: Стили, состояние, движок генерации
// =============================================

// ===== 40 АРХИТЕКТУРНЫХ СТИЛЕЙ =====
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

// Негативный промпт — что исключить из генерации
const NEGATIVE_PROMPT = "people, humans, crowd, faces, animals, blurry, low quality, deformed, watermark, text";

// Бустер промпта — добавляется к каждому запросу
const BUILDING_BOOST = "architecture only, building exterior, facade, no people, no interior, photorealistic, 8k, ultra detailed";

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
const STATE = {
    coins: parseInt(localStorage.getItem('hc')) || 0,
    tea: parseInt(localStorage.getItem('tb')) || 0,
    soundEnabled: localStorage.getItem('snd') !== '0',
    theme: localStorage.getItem('thm') || 'gothic',
    selectedModel: localStorage.getItem('mdl') || 'flux',
    history: JSON.parse(localStorage.getItem('hist') || '[]'),
    learning: JSON.parse(localStorage.getItem('lrn') || '{"generations":0,"likes":0,"dislikes":0}')
};

// Сохранение состояния в localStorage
function saveState() {
    localStorage.setItem('hc', STATE.coins);
    localStorage.setItem('tb', STATE.tea);
    localStorage.setItem('snd', STATE.soundEnabled ? '1' : '0');
    localStorage.setItem('thm', STATE.theme);
    localStorage.setItem('mdl', STATE.selectedModel);
    localStorage.setItem('hist', JSON.stringify(STATE.history));
    localStorage.setItem('lrn', JSON.stringify(STATE.learning));
}

// =============================================
// ДВИЖОК ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ
// Используем Pollinations AI через <img> тег
// Это обходит CORS и работает без API-ключей
// =============================================

/**
 * Генерирует изображение через Pollinations AI
 * Создаёт скрытый <img> элемент, добавляет в DOM,
 * ждёт загрузки, конвертирует в base64 через canvas
 */
function generateImage(prompt, modelName) {
    return new Promise(function(resolve, reject) {
        // Формируем полный промпт
        var fullPrompt = prompt + ', ' + BUILDING_BOOST;
        var encodedPrompt = encodeURIComponent(fullPrompt);
        var encodedNegative = encodeURIComponent(NEGATIVE_PROMPT);
        var seed = Math.floor(Math.random() * 999999);

        // URL для Pollinations API
        var imageUrl = 'https://image.pollinations.ai/prompt/' + encodedPrompt
            + '?width=1024'
            + '&height=1024'
            + '&seed=' + seed
            + '&nologo=true'
            + '&negative=' + encodedNegative
            + '&model=' + modelName;

        // Создаём скрытый img элемент
        var img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.style.display = 'none';
        img.style.position = 'absolute';
        img.style.left = '-9999px';
        document.body.appendChild(img);

        // Таймаут 120 секунд
        var timeoutId = setTimeout(function() {
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
            reject(new Error('Таймаут 120 секунд — сервер не ответил'));
        }, 120000);

        // Успешная загрузка
        img.onload = function() {
            clearTimeout(timeoutId);
            try {
                var canvas = document.createElement('canvas');
                var width = img.naturalWidth;
                var height = img.naturalHeight;

                // Проверяем что изображение не пустое
                if (!width || !height) {
                    if (img.parentNode) {
                        img.parentNode.removeChild(img);
                    }
                    reject(new Error('Сервер вернул пустое изображение'));
                    return;
                }

                // Ограничиваем размер для экономии localStorage
                var maxSize = 800;
                if (width > maxSize || height > maxSize) {
                    var ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, width, height);

                var dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                // Удаляем img из DOM
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }

                resolve({
                    url: dataUrl,
                    engine: modelName
                });
            } catch (error) {
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
                reject(error);
            }
        };

        // Ошибка загрузки
        img.onerror = function() {
            clearTimeout(timeoutId);
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
            reject(new Error('Ошибка загрузки от модели ' + modelName));
        };

        // Запускаем загрузку
        img.src = imageUrl;
    });
}

/**
 * Пробует несколько моделей по очереди
 * Если одна не работает — пробует следующую
 */
async function generateWithFallback(prompt) {
    var modelsToTry = [STATE.selectedModel, 'flux', 'turbo', 'sdxl'];

    // Убираем дубликаты
    var uniqueModels = [];
    for (var i = 0; i < modelsToTry.length; i++) {
        if (uniqueModels.indexOf(modelsToTry[i]) === -1) {
            uniqueModels.push(modelsToTry[i]);
        }
    }

    var errors = [];

    for (var j = 0; j < uniqueModels.length; j++) {
        var model = uniqueModels[j];
        try {
            var result = await generateImage(prompt, model);
            return result;
        } catch (error) {
            var errorMsg = model + ': ' + (error.message || 'неизвестная ошибка');
            errors.push(errorMsg);
            console.warn('Модель ' + model + ' не сработала:', error.message);
        }
    }

    throw new Error(
        'Все модели недоступны:\n' + errors.join('\n')
        + '\n\nПодождите 15 секунд и попробуйте снова.'
        + '\nБесплатный API имеет лимит: 1 запрос / 15 сек.'
    );
}

// =============================================
// ДВИЖОК РЕСТАВРАЦИИ
// Анализирует пиксели фото и генерирует
// восстановленную версию здания
// =============================================

/**
 * Анализирует изображение и возвращает описание цветов/тона
 */
function analyzeImage(base64Data) {
    return new Promise(function(resolve) {
        var img = new Image();

        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 32, 32);

            var imageData = ctx.getImageData(0, 0, 32, 32);
            var pixels = imageData.data;
            var totalRed = 0;
            var totalGreen = 0;
            var totalBlue = 0;
            var pixelCount = 0;

            for (var i = 0; i < pixels.length; i += 4) {
                totalRed += pixels[i];
                totalGreen += pixels[i + 1];
                totalBlue += pixels[i + 2];
                pixelCount++;
            }

            var avgRed = Math.round(totalRed / pixelCount);
            var avgGreen = Math.round(totalGreen / pixelCount);
            var avgBlue = Math.round(totalBlue / pixelCount);

            // Определяем освещённость
            var luminance = 0.299 * avgRed + 0.587 * avgGreen + 0.114 * avgBlue;
            var toneDescription = 'soft natural light';
            if (luminance < 90) {
                toneDescription = 'dark moody atmosphere';
            } else if (luminance > 170) {
                toneDescription = 'bright daylight';
            }

            // Определяем оттенок стен
            var hueDescription = 'gray weathered stone';
            if (avgRed > avgGreen + 20 && avgRed > avgBlue + 20) {
                hueDescription = 'reddish brick walls';
            } else if (avgGreen > avgRed + 10 && avgGreen > avgBlue + 10) {
                hueDescription = 'greenish overgrown facade';
            } else if (avgBlue > avgRed + 10 && avgBlue > avgGreen + 10) {
                hueDescription = 'bluish stone facade';
            } else if (avgRed > 150 && avgGreen > 130 && avgBlue < 100) {
                hueDescription = 'warm yellow plaster walls';
            }

            resolve(toneDescription + ', ' + hueDescription + ', aged texture, weathered surface');
        };

        img.onerror = function() {
            resolve('old building, weathered facade, aged texture');
        };

        img.src = base64Data;
    });
}

/**
 * Реставрация: анализирует фото + генерирует восстановленную версию
 */
async function restoreBuilding(originalBase64, description, styleName) {
    var styleDescription = STYLES[styleName] || '';

    // Анализируем оригинальное фото
    var analysis = await analyzeImage(originalBase64);

    // Формируем промпт для восстановленного здания
    var restorePromptParts = [
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
        styleDescription
    ];

    // Убираем пустые элементы
    var filteredParts = [];
    for (var i = 0; i < restorePromptParts.length; i++) {
        if (restorePromptParts[i] && restorePromptParts[i].length > 0) {
            filteredParts.push(restorePromptParts[i]);
        }
    }

    var restorePrompt = filteredParts.join(', ');

    // Генерируем через тот же движок
    return await generateWithFallback(restorePrompt);
}

// ===== КОНЕЦ ЧАСТИ 1 ИЗ 4 =====
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js
// Часть 2 из 4: Звук, чат поддержки, навигация, рендеринг страниц
// =============================================

// ===== ЗВУКОВОЙ ДВИЖОК =====
var AudioEngine = (function() {
    var audioContext = null;

    function getContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    function playTone(frequency, type, duration, volume) {
        if (!STATE.soundEnabled) return;
        try {
            var ctx = getContext();
            var oscillator = ctx.createOscillator();
            var gainNode = ctx.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
            gainNode.gain.setValueAtTime(volume || 0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            // Звук не критичен — игнорируем ошибки
        }
    }

    return {
        click: function() {
            playTone(800 + Math.random() * 400, 'sine', 0.08, 0.05);
        },
        success: function() {
            playTone(523, 'triangle', 0.3);
            setTimeout(function() {
                playTone(659, 'triangle', 0.4);
            }, 150);
        },
        error: function() {
            playTone(150, 'sawtooth', 0.5, 0.15);
        },
        whistle: function() {
            if (!STATE.soundEnabled) return;
            try {
                var ctx = getContext();
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 1.3);
            } catch (e) {}
        }
    };
})();

// ===== ЧАТ ПОДДЕРЖКИ =====
var CHAT_RESPONSES = {
    generate: "🔧 <b>Генерация не работает:</b><br>"
        + "• Pollinations — бесплатный API без ключей<br>"
        + "• Лимит: 1 запрос каждые 15 секунд<br>"
        + "• Подождите 15 сек и попробуйте снова<br>"
        + "• Генерация занимает 10-60 секунд<br>"
        + "• Попробуйте другую модель в настройках ⚙️",

    restore: "🔧 <b>Реставрация не работает:</b><br>"
        + "• Анализирует цвета вашего фото<br>"
        + "• Генерирует восстановленную версию<br>"
        + "• Чем подробнее описание — тем лучше результат<br>"
        + "• Работает через тот же API что и генерация",

    gallery: "🔧 <b>Галерея:</b><br>"
        + "• Хранится в localStorage браузера<br>"
        + "• Лимит: 50 изображений<br>"
        + "• 🗑️ под картинкой — удалить одну<br>"
        + "• «Удалить всё» — очистить всю галерею",

    footer: "🔧 <b>Подвал глючит:</b><br>"
        + "• Исправлено в этой версии!<br>"
        + "• Просмотр картинок использует отдельную модалку<br>"
        + "• Она не связана с чайником и не ломает подвал",

    hamster: "🐹 <b>Хомяк:</b><br>"
        + "• Появляется только во время генерации<br>"
        + "• Тапайте по нему для получения монет 🪙<br>"
        + "• Монеты сохраняются в браузере",

    teapot: "🫖 <b>Чайник:</b><br>"
        + "• Это секретная пасхалка!<br>"
        + "• Найдите символ 🫖 в подвале сайта<br>"
        + "• Он полупрозрачный, в правом нижнем углу<br>"
        + "• При клике: +1 чайный пакетик 🍵 и свисток",

    slow: "🔧 <b>Медленная работа:</b><br>"
        + "• Генерация: 10-60 секунд — это нормально<br>"
        + "• Бесплатный API имеет ограничения<br>"
        + "• Flux — самая быстрая модель<br>"
        + "• На мобильных может быть медленнее",

    styles: "🎨 <b>40 архитектурных стилей:</b><br>"
        + "• От Хрущёвки до Киберпанка<br>"
        + "• Все доступны в выпадающем списке<br>"
        + "• На страницах Генерации и Реставрации"
};

function handleChatQuestion(questionKey) {
    var messagesContainer = document.getElementById('chat-messages');

    var questionLabels = {
        generate: 'Не генерирует',
        restore: 'Не реставрирует',
        gallery: 'Галерея',
        footer: 'Подвал глючит',
        hamster: 'Хомяк',
        teapot: 'Где чайник?',
        slow: 'Медленно',
        styles: 'Стили'
    };

    // Добавляем сообщение пользователя
    var userMessage = document.createElement('div');
    userMessage.className = 'chat-msg user';
    userMessage.textContent = questionLabels[questionKey] || questionKey;
    messagesContainer.appendChild(userMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Добавляем ответ бота с задержкой
    setTimeout(function() {
        var botMessage = document.createElement('div');
        botMessage.className = 'chat-msg bot';
        botMessage.innerHTML = CHAT_RESPONSES[questionKey] || 'Не знаю ответа на этот вопрос.';
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300);
}

// ===== НАВИГАЦИЯ =====
var currentPage = 'generate';

function setTheme(themeName) {
    STATE.theme = themeName;
    saveState();
    document.body.dataset.theme = themeName;
    var buttons = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.theme === themeName) {
            buttons[i].classList.add('active');
        } else {
            buttons[i].classList.remove('active');
        }
    }
}

function updateInterface() {
    document.getElementById('coin-num').textContent = STATE.coins;
    document.getElementById('tea-num').textContent = STATE.tea;
    document.getElementById('f-gens').textContent = STATE.learning.generations;
    document.getElementById('f-likes').textContent = STATE.learning.likes;
    document.getElementById('f-dislikes').textContent = STATE.learning.dislikes;
    var totalVotes = STATE.learning.likes + STATE.learning.dislikes;
    var accuracy = totalVotes > 0 ? Math.round(STATE.learning.likes / totalVotes * 100) : 0;
    document.getElementById('f-acc').textContent = accuracy;
}

function showLoading(message) {
    document.getElementById('loading-text').textContent = message;
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function spawnCoinParticle(xPosition, yPosition) {
    var particle = document.createElement('div');
    particle.className = 'coin-plus';
    particle.textContent = '+1 🪙';
    particle.style.left = xPosition + 'px';
    particle.style.top = yPosition + 'px';
    document.body.appendChild(particle);
    setTimeout(function() {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1600);
}

function navigateToPage(pageName) {
    if (pageName === currentPage) return;
    document.body.classList.add('page-leave');
    setTimeout(function() {
        currentPage = pageName;
        document.body.classList.remove('page-leave');
        renderPage(pageName);
        var navButtons = document.querySelectorAll('.nav-btn');
        for (var i = 0; i < navButtons.length; i++) {
            if (navButtons[i].dataset.page === pageName) {
                navButtons[i].classList.add('active');
            } else {
                navButtons[i].classList.remove('active');
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
}

// ===== РЕНДЕРИНГ СТРАНИЦ =====
function renderPage(pageName) {
    var mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'card gothic-card';

    if (pageName === 'generate') {
        var styleOptions = '';
        var styleKeys = Object.keys(STYLES);
        for (var i = 0; i < styleKeys.length; i++) {
            styleOptions += '<option>' + styleKeys[i] + '</option>';
        }
        card.innerHTML = '<h2 class="page-title">📝 Генерация здания</h2>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width">'
            + '<label>Описание</label>'
            + '<textarea id="gp" placeholder="Опишите здание подробно..."></textarea>'
            + '</div>'
            + '<div class="form-group">'
            + '<label>Стиль (' + styleKeys.length + ')</label>'
            + '<select id="gs">' + styleOptions + '</select>'
            + '</div>'
            + '<div class="form-group">'
            + '<label>Seed</label>'
            + '<input type="number" id="gseed" placeholder="Случайно">'
            + '</div>'
            + '</div>'
            + '<button class="btn gothic-btn" id="btn-gen">✨ Создать проект</button>'
            + '<div id="res-area"></div>';

    } else if (pageName === 'restore') {
        var restoreStyleOptions = '';
        var rStyleKeys = Object.keys(STYLES);
        for (var j = 0; j < rStyleKeys.length; j++) {
            restoreStyleOptions += '<option>' + rStyleKeys[j] + '</option>';
        }
        card.innerHTML = '<h2 class="page-title">🔨 Реставрация фасада</h2>'
            + '<p style="color:var(--text-muted);margin-bottom:20px">'
            + 'Загрузите фото разрушенного здания. ИИ проанализирует его и сгенерирует восстановленную версию.</p>'
            + '<div class="form-grid">'
            + '<div class="form-group full-width">'
            + '<label>Фото здания</label>'
            + '<input type="file" id="rf" accept="image/*">'
            + '</div>'
            + '<div class="form-group full-width">'
            + '<label>Что восстановить?</label>'
            + '<textarea id="rp" placeholder="Например: достроить крышу, восстановить окна, убрать трещины..."></textarea>'
            + '</div>'
            + '<div class="form-group">'
            + '<label>Стиль здания</label>'
            + '<select id="rs">' + restoreStyleOptions + '</select>'
            + '</div>'
            + '</div>'
            + '<button class="btn gothic-btn" id="btn-res">🏗️ Реставрировать</button>'
            + '<div id="res-area"></div>';

    } else if (pageName === 'gallery') {
        card.innerHTML = '<h2 class="page-title">🖼️ Галерея</h2>';
        if (STATE.history.length === 0) {
            card.innerHTML += '<p style="text-align:center;padding:40px;color:var(--text-muted)">Галерея пуста! Создайте первый проект.</p>';
        } else {
            card.innerHTML += '<div style="margin-bottom:20px;text-align:right">'
                + '<button class="btn btn-secondary" id="btn-clear-all" '
                + 'style="border-color:var(--error);color:var(--error);padding:8px 16px;font-size:.85rem;min-height:auto">'
                + '🗑️ Удалить всё</button></div>';
            var grid = document.createElement('div');
            grid.className = 'gallery-grid';
            for (var k = 0; k < STATE.history.length; k++) {
                var item = STATE.history[k];
                var gridItem = document.createElement('div');
                gridItem.className = 'gallery-item';
                gridItem.innerHTML = '<img src="' + item.url + '" loading="lazy" onclick="openLightbox(' + k + ')">'
                    + '<div class="gallery-item-meta">'
                    + '<span class="style">' + (item.style || 'Custom') + '</span>'
                    + '<span class="time">' + new Date(item.date).toLocaleString() + ' · ' + item.engine + '</span>'
                    + '</div>'
                    + '<button class="btn-del" data-idx="' + k + '">🗑️ Удалить</button>';
                grid.appendChild(gridItem);
            }
            card.appendChild(grid);
        }

    } else if (pageName === 'learning') {
        var totalVotes = STATE.learning.likes + STATE.learning.dislikes;
        var accuracy = totalVotes > 0 ? Math.round(STATE.learning.likes / totalVotes * 100) : 0;
        card.innerHTML = '<h2 class="page-title">🧠 Обучение</h2>'
            + '<div class="learning-stats">'
            + '<div class="stat-card"><div class="stat-value">' + STATE.learning.generations + '</div>Генераций</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--success)">' + STATE.learning.likes + '</div>Лайков</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--error)">' + STATE.learning.dislikes + '</div>Дизлайков</div>'
            + '<div class="stat-card"><div class="stat-value" style="color:var(--grad-b)">' + accuracy + '%</div>Точность</div>'
            + '</div>';

    } else {
        card.innerHTML = '<h2 class="page-title">ℹ️ О проекте</h2>'
            + '<p><b>Реставратор фасадов</b> — полностью клиентская JS-версия.<br>'
            + '40 архитектурных стилей · Pollinations AI (бесплатно, без ключей)<br>'
            + 'Лимит бесплатного API: 1 запрос каждые 15 секунд<br>'
            + 'Чат поддержки 💬 слева внизу.</p>';
    }

    mainContent.appendChild(card);
    bindPageEvents();
    bindGalleryEvents();
}

// ===== КОНЕЦ ЧАСТИ 2 ИЗ 4 =====
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js
// Часть 3 из 4: Результаты, лайтбокс, генерация, обработчики событий
// =============================================

// ===== ПОКАЗ РЕЗУЛЬТАТА =====
function showResult(data) {
    var resultArea = document.getElementById('res-area');
    resultArea.innerHTML = '<div class="result">'
        + '<img src="' + data.url + '" onclick="openLightbox(0)">'
        + '<div style="margin-bottom:15px;color:var(--text-muted);font-size:.9rem">'
        + 'Стиль: <b>' + data.style + '</b> | Модель: <b>' + data.engine + '</b>'
        + '</div>'
        + '<div class="result-actions">'
        + '<button class="btn-like" onclick="handleVote(\'like\')">👍 Нравится</button>'
        + '<button class="btn-dislike" onclick="handleVote(\'dislike\')">👎 Не нравится</button>'
        + '<a href="' + data.url + '" download="facade_' + Date.now() + '.jpg" class="btn btn-secondary">💾 Скачать</a>'
        + '</div>'
        + '</div>';
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// ===== ПОКАЗ ОШИБКИ =====
function showError(message) {
    var resultArea = document.getElementById('res-area');
    resultArea.innerHTML = '<div class="result" style="border-color:var(--error)">'
        + '<div style="font-size:3rem;margin-bottom:15px">⚠️</div>'
        + '<h3 style="color:var(--error);margin-bottom:10px">Ошибка</h3>'
        + '<p style="color:var(--text-muted);margin-bottom:20px;white-space:pre-line;font-size:.9rem">'
        + message + '</p>'
        + '<div class="result-actions">'
        + '<button class="btn btn-secondary" onclick="document.getElementById(\'res-area\').innerHTML=\'\'">✕ Закрыть</button>'
        + '</div>'
        + '</div>';
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

// ===== ГОЛОСОВАНИЕ =====
function handleVote(voteType) {
    if (voteType === 'like') {
        STATE.learning.likes++;
    } else {
        STATE.learning.dislikes++;
    }
    saveState();
    updateInterface();
    var actionsDiv = document.querySelector('.result-actions');
    if (actionsDiv) {
        actionsDiv.innerHTML = '<p style="color:var(--accent);font-weight:bold">Спасибо за оценку!</p>';
    }
    AudioEngine.click();
}

// ===== ЛАЙТБОКС (отдельная модалка — не ломает подвал) =====
function openLightbox(index) {
    var item = STATE.history[index];
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
    if (STYLES[styleName] && STYLES[styleName].length > 0) {
        parts.push(STYLES[styleName]);
    }
    var fullPrompt = parts.join(', ');

    showLoading('🎨 Генерация... (10-60 сек)');

    try {
        var result = await generateWithFallback(fullPrompt);
        result.style = styleName;
        result.date = new Date().toISOString();

        STATE.history.unshift(result);
        if (STATE.history.length > 50) {
            STATE.history = STATE.history.slice(0, 50);
        }
        STATE.learning.generations++;
        saveState();
        updateInterface();
        showResult(result);
        AudioEngine.success();
    } catch (error) {
        console.error('Ошибка генерации:', error);
        showError(error.message || 'Неизвестная ошибка. Попробуйте позже.');
        AudioEngine.error();
    } finally {
        hideLoading();
    }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ СТРАНИЦ =====
function bindPageEvents() {
    // Кнопка генерации
    var generateButton = document.getElementById('btn-gen');
    if (generateButton) {
        generateButton.onclick = function() {
            var promptText = document.getElementById('gp').value.trim();
            var selectedStyle = document.getElementById('gs').value;
            if (!promptText && selectedStyle === 'Без стиля') {
                alert('Введите описание или выберите стиль');
                return;
            }
            performGeneration(promptText, selectedStyle);
        };
    }

    // Кнопка реставрации
    var restoreButton = document.getElementById('btn-res');
    if (restoreButton) {
        restoreButton.onclick = async function() {
            var fileInput = document.getElementById('rf');
            var descriptionText = document.getElementById('rp').value.trim();
            var selectedStyle = document.getElementById('rs').value;

            if (!fileInput.files || !fileInput.files[0]) {
                alert('Загрузите фото здания');
                return;
            }
            if (!descriptionText) {
                alert('Опишите, что нужно восстановить');
                return;
            }

            showLoading('🏗️ Реставрация... (10-60 сек)');

            var fileReader = new FileReader();
            fileReader.onload = async function(event) {
                try {
                    var result = await restoreBuilding(event.target.result, descriptionText, selectedStyle);
                    result.style = selectedStyle;
                    result.date = new Date().toISOString();

                    STATE.history.unshift(result);
                    if (STATE.history.length > 50) {
                        STATE.history = STATE.history.slice(0, 50);
                    }
                    STATE.learning.generations++;
                    saveState();
                    updateInterface();
                    showResult(result);
                    AudioEngine.success();
                } catch (error) {
                    console.error('Ошибка реставрации:', error);
                    showError(error.message || 'Ошибка реставрации. Попробуйте позже.');
                    AudioEngine.error();
                } finally {
                    hideLoading();
                }
            };
            fileReader.readAsDataURL(fileInput.files[0]);
        };
    }
}

// ===== ОБРАБОТЧИКИ ГАЛЕРЕИ =====
function bindGalleryEvents() {
    // Кнопки удаления отдельных элементов
    var deleteButtons = document.querySelectorAll('.btn-del');
    for (var i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', function(event) {
            event.stopPropagation();
            var index = parseInt(this.dataset.idx);
            if (confirm('Удалить эту генерацию?')) {
                STATE.history.splice(index, 1);
                saveState();
                renderPage('gallery');
                AudioEngine.click();
            }
        });
    }

    // Кнопка удаления всего
    var clearAllButton = document.getElementById('btn-clear-all');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', function() {
            if (confirm('Удалить ВСЕ генерации из галереи?')) {
                STATE.history = [];
                saveState();
                renderPage('gallery');
                AudioEngine.error();
            }
        });
    }
}

// ===== КОНЕЦ ЧАСТИ 3 ИЗ 4 =====
// =============================================
// РЕСТАВРАТОР ФАСАДОВ — script.js
// Часть 4 из 4: Инициализация при загрузке страницы
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    // Применяем сохранённую тему
    setTheme(STATE.theme);

    // Обновляем интерфейс
    updateInterface();

    // Рендерим начальную страницу
    renderPage('generate');

    // ===== СОЗДАЁМ ЗВЁЗДЫ =====
    var starsContainer = document.getElementById('stars');
    for (var i = 0; i < 9; i++) {
        var star = document.createElement('div');
        star.className = 'star';
        star.style.left = (5 + i * 10) + '%';
        star.style.animationDelay = (i * 0.8) + 's';
        starsContainer.appendChild(star);
    }

    // ===== НАВИГАЦИЯ =====
    var navButtons = document.querySelectorAll('.nav-btn');
    for (var n = 0; n < navButtons.length; n++) {
        navButtons[n].addEventListener('click', function(event) {
            event.preventDefault();
            navigateToPage(this.dataset.page);
        });
    }

    // ===== ПАНЕЛЬ НАСТРОЕК =====
    var settingsPanel = document.getElementById('settings-panel');
    var settingsButton = document.getElementById('settings-btn');

    settingsButton.addEventListener('click', function(event) {
        event.stopPropagation();
        settingsPanel.classList.toggle('open');
    });

    document.addEventListener('click', function(event) {
        var isInsidePanel = settingsPanel.contains(event.target);
        var isSettingsButton = event.target.id === 'settings-btn';
        if (!isInsidePanel && !isSettingsButton) {
            settingsPanel.classList.remove('open');
        }
    });

    // ===== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ =====
    var themeButtons = document.querySelectorAll('.theme-btn');
    for (var t = 0; t < themeButtons.length; t++) {
        themeButtons[t].addEventListener('click', function() {
            setTheme(this.dataset.theme);
            AudioEngine.click();
        });
    }

    // ===== ЗВУК =====
    var soundCheckbox = document.getElementById('sound-on');
    soundCheckbox.checked = STATE.soundEnabled;
    soundCheckbox.addEventListener('change', function(event) {
        STATE.soundEnabled = event.target.checked;
        saveState();
    });

    // ===== ВЫБОР МОДЕЛИ =====
    var modelSelect = document.getElementById('model-select');
    modelSelect.value = STATE.selectedModel;
    modelSelect.addEventListener('change', function(event) {
        STATE.selectedModel = event.target.value;
        saveState();
        AudioEngine.click();
    });

    // ===== СБРОС ВАЛЮТЫ =====
    var resetButton = document.getElementById('reset-coins');
    resetButton.addEventListener('click', function() {
        STATE.coins = 0;
        STATE.tea = 0;
        saveState();
        updateInterface();
        AudioEngine.click();
    });

    // ===== ХОМЯК =====
    var hamsterElement = document.getElementById('hamster');
    hamsterElement.addEventListener('click', function(event) {
        event.stopPropagation();
        hamsterElement.classList.remove('tap');
        void hamsterElement.offsetWidth; // Форсируем reflow для перезапуска анимации
        hamsterElement.classList.add('tap');
        STATE.coins++;
        saveState();
        updateInterface();
        spawnCoinParticle(event.clientX, event.clientY);
        AudioEngine.click();
    });

    // ===== ЛАЙТБОКС =====
    var lightboxCloseButton = document.getElementById('lb-close-btn');
    lightboxCloseButton.addEventListener('click', closeLightbox);

    var lightboxModal = document.getElementById('lightbox-modal');
    lightboxModal.addEventListener('click', function(event) {
        if (event.target === lightboxModal) {
            closeLightbox();
        }
    });

    // ===== ЧАЙНИК (ПАСХАЛКА) =====
    var teapotLink = document.getElementById('teapot-link');
    teapotLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('teapot-modal').classList.add('active');
        STATE.tea++;
        saveState();
        updateInterface();
        AudioEngine.whistle();
    });

    var teapotCloseButton = document.getElementById('teapot-close-btn');
    teapotCloseButton.addEventListener('click', function() {
        document.getElementById('teapot-modal').classList.remove('active');
    });

    var teapotSoundButton = document.getElementById('teapot-sound-btn');
    teapotSoundButton.addEventListener('click', function() {
        AudioEngine.whistle();
    });

    // ===== ЧАТ ПОДДЕРЖКИ =====
    var chatPanel = document.getElementById('chat-panel');
    var chatButton = document.getElementById('chat-btn');
    var chatCloseButton = document.getElementById('chat-close');

    chatButton.addEventListener('click', function(event) {
        event.stopPropagation();
        chatPanel.classList.toggle('open');
    });

    chatCloseButton.addEventListener('click', function() {
        chatPanel.classList.remove('open');
    });

    document.addEventListener('click', function(event) {
        var isInsideChat = chatPanel.contains(event.target);
        var isChatButton = event.target.id === 'chat-btn';
        if (!isInsideChat && !isChatButton) {
            chatPanel.classList.remove('open');
        }
    });

    chatPanel.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    var chatQuestionButtons = document.querySelectorAll('.chat-q');
    for (var q = 0; q < chatQuestionButtons.length; q++) {
        chatQuestionButtons[q].addEventListener('click', function() {
            handleChatQuestion(this.dataset.q);
        });
    }

}); // Конец DOMContentLoaded

// =============================================
// КОНЕЦ ФАЙЛА script.js
// =============================================
