import { useEffect, useState } from 'react';
import { api } from '../api';

export function useLoad(path) {
    const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });

    useEffect(() => {
        if (!path) return;
        let active = true;
        setState({ data: null, error: null, loading: true });
        api(path)
            .then((data) => active && setState({ data, error: null, loading: false }))
            .catch((error) => active && setState({ data: null, error, loading: false }));
        return () => {
            active = false;
        };
    }, [path]);

    return state;
}
