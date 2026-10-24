import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
    return (
        <Link className={light ? 'logo logo-light' : 'logo'} to="/">
            <span className="logo-mark">D</span>
            <span className="logo-text">
                Delizi<span>oso</span>
            </span>
        </Link>
    );
}
