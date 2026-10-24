import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';

export default function Layout() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const target = document.getElementById(hash.slice(1));
            if (target) return target.scrollIntoView();
        }
        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
