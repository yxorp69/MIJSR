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
