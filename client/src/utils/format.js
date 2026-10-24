const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');

export const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export const toDate = (value) => (value instanceof Date ? value : new Date(value));

export function time12(value, padHour = false) {
    const d = toDate(value);
    const hour = d.getHours() % 12 || 12;
    return `${padHour ? pad(hour) : hour}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

export const longDate = (value) => {
    const d = toDate(value);
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const shortDate = (value) => {
    const d = toDate(value);
    return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

export const dayName = (value) => DAYS[toDate(value).getDay()];

export const optionDate = (value) => {
    const d = toDate(value);
    return `${DAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};

export const monthYear = (value) => {
    const d = toDate(value);
    return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

export const people = (count) => `${count} ${Number(count) === 1 ? 'person' : 'people'}`;
