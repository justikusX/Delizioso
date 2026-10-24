import { taxFor } from '../data';

export function orderTotals(items, dishes, voucher) {
    const byId = new Map(dishes.map((d) => [String(d.id), d]));
    const lines = Object.entries(items)
        .filter(([id]) => byId.has(id))
        .map(([id, quantity]) => ({ dish: byId.get(id), quantity, sum: byId.get(id).price * quantity }));
    const subtotal = Math.round(lines.reduce((s, l) => s + l.sum, 0) * 100) / 100;
    const tax = taxFor(subtotal);
    const applied = lines.length ? voucher : null;
    const discount = applied ? Math.min(applied.amount, subtotal + tax) : 0;
    return {
        lines,
        subtotal,
        tax,
        voucher: applied,
        discount,
        total: subtotal + tax - discount,
        count: lines.reduce((s, l) => s + l.quantity, 0),
    };
}
