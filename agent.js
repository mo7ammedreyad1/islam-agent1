// ============================================================================
// أوفق AI Agent v2.0 — باذن الله
//
// أداة واحدة بس: run_terminal. الـ AI هو اللي بيعمل كل حاجة (جلب نصوص، تحميل صوت،
// كتابة ملفات، رندر، رفع) عن طريق أوامر شل حقيقية — مفيش أي "أداة مخصصة" لكل خطوة.
// حتى الرندر نفسه بقى subcommand جوه نفس الملف ده (node agent.js render <file>)،
// والـ AI بيشغّله زي أي أمر تاني عن طريق run_terminal.
//
// معمارية التفكير: Plan-and-Solve (خطة نصية كاملة قبل أول أمر) + Reflexion
// (مراجعة نصية إلزامية بعد كل فيديو، عن طريق ملفات "علامة" بيراقبها agent.js).
// ============================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const WORK_DIR = process.cwd();
const OUTPUT_DIR = path.join(WORK_DIR, 'output');
const PORT = 8934;

function log(msg) {
  console.error(`[agent ${new Date().toISOString()}] ${msg}`);
}

// ============================================================================
// وضع الرندر (subcommand) — يشتغل كـ: node agent.js render <path/to/scene.html>
// عملية منفصلة تمامًا، بتفتح Chrome، تستنى الرندر، وتطبع JSON واحد على stdout بس
// (كل اللوجات التانية على stderr عشان الـ AI ياخد نتيجة نضيفة قابلة للقراءة)
// ============================================================================
async function renderVideoCli(filePath) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const server = await startStaticServer();
  let browser;
  const consoleLogs = [];
  const failedRequests = [];
  let firstPageError = null;
  let firstPageErrorAt = null;

  try {
    browser = await chromium.launch({
      channel: 'chrome',
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    page.on('console', (msg) => consoleLogs.push(`[console:${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => {
      consoleLogs.push('[pageerror] ' + err.message);
      if (!firstPageError) { firstPageError = err.message; firstPageErrorAt = Date.now(); }
    });
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.url()} — ${req.failure()?.errorText || 'فشل بدون سبب واضح'}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`HTTP ${res.status()} — ${res.url()}`);
    });

    const url = `http://localhost:${PORT}/${filePath}`;
    log('فتح: ' + url);
    await page.goto(url, { waitUntil: 'load' });

    const TIMEOUT_MS = 8 * 60 * 1000;
    const EARLY_FAIL_GRACE_MS = 8000; // لو حصل pageerror بدري، مستنينش الـ 8 دقايق كاملة
    const start = Date.now();
    let status = 'pending';

    while (Date.now() - start < TIMEOUT_MS) {
      status = await page.evaluate(() => window.__ofoqStatus || 'pending');
      if (status === 'done' || status === 'error') break;
      if (firstPageError && Date.now() - firstPageErrorAt > EARLY_FAIL_GRACE_MS) {
        log('اكتشاف كسر مبكر في الصفحة — إيقاف الانتظار بدل ما نستنى التايم آوت الكامل');
        break;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    const baseResult = {
      console_logs: consoleLogs.slice(-80),
      failed_requests: [...new Set(failedRequests)].slice(-30),
    };

    if (status !== 'done') {
      const errMsg = await page.evaluate(() => window.__ofoqError || null)
        .catch(() => null) || firstPageError || 'timeout أو حالة غير معروفة — راجع console_logs وfailed_requests';
      console.log(JSON.stringify({ success: false, error: errMsg, ...baseResult }));
      process.exitCode = 1;
      return;
    }

    const base64 = await page.evaluate(() => window.__ofoqBase64);
    const filename = await page.evaluate(() => window.__ofoqFilename || 'output.mp4');
    const buffer = Buffer.from(base64, 'base64');
    const outPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);

    console.log(JSON.stringify({
      success: true,
      local_path: path.relative(WORK_DIR, outPath),
      filename,
      size_bytes: buffer.length,
      ...baseResult,
    }));
  } catch (e) {
    console.log(JSON.stringify({
      success: false,
      error: e.message,
      console_logs: consoleLogs.slice(-80),
      failed_requests: [...new Set(failedRequests)].slice(-30),
    }));
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path.join(WORK_DIR, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ============================================================================
// وضع الـ Agent الرئيسي
// ============================================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// سلسلة نماذج احتياطية — التبديل تلقائي للي بعده لما نستنفد محاولات إعادة الاتصال
// على النموذج الحالي. مرتبة من الأعلى قدرة للأكرم في حدود الخطة المجانية (RPM).
const MODEL_CHAIN = (process.env.GEMINI_MODEL_CHAIN || 'gemini-3.0-flash-preview,gemini-3.1-flash-lite,gemini-3.5-flash-lite')
  .split(',').map((s) => s.trim()).filter(Boolean);
let currentModelIndex = 0;

const TASK_JSON = process.env.TASK_JSON || 'اعمل فيديو سورة الإخلاص كاملة، بدون تفسير، أفقي.';
const CALLBACK_URL = process.env.CALLBACK_URL || ''; // هيتحدد لاحقًا، اختياري دلوقتي
const GH_REPO = process.env.GITHUB_REPOSITORY || '';
const RELEASE_TAG = `render-${process.env.GITHUB_RUN_NUMBER || Date.now()}`;
const MAX_TURNS = 80;

const TASK_COMPLETE_MARKER = 'TASK_COMPLETE.json';
const VIDEO_DONE_PATTERN = /^video_.*_done\.json$/;

// ---------------------------------------------------------------------------
// الأداة الوحيدة: تنفيذ أمر شل حقيقي
// ---------------------------------------------------------------------------
async function runTerminal({ command }) {
  try {
    const output = execSync(command, {
      cwd: WORK_DIR,
      env: process.env,
      timeout: 10 * 60 * 1000, // أكبر من مهلة الرندر الداخلية (8 دقايق) عشان الرندر يقدر يرجّع JSON منظم لو فشل، بدل قتل عنيف من هنا
      maxBuffer: 30 * 1024 * 1024,
      shell: '/bin/bash',
    }).toString();
    return { success: true, exit_code: 0, output: output.slice(0, 6000) };
  } catch (e) {
    return {
      success: false,
      exit_code: e.status ?? null,
      error: e.message,
      stdout: (e.stdout || '').toString().slice(0, 3000),
      stderr: (e.stderr || '').toString().slice(0, 3000),
    };
  }
}

const functionDeclarations = [
  {
    name: 'run_terminal',
    description:
      'الأداة الوحيدة المتاحة لك. تنفّذ أي أمر bash حقيقي داخل بيئة GitHub Actions ' +
      '(curl لجلب أي API، cat/heredoc لكتابة أي ملف، node لتشغيل الرندر، gh لرفع الملفات). ' +
      'أنت المسؤول الكامل عن تنفيذ كل خطوة بنفسك عن طريق الأداة دي — مفيش أي أداة تانية.',
    parameters: {
      type: 'OBJECT',
      properties: { command: { type: 'STRING', description: 'أمر bash كامل، ممكن يكون متعدد الأسطر (heredoc مثلاً)' } },
      required: ['command'],
    },
  },
];

// ---------------------------------------------------------------------------
// حراسة خفيفة لمنع الاختلاق — بعد كل أمر terminal، لو الأمر كتب ملف scene*.html
// نتأكد إن فيه نص عربي حقيقي جواه (مش تحقق مطلق، تحذير بس)
// ---------------------------------------------------------------------------
function extractWrittenSceneFiles(command) {
  const matches = [...command.matchAll(/([a-zA-Z0-9_./-]*scene[a-zA-Z0-9_./-]*\.html)/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

function lightSanityCheck(command, result) {
  if (!result.success) return null;
  const files = extractWrittenSceneFiles(command);
  for (const f of files) {
    const fullPath = path.join(WORK_DIR, f);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (!/[\u0600-\u06FF]{10,}/.test(content)) {
      return `تنبيه: ${f} مفيهوش نص عربي واضح — تأكد إنك كتبت نص الآية/التفسير الحقيقي جواه، مش placeholder.`;
    }
    if (!content.includes('mediabunny')) {
      return `تنبيه: ${f} مفيهوش استيراد Mediabunny — راجع العقد التقني في AGENTS.md قبل ما تكمل.`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// مراقبة ملفات العلامة (بدل أدوات submit_plan/reflect/mark_video_done القديمة)
// ---------------------------------------------------------------------------
const seenVideoDoneFiles = new Set();

function checkMarkerFiles() {
  const entries = fs.readdirSync(WORK_DIR);
  const newVideoDone = [];
  for (const entry of entries) {
    if (VIDEO_DONE_PATTERN.test(entry) && !seenVideoDoneFiles.has(entry)) {
      seenVideoDoneFiles.add(entry);
      newVideoDone.push(entry);
    }
  }
  const taskComplete = entries.includes(TASK_COMPLETE_MARKER);
  return { newVideoDone, taskComplete };
}

// ---------------------------------------------------------------------------
// Gemini API — REST مباشر مع retry + تبديل نماذج تلقائي
// ---------------------------------------------------------------------------
function parseRetryDelaySeconds(errorBody) {
  try {
    const details = errorBody && errorBody.error && errorBody.error.details;
    const retryInfo = details && details.find((d) => (d['@type'] || '').includes('RetryInfo'));
    if (!retryInfo || !retryInfo.retryDelay) return null;
    const seconds = parseFloat(String(retryInfo.retryDelay).replace('s', ''));
    return Number.isFinite(seconds) ? seconds : null;
  } catch (e) {
    return null;
  }
}

async function callGemini(contents, systemInstruction, attempt = 1) {
  const MAX_ATTEMPTS_PER_MODEL = 3;
  const model = MODEL_CHAIN[currentModelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents,
    system_instruction: { parts: [{ text: systemInstruction }] },
    tools: [{ functionDeclarations }],
  };

  let res, data;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    data = await res.json();
  } catch (networkErr) {
    if (attempt < MAX_ATTEMPTS_PER_MODEL) {
      const waitSeconds = Math.min(60, 5 * Math.pow(2, attempt));
      log(`خطأ شبكة عند الاتصال بـ Gemini (${networkErr.message}). هستنى ${waitSeconds}s وأعيد المحاولة (${attempt}/${MAX_ATTEMPTS_PER_MODEL})...`);
      await new Promise((r) => setTimeout(r, waitSeconds * 1000));
      return callGemini(contents, systemInstruction, attempt + 1);
    }
    throw new Error(`فشل الاتصال بـ Gemini بعد عدة محاولات: ${networkErr.message}`);
  }

  if (!res.ok) {
    const isTransient = res.status === 429 || (res.status >= 500 && res.status < 600);
    if (isTransient) {
      if (attempt < MAX_ATTEMPTS_PER_MODEL) {
        const serverDelay = parseRetryDelaySeconds(data);
        const waitSeconds = serverDelay != null ? serverDelay + 1 : Math.min(60, 5 * Math.pow(2, attempt));
        log(`خطأ مؤقت (${res.status}) على ${model}. هستنى ${waitSeconds.toFixed(1)}s وأعيد المحاولة (${attempt}/${MAX_ATTEMPTS_PER_MODEL})...`);
        await new Promise((r) => setTimeout(r, waitSeconds * 1000));
        return callGemini(contents, systemInstruction, attempt + 1);
      }
      if (currentModelIndex < MODEL_CHAIN.length - 1) {
        currentModelIndex++;
        log(`استنفدنا محاولات ${model} (${res.status}). التبديل للنموذج الاحتياطي: ${MODEL_CHAIN[currentModelIndex]}`);
        return callGemini(contents, systemInstruction, 1);
      }
      throw new Error(`استنفدنا كل النماذج في السلسلة (${MODEL_CHAIN.join(', ')}) بسبب أخطاء متكررة (${res.status}).`);
    }
    throw new Error(`Gemini API error (${res.status}): ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data;
}

function buildSystemPrompt(agentsMd) {
  return `
انت أوفق AI Agent — عقل مستقل بيبني فيديوهات قرآنية كاملة من الصفر.

# هويتك الثابتة والعقد التقني الإلزامي (التزم بيه حرفيًا)
${agentsMd}

# الأداة الوحيدة المتاحة لك
run_terminal(command) — ده كل اللي عندك. مفيش أي أداة تانية. من خلاله لازم:
- تجيب أي نص (آية/تفسير) عن طريق: curl -s "<url>"
- تحمّل الصوت عن طريق: curl -s -o assets/xxx.mp3 "<url>"
- تكتب أي ملف (scene.html أو ملف .md) عن طريق: cat > path/to/file << 'EOF' ... EOF
- ترندر الفيديو عن طريق: node agent.js render <path/to/scene.html>
  (هيرجعلك سطر JSON واحد فيه success/local_path/filename/size_bytes/error)
- ترفع أي ملف على الـ Release عن طريق: gh release upload $RELEASE_TAG <file> --repo $GH_REPO

# معمارية تفكيرك — إلزامية
1. **Plan-and-Solve**: أول رد منك في المهمة لازم يكون **نص عادي** (من غير أي استدعاء run_terminal)
   فيه خطتك الكاملة خطوة بخطوة. لو حاولت تستخدم run_terminal قبل كده هيترفض تلقائيًا.
2. **التنفيذ**: نفّذ خطوة خطوة عن طريق run_terminal. ممنوع تمامًا تكتب أي نص قرآني أو تفسير
   من ذاكرتك الداخلية — لازم يكون مصدره نتيجة curl فعلية في نفس الجلسة.
3. **علامة انتهاء كل فيديو**: بعد ما ترفع فيديو وملف الوصف بتاعه بنجاح، اكتب ملف علامة بالأمر:
   cat > video_<رقم السورة>_done.json << 'EOF'
   {"surah": <رقم>, "release_video_url": "...", "release_md_url": "..."}
   EOF
   بعد ما تعمل كده هطلب منك تعمل Reflexion (مراجعة ذاتية نصية) قبل ما تكمل — التزم بيها.
4. **علامة انتهاء المهمة كاملة**: لما كل الفيديوهات المطلوبة تخلص، اكتب:
   cat > TASK_COMPLETE.json << 'EOF'
   {"summary": "...", "videos": [...]}
   EOF
   وده آخر حاجة تعملها في الجلسة.

# بيئة التشغيل (متاحة كمتغيرات بيئة لأي أمر run_terminal)
- الريبو: $GH_REPO (${GH_REPO})
- Release Tag: $RELEASE_TAG (${RELEASE_TAG}) — الـ Release ده اتعمل فاضي بالفعل قبل ما تبدأ
- curl، gh، node، npm كلهم متاحين مباشرة

# المهمة المطلوبة منك دلوقتي
${TASK_JSON}
`.trim();
}

async function runAgentLoop() {
  const agentsMd = fs.readFileSync(path.join(WORK_DIR, 'AGENTS.md'), 'utf-8');
  const systemInstruction = buildSystemPrompt(agentsMd);

  let contents = [{ role: 'user', parts: [{ text: 'ابدأ المهمة. اكتب خطتك الكاملة كنص عادي أولًا.' }] }];
  let hasPlanned = false;
  let taskComplete = false;
  let finalPayload = null;

  for (let turn = 0; turn < MAX_TURNS && !taskComplete; turn++) {
    log(`--- Turn ${turn + 1}/${MAX_TURNS} ---`);
    const response = await callGemini(contents, systemInstruction);
    const candidate = response.candidates && response.candidates[0];
    if (!candidate) throw new Error('مفيش رد من Gemini: ' + JSON.stringify(response).slice(0, 500));

    contents.push(candidate.content);
    const parts = candidate.content.parts || [];
    const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

    if (functionCalls.length === 0) {
      const textReply = parts.map((p) => p.text || '').join(' ');
      log('رد نصي (خطة/تفكير/مراجعة): ' + textReply.slice(0, 500));
      hasPlanned = true;
      contents.push({ role: 'user', parts: [{ text: 'تمام. كمّل بأوامر run_terminal الفعلية دلوقتي.' }] });
      continue;
    }

    const functionResponses = [];
    for (const fc of functionCalls) {
      log(`run_terminal: ${JSON.stringify(fc.args).slice(0, 300)}`);

      let result;
      if (!hasPlanned) {
        result = { success: false, error: 'لازم تكتب خطتك الكاملة كنص عادي الأول قبل أي أمر terminal.' };
      } else {
        result = await runTerminal(fc.args || {});
        const warning = lightSanityCheck(fc.args.command || '', result);
        if (warning) result.warning = warning;
      }

      log(`نتيجة: ${JSON.stringify(result).slice(0, 400)}`);
      functionResponses.push({ functionResponse: { name: fc.name, response: result, id: fc.id } });
    }
    contents.push({ role: 'user', parts: functionResponses });

    // مراقبة ملفات العلامة بعد كل دورة
    const { newVideoDone, taskComplete: done } = checkMarkerFiles();
    for (const f of newVideoDone) {
      log(`فيديو خلص: ${f}`);
      contents.push({
        role: 'user',
        parts: [{ text: `لاحظت إنك خلصت فيديو (${f}). قبل ما تكمل، لازم تعمل Reflexion الأول: اكتب رد نصي عادي (من غير أي أداة) يقيّم اللي حصل ويقول هل في حاجة تتعدل في الخطوات الجاية.` }],
      });
      hasPlanned = false; // نجبره يرد بنص (مراجعة) قبل أي أمر تاني
    }
    if (done) {
      const raw = fs.readFileSync(path.join(WORK_DIR, TASK_COMPLETE_MARKER), 'utf-8');
      finalPayload = JSON.parse(raw);
      taskComplete = true;
      log('المهمة اكتملت بالكامل.');
    }
  }

  if (!taskComplete) {
    throw new Error(`وصلنا للحد الأقصى من الأدوار (${MAX_TURNS}) من غير ما نلاقي ${TASK_COMPLETE_MARKER}.`);
  }
  return finalPayload;
}

async function main() {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY غير موجود في متغيرات البيئة. أوقف التنفيذ.');
    process.exit(1);
  }

  log('بسم الله — بدء تشغيل أوفق AI Agent v2.0');

  try {
    execSync(
      `gh release create ${RELEASE_TAG} --repo ${GH_REPO} --title "Ofoq AI Agent Render" --notes "تم الإنشاء تلقائيًا بواسطة agent.js"`,
      { env: process.env, stdio: 'pipe' }
    );
    log(`تم إنشاء Release: ${RELEASE_TAG}`);
  } catch (e) {
    log('ملحوظة: فشل إنشاء الـ Release (يمكن يكون موجود بالفعل) — ' + e.message.slice(0, 200));
  }

  const finalPayload = await runAgentLoop();
  log('النتيجة النهائية: ' + JSON.stringify(finalPayload, null, 2));

  if (CALLBACK_URL) {
    try {
      await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      log('تم إبلاغ الـ callback endpoint بنجاح.');
    } catch (e) {
      log('تحذير: فشل الاتصال بالـ callback endpoint — ' + e.message);
    }
  }
}

// ============================================================================
// نقطة الدخول — وضعين: agent (افتراضي) أو render (subcommand داخلي)
// ============================================================================
const args = process.argv.slice(2);
if (args[0] === 'render') {
  renderVideoCli(args[1]).catch((e) => {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  });
} else {
  main().catch((err) => {
    console.error('خطأ فادح في الـ Agent:', err);
    process.exit(1);
  });
}
