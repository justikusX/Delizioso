import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { FieldError, FormError, PhoneCodeSelect } from '../../components/Form';
import ModalStage from '../../components/Modal/Modal';
import { ReservationDetail, RestaurantInfo } from '../../components/Reservation';
import { useAuth } from '../../context/AuthContext';
import { HOLD_MINUTES, OCCASIONS, PHONE_CODES, parseLocal, splitName, splitPhone, validateSlot } from '../../data';
import { usePage } from '../../hooks/usePage';
import './Reservation.css';

function forgetHold(key) {
    try {
        sessionStorage.removeItem(key);
    } catch {
        return;
    }
}

function useHold(key) {
    const total = HOLD_MINUTES * 60 * 1000;
    const [left, setLeft] = useState(total);

    useEffect(() => {
        let start = Date.now();
        try {
            const saved = Number(sessionStorage.getItem(key));
            if (saved && Date.now() - saved < total) start = saved;
            sessionStorage.setItem(key, String(start));
        } catch {
            start = Date.now();
        }
        const tick = () => {
            const ms = Math.max(0, total - (Date.now() - start));
            setLeft(ms);
            if (ms === 0) {
                clearInterval(timer);
                forgetHold(key);
            }
        };
        const timer = setInterval(tick, 1000);
        tick();
        return () => clearInterval(timer);
    }, [key, total]);

    const seconds = Math.ceil(left / 1000);
    return { expired: left === 0, text: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} minutes` };
}

export default function Confirm() {
    usePage('Confirm reservation', 'modal-page');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [params] = useSearchParams();
    const date = params.get('date');
    const time = params.get('time');
    const guests = Number(params.get('guests'));
    const modify = params.get('modify');
    const hold = useHold(`delizioso-hold:${params.toString()}`);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phoneCode: PHONE_CODES[0].code,
        phone: '',
        email: '',
        occasion: '',
        specialRequest: '',
        newsletter: false,
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (modify) {
            api(`/reservations/${modify}`)
                .then((r) => {
                    if (r.status === 'Cancelled') return;
                    const [firstName, lastName] = splitName(r.customerName);
                    const [phoneCode, phone] = splitPhone(r.phone);
                    setForm({ firstName, lastName, phoneCode, phone, email: r.email, occasion: r.occasion, specialRequest: r.specialRequest, newsletter: r.newsletter });
                })
                .catch(() => {});
        } else if (user) {
            const [firstName, lastName] = splitName(user.fullName);
            const [phoneCode, phone] = user.phone ? splitPhone(user.phone) : [PHONE_CODES[0].code, ''];
            setForm((f) => ({ ...f, firstName, lastName, email: user.email, phoneCode, phone }));
        }
    }, [modify, user]);

    if (validateSlot(date, time, guests)) return <Navigate to="/reservation" replace />;

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErrors({});
        setFormError('');
        try {
            const { code } = await api('/reservations', { method: 'POST', body: { ...form, date, time, guests, modify } });
            forgetHold(`delizioso-hold:${params.toString()}`);
            navigate(`/reservation/${code}`);
        } catch (error) {
            setErrors(error.errors);
            setFormError(error.data.message || (Object.keys(error.errors).length ? '' : error.message));
            setSending(false);
        }
    };

    const changeLink = modify ? `/reservation?modify=${modify}` : '/reservation';

    return (
        <ModalStage close="/reservation">
            <h1 className="title center">Reservation</h1>

            <p className={hold.expired ? 'hold-banner expired' : 'hold-banner'}>
                {hold.expired ? (
                    <span>
                        Your hold has expired. <Link to={changeLink}>Choose the time again</Link> to make sure the table is still free.
                    </span>
                ) : (
                    <span>
                        Due to limited availability, we can hold this table for you for <b>{hold.text}</b>
                    </span>
                )}
            </p>

            <form className="res-confirm" onSubmit={submit} noValidate>
                <div className="res-col res-col-form">
                    <h2 className="res-h">Data order</h2>
                    <FormError message={formError} />

                    <label className="big-field">
                        <span className="sr-only">First name</span>
                        <input value={form.firstName} onChange={set('firstName')} placeholder="First name" autoComplete="given-name" />
                        <FieldError message={errors.firstName} />
                    </label>
                    <label className="big-field">
                        <span className="sr-only">Last name</span>
                        <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" autoComplete="family-name" />
                    </label>
                    <div className="big-field phone-field">
                        <label className="phone-code">
                            <span className="sr-only">Country code</span>
                            <PhoneCodeSelect value={form.phoneCode} onChange={set('phoneCode')} />
                        </label>
                        <label className="phone-number">
                            <span className="sr-only">Phone number</span>
                            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Phone number" autoComplete="tel-national" />
                        </label>
                        <FieldError message={errors.phone || errors.phoneCode} />
                    </div>
                    <label className="big-field">
                        <span className="sr-only">Email address</span>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" autoComplete="email" />
                        <FieldError message={errors.email} />
                    </label>
                    <label className="big-field select-arrow">
                        <span className="sr-only">Occasion</span>
                        <select value={form.occasion} onChange={set('occasion')}>
                            <option value="">Select an occasion (optional)</option>
                            {OCCASIONS.map((o) => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </label>
                    <label className="big-field">
                        <span className="sr-only">Special request</span>
                        <textarea rows="6" value={form.specialRequest} onChange={set('specialRequest')} placeholder="Add a special request" />
                    </label>

                    <label className="round-check">
                        <input type="checkbox" checked={form.newsletter} onChange={set('newsletter')} />
                        <span>Sign me up to receive dining offers and news from this restaurant by email.</span>
                    </label>
                </div>

                <div className="res-col res-col-side">
                    <div className="res-card">
                        <h2 className="res-h">Reservation detail</h2>
                        <ReservationDetail when={parseLocal(date, time)} guests={guests} />
                        <Link className="res-change" to={changeLink}>Change date or time</Link>
                    </div>
                    <RestaurantInfo />
                </div>

                <button className="booking-submit res-submit" type="submit" disabled={hold.expired || sending}>
                    {modify ? 'Save changes' : 'Confirm reservation'}
                </button>
            </form>
        </ModalStage>
    );
}
