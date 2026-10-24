import Icon from './Icon';
import { longDate, people, time12 } from '../utils/format';

export function ReservationDetail({ when, guests }) {
    return (
        <ul className="res-detail-list">
            <li><Icon name="calendar" /> {longDate(when)}</li>
            <li><Icon name="clock" /> {time12(when, true).toLowerCase()}</li>
            <li><Icon name="user" /> {people(guests)} (Standard seating)</li>
        </ul>
    );
}

export function RestaurantInfo() {
    return (
        <div className="res-info">
            <h2>Restaurant informations</h2>
            <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
                inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <p>
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt
                ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam.
            </p>
        </div>
    );
}
