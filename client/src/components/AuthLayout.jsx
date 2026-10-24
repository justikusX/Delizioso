import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../pages/Account/Auth.css';

export default function AuthLayout() {
    useEffect(() => {
        document.body.classList.add('auth-body');
        return () => document.body.classList.remove('auth-body');
    }, []);

    return (
        <div className="auth">
            <div className="auth-panel">
                <Link className="auth-logo" to="/" aria-label="Delizioso home">
                    <span className="logo-mark">D</span>
                </Link>
                <div className="auth-form">
                    <Outlet />
                </div>
                <p className="auth-copyright">Copyright &copy; {new Date().getFullYear()} Delizioso</p>
            </div>
            <div className="auth-image" role="img" aria-label="Pancakes with blueberries"></div>
        </div>
    );
}
