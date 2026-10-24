export default function CategoryTabs({ categories, value, onChange, className = '' }) {
    return (
        <div className={`category-tabs ${className}`.trim()} role="tablist">
            <button className={value === 'all' ? 'tab active' : 'tab'} type="button" onClick={() => onChange('all')}>
                All category
            </button>
            {categories.map((c) => (
                <button key={c.id} className={value === c.id ? 'tab active' : 'tab'} type="button" onClick={() => onChange(c.id)}>
                    {c.name}
                </button>
            ))}
        </div>
    );
}
