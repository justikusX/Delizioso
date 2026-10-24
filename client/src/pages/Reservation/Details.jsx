import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import Icon from '../../components/Icon';
import ModalStage, { StatusBanner } from '../../components/Modal/Modal';
import { ReservationDetail, RestaurantInfo } from '../../components/Reservation';
import { OCCASIONS } from '../../data';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import './Reservation.css';

function Notes({ reservation }) {
    const [notes, setNotes] = useState({ occasion: reservation.occasion, specialRequest: reservation.specialRequest });
    const [status, setStatus] = useState('');
    const timer = useRef(null);

    const save = async (value) => {
        setStatus('Saving…');
        try {
            await api(`/reservations/${reservation.code}/notes`, { method: 'PATCH', body: value });
            setStatus('Saved');
        } catch (error) {
            setStatus(error.status === 0 ? 'Could not save, please check your connection' : 'Could not save, please try again');
        }
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    const changeOccasion = (e) => {
        const value = { ...notes, occasion: e.target.value };
        setNotes(value);
        save(value);
    };

    const changeRequest = (e) => {
        const value = { ...notes, specialRequest: e.target.value };
        setNotes(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => save(value), 800);
    };

    return (
        <form className="res-notes" onSubmit={(e) => { e.preventDefault(); save(notes); }}>
            <label className="big-field select-arrow">
                <span className="sr-only">Occasion</span>
                <select value={notes.occasion} onChange={changeOccasion}>
                    <option value="">Select an occasion (optional)</option>
                    {OCCASIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </label>
            <label className="big-field">
                <span className="sr-only">Special request</span>
                <textarea rows="7" maxLength="1000" value={notes.specialRequest} onChange={changeRequest} placeholder="Add a special request" />
            </label>
            <p className="autosave-status" aria-live="polite">{status}</p>
        </form>
    );
}

export default function Details() {
    const { code } = useParams();
    const { data: reservation, error } = useLoad(`/reservations/${code}`);
    const cancelled = reservation?.status === 'Cancelled';
    usePage(error ? 'Reservation not found' : cancelled ? 'Reservation cancelled' : 'Reservation confirmed', 'modal-page');

    if (error) {
        return (
            <ModalStage close="/reservation">
                <h1 className="title center">Reservation not found</h1>
                <div className="center"><Link className="btn btn-orange" to="/reservation">Book a table</Link></div>
            </ModalStage>
        );
    }
    if (!reservation) return <ModalStage close="/reservation" />;

    return (
        <ModalStage close="/reservation">
            <StatusBanner color={cancelled ? 'grey' : 'green'}>
                <h1>{cancelled ? 'Reservation has been cancelled' : 'Reservation has been confirmed'}</h1>
                {!cancelled && <p><Icon name="check" /> Keep this page or your booking ID to change or cancel the reservation</p>}
                <p><Icon name="ticket" /> Booking ID : #{reservation.code}</p>
            </StatusBanner>

            <div className="res-summary">
                <div className="ring-photo"><img src="/img/about-table.png" alt="" /></div>
                <div className={cancelled ? 'res-summary-detail muted' : 'res-summary-detail'}>
                    <h2 className="res-h">Reservation detail</h2>
                    <ReservationDetail when={reservation.reservedFor} guests={reservation.guests} />
                </div>
                <div className="res-actions">
                    {cancelled ? (
                        <Link className="res-action modify" to="/reservation">Book again</Link>
                    ) : (
                        <>
                            <Link className="res-action modify" to={`/reservation?modify=${reservation.code}`}>Modify <Icon name="edit" /></Link>
                            <Link className="res-action cancel" to={`/reservation/${reservation.code}/cancel`}>Cancel <Icon name="x" /></Link>
                        </>
                    )}
                </div>
            </div>

            <div className="res-extra">
                {cancelled ? <div></div> : <Notes reservation={reservation} />}
                <RestaurantInfo />
            </div>
        </ModalStage>
    );
}
