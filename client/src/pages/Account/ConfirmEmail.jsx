import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { usePage } from '../../hooks/usePage';

export default function ConfirmEmail() {
    usePage('Confirm email');
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const returnUrl = params.get('returnUrl') || '';
        api('/auth/confirm', { method: 'POST', body: { token: params.get('token') } })
            .then((result) => {
                signIn(result);
                if (returnUrl.startsWith('/')) navigate(returnUrl, { replace: true });
                else navigate('/account', { replace: true, state: { notice: 'Your email is confirmed. Welcome to Delizioso!' } });
            })
            .catch((error) => navigate('/account/login', { replace: true, state: { notice: error.message } }));
    }, [params, navigate, signIn]);

    return (
        <>
            <h1>Confirming…</h1>
            <p className="auth-switch">Please wait a moment.</p>
        </>
    );
}
