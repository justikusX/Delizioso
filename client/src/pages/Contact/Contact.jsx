import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../api';
import { FieldError, FormError } from '../../components/Form';
import Icon from '../../components/Icon';
import { usePage } from '../../hooks/usePage';
import '../Reservation/Reservation.css';
import '../Order/Checkout.css';
import './Contact.css';

const SPOT = [40.885147, -73.9220459];
const empty = { firstName: '', lastName: '', email: '', subject: '', message: '' };

export default function Contact() {
    usePage('Contact us');
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [problem, setProblem] = useState('');
    const [sent, setSent] = useState('');
    const [cardOpen, setCardOpen] = useState(true);

    useEffect(() => {
        const map = L.map('contact-map', { scrollWheelZoom: false }).setView([SPOT[0] + 0.004, SPOT[1]], 14);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.marker(SPOT, {
            icon: L.divIcon({
                className: 'map-pin',
                iconSize: [52, 66],
                iconAnchor: [26, 66],
                html: '<svg width="52" height="66" viewBox="0 0 44 56"><path d="M22 0C10 0 0 9.6 0 21.6 0 37.8 22 56 22 56s22-18.2 22-34.4C44 9.6 34 0 22 0z" fill="#f65a5a"/><circle cx="22" cy="21" r="9" fill="#fff"/></svg>',
            }),
        }).addTo(map);
        return () => map.remove();
    }, []);

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setProblem('');
        try {
            const { name } = await api('/contact', { method: 'POST', body: form });
            setSent(name);
            setForm(empty);
        } catch (error) {
            setErrors(error.errors);
            if (!Object.keys(error.errors).length) setProblem(error.message);
        }
    };

    return (
        <section className="contact">
            <div className="container contact-inner">
                <h1 className="title center">Contact us</h1>
                <p className="contact-lead">We love hearing from our customers. Feel free to share your experience or ask any questions you may have.</p>

                {sent && <p className="contact-sent">Thank you, {sent}! Your message has been sent. We'll get back to you soon.</p>}
                <FormError message={problem} />

                <form className="contact-form" onSubmit={submit} noValidate>
                    <label className="co-field">
                        <span className="sr-only">First name</span>
                        <input value={form.firstName} onChange={set('firstName')} placeholder="First name" autoComplete="given-name" />
                        <FieldError message={errors.firstName} />
                    </label>
                    <label className="co-field">
                        <span className="sr-only">Last name</span>
                        <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" autoComplete="family-name" />
                    </label>
                    <label className="co-field">
                        <span className="sr-only">Email address</span>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" autoComplete="email" />
                        <FieldError message={errors.email} />
                    </label>
                    <label className="co-field">
                        <span className="sr-only">Subject</span>
                        <input value={form.subject} onChange={set('subject')} placeholder="Subject" />
                    </label>
                    <label className="co-field co-wide">
                        <span className="sr-only">Message</span>
                        <textarea rows="6" value={form.message} onChange={set('message')} placeholder="Message" />
                        <FieldError message={errors.message} />
                    </label>
                    <button className="booking-submit contact-submit" type="submit">Submit</button>
                </form>
            </div>

            <div className="contact-map-wrap">
                <div className="contact-map" id="contact-map"></div>
                {cardOpen && (
                    <div className="contact-card">
                        <button type="button" className="contact-card-close" aria-label="Hide" onClick={() => setCardOpen(false)}>
                            <Icon name="x" />
                        </button>
                        <img src="/img/reserve-small1.png" alt="" />
                        <div>
                            <h2>Delizioso Restaurant</h2>
                            <p>3247 Johnson Ave, Bronx, NY 10463, Amerika Serikat</p>
                            <p>40.885147, -73.9220459</p>
                        </div>
                        <a className="contact-go" href="https://www.google.com/maps/dir/?api=1&destination=40.885147,-73.9220459" target="_blank" rel="noopener noreferrer" aria-label="Get directions">
                            <Icon name="send" />
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
