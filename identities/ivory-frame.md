# هوية: `ivory-frame`

> اسم مقترح بس — غيّره لأي اسم تاني تحبه وسمّي الملف بيه (`identities/<اسمك>.md`).
> **النسخة دي فيها كود JS حرفي كامل** (مش وصف نثري بس) لكل نقطة تصميمية —
> انسخه زي ما هو في `scene.html`، حرفًا بحرف، بالإضافة للهيكل العام الموحّد في
> `AGENTS.md` القسم 2. النقط `(1)`, `(2)`, `(3)` تحت مطابقة لنفس الترقيم في
> الهيكل الموحّد.

## نظرة عامة
- **الإحساس العام**: هادئ، نظيف، تحريري (editorial)، إضاءة نهارية، عمق بصري من
  صورة خلفية حقيقية + تعتيم قوي، تباين عالي بين النص الأبيض والخلفية.
- **الاستخدام المناسب**: مقاطع قرآنية قصيرة (Shorts) **بدون تفسير**.
- **أبعاد الكانفاس**: **720 × 1280 بكسل بالظبط** (نسبة 9:16).

---

## (1) CONFIG + الخطوط + أدوات مساعدة — كود حرفي

```js
// أبعاد وإعدادات الهوية دي تحديدًا — width/height/fps بس (duration بتتحسب تلقائي
// من صوت الآيات الحقيقي جوه preloadEveryAyahQuranAudio في الهيكل الموحّد)
let CONFIG = { fps: 60, width: 720, height: 1280, duration: 0 };

const FONT_STACK = "'Amiri', 'Georgia', 'Times New Roman', serif";

// صورة الخلفية الثابتة لهذه الهوية (جزء من التصميم، مش محتوى متغيّر)
const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop';

let bgImage = null;

// تحميل صورة الخلفية + التأكد من تحميل الخطوط — بيتنادى تلقائيًا من الهيكل
// الموحّد (القسم 2) لو الاسم ده بالظبط: preloadDesignAssets
async function preloadDesignAssets() {
    try {
        bgImage = await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("فشل تحميل صورة الخلفية"));
            img.src = BG_IMAGE_URL;
        });
        logToConsole("تم تحميل صورة الخلفية بنجاح.");
    } catch (err) {
        logToConsole(err.message + " — هيتم الاعتماد على التدرج الافتراضي.", 'warn');
    }

    try {
        await document.fonts.load("700 48px 'Reem Kufi'");
        await document.fonts.load("500 26px 'Reem Kufi'");
        await document.fonts.load("700 60px 'Amiri'");
        logToConsole("اكتمل تحميل خطوط Amiri و Reem Kufi.");
    } catch (e) {
        logToConsole("تنبيه: تعذر التأكد من تحميل الخطوط بأمان.", 'warn');
    }
}

// دالة رسم صورة بطريقة "cover fit" مع دعم الزووم — أداة مساعدة لهذه الهوية
function drawMediaCover(el, dx, dy, dw, dh, radius = 0, zoom = 1) {
    const dims = { w: el.width || el.naturalWidth, h: el.height || el.naturalHeight };
    const scale = Math.max(dw / dims.w, dh / dims.h) * zoom;
    const sw = dw / scale, sh = dh / scale;
    const sx = (dims.w - sw) / 2, sy = (dims.h - sh) / 2;
    ctx.save();
    if (radius > 0) { ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, radius); ctx.clip(); }
    ctx.drawImage(el, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
}
```

## (2) `buildParsedScenes()` — كود حرفي
يستخدم `RAW_CUES` اللي الهيكل الموحّد بيملاها تلقائيًا (بتوقيت محسوب من مدة
الصوت الحقيقية لكل آية، مش أرقام يدوية):

```js
function buildParsedScenes() {
    parsedScenes = RAW_CUES.map(cue => {
        const fontSize = cue.text.length > 30 ? 52 : 60;
        const font = `700 ${fontSize}px ${FONT_STACK}`;
        const words = layoutArabicParagraph(cue.text, font, 580, 14, fontSize * 1.5, CONFIG.height / 2);
        return { ...cue, font, words };
    });
}
```

## (3) دوال الرسم + `drawSceneAtTime` — كود حرفي

```js
function drawTopHeader(time, surahDisplayName, reciterDisplayName) {
    const fadeInDuration = 1.5;
    const alpha = clamp01(time / fadeInDuration);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 48px 'Reem Kufi', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(surahDisplayName, CONFIG.width / 2, 120);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = `500 26px 'Reem Kufi', sans-serif`;
    ctx.fillText(reciterDisplayName, CONFIG.width / 2, 180);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CONFIG.width / 2 - 80, 220);
    ctx.lineTo(CONFIG.width / 2 + 80, 220);
    ctx.stroke();
    ctx.restore();
}

function drawSceneAtTime(time) {
    state.currentTime = time;

    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#E5E5E5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    if (bgImage) {
        const totalProgress = clamp01(time / CONFIG.duration);
        const zoom = 1.05 + (totalProgress * 0.08);
        drawMediaCover(bgImage, 0, 0, CONFIG.width, CONFIG.height, 0, zoom);
    }

    const overlayGrad = ctx.createRadialGradient(
        CONFIG.width / 2, CONFIG.height / 2, CONFIG.width / 4,
        CONFIG.width / 2, CONFIG.height / 2, CONFIG.height / 1.5
    );
    overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0.20)');
    overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    // ⚠️ surahDisplayName و reciterDisplayName لازم ياخدوا قيمتهم من محتوى
    // المهمة الفعلي (اسم السورة والقارئ)، مش نص ثابت — دول متغيّرات محتوى
    // زي ما هو موضّح في قسم "المحتوى المتغيّر" تحت
    drawTopHeader(time, SURAH_DISPLAY_NAME, RECITER_DISPLAY_NAME);

    if (parsedScenes.length === 0) return;
    const activeScene = parsedScenes.find(s => time >= s.start && time < s.end) || parsedScenes[parsedScenes.length - 1];

    const sceneDuration = activeScene.end - activeScene.start;
    const localTime = time - activeScene.start;
    const fadeInDuration = 0.6, fadeOutDuration = 0.5;
    let progressFactor = 1.0;
    if (localTime < fadeInDuration) progressFactor = localTime / fadeInDuration;
    else if (localTime > sceneDuration - fadeOutDuration) progressFactor = (sceneDuration - localTime) / fadeOutDuration;

    const b = Easing.easeOutCubic(clamp01(progressFactor));
    const alpha = b;
    const offsetY = (1.0 - b) * 20;
    const scale = 0.96 + (0.04 * b);

    ctx.save();
    ctx.globalAlpha = alpha;
    const centerX = CONFIG.width / 2, centerY = CONFIG.height / 2;
    ctx.translate(centerX, centerY - offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = activeScene.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    activeScene.words.forEach(word => ctx.fillText(word.text, word.x, word.y));
    ctx.restore();
}
```

---

## المحتوى المتغيّر لكل فيديو (مش جزء من "الستايل")
- `SURAH_DISPLAY_NAME` و`RECITER_DISPLAY_NAME`: ثابتين (const) بيتحددوا من
  المهمة، بيستخدمهم `drawSceneAtTime` زي ما هو موضّح فوق.
- نص كل آية (`SURAH_VERSES`)، رقم السورة، القارئ (`SURAH_NUMBER`, `RECITER_ID`)،
  اسم ملف الإخراج (`OUTPUT_FILENAME`) — زي أي هوية تانية، من المهمة نفسها.
- توقيت كل آية بيتحسب تلقائيًا من الصوت الحقيقي عن طريق الهيكل الموحّد —
  **مفيش أي أرقام توقيت ثابتة في الهوية دي خالص**.

---

## ⚠️ ملاحظة إلزامية: مفيش أي كود تصدير/رندر جوه المواصفة دي
كل حاجة خاصة بالتصدير (Mediabunny، الـ render hooks، طريقة جلب الصوت) بتتبع
"الهيكل العام الموحّد للتصدير" في `AGENTS.md` القسم 2 **حرفيًا وبس** — مش
النسخة اللي كانت في مصدر الإلهام الأصلي (زرار يدوي بس، بدون hooks، بدون
`aac-encoder` polyfill، وملف صوت واحد للسورة كاملة بتوقيتات يدوية بدل الجلب
لكل آية على حدة).
