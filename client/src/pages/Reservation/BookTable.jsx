import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { FormError } from '../../components/Form';
import BookingArt from '../../components/Modal/BookingArt';
import { MAX_GUESTS, bookingDates, dateKey, parseLocal, slots, validateSlot } from '../../data';
import { usePage } from '../../hooks/usePage';
import { optionDate, people, time12 } from '../../utils/format';
import './Reservation.css';

export default function BookTable() {
    usePage('Book a table');
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const modify = params.get('modify');
    const [form, setForm] = useState({ date: '', time: '', guests: '' });
    const [error, setError] = useState('');
    const dates = bookingDates();

    useEffect(() => {
        if (!modify) return;
        api(`/reservations/${modify}`)
            .then((r) => {
                if (r.status === 'Cancelled') return;
                const when = new Date(r.reservedFor);
                const time = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
                setForm({ date: dateKey(when), time, guests: String(r.guests) });
            })
            .catch(() => {});
    }, [modify]);

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        const problem = validateSlot(form.date, form.time, form.guests);
        if (problem) return setError(problem);
        try {
            await api('/reservations/check', { method: 'POST', body: { ...form, guests: Number(form.guests) } });
            const query = new URLSearchParams({ date: form.date, time: form.time, guests: form.guests });
            if (modify) query.set('modify', modify);
            navigate(`/reservation/confirm?${query}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const today = dates[0];
    const tomorrow = dates[1];

    return (
        <section className="booking">
            <div className="container booking-inner">
                <BookingArt />
                <div className="booking-form">
                    <h1 className="title">{modify ? 'Change booking' : 'Book a table'}</h1>
                    <form onSubmit={submit} noValidate>
                        <FormError message={error} />
                        <label className="select-field">
                            <span className="sr-only">Date</span>
                            <select required value={form.date} onChange={set('date')}>
                                <option value="">Date</option>
                                {dates.map((d) => (
                                    <option key={d} value={d}>
                                        {d === today ? 'Today' : d === tomorrow ? 'Tomorrow' : optionDate(parseLocal(d))}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="select-field">
                            <span className="sr-only">Time</span>
                            <select required value={form.time} onChange={set('time')}>
                                <option value="">Time</option>
                                {slots().map((t) => (
                                    <option key={t} value={t}>{time12(parseLocal(today, t))}</option>
                                ))}
                            </select>
                        </label>

                        <label className="select-field">
                            <span className="sr-only">Party size</span>
                            <select required value={form.guests} onChange={set('guests')}>
                                <option value="">Party size</option>
                                {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((g) => (
                                    <option key={g} value={g}>{people(g)}</option>
                                ))}
                            </select>
                        </label>

                        <button className="booking-submit" type="submit">Book now</button>
                    </form>
                </div>
            </div>
        </section>
    );
}
