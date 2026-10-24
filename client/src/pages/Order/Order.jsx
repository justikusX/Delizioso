import { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryTabs from '../../components/MenuGrid/CategoryTabs';
import Pager from '../../components/MenuGrid/Pager';
import Stars from '../../components/MenuGrid/Stars';
import OrderList from '../../components/OrderList/OrderList';
import { useCart } from '../../context/CartContext';
import { GROUPS } from '../../data';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import { money } from '../../utils/format';
import { orderTotals } from '../../utils/order';
import '../../components/MenuGrid/MenuGrid.css';
import './Order.css';

const PAGE_SIZE = 9;

function OrderCard({ dish }) {
    const { items, add } = useCart();
    const quantity = items[dish.id] || 0;

    return (
        <article className={quantity ? 'order-card in-cart' : 'order-card'}>
            <img src={dish.imageUrl} alt={dish.name} loading="lazy" />
            <h3>{dish.name}</h3>
            <Stars rating={dish.rating} small />
            <p>{dish.description}</p>
            <div className="order-card-footer">
                <span className="price">{money(dish.price)}</span>
                <button className="order-add" type="button" aria-label={`Add ${dish.name} to the order`} onClick={() => add(dish.id)}>
                    <span className="lbl">Order now</span>
                    <span className="plus" aria-hidden="true">+</span>
                    <span className="qty">{quantity ? `${quantity}x` : ''}</span>
                </button>
            </div>
        </article>
    );
}

function OrderGroup({ name, dishes }) {
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(dishes.length / PAGE_SIZE));
    const current = Math.min(page, pages);

    return (
        <section className="order-group">
            <h2 className="group-title">{name}</h2>
            <div className="order-grid">
                {dishes.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((dish) => (
                    <OrderCard key={dish.id} dish={dish} />
                ))}
            </div>
            <Pager page={current} pages={pages} onChange={setPage} label={`${name} pages`} hideSingle />
        </section>
    );
}

export default function Order() {
    usePage('Order online');
    const { data } = useLoad('/menu');
    const { items, voucher } = useCart();
    const [filter, setFilter] = useState('all');

    const dishes = data ? data.dishes : [];
    const visible = dishes.filter((d) => filter === 'all' || d.categoryId === filter);
    const totals = orderTotals(items, dishes, voucher);

    return (
        <section className="order-page">
            <div className="container">
                <h1 className="title center">Menu</h1>
                {data && <CategoryTabs className="order-tabs" categories={data.categories} value={filter} onChange={setFilter} />}

                <div className="order-layout">
                    <div className="order-sections">
                        {GROUPS.map((group) => {
                            const list = visible.filter((d) => d.group === group);
                            return list.length ? <OrderGroup key={`${group}-${filter}`} name={group} dishes={list} /> : null;
                        })}
                        {data && visible.length === 0 && <p className="empty-note">No dishes in this category yet.</p>}
                    </div>
                    <aside className="order-aside">
                        <OrderList dishes={dishes} />
                    </aside>
                </div>
            </div>

            <div className={totals.count ? 'order-bar' : 'order-bar empty'}>
                <div>
                    <span>{totals.count} {totals.count === 1 ? 'Item' : 'Items'}</span>
                    <b>{money(totals.total)}</b>
                </div>
                <Link className="order-bar-btn" to="/order/list">Order now</Link>
            </div>
        </section>
    );
}
