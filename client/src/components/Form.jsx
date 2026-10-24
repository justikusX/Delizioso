import { PHONE_CODES } from '../data';

export function FieldError({ message, className = 'field-error' }) {
    return message ? <span className={className}>{message}</span> : null;
}

export function FormError({ message }) {
    return message ? (
        <div className="auth-error">
            <ul>
                <li>{message}</li>
            </ul>
        </div>
    ) : null;
}

export function PhoneCodeSelect({ value, onChange, ...rest }) {
    return (
        <select value={value} onChange={onChange} {...rest}>
            {PHONE_CODES.map((p) => (
                <option key={p.code} value={p.code}>
                    {p.country} {p.code}
                </option>
            ))}
        </select>
    );
}

export function useField(form, setForm) {
    return (name) => ({
        name,
        value: form[name] ?? '',
        onChange: (e) => setForm({ ...form, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }),
    });
}
