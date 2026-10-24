import { Link } from 'react-router-dom';

export default function DevLink({ devLink, mailFailed }) {
    const local = devLink ? devLink.replace(/^https?:\/\/[^/]+/, '') : '';
    return (
        <>
            {devLink && (
                <div className="auth-dev">
                    <b>Test mode:</b> email sending isn't set up, so the message was saved to <code>server/mail</code>.{' '}
                    <Link to={local}>Open the link from the email</Link>
                </div>
            )}
            {mailFailed && (
                <div className="auth-dev auth-mail-failed">
                    <b>We couldn't send the email right now.</b> Please try “Send the link again” in a few minutes, or contact us at delizioso@gmail.com.
                </div>
            )}
        </>
    );
}
