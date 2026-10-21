// Menu grid partial: category filter + pagination
(function () {
    const grid = document.querySelector('.dish-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.dish-card')];
    const pageSize = Number(grid.dataset.pageSize) || 6;
    const tabs = document.querySelectorAll('.category-tabs .tab');
    const nums = document.querySelector('.pager-nums');
    const prev = document.querySelector('.pager-arrow.prev');
    const next = document.querySelector('.pager-arrow.next');
    const empty = document.querySelector('.empty-note');
    let filter = 'all';
    let page = 1;

    function visibleCards() {
        return cards.filter(c => filter === 'all' || c.dataset.category === filter);
    }

    function render() {
        const list = visibleCards();
        const pages = Math.max(1, Math.ceil(list.length / pageSize));
        page = Math.min(page, pages);
        cards.forEach(c => c.hidden = true);
        list.slice((page - 1) * pageSize, page * pageSize).forEach(c => c.hidden = false);
        empty.hidden = list.length > 0;

        nums.innerHTML = '';
        for (let i = 1; i <= pages; i++) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'pager-num' + (i === page ? ' active' : '');
            b.textContent = i;
            b.addEventListener('click', () => { page = i; render(); });
            nums.appendChild(b);
        }
        prev.disabled = page === 1;
        next.disabled = page === pages;
    }

    tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.toggle('active', x === t));
        filter = t.dataset.filter;
        page = 1;
        render();
    }));
    prev.addEventListener('click', () => { page--; render(); });
    next.addEventListener('click', () => { page++; render(); });
    render();
})();

