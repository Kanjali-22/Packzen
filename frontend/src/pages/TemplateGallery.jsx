import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '../components/cards/Cards';
import { templateCategories, templates } from '../data/templates/boxTemplates';
import '../styles/templateGallery.css';

export default function TemplateGallery() {
  const { category } = useParams();
  const [search, setSearch] = useState('');
  const activeCategory = templateCategories.some((item) => item.slug === category) ? category : '';
  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return templates.filter((template) => (!activeCategory || template.category === activeCategory) && (!term || [template.name, template.categoryLabel, template.summary, ...template.capabilities].join(' ').toLowerCase().includes(term)));
  }, [activeCategory, search]);

  return <>
    <section className="template-gallery-hero">
      <div className="container">
        <p className="eyebrow">PACKAGING MOCKUPS</p>
        <h1>Choose a product to bring into the studio.</h1>
        <p>Every option below is an available PackZen model, ready to open in the 3D editor.</p>
      </div>
    </section>
    <main className="template-gallery container">
      <aside className="template-gallery__sidebar" aria-label="Product categories">
        <b>Categories</b>
        <nav>
          <Link className={!activeCategory ? 'is-active' : ''} to="/mockups">All products <span>{templates.length}</span></Link>
          {templateCategories.map((item) => <Link className={activeCategory === item.slug ? 'is-active' : ''} key={item.slug} to={`/mockups/${item.slug}`}>{item.name}</Link>)}
        </nav>
      </aside>
      <section className="template-gallery__content" aria-label="Available packaging templates">
        <div className="template-gallery__toolbar">
          <div><span>{filteredTemplates.length} available products</span><h2>{activeCategory ? templateCategories.find((item) => item.slug === activeCategory)?.name : 'All products'}</h2></div>
          <label className="template-gallery__search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></label>
        </div>
        {filteredTemplates.length ? <div className="template-gallery__grid">{filteredTemplates.map((template) => <ProductCard item={template} key={template.id} />)}</div> : <div className="template-gallery__empty">No supported products match that search.</div>}
      </section>
    </main>
  </>;
}
