import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Globe, Menu, X, Box, ScanSearch, PenTool, Layers, Printer, FileBox } from 'lucide-react';
import { tools } from '../../data/tools';

const icons = [ScanSearch, PenTool, Layers, Box, Box, Printer];

export default function Navbar() {
  const [mega, setMega] = useState(false), [mobile, setMobile] = useState(false);
  const ref = useRef();
  const location = useLocation();

  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [location.pathname]);

  useEffect(() => {
    const f = (e) => {
      if (!ref.current?.contains(e.target)) setMega(false);
      if (e.key === 'Escape') setMega(false);
    };
    document.addEventListener('mousedown', f);
    document.addEventListener('keydown', f);
    return () => {
      document.removeEventListener('mousedown', f);
      document.removeEventListener('keydown', f);
    };
  }, []);

  const links = [
    ['/mockups', 'Mockups'],
    ['/dieline', 'Dieline Templates'],
    ['/ai-creation', 'AI creation'],
    ['/packaging-lab', 'Packaging lab'],
    ['/pricing', 'Pricing']
  ];

  return (
    <header className="nav" ref={ref}>
      <div className="nav__inside">
        <Link className="brand" to="/">
          <span>◒</span>PackZen
        </Link>
        <nav className="nav__links">
          {links.slice(0, 2).map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}
          <button className="nav__tool" onClick={() => setMega(!mega)} aria-expanded={mega}>
            Tools <ChevronDown size={14} />
          </button>
          {links.slice(2).map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}
        </nav>
        <div className="nav__actions">
          <button className="language"><Globe size={15} /> English</button>
          <Link className="button button--dark button--sm" to="/login">Log in</Link>
        </div>
        <button aria-label="Toggle navigation" className="nav__mobile" onClick={() => setMobile(!mobile)}>
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
      {mega && (
        <div className="mega-menu">
          {tools.map((g, gi) => (
            <section key={g.group}>
              <h4>{g.group}</h4>
              {g.items.map(([title, desc], i) => {
                const Icon = icons[gi * 2 + i];
                return (
                  <Link
                    to={
                      title.includes('Mockup')
                        ? '/mockups'
                        : '/packaging-lab'
                    }
                    className="mega-menu__item"
                    key={title}
                  >
                    <i><Icon size={20} /></i>
                    <span>
                      <b>{title}</b>
                      <small>{desc}</small>
                    </span>
                  </Link>
                );
              })}
            </section>
          ))}
          <section>
            <h4>Dieline & Print</h4>
            <Link to="/dieline" className="mega-menu__item" key="dieline">
              <i><FileBox size={20} /></i>
              <span>
                <b>Dieline Studio</b>
                <small>Professional dieline editor</small>
              </span>
            </Link>
          </section>
        </div>
      )}
      {mobile && (
        <nav className="mobile-menu">
          {links.map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}
          <Link to="/login">Log in</Link>
        </nav>
      )}
    </header>
  );
}
