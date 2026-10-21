// Shipping address: OpenStreetMap map + Nominatim address search. The chosen address is kept in the browser for checkout.
(function () {
    const KEY = 'delizioso-address';
    const RESTAURANT = { lat: 40.885147, lng: -73.9220459 }; // 3247 Johnson Ave, Bronx
    const msg = document.querySelector('[data-ship-msg]');
    const popup = document.querySelector('[data-ship-popup]');
    let chosen = null;

    const map = L.map('ship-map', { zoomControl: true, scrollWheelZoom: false }).setView([RESTAURANT.lat, RESTAURANT.lng], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const pin = L.divIcon({
        className: 'map-pin',
        html: '<svg width="34" height="44" viewBox="0 0 44 56"><path d="M22 0C10 0 0 9.6 0 21.6 0 37.8 22 56 22 56s22-18.2 22-34.4C44 9.6 34 0 22 0z" fill="#f65a5a"/><circle cx="22" cy="21" r="9" fill="#fff"/></svg>',
        iconSize: [34, 44], iconAnchor: [17, 44],
    });
    const marker = L.marker([RESTAURANT.lat, RESTAURANT.lng], { icon: pin, draggable: true }).addTo(map);

    function show(place) {
        chosen = place;
        marker.setLatLng([place.lat, place.lng]);
        map.setView([place.lat, place.lng], Math.max(map.getZoom(), 15));
        const [title, ...rest] = place.address.split(', ');
        popup.querySelector('[data-ship-title]').textContent = title;
        popup.querySelector('[data-ship-address]').textContent = rest.join(', ') || place.address;
        popup.querySelector('[data-ship-coords]').textContent = `${place.lat.toFixed(6)}, ${place.lng.toFixed(6)}`;
        popup.hidden = false;
        msg.textContent = '';
    }

    async function geocode(url) {
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (!res.ok) throw new Error('geocoding failed');
        return res.json();
    }

    async function reverse(lat, lng) {
        try {
            const r = await geocode(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            show({ lat, lng, address: r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        } catch {
            show({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
    }

    document.querySelector('[data-ship-search]').addEventListener('submit', async e => {
        e.preventDefault();
        const q = e.target.q.value.trim();
        if (!q) { msg.textContent = 'Please type your address'; return; }
        msg.textContent = 'Searching…';
        try {
            const results = await geocode('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q));
            if (!results.length) { msg.textContent = 'Address not found, try adding the city'; return; }
            show({ lat: Number(results[0].lat), lng: Number(results[0].lon), address: results[0].display_name });
        } catch {
            msg.textContent = 'Could not search right now, please try again';
        }
    });

    document.querySelector('[data-ship-locate]').addEventListener('click', () => {
        if (!navigator.geolocation) { msg.textContent = 'Your browser cannot share its location'; return; }
        msg.textContent = 'Finding your location…';
        navigator.geolocation.getCurrentPosition(
            p => reverse(p.coords.latitude, p.coords.longitude),
            () => { msg.textContent = 'Location access was denied, please type your address instead'; },
            { enableHighAccuracy: true, timeout: 10000 });
    });

    // Dragging the pin or clicking the map picks that spot
    marker.on('dragend', () => { const p = marker.getLatLng(); reverse(p.lat, p.lng); });
    map.on('click', e => reverse(e.latlng.lat, e.latlng.lng));

    document.querySelector('[data-ship-confirm]').addEventListener('click', () => {
        if (!chosen) return;
        try { localStorage.setItem(KEY, JSON.stringify(chosen)); } catch { }
        location.href = '/Order/Checkout';
    });

    // Re-open with the previously chosen address
    try {
        const saved = JSON.parse(localStorage.getItem(KEY));
        if (saved && saved.lat) { show(saved); document.getElementById('ship-query').value = saved.address; }
    } catch { }
})();
