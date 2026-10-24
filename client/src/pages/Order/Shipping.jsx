import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '../../components/Icon';
import ModalStage from '../../components/Modal/Modal';
import { usePage } from '../../hooks/usePage';
import { ADDRESS_KEY, readJson, writeJson } from '../../utils/storage';
import './Shipping.css';

const RESTAURANT = { lat: 40.885147, lng: -73.9220459 };

const pinIcon = L.divIcon({
    className: 'map-pin',
    html: '<svg width="34" height="44" viewBox="0 0 44 56"><path d="M22 0C10 0 0 9.6 0 21.6 0 37.8 22 56 22 56s22-18.2 22-34.4C44 9.6 34 0 22 0z" fill="#f65a5a"/><circle cx="22" cy="21" r="9" fill="#fff"/></svg>',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
});

async function geocode(url) {
    const response = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!response.ok) throw new Error('geocoding failed');
    return response.json();
}

export default function Shipping() {
    usePage('Shipping address', 'modal-page');
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [query, setQuery] = useState('');
    const [message, setMessage] = useState('');
    const [chosen, setChosen] = useState(null);

    const show = (place) => {
        setChosen(place);
        setMessage('');
        markerRef.current?.setLatLng([place.lat, place.lng]);
        mapRef.current?.setView([place.lat, place.lng], Math.max(mapRef.current.getZoom(), 15));
    };

    const reverse = async (lat, lng) => {
        try {
            const r = await geocode(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            show({ lat, lng, address: r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        } catch {
            show({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
    };

    useEffect(() => {
        const map = L.map('ship-map', { scrollWheelZoom: false }).setView([RESTAURANT.lat, RESTAURANT.lng], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        const marker = L.marker([RESTAURANT.lat, RESTAURANT.lng], { icon: pinIcon, draggable: true }).addTo(map);
        marker.on('dragend', () => {
            const p = marker.getLatLng();
            reverse(p.lat, p.lng);
        });
        map.on('click', (e) => reverse(e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        markerRef.current = marker;

        const saved = readJson(ADDRESS_KEY);
        if (saved && saved.lat) {
            setQuery(saved.address);
            show(saved);
        }
        return () => map.remove();
    }, []);

    const search = async (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return setMessage('Please type your address');
        setMessage('Searching…');
        try {
            const results = await geocode(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
            if (!results.length) return setMessage('Address not found, try adding the city');
            show({ lat: Number(results[0].lat), lng: Number(results[0].lon), address: results[0].display_name });
        } catch {
            setMessage('Could not search right now, please try again');
        }
    };

    const locate = () => {
        if (!navigator.geolocation) return setMessage('Your browser cannot share its location');
        setMessage('Finding your location…');
        navigator.geolocation.getCurrentPosition(
            (p) => reverse(p.coords.latitude, p.coords.longitude),
            () => setMessage('Location access was denied, please type your address instead'),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const confirm = () => {
        writeJson(ADDRESS_KEY, chosen);
        navigate('/order/checkout');
    };

    const [title, ...rest] = chosen ? chosen.address.split(', ') : [''];

    return (
        <ModalStage close="/order/checkout" art={false} cardClass="ship-card">
            <div className="ship-head">
                <Link className="back-circle" to="/order/checkout" aria-label="Back to checkout"><Icon name="back" /></Link>
                <h1>Shipping address</h1>
            </div>

            <form className="ship-search" onSubmit={search}>
                <label className="sr-only" htmlFor="ship-query">Address</label>
                <input id="ship-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Please type your address" autoComplete="street-address" />
                <button type="submit">Search</button>
            </form>
            <button className="ship-locate" type="button" onClick={locate}><Icon name="send" /> Use your current location</button>
            <p className="ship-msg" aria-live="polite">{message}</p>

            <div className="ship-map-wrap">
                <div className="ship-map" id="ship-map"></div>
                {chosen && (
                    <div className="ship-popup">
                        <div className="ship-popup-pin" aria-hidden="true">
                            <svg width="44" height="56" viewBox="0 0 44 56">
                                <path d="M22 0C10 0 0 9.6 0 21.6 0 37.8 22 56 22 56s22-18.2 22-34.4C44 9.6 34 0 22 0z" fill="#ff8a00" />
                                <circle cx="22" cy="21" r="8" fill="#fff" />
                            </svg>
                        </div>
                        <div className="ship-popup-body">
                            <h2>{title}</h2>
                            <p>{rest.join(', ') || chosen.address}</p>
                            <p className="coords">{chosen.lat.toFixed(6)}, {chosen.lng.toFixed(6)}</p>
                            <button type="button" className="ship-confirm" onClick={confirm}>Confirmation</button>
                        </div>
                    </div>
                )}
            </div>
        </ModalStage>
    );
}
