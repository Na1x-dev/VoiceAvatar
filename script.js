const baseStates = {
    mouthClosed: { name: "Спокойное состояние (Рот закрыт)", img: null },
    mouthOpen:   { name: "В процессе речи (Рот открыт)", img: null, threshold: 20 },
    blink:       { name: "Анимация моргания", img: null }
};

let customStates = [];
let globalAvatarSize = 85; 
let isFlipped = false;     

let isSpeaking = false;       
let isBlinkingNow = false;    
let mouthToggle = false;      

let audioStream = null;
let audioContext = null;
let animationId = null;

const baseContainer = document.getElementById('base-cards');
const customContainer = document.getElementById('custom-cards');
const avatarImg = document.getElementById('avatar');
const volBar = document.getElementById('vol-bar');
const sizeSlider = document.getElementById('size-slider');
const sizeVal = document.getElementById('size-val');
const flipBtn = document.getElementById('flip-btn');
const startBtn = document.getElementById('start-btn');

const modalOverlay = document.getElementById('modal-overlay');
const modalInput = document.getElementById('modal-input');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

function applyAvatarTransform() {
    const scaleFactor = globalAvatarSize / 100;
    const scaleX = isFlipped ? -scaleFactor : scaleFactor;
    avatarImg.style.transform = `scale(${scaleX}, ${scaleFactor})`;
}

sizeSlider.addEventListener('input', async (e) => {
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

// --- НАДЕЖНЫЙ INDEXEDDB ДЛЯ ОБНОВЛЕННОЙ СТРУКТУРЫ ---
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PNGTuberStudioDB_Final", 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
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
    } catch (err) { console.error("Ошибка сохранения:", err); }
}

async function loadFromDB() {
    try {
        const db = await openDB();
        const tx = db.transaction("settings", "readonly");
        const store = tx.objectStore("settings");
        
        store.get("avatarSize").onsuccess = (e) => {
            if (e.target.result) {
                globalAvatarSize = e.target.result;
                sizeSlider.value = globalAvatarSize;
                sizeVal.innerText = globalAvatarSize + '%';
                applyAvatarTransform();
            }
        };

        store.get("isFlipped").onsuccess = (e) => {
            if (e.target.result !== undefined) {
                isFlipped = e.target.result;
                flipBtn.style.background = isFlipped ? "#323238" : "#29292e";
                flipBtn.style.borderColor = isFlipped ? "#987bff" : "#323238";
                applyAvatarTransform();
            }
        };

        store.get("baseStates").onsuccess = (e) => {
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
        
        store.get("customStates").onsuccess = (e) => {
            if (e.target.result) { customStates = e.target.result; renderCustomCards(); }
        };
    } catch (err) { console.error("Ошибка загрузки:", err); }
}

const emptyThumb = "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='64' height='64'><rect width='64' height='64' fill='%23121214'/></svg>";

function renderBaseCards() {
    baseContainer.innerHTML = '';
    Object.keys(baseStates).forEach(key => {
        const state = baseStates[key];
        const card = document.createElement('div');
        card.className = 'sprite-card base-card';
        card.innerHTML = `
            <div class="thumb-container"><img class="thumb-img" id="thumb-base-${key}" src="${state.img || emptyThumb}"></div>
            <div class="card-content">
                <div class="card-header">${state.name}</div>
                <div class="card-body">
                    <div class="file-upload-wrapper">
                        <div class="file-upload-btn">Выбрать файл</div>
                        <input type="file" accept="image/*" onchange="uploadBaseImage(event, '${key}')">
                    </div>
                    ${state.threshold !== undefined ? `
                        <div class="input-row">
                            <label>Порог активации:</label>
                            <div class="volume-controls">
                                <input type="range" min="1" max="255" value="${state.threshold}" oninput="updateBaseThreshold('${key}', this.value)">
                                <span class="vol-val" id="vol-base-val-${key}">${state.threshold}</span>
                            </div>
                        </div>
                    ` : ''}
                    ${state.img ? `<span class="status-text">✓ Сохранено</span>` : ''}
                </div>
            </div>
        `;
        baseContainer.appendChild(card);
    });
}



function renderCustomCards() {
    customContainer.innerHTML = '';
    customStates.forEach((state, index) => {
        const card = document.createElement('div');
        card.className = 'sprite-card custom-card';
        card.innerHTML = `
            <div class="thumb-container"><img class="thumb-img" id="thumb-custom-${index}" src="${state.img || emptyThumb}"></div>
            <div class="card-content">
                <div class="card-header">
                    <span>${state.name}</span>
                    <button class="btn-delete" onclick="deleteCustomCard(${index})">Удалить</button>
                </div>
                <div class="card-body">
                    <div class="file-upload-wrapper">
                        <div class="file-upload-btn">Выбрать файл</div>
                        <input type="file" accept="image/*" onchange="uploadCustomImage(event, ${index})">
                    </div>
                    <div class="input-row">
                        <label>Порог громкости:</label>
                        <div class="volume-controls">
                            <input type="range" min="1" max="255" value="${state.threshold}" oninput="updateCustomProp(${index}, this.value)">
                            <span class="vol-val" id="vol-val-${index}">${state.threshold}</span>
                        </div>
                    </div>
                    ${state.img ? `<span class="status-text">✓ Сохранено</span>` : ''}
                </div>
            </div>
        `;
        customContainer.appendChild(card);
    });
}

// --- УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ ---
document.getElementById('add-card-btn').addEventListener('click', () => {
    modalInput.value = '';
    modalOverlay.classList.add('active');
    modalInput.focus();
});

modalCancel.addEventListener('click', () => modalOverlay.classList.remove('active'));

modalConfirm.addEventListener('click', async () => {
    const name = modalInput.value.trim();
    if (!name) return;
    customStates.push({ name: name, img: null, threshold: 60 });
    renderCustomCards();
    await saveToDB();
    modalOverlay.classList.remove('active');
});

modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modalConfirm.click();
});

// --- ИСПРАВЛЕННЫЕ И НАДЕЖНЫЕ ФУНКЦИИ ЗАГРУЗКИ ---
window.uploadBaseImage = function(event, key) {
    const file = event.target.files[0]; // Исправлено: берем конкретно первый файл
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        baseStates[key].img = e.target.result;
        document.getElementById(`thumb-base-${key}`).src = e.target.result;
        if (key === 'mouthClosed') avatarImg.src = e.target.result;
        renderBaseCards();
        await saveToDB(); 
    };
    reader.readAsDataURL(file);
};

window.uploadCustomImage = function(event, index) {
    const file = event.target.files[0]; // Исправлено: берем конкретно первый файл
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        customStates[index].img = e.target.result;
        document.getElementById(`thumb-custom-${index}`).src = e.target.result;
        renderCustomCards();
        await saveToDB(); 
    };
    reader.readAsDataURL(file);
};

window.updateBaseThreshold = async function(key, value) {
    baseStates[key].threshold = parseInt(value);
    document.getElementById(`vol-base-val-${key}`).innerText = value;
    await saveToDB();
};

window.updateCustomProp = async function(index, value) {
    customStates[index].threshold = parseInt(value);
    document.getElementById(`vol-val-${index}`).innerText = value;
    await saveToDB(); 
};

window.deleteCustomCard = async function(index) {
    customStates.splice(index, 1);
    renderCustomCards();
    await saveToDB();
};

// Цикл быстрой смены рта при говорении
setInterval(() => {
    mouthToggle = isSpeaking ? !mouthToggle : false;
}, 120); 

function startBlinkLoop() {
    if (!audioStream) return;
    setTimeout(() => {
        isBlinkingNow = true;
        setTimeout(() => {
            isBlinkingNow = false;
            startBlinkLoop(); 
        }, 150); 
    }, Math.random() * 3000 + 2000);
}

function stopMicrophone() {
    if (animationId) cancelAnimationFrame(animationId);
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    isSpeaking = false;
    isBlinkingNow = false;
    volBar.style.width = '0%';
    startBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg><span>Включить микрофон</span>';
    startBtn.className = "btn btn-primary";
    if (baseStates.mouthClosed.img) avatarImg.src = baseStates.mouthClosed.img;
}

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
        startBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17L12 8.19V5c0-.55-.45-1-1-1s-1 .45-1 .19v.13l5.02 5.02c.09.26.16.53.16.83zm1.15 4.31l-1.24-1.24c-.53.44-1.14.78-1.81.97V19h-2v-3.8c-2.31-.34-4.14-2.17-4.48-4.48H5v-2h1.7c.04-.32.1-.63.18-.94L2.81 4.7l1.41-1.41 13.44 13.44-1.41 1.42z"/></svg><span>Выключить микрофон</span>';
        startBtn.className = "btn active";
        
        startBlinkLoop();

        function updateFrame() {
            if (!audioStream) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            let volume = Math.round(sum / dataArray.length);
            
            volBar.style.width = Math.min((volume / 150) * 100, 100) + '%';
            
            const currentThreshold = baseStates.mouthOpen.threshold || 20;
            isSpeaking = volume > currentThreshold;

            let activeCustomList = customStates.filter(s => volume >= s.threshold && s.img);
            activeCustomList.sort((a, b) => b.threshold - a.threshold);
            
            // Исправлено: берем конкретный ПЕРВЫЙ объект из отсортированного списка, а не весь массив
            let activeCustom = activeCustomList.length > 0 ? activeCustomList[0] : null;

            let finalImgSrc = null;

            if (activeCustom) {
                finalImgSrc = isBlinkingNow ? (baseStates.blink.img || activeCustom.img) : activeCustom.img;
            } else {
                if (isBlinkingNow) {
                    finalImgSrc = baseStates.blink.img || baseStates.mouthClosed.img;
                } else if (isSpeaking) {
                    finalImgSrc = mouthToggle ? (baseStates.mouthOpen.img || baseStates.mouthClosed.img) : baseStates.mouthClosed.img;
                } else {
                    finalImgSrc = baseStates.mouthClosed.img;
                }
            }

            if (finalImgSrc) avatarImg.src = finalImgSrc;
            animationId = requestAnimationFrame(updateFrame);
        }
        updateFrame();
    } catch (err) { alert('Ошибка микрофона: ' + err); stopMicrophone(); }
});

renderBaseCards();
renderCustomCards();
loadFromDB();
