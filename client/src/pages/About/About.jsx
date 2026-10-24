import { usePage } from '../../hooks/usePage';
import './About.css';

export default function About() {
    usePage('About us');

    return (
        <div className="about-page">
            <section className="about-block">
                <div className="container split">
                    <div className="about-circle about-circle-left">
                        <img src="/img/about-kitchen.png" alt="Chef plating dishes in the kitchen" />
                    </div>
                    <div className="split-text">
                        <h1 className="title"><span className="accent">Our</span><br className="br-desk" /> restaurant</h1>
                        <p className="lead">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                            reprehenderit in voluptate velit esse.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-block">
                <div className="container split">
                    <div className="split-text">
                        <p className="lead">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
                            ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
                            aspernatur aut odit aut fugit.
                        </p>
                    </div>
                    <div className="about-circle about-circle-right">
                        <img src="/img/about-food.webp" alt="Guests sharing dishes at the table" />
                    </div>
                </div>
            </section>

            <section className="owner">
                <div className="container owner-inner">
                    <img className="owner-photo" src="/img/about-owner.webp" alt="Ismail Marzuki" />
                    <div className="owner-text">
                        <h2 className="title"><span className="accent">Owner</span> &amp;<br /> Executive Chef</h2>
                        <h3>Ismail Marzuki</h3>
                        <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</blockquote>
                    </div>
                </div>
            </section>
        </div>
    );
}
