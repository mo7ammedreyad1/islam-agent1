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
- **الافتراضي**: صورة خلفية حقيقية تُجلب من API خارجي (مثل Pixabay) — **يتم تحميلها عن طريق
  `curl` جوه `run_terminal` فقط**، مع مفتاح الـ API مقروء من `$PIXABAY_API_KEY` (متغير بيئة
  سري، موجود بالفعل، ممنوع طباعته أو كتابته جوه أي ملف). احفظها محليًا في `assets/background.jpg`
  (أو `.png` حسب نوع الملف الراجع)، وخلي `scene.html` يشير للمسار المحلي النسبي بس
  (`assets/background.jpg`) — **ممنوع منعًا باتًا كتابة مفتاح الـ API جوه `scene.html`
  نفسه أو جوه أي ملف تاني بيتكتب على القرص**، لأنه ممكن يترفع بالغلط على الـ Release.
  مثال أمر التحميل (استخدم رابط بحث مناسب لمحتوى المهمة، زي "desert night sky" أو
  "mountains sunrise"):
  curl -s "https://pixabay.com/api/?key=$PIXABAY_API_KEY&q=nature+landscape&image_type=photo&orientation=<horizontal أو vertical حسب الأبعاد>"
| node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(d.hits[0].largeImageURL)"
| xargs -I{} curl -sL -o assets/background.jpg {}

- **بديل احتياطي**: لو المفتاح غير متاح أو التحميل فشل، ارجع لخلفية SVG مرسومة جوه نفس
  ملف الـ HTML (تدرجات + عناصر بسيطة) — صفر اعتماد على أصل خارجي في الحالة دي.
- طبقة تعتيم (overlay) غامقة فوق أي خلفية حقيقية دايمًا إلزامية عشان النص يفضل واضح.

### الإحساس البصري العام (استايل، مش كود مُلزَم بحرفيته)
- خلفية قريبة جدًا من الأسود (`#050505` – `#0c0c0e`) كقاعدة تحت أي صورة/تدرج
- توهج ذهبي خفيف حوالين حواف الفيديو (شبيه بـ `box-shadow` ذهبي شفاف على الإطار)
- بطاقة التفسير (لو موجودة): إحساس "زجاجي" — لون غامق شبه شفاف، حواف دائرية 18-24px،
  ممكن تتحقق بتعبئة مستطيل شبه شفاف بحد ذهبي رفيع (canvas 2D بيدعم `ctx.filter = 'blur()'`
  لو حبيت تأثير ضبابي حقيقي على عنصر خلفها)
- نص الآية أبيض كبير في المنتصف، اسم السورة ذهبي أصغر أعلى الشاشة

### الأبعاد
- **Shorts (رأسي) 1080×1920**: الافتراضي المفضّل لمحتوى قصير موجّه لمنصات زي يوتيوب شورتس/ريلز/تيك توك
- أفقي عادي 1920×1080: لو المهمة طلبت صراحة فيديو "طويل" أو "أفقي" أو "يوتيوب عادي"
- اختر حسب صيغة طلب المهمة، وإلا استخدم Shorts كافتراضي الجديد

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

### تشغيل الرندر وقراءة النتيجة
node agent.js render path/to/scene.html
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

## القسم 3: دروس مستفادة من تشغيلات سابقة — تجنّب الأخطاء دي بالتحديد

الأخطاء دي حصلت فعليًا في تشغيلات حقيقية سابقة. اتجنبها من البداية، متعملش نفس التجربة والخطأ تاني:

1. **تحميل الصوت**: استخدم `curl -sL` (بحرف L إجباري) و`https://` دايمًا مع `everyayah.com` —
   مرة سابقة استُخدم `http://` بدون `-L`، فالسيرفر عمل 301 redirect وترتّب عليه تحميل
   صفحة HTML صغيرة (حوالي 166 بايت) باسم `.mp3` بدل الصوت الحقيقي. **بعد أي تحميل صوت،
   تأكد إن حجم الملف بالكيلوبايتات مش بايتات قليلة** (`ls -la assets/`) قبل ما تكمل — لو
   الحجم صغير غير طبيعي (أقل من ~5 كيلوبايت)، الملف على الأغلب صفحة خطأ مش صوت حقيقي.

2. **نص القرآن**: استخدم مباشرة من أول مرة:
   `https://api.alquran.cloud/v1/surah/{surah}/editions/quran-uthmani,ar.muyassar`
   (بيرجع الرسم العثماني + التفسير الميسر في نفس الطلب). لا داعي لتجربة editions تانية
   زي `quran-simple-clean` أولًا، ده مضيعة وقت وبيرجع بيانات ناقصة أحيانًا.

3. **متغيرات البيئة `$RELEASE_TAG` و`$GH_REPO`**: متاحين فعليًا الآن في أي أمر
   `run_terminal` (تم إصلاح باگ سابق كانوا فيه فاضيين). لو لأي سبب طلعوا فاضيين برضه،
   استخدم `gh repo view` و`gh release list --repo <name>` لمعرفة القيم الصحيحة يدويًا
   كخطة بديلة، بدل ما توقف.

4. **تحقق دايمًا من أي ملف نزّلته قبل ما تفترض إنه صح** — سواء صوت أو JSON أو صورة —
   بأمر بسيط زي `ls -la` أو `head -c 200 <file>`. عادة أرخص بكتير من اكتشاف المشكلة
   بعد خطوات كتير.

---

## القسم 4: قواعد صارمة — غير قابلة للتفاوض
1. **ممنوع منعًا باتًا** كتابة نص آية أو تفسير من "معرفتك" الداخلية. كل نص عربي في أي
   `scene.html` لازم مصدره نتيجة `curl` فعلية نُفّذت في نفس الجلسة على مصدر موثوق
   (مثل `api.alquran.cloud`).
2. كل توقيت (متى تظهر كل آية، متى تظهر بطاقة التفسير) يُحسب من **المدة الفعلية**
   للصوت بعد تحميله وفكّه (`AudioBuffer.duration`)، وليس تخمينًا.
3. الصوت دائمًا من `everyayah.com`: `data/{reciter}/{surah:3}{ayah:3}.mp3`
   (القارئ الافتراضي: `Alafasy_128kbps`).
4. أي ملف `.md` يجب أن يحتوي: اسم السورة، عدد الآيات، القارئ، المدة الكلية،
   هل فيه تفسير أم لا، ورابط الـ GitHub Release الفعلي بعد الرفع.
