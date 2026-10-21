// Checkout: fill hidden fields from the browser cart / chosen address and react to the radio choices.
(function () {
    const form = document.querySelector('[data-checkout]');
    if (!form) return;
    const money = n => '$' + n.toFixed(2);

    // Shipping address picked on the map page
    const addr = form.querySelector('[data-ship-address]');
    try {
        const saved = JSON.parse(localStorage.getItem('delizioso-address'));
        if (saved && saved.address) {
            addr.value = saved.address;
            form.querySelector('[data-ship-lat]').value = saved.lat;
            form.querySelector('[data-ship-lng]').value = saved.lng;
        }
    } catch { }
    const change = form.querySelector('[data-ship-change]');
    change.textContent = addr.value ? 'Change' : 'Choose';
    addr.addEventListener('click', () => location.href = change.href);

    // Saved addresses of a logged-in customer
    form.querySelectorAll('[data-saved-address]').forEach(b => b.addEventListener('click', () => {
        const place = { address: b.dataset.savedAddress, lat: Number(b.dataset.lat) || null, lng: Number(b.dataset.lng) || null };
        addr.value = place.address;
        form.querySelector('[data-ship-lat]').value = place.lat ?? '';
        form.querySelector('[data-ship-lng]').value = place.lng ?? '';
        change.textContent = 'Change';
        try { localStorage.setItem('delizioso-address', JSON.stringify(place)); } catch { }
    }));

    // Delivery vs take away
    const shipping = form.querySelector('[data-shipping-section]');
    const syncMethod = () => {
        const m = form.querySelector('[data-method]:checked');
        shipping.hidden = m && m.value !== 'Delivery';
    };
    form.querySelectorAll('[data-method]').forEach(r => r.addEventListener('change', syncMethod));
    syncMethod();

    // "Order later" select only when that option is chosen
    const laterRadio = form.querySelector('[data-later-radio]');
    const laterSelect = form.querySelector('[data-later-select]');
    const syncLater = () => { laterSelect.disabled = !laterRadio.checked; };
    form.querySelectorAll('input[name="OrderTime"]').forEach(r => r.addEventListener('change', syncLater));
    laterSelect.addEventListener('focus', () => { laterRadio.checked = true; syncLater(); });
    laterSelect.addEventListener('mousedown', () => { laterRadio.checked = true; laterSelect.disabled = false; });
    syncLater();

    // Total line + hidden cart fields
    const totalEl = form.querySelector('[data-co-total]');
    function sync() {
        const t = window.orderTotals();
        totalEl.innerHTML = t.count
            ? `${t.count} ${t.count === 1 ? 'item' : 'items'} &middot; Total <b>${money(t.total)}</b>${t.discount ? ` (voucher &minus;${money(t.discount)})` : ''}`
            : 'Your order list is empty. <a href="/Order">Add dishes from the menu</a>.';
        form.querySelector('[data-cart-json]').value = JSON.stringify(window.cart.read());
        form.querySelector('[data-voucher-code]').value = t.voucher ? t.voucher.code : '';
    }
    document.addEventListener('cart:change', sync);
    form.addEventListener('submit', () => { laterSelect.disabled = false; sync(); });
    sync();
})();
