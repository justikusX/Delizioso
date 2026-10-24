import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { FormError } from '../../components/Form';
import Icon from '../../components/Icon';
import ModalStage, { StatusBanner } from '../../components/Modal/Modal';
import { ReservationDetail } from '../../components/Reservation';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import './Reservation.css';

export default function Cancel() {
    usePage('Cancel reservation', 'modal-page');
    const { code } = useParams();
    const navigate = useNavigate();
    const { data: reservation, error } = useLoad(`/reservations/${code}`);
    const [problem, setProblem] = useState('');
    const [sending, setSending] = useState(false);

    if (error) return <Navigate to={`/reservation/${code}`} replace />;
    if (!reservation) return <ModalStage close={`/reservation/${code}`} />;
    if (reservation.status === 'Cancelled') return <Navigate to={`/reservation/${code}`} replace />;

    const cancel = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api(`/reservations/${code}/cancel`, { method: 'POST' });
            navigate(`/reservation/${code}`);
        } catch (err) {
            setProblem(err.message);
            setSending(false);
        }
    };

    return (
        <ModalStage close={`/reservation/${code}`}>
            <StatusBanner color="orange">
                <h1>Are you sure you want to cancel the reservation?</h1>
                <p><Icon name="ticket" /> Booking ID : #{reservation.code}</p>
            </StatusBanner>

            <div className="res-summary">
                <div className="ring-photo"><img src="/img/about-table.png" alt="" /></div>
                <div className="res-summary-detail">
                    <h2 className="res-h">Reservation detail</h2>
                    <ReservationDetail when={reservation.reservedFor} guests={reservation.guests} />
                </div>
            </div>

            <FormError message={problem} />
            <form className="res-cancel-form" onSubmit={cancel}>
                <Link className="res-keep" to={`/reservation/${code}`}>Keep my reservation</Link>
                <button className="res-cancel-btn" type="submit" disabled={sending}>Cancel reservation</button>
            </form>
        </ModalStage>
    );
}
