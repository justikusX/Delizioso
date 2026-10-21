// Mobile navigation toggle
(function () {
    const toggle = document.querySelector('.nav-toggle');
    const header = document.querySelector('.site-header');
    if (!toggle || !header) return;
    toggle.addEventListener('click', () => {
        const open = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
    });
})();

// Cart kept in the browser until checkout: { dishId: quantity }. The server re-prices it when the order is placed.
window.cart = (function () {
    const KEY = 'delizioso-cart';
    const MAX = 20;

    function read() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
    }
    function write(items) {
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ }
        render(items);
        document.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
    }
    function count(items = read()) {
        return Object.values(items).reduce((sum, q) => sum + q, 0);
    }
    function set(id, qty) {
        const items = read();
        qty = Math.min(MAX, Math.max(0, qty));
        if (qty === 0) delete items[id]; else items[id] = qty;
        write(items);
    }
    function add(id) { set(id, (read()[id] || 0) + 1); }
    function clear() { write({}); }
    function render(items) {
        document.querySelectorAll('[data-cart-count]').forEach(el => {
            const n = count(items);
            el.textContent = n;
            el.hidden = n === 0;
        });
    }

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (!btn) return;
        add(btn.dataset.addToCart);
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 600);
    });

    // Keep several open tabs in sync
    window.addEventListener('storage', e => { if (e.key === KEY) write(read()); });

    render(read());
    return { read, write, set, add, clear, count };
})();
