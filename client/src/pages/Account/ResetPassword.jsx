import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { FieldError } from '../../components/Form';
import { useAuth } from '../../context/AuthContext';
import { usePage } from '../../hooks/usePage';

const expiredNotice = 'This reset link is invalid or has expired. Please request a new one.';

export default function ResetPassword() {
    usePage('New password');
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        api(`/auth/reset/${encodeURIComponent(token)}`)
            .then(({ valid }) => !valid && navigate('/account/forgot-password', { replace: true, state: { notice: expiredNotice } }))
            .catch(() => navigate('/account/forgot-password', { replace: true, state: { notice: expiredNotice } }));
    }, [token, navigate]);

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            signIn(await api('/auth/reset', { method: 'POST', body: { ...form, token } }));
            navigate('/account', { state: { notice: 'Your password has been changed.' } });
        } catch (error) {
            if (error.data.expired) return navigate('/account/forgot-password', { state: { notice: expiredNotice } });
            setErrors(error.errors);
        }
    };

    return (
        <>
            <h1>New password</h1>
            <p className="auth-switch">Choose a new password for your account.</p>
            <form onSubmit={submit} noValidate>
                <label className="field">
                    <span>New password</span>
                    <input type="password" className={errors.password ? 'input-validation-error' : ''} value={form.password} onChange={set('password')} placeholder="At least 6 characters" autoComplete="new-password" />
                    <FieldError message={errors.password} />
                </label>
                <label className="field">
                    <span>Repeat password</span>
                    <input type="password" className={errors.confirmPassword ? 'input-validation-error' : ''} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat the new password" autoComplete="new-password" />
                    <FieldError message={errors.confirmPassword} />
                </label>
                <button className="auth-submit" type="submit">Save password</button>
            </form>
        </>
    );
}
