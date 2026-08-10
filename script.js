/**
 * 🏛️ RESTAURATOR PRO v3.0 (RUS)
 * Улучшенная система частиц, анимаций и пасхалок
 */

// ... (STYLES и STATE остаются такими же, как в предыдущем ответе, но добавим звуки) ...
const STYLES = { /* ... полный список стилей ... */ 
    "Без стиля": "", "Сталинка": "stalinist neoclassical", "Хрущёвка": "soviet panel block", 
    "Киберпанк": "cyberpunk neon futuristic building" 
}; // Используйте полный список из прошлого ответа

const ENHANCER_TAGS = ["architectural photography", "8k resolution", "hyperrealistic", "sharp focus"];
const NEGATIVE_PROMPT = "people, blurry, low quality, watermark";

const STATE = {
    page: 'generate',
    coins: parseInt(localStorage.getItem('hr_coins') || '0'),
    tea: parseInt(localStorage.getItem('hr_tea') || '0'),
    sound: localStorage.getItem('hr_sound') !== 'false',
    theme: localStorage.getItem('hr_theme') || 'gothic',
    token: localStorage.getItem('hr_token') || '',
    engine: localStorage.getItem('hr_engine') || 'pollinations',
    autoEnhance: localStorage.getItem('hr_enhance') !== 'false',
    history: JSON.parse(localStorage.getItem('hr_history') || '[]'),
    learning: JSON.parse(localStorage.getItem('hr_learning') || '{"gens":0,"likes":0,"dislikes":0,"styles":{}}'),
    params: JSON.parse(localStorage.getItem('hr_params') || '{"guidance":7.5,"steps":30,"ratio":"1:1"}')
};

const save = () => {
    localStorage.setItem('hr_coins', STATE.coins);
    localStorage.setItem('hr_tea', STATE.tea);
    localStorage.setItem('hr_sound', STATE.sound);
    localStorage.setItem('hr_theme', STATE.theme);
    localStorage.setItem('hr_token', STATE.token);
    localStorage.setItem('hr_engine', STATE.engine);
    localStorage.setItem('hr_enhance', STATE.autoEnhance);
    localStorage.setItem('hr_history', JSON.stringify(STATE.history));
    localStorage.setItem('hr_learning', JSON.stringify(STATE.learning));
    localStorage.setItem('hr_params', JSON.stringify(STATE.params));
};

// ==========================================
// 2. AUDIO ENGINE (Улучшенный синтез)
// ==========================================
const AudioEngine = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = (freq, type, dur, vol = 0.1) => {
        if (!STATE.sound) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    };

    return {
        click: () => playTone(800 + Math.random() * 200, 'sine', 0.1, 0.05),
        coin: () => {
            if(!STATE.sound) return;
            playTone(1200, 'sine', 0.1, 0.1);
            setTimeout(() => playTone(1800, 'sine', 0.2, 0.1), 50);
        },
        success: () => { playTone(523.25, 'triangle', 0.3); setTimeout(() => playTone(659.25, 'triangle', 0.4), 150); },
        error: () => playTone(150, 'sawtooth', 0.5, 0.15),
        whistle: () => {
            if (!STATE.sound) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.3);
        }
    };
})();

// ==========================================
// 3. CORE APP LOGIC
// ==========================================
const App = {
    init: () => {
        App.applyTheme();
        App.renderNav();
        App.renderPage(STATE.page);
        App.updateBadges();
        App.initFX();
        App.bindGlobal();
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
        bar.style.width = '0%';
        setTimeout(() => bar.style.width = '40%', 100);
        setTimeout(() => bar.style.width = '70%', 800);
    },

    hideLoading: () => {
        document.getElementById('progress-bar').style.width = '100%';
        setTimeout(() => document.getElementById('loading-overlay').classList.remove('active'), 300);
    },

    spawnParticle: (x, y, text) => {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = text;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        // Random slight horizontal drift
        const drift = (Math.random() - 0.5) * 40;
        p.style.setProperty('--drift', drift + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },

    renderNav: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === STATE.page);
            btn.onclick = () => {
                STATE.page = btn.dataset.target;
                App.renderNav();
                App.renderPage(STATE.page);
                AudioEngine.click();
            };
        });
    },

    renderPage: (page) => {
        const container = document.getElementById('app-content');
        container.innerHTML = '<div class="card glass"></div>';
        const card = container.querySelector('.card');
        
        if (page === 'generate') {
            card.innerHTML = `
                <h2 class="page-title">📝 Генератор архитектуры</h2>
                <div class="form-grid">
                    <div class="form-group full"><label>Концепция здания</label><textarea id="gen-prompt" placeholder="Опишите здание детально..."></textarea></div>
                    <div class="form-group"><label>Стиль</label><select id="gen-style">${Object.keys(STYLES).map(s=>`<option>${s}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Seed</label><input type="number" id="gen-seed" placeholder="Random"></div>
                </div>
                <button class="btn gothic-btn" id="btn-gen">✨ Сгенерировать</button>
                <div id="result-area" class="result-area"></div>
            `;
        } else if (page === 'restore') {
            card.innerHTML = `<h2 class="page-title">🔨 Реставрация</h2><p>Загрузите фото для офлайн-улучшения.</p>
            <input type="file" id="res-file" accept="image/*" style="margin:20px 0">
            <button class="btn gothic-btn" id="btn-res">🏗️ Обработать</button>
            <div id="res-result"></div>`;
        } else if (page === 'gallery') {
             card.innerHTML = `<h2 class="page-title">🖼️ Галерея</h2><div class="gallery-grid">${STATE.history.map(i=>`<div class="gallery-item"><img src="${i.url}" onclick="App.openLB('${i.url}')"><div class="gallery-meta"><span class="gallery-style">${i.style||'Custom'}</span></div></div>`).join('') || '<p>Пусто</p>'}</div>`;
        } else if (page === 'learning') {
            card.innerHTML = `<h2 class="page-title">🧠 Аналитика</h2><p>Генераций: ${STATE.learning.gens}, Лайков: ${STATE.learning.likes}</p>`;
        } else {
            card.innerHTML = `<h2 class="page-title">ℹ️ О системе</h2><p>v3.0 Enhanced Edition. Тапайте хомяка!</p>`;
        }
        App.bindPageEvents();
    },

    bindPageEvents: () => {
        const genBtn = document.getElementById('btn-gen');
        if(genBtn) genBtn.onclick = async () => {
            const prompt = document.getElementById('gen-prompt').value;
            const style = document.getElementById('gen-style').value;
            const seed = document.getElementById('gen-seed').value || Math.floor(Math.random()*999999);
            
            App.showLoading(`🎨 Генерация (${STATE.engine})...`);
            try {
                const finalPrompt = `${prompt}, ${STYLES[style] || ''}, architectural photography, 8k`;
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
                
                await new Promise((res, rej) => { const i=new Image(); i.onload=res; i.onerror=rej; i.src=url; });
                
                const result = { url, style, date: new Date().toISOString(), engine: "Pollinations" };
                STATE.history.unshift(result);
                STATE.learning.gens++;
                save(); App.updateBadges();
                
                document.getElementById('result-area').innerHTML = `
                    <img src="${url}" class="result-img" onclick="App.openLB('${url}')">
                    <div class="result-actions">
                        <button class="btn gothic-btn" onclick="App.vote('like')">👍 Нравится</button>
                        <a href="${url}" download="facade.png" class="btn btn-secondary">💾 Скачать</a>
                    </div>`;
                AudioEngine.success();
            } catch(e) { alert("Ошибка: "+e.message); }
            finally { App.hideLoading(); }
        };
    },

    vote: (type) => {
        STATE.learning[type === 'like' ? 'likes' : 'dislikes']++;
        save(); App.updateBadges();
        AudioEngine.click();
    },

    openLB: (url) => {
        const lb = document.getElementById('lightbox');
        lb.querySelector('img').src = url;
        lb.classList.add('active');
    },

    bindGlobal: () => {
        // Settings
        const panel = document.getElementById('settings-panel');
        document.getElementById('settings-btn').onclick = (e) => { e.stopPropagation(); panel.classList.toggle('open'); };
        document.addEventListener('click', (e) => { if(!panel.contains(e.target) && e.target.id!=='settings-btn') panel.classList.remove('open'); });
        
        // Theme & Sound
        document.querySelectorAll('.theme-btn').forEach(b => b.onclick = () => { STATE.theme=b.dataset.theme; save(); App.applyTheme(); });
        document.getElementById('sound-on').onchange = (e) => { STATE.sound=e.target.checked; save(); };
        
        // Export/Import
        document.getElementById('export-data').onclick = () => {
            const blob = new Blob([JSON.stringify(STATE, null, 2)], {type: 'application/json'});
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `backup_${Date.now()}.json`; a.click();
        };
        document.getElementById('reset-all').onclick = () => { if(confirm("Сбросить всё?")) { localStorage.clear(); location.reload(); } };

        // 🐹 HAMSTER TAP LOGIC (PARTICLES)
        const hamster = document.getElementById('hamster');
        hamster.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent drag
            STATE.coins++;
            save();
            App.updateBadges();
            AudioEngine.coin();
            
            // Spawn multiple particles for "Juice"
            App.spawnParticle(e.clientX, e.clientY, '+1 🪙');
            App.spawnParticle(e.clientX - 20, e.clientY - 20, '✨');
            App.spawnParticle(e.clientX + 20, e.clientY - 10, '⭐');
            
            // Visual feedback on hamster
            hamster.style.transform = 'translateX(-50%) scale(0.9)';
            setTimeout(() => hamster.style.transform = 'translateX(-50%) scale(1)', 100);
        });

        // 🫖 TEAPOT EASTER EGG
        const openTeapot = () => {
            const modal = document.getElementById('teapot-modal');
            modal.classList.add('active');
            STATE.tea++;
            save();
            App.updateBadges();
            AudioEngine.whistle();
        };
        
        document.getElementById('footer-teapot').onclick = (e) => { e.preventDefault(); openTeapot(); };
        document.querySelector('#teapot-modal .close-btn').onclick = () => document.getElementById('teapot-modal').classList.remove('active');
        document.getElementById('teapot-sound-btn').onclick = AudioEngine.whistle;
        
        // Lightbox close
        document.querySelector('.lb-close').onclick = () => document.getElementById('lightbox').classList.remove('active');

        // Init values
        document.getElementById('sound-on').checked = STATE.sound;
        
        // Noise FX
        const nc = document.getElementById('noise-canvas');
        const nctx = nc.getContext('2d');
        const resize = () => { nc.width=window.innerWidth; nc.height=window.innerHeight; };
        window.onresize = resize; resize();
        setInterval(() => {
            const w=nc.width, h=nc.height;
            const idata = nctx.createImageData(w,h);
            const buf = new Uint32Array(idata.data.buffer);
            for(let i=0;i<buf.length;i++) buf[i] = ((Math.random()*0xFFFFFF)|0xFF000000)>>>0;
            nctx.putImageData(idata,0,0);
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', App.init);
