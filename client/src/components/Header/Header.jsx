import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Logo from '../Logo';
import './Header.css';

const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About us' },
    { to: '/order', label: 'Order online' },
    { to: '/reservation', label: 'Reservation' },
    { to: '/contact', label: 'Contact us' },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { count } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const logOut = () => {
        signOut();
        navigate('/');
    };

    useEffect(() => setOpen(false), [location.pathname]);

    return (
        <header className={open ? 'site-header nav-open' : 'site-header'}>
            <div className="container header-inner">
                <Logo />

                <button className="nav-toggle" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>
                    <svg className="nav-icon-grid" width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.6" aria-hidden="true">
                        <rect x="1" y="1" width="8" height="8" rx="2.5" stroke="#311f09" />
                        <rect x="13" y="1" width="8" height="8" rx="2.5" stroke="#311f09" />
                        <rect x="1" y="13" width="8" height="8" rx="2.5" stroke="#311f09" />
                        <rect x="13" y="13" width="8" height="8" rx="4" stroke="#ff8a00" />
                    </svg>
                    <svg className="nav-icon-close" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#311f09" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                        <path d="M3 3l14 14M17 3L3 17" />
                    </svg>
                </button>

                <nav className="main-nav">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end}>
                            {link.label}
                        </NavLink>
                    ))}
                    <div className="nav-account">
                        {user ? (
                            <>
                                <Link to="/account">My account</Link>
                                <button type="button" onClick={logOut}>Log out ({user.fullName})</button>
                            </>
                        ) : (
                            <Link to="/account/login">Log in</Link>
                        )}
                    </div>
                </nav>

                <div className="header-actions">
                    <Link className="cart" to="/order" aria-label="Cart">
                        <img src="/img/cart.svg" alt="" width="24" height="24" />
                        <span className="cart-badge" hidden={count === 0}>{count}</span>
                    </Link>
                    {user ? (
                        <>
                            <Link className="user-name" to="/account" title="My account">{user.fullName}</Link>
                            <button className="btn btn-green btn-sm" type="button" onClick={logOut}>Log out</button>
                        </>
                    ) : (
                        <Link className="btn btn-green btn-sm" to="/account/login">Log in</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
