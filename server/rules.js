export const TAX_RATE = 0.045;
export const MAX_QUANTITY = 20;
export const MAX_GUESTS = 10;
export const DAYS_AHEAD = 30;

export const METHODS = ['Delivery', 'TakeAway'];
export const PAYMENTS = ['Cash', 'BcaVirtualAccount', 'CreditCard', 'BankTransfer'];
export const PAYMENT_LABELS = {
    Cash: 'Cash On Delivery',
    BcaVirtualAccount: 'BCA Virtual Account',
    CreditCard: 'Credit Card',
    BankTransfer: 'Transfer Bank',
};
export const PHONE_CODES = ['+1', '+44', '+49', '+33', '+39', '+62', '+7', '+380', '+375', '+77'];
export const OCCASIONS = ['Birthday', 'Anniversary', 'Date night', 'Business meal', 'Family gathering', 'Special celebration'];

const pad = (n) => String(n).padStart(2, '0');

export function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function slots() {
    const result = [];
    for (let i = 0; i < 6; i++) result.push(`${pad(11 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);
    for (let i = 0; i < 10; i++) result.push(`${pad(16 + Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`);
    return result;
}

export function parseLocal(date, time) {
    const [y, m, d] = String(date).split('-').map(Number);
    const [h, min] = String(time).split(':').map(Number);
    const result = new Date(y, m - 1, d, h, min);
    return Number.isNaN(result.getTime()) ? null : result;
}

export function validateSlot(date, time, guests, now = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return 'Choose a date';
    if (!time) return 'Choose a time';
    if (!guests) return 'Choose the party size';
    const day = parseLocal(date, '00:00');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last = new Date(today);
    last.setDate(last.getDate() + DAYS_AHEAD);
    if (!day || day < today || day >= last) return 'Choose a date within the next 30 days';
    if (!slots().includes(time)) return 'Choose one of the available times';
    if (parseLocal(date, time) <= now) return 'This time has already passed, choose a later one';
    const count = Number(guests);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) return 'Choose the party size';
    return null;
}

export function laterSlots(now = new Date()) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const limit = new Date(now.getTime() + 45 * 60 * 1000);
    const result = [];
    for (const day of [today, tomorrow]) {
        for (const time of slots()) {
            const at = parseLocal(dateKey(day), time);
            if (at > limit) result.push(`${dateKey(day)}T${time}`);
        }
    }
    return result;
}

export function tax(subtotal) {
    return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function round(value) {
    return Math.round(value * 100) / 100;
}
