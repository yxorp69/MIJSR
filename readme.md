# MIJSR — Mini In-Browser JavaScript Runner

Mini In-Browser JavaScript Runner (MIJSR)

---

This repo provides a tiny popup UI (`ui.html`) that you can open from a **console command** or a **bookmarklet**. Use the UI to paste JavaScript and run it in the page you opened the launcher from, or type the name of an app (see `apps/`).

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
