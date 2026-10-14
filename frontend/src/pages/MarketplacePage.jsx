import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { mockups } from '../data/mockups';
import { mockupCategories } from '../data/categories';
import { ProductCard } from '../components/cards/Cards';
import Pagination from '../components/common/Pagination';
import Accordion from '../components/common/Accordion';
import { generalFaqs } from '../data/faqs';

function Filter({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter-group">
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}<ChevronDown size={15} />
      </button>
      {open && children}
    </div>
  );
}

export default function MarketplacePage() {
  const { category } = useParams();
  const data = mockups;
  const cats = mockupCategories;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(category || '');
  const [premium, setPremium] = useState('');
  const [sort, setSort] = useState('Popular');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() =>
    data
      .filter((x) => (!selected || x.category === selected) && (!premium || String(x.premium) === premium) && x.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sort === 'Name'
          ? a.title.localeCompare(b.title)
          : sort === 'Newest'
          ? b.id - a.id
          : b.rating
          ? b.rating - a.rating
          : a.id - b.id
      ),
    [data, selected, premium, search, sort]
  );

  const perPage = 16;
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  const setCat = (x) => {
    setSelected(x);
    setPage(1);
  };

  const sidebar = (
    <aside className={'filters ' + (mobileFilters ? 'filters--open' : '')}>
      <div className="filters__head">
        <b>Filters</b>
        <button onClick={() => setMobileFilters(false)}><X size={18} /></button>
      </div>
      <label className="search">
        <Search size={16} />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search templates" />
      </label>
      <Filter title="Category">
        <div className="filter-options">
          {cats.map((c) => (
            <label key={c.slug}>
              <input type="radio" checked={selected === c.slug} onChange={() => setCat(c.slug)} />
              {c.name}
            </label>
          ))}
          <button className="clear" onClick={() => setCat('')}>Clear category</button>
        </div>
      </Filter>
      <Filter title="Access">
        <div className="filter-options">
          <label>
            <input type="radio" name="access" checked={!premium} onChange={() => setPremium('')} />
            All templates
          </label>
          <label>
            <input type="radio" name="access" checked={premium === 'false'} onChange={() => setPremium('false')} />
            Free
          </label>
          <label>
            <input type="radio" name="access" checked={premium === 'true'} onChange={() => setPremium('true')} />
            Pro
          </label>
        </div>
      </Filter>
      <Filter title="Product type">
        <div className="filter-options">
          <label>
            <input type="radio" name="type" checked={!premium} onChange={() => setPremium('')} />
            All types
          </label>
        </div>
      </Filter>
    </aside>
  );

  const title = category ? (cats.find((c) => c.slug === category)?.name || 'Templates') : 'Packaging mockups';

  return (
    <>
      <section className="market-hero">
        <div className="container">
          <p className="eyebrow">PACKAGING MARKETPLACE</p>
          <h1>{title}</h1>
          <p>Explore product scenes designed to make your next packaging concept shine.</p>
        </div>
      </section>
      <div className="marketplace container">
        {sidebar}
        <section className="market-content">
          <div className="market-content__top">
            <div>
              <span>{filtered.length} templates available</span>
              <div className="chips">
                {cats.slice(0, 5).map((c) => (
                  <button
                    onClick={() => setCat(selected === c.slug ? '' : c.slug)}
                    className={selected === c.slug ? 'active' : ''}
                    key={c.slug}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="market-actions">
              <button className="filter-mobile" onClick={() => setMobileFilters(true)}>
                <SlidersHorizontal size={16} /> Filters
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Popular</option>
                <option>Newest</option>
                <option>Name</option>
              </select>
            </div>
          </div>
          <div className="product-grid">
            {items.map((x) => (
              <ProductCard
                key={x.id}
                item={x}
                favorite={favorites.includes(x.id)}
                onFavorite={(id) =>
                  setFavorites((f) => (f.includes(id) ? f.filter((i) => i !== id) : [...f, id]))
                }
              />
            ))}
          </div>
          {!items.length && <div className="empty">No templates matched those filters.</div>}
          <Pagination page={page} total={Math.ceil(filtered.length / perPage)} onChange={setPage} />
        </section>
      </div>
      <section className="market-info">
        <div className="container info-grid">
          <div>
            <span className="eyebrow">DESIGNED FOR MOMENTUM</span>
            <h2>Create packaging visuals that make a case.</h2>
          </div>
          <p>
            PackZen brings the small decisions into one focused workspace so you can move from idea to presentation without switching tools.
          </p>
          <Accordion items={generalFaqs} />
        </div>
      </section>
    </>
  );
}