import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import OrderList from '../../components/OrderList/OrderList';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import './Order.css';

export default function OrderListPage() {
    usePage('Order list');
    const { data } = useLoad('/menu');

    return (
        <section className="order-list-page">
            <div className="order-list-bar">
                <Link className="back-circle light" to="/order" aria-label="Back to menu"><Icon name="back" /></Link>
                <h1>Order list</h1>
            </div>
            <div className="container">
                {data && <OrderList dishes={data.dishes} withImages page />}
            </div>
        </section>
    );
}
