import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'delizioso-development-secret';

export const newStamp = () => crypto.randomUUID().replace(/-/g, '');

export const newCode = () => crypto.randomBytes(6).toString('hex').toUpperCase();

export function authToken(user, remember) {
    return jwt.sign({ id: user.id, stamp: user.security_stamp }, secret, { expiresIn: remember ? '30d' : '1d' });
}

export function readAuthToken(token) {
    try {
        const data = jwt.verify(token, secret);
        return data.purpose ? null : data;
    } catch {
        return null;
    }
}

export function linkToken(user, purpose, expiresIn) {
    return jwt.sign({ id: user.id, stamp: user.security_stamp, purpose }, secret, { expiresIn });
}

export function readLinkToken(token, purpose) {
    try {
        const data = jwt.verify(token || '', secret);
        return data.purpose === purpose ? data : null;
    } catch {
        return null;
    }
}
