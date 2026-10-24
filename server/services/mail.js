import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'mail');

export const mailConfigured = Boolean(process.env.SMTP_HOST);

const transporter = mailConfigured
    ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      })
    : null;

const from = `"Delizioso" <${process.env.MAIL_FROM || 'delizioso@gmail.com'}>`;

export async function sendMail(to, subject, html) {
    try {
        if (transporter) {
            await transporter.sendMail({ from, to, subject, html });
            console.log(`Email "${subject}" sent to ${to}`);
        } else {
            fs.mkdirSync(folder, { recursive: true });
            const name = `${Date.now()}-${to.replace(/[^a-z0-9]+/gi, '_')}.html`;
            fs.writeFileSync(path.join(folder, name), `<p>To: ${to}<br>Subject: ${subject}</p>${html}`);
            console.log(`Email "${subject}" for ${to} saved to server/mail (SMTP not configured)`);
        }
        return true;
    } catch (error) {
        console.error(`Could not send email "${subject}" to ${to}:`, error.message);
        return false;
    }
}

export function devLink(url) {
    return !mailConfigured && process.env.NODE_ENV !== 'production' ? url : undefined;
}
