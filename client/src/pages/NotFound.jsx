import { Link } from 'react-router-dom';
import { usePage } from '../hooks/usePage';

export default function NotFound() {
    usePage('Page not found');

    return (
        <section className="popular menu-page">
            <div className="container center">
                <h1 className="title center">Page not found</h1>
                <p className="lead" style={{ margin: '0 auto 40px' }}>The page you are looking for doesn't exist or has been moved.</p>
                <Link className="btn btn-orange" to="/">Back to home</Link>
            </div>
        </section>
    );
}
