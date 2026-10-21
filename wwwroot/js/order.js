// Order online: dish cards, order list (sidebar / page), voucher and totals.
(function () {
    const dataEl = document.getElementById('dish-data');
    if (!dataEl) return;
    const dishes = new Map(JSON.parse(dataEl.textContent).map(d => [String(d.id), d]));
    const taxRate = (window.orderConfig && window.orderConfig.taxRate) || 0;
    const VOUCHER_KEY = 'delizioso-voucher';
    const money = n => '$' + n.toFixed(2);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function readVoucher() {
        try { return JSON.parse(localStorage.getItem(VOUCHER_KEY)); } catch { return null; }
    }
    function writeVoucher(v) {
        try { v ? localStorage.setItem(VOUCHER_KEY, JSON.stringify(v)) : localStorage.removeItem(VOUCHER_KEY); } catch { }
    }

    /** Lines and totals for the current cart (unknown dish ids are ignored). */
    function totals() {
        const items = window.cart.read();
        const lines = Object.entries(items)
            .filter(([id]) => dishes.has(id))
            .map(([id, qty]) => ({ dish: dishes.get(id), qty, sum: dishes.get(id).price * qty }));
        const subtotal = lines.reduce((s, l) => s + l.sum, 0);
        const tax = Math.round(subtotal * taxRate * 100) / 100;
        const voucher = lines.length ? readVoucher() : null;
        const discount = voucher ? Math.min(voucher.amount, subtotal + tax) : 0;
        return { lines, subtotal, tax, voucher, discount, total: subtotal + tax - discount, count: lines.reduce((s, l) => s + l.qty, 0) };
    }
    window.orderTotals = totals;

    // ----- Order list -----
    function renderList(el, t) {
        const withImages = el.hasAttribute('data-with-images');
        const v = t.voucher;
        el.innerHTML = `
            ${withImages ? '' : '<h2 class="order-list-head">Order list</h2>'}
            <div class="order-items">
                ${t.lines.length ? t.lines.map(l => `
                    <div class="order-item" data-id="${l.dish.id}">
                        ${withImages ? `<img src="${esc(l.dish.image)}" alt="" />` : ''}
                        <div class="order-item-body">
                            <div class="order-item-top">
                                <span class="order-item-name">${esc(l.dish.name)}</span>
                                <button type="button" class="order-remove" data-remove aria-label="Remove ${esc(l.dish.name)}">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12M8.5 8.5v5M11.5 8.5v5"/></svg>
                                </button>
                            </div>
                            <div class="order-item-bottom">
                                <div class="qty-control">
                                    <button type="button" data-step="-1" aria-label="Less">&minus;</button>
                                    <span>${l.qty}</span>
                                    <button type="button" data-step="1" aria-label="More">+</button>
                                </div>
                                <span class="order-item-price">${money(l.sum)}</span>
                            </div>
                        </div>
                    </div>`).join('') : '<p class="order-empty">Your order list is empty. Tap “Order now” on a dish to add it.</p>'}
            </div>
            <form class="voucher" data-voucher>
                <label for="voucher-${el.dataset.uid}">Voucher Code</label>
                <div class="voucher-row">
                    <input id="voucher-${el.dataset.uid}" name="code" value="${v ? esc(v.code) : ''}" placeholder="Enter code" autocomplete="off" />
                    <button type="submit" aria-label="Apply voucher">${v ? '&#10003;' : '+'}</button>
                </div>
                <p class="voucher-msg" data-voucher-msg>${v ? `Voucher applied: ${money(v.amount)} off` : ''}</p>
            </form>
            <dl class="order-sums">
                <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
                <div><dt>Tax fee</dt><dd>${money(t.tax)}</dd></div>
                <div><dt>Voucher</dt><dd>${t.discount ? '&minus;' + money(t.discount) : money(0)}</dd></div>
                <div class="total"><dt>Total</dt><dd>${money(t.total)}</dd></div>
            </dl>
            <a class="order-checkout ${t.lines.length ? '' : 'disabled'}" href="/Order/Checkout" ${t.lines.length ? '' : 'aria-disabled="true" tabindex="-1"'}>Checkout</a>`;
    }

    const lists = [...document.querySelectorAll('[data-order-list]')];
    lists.forEach((el, i) => el.dataset.uid = String(i));

    document.addEventListener('click', e => {
        const item = e.target.closest('.order-item');
        if (!item) return;
        const id = item.dataset.id;
        if (e.target.closest('[data-remove]')) window.cart.set(id, 0);
        const step = e.target.closest('[data-step]');
        if (step) window.cart.set(id, (window.cart.read()[id] || 0) + Number(step.dataset.step));
    });

    document.addEventListener('submit', async e => {
        const form = e.target.closest('[data-voucher]');
        if (!form) return;
        e.preventDefault();
        const code = form.code.value.trim();
        const msg = form.querySelector('[data-voucher-msg]');
        if (!code) { writeVoucher(null); render(); return; }
        msg.textContent = 'Checking…';
        try {
            const res = await fetch('/Order/Voucher?code=' + encodeURIComponent(code));
            if (res.ok) { writeVoucher(await res.json()); render(); }
            else { writeVoucher(null); render(); lists.forEach(l => l.querySelector('[data-voucher-msg]').textContent = 'This voucher code is not valid'); }
        } catch {
            msg.textContent = 'Could not check the code, please try again';
        }
    });

    // ----- Dish cards -----
    function renderCards() {
        const items = window.cart.read();
        document.querySelectorAll('[data-dish]').forEach(card => {
            const qty = items[card.dataset.dish] || 0;
            card.classList.toggle('in-cart', qty > 0);
            card.querySelector('[data-qty]').textContent = qty ? qty + 'x' : '';
        });
    }

    // Category filter + one pager per section
    const tabs = document.querySelectorAll('.order-tabs .tab');
    const groups = [...document.querySelectorAll('[data-order-group]')].map(section => {
        const grid = section.querySelector('.order-grid');
        return {
            section, page: 1,
            cards: [...grid.querySelectorAll('.order-card')],
            size: Number(grid.dataset.pageSize) || 9,
            pager: section.querySelector('.pager'),
        };
    });
    let filter = 'all';

    function renderGroups() {
        let anyVisible = false;
        groups.forEach(g => {
            const list = g.cards.filter(c => filter === 'all' || c.dataset.category === filter);
            g.section.hidden = list.length === 0;
            anyVisible ||= list.length > 0;
            const pages = Math.max(1, Math.ceil(list.length / g.size));
            g.page = Math.min(g.page, pages);
            g.cards.forEach(c => c.hidden = true);
            list.slice((g.page - 1) * g.size, g.page * g.size).forEach(c => c.hidden = false);

            g.pager.hidden = pages === 1;
            const nums = g.pager.querySelector('.pager-nums');
            nums.innerHTML = '';
            for (let i = 1; i <= pages; i++) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'pager-num' + (i === g.page ? ' active' : '');
                b.textContent = i;
                b.addEventListener('click', () => { g.page = i; renderGroups(); });
                nums.appendChild(b);
            }
            g.pager.querySelector('.prev').disabled = g.page === 1;
            g.pager.querySelector('.next').disabled = g.page === pages;
        });
        const empty = document.querySelector('[data-order-empty]');
        if (empty) empty.hidden = anyVisible;
    }
    groups.forEach(g => {
        g.pager.querySelector('.prev').addEventListener('click', () => { g.page--; renderGroups(); });
        g.pager.querySelector('.next').addEventListener('click', () => { g.page++; renderGroups(); });
    });
    tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.toggle('active', x === t));
        filter = t.dataset.filter;
        groups.forEach(g => g.page = 1);
        renderGroups();
    }));

    // ----- Mobile bottom bar -----
    function renderBar(t) {
        const bar = document.querySelector('[data-order-bar]');
        if (!bar) return;
        bar.classList.toggle('empty', t.count === 0);
        bar.querySelector('[data-bar-items]').textContent = `${t.count} ${t.count === 1 ? 'Item' : 'Items'}`;
        bar.querySelector('[data-bar-total]').textContent = money(t.total);
    }

    function render() {
        const t = totals();
        lists.forEach(el => renderList(el, t));
        renderCards();
        renderBar(t);
    }

    document.addEventListener('cart:change', render);
    if (groups.length) renderGroups();
    render();
})();
