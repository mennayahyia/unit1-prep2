/* =====================================================================
   مغامرة جيل ألفا – Unit 1  |  app.js  (الملف المشترك لكل الصفحات)
   ---------------------------------------------------------------------
   ✔ تسجيل الدخول والجلسة          ✔ قفل الدروس بالترتيب
   ✔ دائرة الاسم + الأفاتار         ✔ تتبّع الإجابات والتقدم والتخطّي
   ✔ تقارير الطالب ولوحة المعلم      ✔ مزامنة سحابية اختيارية (Firebase)
   ===================================================================== */

/* ---------------------------------------------------------------
   ⚙️ إعداد المزامنة (اختياري)
   لو عايز المعلم يشوف الطلاب من جهازه هو (مش نفس جهاز الطالب):
   1) اعمل مشروع Firebase مجاني + Realtime Database
   2) الصق رابط قاعدة البيانات هنا، مثال:
      const GA_SYNC_URL = 'https://my-project-default-rtdb.firebaseio.com';
   لو سيبته فاضي: البيانات بتتحفظ على نفس المتصفح/الجهاز فقط.
---------------------------------------------------------------- */
const GA_SYNC_URL = '';
const GA_SYNC_ROOT = 'ga_unit1';

(function () {
  'use strict';

  /* ============================ خريطة الوحدة ============================ */
  // [id, ملف, عنوان EN, عنوان AR, نوع]
  var LESSONS = [
    { n: 1, en: 'Meet Gen Alpha', ar: 'تعرّف على جيل ألفا', icon: '🧬', pages: [
      ['l1-1', 'l1-1-warmup.html', 'Warm-up: What is a generation?', 'التمهيد: يعني إيه جيل؟', 'warm'],
      ['l1-2', 'l1-2-reading.html', 'Reading: Read, Listen & Explore', 'القراءة والاستماع واستكشاف الكلمات', 'read'],
      ['l1-3', 'l1-3-think-about-this.html', 'Think About This', 'اختبر فهمك لقطعة القراءة', 'quiz'],
      ['l1-4', 'l1-4-vocabulary-challenge.html', 'Vocabulary Challenge', 'تحدي المفردات', 'vocab'],
      ['l1-5', 'l1-5-think-pair-share.html', 'Speaking: Think–Pair–Share', 'التحدث: فكّر – شارك – ناقش', 'speak']
    ]},
    { n: 2, en: "Gen Alpha's Digital Life", ar: 'حياة جيل ألفا الرقمية', icon: '🎧', pages: [
      ['l2-1', 'l2-1-listening.html', 'Listening', 'الاستماع', 'listen'],
      ['l2-2', 'l2-2-language-in-use.html', 'Grammar Mission: Present Continuous', 'مهمة القواعد: المضارع المستمر', 'quiz'],
      ['l2-3', 'l2-3-speaking.html', 'Speaking: Think–Pair–Share', 'التحدث: فكّر – شارك – ناقش', 'speak']
    ]},
    { n: 3, en: 'The Digital Bridge', ar: 'الجسر الرقمي', icon: '🌉', pages: [
      ['l3-1', 'l3-1-before-you-start.html', 'Before You Start', 'قبل ما نبدأ', 'warm'],
      ['l3-2', 'l3-2-reading.html', 'Reading: Gen Z & Gen Alpha', 'القراءة: جيل Z وجيل ألفا', 'read'],
      ['l3-3', 'l3-3-comprehension.html', 'Reading Comprehension', 'فهم المقروء', 'quiz'],
      ['l3-4', 'l3-4-vocabulary.html', 'Vocabulary Matching', 'مطابقة المفردات', 'vocab'],
      ['l3-5', 'l3-5-speaking.html', 'Speaking: Think–Pair–Share', 'التحدث', 'speak']
    ]},
    { n: 4, en: 'Story Time', ar: 'وقت القصة', icon: '📖', pages: [
      ['l4-1', 'l4-1-before-you-read.html', 'Before You Read', 'قبل ما تقرأ', 'warm'],
      ['l4-2', 'l4-2-story-time.html', 'Story Time: The Little Inventor', 'شاهد القصة واختبر فهمك', 'video'],
      ['l4-3', 'l4-3-vocabulary.html', 'Vocabulary & Quiz', 'المفردات والاختبار', 'vocab']
    ]},
    { n: 5, en: "Let's Talk", ar: 'لنتحدث', icon: '💬', pages: [
      ['l5-1', 'l5-1-dialogue.html', 'Finding Balance: Dialogue', 'قراءة الحوار والاستماع إليه', 'read'],
      ['l5-2', 'l5-2-speaking-practice.html', 'Speaking Practice', 'تدريبات التحدث', 'speak']
    ]},
    { n: 6, en: 'Expressing Identity Online', ar: 'التعبير عن الهوية أونلاين', icon: '✍️', pages: [
      ['l6-1', 'l6-1-before-you-write.html', 'Before You Write: Get Ready', 'قبل ما تكتب: استعد', 'warm'],
      ['l6-2', 'l6-2-reading-a-blog.html', 'Reading a Blog', 'قراءة مدونة وإكمالها', 'read'],
      ['l6-3', 'l6-3-create-your-blog.html', 'Create Your Blog', 'اكتب مدونتك', 'write'],
      ['l6-4', 'l6-4-assessment-corner.html', 'Assessment Corner – Final Test', 'ركن التقييم – الاختبار النهائي', 'test']
    ]}
  ];
  var FINAL_ID = 'l6-4';
  var PAGES = [], ORDER = {}, BY_ID = {}, BY_FILE = {}, LESSON_OF = {};
  LESSONS.forEach(function (L, li) {
    L.pages = L.pages.map(function (a, i) {
      var p = { id: a[0], file: a[1], en: a[2], ar: a[3], type: a[4], lesson: L.n, li: li, idx: i };
      p.order = PAGES.length; PAGES.push(p);
      ORDER[p.id] = p.order; BY_ID[p.id] = p; BY_FILE[p.file] = p; LESSON_OF[p.id] = li;
      return p;
    });
  });

  /* ============================ تخزين ============================ */
  var KEY_DB = 'ga_students', KEY_SESSION = 'gameUser';
  function $(id) { return document.getElementById(id); }
  function jget(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function makeId(n) { return String(n || '').trim().toLowerCase().replace(/[.$#\[\]\/\s]+/g, '_'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clean(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

  function session() {
    var s = jget(KEY_SESSION, null);
    if (s && s.name && !s.id) { s.id = makeId(s.name); jset(KEY_SESSION, s); }
    return s && s.name ? s : null;
  }
  function db() { return jget(KEY_DB, {}); }
  function saveDb(d) { jset(KEY_DB, d); }
  function blank(s) { return { id: s.id, name: s.name, avatar: s.avatar, createdAt: Date.now(), lastActive: Date.now(), furthest: null, current: null, pages: {} }; }
  function me() { var s = session(); if (!s || s.role !== 'student') return null; return db()[s.id] || null; }
  function pg(r, id) { return r.pages[id] || (r.pages[id] = { visits: 0, time: 0, done: false, attempts: 0, q: {}, extra: {} }); }

  function mutate(fn) {
    var s = session(); if (!s || s.role !== 'student') return;
    var d = db(), r = d[s.id] || (d[s.id] = blank(s));
    r.name = s.name; r.avatar = s.avatar;
    try { fn(r); } catch (e) { console.warn('GA mutate', e); }
    r.lastActive = Date.now(); saveDb(d); push(s.id);
  }

  /* ============================ مزامنة سحابية ============================ */
  var pushTimer = null;
  function syncOn() { return !!GA_SYNC_URL; }
  function surl(path) { return GA_SYNC_URL.replace(/\/$/, '') + '/' + GA_SYNC_ROOT + '/' + path + '.json'; }
  function fetchJson(url, ms, opts) {
    var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, ms || 6000) : null;
    opts = opts || {}; if (ctl) opts.signal = ctl.signal;
    return fetch(url, opts).then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
  }
  function push(id) {
    if (!syncOn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { flush(id); }, 1500);
  }
  function flush(id) {
    if (!syncOn()) return;
    var r = db()[id]; if (!r) return;
    fetch(surl('students/' + encodeURIComponent(id)), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { var s = session(); if (s && s.role === 'student' && pushTimer) { clearTimeout(pushTimer); flush(s.id); } }
  });
  function mergeInto(local, incoming) {
    var ch = 0;
    Object.keys(incoming || {}).forEach(function (id) {
      var a = local[id], b = incoming[id]; if (!b || !b.pages) return;
      if (!a || (b.lastActive || 0) > (a.lastActive || 0)) { local[id] = b; ch++; }
    });
    return ch;
  }
  function loadAll() { // للمعلم: محلي + سحابي
    var local = db();
    if (!syncOn()) return Promise.resolve({ data: local, cloud: false, ok: true });
    return fetchJson(surl('students') + '?t=' + Date.now(), 8000).then(function (remote) {
      mergeInto(local, remote || {}); saveDb(local); return { data: local, cloud: true, ok: true };
    }).catch(function () { return { data: local, cloud: true, ok: false }; });
  }

  /* ============================ دخول / خروج ============================ */
  function loginStudent(name, avatar) {
    var id = makeId(name);
    var finish = function () {
      var d = db(), r = d[id];
      if (!r) r = d[id] = { id: id, name: name, avatar: avatar, createdAt: Date.now(), lastActive: Date.now(), furthest: null, current: null, pages: {} };
      r.name = name; r.avatar = avatar; saveDb(d);
      jset(KEY_SESSION, { id: id, name: name, role: 'student', avatar: avatar });
      push(id);
    };
    if (!syncOn()) { finish(); return Promise.resolve(); }
    return fetchJson(surl('students/' + encodeURIComponent(id)), 2500).then(function (remote) {
      if (remote && remote.pages) { var d = db(), l = d[id]; if (!l || (remote.lastActive || 0) > (l.lastActive || 0)) { d[id] = remote; saveDb(d); } }
    }).catch(function () {}).then(finish);
  }
  function loginTeacher(name) { jset(KEY_SESSION, { id: 'teacher', name: name, role: 'teacher', avatar: '👨‍🏫' }); }
  function logout() { try { localStorage.removeItem(KEY_SESSION); } catch (e) {} location.href = 'signin.html'; }

  /* ============================ منطق التقدم ============================ */
  function isDone(r, id) { return !!(r && r.pages[id] && r.pages[id].done); }
  function status(r, id) {
    if (isDone(r, id)) return 'done';
    var o = ORDER[id], later = PAGES.some(function (x) { return x.order > o && r && r.pages[x.id] && (r.pages[x.id].done || r.pages[x.id].visits > 0); });
    if (later) return 'skipped';
    if (r && r.pages[id] && r.pages[id].visits > 0) return 'progress';
    return 'new';
  }
  function lessonDone(r, li) { return LESSONS[li].pages.every(function (p) { return isDone(r, p.id); }); }
  function lessonCount(r, li) { return LESSONS[li].pages.filter(function (p) { return isDone(r, p.id); }).length; }
  function unlocked(r, li) { var s = session(); if (s && s.role === 'teacher') return true; if (li === 0) return true; return lessonDone(r, li - 1); }
  function resumePage(r, li) { var L = LESSONS[li]; for (var i = 0; i < L.pages.length; i++) if (!isDone(r, L.pages[i].id)) return L.pages[i]; return L.pages[0]; }
  function progress(r) {
    var n = PAGES.filter(function (p) { return isDone(r, p.id); }).length;
    return { done: n, total: PAGES.length, pct: Math.round(n * 100 / PAGES.length) };
  }
  function starsSum(r) { var g = 0, m = 0; PAGES.forEach(function (p) { var s = r && r.pages[p.id] && r.pages[p.id].score; if (s) { g += s.got; m += s.max; } }); return { got: g, max: m }; }
  function skippedList(r) { return PAGES.filter(function (p) { return status(r, p.id) === 'skipped'; }); }
  function furthestPage(r) { return r && r.furthest ? BY_ID[r.furthest] : null; }
  function finalResult(r) { var p = r && r.pages[FINAL_ID]; return p && p.done ? p : null; }

  /* ============================ تسجيل البيانات ============================ */
  function visit(pid) {
    mutate(function (r) {
      var p = pg(r, pid); p.visits++; p.lastVisit = Date.now(); if (!p.firstVisit) p.firstVisit = Date.now();
      if (!r.furthest || ORDER[pid] > ORDER[r.furthest]) r.furthest = pid;
      r.current = pid;
    });
  }
  function answer(pid, qid, prompt, ans, ok, key) {
    mutate(function (r) {
      var p = pg(r, pid), q = p.q[qid] || (p.q[qid] = { q: prompt, tries: [], ok: null, firstOk: null, order: Object.keys(p.q).length });
      q.q = prompt || q.q; if (key != null) q.key = String(key);
      q.tries.push({ a: String(ans == null ? '' : ans).slice(0, 800), ok: ok, t: Date.now() });
      if (q.tries.length > 20) q.tries.shift();
      if (q.firstOk === null) q.firstOk = ok;
      if (ok === true) q.ok = true; else if (ok === false && q.ok !== true) q.ok = false;
      q.last = q.tries[q.tries.length - 1].a;
    });
  }
  function done(pid, res) {
    mutate(function (r) {
      var p = pg(r, pid); p.attempts++;
      if (!p.done) { p.done = true; p.completedAt = Date.now(); }
      if (res) {
        if (res.max != null) { var g = res.got || 0; if (!p.score || g >= p.score.got) p.score = { got: g, max: res.max }; }
        if (res.extra) Object.keys(res.extra).forEach(function (k) { p.extra[k] = res.extra[k]; });
      }
    });
  }
  function setExtra(pid, k, v) { mutate(function (r) { pg(r, pid).extra[k] = v; }); }
  function addExtra(pid, k, v) { mutate(function (r) { var e = pg(r, pid).extra; e[k] = e[k] || []; if (e[k].indexOf(v) < 0) e[k].push(v); }); }

  /* ============================ واجهة مشتركة ============================ */
  var STYLE = '' +
    '.ga-bar{width:100%;margin:0 auto 8px;background:#fff;border:2px solid #0E1726;box-shadow:4px 4px 0 #0E1726;padding:6px 8px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:25;position:relative;box-sizing:border-box}' +
    '.ga-user{display:flex;align-items:center;gap:8px;text-decoration:none;color:#0E1726;min-width:0;cursor:pointer;background:none;border:0;padding:0;font-family:inherit}' +
    '.ga-av{width:36px;height:36px;border-radius:9999px;background:#FFE800;border:2px solid #0E1726;box-shadow:2px 2px 0 #0E1726;display:flex;align-items:center;justify-content:center;font-size:18px;flex:0 0 auto;position:relative}' +
    '.ga-ut{display:flex;flex-direction:column;min-width:0;line-height:1.2;text-align:right}' +
    '.ga-eng{font-family:Silkscreen,monospace;font-size:9px;font-weight:700;letter-spacing:.05em;color:#0E1726;direction:ltr;text-align:right}' +
    '.ga-nm{font-family:Kufam,Cairo,sans-serif;font-size:12px;font-weight:700;color:#FF5226;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ga-right{display:flex;align-items:center;gap:6px;flex:0 0 auto}' +
    '.ga-chip{font-family:Silkscreen,"Space Mono",monospace;font-size:10px;font-weight:700;background:#FAF7F2;border:1px solid #0E1726;padding:2px 6px;color:#0E1726;direction:ltr}' +
    '.ga-btn{font-family:Cairo,sans-serif;font-size:11px;font-weight:800;background:#FFE800;color:#0E1726;border:2px solid #0E1726;box-shadow:2px 2px 0 #0E1726;padding:4px 8px;text-decoration:none;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:4px}' +
    '.ga-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #0E1726}' +
    '@media(min-width:640px){.ga-av{width:40px;height:40px}.ga-nm{font-size:13px;max-width:180px}.ga-btn{font-size:12px}}' +
    /* التقارير */
    '.ga-rep{font-family:Cairo,sans-serif;color:#0E1726;display:flex;flex-direction:column;gap:12px}' +
    '.ga-les{background:#fff;border:2px solid #0E1726;box-shadow:4px 4px 0 #0E1726}' +
    '.ga-lh{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:#0E1726;color:#FAF7F2;flex-wrap:wrap}' +
    '.ga-lh b{font-family:Kufam,Cairo,sans-serif;font-size:15px}' +
    '.ga-lh small{font-family:"Space Mono",monospace;font-size:11px;color:#00E5FF;direction:ltr}' +
    '.ga-pgs{display:flex;flex-direction:column}' +
    '.ga-pg{border-top:2px solid #0E1726}' +
    '.ga-pg>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:9px 10px;flex-wrap:wrap}' +
    '.ga-pg>summary::-webkit-details-marker{display:none}' +
    '.ga-pg[open]>summary{background:#FFE80022}' +
    '.ga-st{font-size:16px;flex:0 0 auto}' +
    '.ga-pt{flex:1 1 140px;min-width:0}' +
    '.ga-pt b{display:block;font-family:Kufam,Cairo,sans-serif;font-size:13px}' +
    '.ga-pt span{display:block;font-family:"Space Mono",monospace;font-size:10px;color:#475569;direction:ltr;text-align:right}' +
    '.ga-tag{font-size:10px;font-weight:800;border:1px solid #0E1726;padding:1px 6px;white-space:nowrap}' +
    '.ga-body{padding:8px 10px 12px;background:#FAF7F2;border-top:1px dashed #0E1726;display:flex;flex-direction:column;gap:6px}' +
    '.ga-q{background:#fff;border:1px solid #0E1726;padding:7px 9px;font-size:12px}' +
    '.ga-q .qq{font-family:"Space Mono",monospace;font-weight:700;direction:ltr;text-align:left;line-height:1.45;word-break:break-word}' +
    '.ga-q .aa{margin-top:4px;font-weight:700;direction:ltr;text-align:left;word-break:break-word;white-space:pre-wrap}' +
    '.ga-q .mm{margin-top:3px;font-size:11px;color:#475569}' +
    '.ga-ok{border-inline-start:6px solid #10B981}.ga-no{border-inline-start:6px solid #FF5226}.ga-nn{border-inline-start:6px solid #00E5FF}' +
    '.ga-empty{font-size:12px;color:#64748b;font-weight:700;padding:2px 0}' +
    '.ga-final{background:#fff;border:3px solid #0E1726;box-shadow:6px 6px 0 #FF5226}' +
    '.ga-link{display:inline-flex;align-self:flex-start;font-size:12px;font-weight:800;background:#00E5FF;border:2px solid #0E1726;padding:3px 10px;color:#0E1726;text-decoration:none;box-shadow:2px 2px 0 #0E1726}';

  function injectStyle() { if ($('gaStyle')) return; var s = document.createElement('style'); s.id = 'gaStyle'; s.textContent = STYLE; document.head.appendChild(s); }

  function injectBar() {
    var s = session(); if (!s || document.body.getAttribute('data-ga-bar') === 'off' || $('gaBar')) return;
    var h = document.querySelector('header');
    var bar = document.createElement('div'); bar.id = 'gaBar'; bar.className = 'ga-bar';
    var mw = h ? getComputedStyle(h).maxWidth : '36rem'; bar.style.maxWidth = (!mw || mw === 'none') ? '36rem' : mw;
    var isT = s.role === 'teacher', r = me(), pr = r ? progress(r) : null;
    bar.innerHTML =
      '<a class="ga-user" href="' + (isT ? 'dashboard.html' : 'stats.html') + '" title="' + (isT ? 'لوحة المعلم' : 'إحصائياتي') + '">' +
      '<span class="ga-av">' + esc(s.avatar || '👤') + '</span>' +
      '<span class="ga-ut"><span class="ga-eng">ENGLISH • PREP 2</span><span class="ga-nm">' + esc(s.name) + '</span></span></a>' +
      '<div class="ga-right">' + (pr ? '<span class="ga-chip" title="تقدمك في الوحدة">⭐ ' + pr.pct + '%</span>' : '') +
      (isT ? '<a class="ga-btn" href="dashboard.html">📊 اللوحة</a>' : '<a class="ga-btn" href="contents.html">📚 الفهرس</a>') + '</div>';
    document.body.insertBefore(bar, h || document.body.firstChild);
  }

  // لصفحات تستخدم هيدر تسجيل الدخول (signin / index / contents / stats / dashboard)
  function fillHeader() {
    var s = session(); if (!s) return;
    var a = $('avatarCircle'), n = $('headerUserName'), b = $('userRoleBadge'), c = $('userAvatarContainer');
    if (a) a.textContent = s.avatar || '👤';
    if (n) n.textContent = s.name;
    if (b) { b.classList.remove('hidden'); b.textContent = s.role === 'teacher' ? 'TCH' : 'STD'; }
    if (c) { c.onclick = function () { location.href = s.role === 'teacher' ? 'dashboard.html' : 'stats.html'; }; c.title = s.role === 'teacher' ? 'لوحة المعلم' : 'إحصائياتي'; }
  }

  /* ---------- تقارير ---------- */
  var ST = { done: ['✅', 'مكتملة', '#10B981', '#fff'], progress: ['🟡', 'جارية', '#FFE800', '#0E1726'], skipped: ['⏭️', 'تم تخطيها', '#FF5226', '#fff'], new: ['⚪', 'لم تبدأ', '#E2E8F0', '#0E1726'], locked: ['🔒', 'مقفولة', '#94A3B8', '#fff'] };
  function tag(st) { var m = ST[st]; return '<span class="ga-tag" style="background:' + m[2] + ';color:' + m[3] + '">' + m[1] + '</span>'; }
  function fmtTime(sec) { sec = sec || 0; if (sec < 60) return sec + ' ث'; var m = Math.round(sec / 60); return m + ' د'; }
  function ago(ts) {
    if (!ts) return '—'; var d = Math.floor((Date.now() - ts) / 1000);
    if (d < 45) return 'الآن'; if (d < 3600) return 'منذ ' + Math.round(d / 60) + ' دقيقة';
    if (d < 86400) return 'منذ ' + Math.round(d / 3600) + ' ساعة'; return 'منذ ' + Math.round(d / 86400) + ' يوم';
  }
  function fmtDate(ts) { if (!ts) return '—'; try { return new Date(ts).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return new Date(ts).toLocaleString(); } }

  function renderAnswers(p) {
    var qs = p && p.q ? Object.keys(p.q).map(function (k) { return p.q[k]; }).sort(function (a, b) { return a.order - b.order; }) : [];
    var html = '';
    qs.forEach(function (q) {
      var cls = q.ok === true ? 'ga-ok' : q.ok === false ? 'ga-no' : 'ga-nn';
      var icon = q.ok === true ? '✔️ صحيحة' : q.ok === false ? '❌ خاطئة' : '📝 إجابة مفتوحة';
      var n = q.tries.length;
      var meta = icon + (n > 1 ? ' • عدد المحاولات: ' + n : '') + (q.ok === true && q.firstOk === false ? ' (صحّت بعد محاولات)' : '');
      html += '<div class="ga-q ' + cls + '"><div class="qq">' + esc(q.q) + '</div><div class="aa">' + (q.last ? esc(q.last) : '—') + '</div>' +
        '<div class="mm">' + meta + (q.ok === false && q.key ? ' • الإجابة الصحيحة: <b dir="ltr">' + esc(q.key) + '</b>' : '') + '</div></div>';
    });
    var ex = p && p.extra || {};
    if (ex.words && ex.words.length) html += '<div class="ga-q ga-nn"><div class="mm">🔎 كلمات استكشفها الطالب (' + ex.words.length + '): <b dir="ltr">' + esc(ex.words.join(', ')) + '</b></div></div>';
    if (ex.cards && ex.cards.length) html += '<div class="ga-q ga-nn"><div class="mm">🃏 بطاقات قلبها الطالب (' + ex.cards.length + '): <b dir="ltr">' + esc(ex.cards.join(', ')) + '</b></div></div>';
    if (ex.listened) html += '<div class="ga-q ga-nn"><div class="mm">🎧 شغّل الصوت/القراءة المسموعة</div></div>';
    if (ex.videoPlayed) html += '<div class="ga-q ga-nn"><div class="mm">🎬 شاهد الفيديو' + (ex.videoEnded ? ' حتى النهاية' : ' (لم يكمله للنهاية)') + '</div></div>';
    if (ex.wordCount != null) html += '<div class="ga-q ga-nn"><div class="mm">✍️ عدد كلمات المدونة: <b>' + esc(ex.wordCount) + '</b></div></div>';
    if (ex.rating) html += '<div class="ga-q ga-nn"><div class="mm">⭐ تقييم النظام: <b dir="ltr">' + esc(ex.rating) + '</b></div></div>';
    return html || '<div class="ga-empty">لا توجد إجابات مسجّلة لهذه الصفحة.</div>';
  }

  function pageRow(r, p, opts) {
    var st = status(r, p.id), rec = r && r.pages[p.id], locked = opts.lockedLesson && st !== 'done' && !(rec && rec.visits);
    var shown = locked ? 'locked' : st, sc = rec && rec.score;
    var open = '';
    var h = '<details class="ga-pg"' + open + '><summary><span class="ga-st">' + ST[shown][0] + '</span>' +
      '<span class="ga-pt"><b>' + esc(p.ar) + '</b><span>' + esc(p.en) + '</span></span>' + tag(shown) +
      (sc ? '<span class="ga-tag" style="background:#00E5FF">' + sc.got + ' / ' + sc.max + '</span>' : '') +
      (rec && rec.time ? '<span class="ga-tag" style="background:#fff">⏱ ' + fmtTime(rec.time) + '</span>' : '') +
      (p.id === FINAL_ID ? '<span class="ga-tag" style="background:#FFE800">🏆 الاختبار النهائي</span>' : '') +
      '</summary><div class="ga-body">';
    if (st === 'skipped') h += '<div class="ga-empty" style="color:#FF5226">⚠️ ' + (rec && rec.visits ? 'فتح الطالب الصفحة لكن لم يكملها وانتقل لما بعدها.' : 'لم يفتح الطالب هذه الصفحة وانتقل لما بعدها.') + '</div>';
    if (rec) { h += '<div class="ga-empty">زيارات: ' + rec.visits + ' • ' + (rec.completedAt ? 'أُنجزت: ' + esc(fmtDate(rec.completedAt)) : 'لم تُنجز بعد') + '</div>'; }
    h += renderAnswers(rec);
    if (!locked && !opts.teacher) h += '<a class="ga-link" href="' + p.file + '">' + (st === 'done' ? '↻ افتح الصفحة مرة أخرى' : '▶ افتح الصفحة') + '</a>';
    return h + '</div></details>';
  }

  function report(r, opts) {
    opts = opts || {}; var out = '<div class="ga-rep">';
    LESSONS.forEach(function (L, li) {
      var lk = !opts.teacher && !unlocked(r, li), c = lessonCount(r, li);
      out += '<section class="ga-les"><div class="ga-lh"><b>' + L.icon + ' الدرس ' + L.n + ': ' + esc(L.ar) + '</b><small>' + esc(L.en) + ' • ' + c + '/' + L.pages.length + (lk ? ' • 🔒' : '') + '</small></div><div class="ga-pgs">';
      L.pages.forEach(function (p) { out += pageRow(r, p, { teacher: opts.teacher, lockedLesson: lk }); });
      out += '</div></section>';
    });
    return out + '</div>';
  }

  /* ---------- تصدير ---------- */
  function download(name, text, type) {
    var b = new Blob([text], { type: type || 'text/plain' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function toCSV(data) {
    var rows = [['الاسم', 'نسبة التقدم', 'الصفحات المكتملة', 'وصل إلى', 'عدد الصفحات المتخطاة', 'الصفحات المتخطاة', 'درجة الاختبار النهائي', 'آخر نشاط']];
    Object.keys(data).forEach(function (id) {
      var r = data[id], pr = progress(r), f = furthestPage(r), fin = finalResult(r), sk = skippedList(r);
      rows.push([r.name, pr.pct + '%', pr.done + '/' + pr.total, f ? f.en : '—', sk.length, sk.map(function (p) { return p.id; }).join(' '), fin && fin.score ? fin.score.got + '/' + fin.score.max : 'لم يؤدِّ', fmtDate(r.lastActive)]);
    });
    return '\ufeff' + rows.map(function (a) { return a.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  }

  /* ============================ Hooks لكل صفحة ============================ */
  function wrap(name, h) {
    var o = window[name]; if (typeof o !== 'function') return;
    window[name] = function () {
      var self = this, args = arguments;
      if (h.pre) { try { h.pre.apply(self, args); } catch (e) { console.warn('GA pre ' + name, e); } }
      var res = o.apply(self, args);
      if (h.post) { try { h.post.apply(self, args); } catch (e) { console.warn('GA post ' + name, e); } }
      return res;
    };
  }
  var ctx = { a: '' };
  var H = {};

  H['l1-1'] = function () {
    wrap('checkAnswer', { post: function (c) {
      var ok = c === 'A';
      answer('l1-1', 'q1', 'What does “generation” mean?', clean($('opt' + c)), ok);
      done('l1-1', { got: ok ? 1 : 0, max: 1 });
    } });
  };
  H['l1-2'] = function () {
    wrap('openVocabModal', { post: function (k) { addExtra('l1-2', 'words', k); } });
    wrap('toggleSpeech', { post: function () { setExtra('l1-2', 'listened', true); } });
    wrap('pronounceCurrentWord', { post: function () { setExtra('l1-2', 'listened', true); } });
    wrap('goToNextStep', { pre: function () { done('l1-2', {}); } });
  };
  H['l1-3'] = function () {
    wrap('selectOption', { pre: function (i) {
      if (answeredCurrent) return; var q = questionsData[currentQIndex];
      answer('l1-3', 'q' + (currentQIndex + 1), q.prompt, q.options[i].text, !!q.options[i].correct);
    } });
    wrap('showCompletionModal', { pre: function () { done('l1-3', { got: earnedStarsCount, max: 5 }); } });
  };
  H['l1-4'] = function () {
    ['checkM1', 'checkM4', 'checkM5', 'checkM6', 'checkM7', 'checkM8'].forEach(function (f) { wrap(f, { pre: function (w) { ctx.a = w; } }); });
    wrap('checkM2', { pre: function () { ctx.a = $('unscrambleInput').value; } });
    wrap('checkM9', { pre: function () { ctx.a = m9Words.join(' '); } });
    wrap('checkM10', { pre: function () { ctx.a = ['m10_1', 'm10_2', 'm10_3'].map(function (i) { return $(i).value; }).join(' | '); } });
    wrap('showFeedback', { pre: function (ok, title) {
      var box = clean($('missionBox')).slice(0, 150);
      answer('l1-4', 'm' + (currentMission + 1), 'Mission ' + (currentMission + 1) + ' — ' + box, ctx.a || (currentMission === 2 ? 'Matched: Communicate / Identity / Hobbies' : title), ok);
      ctx.a = '';
    } });
    wrap('nextMission', { pre: function () { if (currentMission === 9) done('l1-4', { got: Math.min(10, Math.round(score / 10)), max: 10 }); } });
  };
  H['l1-5'] = function () {
    wrap('evaluateAnswer', { post: function () {
      var fs = $('feedbackSection'); if (!fs || fs.classList.contains('hidden')) return;
      var n = window.__tpsScore != null ? window.__tpsScore : 0, badge = clean($('scoreBadge'));
      answer('l1-5', 'speak', 'Think–Pair–Share: write your answer (opinion + reason + lesson words)', $('finalAnswer').value.trim(), n >= 2 ? true : false);
      done('l1-5', { got: n, max: 4, extra: { rating: badge + ' (' + n + '/4)' } });
    } });
  };

  H['l3-1'] = function () {
    wrap('goToReadingPassage', { pre: function () {
      answer('l3-1', 'q1', '1. How often do you use the internet?', $('q1_custom').value || '—', null);
      answer('l3-1', 'q2', '2. What do you use it for?', $('q2_custom').value || '—', null);
      done('l3-1', {});
    } });
  };
  H['l3-2'] = function () {
    wrap('showVocabModal', { post: function (k) { addExtra('l3-2', 'words', k); } });
    wrap('playPartAudio', { post: function () { setExtra('l3-2', 'listened', true); } });
    wrap('goToComprehension', { pre: function () { done('l3-2', {}); } });
  };
  H['l3-3'] = function () {
    wrap('checkChoice', { pre: function (i) { var q = questions[currentQ]; answer('l3-3', 'q' + (currentQ + 1), q.prompt, q.options[i].text, !!q.options[i].correct); } });
    wrap('goToNextQuestion', { pre: function () { if (currentQ === 3) done('l3-3', { got: earnedStarsCount, max: 4 }); } });
  };
  H['l3-4'] = function () {
    wrap('evaluateMatch', { pre: function () {
      if (!selectedWordKey || !selectedMeaningText) return;
      answer('l3-4', 'w:' + selectedWordKey, 'Match the word: “' + selectedWordKey + '”', selectedMeaningText, correctPairs[selectedWordKey] === selectedMeaningText, correctPairs[selectedWordKey]);
    } });
    wrap('finishVocabularyStage', { pre: function () { done('l3-4', { got: matchedCount, max: 4 }); } });
  };
  H['l3-5'] = function () {
    wrap('finishSpeaking', { pre: function () {
      answer('l3-5', 'share', 'Share one interesting point from your group with the whole class.', ($('shareInput') || {}).value || '—', null);
      done('l3-5', {});
    } });
  };

  H['l4-1'] = function () {
    wrap('goToStoryTime', { pre: function () {
      var sel = document.querySelector('.choice-card.selected'), other = document.querySelector('#otherInputBox textarea, #otherInputBox input');
      answer('l4-1', 'q1', 'You have old toys, wires and small pieces. What would you like to make?', clean(sel) + (other && other.value.trim() ? ' — ' + other.value.trim() : ''), null);
      done('l4-1', {});
    } });
  };
  H['l4-2'] = function () {
    var v = $('storyVideo');
    if (v) {
      v.addEventListener('play', function () { setExtra('l4-2', 'videoPlayed', true); });
      v.addEventListener('ended', function () { setExtra('l4-2', 'videoEnded', true); });
    }
    wrap('checkQuizChoice', { pre: function (i) { var q = quizQuestions[currentQuizIndex]; answer('l4-2', 'q' + (currentQuizIndex + 1), q.prompt, q.options[i].text, !!q.options[i].correct); } });
    wrap('nextQuizQuestion', { pre: function () { if (currentQuizIndex === 4) done('l4-2', { got: earnedStarsCount, max: 5 }); } });
  };
  H['l4-3'] = function () {
    wrap('flipCard', { post: function (el, k) { addExtra('l4-3', 'cards', k); } });
    wrap('checkQuizChoice', { pre: function (i) { var q = quizQuestions[currentQuizIndex]; answer('l4-3', 'q' + (currentQuizIndex + 1), q.prompt, q.options[i].text, !!q.options[i].correct); } });
    wrap('nextQuizQuestion', { pre: function () { if (currentQuizIndex === 5) done('l4-3', { got: earnedStarsCount, max: 6 }); } });
  };

  H['l5-1'] = function () {
    wrap('startDialogueSection', { pre: function () {
      var t = Array.prototype.map.call(document.querySelectorAll('button.selected'), clean).join(' | ');
      answer('l5-1', 'q1', 'How do you try to balance your screen time with other activities?', t || '—', null);
    } });
    wrap('goToNextActivity', { pre: function () { done('l5-1', {}); } });
  };
  H['l5-2'] = function () {
    wrap('selectOption', { pre: function (i) { var q = speakingQuestions[currentIdx]; answer('l5-2', 's' + (currentIdx + 1), q.prompt, q.options[i].text, null); } });
    wrap('closeModalAndNext', { pre: function () { if (currentIdx === 2) done('l5-2', { got: 3, max: 3 }); } });
  };

  H['l6-1'] = function () {
    wrap('checkSelect1', { pre: function (sel) { if (sel.value) answer('l6-1', 'c1a', 'Challenge 1 · Fill the blank (1)', sel.value, sel.value === 'communicate', 'communicate'); } });
    wrap('checkSelect2', { pre: function (sel) { if (sel.value) answer('l6-1', 'c1b', 'Challenge 1 · Fill the blank (2)', sel.value, sel.value === 'technology', 'technology'); } });
    wrap('selectGroup', { pre: function (g) {
      if (!selectedWordObj) return; var it = selectedWordObj.item;
      answer('l6-1', 'w:' + it.word, 'Challenge 2 · Classify the word “' + it.word + '”', g, it.group === g, it.group);
    } });
    wrap('selectBlogOption', { pre: function (btn, ok) { answer('l6-1', 'c3', 'Challenge 3 · What is a blog?', clean(btn), !!ok); } });
    wrap('finishAllChallenges', { pre: function () { done('l6-1', { got: stars + 1, max: 3 }); } });
  };
  H['l6-2'] = function () {
    wrap('checkAnswers', { pre: function () {
      if (userAnswers.some(function (a) { return a === null; })) return; var ok = 0;
      userAnswers.forEach(function (a, i) { var c = a === correctAnswers[i]; if (c) ok++; answer('l6-2', 'b' + (i + 1), 'Blog blank (' + (i + 1) + ')', a, c, correctAnswers[i]); });
      if (ok === 9) done('l6-2', { got: 9, max: 9 });
    } });
  };
  H['l6-3'] = function () {
    wrap('submitBlogMission', { pre: function () {
      var t = $('blogTextArea').value.trim(), n = t ? t.split(/\s+/).length : 0;
      answer('l6-3', 'blog', 'Write a blog (90–100 words): “A Day in the Life of a Gen-Alpha Teen”', t, null);
      done('l6-3', { extra: { wordCount: n } });
    } });
  };
  H['l6-4'] = function () {
    wrap('submitAssessment', { post: function () {
      var m = $('resultsModal'); if (!m || m.classList.contains('hidden')) return;
      var g = 0, v = function (id) { return ($(id) || {}).value || ''; };
      var q1 = v('readQ1').trim(), q2 = v('readQ2').trim();
      var ok1 = ['watching', 'videos', 'creating', 'content', 'chatting', 'friends', 'emojis', 'memes'].filter(function (w) { return q1.toLowerCase().indexOf(w) >= 0; }).length >= 2;
      var ok2 = ['balance', 'screen', 'digital', 'skills'].some(function (w) { return q2.toLowerCase().indexOf(w) >= 0; });
      if (ok1) g++; if (ok2) g++;
      answer(FINAL_ID, 'r1', 'A-a. What things does Gen Alpha like doing online? Name two.', q1, ok1, 'watching videos / creating content / chatting with friends');
      answer(FINAL_ID, 'r2', 'A-b. Why do you think parents want to limit screen time?', q2, ok2, 'to balance screen time and learn digital skills');
      var vw = ['digital native', 'trend', 'emoji', 'connect', 'screen time'], vk = { voc1: 'C', voc2: 'A', voc3: 'D', voc4: 'E', voc5: 'B' };
      Object.keys(vk).forEach(function (k, i) { var ok = v(k) === vk[k]; if (ok) g++; answer(FINAL_ID, k, 'B-' + (i + 1) + '. Vocabulary: ' + vw[i], v(k), ok, vk[k]); });
      var lp = ['Heba (used / is using) social media now.', 'Right now, Ahmed (watches / is watching) short videos.', 'Look! They (share / are sharing) memes with their friends.', 'I (do / am doing) my homework online at the moment.', 'I (visit / am visiting) my grandma next Monday.'];
      var lk = { lang1: 'is using', lang2: 'is watching', lang3: 'are sharing', lang4: 'am doing', lang5: 'am visiting' };
      Object.keys(lk).forEach(function (k, i) { var ok = v(k) === lk[k]; if (ok) g++; answer(FINAL_ID, k, 'C-' + (i + 1) + '. ' + lp[i], v(k), ok, lk[k]); });
      done(FINAL_ID, { got: g, max: 12, extra: { finishedAt: Date.now() } });
    } });
  };

  /* ============================ التهيئة ============================ */
  var PID = null, BLOCKED = false;
  (function early() {
    var file = decodeURIComponent((location.pathname.split('/').pop() || '').trim());
    var s = session();
    if (BY_FILE[file]) PID = BY_FILE[file].id;
    var protectedPage = PID || /^(index|contents|stats|dashboard)\.html$/.test(file);
    var go = function (u) { BLOCKED = true; document.documentElement.style.visibility = 'hidden'; location.replace(u); };
    if (protectedPage && !s) return go('signin.html');
    if (!s) return;
    if (s.role === 'student') {
      if (file === 'dashboard.html') return go('contents.html');
      if (PID) { var r = me(), li = LESSON_OF[PID]; if (!unlocked(r, li)) return go('contents.html?locked=' + LESSONS[li].n); }
    } else if (s.role === 'teacher') {
      if (file === 'stats.html') return go('dashboard.html');
    }
  })();

  function init() {
    if (BLOCKED) return;
    injectStyle();
    var bodyPid = document.body.getAttribute('data-ga-page') || PID;
    var s = session();
    if (!bodyPid) { fillHeader(); return; }
    injectBar();
    if (s && s.role === 'student') {
      visit(bodyPid);
      setInterval(function () { if (!document.hidden) mutate(function (r) { pg(r, bodyPid).time += 5; }); }, 5000);
    }
    if (H[bodyPid]) { try { H[bodyPid](); } catch (e) { console.warn('GA hook', bodyPid, e); } }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* ============================ API عامة ============================ */
  window.GA = {
    LESSONS: LESSONS, PAGES: PAGES, BY_ID: BY_ID, FINAL_ID: FINAL_ID, syncOn: syncOn,
    answer: answer, done: done, setExtra: setExtra, addExtra: addExtra,
    session: session, me: me, db: db, saveDb: saveDb, loadAll: loadAll, mergeInto: mergeInto, push: push, flush: flush,
    loginStudent: loginStudent, loginTeacher: loginTeacher, logout: logout, makeId: makeId,
    status: status, isDone: isDone, lessonDone: lessonDone, lessonCount: lessonCount, unlocked: unlocked, resumePage: resumePage,
    progress: progress, stars: starsSum, skippedList: skippedList, furthestPage: furthestPage, finalResult: finalResult,
    report: report, renderAnswers: renderAnswers, fillHeader: fillHeader, injectStyle: injectStyle,
    ago: ago, fmtDate: fmtDate, fmtTime: fmtTime, esc: esc, download: download, toCSV: toCSV
  };
})();
