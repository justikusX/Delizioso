import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { FieldError, FormError } from '../../components/Form';
import { useAuth } from '../../context/AuthContext';
import { usePage } from '../../hooks/usePage';
import GoogleButton from './GoogleButton';

export default function Login() {
    usePage('Log in');
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const returnUrl = params.get('returnUrl') || '';
    const { signIn } = useAuth();
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [errors, setErrors] = useState({});
    const [problem, setProblem] = useState('');
    const [unconfirmed, setUnconfirmed] = useState('');
    const [sending, setSending] = useState(false);

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErrors({});
        setProblem('');
        try {
            signIn(await api('/auth/login', { method: 'POST', body: form }));
            navigate(returnUrl.startsWith('/') ? returnUrl : '/');
        } catch (error) {
            setErrors(error.errors);
            setProblem(error.data.message || (Object.keys(error.errors).length ? '' : error.message));
            setUnconfirmed(error.data.unconfirmed || '');
            setSending(false);
        }
    };

    const resend = async () => {
        const result = await api('/auth/resend', { method: 'POST', body: { email: unconfirmed } });
        navigate(`/account/check-email?email=${encodeURIComponent(result.email)}`, { state: result });
    };

    const query = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';

    return (
        <>
            <h1>Login</h1>
            <p className="auth-switch">
                Don't have an account? <Link to={`/account/register${query}`}>Sign up</Link>
            </p>

            {location.state?.notice && <p className="auth-notice">{location.state.notice}</p>}

            <form onSubmit={submit} noValidate>
                <FormError message={problem} />
                <label className="field">
                    <span>Email address</span>
                    <input type="email" className={errors.email ? 'input-validation-error' : ''} value={form.email} onChange={set('email')} placeholder="Robertmartine@gmail.com" autoComplete="email" />
                    <FieldError message={errors.email} />
                </label>
                <label className="field">
                    <span>Password</span>
                    <input type="password" className={errors.password ? 'input-validation-error' : ''} value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" />
                    <FieldError message={errors.password} />
                </label>
                <div className="auth-row">
                    <label className="check">
                        <input type="checkbox" checked={form.remember} onChange={set('remember')} /> <span>Remember me</span>
                    </label>
                    <Link to="/account/forgot-password">Forget Password?</Link>
                </div>
                <button className="auth-submit" type="submit" disabled={sending}>Log in</button>
            </form>

            {unconfirmed && (
                <div className="auth-resend">
                    <button type="button" onClick={resend}>Send the confirmation link again</button>
                </div>
            )}

            <GoogleButton label="Log in with google" returnUrl={returnUrl} />
        </>
    );
}
