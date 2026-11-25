'use strict';
/* ResumeForge AI - Full-Stack Frontend wired to Express + MongoDB + JWT */
const API = 'http://localhost:5000/api';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
function toast(m, err) {
  const t = $('#toast');
  t.textContent = m;
  t.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.className = 'toast'; }, 2800);
}

/* ---------- API helper ---------- */
const getToken = () => localStorage.getItem('rf-token');
const setToken = t => t ? localStorage.setItem('rf-token', t) : localStorage.removeItem('rf-token');

async function api(path, method = 'GET', body = null) {
  const token = getToken();
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    setToken(null);
    S.loaded = false;
    location.hash = '#/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/* ---------- static data ---------- */
const TEMPLATES = [['classic', 'Classic'], ['modern', 'Modern'], ['minimal', 'Minimal'], ['bold', 'Bold']];
const ROLES = {
  'Frontend Developer': {
    skills: [['HTML', 'High'], ['CSS', 'High'], ['JavaScript', 'High'], ['React', 'High'], ['TypeScript', 'Medium'], ['REST APIs', 'Medium'], ['Testing', 'Medium'], ['Git', 'Low']],
    tasks: {
      Skills: ['Finish a React fundamentals course', 'Practice REST API calls with fetch'],
      Projects: ['Build a project that uses a public API', 'Add tests to one existing project'],
      Resume: ['Tailor your summary to this role', 'Add GitHub and live demo links'],
      Interview: ['Review closures and the event loop', 'Practice explaining one project in two minutes']
    }
  },
  'Data Analyst': {
    skills: [['SQL', 'High'], ['Excel', 'High'], ['Python', 'High'], ['Statistics', 'Medium'], ['Tableau', 'Medium'], ['Power BI', 'Medium'], ['Data Visualization', 'Low']],
    tasks: {
      Skills: ['Practice joins and window functions in SQL', 'Learn one BI tool'],
      Projects: ['Analyse a public dataset and write up findings', 'Build a dashboard'],
      Resume: ['Describe analysis projects with the question, method and result', 'Add a portfolio link'],
      Interview: ['Practice a SQL case study', 'Prepare a data storytelling example']
    }
  },
  'Backend Developer': {
    skills: [['Node.js', 'High'], ['SQL', 'High'], ['REST APIs', 'High'], ['Git', 'Medium'], ['Docker', 'Medium'], ['Testing', 'Medium'], ['Authentication', 'Low']],
    tasks: {
      Skills: ['Build a REST API with Node.js', 'Learn basic Docker usage'],
      Projects: ['Create a CRUD API with a database', 'Add automated tests'],
      Resume: ['List backend projects with the stack used', 'Add a GitHub link'],
      Interview: ['Review HTTP and REST basics', 'Practice a simple system design question']
    }
  }
};
const SAMPLE = {
  name: 'Aarav Sharma', title: 'Full-Stack Developer', email: 'aarav@example.com', phone: '+91 98765 43210', location: 'Pune, India',
  summary: 'B.Tech CSE student building responsive web apps with a focus on clean UI and accessible design.',
  education: [{ school: 'ABC Institute of Technology', degree: 'B.Tech Computer Science', year: '2022 - 2026' }],
  experience: [{ company: 'Demo Labs', role: 'Frontend Intern', period: 'Jun 2025 - Aug 2025', details: 'Built dashboard components and cut page load time by 30%.' }],
  projects: [{ name: 'TaskFlow', tech: 'JavaScript, CSS', details: 'Kanban board with drag and drop and sync.' }],
  skills: 'HTML, CSS, JavaScript, Git, SQL', certs: 'Front-End Developer course', achievements: 'Finalist, College Hackathon 2025', languages: 'English, Hindi'
};
const BLANK = { education: { school: '', degree: '', year: '' }, experience: { company: '', role: '', period: '', details: '' }, projects: { name: '', tech: '', details: '' } };
const LABELS = { school: 'School', degree: 'Degree', year: 'Years', company: 'Company', role: 'Role', period: 'Period', details: 'Details', name: 'Name', tech: 'Technologies' };
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];
const TERMS = ['html', 'css', 'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql', 'mongodb', 'git', 'docker', 'rest apis', 'testing', 'jest', 'tailwind css', 'redux', 'next.js', 'aws', 'excel', 'tableau', 'power bi', 'statistics', 'agile', 'ci/cd', 'graphql', 'linux', 'communication', 'teamwork'];
const ANALYSIS = { score: 78, strengths: ['Clear project descriptions', 'Relevant technical skills listed', 'Concise one-page length'], missing: ['Certifications', 'Quantified achievements', 'LinkedIn / GitHub links'], tips: ['Start bullet points with action verbs.', 'Add numbers to show impact where they are true.', 'Add a short professional summary.'], skills: ['HTML', 'CSS', 'JavaScript', 'Git', 'SQL'] };
const FAQ = [
  ['How do I make a resume for a different role?', 'Open My Resumes, create a new version with its own target role, then edit it in Resume Studio.'],
  ['How do I download a PDF?', 'In Resume Studio click Download PDF and choose "Save as PDF" in the print dialog.'],
  ['Where is my data saved?', 'Your resumes, progress, and applications are securely saved in MongoDB under your account.'],
  ['Does a high score guarantee interviews or ATS success?', 'No. All scores are estimates for practice, not predictions.']
];

/* ---------- state ---------- */
const S = {
  loaded: false,
  versions: [],
  active: null,
  apps: [],
  prog: {},
  done: {},
  profile: { name: '', email: '' },
  last: null
};
const act = () => S.versions.find(v => v._id === S.active) || S.versions[0];
const UI = {
  authMode: 'login', authBusy: false, authErr: '',
  collapsed: false, menu: false, lmenu: false, flt: 'All', file: null, busy: false, done: false,
  mres: null, mbusy: false, mf: { title: '', company: '', jd: '' },
  wa: { tool: 'summary', inp: '', sug: null }, tf: null, tfErr: ''
};
const blankTF = () => ({ _id: null, company: '', title: '', date: '', status: 'Applied', interview: '', notes: '', resume: '' });
UI.tf = blankTF();

/* ---------- backend sync helpers ---------- */
async function loadAppData() {
  if (!getToken()) return;
  try {
    const [me, resumes, apps] = await Promise.all([
      api('/auth/me'),
      api('/resumes'),
      api('/applications')
    ]);
    S.profile = { name: me.name || '', email: me.email || '' };
    S.prog = me.skillProgress || {};
    S.done = me.roadmapDone || {};
    S.last = me.lastMatch && me.lastMatch.score != null ? me.lastMatch : null;
    S.versions = resumes.map(r => ({
      ...r,
      data: {
        name: '', title: '', email: '', phone: '', location: '', summary: '',
        education: [], experience: [], projects: [], skills: '', certs: '', achievements: '', languages: '',
        ...(r.data || {})
      }
    }));
    S.active = me.activeResumeId || (S.versions[0] && S.versions[0]._id) || null;
    S.apps = apps;
    S.loaded = true;
    render(1);
  } catch (err) {
    toast(err.message, true);
  }
}

let resumeTimer = null;
function syncResume(immediate = false) {
  const v = act();
  if (!v || !v._id) return;
  const run = () => api(`/resumes/${v._id}`, 'PUT', {
    name: v.name, role: v.role, template: v.template, data: v.data
  }).catch(err => toast(err.message, true));

  clearTimeout(resumeTimer);
  if (immediate) run();
  else resumeTimer = setTimeout(run, 500);
}

function syncProgress() {
  api('/progress', 'PUT', {
    skillProgress: S.prog,
    roadmapDone: S.done,
    lastMatch: S.last,
    activeResumeId: S.active
  }).catch(err => toast(err.message, true));
}

/* ---------- career logic ---------- */
function quality(r) {
  const sk = (r.skills || '').split(',').filter(x => x.trim()).length;
  const c = [
    ['Add a professional summary', (r.summary || '').length > 40],
    ['Add at least two projects', (r.projects || []).length >= 2],
    ['Add work experience', (r.experience || []).length > 0],
    ['List five or more skills', sk >= 5],
    ['Add certifications', !!(r.certs || '').trim()],
    ['Add achievements', !!(r.achievements || '').trim()],
    ['Add education', (r.education || []).length > 0],
    ['Include email and phone', !!(r.email && r.phone)],
    ['Show real results with numbers in your bullets', /\d/.test((r.experience || []).map(e => e.details).join(' '))]
  ];
  return { checks: c, score: Math.round(100 * c.filter(x => x[1]).length / c.length) };
}
const tasksOf = role => Object.entries(ROLES[role].tasks).flatMap(([c, l]) => l.map(t => ({ id: role + ':' + t, c, t })));
function ctx() {
  const v = act(), r = v.data, role = v.role;
  const have = new Set((r.skills || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean));
  const rows = ROLES[role].skills.map(([n, p]) => {
    const h = have.has(n.toLowerCase()) || (S.prog[n] || 0) >= 100;
    return { n, p, have: h, pct: h ? 100 : (S.prog[n] || 0) };
  });
  const q = quality(r), tasks = tasksOf(role);
  const coverage = Math.round(100 * rows.filter(x => x.have).length / rows.length);
  const road = Math.round(100 * tasks.filter(t => S.done[t.id]).length / tasks.length);
  return { v, r, role, rows, q, tasks, coverage, road, readiness: Math.round(.4 * coverage + .3 * q.score + .3 * road) };
}
const hasTerm = (t, x) => new RegExp('(^|[^a-z+#.])' + x.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '($|[^a-z+#])').test(t);

/* ---------- ui helpers ---------- */
const bar = v => `<div class="bar"><i style="width:${Math.min(100, v)}%"></i></div>`;
const ring = (v, s = 96, dark) => `<div class="ring${dark ? ' dark' : ''}" style="--v:${v * 3.6}deg;--s:${s}px"><span>${v}</span></div>`;
const pill = (t, tone = '') => `<span class="pill ${tone}">${esc(t)}</span>`;
const opts = (arr, sel) => arr.map(a => { const [v, l] = Array.isArray(a) ? a : [a, a]; return `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(l)}</option>`; }).join('');
const roleOpts = sel => opts(Object.keys(ROLES), sel);
const verOpts = sel => opts(S.versions.map(v => [v._id, v.name]), sel);
function resumeHTML(d, t, small) {
  const sec = (n, b) => b ? `<section><h4>${n}</h4>${b}</section>` : '';
  const L = s => (s || '').split(',').map(x => x.trim()).filter(Boolean).map(esc).join(' · ');
  return `<div class="resume t-${t || 'classic'}${small ? ' sm' : ''}"><header><h2>${esc(d.name) || 'Your Name'}</h2><p class="rt">${esc(d.title)}</p><p class="rc">${[d.email, d.phone, d.location].filter(Boolean).map(esc).join(' | ')}</p></header>`
    + sec('Summary', d.summary ? `<p>${esc(d.summary)}</p>` : '')
    + sec('Experience', (d.experience || []).map(e => `<p><b>${esc(e.role)}</b>, ${esc(e.company)} <i>(${esc(e.period)})</i><br>${esc(e.details)}</p>`).join(''))
    + sec('Projects', (d.projects || []).map(p => `<p><b>${esc(p.name)}</b> <i>${esc(p.tech)}</i><br>${esc(p.details)}</p>`).join(''))
    + sec('Education', (d.education || []).map(e => `<p><b>${esc(e.degree)}</b>, ${esc(e.school)} <i>(${esc(e.year)})</i></p>`).join(''))
    + sec('Skills', L(d.skills) ? `<p>${L(d.skills)}</p>` : '')
    + sec('Certifications', d.certs ? `<p>${esc(d.certs)}</p>` : '')
    + sec('Achievements', d.achievements ? `<p>${esc(d.achievements)}</p>` : '')
    + sec('Languages', d.languages ? `<p>${esc(d.languages)}</p>` : '') + '</div>';
}

/* ---------- auth page ---------- */
function loginPage() {
  const isReg = UI.authMode === 'register';
  return `<header class="lnav"><div class="wrap"><a class="logo" href="#/"><b>✦</b>ResumeForge AI</a><nav><a href="#/">Back to Home</a></nav></div></header>
  <main class="wrap" style="max-width:440px;padding:64px 16px">
    <form class="card stack" data-submit="auth">
      <h2>${isReg ? 'Create your account' : 'Welcome back'}</h2>
      <p class="muted">${isReg ? 'Sign up to save your resumes and track applications.' : 'Log in to access your ResumeForge workspace.'}</p>
      ${isReg ? `<label>Full name<input id="aname" required placeholder="Aarav Sharma"></label>` : ''}
      <label>Email<input id="aemail" type="email" required placeholder="you@example.com"></label>
      <label>Password<input id="apass" type="password" required minlength="6" placeholder="••••••••"></label>
      ${UI.authErr ? `<p class="err" role="alert">${esc(UI.authErr)}</p>` : ''}
      <button class="btn block" type="submit"${UI.authBusy ? ' disabled' : ''}>${UI.authBusy ? '<span class="spin"></span> Please wait...' : (isReg ? 'Create Account' : 'Log In')}</button>
      <p class="muted" style="text-align:center;margin-top:8px">
        ${isReg ? 'Already have an account?' : "Don't have an account?"}
        <button type="button" style="background:none;border:0;color:var(--brand);font:inherit;font-weight:600;cursor:pointer" data-act="toggleAuth">${isReg ? 'Log In' : 'Sign Up'}</button>
      </p>
    </form>
  </main>`;
}

/* ---------- landing page ---------- */
function landing() {
  const feats = [['✎', 'AI Resume Builder', 'Fill in your details and see your resume update live.'], ['⌕', 'Smart Resume Analyzer', 'Upload a PDF and get a clear sample report.'], ['◎', 'Job Match', 'Compare your resume with a job description.'], ['✍', 'AI Writing Assistant', 'Rewrite bullet points more clearly, using only your facts.'], ['✦', 'Skill Gap Navigator', 'See which skills your target role needs.'], ['☰', 'Application Hub', 'Track every application and interview.']];
  const steps = ['Enter your details', 'Choose a template', 'Improve your resume', 'Download your resume'];
  const d = SAMPLE;
  const loggedIn = !!getToken();
  return `<header class="lnav"><div class="wrap"><a class="logo" href="#/"><b>✦</b>ResumeForge AI</a><button class="burger" data-act="lmenu" aria-label="Menu">☰</button>
  <nav class="${UI.lmenu ? 'open' : ''}"><button data-act="goto" data-id="top">Home</button><button data-act="goto" data-id="features">Features</button><button data-act="goto" data-id="templates">Templates</button><button data-act="goto" data-id="how">How It Works</button><a href="#/${loggedIn ? 'dashboard' : 'login'}">${loggedIn ? 'Dashboard' : 'Login'}</a><a class="btn" href="#/${loggedIn ? 'builder' : 'login'}">Get Started</a></nav></div></header>
  <main id="top"><div class="wrap hero"><div><span class="badge">Your Career. Your Next Opportunity.</span><h1>Your Next Career Move Starts With a Better Resume.</h1>
  <p class="muted" style="font-size:1rem;margin:16px 0 22px">Create standout resumes, understand your skill gaps, and build a smarter path toward your next opportunity.</p><div class="row"><a class="btn" href="#/builder">Build My Resume</a><button class="btn ghost" data-act="goto" data-id="features">Explore Features</button></div></div>
  <div class="card" style="box-shadow:0 20px 40px rgba(24,39,71,.12)"><div class="dots"><i></i><i></i><i></i></div><div class="dark-box" style="margin-top:12px">${ring(72, 80, 1)}<div><b>Career Readiness</b><p class="small" style="color:#94a3b8">Sample data</p></div></div>
  <div class="stack small" style="margin-top:14px">${[['JavaScript', 70], ['React', 40], ['Testing', 20]].map(([n, v]) => `<div><div class="row between"><span>${n}</span><span>${v}%</span></div>${bar(v)}</div>`).join('')}</div>
  <div style="background:var(--tint);border-radius:12px;padding:12px;margin-top:14px" class="small"><b>Your Next Best Actions</b><p>• Add two relevant projects</p><p>• Improve your professional summary</p></div></div></div>
  <div class="wrap"><div class="card grid g3" style="text-align:center">${[['4', 'Resume templates'], ['6', 'Career tools'], ['Cloud', 'Synced with MongoDB']].map(([v, l]) => `<div><div class="big">${v}</div><div class="muted">${l}</div></div>`).join('')}</div></div>
  <section class="wrap sec" id="features"><h2>Everything you need to apply with confidence</h2><div class="grid g3" style="margin-top:20px">${feats.map(f => `<div class="card"><div class="pill" style="font-size:1rem;margin-bottom:10px">${f[0]}</div><h3>${f[1]}</h3><p class="muted">${f[2]}</p></div>`).join('')}</div></section>
  <section class="wrap sec" id="how"><h2>How it works</h2><div class="grid g4" style="margin-top:20px">${steps.map((s, i) => `<div class="card"><div class="step">${i + 1}</div><h3>Step ${i + 1}</h3><p class="muted">${s}.</p></div>`).join('')}</div></section>
  <section class="wrap sec" id="templates"><h2>Resume templates</h2><div class="grid g4" style="margin-top:20px">${TEMPLATES.map(([id, n]) => `<div class="card">${resumeHTML(d, id, 1)}<h3 style="margin-top:12px">${n}</h3><div class="row"><button class="btn ghost" style="flex:1" data-act="usetpl" data-id="${id}">Preview</button><button class="btn" style="flex:1" data-act="usetpl" data-id="${id}">Use</button></div></div>`).join('')}</div></section>
  <section class="wrap sec"><h2>FAQ</h2><div class="stack" style="margin-top:20px">${FAQ.map(([q, a]) => `<details class="card"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section></main>
  <footer class="foot"><div class="wrap grid g3"><div><a class="logo" href="#/"><b>✦</b>ResumeForge AI</a><p class="muted" style="margin-top:8px">Full-stack Resume Builder powered by Express & MongoDB.</p></div><div><b>Product</b><a href="#/builder">Resume Studio</a><a href="#/matcher">Job Match</a><a href="#/tracker">Application Hub</a></div><div><b>Support</b><a href="#/help">Help & Support</a><a href="#/settings">Settings</a></div></div></footer>`;
}

/* ---------- app shell ---------- */
const NAV = [
  ['Workspace', [['dashboard', 'Overview', '⌂'], ['resumes', 'My Resumes', '▤'], ['builder', 'Resume Studio', '✎'], ['analyzer', 'Resume Analyzer', '⌕']]],
  ['Career Intelligence', [['matcher', 'Job Match', '◎'], ['skills', 'Skill Navigator', '✦'], ['writing', 'AI Writing Assistant', '✍'], ['roadmap', 'Career Roadmap', '⚑']]],
  ['Opportunities', [['tracker', 'Application Hub', '☰']]],
  ['Account', [['settings', 'Settings', '⚙'], ['help', 'Help & Support', '?']]]
];
function shell(route, body) {
  return `<div class="shell"><div class="mtop"><span>ResumeForge AI</span><button data-act="menu" aria-label="Menu">☰</button></div>
  <aside class="side${UI.collapsed ? ' col' : ''}${UI.menu ? ' open' : ''}">
    <div class="top"><a href="#/">${UI.collapsed ? '✦' : 'ResumeForge AI'}</a><button data-act="collapse" aria-label="Collapse sidebar">⇔</button></div>
    <nav>
      ${NAV.map(([g, it]) => `<div class="gl">${g}</div>` + it.map(([r, l, i]) => `<a class="nav${r === route ? ' on' : ''}" href="#/${r}" title="${l}"><span class="ic">${i}</span><span class="lbl">${l}</span></a>`).join('')).join('')}
      <button class="nav" style="width:100%;background:none;border:0;color:#fca5a5;cursor:pointer;margin-top:12px" data-act="logout" title="Logout"><span class="ic">⎋</span><span class="lbl">Logout</span></button>
    </nav>
  </aside><main class="main">${body}</main></div>`;
}

/* ---------- pages ---------- */
function dashboard() {
  const c = ctx();
  const acts = [...c.q.checks.filter(x => !x[1]).slice(0, 2).map(x => [x[0], 'builder']), ...c.rows.filter(x => !x.have && x.p === 'High').slice(0, 2).map(x => ['Develop ' + x.n + ' (high priority for this role)', 'skills']), ...c.tasks.filter(t => !S.done[t.id]).slice(0, 1).map(t => [t.t, 'roadmap']), ['Match your resume to a job description', 'matcher']].slice(0, 5);
  const crit = [['Skill coverage', '40%', c.coverage], ['Resume quality', '30%', c.q.score], ['Roadmap progress', '30%', c.road]];
  return `<div class="page"><div class="row between"><div><h1>Welcome back, ${esc(S.profile.name || 'there')}</h1><p class="muted">Your career progress at a glance.</p></div><div class="row"><label class="muted" for="role">Target role</label><select id="role" class="auto" data-change="role">${roleOpts(c.role)}</select><a class="btn" href="#/resumes">+ New resume</a></div></div>
  <div class="grid g2"><div class="card" style="background:var(--deep);color:#fff;border:0"><div class="row" style="gap:20px;flex-wrap:nowrap">${ring(c.readiness, 110, 1)}<div><h3 style="color:#fff">Career Readiness Score</h3><p class="small" style="color:#94a3b8">Calculated from skill coverage, resume quality, and roadmap progress.</p></div></div><div class="stack small" style="margin-top:16px">${crit.map(([n, w, v]) => `<div><div class="row between"><span>${n} <span style="color:#94a3b8">(${w})</span></span><span>${v}%</span></div>${bar(v)}</div>`).join('')}</div></div>
  <div class="card"><h3>Your Next Best Actions</h3><ul class="list">${acts.map(([t, h]) => `<li><a href="#/${h}"><span>${esc(t)}</span><span>→</span></a></li>`).join('')}</ul></div></div>
  <div class="grid g3"><div class="card"><div class="muted">Resume quality</div><div class="big">${c.q.score}</div><a class="muted" href="#/builder" style="color:var(--brand)">Improve in Resume Studio</a></div><div class="card"><div class="muted">Latest job match</div><div class="big">${S.last ? S.last.score + '%' : '-'}</div><a class="muted" href="#/matcher" style="color:var(--brand)">${S.last ? esc(S.last.title) : 'Run your first match'}</a></div><div class="card"><div class="muted">Profile strength</div><div class="big">${Math.round((c.q.score + c.coverage) / 2)}</div><a class="muted" href="#/skills" style="color:var(--brand)">Open Skill Navigator</a></div></div>
  <div class="grid g2"><div class="card"><h3>Skill coverage for ${esc(c.role)}</h3><div class="stack">${c.rows.map(x => `<div><div class="row between small"><span>${esc(x.n)} ${pill(x.p, x.p === 'High' ? 'warn' : '')}</span><span class="muted">${x.pct}%</span></div>${bar(x.pct)}</div>`).join('')}</div></div>
  <div class="stack"><div class="card"><h3>Roadmap: ${c.road}% complete</h3>${bar(c.road)}${c.tasks.filter(t => !S.done[t.id]).slice(0, 3).map(t => `<p class="muted" style="margin-top:8px">• ${esc(t.t)}</p>`).join('')}<p style="margin-top:8px"><a class="small" style="color:var(--brand)" href="#/roadmap">View roadmap</a></p></div>
  <div class="card"><h3>Your resumes</h3><ul class="list">${S.versions.map(v => `<li><a href="#/resumes"><span>${esc(v.name)}</span><span class="muted">${esc(v.role)}</span></a></li>`).join('')}</ul></div></div></div></div>`;
}

function resumes() {
  return `<div class="page"><div><h1>My Resumes</h1><p class="muted">Keep one version per target role. Personal details carry over when you start fresh.</p></div>
  <form class="card form c4" data-submit="create"><label>Version name<input id="nv" placeholder="e.g. Backend Developer resume"></label><label>Target role<select id="nr">${roleOpts('Frontend Developer')}</select></label><label style="align-self:end;padding-bottom:10px"><input type="checkbox" id="nc" checked>Copy content from current resume</label><div style="align-self:end"><button class="btn block" type="submit">+ Create version</button></div></form>
  <div class="grid g3">${S.versions.map(v => `<div class="card${v._id === S.active ? ' hl' : ''}"><div style="height:190px;overflow:hidden;pointer-events:none;border:1px solid var(--line);border-radius:10px;margin-bottom:12px">${resumeHTML(v.data, v.template, 1)}</div><div class="row between"><b>${esc(v.name)}</b>${v._id === S.active ? pill('Active', 'ok') : ''}</div><p class="muted">${esc(v.role)} · quality ${quality(v.data).score}</p>
  <div class="row" style="margin-top:10px"><button class="btn" style="flex:1" data-act="editver" data-id="${v._id}">Edit</button><button class="btn ghost" data-act="dupver" data-id="${v._id}">Duplicate</button><button class="btn danger" data-act="delver" data-id="${v._id}"${S.versions.length < 2 ? ' disabled' : ''}>Delete</button></div></div>`).join('')}</div></div>`;
}

function builder() {
  const v = act(), d = v.data;
  const inp = (l, k, c = '') => `<label class="${c}">${l}<input data-bind="${k}" value="${esc(d[k])}"></label>`;
  const ta = (l, k, r) => `<label>${l}<textarea rows="${r || 2}" data-bind="${k}">${esc(d[k])}</textarea></label>`;
  const list = (k, title) => `<div class="card"><div class="row between"><h3>${title}</h3><button class="btn ghost" data-act="add" data-k="${k}">+ Add</button></div>${d[k].length ? '' : '<p class="muted">No entries yet. Click Add to create one.</p>'}${d[k].map((it, i) => `<div class="sub">${Object.keys(BLANK[k]).map(f => `<label class="${f === 'details' ? 'full' : ''}">${LABELS[f]}<input data-list="${k}" data-i="${i}" data-f="${f}" value="${esc(it[f])}"></label>`).join('')}<button class="btn danger full" data-act="del" data-k="${k}" data-i="${i}">Remove</button></div>`).join('')}</div>`;
  return `<div class="page" style="max-width:1280px"><div class="builder"><div class="stack"><h1>Resume Studio</h1>
  <div class="card form c2"><h3 class="full">Personal information</h3>${inp('Full name', 'name')}${inp('Job title', 'title')}${inp('Email', 'email')}${inp('Phone', 'phone')}${inp('Location', 'location', 'full')}</div>
  <div class="card">${ta('Professional summary', 'summary', 3)}</div>${list('education', 'Education')}${list('experience', 'Work experience')}${list('projects', 'Projects')}
  <div class="card stack"><h3>Skills and more</h3>${ta('Skills (comma separated)', 'skills')}${ta('Certifications', 'certs')}${ta('Achievements', 'achievements')}${ta('Languages', 'languages')}</div></div>
  <div class="sticky stickywrap"><div class="row"><select class="auto" aria-label="Resume version" data-change="setver">${verOpts(v._id)}</select>${TEMPLATES.map(([id, n]) => `<button class="tab${v.template === id ? ' on' : ''}" data-act="tpl" data-id="${id}">${n}</button>`).join('')}<button class="btn" style="margin-left:auto" data-act="pdf">⬇ Download PDF</button></div><div id="preview">${resumeHTML(d, v.template)}</div></div></div></div>`;
}

function analyzer() {
  const A = ANALYSIS, f = UI.file;
  const L = (t, a, c) => `<div class="card"><h3>${t}</h3>${a.map(i => `<p class="muted" style="color:${c}">• ${i}</p>`).join('')}</div>`;
  return `<div class="page narrow"><div><h1>Resume Analyzer</h1><p class="muted">Demo analyzer: upload a PDF to preview a sample report.</p></div>
  <div class="card drop" id="drop" data-act="browse"><div style="font-size:1.6rem">⬆</div><p>Drag and drop a PDF here, or click to browse</p><p><b>${f ? esc(f.name) : 'No file selected'}</b></p><input type="file" id="pdf" accept="application/pdf" hidden data-change="pick"></div>
  <button class="btn" data-act="analyze"${UI.busy ? ' disabled' : ''}>${UI.busy ? '<span class="spin"></span> Analyzing...' : 'Analyze Resume'}</button>
  ${UI.done ? `<div class="card row" style="gap:20px">${ring(A.score, 96)}<p class="muted">Simulated score for demo purposes.</p></div><div class="grid g2">${L('Strengths', A.strengths, '#166534')}${L('Missing sections', A.missing, '#b45309')}${L('Improvement suggestions', A.tips, 'inherit')}<div class="card"><h3>Skills identified</h3><div class="chips">${A.skills.map(s => pill(s)).join('')}</div></div></div>` : (UI.busy ? '' : '<p class="muted">Your report will appear here after you analyze a resume.</p>')}</div>`;
}

function matchHTML(r) {
  if (!r) return '<p class="muted">Results appear here after you analyze a job description.</p>';
  return `<div class="row between"><div><div class="muted">Compatibility estimate</div><div class="big">${r.score}%</div></div><div class="muted" style="text-align:right">Keyword coverage<br><b>${r.cov}%</b></div></div>${bar(r.score)}
  <h3 style="margin-top:16px">Skill comparison</h3>${r.req.map(t => `<div class="cmp"><span>${esc(t)}</span><div class="${r.m.includes(t) ? 'm' : 'x'}"></div>${pill(r.m.includes(t) ? 'On resume' : 'Missing', r.m.includes(t) ? 'ok' : 'warn')}</div>`).join('')}
  <h3 style="margin-top:16px">Sections to improve</h3><ul class="muted">${r.weak.map(w => `<li>${esc(w)}</li>`).join('') || '<li>Core sections look complete.</li>'}</ul>
  <h3 style="margin-top:12px">Suggestions</h3><ul class="muted">${r.x.slice(0, 4).map(t => `<li>Add ${esc(t)} only if you have genuinely used it, for example in a project.</li>`).join('')}<li>Avoid keyword stuffing. Describe real work in plain language.</li></ul>`;
}
function matcher() {
  const c = ctx(), f = UI.mf;
  return `<div class="page"><div><h1>Job Match</h1><p class="muted">Compares keywords from the job post with the selected resume version.</p></div>
  <div class="grid g2"><div class="card stack"><label>Resume version<select data-change="setver">${verOpts(c.v._id)}</select></label><label>Target role<select data-change="role">${roleOpts(c.role)}</select></label>
  <label>Job title<input data-mf="title" value="${esc(f.title)}"></label><label>Company<input data-mf="company" value="${esc(f.company)}"></label><label>Job description<textarea rows="8" data-mf="jd" placeholder="Paste the job description here...">${esc(f.jd)}</textarea></label>
  <button class="btn" data-act="match"${UI.mbusy ? ' disabled' : ''}>${UI.mbusy ? '<span class="spin"></span> Analyzing...' : 'Analyze Match'}</button></div><div class="card" id="mres">${matchHTML(UI.mres)}</div></div></div>`;
}

function skills() {
  const c = ctx();
  const todo = c.rows.filter(x => !x.have).sort((a, b) => 'HighMediumLow'.indexOf(a.p) - 'HighMediumLow'.indexOf(b.p));
  return `<div class="page narrow"><div class="row between"><div><h1>Skill Navigator</h1><p class="muted">Skills on your resume count as existing. Track the rest as you learn.</p></div><select class="auto" aria-label="Target role" data-change="role">${roleOpts(c.role)}</select></div>
  <div class="card"><div class="row between"><b>Skill coverage</b><span>${c.coverage}%</span></div>${bar(c.coverage)}<div class="chips" style="margin-top:12px"><b class="small">Existing:</b>${c.rows.filter(x => x.have).map(x => pill(x.n, 'ok')).join('') || '<span class="muted">None yet. Add skills in Resume Studio.</span>'}</div></div>
  <h2 style="font-size:1.1rem">Skills to develop</h2>${todo.length ? '' : '<div class="card muted">You cover every skill for this role. Try another target role.</div>'}
  ${todo.map(x => `<div class="card"><div class="row between"><b>${esc(x.n)} ${pill(x.p + ' priority', x.p === 'High' ? 'warn' : '')}</b><span class="muted">${x.pct}%</span></div><p class="muted" style="margin:6px 0">Suggested action: learn the basics of ${esc(x.n)}, use it in one small project, then add it to your resume.</p>${bar(x.pct)}<div class="row" style="margin-top:10px">${[25, 50, 75].map(v => `<button class="btn ghost" data-act="prog" data-n="${esc(x.n)}" data-v="${v}">${v}%</button>`).join('')}<button class="btn" data-act="prog" data-n="${esc(x.n)}" data-v="100">Mark as learned</button></div></div>`).join('')}</div>`;
}

const VERBS = ['Built', 'Designed', 'Implemented', 'Developed', 'Analysed', 'Improved', 'Led', 'Automated', 'Collaborated', 'Delivered'];
const WEAK = [[/^worked on/i, 'Built'], [/^helped (with |to )?/i, 'Supported '], [/^responsible for/i, 'Managed'], [/^made/i, 'Created'], [/^did/i, 'Completed'], [/^was part of/i, 'Contributed to']];
function improve(t) { let s = t.trim(); if (!s) return ''; for (const [r, v] of WEAK) if (r.test(s)) { s = s.replace(r, v); break; } s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!]$/.test(s) ? s : s + '.'; }
const TOOLS = { summary: 'Professional summary', experience: 'Experience description', project: 'Project description', achievement: 'Achievement' };
function writing() {
  const w = UI.wa;
  return `<div class="page narrow"><div><h1>AI Writing Assistant</h1><p class="muted">Rewrites bullet points more clearly using your own facts.</p></div>
  <div class="chips">${Object.entries(TOOLS).map(([k, l]) => `<button class="tab${w.tool === k ? ' on' : ''}" data-act="wtool" data-id="${k}">${l}</button>`).join('')}</div>
  <div class="card stack">${w.tool === 'summary' ? '<p class="muted">Builds a draft from your title, skills and projects in Resume Studio.</p>' : `<label>${TOOLS[w.tool]} (your original text)<textarea rows="3" data-wa="inp" placeholder="e.g. worked on a website for the college fest">${esc(w.inp)}</textarea></label>`}<div><button class="btn" data-act="suggest">Suggest improvement</button></div></div>
  ${w.sug ? `<div class="grid g2"><div class="card"><b class="muted">Before</b><p style="margin-top:8px">${esc(w.sug.before) || '(empty)'}</p></div><div class="card hl"><b style="color:var(--brand2)">After (editable)</b><textarea rows="4" data-wa="after">${esc(w.sug.after)}</textarea><div class="row" style="margin-top:10px"><button class="btn" data-act="accept">Accept</button><button class="btn ghost" data-act="reject">Reject</button></div></div></div>` : '<p class="muted">No suggestion yet. Pick a tool and click Suggest improvement.</p>'}
  <div class="card"><b>Action verbs</b><div class="chips" style="margin-top:8px">${VERBS.map(v => `<button class="tab" data-act="verb" data-id="${v}">${v}</button>`).join('')}</div></div></div>`;
}

function roadmap() {
  const c = ctx();
  return `<div class="page narrow"><div class="row between"><div><h1>Career Roadmap</h1><p class="muted">Tick tasks as you finish them.</p></div><select class="auto" aria-label="Target role" data-change="role">${roleOpts(c.role)}</select></div>
  <div class="card"><div class="row between"><b>Progress</b><span>${c.road}%</span></div>${bar(c.road)}<p class="muted" style="margin-top:8px">Current profile: ${c.coverage}% skill coverage, resume quality ${c.q.score}.</p></div>
  <div class="tl">${Object.keys(ROLES[c.role].tasks).map(cat => `<div class="card"><h3>${cat}</h3>${c.tasks.filter(t => t.c === cat).map(t => `<button class="task${S.done[t.id] ? ' on' : ''}" data-act="task" data-id="${esc(t.id)}"><span class="bx">${S.done[t.id] ? '✔' : ''}</span><span>${esc(t.t)}</span></button>`).join('')}</div>`).join('')}</div></div>`;
}

function tracker() {
  const f = UI.tf, list = S.apps.filter(a => UI.flt === 'All' || a.status === UI.flt);
  const i = (l, k, t = 'text', ph = '') => `<label>${l}<input type="${t}" data-tf="${k}" value="${esc(f[k])}" placeholder="${ph}"></label>`;
  return `<div class="page"><h1>Application Hub</h1>
  <form class="card form" data-submit="saveapp">${i('Company', 'company')}${i('Job title', 'title')}${i('Application date', 'date', 'date')}<label>Status<select data-tf="status">${opts(STATUSES, f.status)}</select></label>${i('Interview date', 'interview', 'date')}<label>Resume version used<select data-tf="resume"><option value="">Not specified</option>${opts(S.versions.map(v => v.name), f.resume)}</select></label>${i('Notes', 'notes')}
  ${UI.tfErr ? `<p class="err full" role="alert">${UI.tfErr}</p>` : ''}<div class="row full"><button class="btn" type="submit">${f._id ? 'Save changes' : '+ Add application'}</button>${f._id ? '<button type="button" class="btn ghost" data-act="cancel">Cancel</button>' : ''}</div></form>
  <div class="row small"><span>Filter:</span><select class="auto" aria-label="Filter by status" data-change="flt">${opts(['All', ...STATUSES], UI.flt)}</select></div>
  ${S.apps.length ? '' : '<div class="card muted" style="text-align:center">No applications yet. Add your first one above.</div>'}${S.apps.length && !list.length ? '<div class="card muted">No applications with this status.</div>' : ''}
  ${list.map(a => `<div class="card row between"><div style="min-width:0"><b>${esc(a.title)}</b> at ${esc(a.company)}<p class="muted">${a.resume ? 'Resume: ' + esc(a.resume) + ' · ' : ''}Applied ${esc(a.date)}${a.interview ? ' · Interview ' + esc(a.interview) : ''}</p>${a.notes ? `<p class="small">${esc(a.notes)}</p>` : ''}</div><div class="row"><select class="auto pill s-${a.status}" aria-label="Change status" data-change="appstatus" data-id="${a._id}">${opts(STATUSES, a.status)}</select><button class="btn ghost" data-act="editapp" data-id="${a._id}">Edit</button><button class="btn danger" data-act="delapp" data-id="${a._id}">Delete</button></div></div>`).join('')}</div>`;
}

function settings() {
  const p = S.profile;
  return `<div class="page narrow"><h1>Settings</h1><form class="card stack" data-submit="saveprofile"><h3>Profile</h3><label>Display name<input id="sn" value="${esc(p.name)}"></label><label>Email<input id="se" value="${esc(p.email)}"></label><div><button class="btn" type="submit">Save changes</button></div></form>
  <div class="card stack"><h3>Account & Data</h3><p class="muted">Your data is synced with MongoDB.</p><div class="row"><button class="btn ghost" data-act="export">Export data (JSON)</button><button class="btn danger" data-act="logout">Log Out</button></div></div></div>`;
}

function help() {
  const how = [['Career Readiness Score', '40% skill coverage + 30% resume quality + 30% roadmap progress.'], ['Resume quality', 'The share of nine checks passed, such as a summary, two projects, skills and measurable results.'], ['Skill coverage', 'Skills for your target role that appear on your resume or that you marked as learned.'], ['Job Match', '70% keyword coverage of the job description + 30% resume quality.']];
  return `<div class="page narrow"><h1>Help & Support</h1><div class="card"><h3>How scores are calculated</h3>${how.map(([t, d]) => `<p style="margin-top:8px"><b>${t}</b><br><span class="muted">${d}</span></p>`).join('')}</div>
  <h2 style="font-size:1.1rem">FAQ</h2>${FAQ.map(([q, a]) => `<details class="card"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
}

/* ---------- router ---------- */
const PAGES = { dashboard, resumes, builder, analyzer, matcher, skills, writing, roadmap, tracker, settings, help };
let lastRoute = null;
function render(keep) {
  const route = (location.hash.replace(/^#\/?/, '') || '').split('?')[0];
  const y = window.scrollY;
  const app = $('#app');

  if (!route) {
    app.innerHTML = landing();
  } else if (route === 'login') {
    if (getToken()) { location.hash = '#/dashboard'; return; }
    app.innerHTML = loginPage();
  } else if (PAGES[route]) {
    if (!getToken()) { location.hash = '#/login'; return; }
    if (!S.loaded) {
      app.innerHTML = shell(route, '<div class="page"><div class="card muted">Loading your workspace...</div></div>');
      loadAppData();
      return;
    }
    app.innerHTML = shell(route, PAGES[route]());
  } else {
    app.innerHTML = landing();
  }

  if (keep && route === lastRoute) window.scrollTo(0, y);
  else window.scrollTo(0, 0);
  lastRoute = route;
}
window.addEventListener('hashchange', () => { UI.menu = false; UI.lmenu = false; render(); });

/* ---------- actions ---------- */
const go = h => { location.hash = '#/' + h; };
const refreshPreview = () => { const p = $('#preview'); if (p) p.innerHTML = resumeHTML(act().data, act().template); };

const ACTS = {
  toggleAuth() { UI.authMode = UI.authMode === 'login' ? 'register' : 'login'; UI.authErr = ''; render(1); },
  logout() { setToken(null); S.loaded = false; S.versions = []; S.apps = []; toast('Logged out'); go('login'); },
  goto(a) { UI.lmenu = false; const id = a.dataset.id; if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' }); else { const el = document.getElementById(id); el && el.scrollIntoView({ behavior: 'smooth' }); } render(1); },
  lmenu() { UI.lmenu = !UI.lmenu; render(1); }, menu() { UI.menu = !UI.menu; render(1); }, collapse() { UI.collapsed = !UI.collapsed; render(1); },
  usetpl(a) { if (!getToken()) return go('login'); act().template = a.dataset.id; syncResume(true); go('builder'); },
  tpl(a) { act().template = a.dataset.id; syncResume(true); render(1); toast(a.textContent + ' template applied'); },
  add(a) { act().data[a.dataset.k].push({ ...BLANK[a.dataset.k] }); syncResume(true); render(1); toast('Entry added'); },
  del(a) { act().data[a.dataset.k].splice(+a.dataset.i, 1); syncResume(true); render(1); toast('Entry removed'); },
  pdf() { const d = act().data; if (!d.name.trim() || !d.email.trim()) return toast('Add your name and email first', true); toast('Choose "Save as PDF" in the print dialog'); setTimeout(() => window.print(), 600); },
  editver(a) { S.active = a.dataset.id; syncProgress(); go('builder'); },
  async dupver(a) {
    try {
      const v = S.versions.find(x => x._id === a.dataset.id);
      const created = await api('/resumes', 'POST', { name: v.name + ' (copy)', role: v.role, template: v.template, data: clone(v.data) });
      S.versions.push(created); S.active = created._id; syncProgress(); render(1); toast('Duplicated');
    } catch (err) { toast(err.message, true); }
  },
  async delver(a) {
    const id = a.dataset.id, v = S.versions.find(x => x._id === id);
    if (S.versions.length < 2 || !confirm('Delete "' + v.name + '"?')) return;
    try {
      await api(`/resumes/${id}`, 'DELETE');
      S.versions = S.versions.filter(x => x._id !== id);
      if (S.active === id) S.active = S.versions[0]._id;
      syncProgress(); render(1); toast('Resume deleted');
    } catch (err) { toast(err.message, true); }
  },
  browse(a, e) { if (e.target.id !== 'pdf') $('#pdf').click(); },
  analyze() { if (!UI.file) return toast('Upload a PDF first', true); UI.busy = true; UI.done = false; render(1); setTimeout(() => { UI.busy = false; UI.done = true; if (location.hash === '#/analyzer') render(1); toast('Analysis complete (simulated)'); }, 1500); },
  match() {
    const f = UI.mf; if (!f.title.trim() || f.jd.trim().length < 30) return toast('Add a job title and a job description (30+ characters)', true);
    UI.mbusy = true; render(1);
    setTimeout(() => {
      UI.mbusy = false;
      const c = ctx(), j = f.jd.toLowerCase(), rt = JSON.stringify(c.r).toLowerCase(), req = TERMS.filter(t => hasTerm(j, t));
      if (!req.length) { UI.mres = null; render(1); return toast('No known skills found in this description.', true); }
      const m = req.filter(t => hasTerm(rt, t)), x = req.filter(t => !hasTerm(rt, t)), cov = Math.round(100 * m.length / req.length), score = Math.round(.7 * cov + .3 * c.q.score);
      UI.mres = { req, m, x, cov, score, weak: c.q.checks.filter(k => !k[1]).slice(0, 4).map(k => k[0]) };
      S.last = { score, title: f.title }; syncProgress(); render(1); toast('Match analysis complete');
    }, 900);
  },
  prog(a) { const n = a.dataset.n, v = +a.dataset.v; S.prog[n] = v; syncProgress(); render(1); toast(v >= 100 ? n + ' marked as learned' : n + ' progress: ' + v + '%'); },
  task(a) { S.done[a.dataset.id] = !S.done[a.dataset.id]; syncProgress(); render(1); toast(S.done[a.dataset.id] ? 'Task completed' : 'Task reopened'); },
  wtool(a) { UI.wa = { tool: a.dataset.id, inp: '', sug: null }; render(1); },
  suggest() {
    const w = UI.wa, r = act().data;
    if (w.tool === 'summary') {
      const sk = (r.skills || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 3).join(', ');
      const o = `${r.title || 'Student'} with hands-on experience in ${sk || 'modern web technologies'}${r.projects[0] ? ', including the project ' + r.projects[0].name : ''}. Looking for opportunities to grow and contribute.`;
      w.sug = { before: r.summary, after: o };
    } else {
      if (w.inp.trim().length < 8) return toast('Enter at least a short sentence to improve', true);
      w.sug = { before: w.inp, after: improve(w.inp) };
    }
    render(1); toast('Suggestion ready');
  },
  accept() {
    const w = UI.wa;
    if (w.tool === 'summary') { act().data.summary = w.sug.after; syncResume(true); toast('Summary saved to your resume'); }
    else { navigator.clipboard && navigator.clipboard.writeText(w.sug.after); toast('Accepted and copied to clipboard'); }
    w.sug = null; render(1);
  },
  reject() { UI.wa.sug = null; render(1); toast('Suggestion rejected'); },
  verb(a) { navigator.clipboard && navigator.clipboard.writeText(a.dataset.id); toast(a.dataset.id + ' copied'); },
  editapp(a) { UI.tf = { ...S.apps.find(x => x._id === a.dataset.id) }; UI.tfErr = ''; render(1); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  cancel() { UI.tf = blankTF(); UI.tfErr = ''; render(1); },
  async delapp(a) {
    try {
      await api(`/applications/${a.dataset.id}`, 'DELETE');
      S.apps = S.apps.filter(x => x._id !== a.dataset.id); render(1); toast('Application deleted');
    } catch (err) { toast(err.message, true); }
  },
  export() {
    const l = document.createElement('a');
    l.href = URL.createObjectURL(new Blob([JSON.stringify({ profile: S.profile, versions: S.versions, apps: S.apps, prog: S.prog, done: S.done }, null, 2)], { type: 'application/json' }));
    l.download = 'resumeforge-data.json'; l.click(); toast('Data exported');
  }
};

const CHANGES = {
  role(t) { act().role = t.value; syncResume(true); render(1); },
  setver(t) { S.active = t.value; syncProgress(); render(1); },
  flt(t) { UI.flt = t.value; render(1); },
  async appstatus(t) {
    try {
      const updated = await api(`/applications/${t.dataset.id}`, 'PUT', { status: t.value });
      S.apps = S.apps.map(a => a._id === updated._id ? updated : a);
      render(1); toast('Status changed to ' + t.value);
    } catch (err) { toast(err.message, true); }
  },
  pick(t) { const f = t.files[0]; if (!f) return; if (f.type !== 'application/pdf') return toast('Please choose a PDF file', true); UI.file = f; UI.done = false; render(1); }
};

const SUBMITS = {
  async auth() {
    const isReg = UI.authMode === 'register';
    const email = $('#aemail').value.trim(), password = $('#apass').value;
    const name = isReg ? $('#aname').value.trim() : '';
    UI.authBusy = true; UI.authErr = ''; render(1);
    try {
      const res = await api(isReg ? '/auth/register' : '/auth/login', 'POST', isReg ? { name, email, password } : { email, password });
      setToken(res.token);
      UI.authBusy = false;
      toast(isReg ? 'Account created!' : 'Logged in!');
      go('dashboard');
    } catch (err) {
      UI.authBusy = false; UI.authErr = err.message; render(1);
    }
  },
  async create() {
    const name = $('#nv').value.trim(), role = $('#nr').value, copy = $('#nc').checked;
    if (!name) return toast('Give this version a name.', true);
    if (S.versions.some(v => v.name.toLowerCase() === name.toLowerCase())) return toast('A version with this name already exists.', true);
    const o = act().data;
    const data = copy ? clone(o) : { name: o.name, title: '', email: o.email, phone: o.phone, location: o.location, summary: '', education: clone(o.education), experience: [], projects: [], skills: '', certs: '', achievements: '', languages: o.languages };
    try {
      const created = await api('/resumes', 'POST', { name, role, template: 'modern', data });
      S.versions.push(created); S.active = created._id; syncProgress(); render(1); toast('Created "' + name + '".');
    } catch (err) { toast(err.message, true); }
  },
  async saveapp() {
    const f = UI.tf;
    if (!f.company.trim() || !f.title.trim() || !f.date) { UI.tfErr = 'Company, job title and application date are required.'; return render(1); }
    UI.tfErr = '';
    try {
      if (f._id) {
        const updated = await api(`/applications/${f._id}`, 'PUT', f);
        S.apps = S.apps.map(a => a._id === updated._id ? updated : a);
        toast('Application updated');
      } else {
        const { _id, ...payload } = f;
        const created = await api('/applications', 'POST', payload);
        S.apps.unshift(created);
        toast('Application added');
      }
      UI.tf = blankTF(); render(1);
    } catch (err) { toast(err.message, true); }
  },
  async saveprofile() {
    const n = $('#sn').value.trim(), e = $('#se').value.trim();
    if (!n) return toast('Display name is required.', true);
    if (e && !/^\S+@\S+\.\S+$/.test(e)) return toast('Enter a valid email address.', true);
    try {
      const updated = await api('/auth/profile', 'PUT', { name: n, email: e });
      S.profile = { name: updated.name, email: updated.email };
      toast('Settings saved'); render(1);
    } catch (err) { toast(err.message, true); }
  }
};

document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (a && ACTS[a.dataset.act]) ACTS[a.dataset.act](a, e); });
document.addEventListener('change', e => { const t = e.target, c = t.dataset.change; if (c && CHANGES[c]) CHANGES[c](t); });
document.addEventListener('submit', e => { const f = e.target.dataset.submit; if (f && SUBMITS[f]) { e.preventDefault(); SUBMITS[f](); } });
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.bind) { act().data[d.bind] = t.value; refreshPreview(); syncResume(); }
  else if (d.list) { act().data[d.list][+d.i][d.f] = t.value; refreshPreview(); syncResume(); }
  else if (d.mf) UI.mf[d.mf] = t.value;
  else if (d.tf) UI.tf[d.tf] = t.value;
  else if (d.wa) { if (d.wa === 'inp') UI.wa.inp = t.value; else UI.wa.sug.after = t.value; }
});
['dragover', 'dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  const z = e.target.closest && e.target.closest('#drop'); if (!z) return;
  e.preventDefault(); z.classList.toggle('over', ev === 'dragover');
  if (ev === 'drop') CHANGES.pick({ files: e.dataTransfer.files });
}));

render();
