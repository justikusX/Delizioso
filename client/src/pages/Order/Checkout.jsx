import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Icon from '../../components/Icon';
import { FieldError, FormError, PhoneCodeSelect } from '../../components/Form';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { METHODS, PAYMENTS, PHONE_CODES, laterSlots, splitName, splitPhone } from '../../data';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import { money, time12, toDate } from '../../utils/format';
import { orderTotals } from '../../utils/order';
import { ADDRESS_KEY, readJson, writeJson } from '../../utils/storage';
import '../../components/Modal/Modal.css';
import '../Reservation/Reservation.css';
import '../Order/Order.css';
import './Checkout.css';

const emptyForm = {
    firstName: '',
    lastName: '',
    phoneCode: PHONE_CODES[0].code,
    phone: '',
    email: '',
    note: '',
    orderTime: 'now',
    laterAt: '',
    method: 'Delivery',
    payment: 'Cash',
    acceptTerms: false,
};

export default function Checkout() {
    usePage('Checkout');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, voucher, clear } = useCart();
    const { data: menu } = useLoad('/menu');
    const { data: savedAddresses } = useLoad(user ? '/account/addresses' : null);
    const later = useMemo(() => laterSlots(), []);
    const today = new Date().getDate();

    const [form, setForm] = useState({ ...emptyForm, laterAt: later[0] || '' });
    const [place, setPlace] = useState(() => readJson(ADDRESS_KEY));
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!user) return;
        const [firstName, lastName] = splitName(user.fullName);
        const [phoneCode, phone] = user.phone ? splitPhone(user.phone) : [PHONE_CODES[0].code, ''];
        setForm((f) => ({ ...f, firstName, lastName, email: user.email, phoneCode, phone }));
    }, [user]);

    const totals = orderTotals(items, menu ? menu.dishes : [], voucher);
    const set = (name) => (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const chooseSaved = (a) => {
        const chosen = { address: a.text, lat: a.latitude, lng: a.longitude };
        writeJson(ADDRESS_KEY, chosen);
        setPlace(chosen);
    };

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErrors({});
        setFormError('');
        try {
            const { code } = await api('/orders', {
                method: 'POST',
                body: {
                    ...form,
                    address: place ? place.address : '',
                    latitude: place ? place.lat : null,
                    longitude: place ? place.lng : null,
                    voucherCode: totals.voucher ? totals.voucher.code : '',
                    cart: items,
                },
            });
            clear();
            navigate(`/order/${code}`);
        } catch (error) {
            setErrors(error.errors);
            setFormError(error.data.message || (Object.keys(error.errors).length ? '' : error.message));
            setSending(false);
            window.scrollTo(0, 0);
        }
    };

    return (
        <section className="checkout">
            <div className="container checkout-inner">
                <div className="checkout-head">
                    <Link className="back-circle" to="/order" aria-label="Back to menu"><Icon name="back" /></Link>
                    <h1 className="title">Checkout</h1>
                </div>

                <form onSubmit={submit} noValidate>
                    <FormError message={formError} />

                    {form.method === 'Delivery' && (
                        <div className="co-section">
                            <h2 className="co-h">Shipping address</h2>
                            <div className="co-address">
                                <input value={place ? place.address : ''} readOnly placeholder="Choose where we should deliver" onClick={() => navigate('/order/shipping')} />
                                <Link className="co-change" to="/order/shipping">{place ? 'Change' : 'Choose'}</Link>
                            </div>
                            <FieldError message={errors.address} />
                            {savedAddresses && savedAddresses.length > 0 && (
                                <div className="co-saved" aria-label="Your saved addresses">
                                    {savedAddresses.map((a) => (
                                        <button key={a.id} type="button" title={a.text} onClick={() => chooseSaved(a)}>{a.text}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="co-section">
                        <h2 className="co-h">Order data</h2>
                        <div className="co-grid">
                            <label className="co-field">
                                <span className="sr-only">First name</span>
                                <input value={form.firstName} onChange={set('firstName')} placeholder="First name" autoComplete="given-name" />
                                <FieldError message={errors.firstName} />
                            </label>
                            <label className="co-field">
                                <span className="sr-only">Last name</span>
                                <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" autoComplete="family-name" />
                            </label>
                            <div className="co-field phone-field co-phone">
                                <label className="phone-code">
                                    <span className="sr-only">Country code</span>
                                    <PhoneCodeSelect value={form.phoneCode} onChange={set('phoneCode')} />
                                </label>
                                <label className="phone-number">
                                    <span className="sr-only">Phone number</span>
                                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Phone number" autoComplete="tel-national" />
                                </label>
                            </div>
                            <label className="co-field">
                                <span className="sr-only">Email address</span>
                                <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" autoComplete="email" />
                                <FieldError message={errors.email} />
                            </label>
                            <FieldError message={errors.phone || errors.phoneCode} className="field-error co-phone-error" />
                            <label className="co-field co-wide">
                                <span className="sr-only">Note</span>
                                <textarea rows="4" value={form.note} onChange={set('note')} placeholder="Note" />
                            </label>
                        </div>
                    </div>

                    <div className="co-section">
                        <h2 className="co-h">Order time</h2>
                        <div className="co-radios">
                            <label className="round-check">
                                <input type="radio" name="orderTime" value="now" checked={form.orderTime === 'now'} onChange={set('orderTime')} /> <span>Order now</span>
                            </label>
                            <label className="round-check co-later">
                                <input type="radio" name="orderTime" value="later" checked={form.orderTime === 'later'} onChange={set('orderTime')} /> <span>Order later</span>
                                <select
                                    value={form.laterAt}
                                    aria-label="Order time"
                                    className={form.orderTime === 'later' ? '' : 'inactive'}
                                    onChange={(e) => setForm({ ...form, orderTime: 'later', laterAt: e.target.value })}
                                    onFocus={() => setForm({ ...form, orderTime: 'later' })}
                                >
                                    {later.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {toDate(slot).getDate() === today ? 'Today' : 'Tomorrow'} {time12(slot)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <FieldError message={errors.laterAt} />
                    </div>

                    <div className="co-section">
                        <h2 className="co-h">Order method</h2>
                        <div className="co-radios">
                            {METHODS.map((m) => (
                                <label className="round-check" key={m.value}>
                                    <input type="radio" name="method" value={m.value} checked={form.method === m.value} onChange={set('method')} /> <span>{m.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="co-section">
                        <h2 className="co-h">Payment method</h2>
                        <div className="co-payments">
                            {PAYMENTS.map((p) => (
                                <label className="round-check co-pay" key={p.value}>
                                    <input type="radio" name="payment" value={p.value} checked={form.payment === p.value} onChange={set('payment')} /> <span>{p.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="co-hint">Online payment isn't connected yet: for card, virtual account or bank transfer our staff will contact you with the payment details.</p>
                    </div>

                    <label className="square-check">
                        <input type="checkbox" checked={form.acceptTerms} onChange={set('acceptTerms')} />
                        <span>Choose to indicate that you have read and agree to our Terms of use &amp; Privacy Policy.</span>
                    </label>
                    <FieldError message={errors.acceptTerms} />

                    <p className="co-total">
                        {totals.count ? (
                            <>
                                {totals.count} {totals.count === 1 ? 'item' : 'items'} &middot; Total <b>{money(totals.total)}</b>
                                {totals.discount ? ` (voucher −${money(totals.discount)})` : ''}
                            </>
                        ) : (
                            <>
                                Your order list is empty. <Link to="/order">Add dishes from the menu</Link>.
                            </>
                        )}
                    </p>
                    <button className="booking-submit co-submit" type="submit" disabled={sending}>
                        {sending ? 'Sending…' : 'Order now'}
                    </button>
                </form>
            </div>
        </section>
    );
}
