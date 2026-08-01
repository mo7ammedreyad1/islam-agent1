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
وطريقة جلب الأصول، والـ render hooks) موجود جوه [`identities/`](./identities/)
بواحدة من صيغتين:

- **`.html`** — كود حرفي جاهز وشغّال فعليًا (زي الطريقة التقليدية).
- **`.md`** — **مواصفة تصميم تفصيلية جدًا بالكلام**، بديل عن الكود الجاهز.
  التفاصيل الكاملة لإزاي تتعامل مع الصيغة دي موجودة في القسم "هوية بصيغة `.md`"
  تحت.

**المجلد ده فيه — وهيفضل يتزود فيه مع الوقت — أكتر من ملف هوية بصرية مختلفة
(استايلات متعددة)، كل واحد بستايله الخاص، بأي من الصيغتين.** مفيش هوية
"افتراضية" أو "أساسية" بينهم — كل ملف فيه مرجع مستقل بذاته.

- **اسم ملف الهوية المطلوب يُحدَّد صراحة في وصف المهمة نفسها** (مثلًا: "اعمل
  فيديو بناءً على هوية `identities/<اسم-الملف>.html`"). افتح الملف المذكور
  بالحرف قبل ما تكتب أي حرف في `scene.html` — **ميصحش تفترض أو "تتذكر" هوية
  استخدمتها قبل كده لو المهمة الحالية سمّت ملف تاني أو محددتش اسم**؛ في الحالة
  التانية دي ارجع للمستخدم واسأله أي ملف يستخدم.
- **لو اسم الملف المذكور في المهمة مش موجود فعليًا في `identities/`** (غلطة
  إملائية، اسم قديم، أو ملف لسه متعملش): **قف واسأل المستخدم يقصد إيه بالظبط**،
  حتى لو فيه ملف تاني قريب الاسم أو شكله شبهه. **ممنوع تختار بديل من عندك
  وتكمل بيه من غير ما ترجع تتأكد** — استخدام هوية مختلفة عن اللي المستخدم
  قصدها بالظبط، من غير ما يعرف، أخطر من إنك تستنى رد منه.
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
- **قبل ما تكتب أي حرف في `scene.html`**: حلل طلب المستخدم لبنود واضحة ومحددة
  (السورة، مع/من غير تفسير، أي تخصيص شكلي مطلوب صراحة...)، وبعدين راجع ملف
  الهوية المطلوب — **مش قراءة سريعة واحدة**، اقرأه أكتر من مرة لو محتاج (مرة
  عامة تفهم بيها البنية، ومرة تانية مركّزة على كل نقطة من بنود طلب المستخدم
  عشان تعرف بالظبط هي هتتغيّر فين وإزاي في الملف). الهدف إنك تبدأ الكتابة
  الفعلية وإنت عارف كل نقطة متأثرة بطلب المستخدم من الأول، مش تكتشفها بالتجربة
  والخطأ وإنت بتكتب.
- **المحتوى الخاص بكل فيديو** (نص الآيات، التفسير لو موجود، اسم السورة، القارئ،
  رقم السورة في رابط الصوت، اسم ملف الإخراج) لازم يتغيّر دايمًا حسب المهمة —
  ده مش جزء من "الستايل" أصلًا.
- **(للهويات بصيغة `.html`) كل ملف هوية متوقّع يحتوي على "منطقة تعديل" محدّدة بتعليق واضح جوّاه**
  (زي `SURAH_NUMBER`, `RECITER_ID`, `OUTPUT_FILENAME`, وبعدها مصفوفة الآيات).
  **دور على التعليق ده الأول قبل أي `grep` أو بحث يدوي** — كل اللي محتاجه تغيّره
  لفيديو جديد موجود جواه بس، ومفيش داعي تدوّر في باقي الملف.
- **قبل ما تبدأ، شوف كمان لو فيه قسم فرعي باسم الملف ده تحديدًا في "القسم 5:
  ملاحظات خاصة بكل ملف هوية" في آخر الملف ده.** لو موجود، فيه ملاحظات وأخطاء
  معروفة اتصلحت أو محتاجة انتباه خاص بالملف ده بالذات، مش عامة لكل الهويات.

### هوية بصيغة `.md` — مواصفة تصميم تفصيلية بدل كود جاهز

لو الهوية المطلوبة ملف `.md` (مش `.html`)، ده **مش وصف عام زي `video-identities/`**
— المفروض يكون **مواصفة تصميم بدقة عالية جدًا** (الهدف 95%+ من التطابق البصري بين
أي فيديوهين بنفس الهوية دي)، لدرجة إنك تقدر تكتب منها كود رسم الـ canvas من الصفر
في كل مرة وتوصل لنفس النتيجة تقريبًا في كل تشغيلة. **إزاي تتعامل معاها**:

- **⚠️ المواصفة لازم تحتوي على كود JS حرفي كامل** لكل النقط التصميمية اللي
  "الهيكل العام الموحّد للتصدير" في القسم 2 بيحتاجها من كود التصميم (علامات
  `(1)`, `(2)`, `(3)` هناك): ثوابت `CONFIG`/الخطوط/الألوان، `buildParsedScenes()`،
  كل دوال الرسم، و`drawSceneAtTime(time)`. **وصف نثري بس من غير كود حرفي مش
  كافي أبدًا** — لو المواصفة وصفت "خط أبيض بظل قوي في المنتصف" بالكلام بس من
  غير كود، اكتب أنت الكود المطابق **بدقة قصوى لكل رقم وقيمة مذكورة**، وبعد ما
  تكتبه لأول مرة لهوية معيّنة، **الأفضل تحفظه جوه ملف المواصفة نفسه** (تعدّل
  ملف الـ `.md` وتضيفله كتلة الكود اللي كتبتها) عشان أي فيديو جاي بنفس الهوية
  يستخدم نفس الكود بالحرف بدل ما يعاد كتابته من الصفر تاني ويختلف شوية.
- **كل قيمة محددة رقميًا أو بالاسم في المواصفة = متطلب صارم، مش اقتراح إبداعي.**
  لو المواصفة قالت لون بكود hex معيّن، أو اسم خط بعينه، أو حجم بالبكسل، أو نسبة
  مئوية لموضع عنصر، أو اسم دالة easing معيّنة، أو مدة حركة بالمللي ثانية — استخدمها
  زي ما هي بالحرف. **ممنوع "تفسّرها بحرية" أو "تحسّنها من عندك"** — الهدف ثبات
  الشكل بين الفيديوهات، مش إبداع جديد في كل مرة.
- **لو المواصفة فيها كود/pseudocode/صيغ رياضية حرفية** (مثلًا معادلة gradient،
  أو control points لمنحنى bezier، أو ترتيب استدعاءات canvas API معيّن)، انسخها
  واستخدمها زي ما هي، متعيدش اشتقاقها أو تبسيطها بطريقتك.
- **لو تفصيلة معيّنة غامضة أو ناقصة في المواصفة** (مش موصوفة بدقة كافية تخليك
  متأكد من النتيجة)، **قف واسأل المستخدم** بدل ما ترتجل حل من عندك — الارتجال
  هنا هو بالظبط سبب اختلاف الشكل بين فيديو وفيديو تاني بنفس الهوية المفروض
  تكون واحدة.
- **العقد التقني في القسم 2 (محرك Mediabunny، الـ render hooks، طريقة جلب
  الأصول) ثابت تمامًا ومش جزء من المواصفة خالص** — المواصفة بتوصف الرسم
  والتصميم بس، مش التصدير. اكتب كود التصدير/الرندر بنفس الطريقة المذكورة في
  القسم 2 حرفيًا، بغض النظر عن شكل الهوية.
- **المحتوى الخاص بالفيديو** (نص الآيات، التفسير، القارئ، رقم السورة...) بيتحدد
  من المهمة نفسها زي أي هوية تانية، مش من ملف المواصفة.

**منهجية كتابة مواصفة `.md` بدقة عالية** (لو المستخدم طلب مساعدة في كتابة واحدة
جديدة، أو لو بصدد بناء مشهد من مواصفة موجودة وعايز تتأكد إنها كاملة): مواصفة
كاملة تغطي عادةً الأقسام دي بدقة رقمية/اسمية، مش وصف عام:
1. **الألوان**: قيم hex/rgba دقيقة لكل عنصر، مع تدرجات (gradient stops بالنسبة
   المئوية واللون في كل نقطة).
2. **الخطوط**: اسم الخط بالظبط (ولينك Google Fonts لو خارجي)، الوزن، الحجم
   بالبكسل على دقة مرجعية (1080×1920)، تباعد الأسطر، اتجاه النص.
3. **التخطيط والتموضع**: إحداثيات أو نسب مئوية دقيقة لموضع كل عنصر بالنسبة
   لأبعاد الـ canvas، الهوامش الآمنة، ترتيب الطبقات (z-order).
4. **الخلفية والزخرفة**: تعريف الـ gradients بالكامل، أي نقوش/زخارف بتفاصيل
   كافية لترجمتها لاستدعاءات canvas API فعلية (مسارات، أشكال، تكرار).
5. **الحركة والتوقيت**: اسم دالة الـ easing، المدة بالمللي ثانية أو بعدد
   الفريمات، إيه اللي بيتحرك وإزاي بالظبط، وإمتى بيتحرك بالنسبة لتوقيت الصوت.
6. **عرض النص**: قواعد التفاف الأسطر، أقصى عرض، فروق الشكل بين بطاقة الآية
   وبطاقة التفسير لو مختلفين.
7. **عناصر متكررة تانية**: أي زخرفة ثابتة، حدود، تأثيرات جسيمات (particles)،
   بتفاصيلها الدقيقة.

- **تحقق إلزامي بعد أي `replace`/توليد لـ `scene.html`، قبل ما تكمّل للرندر:**
  اطبع القيم الفعلية للمتغيرات اللي غيّرتها (`SURAH_NUMBER` وغيره) **من الملف
  الناتج فعليًا** (`grep`/`cat` على `scene.html` نفسه، مش من الكود اللي كتبته)
  وقارنها بالسورة/المحتوى المطلوب. **لا تعتبر "الأمر اتنفذ من غير error" دليل
  كافي على نجاح الاستبدال** — دوال `replace()` في بايثون وJS بترجع النص زي ما
  هو من غير أي تنبيه لو النص المطلوب استبداله مكانش موجود أصلًا (تايبو بسيط في
  اسم المتغير كفيل إنه يفشل بصمت). لو القيمة القديمة لسه موجودة بعد الاستبدال،
  الفيديو ممكن يتصدّر بنجاح كامل بنص سورة وصوت سورة تانية، من غير أي خطأ ظاهر
  في اللوج.
- **(للهويات بصيغة `.html`) لو بتستبدل مصفوفة الآيات (`SURAH_VERSES`) بمحتوى جديد**: حدّد نهايتها فعليًا
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
كل ملف `scene.html` تكتبه **لازم** يستخدم مكتبة **Mediabunny** (وليس ffmpeg، وليس أي
مكتبة تانية). **الكود الكامل والحرفي المطلوب استخدامه موجود في "الهيكل العام الموحّد
للتصدير" تحت** — ده الكود الوحيد المسموح بيه لمحرك التصدير، مش مثال توضيحي تقريبي.
لو شفت أي نسخة تانية من كود Mediabunny في أي مكان (نسخة أقدم من الملف ده، أو مصدر
إلهام لتصميم هوية جديدة)، **تجاهلها والتزم بالهيكل الموحّد تحت بس** — فيه إصلاحات
حقيقية اتعملت فيه (زي مشكلة الصوت الغائب وتضارب استيراد الـ AAC polyfill) مش موجودة
في أي نسخة تانية.

**ملاحظة حاسمة**: `'avc'` و `'aac'` في الكود تحت **نصوص عادية (strings)، مش قيم
مستوردة من أي مكان**. لا يوجد export اسمه `VideoCodec` أو `AudioCodec` وقت التشغيل
(هو TypeScript type بس) — **ممنوع تحاول تستورده أو "تكتشفه" بتجربة**، ده هيفشل دايمًا
ومضيعة وقت.

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

### الهيكل العام الموحّد للتصدير — كود حرفي إلزامي، نفسه لأي هوية (`.html` أو `.md`)

ده **الكود الوحيد المسموح باستخدامه** لمحرك التصدير والـ render hooks، لأي هوية
كانت (سواء كود `.html` جاهز أو مواصفة `.md`). لازم يتكتب **حرفيًا زي ما هو**
جوه `scene.html`، من غير أي تعديل في الجزء ده. اللي بيتغيّر حسب الهوية هو **بس**
الأجزاء الموضّحة بالتعليقات `(1)`, `(2)`, `(3)` تحت — الباقي ثابت تمامًا.

**العناصر المطلوب توفيرها من كود التصميم (الهوية) قبل ما الكود ده يشتغل:**
`CONFIG` (لازم فيها `width`, `height`, `fps` — `duration` بتتحسب تلقائي)،
`SURAH_NUMBER`, `RECITER_ID`, `OUTPUT_FILENAME`, `SURAH_VERSES` (مصفوفة فيها
`text`, `surah`, `tafseer` لكل عنصر — **بالحرف بالأسماء دي**)، `buildParsedScenes()`،
و`drawSceneAtTime(time)`. لو أي واحد من دول ناقص، الكود تحت هيفشل.

**اختياري**: لو التصميم محتاج يحمّل أصول إضافية غير الصوت (زي صورة خلفية)، عرّف
دالة `async function preloadDesignAssets() { ... }` — الكود العام هيستدعيها
تلقائيًا (لو موجودة) قبل أي حاجة تانية، وهينتظرها تخلص قبل ما يكمل. من غيرها،
مفيش استدعاء إضافي بيحصل.

**عناصر الـ HTML المطلوب وجودها في الصفحة** (بغض النظر عن شكلها البصري):
`<canvas id="shortsCanvas">`، وعناصر اختيارية بالـ id: `status-text`, `spinner`,
`console-output`, `btn-replay`, `btn-render-start` (الكود دفاعي وبيشتغل حتى لو
مش موجودين، بس أفضل تحطهم للمعاينة).

```html
<script type="importmap">
{
    "imports": {
        "mediabunny": "https://esm.sh/mediabunny@1.50.8",
        "@mediabunny/aac-encoder": "https://esm.sh/@mediabunny/aac-encoder@1.50.8?deps=mediabunny@1.50.8"
    }
}
</script>
<script type="module">
import {
    Output, Mp4OutputFormat, WebMOutputFormat, BufferTarget,
    CanvasSource, AudioBufferSource, QUALITY_HIGH, canEncodeAudio
} from 'mediabunny';

        // ============================================================
        // (1) هنا كود التصميم: CONFIG (width, height, fps فقط — duration
        // بيتحسب تلقائي تحت)، أسماء الخطوط، الألوان، أي ثوابت تصميمية.
        // مثال: let CONFIG = { fps: 60, width: 1080, height: 1920, duration: 0 };
        // ============================================================

        const Easing = {
            easeOutCubic: t => 1 - Math.pow(1 - t, 3),
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        };

        window.renderStatus = 'loading';
        window.renderProgress = 0.0;
        window.renderResult = null;

        const canvas = document.getElementById('shortsCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const statusText = document.getElementById('status-text');
        const spinner = document.getElementById('spinner');

        let audioBuffer = null;
        let audioAudioEl = null;
        let parsedScenes = [];
        let RAW_CUES = [];
        let state = { currentTime: 0, isRendering: false, animationFrameId: null };

        function logToConsole(msg, type = 'info') {
            const output = document.getElementById('console-output');
            if (!output) { console.log(msg); return; }
            const line = document.createElement('div');
            line.className = `log-line log-${type}`;
            line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        function clamp01(val) { return Math.max(0, Math.min(1, val)); }

        function layoutArabicParagraph(text, font, maxWidth, wordGap, lineHeight, centerY) {
            ctx.font = font;
            const words = text.split(' ');
            const lines = [];
            let currentWords = [], currentWidth = 0;
            words.forEach(w => {
                const wordWidth = ctx.measureText(w).width;
                const testWidth = currentWidth + (currentWords.length > 0 ? wordGap : 0) + wordWidth;
                if (testWidth > maxWidth && currentWords.length > 0) {
                    lines.push({ words: currentWords, width: currentWidth });
                    currentWords = []; currentWidth = 0;
                }
                currentWords.push({ text: w, width: wordWidth });
                currentWidth += (currentWords.length > 1 ? wordGap : 0) + wordWidth;
            });
            if (currentWords.length) lines.push({ words: currentWords, width: currentWidth });
            const totalHeight = lines.length * lineHeight;
            const startY = centerY - totalHeight / 2 + lineHeight / 2;
            const flatWords = [];
            lines.forEach((line, li) => {
                const lineY = startY + li * lineHeight;
                let currentX = (CONFIG.width / 2) + (line.width / 2);
                line.words.forEach(w => {
                    const wx = currentX - w.width;
                    flatWords.push({ text: w.text, x: wx + w.width / 2, y: lineY });
                    currentX -= (w.width + wordGap);
                });
            });
            return flatWords;
        }

        // ============================================================
        // (2) هنا كود التصميم: buildParsedScenes() — لازم يبني parsedScenes
        // من RAW_CUES (اللي المحرك تحت بيملاها تلقائيًا)، مستخدمة
        // layoutArabicParagraph بالمعاملات الخاصة بالتصميم ده.
        // مثال:
        // function buildParsedScenes() {
        //     parsedScenes = RAW_CUES.map(cue => {
        //         const words = layoutArabicParagraph(cue.text, "700 60px Amiri", 580, 14, 90, 640);
        //         return { ...cue, words };
        //     });
        // }
        // ============================================================

        function audioBufferToWavBlob(buffer) {
            const numChannels = buffer.numberOfChannels;
            const sampleRate = buffer.sampleRate;
            const bytesPerSample = 2, blockAlign = numChannels * bytesPerSample;
            const dataLength = buffer.length * blockAlign;
            const arrayBuffer = new ArrayBuffer(44 + dataLength);
            const view = new DataView(arrayBuffer);
            const writeString = (offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
            writeString(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true); writeString(8, 'WAVE');
            writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
            view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataLength, true);
            let offset = 44;
            for (let i = 0; i < buffer.length; i++) {
                for (let ch = 0; ch < numChannels; ch++) {
                    const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
                    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                    offset += 2;
                }
            }
            return new Blob([arrayBuffer], { type: 'audio/wav' });
        }

        async function preloadEveryAyahQuranAudio() {
            logToConsole("جاري تحميل صوت الآيات آية بآية من EveryAyah.com...");
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ayahBuffers = [];
            let totalSamples = 0;
            for (let i = 1; i <= SURAH_VERSES.length; i++) {
                const ayahNum = String(i).padStart(3, '0');
                const url = `https://www.everyayah.com/data/${RECITER_ID}/${SURAH_NUMBER}${ayahNum}.mp3`;
                try {
                    const res = await fetch(url);
                    const arrayBuf = await res.arrayBuffer();
                    const decodedBuf = await audioCtx.decodeAudioData(arrayBuf);
                    ayahBuffers.push(decodedBuf);
                    totalSamples += decodedBuf.length;
                    logToConsole(`تم تحميل الآية ${i} بنجاح ✓`);
                } catch (err) {
                    logToConsole(`تنبيه تحميل الآية ${i}: ${err.message}`, 'warn');
                }
            }
            if (ayahBuffers.length === 0) throw new Error("تعذر جلب ملفات الصوت من EveryAyah");
            const sampleRate = ayahBuffers[0].sampleRate;
            const channelsCount = ayahBuffers[0].numberOfChannels;
            audioBuffer = audioCtx.createBuffer(channelsCount, totalSamples, sampleRate);
            let sampleOffset = 0, timeOffset = 0.0;
            RAW_CUES = [];
            for (let i = 0; i < ayahBuffers.length; i++) {
                const buf = ayahBuffers[i];
                for (let ch = 0; ch < channelsCount; ch++) {
                    audioBuffer.getChannelData(ch).set(buf.getChannelData(ch), sampleOffset);
                }
                const duration = buf.duration;
                RAW_CUES.push({
                    id: i + 1, start: timeOffset, end: timeOffset + duration,
                    text: SURAH_VERSES[i].text, surah: SURAH_VERSES[i].surah, tafseer: SURAH_VERSES[i].tafseer
                });
                sampleOffset += buf.length;
                timeOffset += duration;
            }
            CONFIG.duration = audioBuffer.duration;
            const wavBlob = audioBufferToWavBlob(audioBuffer);
            audioAudioEl = new Audio(URL.createObjectURL(wavBlob));
            logToConsole(`تم دمج تلاوة الآيات بنجاح! مدة الفيديو: ${CONFIG.duration.toFixed(2)} ثانية ✓`);
        }

        // ============================================================
        // (3) هنا كود التصميم: كل دوال الرسم (drawGlobalBackground،
        // drawSurahHeader، أو أي أسماء تانية تخص التصميم ده)، وفي الآخر
        // دالة الراوتر الإلزامية بالاسم ده بالظبط:
        // function drawSceneAtTime(time) {
        //     state.currentTime = time;
        //     drawGlobalBackground();
        //     if (parsedScenes.length === 0) return;
        //     const scene = parsedScenes.find(s => time >= s.start && time <= s.end) || parsedScenes[parsedScenes.length - 1];
        //     const progress = clamp01((time - scene.start) / (scene.end - scene.start));
        //     drawSurahHeader(scene.surah);
        //     drawQuranVerseScene(scene, progress); // أو أي دوال تصميم تانية
        // }
        // ============================================================

        function startPreviewLoop() {
            if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
            if (audioAudioEl) {
                audioAudioEl.currentTime = 0;
                audioAudioEl.play().catch(e => logToConsole("تنبيه الصوت: " + e.message, 'warn'));
            }
            function loop() {
                if (state.isRendering) return;
                const currTime = audioAudioEl ? audioAudioEl.currentTime : state.currentTime;
                drawSceneAtTime(currTime);
                if (currTime < CONFIG.duration) {
                    state.animationFrameId = requestAnimationFrame(loop);
                } else {
                    if (statusText) statusText.textContent = "جاهز للعرض والتصدير ✓";
                    if (spinner) spinner.style.display = 'none';
                }
            }
            state.animationFrameId = requestAnimationFrame(loop);
        }

        async function ensureAacEncoderAvailable() {
            if (!(await canEncodeAudio('aac'))) {
                logToConsole("تسجيل AAC Polyfill للأنظمة غير المدعومة أصليًا (زي GitHub Actions runner)...");
                const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
                registerAacEncoder();
            }
        }

        function getAudioConfigForContainer(container) {
            if (container === 'webm') return { codec: 'opus', bitrate: 128_000 };
            return { codec: 'aac', bitrate: QUALITY_HIGH };
        }

        async function attemptRealExport(attempt, totalFrames, fps) {
            const format = attempt.container === 'webm' ? new WebMOutputFormat() : new Mp4OutputFormat();
            const output = new Output({ format, target: new BufferTarget() });
            const videoSource = new CanvasSource(canvas, attempt);
            const audioSource = new AudioBufferSource(getAudioConfigForContainer(attempt.container));
            output.addVideoTrack(videoSource, { frameRate: fps });
            output.addAudioTrack(audioSource);
            await output.start();
            if (audioBuffer) await audioSource.add(audioBuffer);
            audioSource.close();
            const frameDuration = 1 / fps;
            for (let i = 0; i < totalFrames; i++) {
                const timestamp = i / fps;
                window.renderProgress = timestamp / CONFIG.duration;
                drawSceneAtTime(timestamp);
                await videoSource.add(timestamp, frameDuration);
            }
            videoSource.close();
            await output.finalize();
            return output.target.buffer;
        }

        function arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }
            return btoa(binary);
        }

        async function exportWithFallback() {
            state.isRendering = true;
            window.renderStatus = 'rendering';
            if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
            if (audioAudioEl) audioAudioEl.pause();
            if (spinner) spinner.style.display = 'inline-block';
            if (statusText) statusText.textContent = "جاري تصدير الفيديو فريم فريم...";
            logToConsole("بدء عملية التصدير...");

            await ensureAacEncoderAvailable();

            const videoAttempts = [
                { codec: 'avc', bitrate: QUALITY_HIGH, container: 'mp4' },
                { codec: 'avc', bitrate: 3_500_000, container: 'mp4' },
                { codec: 'avc', fullCodecString: 'avc1.42001f', bitrate: 3_000_000, container: 'mp4' },
                { codec: 'vp9', bitrate: 4_000_000, container: 'webm' },
                { codec: 'vp8', bitrate: 3_000_000, container: 'webm' }
            ];
            const totalFrames = Math.ceil(CONFIG.duration * CONFIG.fps);

            for (const attempt of videoAttempts) {
                try {
                    logToConsole(`تجربة التصدير بـ ${attempt.codec} داخل حاوية ${attempt.container}...`);
                    const buffer = await attemptRealExport(attempt, totalFrames, CONFIG.fps);
                    logToConsole(`تم التصدير بنجاح! نوع الحاوية: ${attempt.container}`);
                    const mimeType = attempt.container === 'webm' ? 'video/webm' : 'video/mp4';
                    const blob = new Blob([buffer], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    window.renderResult = { blob, url, container: attempt.container };
                    window.__renderFilename = `${OUTPUT_FILENAME}.${attempt.container}`;
                    window.__renderBase64 = arrayBufferToBase64(buffer);
                    window.renderStatus = 'completed';
                    window.renderProgress = 1.0;
                    window.dispatchEvent(new CustomEvent('video-render-complete', { detail: window.renderResult }));
                    if (statusText) statusText.textContent = "تم التصدير بنجاح ✓";
                    if (spinner) spinner.style.display = 'none';
                    state.isRendering = false;
                    return window.renderResult;
                } catch (err) {
                    logToConsole(`محاولة ${attempt.codec} لم تكتمل: ${err.message}`, 'warn');
                }
            }
            if (statusText) statusText.textContent = "فشل التصدير! راجع سجل الأخطاء.";
            if (spinner) spinner.style.display = 'none';
            state.isRendering = false;
            window.__renderError = "فشلت جميع محاولات التصدير";
            window.renderStatus = 'error';
            throw new Error("فشلت جميع محاولات التصدير");
        }

        window.startVideoRender = exportWithFallback;

        document.getElementById('btn-replay')?.addEventListener('click', () => {
            if (statusText) statusText.textContent = "جاري عرض المعاينة...";
            if (spinner) spinner.style.display = 'inline-block';
            startPreviewLoop();
        });
        document.getElementById('btn-render-start')?.addEventListener('click', () => { exportWithFallback(); });

        async function init() {
            try {
                if (typeof preloadDesignAssets === 'function') { await preloadDesignAssets(); }
                await preloadEveryAyahQuranAudio();
                buildParsedScenes();
                if (statusText) statusText.textContent = "جاهز للعرض والتصدير ✓";
                if (spinner) spinner.style.display = 'none';
                window.renderStatus = 'ready';
                drawSceneAtTime(0);
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('autorender') === 'true' || urlParams.get('autoexport') === 'true') {
                    logToConsole("🤖 [AI Agent Mode]: تصدير تلقائي...", 'info');
                    setTimeout(() => { exportWithFallback(); }, 600);
                }
            } catch (err) {
                logToConsole("خطأ أثناء التهيئة: " + err.message, 'error');
                if (statusText) statusText.textContent = "حدث خطأ أثناء التحميل";
                window.__renderError = err.message;
                window.renderStatus = 'error';
            }
        }

        window.addEventListener('load', init);
</script>
```

**أهم إصلاح جوه الكود ده (وده بالظبط سبب مشاكل حصلت فعليًا قبل كده)**: رابط
`@mediabunny/aac-encoder` في الـ `importmap` لازم يكون فيه `?deps=mediabunny@1.50.8`
(نفس رقم نسخة `mediabunny` المستخدمة) — من غيرها بتحصل `Mediabunny was loaded
twice`، ومحاولة التصدير بصوت AAC بتفشل بصمت، وممكن الفيديو يطلع **من غير صوت
خالص** من غير أي رسالة خطأ واضحة في اللوج. ده **مش تفصيلة اختيارية**.

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
> عشان تصلح حاجة تانية فيه)، اعمل `grep -n "waitForFunction" render-runner.js`
> **قبل** ما تشغّله في كل مرة (مش بعد ما يفشل) وشوف **كل الأسطر اللي طلعت**،
> مش سطر واحد بس. لو فيه أكتر من `page.waitForFunction()` في نفس الملف، لازم
> **كل واحدة منهم** تحمل `{ timeout: 8 * 60 * 1000 }` صراحة — التأكد من وجود
> النص `8 * 60 * 1000` مرة واحدة في الملف مش كافي، ممكن يكون في نداء تاني
> لـ `waitForFunction` من غير أي `timeout` وبيقع على الـ 30 ثانية الافتراضية
> ويكراش قبل ما يوصل للنداء الصح خالص.

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

### مبادئ عامة لحل المشاكل بنفسك — قبل ما تدوّر على حل جاهز
القائمة اللي تحت مش المفروض تكون المصدر الوحيد لحل المشاكل — هي أمثلة تاريخية
بس. هتقابل أخطاء جديدة مش موجودة هنا، خصوصًا مع هويات جديدة بمنطق مختلف تمامًا.
لما يحصل ده، اتبع المبادئ دي بدل ما تفترض إن غياب الخطأ من القائمة يعني إنه
"مش متوقع" أو تلف حواليه:

- **لما أمر يفشل، اقرأ رسالة الخطأ ورقم السطر بالظبط** قبل ما تفترض إنك فاهم
  السبب. `TimeoutError` على `render-runner.js:36` ورقم السطر ده فيه نداء
  `waitForFunction` مختلف عن السطر اللي انت متأكد إنه مظبوط — يبقى فيه نداء
  تاني، مش نفس المشكلة القديمة اللي حليتها قبل كده.
- **لو رسالة الخطأ بتسمّي method أو property بالاسم** (زي
  `Cannot read properties of undefined (reading 'split')`)، **أول خطوة تشخيص
  فورية** هي `grep -n "\.split(" scene.html` (أو أي اسم الـ method/property
  المذكور في الرسالة) — مش اختبار حاجات تانية مالهاش علاقة مباشرة زي الشبكة أو
  صلاحية روابط خارجية. الاسم في رسالة الخطأ بيوديك لمكان الكراش في ثواني؛
  تجاهله والدوران حواليه بالتخمين ممكن ياخد عشرات الـ turns من غير داعي.
- **لما تتحقق إن إصلاح معيّن اتطبّق، تأكد إنه اتطبّق في كل الحالات المشابهة**
  في نفس الملف، مش حالة واحدة بس. `grep` بيرجع "لقيت النص ده" — ده مختلف عن
  "كل مكان المفروض يكون فيه النص ده، فيه فعلًا".
- **لو بتلاقي نفسك بتعمل نفس التجربة والخطأ (trial-and-error) أكتر من مرتين
  على نفس المشكلة**، وقف وقارن بنسخة معروفة إنها شغالة (زي الملف الأصلي قبل أي
  تعديل) بدل ما تكمل تخمين. المقارنة المباشرة أسرع من التخمين المتكرر.
- **فضّل إعادة كتابة الملف كامل بطريقة نضيفة عن "ترقيع" نسخة انت مش متأكد من
  حالتها بالظبط** — خصوصًا لو حصل أكتر من تعديل يدوي على نفس الملف في نفس
  المهمة وبقيت مش متابع كل تغيير حصل فيه.
- لو خطأ جديد اتحل بطريقة مفيدة عمومًا (مش خاصة بمحتوى الفيديو نفسه)، سجّله
  لنفسك في تفكيرك كدرس للمهام الجاية في نفس الجلسة، حتى لو مش موثّق هنا.

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

9. **قبل ما تعتبر المهمة خلصت، سمّع/راجع تطابق الصوت مع النص المكتوب** — لو غيّرت
   المحتوى لسورة جديدة، لازم تتأكد إن أي متغيّر/رقم بيتحكم في رابط الصوت اتغيّر
   معاه بنفس القيمة (اسم المتغيّر بيختلف من هوية للتانية — دور عليه في "منطقة
   التعديل" بتاعة الملف). الفيديو ممكن يتصدّر بنجاح كامل من غير أي خطأ في
   اللوج، ومع ذلك يكون فيه نص وتفسير سورة، وتلاوة صوتية سورة تانية خالص — الرندر
   مش هيكشفلك الغلطة دي لوحده.

10. **ممنوع تحميل أي صوت بـ `curl` حتى للتجربة/التأكد إن الرابط شغال** — استخدم
    `curl -sI` (رأس بس) أو جرّب داخل `fetch()` نفسه وقت التشغيل. تحميل ملف صوت
    كامل محليًا بـ `curl` بيضيع وقت من غير أي فايدة، لأن `scene.html` مش بيقرأ
    منه أصلًا.

11. **ممنوع منعًا باتًا "تعيد تسمية" ملف الفيديو الناتج بتغيير الامتداد يدويًا**
    (مثلًا `cp video.webm video.mp4`). امتداد الملف اللي بيرجع في
    `window.__renderFilename` بيعكس الحاوية الحقيقية اللي نجح بيها الرندر —
    لو طلع امتداد غير المتوقع، ده معناه إن المحاولة الأساسية فشلت ورجعت لحاوية
    احتياطية، **مش غلطة في التسمية**. ارفع الملف بامتداده الحقيقي زي ما هو،
    ولو الهدف حاوية معيّنة تحديدًا، حل السبب اللي خلّى المحاولة الأساسية تفشل
    (راجع اللوج/الكونسول) بدل ما تلف حواليها بإعادة تسمية الملف.

12. **لما تكتب أمر `node -e "..."` بعلامات تنصيص مزدوجة وجواه JS template
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

---

## القسم 5: ملاحظات خاصة بكل ملف هوية (identities/)

> القسم ده مختلف عن باقي الملف: **مش قواعد عامة**. دي ملاحظات وأخطاء معروفة
> مرتبطة بملف هوية بعينه تحديدًا، تراكمت من مشاكل واقعية حصلت وهو مستخدم فعليًا.
> كل ملف هوية جديد يتضاف لـ `identities/` بمنطق مختلف ياخد قسم فرعي جديد ليه
> لوحده هنا، من غير ما يأثر على باقي الملف أو على أي هوية تانية. لو الملف اللي
> بتستخدمه مالوش قسم هنا لسه، معنى كده مفيش ملاحظات معروفة عليه — كمّل عادي
> واستخدم القواعد العامة في الأقسام اللي فوق بس.

### `identities/brown-style.html`

- **الـ `importmap` والتصدير**: هتلاقيهم دلوقتي متطابقين مع "الهيكل العام
  الموحّد للتصدير" في القسم 2 — الملف ده هو أصل الإصلاحات اللي اتعملت هناك
  (`?deps=mediabunny@1.50.8`، ترتيب الحلقات، إلخ). لو لقيت أي فرق بين الملف ده
  والهيكل الموحّد في القسم 2، القسم 2 هو المرجع الصحيح.
- **منطقة التعديل في الملف ده اسمها بالظبط**: `SURAH_NUMBER`, `RECITER_ID`,
  `OUTPUT_FILENAME`، وبعدها مصفوفة `SURAH_VERSES`.
- **⚠️ أسماء خصائص كل عنصر في `SURAH_VERSES` لازم تكون بالظبط**: `text`,
  `surah`, `tafseer` **(بحرف e — مش `tafsir`)**. كود الرسم بيقرأ
  `cue.tafseer` و`SURAH_VERSES[i].tafseer` بالحرف. لو المصدر اللي بتجيب منه
  التفسير (زي API خارجي) بيرجع اسم خاصية مختلف (`tafsir`, `interpretation`,
  إلخ)، **لازم تعيد تسميتها لـ `tafseer` وقت بناء المصفوفة** — مش تنسخ اسم
  الخاصية الجاي من المصدر زي ما هو. مخالفة الاسم ده مش بتدّي خطأ syntax ولا
  خطأ واضح وقت التوليد؛ بتدّي `undefined` وقت الرندر الفعلي، وبتظهر كـ
  `Cannot read properties of undefined (reading 'split')` جوه `layoutArabicParagraph`.
- **استبدال `SURAH_VERSES`**: حدّد نهايتها بالبحث عن أول `];` بعد
  `const SURAH_VERSES = [` (مش بتخمين تعليق أو سطر معيّن بعدها كعلامة نهاية).
  خصائص كل عنصر في المصفوفة الأصلية مكتوبة **من غير علامات تنصيص حوالين اسم
  الخاصية** (`text:`, مش `"text":`) — لو استبدلتها بمخرجات `json.dumps` هتيجي
  بعلامات تنصيص حوالين الأسماء، وده سليم في JS برضه (مش هو سبب أي خطأ syntax
  لوحده)، بس خليك واعي بالفرق لو بتقارن الكود بعينيك مع النسخة الأصلية.
- **`exportWithFallback` بيجرّب أكتر من حاوية/كودك** (MP4/AVC/AAC الأول، وبعدين
  WebM/VP9/Opus كاحتياطي) — يعني احتمال الفيديو يطلع `.webm` بدل `.mp4` وارد
  في الملف ده بالذات أكتر من هويات تانية ممكن ماتعملش fallback أصلًا. راجع
  القاعدة العامة عن امتداد الملف في القسم 3.
