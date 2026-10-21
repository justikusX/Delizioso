// Confirm page: "we can hold this table for 5:00 minutes" countdown
(function () {
    const banner = document.querySelector('[data-hold-minutes]');
    if (!banner) return;
    const left = banner.querySelector('[data-hold-left]');
    const submit = document.querySelector('[data-hold-submit]');
    const key = 'delizioso-hold:' + location.search;
    const total = Number(banner.dataset.holdMinutes) * 60 * 1000;

    let start = Date.now();
    try {
        const saved = Number(sessionStorage.getItem(key));
        if (saved && Date.now() - saved < total) start = saved;
        sessionStorage.setItem(key, String(start));
    } catch { /* storage blocked */ }

    function tick() {
        const ms = Math.max(0, total - (Date.now() - start));
        const s = Math.ceil(ms / 1000);
        left.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} minutes`;
        if (ms > 0) return;
        clearInterval(timer);
        banner.classList.add('expired');
        banner.querySelector('[data-hold-text]').hidden = true;
        banner.querySelector('[data-hold-expired]').hidden = false;
        submit.disabled = true;
        try { sessionStorage.removeItem(key); } catch { }
    }
    const timer = setInterval(tick, 1000);
    tick();
})();

// Confirmed page: save occasion / special request in the background
(function () {
    const form = document.querySelector('[data-autosave]');
    if (!form) return;
    const status = form.querySelector('[data-autosave-status]');
    let timer;

    async function save() {
        status.textContent = 'Saving…';
        try {
            const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
            status.textContent = res.ok ? 'Saved' : 'Could not save, please try again';
        } catch {
            status.textContent = 'Could not save, please check your connection';
        }
    }

    form.addEventListener('change', save);
    form.addEventListener('input', e => {
        if (e.target.tagName !== 'TEXTAREA') return;
        clearTimeout(timer);
        timer = setTimeout(save, 800);
    });
    form.addEventListener('submit', e => { e.preventDefault(); save(); });
})();
