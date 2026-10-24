export const TOKEN_KEY = 'delizioso-token';

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export class ApiError extends Error {
    constructor(status, data) {
        super(data?.message || 'Something went wrong. Please try again.');
        this.status = status;
        this.errors = data?.errors || {};
        this.data = data || {};
    }
}

export async function api(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
        throw new ApiError(0, { message: 'Could not reach the server, please check your connection' });
    }
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, data);
    return data;
}
