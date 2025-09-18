# MIJSR — Mini In-Browser JavaScript Runner

Mini In-Browser JavaScript Runner (MIJSR)

---

## README.md (raw)

This repo provides a tiny popup UI (`ui.html`) that you can open from a **console command** or a **bookmarklet**. Use the UI to paste JavaScript and run it in the page you opened the launcher from, or type the name of an app (see `apps/`) to fetch and run `apps/<name>.js` from this repo.

---

## Open the UI

### Option A — Console (paste & run)

Paste the block below into DevTools → **Console** and press Enter:

```js
(async ()=>{
  const JS_PATH = 'https://cdn.jsdelivr.net/gh/yxorp69/MIJSR@main/ui.html';
  const SECRET = Math.random().toString(36).slice(2);
  if(!window.__miniRunListenerInstalled){
    window.__miniRunListenerInstalled = true;
    window.addEventListener('message', function miniRunHandler(e){
      try{
        const d = e.data;
        if(!d || d.type !== 'mini-run' || d.secret !== SECRET) return;
        try{ eval(d.code); }
        catch(err){ console.error('mini-run eval error:', err); try{ alert('mini-run eval error: '+err);}catch(e){} }
      }catch(ex){ console.error(ex); }
    }, false);
    console.log('mini-run listener installed.');
  } else console.log('mini-run listener already installed.');

  const w = window.open('about:blank', 'mini-run-popup', 'width=900,height=560');
  if(!w){ alert('Popup blocked — allow popups for this site'); return; }

  try{
    const res = await fetch(JS_PATH, {cache:'no-store'});
    if(!res.ok) throw new Error(res.status + ' ' + res.statusText);
    let txt = await res.text();
    txt = txt.replace(/___MINI_RUN_SECRET___/g, SECRET);
    txt = txt.replace(/__DEFAULT_REPO__/g, 'yxorp69/MIJSR@main');
    w.document.open(); w.document.write(txt); w.document.close(); w.focus();
  }catch(err){
    console.error('Failed to load UI:', err);
    alert('Failed to load UI: ' + err);
  }
})();
```

### Option B — Bookmarklet

Create a bookmark and paste this entire string into the bookmark’s **URL** field. Click the bookmark to open the UI.

```
javascript:(function(){const JS_URL='https://cdn.jsdelivr.net/gh/yxorp69/MIJSR@main/ui.html';const SECRET=Math.random().toString(36).slice(2);if(window.__miniRunListenerInstalled){console.log('mini-run listener already installed.');}else{window.__miniRunListenerInstalled=true;window.addEventListener('message',function(e){try{const d=e.data;if(!d||d.type!=='mini-run'||d.secret!==SECRET)return;try{eval(d.code);}catch(err){console.error('mini-run eval error:',err);try{alert('mini-run eval error: '+err);}catch(e){}}}catch(ex){console.error(ex);}},false);console.log('mini-run listener installed.');}const w=window.open('about:blank','mini-run-popup','width=900,height=560');if(!w){alert('Popup blocked — allow popups');return;}fetch(JS_URL,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(r.status+' '+r.statusText);return r.text();}).then(function(t){t=t.replace(/___MINI_RUN_SECRET___/g,SECRET);t=t.replace(/__DEFAULT_REPO__/g,'yxorp69/MIJSR@main');w.document.open();w.document.write(t);w.document.close();w.focus();}).catch(function(e){console.error('load UI failed',e);alert('load UI failed: '+e);});})();
```

---

## Run code through the UI

1. Open the popup using **Console** or **Bookmarklet** (above).
2. In the popup UI:

   * Paste JavaScript into the textarea and click **Run** (or press **Ctrl+Enter**) — this executes the code in the original page.
   * Or type an **app name** (e.g. `example`) into the **Path** field and click **Fetch**. The UI will automatically fetch `apps/<name>.js` from this repo (so `example` → `apps/example.js`). Then click **Run**.
3. The popup sends the code to the opener page, which verifies the popup’s secret token and executes the code.

---

## Files included below (raw)

---

### ui.html

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MIJSR — Mini Runner</title>
<style>
  :root{font-family:system-ui,Segoe UI,Roboto,Arial}
  body{margin:12px;max-width:980px}
  header{display:flex;gap:8px;align-items:center;margin-bottom:8px}
  h1{font-size:16px;margin:0}
  .row{display:flex;gap:8px;align-items:center}
  input,button,textarea,select{font:inherit}
  input,select{padding:6px;border-radius:6px;border:1px solid rgba(0,0,0,.12)}
  button{padding:6px 10px;border-radius:8px;border:0;cursor:pointer}
  textarea{width:100%;height:300px;padding:8px;margin-top:8px;border-radius:8px;border:1px solid rgba(0,0,0,.12);box-sizing:border-box;font-family:ui-monospace,monospace}
  small{opacity:.7}
  footer{margin-top:8px;display:flex;gap:8px;align-items:center}
  label{display:flex;flex-direction:column;gap:6px;flex:1}
  .controls{display:flex;gap:6px;align-items:center}
</style>
</head>
<body>
  <header>
    <h1>MIJSR — Mini Runner</h1>
    <div style="margin-left:auto" class="controls">
      <button id=closeBtn title="Close popup">Close</button>
    </div>
  </header>

  <div class="row">
    <label>
      Repo (user/repo@branch)
      <input id=repo placeholder="me/scripts@main" value="yxorp69/MIJSR@main">
    </label>
    <label style="width:320px">
      Path / App name (type `example` to fetch `apps/example.js`)
      <input id=path placeholder="tools/hello or index or app-name" value="index">
    </label>
    <button id=fetchBtn>Fetch</button>
    <button id=runBtn>Run</button>
    <button id=copyBtn>Copy</button>
  </div>

  <div><small>Type code below or fetch by app name (`apps/<name>.js`). Ctrl+Enter runs.</small></div>
  <textarea id=code placeholder="// your JS here — fetched script will appear here"></textarea>

  <footer>
    <small>Fetched via <code>cdn.jsdelivr.net/gh/…</code>. Be careful with remote scripts.</small>
  </footer>

<script>
(function(){
  // SECRET inserted by opener when writing the HTML. Default placeholder stays empty.
  const SECRET = '___MINI_RUN_SECRET___';

  const $ = id => document.getElementById(id);
  const repoEl = $('repo'), pathEl = $('path'), codeEl = $('code');
  const fetchBtn = $('fetchBtn'), runBtn = $('runBtn'), copyBtn = $('copyBtn'), closeBtn = $('closeBtn');

  function buildUrl(repoVal, pathVal){
    if(!repoVal) return '';
    const parts = repoVal.split('@');
    const userRepo = parts[0].trim();
    const branch = (parts[1]||'main').trim();
    let p = (pathVal||'index').replace(/^\/+/, '');
    // If user typed a simple name (no slashes and not a path with a dot), treat it as an app name
    if(!p.includes('/') && !p.includes('.') && !p.endsWith('.js')){
      p = 'apps/' + p + '.js';
    } else if(!p.endsWith('.js')){
      p = p + '.js';
    }
    return 'https://cdn.jsdelivr.net/gh/' + userRepo + '/' + branch + '/' + p;
  }

  fetchBtn.onclick = async () => {
    const url = buildUrl(repoEl.value.trim(), pathEl.value.trim());
    if(!url){ alert('Set repo like user/repo@branch'); return; }
    codeEl.value = '// fetching: ' + url + '\n';
    try{
      const r = await fetch(url, {cache:'no-store'});
      if(!r.ok) throw new Error(r.status + ' ' + r.statusText);
      const txt = await r.text();
      codeEl.value = txt;
    }catch(e){
      codeEl.value += '\n// fetch error: ' + e;
    }
  };

  runBtn.onclick = () => {
    const payload = { type: 'mini-run', secret: SECRET, code: codeEl.value };
    try {
      window.opener.postMessage(payload, '*');
      runBtn.textContent = 'Sent';
      setTimeout(()=> runBtn.textContent = 'Run', 600);
    } catch(e) {
      alert('Send failed: ' + e);
    }
  };

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(codeEl.value);
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy', 800);
    } catch(e){
      alert('Copy failed: '+e);
    }
  };

  closeBtn.onclick = () => window.close();

  codeEl.addEventListener('keydown', (ev) => {
    if(ev.ctrlKey && ev.key === 'Enter') runBtn.click();
  });

  // optional: allow opener to set repo/path via postMessage
  window.addEventListener('message', (e) => {
    try {
      const d = e.data;
      if(d && d.type === 'mini-run-ctrl' && d.secret === SECRET){
        if(d.repo) repoEl.value = d.repo;
        if(d.path) pathEl.value = d.path;
        if(d.code) codeEl.value = d.code;
      }
    }catch(err){}
  });
})();
</script>
</body>
</html>
```

---

### Console launcher (readable)

```js
// ======= CONSOLE LAUNCHER for yxorp69/MIJSR/ui.html (jsDelivr) =======
(async ()=>{
  const JS_PATH = 'https://cdn.jsdelivr.net/gh/yxorp69/MIJSR@main/ui.html';
  const SECRET = Math.random().toString(36).slice(2);
  if(window.__miniRunListenerInstalled){
    console.log('mini-run listener already installed.');
  } else {
    window.__miniRunListenerInstalled = true;
    window.addEventListener('message', function miniRunHandler(e){
      try{
        const d = e.data;
        if(!d || d.type !== 'mini-run' || d.secret !== SECRET) return;
        try{
          eval(d.code);
        }catch(err){
          console.error('mini-run eval error:', err);
          try{ alert('mini-run eval error: '+err); }catch(e){}
        }
      }catch(ex){ console.error(ex); }
    }, false);
    console.log('mini-run listener installed.');
  }

  const w = window.open('about:blank', 'mini-run-popup', 'width=900,height=560');
  if(!w){ alert('Popup blocked — allow popups for this site'); return; }

  try{
    const res = await fetch(JS_PATH, {cache:'no-store'});
    if(!res.ok) throw new Error(res.status + ' ' + res.statusText);
    let txt = await res.text();
    txt = txt.replace(/___MINI_RUN_SECRET___/g, SECRET);
    txt = txt.replace(/__DEFAULT_REPO__/g, 'yxorp69/MIJSR@main');
    w.document.open();
    w.document.write(txt);
    w.document.close();
    w.focus();
  }catch(err){
    console.error('Failed to load UI:', err);
    alert('Failed to load UI: ' + err);
  }
})();
```

---

### Bookmarklet (one line)

```
javascript:(function(){const JS_URL='https://cdn.jsdelivr.net/gh/yxorp69/MIJSR@main/ui.html';const SECRET=Math.random().toString(36).slice(2);if(window.__miniRunListenerInstalled){console.log('mini-run listener already installed.');}else{window.__miniRunListenerInstalled=true;window.addEventListener('message',function(e){try{const d=e.data;if(!d||d.type!=='mini-run'||d.secret!==SECRET)return;try{eval(d.code);}catch(err){console.error('mini-run eval error:',err);try{alert('mini-run eval error: '+err);}catch(e){}}}catch(ex){console.error(ex);}},false);console.log('mini-run listener installed.');}const w=window.open('about:blank','mini-run-popup','width=900,height=560');if(!w){alert('Popup blocked — allow popups');return;}fetch(JS_URL,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(r.status+' '+r.statusText);return r.text();}).then(function(t){t=t.replace(/___MINI_RUN_SECRET___/g,SECRET);t=t.replace(/__DEFAULT_REPO__/g,'yxorp69/MIJSR@main');w.document.open();w.document.write(t);w.document.close();w.focus();}).catch(function(e){console.error('load UI failed',e);alert('load UI failed: '+e);});})();
```

---

### apps/example.js

```js
// apps/example.js
// Quick demo script for MIJSR
(function(){
  console.log('[MIJSR] apps/example.js running');
  alert('MIJSR example executed — check console for details');
  const els = document.querySelectorAll('p');
  els.forEach(el => {
    const origBg = el.style.backgroundColor;
    el.style.backgroundColor = 'salmon';
    setTimeout(()=> el.style.backgroundColor = origBg, 2000);
  });
})();
```

---

That's all — I updated the README in this doc and included the updated `ui.html`, console launcher, bookmarklet, and a sample `apps/example.js`. Copy any of the blocks into files in your repo (`ui.html` at root, `apps/example.js` under `apps/`) and the console/bookmarklet will load the UI via jsDelivr.
