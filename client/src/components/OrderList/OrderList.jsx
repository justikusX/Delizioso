import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/format';
import { orderTotals } from '../../utils/order';
import Icon from '../Icon';

export default function OrderList({ dishes, withImages = false, page = false }) {
    const { items, setQuantity, voucher, setVoucher } = useCart();
    const totals = orderTotals(items, dishes, voucher);
    const [code, setCode] = useState(voucher ? voucher.code : '');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!voucher) return;
        setCode(voucher.code);
        setMessage(`Voucher applied: ${money(voucher.amount)} off`);
    }, [voucher]);

    const applyVoucher = async (e) => {
        e.preventDefault();
        const value = code.trim();
        if (!value) {
            setVoucher(null);
            setMessage('');
            return;
        }
        setMessage('Checking…');
        try {
            setVoucher(await api(`/vouchers/${encodeURIComponent(value)}`));
        } catch (error) {
            if (error.status === 404) {
                setVoucher(null);
                setMessage('This voucher code is not valid');
            } else {
                setMessage('Could not check the code, please try again');
            }
        }
    };

    return (
        <div className={page ? 'order-list page' : 'order-list'}>
            {!withImages && <h2 className="order-list-head">Order list</h2>}
            <div className="order-items">
                {totals.lines.length === 0 && <p className="order-empty">Your order list is empty. Tap “Order now” on a dish to add it.</p>}
                {totals.lines.map(({ dish, quantity, sum }) => (
                    <div className="order-item" key={dish.id}>
                        {withImages && <img src={dish.imageUrl} alt="" />}
                        <div className="order-item-body">
                            <div className="order-item-top">
                                <span className="order-item-name">{dish.name}</span>
                                <button type="button" className="order-remove" aria-label={`Remove ${dish.name}`} onClick={() => setQuantity(dish.id, 0)}>
                                    <Icon name="trash" />
                                </button>
                            </div>
                            <div className="order-item-bottom">
                                <div className="qty-control">
                                    <button type="button" aria-label="Less" onClick={() => setQuantity(dish.id, quantity - 1)}>&minus;</button>
                                    <span>{quantity}</span>
                                    <button type="button" aria-label="More" onClick={() => setQuantity(dish.id, quantity + 1)}>+</button>
                                </div>
                                <span className="order-item-price">{money(sum)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <form className="voucher" onSubmit={applyVoucher}>
                <label htmlFor={page ? 'voucher-page' : 'voucher-side'}>Voucher Code</label>
                <div className="voucher-row">
                    <input id={page ? 'voucher-page' : 'voucher-side'} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" autoComplete="off" />
                    <button type="submit" aria-label="Apply voucher">{voucher ? '✓' : '+'}</button>
                </div>
                <p className="voucher-msg">{message}</p>
            </form>
            <dl className="order-sums">
                <div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
                <div><dt>Tax fee</dt><dd>{money(totals.tax)}</dd></div>
                <div><dt>Voucher</dt><dd>{totals.discount ? `−${money(totals.discount)}` : money(0)}</dd></div>
                <div className="total"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
            </dl>
            <Link className={totals.lines.length ? 'order-checkout' : 'order-checkout disabled'} to="/order/checkout" aria-disabled={!totals.lines.length}>
                Checkout
            </Link>
        </div>
    );
}
