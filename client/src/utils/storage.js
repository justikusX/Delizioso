export function readJson(key, fallback = null, storage = localStorage) {
    try {
        const value = JSON.parse(storage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

export function writeJson(key, value, storage = localStorage) {
    try {
        if (value === null || value === undefined) storage.removeItem(key);
        else storage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
}

export const ADDRESS_KEY = 'delizioso-address';
