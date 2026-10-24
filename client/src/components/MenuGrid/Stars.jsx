export default function Stars({ rating, small = false }) {
    return (
        <div className={small ? 'stars small' : 'stars'} aria-label={`${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= rating ? 'on' : ''}>&#9733;</span>
            ))}
        </div>
    );
}
