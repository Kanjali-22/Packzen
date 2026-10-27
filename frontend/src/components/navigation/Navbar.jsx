import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Globe, Menu, X, Box, ScanSearch, PenTool, Layers, Printer, FileBox, LogOut } from 'lucide-react';
import { tools } from '../../data/tools';
import { useAuth } from '../../context/AuthContext';

const icons = [ScanSearch, PenTool, Layers, Box, Box, Printer];

export default function Navbar() {
  const [mega, setMega] = useState(false), [mobile, setMobile] = useState(false);
  const ref = useRef();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

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
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: '#f4f2f8',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '20px',
                  textDecoration: 'none'
                }}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                  alt={user.name}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eee' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#18171a' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                style={{
                  background: 'none',
                  border: '1px solid #d9d7dc',
                  borderRadius: '6px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666'
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link className="button button--dark button--sm" to="/login">Log in</Link>
          )}
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
                        : title === 'AI creation'
                        ? '/ai-creation'
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
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{user.name}</span>
              <button
                type="button"
                onClick={logout}
                style={{ border: 0, background: 'none', color: '#e02424', fontWeight: 700, cursor: 'pointer' }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
