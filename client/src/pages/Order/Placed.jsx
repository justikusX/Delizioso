import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { StatusBanner } from '../../components/Modal/Modal';
import { METHODS, PAYMENTS } from '../../data';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import { dayName, money, time12 } from '../../utils/format';
import '../Order/Order.css';
import './Checkout.css';

export default function Placed() {
    usePage('Order placed');
    const { code } = useParams();
    const { data: order, error } = useLoad(`/orders/${code}`);

    if (error) {
        return (
            <section className="checkout placed">
                <div className="container checkout-inner center">
                    <h1 className="title">Order not found</h1>
                    <Link className="btn btn-orange" to="/order">Back to menu</Link>
                </div>
            </section>
        );
    }
    if (!order) return <section className="checkout placed" />;

    const method = METHODS.find((m) => m.value === order.method)?.label;
    const payment = PAYMENTS.find((p) => p.value === order.payment)?.label;

    return (
        <section className="checkout placed">
            <div className="container checkout-inner">
                <StatusBanner color="green" className="placed-banner">
                    <h1>Thank you, your order has been placed</h1>
                    <p><Icon name="ticket" /> Order ID : #{order.code}</p>
                    <p>
                        <Icon name="clock" />{' '}
                        {order.scheduledFor ? `Scheduled for ${dayName(order.scheduledFor)} ${time12(order.scheduledFor)}` : "We're preparing it now"}
                    </p>
                </StatusBanner>

                <div className="placed-grid">
                    <div>
                        <h2 className="co-h">Your order</h2>
                        <ul className="placed-items">
                            {order.items.map((item, i) => (
                                <li key={i}>
                                    <img src={item.imageUrl} alt="" />
                                    <span>{item.name} &times; {item.quantity}</span>
                                    <b>{money(item.unitPrice * item.quantity)}</b>
                                </li>
                            ))}
                        </ul>
                        <dl className="order-sums">
                            <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
                            <div><dt>Tax fee</dt><dd>{money(order.tax)}</dd></div>
                            <div>
                                <dt>Voucher {order.voucherCode ? `(${order.voucherCode})` : ''}</dt>
                                <dd>{order.discount > 0 ? `−${money(order.discount)}` : money(0)}</dd>
                            </div>
                            <div className="total"><dt>Total</dt><dd>{money(order.total)}</dd></div>
                        </dl>
                    </div>
                    <div className="res-card">
                        <h2 className="res-h">Order detail</h2>
                        <dl className="placed-detail">
                            <div><dt>Name</dt><dd>{order.customerName}</dd></div>
                            <div><dt>Phone</dt><dd>{order.phone}</dd></div>
                            <div><dt>Order method</dt><dd>{method}</dd></div>
                            {order.method === 'Delivery' && <div><dt>Address</dt><dd>{order.address}</dd></div>}
                            <div><dt>Payment</dt><dd>{payment}</dd></div>
                            {order.note && <div><dt>Note</dt><dd>{order.note}</dd></div>}
                        </dl>
                        {order.payment !== 'Cash' && <p className="co-hint">Our staff will contact you at {order.phone} with the payment details.</p>}
                    </div>
                </div>
                <div className="center"><Link className="btn btn-orange" to="/order">Back to menu</Link></div>
            </div>
        </section>
    );
}
