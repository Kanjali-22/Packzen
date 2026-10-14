import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { mockups } from '../data/mockups';
import { ProductCard, ProductVisual } from '../components/cards/Cards';

export default function DetailPage() {
  const { slug } = useParams();
  const data = mockups;
  const item = data.find((x) => x.slug === slug);

  if (!item) {
    return (
      <div className="container not-found">
        <h1>Template not found</h1>
        <Link to="/mockups">Browse templates</Link>
      </div>
    );
  }

  const related = data.filter((x) => x.category === item.category && x.id !== item.id).slice(0, 4);

  return (
    <div className="detail container">
      <Link className="back" to="/mockups">
        <ChevronLeft size={17} /> Back to templates
      </Link>
      <div className="detail__main">
        <ProductVisual item={item} large />
        <section className="detail__info">
          <p className="eyebrow">PACKAGING MOCKUP</p>
          <h1>{item.title}</h1>
          <p className="detail__description">
            A carefully designed starting point for your next packaging project. Customize it to fit your brand and create something ready to share.
          </p>
          <div className="tag-row">
            {item.tags.map((t) => <span key={t}>{t}</span>)}
          </div>
          <Link className="button button--dark button--wide" to={`/editor/${item.editorTemplateId}`}>
            Customize this mockup <ArrowRight size={17} />
          </Link>
          <ul className="detail__list">
            <li><Check size={16} /> Editable in your browser</li>
            <li><Check size={16} /> Made for professional presentation</li>
          </ul>
        </section>
      </div>
      <section className="related">
        <h2>You might also like</h2>
        <div className="product-grid">
          {related.map((x) => <ProductCard key={x.id} item={x} />)}
        </div>
      </section>
    </div>
  );
}
