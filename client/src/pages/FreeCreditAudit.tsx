<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="description" content="Get your free professional credit audit from 700 Credit Club Experts. Upload your credit report and receive a full AI-powered analysis — negative items, utilization, inquiries, and a step-by-step repair plan. Powered by JECI AI."/>
<meta name="keywords" content="free credit audit, credit repair, credit score improvement, 700 credit club, credit analysis, JECI AI"/>
<meta property="og:title" content="Free Credit Audit — 700 Credit Club Experts"/>
<meta property="og:description" content="Upload your credit report and get a full professional credit audit in seconds. Free, no hard pull, privacy protected."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://www.700creditclubexperts.com/free-credit-audit"/>
<title>Free Credit Audit | 700 Credit Club Experts — Powered by JECI AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"/>

<style>
/* ── All your existing CSS remains unchanged ───────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  font-family:'DM Sans',sans-serif;
  color:#1A1A2E;
  background:#F5F3EE;
  min-height:100vh;
  -webkit-font-smoothing:antialiased;
}

/* Brand Tokens, Typography, Animations, Buttons, Nav, Hero, Upload Zone, etc. */
/* (Your full CSS block from the original is kept exactly as-is below this comment) */
:root{
  --navy:#0C1F3F;
  --navy-dark:#070F1E;
  --navy-light:#1A3260;
  --gold:#C9A84C;
  --gold-light:#E8C97A;
  --gold-dark:#A88830;
  --off-white:#F5F3EE;
  --white:#FFFFFF;
  --text:#1A1A2E;
  --muted:#6B7A99;
  --border:rgba(0,0,0,0.08);
  --radius-sm:6px;
  --radius-md:10px;
  --radius-lg:14px;
  --radius-xl:18px;
  --shadow-card:0 2px 20px rgba(0,0,0,0.07);
  --shadow-lift:0 8px 40px rgba(0,0,0,0.10);
}
.serif{font-family:'Cormorant Garamond',serif;}
h1,h2,h3{font-family:'Cormorant Garamond',serif;line-height:1.1;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
@keyframes shimmer{0%{opacity:0.6;}50%{opacity:1;}100%{opacity:0.6;}}
.fade-up{animation:fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards;}

/* Buttons */
.btn-gold{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--gold);color:var(--navy-dark);
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;
  padding:14px 36px;border-radius:var(--radius-md);border:none;
  cursor:pointer;letter-spacing:.02em;transition:all .2s ease;
  text-decoration:none;
}
.btn-gold:hover{background:var(--gold-light);transform:translateY(-1px);box-shadow:0 6px 24px rgba(201,168,76,.3);}
.btn-navy{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--navy-dark);color:var(--gold);
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;
  padding:14px 36px;border-radius:var(--radius-md);border:none;
  cursor:pointer;letter-spacing:.02em;transition:all .2s ease;
}
.btn-navy:hover{background:var(--navy);}

/* Navigation, Hero, Upload Zone, Analyzing, Error, Sections, Report styles... */
/* ... (copy-paste the rest of your original <style> content here exactly as it was) ... */
</style>
</head>
<body>

<!-- Your full HTML body content (nav, hero, sections, footer, etc.) remains exactly the same -->
<!-- Only the script at the bottom has been updated -->

<!-- ... [Paste all your original HTML from <nav> to </footer> here] ... -->

<!-- JECI AI ENGINE -->
<script>
/* ── Configuration ───────────────────────────────────────────────────── */
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY';   // ← Replace with real key (or proxy through backend!)
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/* System Prompt (unchanged — it's excellent) */
const SYSTEM_PROMPT = `You are a Senior Credit Analyst at 700 Credit Club Experts, powered by JECI AI.
... (your full system prompt here — no changes needed) ...`;

/* State */
let openFaqIdx = null;

/* Helpers */
function $(id){ return document.getElementById(id); }
function show(id){ $(id).style.display = ''; }
function hide(id){ $(id).style.display = 'none'; }

function toggleFaq(i) {
  const a = $('fa-' + i), t = $('ft-' + i);
  if (openFaqIdx !== null && openFaqIdx !== i) {
    $('fa-' + openFaqIdx).style.display = 'none';
    $('fa-' + openFaqIdx).classList.remove('open');
    $('ft-' + openFaqIdx).textContent = '+';
  }
  const isOpen = a.style.display !== 'none';
  if (isOpen) {
    a.style.display = 'none';
    a.classList.remove('open');
    t.textContent = '+';
    openFaqIdx = null;
  } else {
    a.style.display = 'block';
    a.classList.add('open');
    t.textContent = '−';
    openFaqIdx = i;
  }
}

/* Drag & Drop / File handling (unchanged) */
function handleDragOver(e) { e.preventDefault(); $('upload-zone').classList.add('over'); }
function handleDragLeave() { $('upload-zone').classList.remove('over'); }
function handleDrop(e) {
  e.preventDefault();
  $('upload-zone').classList.remove('over');
  if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
}
function handleFileInput(e) {
  if (e.target.files[0]) processFile(e.target.files[0]);
}

function resetUI() {
  hide('analyzing-box');
  hide('error-box');
  hide('success-note');
  hide('another-wrap');
  show('upload-zone');
  $('report-output').innerHTML = '';
  $('file-input').value = '';
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* Main Analysis */
async function processFile(file) {
  hide('upload-zone');
  hide('error-box');
  hide('success-note');
  $('report-output').innerHTML = '';
  hide('another-wrap');
  show('analyzing-box');
  $('file-name-display').textContent = '📁 ' + file.name;

  if (ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY') {
    hide('analyzing-box');
    show('error-box');
    $('error-msg').innerHTML = 'Please replace <code>YOUR_ANTHROPIC_API_KEY</code> with your actual Anthropic API key (or use a backend proxy).';
    return;
  }

  try {
    const base64 = await toBase64(file);
    const isPdf = file.type === 'application/pdf';
    const mediaType = isPdf ? 'application/pdf' : (file.type || 'image/jpeg');

    const contentBlock = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };

    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',           // ← Fixed model name
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            contentBlock,
            { type: 'text', text: 'Analyze this credit report and return ONLY the structured JSON audit. Be thorough and specific.' }
          ]
        }]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawText = (data.content || []).map(b => b.text || '').join('');
    const cleanJson = rawText.replace(/```json\n?|```\n?/g, '').trim();

    let report;
    try {
      report = JSON.parse(cleanJson);
    } catch (parseErr) {
      throw new Error('Failed to parse AI response as JSON. The model may have returned unexpected text.');
    }

    hide('analyzing-box');
    $('success-note').style.display = 'flex';
    renderReport(report);
    show('another-wrap');
    setTimeout(() => $('report-output').scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);

  } catch (err) {
    hide('analyzing-box');
    show('error-box');
    $('error-msg').textContent = err.message || 'Analysis failed. Please try again with a different file.';
    console.error('[JECI AI Error]', err);
  }
}

/* All your existing utility functions and renderReport() remain unchanged */
function utilColor(pct) { /* ... */ }
function ratingStyle(rating) { /* ... */ }
function mkTag(cls, text) { /* ... */ }
function renderReport(r) { /* ... your full renderReport function ... */ }
</script>
</body>
</html>