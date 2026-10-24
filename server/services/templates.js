const escape = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const money = (value) => `$${Number(value).toFixed(2)}`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const time = (d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
const longDate = (d) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

function layout(title, body, buttonText, buttonUrl) {
    const button = buttonUrl
        ? `<p style="margin:28px 0"><a href="${escape(buttonUrl)}" style="background:#ff8a00;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block">${escape(buttonText)}</a></p>
           <p style="font-size:12px;color:#a08d76">If the button doesn't work, open this link: <br><a href="${escape(buttonUrl)}" style="color:#a08d76">${escape(buttonUrl)}</a></p>`
        : '';
    return `<div style="background:#f6f3ef;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#311f09">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
    <div style="background:#ff8a00;padding:24px 32px;color:#fff;font-size:22px;font-weight:bold">Delizi<span style="color:#311f09">oso</span></div>
    <div style="padding:32px">
      <h1 style="font-size:22px;margin:0 0 16px">${escape(title)}</h1>
      <div style="font-size:15px;line-height:1.6;color:#5c4529">${body}</div>
      ${button}
    </div>
    <div style="padding:16px 32px;background:#311f09;color:#e3e2e0;font-size:12px">3247 Johnson Ave, Bronx, NY 10463 · +123 4567 8901</div>
  </div>
</div>`;
}

export const confirmEmail = (name, url) => ({
    subject: 'Confirm your Delizioso account',
    html: layout(`Welcome, ${name}!`, 'Please confirm your email address to finish creating your account. The link is valid for 3 days.', 'Confirm email', url),
});

export const resetPassword = (name, url) => ({
    subject: 'Reset your Delizioso password',
    html: layout(`Hi ${name},`, "We received a request to reset your password. The link is valid for 2 hours. If it wasn't you, just ignore this email.", 'Choose a new password', url),
});

export function reservationConfirmed(r, url, changed) {
    const when = new Date(r.reserved_for);
    const body = `<p>Thank you, ${escape(r.customer_name)}! Here are your booking details:</p>
<p><b>${longDate(when)}</b> at <b>${time(when)}</b><br>
${r.guests} ${r.guests === 1 ? 'person' : 'people'} · Booking ID <b>#${r.code}</b>
${r.occasion ? `<br>Occasion: ${escape(r.occasion)}` : ''}</p>`;
    return {
        subject: changed ? `Your reservation #${r.code} was changed` : `Reservation confirmed #${r.code}`,
        html: layout(changed ? 'Your reservation was changed' : 'Reservation has been confirmed', body, 'View or change reservation', url),
    };
}

export function reservationCancelled(r, url) {
    const when = new Date(r.reserved_for);
    return {
        subject: `Reservation #${r.code} cancelled`,
        html: layout(
            'Your reservation has been cancelled',
            `<p>The table for ${DAYS[when.getDay()]}, ${when.getDate()} ${MONTHS[when.getMonth()]} at ${time(when)} has been released. We hope to see you another time.</p>`,
            'Book another table',
            url,
        ),
    };
}

export function orderPlaced(order, items, url) {
    const rows = items
        .map((i) => `<tr><td style="padding:6px 0">${escape(i.name)} × ${i.quantity}</td><td style="text-align:right">${money(i.unit_price * i.quantity)}</td></tr>`)
        .join('');
    const where = order.method === 'Delivery' ? `Delivery to: ${escape(order.address)}` : 'Take away from the restaurant';
    const at = order.scheduled_for ? new Date(order.scheduled_for) : null;
    const when = at ? `Scheduled for ${DAYS[at.getDay()]} ${time(at)}` : "We're preparing it now";
    const discount = order.discount > 0 ? `<tr><td>Voucher ${escape(order.voucher_code)}</td><td style="text-align:right">−${money(order.discount)}</td></tr>` : '';
    const body = `<p>${where}<br>${when}</p>
<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}
  <tr><td style="padding-top:12px;border-top:1px dashed #ddd">Subtotal</td><td style="text-align:right;padding-top:12px;border-top:1px dashed #ddd">${money(order.subtotal)}</td></tr>
  <tr><td>Tax fee</td><td style="text-align:right">${money(order.tax)}</td></tr>
  ${discount}
  <tr><td style="font-weight:bold;font-size:17px;padding-top:8px">Total</td><td style="text-align:right;font-weight:bold;font-size:17px;color:#ff8a00;padding-top:8px">${money(order.total)}</td></tr>
</table>`;
    return { subject: `Order #${order.code} received`, html: layout(`Thank you for your order, ${order.customer_name}!`, body, 'View order', url) };
}
