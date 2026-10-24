import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, TOKEN_KEY } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) return;
        api('/auth/me')
            .then((data) => setUser(data.user))
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
            })
            .finally(() => setLoading(false));
    }, []);

    const signIn = useCallback(({ token, user: account, remember }) => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
        setUser(account);
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    return <AuthContext.Provider value={{ user, setUser, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
