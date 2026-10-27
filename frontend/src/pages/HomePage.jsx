import { Link } from 'react-router-dom';
import { ArrowRight, Box, ScanLine, ArrowUpRight, Sparkles } from 'lucide-react';
import { templateCategories } from '../data/templates/boxTemplates';
import { CategoryCard } from '../components/cards/Cards';

const toolCards = [
  ['Mockup Generator', 'Turn flat artwork into shelf-ready scenes.', Box, 'lilac', '/mockups'],
  ['3D Packaging Studio', 'Explore your packaging from every angle.', ScanLine, 'mint', '/dieline'],
  ['AI Generation', 'Turn thoughts into realistic packaging scenes with AI.', Sparkles, 'peach', '/ai-creation']
];

const showcase = [
  ['Mockup generator', 'Create beautiful packaging visuals before you print. Apply artwork, adjust lighting, and make a confident presentation in minutes.', 'Create a mockup', 'ui-mockup'],
  ['Browser 3D studio', 'Build a product view that feels considered, tactile and ready for every review room.', 'Start 3D studio', 'ui-studio'],
  ['AI background studio', 'Generate a setting that makes your product feel at home, without leaving your workflow.', 'Try AI backgrounds', 'ui-ai']
];

function EditorVisual({ type }) {
  return (
    <div className={'editor-visual ' + type}>
      <div className="editor-visual__bar"><i /><i /><i /></div>
      <div className="editor-visual__main">
        <div className="editor-product">PACK<br />ZEN</div>
      </div>
      <div className="editor-visual__panel"><span /><span /><span /></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero grid-bg">
        <div className="container">
          <p className="eyebrow">THE PACKAGING WORKSPACE</p>
          <h1>Everything you need for <em>packaging</em> mockups.</h1>
          <p className="hero__copy">
            Design, visualize and prepare packaging that makes your product feel real — long before it reaches the shelf.
          </p>
          <div className="tool-grid">
            {toolCards.map(([title, copy, Icon, tone, link]) => (
              <Link to={link || '/mockups'} className={'tool-card tool-card--' + tone} key={title}>
                <span className="tool-card__icon"><Icon size={30} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowUpRight className="tool-card__arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-title">
          <div><span>✦</span><h2>Top mockup categories</h2></div>
          <Link to="/mockups">View all mockups <ArrowRight size={16} /></Link>
        </div>
        <div className="category-grid">
          {templateCategories.map((x) => <CategoryCard item={{ ...x, type: 'Mockups' }} key={x.slug} />)}
        </div>
      </section>
      <section className="brand-strip container">
        <span>Trusted by packaging teams at</span>
        {['NORTHSTAR', 'ASTER', 'MONO', 'ORBIT', 'HELIX', 'VERTEX'].map((x) => <b key={x}>{x}</b>)}
      </section>
      <section className="showcase-section">
        <div className="container">
          <div className="section-title">
            <div><span>✦</span><h2>Tools for the whole journey</h2></div>
          </div>
          <div className="showcase-grid">
            {showcase.map(([title, desc, cta, type], i) => (
              <article className={'showcase ' + (i % 2 ? 'showcase--reverse' : '')} key={title}>
                <EditorVisual type={type} />
                <div className="showcase__content">
                  <p className="eyebrow">PACKZEN TOOLS</p>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <Link className="button button--dark" to={type === 'ui-ai' ? '/ai-creation' : '/mockups'}>{cta} <ArrowRight size={14} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div className="container">
          <p className="eyebrow">READY TO START?</p>
          <h2>Create your first packaging mockup today.</h2>
          <Link className="button button--purple button--wide" to="/mockups">Explore templates</Link>
        </div>
      </section>
    </>
  );
}
