import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Search, X } from 'lucide-react';
import { dielineCategories, dielineTemplates } from '../data/dielineTemplates';
import DielineTemplatePreview from '../components/dieline/DielineTemplatePreview';
import '../styles/dielineTemplates.css';

export default function DielineTemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('relevant');
  const navigate = useNavigate();

  const categoryCounts = useMemo(() => Object.fromEntries(dielineCategories.map((category) => [
    category,
    category === 'All' ? dielineTemplates.length : dielineTemplates.filter((template) => template.category === category).length,
  ])), []);

  const visibleTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = dielineTemplates.filter((template) => {
      const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
      const searchable = [template.id, template.code, template.title, template.category, template.description].filter(Boolean).join(' ').toLowerCase();
      return matchesCategory && (!normalized || searchable.includes(normalized));
    });
    return sort === 'az' ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  }, [activeCategory, query, sort]);

  const chooseTemplate = (template) => navigate(`/dieline/configure?template=${encodeURIComponent(template.id)}`);
  const clearFilters = () => { setActiveCategory('All'); setQuery(''); };

  return (
    <div className="dieline-gallery-page">
      <section className="dieline-gallery-hero">
        <div className="dieline-gallery-container dieline-gallery-hero__inner">
          <div>
            <div className="dieline-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Dielines</span></div>
            <p className="dieline-kicker">PACKAGING STRUCTURES</p>
            <h1>Explore Dieline Templates</h1>
            <p>Start with a packaging structure, tailor the dimensions, then continue directly into PackZen’s interactive dieline editor.</p>
            <label className="dieline-search dieline-search--hero">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search box styles, templates, or packaging types…" aria-label="Search dieline templates" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            </label>
          </div>
          <div className="dieline-hero-art" aria-hidden="true"><DielineTemplatePreview template={dielineTemplates[3]} /><span className="dieline-hero-art__chip dieline-hero-art__chip--h">H</span><span className="dieline-hero-art__chip dieline-hero-art__chip--l">L</span><span className="dieline-hero-art__chip dieline-hero-art__chip--w">W</span></div>
        </div>
      </section>

      <div className="dieline-gallery-container dieline-gallery-layout">
        <aside className="dieline-category-sidebar" aria-label="Dieline template categories">
          <div className="dieline-category-sidebar__head"><b>Categories</b><ChevronDown size={16} /></div>
          <nav>{dielineCategories.map((category) => (
            <button type="button" key={category} className={activeCategory === category ? 'is-active' : ''} onClick={() => setActiveCategory(category)}>
              <span>{category}</span>{categoryCounts[category] > 0 && <small>{categoryCounts[category]}</small>}
            </button>
          ))}</nav>
        </aside>

        <main className="dieline-gallery-content">
          <div className="dieline-gallery-toolbar">
            <div><p className="dieline-kicker">TEMPLATE LIBRARY</p><h2>{visibleTemplates.length} {visibleTemplates.length === 1 ? 'template' : 'templates'} available</h2></div>
            <label className="dieline-sort">Sort <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort templates"><option value="relevant">Most relevant</option><option value="az">A–Z</option></select></label>
          </div>
          {visibleTemplates.length ? <div className="dieline-template-grid">{visibleTemplates.map((template) => (
            <article className="dieline-template-card" key={template.id}>
              <button type="button" className="dieline-template-card__preview" onClick={() => chooseTemplate(template)} aria-label={`Open ${template.title}`}><DielineTemplatePreview template={template} /></button>
              <div className="dieline-template-card__body">
                <div>{template.code && <span className="dieline-template-card__code">{template.code}</span>}<h3>{template.title}</h3><p>{template.description}</p></div>
                <div className="dieline-template-card__footer"><span>{template.dimensions.length} × {template.dimensions.width} × {template.dimensions.height} mm</span><button type="button" onClick={() => chooseTemplate(template)}>Open <ArrowRight size={15} /></button></div>
                {template.illustrative && <small className="dieline-template-card__note">Uses the closest supported editor structure</small>}
              </div>
            </article>
          ))}</div> : <div className="dieline-empty-state"><Search size={28} /><h3>No templates found</h3><p>Try a different search or category.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        </main>
      </div>
    </div>
  );
}
