import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { FieldError, PhoneCodeSelect } from '../../components/Form';
import Icon from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';
import { PHONE_CODES, splitPhone } from '../../data';
import { usePage } from '../../hooks/usePage';
import { longDate, money, monthYear, people, shortDate, time12 } from '../../utils/format';
import '../../components/Modal/Modal.css';
import './Auth.css';
import '../Contact/Contact.css';
import './Account.css';

function ProfileForm({ user, onSaved }) {
    const { setUser } = useAuth();
    const [phoneCode, phone] = user.phone ? splitPhone(user.phone) : [PHONE_CODES[0].code, ''];
    const [form, setForm] = useState({ fullName: user.fullName, phoneCode, phone });
    const [errors, setErrors] = useState({});

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const result = await api('/account/profile', { method: 'PUT', body: form });
            setUser(result.user);
            onSaved('Your profile has been saved.');
        } catch (error) {
            setErrors(error.errors);
        }
    };

    return (
        <form className="account-form" onSubmit={submit} noValidate>
            <label className="field">
                <span>Full name</span>
                <input value={form.fullName} onChange={set('fullName')} autoComplete="name" />
                <FieldError message={errors.fullName} />
            </label>
            <div className="field">
                <span>Phone</span>
                <div className="account-phone">
                    <PhoneCodeSelect value={form.phoneCode} onChange={set('phoneCode')} aria-label="Country code" />
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Phone number" autoComplete="tel-national" aria-label="Phone number" />
                </div>
                <FieldError message={errors.phone} />
            </div>
            <button className="auth-submit" type="submit">Save profile</button>
        </form>
    );
}

export default function Account() {
    usePage('My account');
    const { user, loading } = useAuth();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [notice, setNotice] = useState(location.state?.notice || '');

    useEffect(() => {
        if (user) api('/account').then(setData).catch(() => setData(null));
    }, [user]);

    if (loading) return <section className="account" />;
    if (!user) return <Navigate to="/account/login?returnUrl=%2Faccount" replace />;
    if (!data) return <section className="account" />;

    const deleteAddress = async (id) => {
        await api(`/account/addresses/${id}`, { method: 'DELETE' });
        setData({ ...data, addresses: data.addresses.filter((a) => a.id !== id) });
    };

    const now = new Date();
    const upcoming = data.reservations
        .filter((r) => r.status !== 'Cancelled' && new Date(r.reservedFor) >= now)
        .sort((a, b) => new Date(a.reservedFor) - new Date(b.reservedFor));
    const past = data.reservations.filter((r) => !upcoming.includes(r));

    return (
        <section className="account">
            <div className="container">
                <h1 className="title center">My account</h1>
                {notice && <p className="contact-sent">{notice}</p>}

                <div className="account-grid">
                    <aside className="account-side">
                        <div className="res-card account-card">
                            <div className="account-avatar">{user.fullName ? user.fullName[0].toUpperCase() : '?'}</div>
                            <h2>{user.fullName}</h2>
                            <p className="account-email">{user.email}</p>
                            <p className="account-badge">
                                {user.google ? 'Signed in with Google' : 'Email account'} &middot; since {monthYear(user.createdAt)}
                            </p>
                            <ProfileForm user={user} onSaved={setNotice} />
                            {!user.hasPassword && (
                                <p className="co-hint">
                                    You sign in with Google. <Link to="/account/forgot-password">Set a password</Link> to also log in by email.
                                </p>
                            )}
                        </div>

                        <div className="res-card account-card" id="addresses">
                            <h2 className="res-h">Saved addresses</h2>
                            {data.addresses.length === 0 && <p className="account-empty">Addresses from your delivery orders will appear here.</p>}
                            <ul className="account-addresses">
                                {data.addresses.map((a) => (
                                    <li key={a.id}>
                                        <span>{a.text}</span>
                                        <button type="button" className="order-remove" aria-label="Delete address" onClick={() => deleteAddress(a.id)}>
                                            <Icon name="trash" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <div className="account-main">
                        <h2 className="co-h">My orders</h2>
                        {data.orders.length === 0 && (
                            <p className="account-empty">No orders yet. <Link to="/order">Order something tasty</Link>.</p>
                        )}
                        {data.orders.map((o) => (
                            <article className="account-order" key={o.code}>
                                <header>
                                    <div>
                                        <b>#{o.code}</b>
                                        <span>{shortDate(o.createdAt)}, {time12(o.createdAt)}</span>
                                    </div>
                                    <span className="account-status">{o.status}</span>
                                </header>
                                <p className="account-items">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
                                <p className="account-where">{o.method === 'Delivery' ? `Delivery to ${o.address}` : 'Take away'}</p>
                                <footer>
                                    <b>{money(o.total)}</b>
                                    <Link to={`/order/${o.code}`}>Details</Link>
                                </footer>
                            </article>
                        ))}

                        <h2 className="co-h account-h">My reservations</h2>
                        {data.reservations.length === 0 && (
                            <p className="account-empty">No reservations yet. <Link to="/reservation">Book a table</Link>.</p>
                        )}
                        {[...upcoming, ...past].map((r) => {
                            const soon = upcoming.includes(r);
                            return (
                                <article className={soon ? 'account-order' : 'account-order past'} key={r.code}>
                                    <header>
                                        <div>
                                            <b>#{r.code}</b>
                                            <span>{longDate(r.reservedFor)} at {time12(r.reservedFor)}</span>
                                        </div>
                                        <span className="account-status">{soon ? 'Upcoming' : r.status === 'Cancelled' ? 'Cancelled' : 'Past'}</span>
                                    </header>
                                    <p className="account-items">
                                        {people(r.guests)}
                                        {r.occasion ? ` · ${r.occasion}` : ''}
                                    </p>
                                    <footer>
                                        <span></span>
                                        <Link to={`/reservation/${r.code}`}>{soon ? 'Change or cancel' : 'Details'}</Link>
                                    </footer>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
