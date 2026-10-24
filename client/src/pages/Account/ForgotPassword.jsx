import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { FieldError, FormError } from '../../components/Form';
import { usePage } from '../../hooks/usePage';
import DevLink from './DevLink';

export default function ForgotPassword() {
    usePage('Forgot password');
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [problem, setProblem] = useState('');
    const [sent, setSent] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setProblem('');
        try {
            setSent(await api('/auth/forgot', { method: 'POST', body: { email } }));
        } catch (error) {
            setErrors(error.errors);
            if (!Object.keys(error.errors).length) setProblem(error.message);
        }
    };

    return (
        <>
            <h1>Forgot password</h1>
            <p className="auth-switch">
                Remembered it? <Link to="/account/login">Log in</Link>
            </p>
            {location.state?.notice && <p className="auth-notice">{location.state.notice}</p>}

            {sent ? (
                <>
                    <p className="auth-notice">
                        If an account exists for <b>{sent.email}</b>, we've sent a link to reset the password. It is valid for 2 hours.
                    </p>
                    <DevLink devLink={sent.devLink} mailFailed={sent.mailFailed} />
                </>
            ) : (
                <form onSubmit={submit} noValidate>
                    <FormError message={problem} />
                    <label className="field">
                        <span>Email address</span>
                        <input type="email" className={errors.email ? 'input-validation-error' : ''} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Robertmartine@gmail.com" autoComplete="email" />
                        <FieldError message={errors.email} />
                    </label>
                    <button className="auth-submit" type="submit">Send reset link</button>
                </form>
            )}
        </>
    );
}
