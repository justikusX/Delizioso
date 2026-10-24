import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { FieldError, FormError } from '../../components/Form';
import { usePage } from '../../hooks/usePage';
import GoogleButton from './GoogleButton';

export default function Register() {
    usePage('Sign up');
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const returnUrl = params.get('returnUrl') || '';
    const [form, setForm] = useState({ fullName: '', email: '', password: '', remember: false });
    const [errors, setErrors] = useState({});
    const [problem, setProblem] = useState('');
    const [sending, setSending] = useState(false);

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setErrors({});
        setProblem('');
        try {
            const result = await api('/auth/register', { method: 'POST', body: { ...form, returnUrl } });
            navigate(`/account/check-email?email=${encodeURIComponent(result.email)}`, { state: result });
        } catch (error) {
            setErrors(error.errors);
            setProblem(error.data.message || (Object.keys(error.errors).length ? '' : error.message));
            setSending(false);
        }
    };

    const query = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';

    return (
        <>
            <h1>Sign up</h1>
            <p className="auth-switch">
                Already have an account? <Link to={`/account/login${query}`}>Log in</Link>
            </p>

            <form onSubmit={submit} noValidate>
                <FormError message={problem} />
                <label className="field">
                    <span>Full name</span>
                    <input className={errors.fullName ? 'input-validation-error' : ''} value={form.fullName} onChange={set('fullName')} placeholder="Robert Martine" autoComplete="name" />
                    <FieldError message={errors.fullName} />
                </label>
                <label className="field">
                    <span>Email address</span>
                    <input type="email" className={errors.email ? 'input-validation-error' : ''} value={form.email} onChange={set('email')} placeholder="Robertmartine@gmail.com" autoComplete="email" />
                    <FieldError message={errors.email} />
                </label>
                <label className="field">
                    <span>Password</span>
                    <input type="password" className={errors.password ? 'input-validation-error' : ''} value={form.password} onChange={set('password')} placeholder="At least 6 characters" autoComplete="new-password" />
                    <FieldError message={errors.password} />
                </label>
                <div className="auth-row">
                    <label className="check">
                        <input type="checkbox" checked={form.remember} onChange={set('remember')} /> <span>Remember me</span>
                    </label>
                    <Link to="/account/forgot-password">Forget Password?</Link>
                </div>
                <button className="auth-submit" type="submit" disabled={sending}>Sign up</button>
            </form>

            <GoogleButton label="Sign up with google" returnUrl={returnUrl} />
        </>
    );
}
