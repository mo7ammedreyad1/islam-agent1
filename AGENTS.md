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

### هوية الفيديو — قسمين منفصلين

**1. الإحساس والمحتوى** (نوع الفيديو، هل فيه تفسير ولا لأ، الطابع العام) موصوف في
ملفات `.md` جوه [`video-identities/`](./video-identities/)، كل ملف يوصف نوع فيديو
معيّن بالكلام.

**2. الشكل البصري والتقني** (الخطوط، الألوان، التخطيط، منطق الرسم على الـ canvas،
وطريقة جلب الأصول، والـ render hooks) **مش وصف بالكلام**، وموجود كـ **كود
`scene.html` كامل وشغّال فعليًا** جوه [`identities/`](./identities/). **المجلد ده
فيه — وهيفضل يتزود فيه مع الوقت — أكتر من ملف هوية بصرية مختلفة (استايلات متعددة)،
كل واحد بستايله الخاص.** مفيش هوية "افتراضية" أو "أساسية" بينهم — كل ملف فيه
مرجع حرفي مستقل بذاته.

- **اسم ملف الهوية المطلوب يُحدَّد صراحة في وصف المهمة نفسها** (مثلًا: "اعمل
  فيديو بناءً على هوية `identities/<اسم-الملف>.html`"). افتح الملف المذكور
  بالحرف قبل ما تكتب أي حرف في `scene.html` — **ميصحش تفترض أو "تتذكر" هوية
  استخدمتها قبل كده لو المهمة الحالية سمّت ملف تاني أو محددتش اسم**؛ في الحالة
  التانية دي ارجع للمستخدم واسأله أي ملف يستخدم.
- ملفات `video-identities/*.md` وصف بالكلام — التزم بروحه، مش نسخ حرفي.

**ملف الهوية اللي تفتحه هو نقطة انطلاق ومرجع، مش قالب جامد ممنوع لمسه بالكامل.**
فرّق بين حاجتين:

- **العقد التقني الإلزامي — مايتفاوضش فيه أبدًا، أيًا كانت الهوية**: محرك
  Mediabunny، الـ render hooks كاملة (`renderStatus`, `renderProgress`,
  `startVideoRender()`, حدث `video-render-complete`, دعم `?autorender=true`)،
  وطريقة جلب الأصول بـ `fetch()` من غير تحميل محلي. دول تفاصيل بنية تحتية، مش
  ستايل — موصوفين بالتفصيل في القسم 2، وأي مخالفة ليهم = فشل الرندر.
- **تفاصيل الهوية البصرية نفسها** (الألوان، الخطوط، تفاصيل التخطيط، الحركات،
  وجود تفسير من عدمه...): دي جزء من "الستايل"، ومسموح تعدّل فيها **بناءً على
  طلب صريح من المستخدم في المهمة** (مثلًا "بنفس هوية X بس بدون تفسير" أو "خلي
  الخلفية أغمق شوية"). الهدف إنك تكون مرن مع طلب المستخدم فوق أساس الهوية، مش
  إنك تنسخها 100% حرفيًا في كل تفصيلة صغيرة من غير أي وعي بالسياق، ومش إنك تغيّر
  فيها من عندك من غير ما المستخدم يطلب.
- **المحتوى الخاص بكل فيديو** (نص الآيات، التفسير لو موجود، اسم السورة، القارئ،
  رقم السورة في رابط الصوت، اسم ملف الإخراج) لازم يتغيّر دايمًا حسب المهمة —
  ده مش جزء من "الستايل" أصلًا.
- **كل ملف هوية متوقّع يحتوي على "منطقة تعديل" محدّدة بتعليق واضح جوّاه**
  (زي `SURAH_NUMBER`, `RECITER_ID`, `OUTPUT_FILENAME`, وبعدها مصفوفة الآيات).
  **دور على التعليق ده الأول قبل أي `grep` أو بحث يدوي** — كل اللي محتاجه تغيّره
  لفيديو جديد موجود جواه بس، ومفيش داعي تدوّر في باقي الملف.
- **تحقق إلزامي بعد أي `replace`/توليد لـ `scene.html`، قبل ما تكمّل للرندر:**
  اطبع القيم الفعلية للمتغيرات اللي غيّرتها (`SURAH_NUMBER` وغيره) **من الملف
  الناتج فعليًا** (`grep`/`cat` على `scene.html` نفسه، مش من الكود اللي كتبته)
  وقارنها بالسورة/المحتوى المطلوب. **لا تعتبر "الأمر اتنفذ من غير error" دليل
  كافي على نجاح الاستبدال** — دوال `replace()` في بايثون وJS بترجع النص زي ما
  هو من غير أي تنبيه لو النص المطلوب استبداله مكانش موجود أصلًا (تايبو بسيط في
  اسم المتغير كفيل إنه يفشل بصمت). لو القيمة القديمة لسه موجودة بعد الاستبدال،
  الفيديو ممكن يتصدّر بنجاح كامل بنص سورة وصوت سورة تانية، من غير أي خطأ ظاهر
  في اللوج.
- **لو بتستبدل مصفوفة الآيات (`SURAH_VERSES`) بمحتوى جديد**: حدّد نهايتها فعليًا
  بالبحث عن أول `];` بعد `const SURAH_VERSES = [` (مش بتخمين تعليق أو سطر معيّن
  بعدها كعلامة نهاية) — ده أدق طريقة تضمن استبدال المصفوفة كاملة من غير ما
  تسيب جزء قديم فاضل أو تاكل أول سطر من الكود اللي بعدها.
- **فحص إلزامي لصحة `scene.html` قبل تشغيل سكريبت الرندر الكامل** (مش بعده):
  افتح الصفحة headless لكام ثانية بس (من غير `?autorender=true`) والتقط أي
  `pageerror`، زي كده:
  ```js
  const { chromium } = require('playwright');
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  (async () => {
    const server = http.createServer((req, res) => {
      fs.readFile(path.join(process.cwd(), req.url.split('?')[0]), (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200); res.end(data);
      });
    });
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    let errorFound = null;
    page.on('pageerror', (err) => { errorFound = err.message; });
    await page.goto(`http://localhost:${port}/scene.html`);
    await page.waitForTimeout(3000);
    await browser.close();
    server.close();
    if (errorFound) { console.log('SYNTAX_ERROR:', errorFound); process.exit(1); }
    console.log('SCENE_OK');
  })();
  ```
  لو طبع `SYNTAX_ERROR`، **متكملش على سكريبت الرندر الكامل خالص** — رجع اصلح
  `scene.html` الأول. الهدف إنك تكتشف أخطاء الـ syntax في ثواني بدل ما تكتشفها
  بعد `TimeoutError` غامض بعد دقايق من انتظار الرندر الكامل.

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

### الأصول (صوت/صورة): fetch مباشر بالرابط جوه المتصفح — من غير تحميل محلي بـ curl
**ممنوع تحميل أي أصل (صوت أو صورة) بـ `curl` جوه `run_terminal` وحفظه في `assets/`
والإشارة له بمسار محلي — القاعدة دي بلا استثناء، حتى لو غرضك تجربة سريعة أو
"تأكد إن الرابط شغال" قبل ما تكتب الكود.** استخدم `curl -sI` (رأس الطلب بس، من
غير تحميل الملف كامل) لو عايز تتأكد إن رابط موجود، أو جرّب الـ `fetch()` نفسه
جوه المتصفح وقت التشغيل الفعلي. أي ملف صوت/صورة اتحمّل محليًا بـ `curl` في
مجلد المهمة يعتبر خطأ في سير العمل حتى لو الفيديو النهائي طلع صح، لأنه بيضيع
وقت وبيوّه لمصدر مش هو اللي فعليًا هيتقرأ وقت الرندر.

كل أصل يتجاب **مباشرة جوه كود `scene.html` نفسه وقت
التشغيل** بـ `fetch()` على الرابط الحقيقي، بالظبط زي الباترن الموجود في ملفات
`identities/*.html` (مثال: الصوت بيتجاب بـ `fetch(url)` → `arrayBuffer()` →
`decodeAudioData()`، من غير أي خطوة تحميل مسبقة على القرص).

- **الصوت**: دايمًا `fetch()` مباشر من `everyayah.com` (المسار في القسم 4) — نفس
  الباترن الموجود في هوية الـ `identities/*.html` المستخدمة.
- **الصورة/الخلفية**: مش كل الهويات محتاجة صورة خارجية — بعض الهويات بترسم
  الخلفية بالكامل بتدرجات الـ canvas من غير أي صورة خارجية أصلًا (راجع الهوية
  المستخدمة نفسها لتشوف طريقتها). لو الهوية اللي بتستخدمها فعلًا محتاجة صورة
  خارجية، اجلبها بـ
  `<img crossOrigin="anonymous">` أو `fetch()` من رابط مباشر بيدعم CORS — من غير
  أي API key سري. لو المصدر مش بيدعم CORS، ارجع لخلفية مرسومة بالكانفاس بدل ما
  تحاول تحمّلها.
- **قاعدة تجنّب "canvas tainted"**: لازم `scene.html` يتفتح دايمًا عن طريق سيرفر
  HTTP محلي (زي اللي في وصفة الرندر تحت)، **مش** بمسار `file://` مباشر. أي صورة
  بتترسم على الـ canvas، حتى لو من مصدر خارجي، لازم تتحمّل بـ
  `crossOrigin = 'anonymous'` وإلا خرق القاعدة دي بيدّي خطأ `VideoFrames can't be
  created from tainted sources`. الصوت مالوش المشكلة دي أصلاً لأنه مش بيترسم على
  الـ canvas. طبقة تعتيم (overlay) غامقة فوق أي خلفية حقيقية دايمًا إلزامية عشان
  النص يفضل واضح.

### عقد الـ render hooks الإلزامي — مطابق تمامًا لما هو موجود في ملفات `identities/*.html`
كل ملف `identities/*.html` (ومن ثم كل `scene.html` مبني عليه) لازم يحتوي فعليًا على
الـ hooks دي شغّالة، مش وصف نظري — انسخها زي ما هي من الهوية المستخدمة، ومنعًا باتًا
تغييرها أو الرجوع لأسماء متغيرات قديمة:

- `window.renderStatus`: يبدأ `'loading'`، يبقى `'ready'` لما كل الأصول تتجهز،
  `'rendering'` أثناء التصدير، وفي النهاية `'completed'` أو `'error'`.
- `window.renderProgress`: رقم من `0.0` إلى `1.0` بيتحدّث أثناء `'rendering'`.
- `window.startVideoRender()`: `async function` تبدأ التصدير فورًا وترجع `Promise`.
- دعم `?autorender=true` في رابط الصفحة: لو موجود، الصفحة تستدعي
  `window.startVideoRender()` لوحدها بعد التحميل من غير أي تفاعل يدوي (زرار).
- حدث `video-render-complete` يتطلق على الـ `window`
  (`window.dispatchEvent(new CustomEvent('video-render-complete', {...}))`) فور
  اكتمال التصدير بنجاح.
- عند النجاح، النتيجة تتخزن في `window.renderResult` (زي الهوية الأصلية) **بالإضافة**
  لمتغيرين لازمين عشان سكريبت الـ Playwright يقدر ياخد الفيديو فعليًا (الـ `Blob`
  object مينفعش يترجع مباشرة من `page.evaluate`):
```js
  const finalBuffer = output.target.buffer; // ArrayBuffer من Mediabunny (القسم اللي فوق)
  window.__renderFilename = "اسم-الملف.mp4";
  window.__renderBase64 = arrayBufferToBase64(finalBuffer); // دالة base64 قياسية
  window.renderStatus = 'completed';
  window.dispatchEvent(new CustomEvent('video-render-complete', { detail: { filename: window.__renderFilename } }));
```
- عند الفشل (جوه try/catch حوالين كل حاجة):
```js
  window.renderStatus = 'error';
  window.__renderError = err.message;
```

### دليل كتابة سكريبت الرندر — انسخه حرفيًا، محدّث وشغّال فعليًا
اكتبه بأمر `run_terminal` (heredoc) في ملف زي `render-runner.js`، وشغّله بعد كده
بأمر `run_terminal` تاني: `node render-runner.js`. **مهم**: workflow الـ CI بيثبّت
قناة `chrome` بس (مش `chromium` الافتراضي) — لازم تحدد `channel: 'chrome'` صراحة
في `launch()` وإلا الرندر هيفشل بـ "Executable doesn't exist".

> ⚠️ **`{ timeout: 8 * 60 * 1000 }` في `page.waitForFunction` تحت ده إلزامي، مش
> اختياري ومش قابل للحذف أو التقليل.** الـ default بتاع Playwright هو 30 ثانية
> بس، ورندر فيديو فعلي بياخد دقايق — لو كتبت `page.waitForFunction` من غير الـ
> `timeout` ده صراحة (أو بأي قيمة أقل)، السكريبت هيكراش بـ `TimeoutError` قبل
> ما الرندر يخلص أصلًا، حتى لو باقي الكود كله صح 100%. انسخ السكريبت اللي تحت
> **حرفيًا بالكامل** من غير ما تعيد كتابته من الصفر أو تختصر فيه.
>
> **لو اضطريت تعيد كتابة `render-runner.js` أكتر من مرة في نفس المهمة** (مثلًا
> عشان تصلح حاجة تانية فيه)، اعمل `grep -n "8 \* 60 \* 1000" render-runner.js`
> **قبل** ما تشغّله في كل مرة، مش بعد ما يفشل — عشان تتأكد إن النسخة اللي على
> القرص فعليًا فيها الـ timeout الصح، مش نسخة قديمة أو ناقصة اتكتبت بالغلط.

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

  // ?autorender=true بيخلي الصفحة تستدعي window.startVideoRender() لوحدها بعد التحميل
  await page.goto(`http://localhost:${port}/scene.html?autorender=true`);
  await page.waitForFunction(
    () => window.renderStatus === 'completed' || window.renderStatus === 'error',
    { timeout: 8 * 60 * 1000 }
  );

  const status = await page.evaluate(() => window.renderStatus);
  const result = { success: status === 'completed', console_logs: consoleLogs.slice(-50), failed_requests: failedRequests };

  if (status === 'completed') {
    const filename = await page.evaluate(() => window.__renderFilename);
    const base64 = await page.evaluate(() => window.__renderBase64);
    fs.writeFileSync(filename, Buffer.from(base64, 'base64'));
    result.filename = filename;
    result.size = fs.statSync(filename).size;
  } else {
    result.error = await page.evaluate(() => window.__renderError);
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

1. **جلب الصوت**: استخدم `fetch()` مباشر جوه `scene.html` (مش `curl` منفصل) على رابط
   `https://` من `everyayah.com` دايمًا (مش `http://`) — لينك `http://` أو ريدايركت
   غير متوقَّع ممكن يرجّع صفحة HTML صغيرة (حوالي 166 بايت) باسم `.mp3` بدل الصوت
   الحقيقي. **بعد أي `fetch()` للصوت، تحقق إن حجم الـ `ArrayBuffer` بالكيلوبايتات مش
   بايتات قليلة** (`console.log(arrayBuffer.byteLength)`) قبل ما تكمل — لو الحجم صغير
   غير طبيعي (أقل من ~5 كيلوبايت)، الملف على الأغلب صفحة خطأ مش صوت حقيقي، وهتلاقيه
   واضح كمان في `failed_requests` من سكريبت الرندر لو رجع كود HTTP خطأ.

2. **نص القرآن**: استخدم مباشرة من أول مرة:
   `https://api.alquran.cloud/v1/surah/{surah}/editions/quran-uthmani,ar.muyassar`
   (بيرجع الرسم العثماني + التفسير الميسر في نفس الطلب). لا داعي لتجربة editions تانية
   زي `quran-simple-clean` أولًا، ده مضيعة وقت وبيرجع بيانات ناقصة أحيانًا.
   **شكل الـ JSON الراجع بالظبط** (لتفادي `TypeError` بسبب افتراض شكل غلط):
   `response.data` هو **List فيه عنصرين** (مش Object فيه مفتاح `editions`) —
   `data[0]` هو edition الرسم العثماني و`data[1]` هو edition التفسير الميسر
   (بنفس ترتيب الطلب)، وكل واحد فيهم فيه `ayahs` (List). يعني الوصول الصح هو
   `data[0]['ayahs']` و`data[1]['ayahs']`، مش `data['editions'][i]['ayahs']`.

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

7. **`scene.html` لازم يتفتح دايمًا عن طريق سيرفر HTTP محلي، مش `file://`** — حتى لو
   كل الأصول بتتجاب بـ `fetch()` مباشر من روابط خارجية (مفيش تحميل محلي للأصول
   أصلًا). فتح الملف بـ `file://` بيكسر `fetch()`/`import` وبيخلي أي صورة على الـ
   canvas "tainted"، فيفشل الرندر بـ `VideoFrames can't be created from tainted
   sources`. سيرفر بسيط جدًا كفاية — راجع "دليل كتابة سكريبت الرندر" في القسم 2
   (نفس السيرفر البسيط بيفتح الصفحة، مفيش داعي لأي حاجة أعقد).

8. **قناة المتصفح لازم تكون `chrome` صراحة** في `chromium.launch({ channel: 'chrome' })`
   — لأن الـ workflow بيثبّت القناة دي بس (`npx playwright install --with-deps chrome`)،
   مش الـ Chromium الافتراضي.

9. **حزمة `@mediabunny/aac-encoder` لازم تكون معرّفة في الـ `importmap` من الأول**
   جوه ملف الهوية نفسه، مش تتضاف يدويًا وقت التشغيل. بيئة الـ CI (GitHub Actions
   runner) محتاجة الـ polyfill ده لأنها مالهاش دعم AAC مدمج، وعدم وجوده بيسبب
   أخطاء 404 متكررة في الكونسول. لو فتحت هوية مفيهاش السطر ده في الـ `importmap`،
   ضيفه بنفسك بنفس الصيغة الموجودة في القسم 2 قبل ما تكمل.

10. **قبل ما تعتبر المهمة خلصت، سمّع/راجع تطابق الصوت مع النص المكتوب** — لو غيّرت
    محتوى `SURAH_VERSES` لسورة جديدة، لازم تتأكد إن رقم السورة في رابط الصوت
    (`SURAH_NUMBER` في الهويات المحدّثة) اتغيّر معاه بنفس القيمة. الفيديو ممكن
    يتصدّر بنجاح كامل من غير أي خطأ في اللوج، ومع ذلك يكون فيه نص وتفسير سورة،
    وتلاوة صوتية سورة تانية خالص — الرندر مش هيكشفلك الغلطة دي لوحده.

11. **ممنوع تحميل أي صوت بـ `curl` حتى للتجربة/التأكد إن الرابط شغال** — استخدم
    `curl -sI` (رأس بس) أو جرّب داخل `fetch()` نفسه وقت التشغيل. تحميل ملف صوت
    كامل محليًا بـ `curl` بيضيع وقت من غير أي فايدة، لأن `scene.html` مش بيقرأ
    منه أصلًا.

12. **ممنوع منعًا باتًا "تعيد تسمية" ملف الفيديو الناتج بتغيير الامتداد**
    (مثلًا `cp video.webm video.mp4`). امتداد الملف اللي بيرجع في
    `window.__renderFilename` بيعكس الحاوية الحقيقية اللي نجح بيها الرندر
    (`attempt.container`) — لو طلع `.webm`، ده معناه إن الحاوية `mp4` فشلت
    ورجعت لحاوية احتياطية، **مش غلطة في التسمية**. ارفع الملف بامتداده الحقيقي
    زي ما هو، ولو الهدف MP4 تحديدًا، حل السبب اللي خلّى محاولة الـ MP4 تفشل
    (راجع اللوج/الكونسول لرسالة الخطأ) بدل ما تلف حواليها بإعادة تسمية الملف —
    ملف `.webm` بامتداد `.mp4` غالبًا هيفشل في أي مشغّل فيديو صارم.

13. **لو ظهر تحذير `Mediabunny was loaded twice` في الكونسول**، ده مش تحذير
    تجاهله — على الأغلب سبب مباشر لفشل محاولة التصدير الأساسية (MP4/AAC)
    ورجوعها لحاوية احتياطية (WebM). بيحصل عادةً لو حزمة تانية (زي
    `@mediabunny/aac-encoder`) بتجيب نسخة تانية من `mediabunny` جوّاها بدل ما
    تستخدم نفس النسخة المعرّفة في الـ `importmap`. لو شفت التحذير ده، تأكد إن
    رابط الحزمة في الـ `importmap` مثبّت على نفس نسخة `mediabunny` (باستخدام
    `?deps=mediabunny@<نفس-الرقم>` في رابط esm.sh) قبل ما تقبل نتيجة الرندر.

14. **لما تكتب أمر `node -e "..."` بعلامات تنصيص مزدوجة وجواه JS template
    literals فيها `${...}`**، الـ shell (bash) بيحاول يفسّر `${...}` دي كمتغيرات
    bash قبل ما توصل لـ node أصلًا، وبيدّي أخطاء زي `bad substitution`. استخدم
    علامات تنصيص مفردة `'...'` حوالين كود الـ JS كله (زي `node -e '...'`)، أو
    اكتب الكود في ملف `.js` منفصل بـ heredoc وشغّله بـ `node file.js` بدل
    `node -e`.

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
