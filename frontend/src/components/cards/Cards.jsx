import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Star, Check } from 'lucide-react';

export function ProductVisual({ item, large = false }) {
  return (
    <div className={'product-visual ' + (large ? 'large ' : '')} style={{ '--product-color': item.color }}>
      <div className="product-shape" />
      <b>{item.category?.replaceAll('-', ' ')}</b>
    </div>
  );
}

export function CategoryCard({ item }) {
  return (
    <Link to={`/mockups/${item.slug}`} className="category-card">
      <div>
        <h3>{item.name}</h3>
        <p>{item.type}</p>
      </div>
      <div className={'mini-product tone-' + item.tone.toLowerCase()}>
        <span />
      </div>
      <ArrowUpRight size={15} />
    </Link>
  );
}

function TemplatePreview({ template }) {
  const { preview, material } = template;
  return (
    <div className={`template-preview template-preview--${preview.kind}`} style={{ '--preview-color': material.color }} role="img" aria-label={preview.alt}>
      <span className="template-preview__object" />
      <span className="template-preview__detail" />
      <span className="template-preview__label">{preview.mark}</span>
    </div>
  );
}

export function ProductCard({ item, favorite, onFavorite }) {
  const isTemplate = Boolean(item.modelType);
  const editorPath = `/editor/${isTemplate ? item.id : item.editorTemplateId}`;

  return (
    <article className={'product-card ' + (isTemplate ? 'product-card--template' : '')}>
      <Link to={editorPath}>
        {isTemplate ? <TemplatePreview template={item} /> : <ProductVisual item={item} />}
      </Link>
      {onFavorite && (
        <button aria-label="Add favorite" className={'favorite ' + (favorite ? 'saved' : '')} onClick={() => onFavorite(item.id)}>
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}
      <div className="product-card__info">
        {isTemplate ? (
          <>
            <span className="badge">{item.categoryLabel}</span>
            <Link to={editorPath}><h3>{item.name}</h3></Link>
            <p>{item.summary}</p>
            <small>{item.dimensions.width} × {item.dimensions.height} × {item.dimensions.depth} {item.dimensions.unit}</small>
            <span className="template-capability">{item.capabilities.at(-1)}</span>
          </>
        ) : (
          <>
            {item.premium && <span className="badge">PRO</span>}
            <Link to={editorPath}><h3>{item.title}</h3></Link>
            <p><Star size={12} fill="currentColor" /> {item.rating} · {item.type}</p>
          </>
        )}
      </div>
    </article>
  );
}

export function PricingCard({ plan, yearly }) {
  return (
    <article className={'pricing-card ' + (plan.featured ? 'pricing-card--featured' : '')}>
      {plan.featured && <span className="popular">Most popular</span>}
      <h2>{plan.name}</h2>
      <p>{plan.desc}</p>
      <div className="price">{plan.name === 'Free' ? '$0' : yearly ? plan.price.replace('$', '$') : plan.price}<small>/ month</small></div>
      <Link className={'button ' + (plan.featured ? 'button--purple' : 'button--dark')} to={plan.name === 'Business' ? '/signup' : '/signup'}>
        {plan.cta}
      </Link>
      <ul>
        {plan.features.map((f) => <li key={f}><Check size={15} />{f}</li>)}
      </ul>
    </article>
  );
}
