import { Link } from 'react-router-dom';

const cols = [
  ['Mockups', ['All mockups', 'Box mockups', 'Bottle mockups', 'Food packaging']],
  ['Tools', ['Mockup generator', '3D studio', 'AI background']],
  ['Resources', ['Inspiration', 'Packaging guide', 'Help center', 'Contact']],
  ['Company', ['About PackZen', 'Pricing', 'Careers', 'Terms']]
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <Link className="brand" to="/">
            <span>◒</span>PackZen
          </Link>
          <p>Packaging ideas made tangible.</p>
          <div className="socials">◎ ◌ ◍</div>
        </div>
        {cols.map(([name, items]) => (
          <div key={name}>
            <h5>{name}</h5>
            {items.map((x) => (
              <Link key={x} to={x === 'Pricing' ? '/pricing' : '/'}>
                {x}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <span>© 2026 PackZen. Built for better packaging.</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  );
}
