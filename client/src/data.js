export const TAX_RATE = 0.045;
export const MAX_QUANTITY = 20;
export const MAX_GUESTS = 10;
export const DAYS_AHEAD = 30;
export const HOLD_MINUTES = 5;

export const PHONE_CODES = [
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
    { code: '+39', country: 'IT' },
    { code: '+62', country: 'ID' },
    { code: '+7', country: 'RU' },
    { code: '+380', country: 'UA' },
    { code: '+375', country: 'BY' },
    { code: '+77', country: 'KZ' },
];

export const OCCASIONS = ['Birthday', 'Anniversary', 'Date night', 'Business meal', 'Family gathering', 'Special celebration'];

export const METHODS = [
    { value: 'Delivery', label: 'Delivery' },
    { value: 'TakeAway', label: 'Take a way' },
];

export const PAYMENTS = [
    { value: 'Cash', label: 'Cash On Delivery' },
    { value: 'BcaVirtualAccount', label: 'BCA Virtual Account' },
    { value: 'CreditCard', label: 'Credit Card' },
    { value: 'BankTransfer', label: 'Transfer Bank' },
];

export const GROUPS = ['Pasta', 'Pizza', 'Mains', 'Salads', 'Desserts'];

const pad = (n) => String(n).padStart(2, '0');

export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseLocal(date, time = '00:00') {
    const [y, m, d] = String(date).split('-').map(Number);
    const [h, min] = String(time).split(':').map(Number);
    const result = new Date(y, m - 1, d, h, min);
    return Number.isNaN(result.getTime()) ? null : result;
}

export function slots() {
    const result = [];
    for (let i = 0; i < 6; i++) result.push(`${pad(11 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);
    for (let i = 0; i < 10; i++) result.push(`${pad(16 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);
    return result;
}

export function bookingDates(now = new Date()) {
    const result = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
        result.push(dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
    }
    return result;
}

export function validateSlot(date, time, guests, now = new Date()) {
    if (!date || !time || !guests) return 'Choose a date, time and party size';
    if (!bookingDates(now).includes(date)) return 'Choose a date within the next 30 days';
    if (!slots().includes(time)) return 'Choose one of the available times';
    if (parseLocal(date, time) <= now) return 'This time has already passed, choose a later one';
    const count = Number(guests);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) return 'Choose the party size';
    return null;
}

export function laterSlots(now = new Date()) {
    const limit = new Date(now.getTime() + 45 * 60 * 1000);
    const result = [];
    for (const day of bookingDates(now).slice(0, 2)) {
        for (const time of slots()) {
            if (parseLocal(day, time) > limit) result.push(`${day}T${time}`);
        }
    }
    return result;
}

export const taxFor = (subtotal) => Math.round(subtotal * TAX_RATE * 100) / 100;

export function splitName(name = '') {
    const i = name.indexOf(' ');
    return i < 0 ? [name, ''] : [name.slice(0, i), name.slice(i + 1)];
}

export function splitPhone(phone = '') {
    const match = PHONE_CODES.map((p) => p.code)
        .sort((a, b) => b.length - a.length)
        .find((code) => phone.startsWith(`${code} `));
    return match ? [match, phone.slice(match.length + 1)] : [PHONE_CODES[0].code, phone];
}
