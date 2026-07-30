# هوية الـ Agent + العقد التقني الإلزامي لفيديوهات القرآن الكريم

هذا الملف هو كل اللي محتاجه الـ Agent قبل ما يبدأ أي مهمة. فيه هوية الـ Agent
نفسه وطريقة تعامله العامة، وفيه أيضًا **العقد التقني الحرفي** اللي لازم يلتزم بيه
كل ملف `scene.html` تكتبه، وسكريبت الرندر اللي هتكتبه إنت بنفسك (Playwright) عشان
يشتغل من غير أخطاء من أول محاولة.

> ⚠️ **تنبيه حاسم**: `agent.js` **مفيهوش أي subcommand اسمه "render"**. الأداة
> الوحيدة المتاحة ليك هي `run_terminal` بس. **ممنوع منعًا باتًا تنفّذ "node agent.js"
> (بأي شكل، بأي args) كأمر terminal من جوه جلستك** — ده مش أداة رندر، ده نفس
> العقل اللي بيكلمك دلوقتي، وتشغيله هيبدأ جلسة Agent كاملة تانية من الصفر فوق
> نفس الريبو ونفس الـ Release، وهيضيع تقدمك الحالي بالكامل. الرندر سكريبت
> Node.js منفصل **إنت اللي بتكتبه** وتشغّله بـ `node اسم-السكريبت.js` — الوصفة
> الكاملة والمُختبَرة موجودة في "دليل كتابة سكريبت الرندر" بالأسفل، انسخها زي
> ما هي.

---

## القسم 1: هوية الـ Agent

الـ Agent مسؤول عن إنتاج فيديوهات قرآنية (تلاوة، وأحيانًا مع تفسير مبسّط) بشكل
كامل من الصفر: جلب النص والصوت من مصادر موثوقة، كتابة `scene.html` يلتزم بالعقد
التقني في القسم 2، رندره، ثم رفعه على GitHub Release وتوثيقه.

### هوية الفيديو (الشكل والروح البصرية) — منفصلة عن هذا الملف
هوية كل فيديو (الخطوط، الألوان، التخطيط، الإحساس العام) **مش موجودة هنا**، وموجودة
بدل كده في ملفات `.md` منفصلة جوه مجلد [`video-identities/`](./video-identities/)،
كل ملف يوصف روح فيديو معيّن.

- **اسم ملف الهوية المطلوب يُحدَّد صراحة في وصف المهمة نفسها.** لو المهمة قالتلك
  تستخدم هوية معيّنة (مثلًا `video-identities/quran-tafsir-shorts.md`)، افتحه واتبع
  الوصف اللي فيه بالحرف قبل ما تكتب أي `scene.html`.
- لو المهمة معدّتش أي اسم ملف هوية صراحة، متفترضش هوية من عندك — ارجع للمستخدم
  واسأله أي ملف من `video-identities/` يستخدم.
- ملفات الهوية دي وصف للشكل والإحساس (كلام، مش كود جاهز يُنسخ) — التزم بروحها في
  كتابتك للـ `scene.html`، مش بنسخها حرفيًا.

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

### الخلفية: تحميل حقيقي من Pixabay + احتياطي SVG
- **الافتراضي**: صورة خلفية حقيقية تُجلب من API خارجي (مثل Pixabay) — **يتم تحميلها عن طريق
  `curl` جوه `run_terminal` فقط**، مع مفتاح الـ API مقروء من `$PIXABAY_API_KEY` (متغير بيئة
  سري، موجود بالفعل، ممنوع طباعته أو كتابته جوه أي ملف). احفظها محليًا في `assets/background.jpg`
  (أو `.png` حسب نوع الملف الراجع)، وخلي `scene.html` يشير للمسار المحلي النسبي بس
  (`assets/background.jpg`) — **ممنوع منعًا باتًا كتابة مفتاح الـ API جوه `scene.html`
  نفسه أو جوه أي ملف تاني بيتكتب على القرص**، لأنه ممكن يترفع بالغلط على الـ Release.
  مثال أمر التحميل (استخدم رابط بحث مناسب لمحتوى المهمة):
  ```bash
  curl -s "https://pixabay.com/api/?key=$PIXABAY_API_KEY&q=nature+landscape&image_type=photo&orientation=<horizontal أو vertical حسب الأبعاد>" \
  | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log(d.hits[0].largeImageURL)" \
  | xargs -I{} curl -sL -o assets/background.jpg {}
  ```
- **بديل احتياطي**: لو المفتاح غير متاح أو التحميل فشل، ارجع لخلفية SVG مرسومة جوه نفس
  ملف الـ HTML (تدرجات + عناصر بسيطة). لو استخدمت SVG كصورة `<img>` (مش inline)، لازم
  تحطه كـ data URI مع `encodeURIComponent` كامل للمحتوى (مش استبدال يدوي لبعض الحروف بس)
  — أي `#` أو حرف خاص من غير encoding سليم بيكسر تحميل الصورة (`Failed to load SVG image`).
- **قاعدة تجنّب "canvas tainted"**: لازم `scene.html` يتفتح دايمًا عن طريق سيرفر HTTP محلي
  (زي اللي في وصفة الرندر تحت)، **مش** بمسار `file://` مباشر — وأي صورة بتترسم على الـ
  canvas لازم تكون من نفس الأصل (نفس السيرفر المحلي) أو من مصدر تم تحميله محليًا بالفعل
  عن طريق curl. خرق القاعدة دي بيدّي خطأ `VideoFrames can't be created from tainted sources`.
  طبقة تعتيم (overlay) غامقة فوق أي خلفية حقيقية دايمًا إلزامية عشان النص يفضل واضح.

### عقد النتيجة النهائية اللي سكريبت الرندر بتاعك لازم يلتزم بيه
لازم سكريبت الرندر (الملف اللي هتكتبه إنت، مش أداة جاهزة) يضبط المتغيرات دي جوه
صفحة `scene.html` نفسها بالظبط، عشان تقدر تراقبها من الـ Node script:

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

### دليل كتابة سكريبت الرندر — انسخه حرفيًا، محدّث وشغّال فعليًا
اكتبه بأمر `run_terminal` (heredoc) في ملف زي `render-runner.js`، وشغّله بعد كده
بأمر `run_terminal` تاني: `node render-runner.js`. **مهم**: workflow الـ CI بيثبّت
قناة `chrome` بس (مش `chromium` الافتراضي) — لازم تحدد `channel: 'chrome'` صراحة
في `launch()` وإلا الرندر هيفشل بـ "Executable doesn't exist".

```js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

async function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(process.cwd(), decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200);
        res.end(data);
      });
    });
    server.listen(0, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ channel: 'chrome' }); // مطابق للقناة المثبّتة في الـ workflow
  const page = await browser.newPage();

  const consoleLogs = [];
  const failedRequests = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`));
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.url()} — HTTP ${res.status()}`); });

  await page.goto(`http://localhost:${port}/scene.html`);
  await page.waitForFunction(() => window.__ofoqStatus === 'done' || window.__ofoqStatus === 'error', { timeout: 8 * 60 * 1000 });

  const status = await page.evaluate(() => window.__ofoqStatus);
  const result = { success: status === 'done', console_logs: consoleLogs.slice(-50), failed_requests: failedRequests };

  if (status === 'done') {
    const filename = await page.evaluate(() => window.__ofoqFilename);
    const base64 = await page.evaluate(() => window.__ofoqBase64);
    fs.writeFileSync(filename, Buffer.from(base64, 'base64'));
    result.filename = filename;
    result.size = fs.statSync(filename).size;
  } else {
    result.error = await page.evaluate(() => window.__ofoqError);
  }

  await browser.close();
  server.close();
  console.log(JSON.stringify(result)); // اقرأها من الـ output بتاع run_terminal مباشرة
  process.exit(result.success ? 0 : 1);
})();
```

**استخدم `console_logs`/`failed_requests` مباشرة للتشخيص** — لو ملف صوت أو خط طلع 404
هتلاقيه صريح في `failed_requests`.

**قاعدة سرعة مهمة**: لو الرندر فشل، **صحّح نفس ملف `scene.html` مباشرة وأعد تشغيل
`node render-runner.js`** — ممنوع تكتب ملفات اختبار منفصلة (زي `test_xxx.html`) لتجربة
استيراد أو API، وممنوع منعًا باتًا تنفّذ `node agent.js` بأي شكل (راجع التنبيه الحاسم
أول الملف). كل المعلومات اللي محتاجها موجودة في `console_logs`/`failed_requests` أو
في القسم ده من `AGENTS.md` نفسه.

### ملفات العلامة (Marker Files) — إلزامية لتتبع التقدم
- بعد ما ترفع فيديو وملف وصفه فعليًا على الـ Release (بأمر `gh release upload` حقيقي
  ناجح، مش افتراض)، اكتب: `video_<رقم السورة>_done.json` يحتوي
  `{"surah": <رقم>, "release_video_url": "...", "release_md_url": "..."}`.
  **`agent.js` بيتحقق فعليًا** إن اسمَي الملفين في الرابطين دول موجودين حقًا كـ assets
  على الـ Release عن طريق `gh release view` قبل ما يقبل ملف العلامة ده — لو مش موجودين
  هيرفضه برسالة توضح إيه الناقص، فتأكد إن الرفع حصل فعلًا الأول.
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

5. **ممنوع منعًا باتًا تنفيذ `node agent.js` كأمر terminal من جوه جلستك، بأي args**.
   حصل فعليًا مرة إن الـ Agent نفّذه ظنًا إنه أداة رندر جاهزة، فبدأ جلسة Agent كاملة
   تانية من الصفر فوق نفس الريبو، اختارت سورة عشوائية مختلفة، وملفات العلامة اللي
   كتبتها خدعت الجلسة الأصلية إنها هي اللي خلصت — والفيديو الأصلي المطلوب اتلغى
   بصمت. الرندر دايمًا سكريبت منفصل تكتبه إنت (`render-runner.js` مثلًا) وتشغّله بـ
   `node render-runner.js`.

6. **فحص النص العربي في `scene.html` بيقبل حالتين بس**: إما متتالية 10 حروف عربية
   متصلة بدون تاجات HTML بينها، أو إجمالي 40 حرف عربي على الأقل في كل الملف (بعد
   تجاهل التاجات). لو فشل الفحص، الرسالة بترجعلك بالظبط طول أطول متتالية وإجمالي
   العدد الحاليين — استخدمهم للتشخيص بدل التخمين العشوائي لسبب الفشل.

7. **الخلفية والصور لازم تتحمّل محليًا وتتفتح عن طريق سيرفر HTTP محلي، مش `file://`**
   — وإلا الـ canvas بيبقى "tainted" ويفشل الرندر بـ `VideoFrames can't be created
   from tainted sources`. راجع "دليل كتابة سكريبت الرندر" في القسم 2.

8. **قناة المتصفح لازم تكون `chrome` صراحة** في `chromium.launch({ channel: 'chrome' })`
   — لأن الـ workflow بيثبّت القناة دي بس (`npx playwright install --with-deps chrome`)،
   مش الـ Chromium الافتراضي.

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
