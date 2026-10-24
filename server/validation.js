import { PHONE_CODES } from './rules.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9 ()-]{5,20}$/;

export const text = (value) => (typeof value === 'string' ? value.trim() : '');

export function checkEmail(errors, value) {
    const email = text(value);
    if (!email) errors.email = 'Enter your email';
    else if (!emailPattern.test(email) || email.length > 100) errors.email = 'Enter a valid email';
}

export function checkPhone(errors, code, number, required = true) {
    const phone = text(number);
    if (!PHONE_CODES.includes(code)) errors.phoneCode = 'Choose a country code';
    if (!phone) {
        if (required) errors.phone = 'Enter your phone number';
    } else if (!phonePattern.test(phone)) {
        errors.phone = 'Enter a valid phone number';
    }
}

export function checkLength(errors, field, value, max) {
    if (text(value).length > max) errors[field] = `Use at most ${max} characters`;
}

export const fullName = (first, last) => `${text(first)} ${text(last)}`.trim();

export const joinPhone = (code, number) => `${code} ${text(number)}`;

export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}

export function sendErrors(res, errors, message = '') {
    res.status(400).json({ errors, message });
}

export const normalizeEmail = (value) => text(value).toLowerCase();
