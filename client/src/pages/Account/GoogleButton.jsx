import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

function loadGoogleScript() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export default function GoogleButton({ label, returnUrl }) {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [notice, setNotice] = useState('');

    const start = async () => {
        setNotice('');
        try {
            const { googleClientId } = await api('/auth/config');
            if (!googleClientId) return setNotice("Sign in with Google isn't set up yet. Please use your email and password.");
            await loadGoogleScript();
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: googleClientId,
                scope: 'openid email profile',
                ux_mode: 'popup',
                callback: async (response) => {
                    if (!response.code) return setNotice('Google sign-in was cancelled or failed. Please try again.');
                    try {
                        signIn(await api('/auth/google', { method: 'POST', body: { code: response.code } }));
                        navigate(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
                    } catch (error) {
                        setNotice(error.message);
                    }
                },
            });
            client.requestCode();
        } catch {
            setNotice('Google sign-in was cancelled or failed. Please try again.');
        }
    };

    return (
        <>
            <button className="auth-google" type="button" onClick={start}>
                <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                {label}
            </button>
            {notice && <p className="auth-notice auth-google-notice">{notice}</p>}
        </>
    );
}
