import { useEffect } from 'react';

export function usePage(title, bodyClass = '') {
    useEffect(() => {
        document.title = title ? `${title} - Delizioso` : 'Delizioso';
    }, [title]);

    useEffect(() => {
        if (!bodyClass) return;
        document.body.classList.add(bodyClass);
        return () => document.body.classList.remove(bodyClass);
    }, [bodyClass]);
}
