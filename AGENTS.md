# هوية أوفق البصرية + العقد التقني الإلزامي لفيديوهات القرآن الكريم

هذا الملف هو كل اللي محتاجه الـ Agent قبل ما يبدأ أي مهمة. فيه الهوية البصرية،
وفيه أيضًا **العقد التقني الحرفي** اللي لازم يلتزم بيه كل ملف `scene.html` تكتبه،
عشان أداة الرندر (`node agent.js render`) تعرف تتعامل معاه صح.

---

## القسم 1: الهوية البصرية

### الخطوط (Web Fonts عبر Google Fonts — بدون أي تثبيت على السيرفر)
- خط الآيات: **Amiri** (افتراضي)، أو **IBM Plex Sans Arabic** لو المهمة طلبت طابع حديث/Shorts
- خط العناوين والهيدر: **Reem Kufi**
- طريقة التحميل: `<link>` مباشر في `<head>` لـ `fonts.googleapis.com`، ثم قبل الرندر:
  `await document.fonts.load("700 58px 'FontName'"); await document.fonts.ready;`

### نظام الألوان
- خلفية أساسية داكنة: `#0c0c0e` إلى `#0e0e11`
- طبقة تعتيم فوق الخلفية: تدرج من `rgba(10,12,28,0.45)` أعلى إلى `rgba(10,12,28,0.75)` أسفل
- لون ذهبي للتفاصيل: `#d4af37`
- نص الآية: أبيض `#ffffff` مع `shadowBlur`/`text-shadow` غامق للوضوح

### تخطيط المشهد
- إطار (frame) ذهبي رفيع بهامش من حواف الكانفاس
- هيدر أعلى الشاشة: اسم السورة + اسم القارئ
- نص الآية في المنتصف، متعدد الأسطر لو طويل (لف نص يدوي بـ `ctx.measureText`)
- لو الفيديو "بتفسير": بطاقة تفسير أسفل الشاشة، متزامنة مع توقيت الآية الفعلي
- شريط تقدم رفيع أسفل الشاشة

### الخلفية
- افتراضيًا: منظر طبيعي مرسوم بـ **SVG** جوه نفس ملف الـ HTML (تدرجات + عناصر بسيطة) —
  صفر اعتماد على أصل خارجي، صفر مشاكل حقوق ملكية
- ممنوع صور فوتوغرافية حقيقية من الإنترنت بدون ترخيص واضح

### الأبعاد
- أفقي عادي: 1920×1080 — Shorts (رأسي): 1080×1920 — حسب طلب المهمة صراحة

---

## القسم 2: العقد التقني الإلزامي — **مهم جدًا، مخالفته = فشل الرندر بالكامل**

### محرك الفيديو: Mediabunny — **وليس ffmpeg**
كل ملف `scene.html` تكتبه **لازم** يستخدم مكتبة **Mediabunny** (وليس ffmpeg، وليس أي مكتبة تانية).
انسخ الباترن ده **حرفيًا** — ده مأخوذ مباشرة من التوثيق الرسمي لـ Mediabunny (llms-full.txt)
ومُتحقَّق منه فعليًا، وممنوع تعديله أو "تحسينه" من عندك:

```html
<script type="importmap">
{ "imports": { "mediabunny": "https://esm.sh/mediabunny@1.50.8" } }
</script>
<script type="module">
import {
    Output, Mp4OutputFormat, BufferTarget,
    CanvasSource, AudioBufferSource, QUALITY_HIGH, canEncodeAudio
} from 'mediabunny';

// Chrome على Linux مفيهوش AAC encoder أصلي في WebCodecs (سبب تاريخي مرتبط برخصة AAC) —
// لازم polyfill رسمي من نفس فريق Mediabunny:
import { registerAacEncoder } from 'https://esm.sh/@mediabunny/aac-encoder?external=mediabunny';
if (!(await canEncodeAudio('aac'))) { registerAacEncoder(); }

const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
});

const videoSource = new CanvasSource(canvas, { codec: 'avc', bitrate: QUALITY_HIGH });
output.addVideoTrack(videoSource);

const audioSource = new AudioBufferSource({ codec: 'aac', bitrate: QUALITY_HIGH });
output.addAudioTrack(audioSource);

await output.start();
await audioSource.add(audioBuffer); // أو أكتر من مرة لأكتر من مقطع صوتي، بيتلزقوا ورا بعض تلقائيًا

for (let i = 0; i < totalFrames; i++) {
    // ارسم الفريم على الـ canvas هنا
    await videoSource.add(i / fps, 1 / fps);
}

await output.finalize();
const finalBuffer = output.target.buffer; // ArrayBuffer فيه ملف MP4 كامل
</script>
```

**ملاحظة حاسمة**: `'avc'` و `'aac'` هنا **نصوص عادية (strings)، مش قيم مستوردة من أي مكان**.
لا يوجد export اسمه `VideoCodec` أو `AudioCodec` وقت التشغيل (هو TypeScript type بس) —
**ممنوع تحاول تستورده أو "تكتشفه" بتجربة**، ده هيفشل دايمًا ومضيعة وقت.

### عقد النتيجة النهائية — إلزامي بالحرف
أداة الرندر (`node agent.js render <file>`) بتفتح ملفك في متصفح حقيقي وبتستنى قيمة
`window.__ofoqStatus`. لازم ملفك يضبط المتغيرات دي بالظبط:

- في البداية: `window.__ofoqStatus = 'pending';`
- عند النجاح:
```js
  window.__ofoqFilename = "اسم-الملف.mp4";
  window.__ofoqBase64 = arrayBufferToBase64(finalBuffer); // دالة تحويل base64 قياسية
  window.__ofoqStatus = 'done';
```
- عند الفشل (جوه try/catch حوالين كل حاجة):
```js
  window.__ofoqStatus = 'error';
  window.__ofoqError = err.message;
```

### تشغيل الرندر وقراءة النتيجة node agent.js render path/to/scene.html 
هيرجعلك JSON فيه دايمًا (نجح أو فشل): `success`, `console_logs` (آخر رسائل الكونسول
من المتصفح الحقيقي بما فيها أي pageerror)، و`failed_requests` (أي طلب شبكة فشل، زي 404،
بالرابط الكامل بتاعه). **استخدم البيانات دي مباشرة للتشخيص** — لو ملف صوت أو خط طلع 404
هتلاقيه صريح في `failed_requests`.

**قاعدة سرعة مهمة**: لو الرندر فشل، **صحّح نفس ملف `scene.html` مباشرة وأعد تشغيل الرندر** —
ممنوع تكتب ملفات اختبار منفصلة (زي `test_xxx.html`) لتجربة استيراد أو API، ده بيضيع وقت
وأدوار من غير داعي. كل المعلومات اللي محتاجها موجودة في `console_logs`/`failed_requests`
أو في القسم ده من `AGENTS.md` نفسه.

### ملفات العلامة (Marker Files) — إلزامية لتتبع التقدم
- بعد رفع فيديو وملف وصفه بنجاح على الـ Release، اكتب:
  `video_<رقم السورة>_done.json` يحتوي `{"surah": <رقم>, "release_video_url": "...", "release_md_url": "..."}`
- بعد انتهاء **كل** الفيديوهات المطلوبة في المهمة، اكتب:
  `TASK_COMPLETE.json` يحتوي `{"summary": "...", "videos": [...]}`

---

## القسم 3: قواعد صارمة — غير قابلة للتفاوض
1. **ممنوع منعًا باتًا** كتابة نص آية أو تفسير من "معرفتك" الداخلية. كل نص عربي في أي
   `scene.html` لازم مصدره نتيجة `curl` فعلية نُفّذت في نفس الجلسة على مصدر موثوق
   (مثل `api.alquran.cloud`).
2. كل توقيت (متى تظهر كل آية، متى تظهر بطاقة التفسير) يُحسب من **المدة الفعلية**
   للصوت بعد تحميله وفكّه (`AudioBuffer.duration`)، وليس تخمينًا.
3. الصوت دائمًا من `everyayah.com`: `data/{reciter}/{surah:3}{ayah:3}.mp3`
   (القارئ الافتراضي: `Alafasy_128kbps`).
4. أي ملف `.md` يجب أن يحتوي: اسم السورة، عدد الآيات، القارئ، المدة الكلية،
   هل فيه تفسير أم لا، ورابط الـ GitHub Release الفعلي بعد الرفع.
