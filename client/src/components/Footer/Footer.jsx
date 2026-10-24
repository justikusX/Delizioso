import { Link } from 'react-router-dom';
import Logo from '../Logo';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container footer-grid">
                <div className="footer-about">
                    <Logo light />
                    <p>Viverra gravida morbi egestas facilisis tortor netus non duis tempor.</p>
                    <div className="socials">
                        <a href="#" aria-label="Twitter"><img src="/img/twitter.png" alt="" /></a>
                        <a href="#" aria-label="Instagram"><img src="/img/instagram.png" alt="" /></a>
                        <a href="#" aria-label="Facebook"><img src="/img/facebook.png" alt="" /></a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4>Page</h4>
                    <Link to="/">Home</Link>
                    <Link to="/menu">Menu</Link>
                    <Link to="/order">Order online</Link>
                    <a href="#">Catering</a>
                    <Link to="/reservation">Reservation</Link>
                </div>
                <div className="footer-col">
                    <h4>Information</h4>
                    <Link to="/about">About us</Link>
                    <Link to="/#testimonials">Testimonial</Link>
                    <a href="#">Event</a>
                </div>
                <div className="footer-col footer-contact">
                    <h4>Get in touch</h4>
                    <p>3247 Johnson Ave, Bronx, NY 10463, Amerika Serikat</p>
                    <a href="mailto:delizioso@gmail.com">delizioso@gmail.com</a>
                    <a href="tel:+12345678901">+123 4567 8901</a>
                </div>
            </div>
            <p className="copyright">Copyright &copy; {new Date().getFullYear()} Delizioso</p>
        </footer>
    );
}
