// Minimal vanilla SPA router
(() => {
  if (window.__spaRouterInitialized) return;
  window.__spaRouterInitialized = true;

  const isModifiedEvent = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

  async function navigate(path, replace = false) {
    try {
      const resp = await fetch(path, { headers: { 'X-Requested-With': 'SPA' }, cache: 'no-store' });
      if (!resp.ok) {
        location.href = path; // fallback to full load
        return;
      }

      const text = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const newMain = doc.querySelector('main#app');
      const targetMain = document.querySelector('main#app');
      if (!newMain || !targetMain) {
        location.href = path; // no suitable container in fetched page, do full load
        return;
      }

      // Remove any <script> tags from fetched content so they are not executed
      newMain.querySelectorAll('script').forEach(s => s.remove());

      // Replace content
      targetMain.innerHTML = newMain.innerHTML;

      // Update title
      const newTitle = doc.querySelector('title');
      if (newTitle) document.title = newTitle.textContent;

      // Update history
      const url = new URL(path, location.origin);
      if (replace) history.replaceState({}, '', url.href);
      else history.pushState({}, '', url.href);

      // Scroll to top
      window.scrollTo(0, 0);

      // Dispatch event so other modules can bind to new content
      window.dispatchEvent(new CustomEvent('spa:navigate', { detail: { path: url.pathname + url.search + url.hash } }));
    } catch (err) {
      console.error('SPA navigation failed, falling back to full load', err);
      location.href = path;
    }
  }

  // Intercept link clicks
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.button && e.button !== 0) return; // only left clicks
    if (isModifiedEvent(e)) return; // let user open in new tab

    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href === '#') return;
    if (a.target && a.target !== '') return; // let _blank and others behave normally
    if (a.hasAttribute('download')) return;
    if (a.dataset && a.dataset.noSpa === 'true') return;

    const url = new URL(href, location.href);
    // Only intercept same-origin navigations
    if (url.origin !== location.origin) return;

    // Hash-only navigation on same page
    if (url.pathname === location.pathname && url.hash) {
      // push state so back/forward works
      history.pushState({}, '', url.href);
      const el = document.getElementById(url.hash.slice(1));
      if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
      e.preventDefault();
      return;
    }

    // At this point, it's an internal navigation we should handle via SPA
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });

  // Handle back/forward
  window.addEventListener('popstate', () => {
    navigate(location.pathname + location.search + location.hash, true);
  });

  // Expose router API for manual control
  window.spa = {
    navigate
  };

})();
