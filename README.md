# Voice Avatar Studio 🎙️

A web-based PNGTuber studio for real-time voice-controlled avatar animation. Designed for streamers and content creators, featuring multi-language support and an OBS-ready chroma key green screen.

Веб-приложение (PNGTuber-студия) для управления визуальным аватаром голосом в реальном времени. Разработано для стримеров и авторов контента, оснащено переключателем языков и зоной хромакея для OBS.

🪐 **[Open Live Demo / Начать работу](https://na1x-dev.github.io/VoiceAvatar/)**

---

## 🌐 Language / Язык
* 🇺🇸 [English Version](#-english-version)
* 🇷🇺 [Русская Версия](#-русская-версия)
* 📬 [Contacts / Контакты](#-contacts--контакты)

---

## 🇺🇸 English Version

### ✨ Features
* **Voice Activation:** Real-time microphone audio processing via Web Audio API for instant mouth movement.
* **Smart Blinking:** Automatic eye-blink animation triggering at random intervals (2–5 seconds) to make the character feel alive.
* **Custom State Priority:** Create unlimited custom expressions (e.g., Cry, Laugh, Anger) with unique volume thresholds. Higher thresholds override base states.
* **Localization:** Built-in UI language switcher (EN/RU) to support creators worldwide.
* **Local Storage (IndexedDB):** All configurations (scale, flip, thresholds, selected language) and uploaded image assets are saved locally in the browser.
* **OBS-Ready Interface:** Dedicated right panel with pure chroma key green (`#00ff00`) for seamless transparency in OBS Studio.

### 🛠️ Tech Stack
* **HTML5:** Semantic layout, inline dynamic SVG icons.
* **CSS3:** Modern Material 3 dark-themed adaptive UI, custom styled range sliders, and `backdrop-filter` modal blurs.
* **Vanilla JavaScript:** Zero-dependency code modularized into `i18n.js` and `script.js`. Utilizes `AudioContext` and `AnalyserNode` for live frequency checking and a Promise-based IndexedDB wrapper.

### 🚀 Setup for OBS Studio
1. Add a new **Browser Source** in OBS.
2. Paste your GitHub Pages live deployment URL.
3. Right-click the source -> **Filters** -> Add **Chroma Key**.
4. Adjust the volume thresholds in the app to match your microphone sensitivity.

---

## 🇷🇺 Русская Версия

### ✨ Особенности
* **Голосовая активация:** Потоковый анализ звука с микрофона с помощью Web Audio API для мгновенной анимации речи.
* **Умное моргание:** Автоматическая анимация закрытия глаз, срабатывающая со случайным интервалом (раз в 2–5 секунд).
* **Приоритет кастомных эмоций:** Создание дополнительных спрайтов (Крик, Смех, Злость) с индивидуальными порогами громкости, которые автоматически перекрывают базовые состояния.
* **Локализация:** Встроенный переключатель языка интерфейса (RU/EN) для удобства авторов из разных стран.
* **Автономное хранилище (IndexedDB):** Все настройки (масштаб, зеркалирование, пороги, выбранный язык) и картинки сохраняются в браузере и не пропадают при перезагрузке.
* **OBS-Ready интерфейс:** Выделенная зона с чистым зеленым цветом (`#00ff00`) для идеального удаления фона в OBS Studio.

### 🛠️ Технологический стек
* **HTML5:** Семантическая разметка, встроенные динамические SVG-иконки.
* **CSS3:** Интерфейс в стиле Material 3 (темная тема), плавные анимации на `cubic-bezier`, кастомные слайдеры и размытие фона (`backdrop-filter`).
* **Vanilla JavaScript:** Чистый код, разделенный на модули `i18n.js` и `script.js` без внешних зависимостей. Использование `AudioContext` и `AnalyserNode` для обработки звука и асинхронное взаимодействие с IndexedDB.

### 🚀 Настройка в OBS Studio
1. Добавьте новый источник **Браузер (Browser)** в OBS.
2. Вставьте ссылку на ваш деплой в GitHub Pages.
3. Нажмите правой кнопкой по источнику -> **Фильтры** -> Добавьте **Хромакей (Chroma Key)**.
4. Настройте ползунки чувствительности в приложении под свой микрофон.

---

## 📬 Contacts / Контакты

Feel free to contact me for any questions, suggestions, or feature requests! / Свяжитесь со мной по любым вопросам, предложениям или идеям для новых функций!

* **Telegram:** [@bakery_product_driver](https://t.me/bakery_product_driver)
* **Email:** [na1x.1024@gmail.com](mailto:na1x.1024@gmail.com)

---

## 📝 License / Лицензия
MIT License. Free to use and modify for your streams and projects. / Свободно для использования и модификации на ваших стримах.
