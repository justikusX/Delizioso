import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../Icon';
import Logo from '../Logo';
import BookingArt from './BookingArt';
import './Modal.css';

export function ModalTop() {
    const { user } = useAuth();
    const location = useLocation();
    const back = encodeURIComponent(location.pathname + location.search);

    return (
        <div className="modal-top">
            <Logo />
            <div className="modal-top-actions">
                {user ? (
                    <Link className="user-name" to="/account">{user.fullName}</Link>
                ) : (
                    <>
                        <Link className="btn btn-orange btn-pill" to={`/account/login?returnUrl=${back}`}>Sign in</Link>
                        <Link className="btn btn-green btn-pill" to={`/account/register?returnUrl=${back}`}>Sign up</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ModalStage({ close, art = true, cardClass = '', children }) {
    return (
        <section className="modal-stage">
            {art && (
                <div className="modal-stage-art" aria-hidden="true">
                    <BookingArt />
                </div>
            )}
            <Link className="modal-close" to={close} aria-label="Close">
                <Icon name="x" />
            </Link>
            <div className={`modal-card ${cardClass}`.trim()}>
                <ModalTop />
                {children}
            </div>
        </section>
    );
}

export function StatusBanner({ color, className = '', children }) {
    return (
        <div className={`status-banner ${color} ${className}`.trim()}>
            <span className="bubble b1"></span>
            <span className="bubble b2"></span>
            <span className="bubble b3"></span>
            <span className="bubble b4"></span>
            {children}
        </div>
    );
}
