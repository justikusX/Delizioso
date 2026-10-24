const icons = {
    calendar: (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2.5" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
    ),
    clock: (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
    ),
    user: (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-3 3.6-5 8-5s8 2 8 5v1H4z" strokeLinejoin="round" />
        </svg>
    ),
    check: (
        <svg className="icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <rect x="1.5" y="1.5" width="15" height="15" rx="3" />
            <path d="M5.5 9.2l2.3 2.3 4.7-4.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ticket: (
        <svg className="icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <rect x="1.5" y="3" width="15" height="13" rx="3" />
            <path d="M1.5 7h15M6 1.5v3M12 1.5v3" strokeLinecap="round" />
        </svg>
    ),
    edit: (
        <svg className="icon" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M12 4H6a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3v-6" strokeLinecap="round" />
            <path d="M19.5 2.5l4 4L13 17l-5 1 1-5z" strokeLinejoin="round" />
        </svg>
    ),
    x: (
        <svg className="icon" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M3 3l16 16M19 3L3 19" />
        </svg>
    ),
    back: (
        <svg className="icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1L3 6l5 5" />
        </svg>
    ),
    send: (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 2L2 10.5l8.2 2.6L13 21z" />
        </svg>
    ),
    trash: (
        <svg className="icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12M8.5 8.5v5M11.5 8.5v5" />
        </svg>
    ),
};

export default function Icon({ name }) {
    return icons[name] || null;
}
