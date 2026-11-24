(() => {
  const root=document.documentElement;
  const key='mykyta-portfolio-theme';
  try { if(localStorage.getItem(key)==='dark') root.dataset.theme='dark'; } catch {}
  document.addEventListener('DOMContentLoaded',() => {
    const button=document.querySelector('.theme');
    const sync=()=>button.setAttribute('aria-pressed',String(root.dataset.theme==='dark'));
    sync();
    button.addEventListener('click',() => {
      const theme=root.dataset.theme==='dark'?'light':'dark';
      root.dataset.theme=theme;
      try {localStorage.setItem(key,theme)} catch {}
      sync();
    });
  });
})();
