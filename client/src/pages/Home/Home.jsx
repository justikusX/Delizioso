import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuGrid from '../../components/MenuGrid/MenuGrid';
import { useLoad } from '../../hooks/useLoad';
import { usePage } from '../../hooks/usePage';
import './Home.css';

function Testimonials({ testimonials }) {
    const [activeId, setActiveId] = useState(null);
    const featured = testimonials.find((t) => t.id === activeId) || testimonials.find((t) => t.authorName === 'Starla Virgoun') || testimonials[0];
    if (!featured) return null;

    return (
        <>
            <div className="review">
                <img className="review-photo" src={featured.photoUrl} alt="" />
                <h3>{featured.authorName}</h3>
                <p className="review-role">{featured.authorPosition}</p>
                <blockquote>{featured.text}</blockquote>
            </div>
            <div className="avatars">
                {testimonials.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        className={t.id === featured.id ? 'avatar active' : 'avatar'}
                        aria-label={`Review by ${t.authorName}`}
                        onClick={() => setActiveId(t.id)}
                    >
                        <img src={t.photoUrl} alt="" loading="lazy" />
                    </button>
                ))}
            </div>
        </>
    );
}

export default function Home() {
    usePage('Italian Cuisine');
    const { data } = useLoad('/home');
    const { hash } = useLocation();

    useEffect(() => {
        if (data && hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    }, [data, hash]);

    return (
        <>
            <section className="hero">
                <div className="container hero-inner">
                    <div className="hero-text">
                        <span className="pill">Restaurant</span>
                        <h1>Italian Cuisine</h1>
                        <p className="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sodales senectus dictum arcu sit tristique donec eget.</p>
                        <div className="btn-row">
                            <Link className="btn btn-orange" to="/order">Order now</Link>
                            <Link className="btn btn-green" to="/reservation">Reservation</Link>
                        </div>
                    </div>
                    <div className="hero-art">
                        <img className="leaf leaf-top" src="/img/lettuce.png" alt="" />
                        <img className="plate" src="/img/hero-plate.png" alt="Spaghetti bolognese" />
                        <img className="leaf leaf-bottom" src="/img/lettuce.png" alt="" />
                    </div>
                </div>
            </section>

            <section className="welcome">
                <div className="container split">
                    <div className="split-art">
                        <img src="/img/welcome-salad.png" alt="Fresh salad" />
                    </div>
                    <div className="split-text">
                        <h2 className="title">Welcome to <span>delizioso</span></h2>
                        <p className="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam</p>
                        <Link className="btn btn-orange" to="/menu">See our menu</Link>
                    </div>
                </div>
            </section>

            <section className="popular" id="menu">
                <div className="container">
                    {data && <MenuGrid title="Our popular menu" categories={data.categories} dishes={data.dishes} />}
                </div>
            </section>

            <section className="reserve">
                <div className="container split">
                    <div className="split-art reserve-art">
                        <div className="orbit"></div>
                        <div className="reserve-main"><img src="/img/reserve-main.png" alt="Friends sharing food" /></div>
                        <div className="reserve-small s1"><img src="/img/reserve-small1.png" alt="" /></div>
                        <div className="reserve-small s2"><img src="/img/reserve-small2.png" alt="" /></div>
                    </div>
                    <div className="split-text">
                        <h2 className="title">Let's reserve <span>a table</span></h2>
                        <p className="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam</p>
                        <Link className="btn btn-orange" to="/reservation">Reservation</Link>
                    </div>
                </div>
            </section>

            <section className="chefs">
                <div className="container">
                    <h2 className="title center">Our greatest chef</h2>
                    <div className="chef-grid">
                        {data?.chefs.map((chef) => (
                            <article className="chef-card" key={chef.id}>
                                <div className="chef-photo" style={{ background: chef.cardColor }}>
                                    <img src={chef.photoUrl} alt={chef.name} loading="lazy" />
                                </div>
                                <h3>{chef.name}</h3>
                                <p>{chef.position}</p>
                            </article>
                        ))}
                    </div>
                    <div className="center"><Link className="btn btn-orange" to="/about">View all</Link></div>
                </div>
            </section>

            <section className="testimonials" id="testimonials">
                <img className="bubbles" src="/img/customers-bg.svg" alt="" />
                <div className="container">
                    <h2 className="title center">Our customers say</h2>
                    {data && <Testimonials testimonials={data.testimonials} />}
                </div>
            </section>

            <section className="open-hours">
                <div className="container">
                    <div className="open-card">
                        <h2 className="title">we are open from</h2>
                        <p className="days">Monday-Sunday</p>
                        <p>Launch : Mon-Sun : 11:00am-02:00pm</p>
                        <p>Dinner : sunday : 04:00pm-08:00pm</p>
                        <p className="indent">04:00pm-09:00pm</p>
                        <div className="btn-row">
                            <Link className="btn btn-orange" to="/order">Order now</Link>
                            <Link className="btn btn-white" to="/reservation">Reservation</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
