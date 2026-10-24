import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { usePage } from '../../hooks/usePage';
import DevLink from './DevLink';

export default function CheckEmail() {
    usePage('Check your email');
    const [params] = useSearchParams();
    const location = useLocation();
    const email = params.get('email') || '';
    const [result, setResult] = useState(location.state || {});
    const [sending, setSending] = useState(false);

    const resend = async () => {
        setSending(true);
        try {
            setResult(await api('/auth/resend', { method: 'POST', body: { email } }));
        } catch {
            setResult({ mailFailed: true });
        }
        setSending(false);
    };

    return (
        <>
            <h1>Check your email</h1>
            <p className="auth-switch">
                We sent a confirmation link to <b>{email}</b>. Open it to finish creating your account.
            </p>
            <p className="auth-text">Didn't get it? Check the spam folder, or send the link again. The link is valid for 3 days.</p>
            <DevLink devLink={result.devLink} mailFailed={result.mailFailed} />
            <button className="auth-google" type="button" onClick={resend} disabled={sending}>Send the link again</button>
            <p className="auth-switch auth-bottom"><Link to="/account/login">Back to log in</Link></p>
        </>
    );
}
