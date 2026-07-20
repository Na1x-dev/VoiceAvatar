// --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
const baseStates = {
    mouthClosed: { nameKey: "mouthClosed", img: null },
    mouthOpen: { nameKey: "mouthOpen", img: null, threshold: 20 },
    blink: { nameKey: "blink", img: null }
};

let customStates = [];
let globalAvatarSize = 85;
let isFlipped = false, isSpeaking = false, isBlinkingNow = false, mouthToggle = false;
let audioStream = null, audioContext = null, animationId = null;
let currentLang = 'ru';

// --- ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ---
const $ = id => document.getElementById(id);
const baseContainer = $('base-cards');
const customContainer = $('custom-cards');
const avatarImg = $('avatar');
const volBar = $('vol-bar');
const sizeSlider = $('size-slider');
const sizeVal = $('size-val');
const flipBtn = $('flip-btn');
const startBtn = $('start-btn');
const modalOverlay = $('modal-overlay');
const modalInput = $('modal-input');

sizeSlider.max = 300;
const emptyThumb = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='64' height='64'><rect width='64' height='64' fill='%23121214'/></svg>";

// --- ЛОКАЛИЗАЦИЯ И РЕНДЕРИНГ ---
function updateInterfaceLanguage() {
    const t = window.i18n[currentLang];
    
    if ($('lang-btn')) $('lang-btn').innerText = `🌐 ${currentLang.toUpperCase()}`;
    if ($('app-title')) $('app-title').innerText = t.appTitle;
    if ($('scale-title')) $('scale-title').innerText = t.scaleTitle;
    if ($('flip-btn-text')) $('flip-btn-text').innerText = t.flipBtn;
    if ($('base-sprites-title')) $('base-sprites-title').innerText = t.baseSpritesTitle;
    if ($('custom-sprites-title')) $('custom-sprites-title').innerText = t.customSpritesTitle;
    if ($('add-card-btn-text')) $('add-card-btn-text').innerText = t.addBtn;
    
    if ($('modal-title')) $('modal-title').innerText = t.modalTitle;
    if ($('modal-desc')) $('modal-desc').innerText = t.modalDesc;
    if (modalInput) modalInput.placeholder = t.modalPlaceholder;
    if ($('modal-cancel')) $('modal-cancel').innerText = t.modalCancel;
    if ($('modal-confirm')) $('modal-confirm').innerText = t.modalConfirm;
    
    const micText = $('start-btn-text');
    if (micText) micText.innerText = audioStream ? t.micOff : t.micOn;

    renderBaseCards();
    renderCustomCards();
}

if ($('lang-btn')) {
    $('lang-btn').addEventListener('click', async () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        updateInterfaceLanguage();
        await saveToDB();
    });
}

function renderBaseCards() {
    if (!baseContainer) return;
    baseContainer.innerHTML = '';
    const t = window.i18n[currentLang];
    
    Object.keys(baseStates).forEach(key => {
        const state = baseStates[key];
        const card = document.createElement('div');
        card.className = 'sprite-card base-card';
        card.innerHTML = `
            <div class="thumb-container"><img class="thumb-img" id="thumb-base-${key}" src="${state.img || emptyThumb}"></div>
            <div class="card-content">
                <div class="card-header">${t[state.nameKey] || key}</div>
                <div class="card-body">
                    <div class="file-upload-wrapper">
                        <div class="file-upload-btn">${t.selectFile}</div>
                        <input type="file" accept="image/*" onchange="uploadBaseImage(event, '${key}')">
                    </div>
                    ${state.threshold !== undefined ? `
                    <div class="input-row">
                        <label>${t.thresholdLabel}</label>
                        <div class="volume-controls">
                            <div class="step-btn" onclick="stepBaseThreshold('${key}', -1)">-</div>
                            <input type="range" id="slider-base-${key}" min="1" max="255" value="${state.threshold}" oninput="updateBaseThreshold('${key}', this.value)">
                            <div class="step-btn" onclick="stepBaseThreshold('${key}', 1)">+</div>
                            <span class="vol-val" id="vol-base-val-${key}">${state.threshold}</span>
                        </div>
                    </div>` : ''}
                    ${state.img ? `<span class="status-text">${t.savedStatus}</span>` : ''}
                </div>
            </div>`;
        baseContainer.appendChild(card);
    });
}

function renderCustomCards() {
    if (!customContainer) return;
    customContainer.innerHTML = '';
    const t = window.i18n[currentLang];
    
    customStates.forEach((state, index) => {
        const card = document.createElement('div');
        card.className = 'sprite-card custom-card';
        card.innerHTML = `
            <div class="thumb-container"><img class="thumb-img" id="thumb-custom-${index}" src="${state.img || emptyThumb}"></div>
            <div class="card-content">
                <div class="card-header">
                    <span>${state.name}</span>
                    <button class="btn-delete" onclick="deleteCustomCard(${index})">${t.deleteBtn}</button>
                </div>
                <div class="card-body">
                    <div class="file-upload-wrapper">
                        <div class="file-upload-btn">${t.selectFile}</div>
                        <input type="file" accept="image/*" onchange="uploadCustomImage(event, ${index})">
                    </div>
                    <div class="input-row">
                        <label>${t.volumeLabel}</label>
                        <div class="volume-controls">
                            <div class="step-btn" onclick="stepCustomProp(${index}, -1)">-</div>
                            <input type="range" id="slider-custom-${index}" min="1" max="255" value="${state.threshold}" oninput="updateCustomProp(${index}, this.value)">
                            <div class="step-btn" onclick="stepCustomProp(${index}, 1)">+</div>
                            <span class="vol-val" id="vol-val-${index}">${state.threshold}</span>
                        </div>
                    </div>
                    ${state.img ? `<span class="status-text">${t.savedStatus}</span>` : ''}
                </div>
            </div>`;
        customContainer.appendChild(card);
    });
}

// --- INDEXEDDB ХРАНИЛИЩЕ ---
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PNGTuberStudioDB_Final", 1);
        request.onupgradeneeded = e => e.target.result.createObjectStore("settings");
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e.target.error);
    });
}

async function saveToDB() {
    try {
        const db = await openDB();
        const tx = db.transaction("settings", "readwrite");
        const store = tx.objectStore("settings");
        store.put(JSON.parse(JSON.stringify(baseStates)), "baseStates");
        store.put(JSON.parse(JSON.stringify(customStates)), "customStates");
        store.put(globalAvatarSize, "avatarSize");
        store.put(isFlipped, "isFlipped");
        store.put(currentLang, "currentLang");
    } catch (err) { console.error("Save error:", err); }
}

async function loadFromDB() {
    try {
        const db = await openDB();
        const tx = db.transaction("settings", "readonly");
        const store = tx.objectStore("settings");
        
        store.get("currentLang").onsuccess = e => {
            if (e.target.result) currentLang = e.target.result;
            updateInterfaceLanguage(); 
        };
        store.get("avatarSize").onsuccess = e => {
            if (e.target.result) {
                globalAvatarSize = e.target.result;
                sizeSlider.value = globalAvatarSize;
                sizeVal.innerText = globalAvatarSize + '%';
                applyAvatarTransform();
            }
        };
        store.get("isFlipped").onsuccess = e => {
            if (e.target.result !== undefined) {
                isFlipped = e.target.result;
                flipBtn.style.background = isFlipped ? "#323238" : "#29292e";
                flipBtn.style.borderColor = isFlipped ? "#987bff" : "#323238";
                applyAvatarTransform();
            }
        };
        store.get("baseStates").onsuccess = e => {
            if (e.target.result) {
                Object.keys(e.target.result).forEach(key => {
                    if (baseStates[key]) {
                        baseStates[key].img = e.target.result[key].img;
                        if (e.target.result[key].threshold !== undefined) baseStates[key].threshold = e.target.result[key].threshold;
                    }
                });
                renderBaseCards();
                if (baseStates.mouthClosed.img) avatarImg.src = baseStates.mouthClosed.img;
            }
        };
        store.get("customStates").onsuccess = e => {
            if (e.target.result) { customStates = e.target.result; renderCustomCards(); }
        };
    } catch (err) { console.error("Load error:", err); }
}

// --- ТРАНСФОРМАЦИИ И ФАЙЛЫ ---
function applyAvatarTransform() {
    const scale = globalAvatarSize / 100;
    avatarImg.style.transform = `scale(${isFlipped ? -scale : scale}, ${scale})`;
}

sizeSlider.addEventListener('input', async e => {
    globalAvatarSize = parseInt(e.target.value);
    sizeVal.innerText = globalAvatarSize + '%';
    applyAvatarTransform();
    await saveToDB();
});

flipBtn.addEventListener('click', async () => {
    isFlipped = !isFlipped;
    flipBtn.style.background = isFlipped ? "#323238" : "#29292e";
    flipBtn.style.borderColor = isFlipped ? "#987bff" : "#323238";
    applyAvatarTransform();
    await saveToDB();
});

window.uploadBaseImage = function (event, key) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
        baseStates[key].img = e.target.result;
        if ($(`thumb-base-${key}`)) $(`thumb-base-${key}`).src = e.target.result;
        if (key === 'mouthClosed') avatarImg.src = e.target.result;
        renderBaseCards();
        await saveToDB();
    };
    reader.readAsDataURL(file);
};

window.uploadCustomImage = function (event, index) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
        customStates[index].img = e.target.result;
        if ($(`thumb-custom-${index}`)) $(`thumb-custom-${index}`).src = e.target.result;
        renderCustomCards();
        await saveToDB();
    };
    reader.readAsDataURL(file);
};

// --- ТОНКАЯ НАСТРОЙКА И МОДАЛКА ---
window.updateBaseThreshold = async (key, val) => { 
    baseStates[key].threshold = parseInt(val); 
    if ($(`vol-base-val-${key}`)) $(`vol-base-val-${key}`).innerText = val; 
    await saveToDB(); 
};

window.updateCustomProp = async (index, val) => { 
    customStates[index].threshold = parseInt(val); 
    if ($(`vol-val-${index}`)) $(`vol-val-${index}`).innerText = val; 
    await saveToDB(); 
};

window.deleteCustomCard = async index => { 
    customStates.splice(index, 1); 
    renderCustomCards(); 
    await saveToDB(); 
};

window.stepBaseThreshold = async (key, dir) => { 
    const s = $(`slider-base-${key}`); 
    if (s && parseInt(s.value)+dir >= 1 && parseInt(s.value)+dir <= 255) { 
        s.value = parseInt(s.value)+dir; 
        window.updateBaseThreshold(key, s.value); 
    } 
};

window.stepCustomProp = async (idx, dir) => { 
    const s = $(`slider-custom-${idx}`); 
    if (s && parseInt(s.value)+dir >= 1 && parseInt(s.value)+dir <= 255) { 
        s.value = parseInt(s.value)+dir; 
        window.updateCustomProp(idx, s.value); 
    } 
};

if ($('add-card-btn')) $('add-card-btn').addEventListener('click', () => { modalInput.value = ''; $('modal-overlay').classList.add('active'); modalInput.focus(); });
if ($('modal-cancel')) $('modal-cancel').addEventListener('click', () => $('modal-overlay').classList.remove('active'));
if ($('modal-confirm')) {
    $('modal-confirm').addEventListener('click', async () => { 
        const n = modalInput.value.trim(); 
        if (!n) return; 
        customStates.push({ name: n, img: null, threshold: 60 }); 
        renderCustomCards(); 
        await saveToDB(); 
        $('modal-overlay').classList.remove('active'); 
    });
}
if (modalInput) modalInput.addEventListener('keydown', e => { if (e.key === 'Enter') $('modal-confirm').click(); });

// --- АУДИО И СТРИМИНГ ---
setInterval(() => { mouthToggle = isSpeaking ? !mouthToggle : false; }, 120);

function startBlinkLoop() {
    if (!audioStream) return;
    setTimeout(() => { 
        isBlinkingNow = true; 
        setTimeout(() => { isBlinkingNow = false; startBlinkLoop(); }, 150); 
    }, Math.random() * 3000 + 2000);
}

function stopMicrophone() {
    if (animationId) cancelAnimationFrame(animationId);
    if (audioStream) audioStream.getTracks().forEach(t => t.stop());
    if (audioContext) audioContext.close();
    audioStream = null; audioContext = null; isSpeaking = false; isBlinkingNow = false;
    if (volBar) volBar.style.width = '0%';
    if (startBtn) {
        startBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg><span id="start-btn-text">${window.i18n[currentLang].micOn}</span>`;
        startBtn.className = "btn btn-primary";
    }
    if (baseStates.mouthClosed.img) avatarImg.src = baseStates.mouthClosed.img;
}

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        if (audioStream) { stopMicrophone(); return; }
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(audioStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            startBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17L12 8.19V5c0-.55-.45-1-1-1s-1 .45-1 .19v.13l5.02 5.02c.09.26.16.53.16.83zm1.15 4.31l-1.24-1.24c-.53.44-1.14.78-1.81.97V19h-2v-3.8c-2.31-.34-4.14-2.17-4.48-4.48H5v-2h1.7c.04-.32.1-.63.18-.94L2.81 4.7l1.41-1.41 13.44 13.44-1.41 1.42z"/></svg><span id="start-btn-text">${window.i18n[currentLang].micOff}</span>`;
            startBtn.className = "btn active";
            startBlinkLoop();
            
            function updateFrame() {
                if (!audioStream) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = dataArray.reduce((a, b) => a + b, 0);
                let volume = Math.round(sum / dataArray.length);
                
                if (volBar) volBar.style.width = Math.min((volume / 255) * 100, 100) + '%';
                
                isSpeaking = volume > (baseStates.mouthOpen.threshold || 20);
                
                // Фильтрация кастомных эмоций (исправлен баг с пустым массивом)
                let activeCustomList = customStates.filter(s => volume >= s.threshold && s.img);
                activeCustomList.sort((a, b) => b.threshold - a.threshold);
                let activeCustom = activeCustomList.length > 0 ? activeCustomList[0] : null;
                
                let finalImgSrc = baseStates.mouthClosed.img;
                
                if (activeCustom) {
                    finalImgSrc = isBlinkingNow ? (baseStates.blink.img || activeCustom.img) : activeCustom.img;
                } else if (isBlinkingNow) {
                    finalImgSrc = baseStates.blink.img || baseStates.mouthClosed.img;
                } else if (isSpeaking) {
                    finalImgSrc = mouthToggle ? (baseStates.mouthOpen.img || baseStates.mouthClosed.img) : baseStates.mouthClosed.img;
                }
                
                if (finalImgSrc && avatarImg.src !== finalImgSrc) avatarImg.src = finalImgSrc;
                animationId = requestAnimationFrame(updateFrame);
            }
            updateFrame();
        } catch (err) { alert('Mic error: ' + err); stopMicrophone(); }
    });
}

window.addEventListener('beforeunload', stopMicrophone);
loadFromDB();
