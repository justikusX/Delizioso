export default function Pager({ page, pages, onChange, label = 'Pages', hideSingle = false }) {
    if (hideSingle && pages <= 1) return null;
    return (
        <nav className="pager" aria-label={label}>
            <button className="pager-arrow prev" type="button" aria-label="Previous" disabled={page === 1} onClick={() => onChange(page - 1)}>
                <img src="/img/arrow-left.svg" alt="" />
            </button>
            <span className="pager-nums">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button" className={n === page ? 'pager-num active' : 'pager-num'} onClick={() => onChange(n)}>
                        {n}
                    </button>
                ))}
            </span>
            <button className="pager-arrow next" type="button" aria-label="Next" disabled={page === pages} onClick={() => onChange(page + 1)}>
                <img src="/img/arrow-right.svg" alt="" />
            </button>
        </nav>
    );
}
