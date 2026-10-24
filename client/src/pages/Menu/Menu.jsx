import MenuGrid from '../../components/MenuGrid/MenuGrid';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';

export default function Menu() {
    usePage('Menu');
    const { data, error } = useLoad('/menu');

    return (
        <section className="popular menu-page">
            <div className="container">
                {error && <p className="empty-note">{error.message}</p>}
                {data && <MenuGrid title="Menu" categories={data.categories} dishes={data.dishes} />}
            </div>
        </section>
    );
}
