import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/format';
import CategoryTabs from './CategoryTabs';
import Pager from './Pager';
import Stars from './Stars';
import './MenuGrid.css';

function DishCard({ dish }) {
    const { add } = useCart();
    const [added, setAdded] = useState(false);

    const order = () => {
        add(dish.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 600);
    };

    return (
        <article className="dish-card">
            <img className="dish-img" src={dish.imageUrl} alt={dish.name} loading="lazy" />
            <h3>{dish.name}</h3>
            <Stars rating={dish.rating} />
            <p>{dish.description}</p>
            <div className="dish-footer">
                <span className="price">{money(dish.price)}</span>
                <button className={added ? 'btn btn-orange btn-md added' : 'btn btn-orange btn-md'} type="button" onClick={order}>
                    Order now
                </button>
            </div>
        </article>
    );
}

export default function MenuGrid({ title, categories, dishes, pageSize = 6 }) {
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    const visible = dishes.filter((d) => filter === 'all' || d.categoryId === filter);
    const pages = Math.max(1, Math.ceil(visible.length / pageSize));
    const current = Math.min(page, pages);

    const choose = (value) => {
        setFilter(value);
        setPage(1);
    };

    return (
        <div className="menu-grid-block">
            <h2 className="title center">{title}</h2>
            <CategoryTabs categories={categories} value={filter} onChange={choose} />
            <div className="dish-grid">
                {visible.slice((current - 1) * pageSize, current * pageSize).map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                ))}
            </div>
            {visible.length === 0 && <p className="empty-note">No dishes in this category yet.</p>}
            <Pager page={current} pages={pages} onChange={setPage} />
        </div>
    );
}
