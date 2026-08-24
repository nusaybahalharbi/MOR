import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Car, Check, ChevronDown,
  Coffee, Mail, MapPin, Menu, PackageCheck, Search, ShoppingBag,
  Store, Utensils, X, Zap
} from 'lucide-react';
import morMark from './assets/brand/mor-mark-transparent.png';
import neighborhoodHero from './assets/brand/mor-neighborhood-hero.png';

type Language = 'ar' | 'en';
type Navigate = (href: string) => void;

const SUPPORT_EMAIL = 'support@morapp.tech';

const copy = {
  ar: {
    nav: ['الرئيسية', 'كيف يعمل', 'للعملاء', 'للمتاجر', 'الأسئلة الشائعة'],
    heroTag: 'استلام أذكى من متاجر حيّك', heroTitle: 'حيّك أقرب مع مر',
    heroBody: 'اطلب من متاجرك القريبة، وخذ طلبك من السيارة.', discover: 'اكتشف مر', merchant: 'سجّل متجرك',
    howEyebrow: 'من الطلب إلى السيارة', howTitle: 'طريق واضح. واستلام أسهل.', howBody: 'كل خطوة مصممة لتختصر الانتظار وتخلي متجرك المفضل أقرب.',
    customerEyebrow: 'تجربة العميل', customerTitle: 'كل شيء واضح، من أول طلبك.', customerBody: 'اكتشف القريب، اطلب بسهولة، وشارك حالة وصولك مع المتجر في اللحظة المناسبة.',
    merchantEyebrow: 'مر للأعمال', merchantTitle: 'خل متجرك أقرب لعملائك', merchantBody: 'استقبل الطلب، جهزه، واعرف متى العميل بالطريق ومتى وصل — بدون تعقيد تشغيلي.',
    typesEyebrow: 'البداية من حيّك', typesTitle: 'قهوة أو وجبة، بطريقك.', typesBody: 'يركز مر اليوم على المقاهي والمطاعم القريبة، بتجربة استلام مصممة للحياة اليومية.',
    faqTitle: 'كل اللي تحتاج تعرفه', finalTitle: 'مرّ، وخذ طلبك.', finalBody: 'وقت أقل في الانتظار. وقت أكثر لك.',
  },
  en: {
    nav: ['Home', 'How it works', 'Customers', 'Merchants', 'FAQ'],
    heroTag: 'Smarter pickup from neighborhood stores', heroTitle: 'Your neighborhood, closer with MOR',
    heroBody: 'Order from nearby stores and pick up from your car.', discover: 'Discover MOR', merchant: 'Register your store',
    howEyebrow: 'From order to car', howTitle: 'A clear route. An easier pickup.', howBody: 'Every step reduces waiting and brings your favorite local store closer.',
    customerEyebrow: 'Customer experience', customerTitle: 'Clear from the first tap.', customerBody: 'Discover what is nearby, order simply, and share your arrival status at the right moment.',
    merchantEyebrow: 'MOR for business', merchantTitle: 'Bring your store closer to customers', merchantBody: 'Receive the order, prepare it, and know when the customer is on the way or has arrived.',
    typesEyebrow: 'Starting in your neighborhood', typesTitle: 'Coffee or a meal, on your way.', typesBody: 'MOR currently focuses on nearby cafés and restaurants, with pickup designed for everyday life.',
    faqTitle: 'Everything you need to know', finalTitle: 'Pass by. Pick up.', finalBody: 'Less time waiting. More time for you.',
  },
} as const;

const flow = [
  ['اختر متجرك', 'Choose a store', Store], ['اطلب', 'Order', ShoppingBag], ['تحرك للفرع', 'Head over', MapPin],
  ['أنا بالطريق', "I'm on my way", Car], ['وصلت', "I've arrived", BadgeCheck], ['استلم طلبك', 'Pick up', PackageCheck],
] as const;

const faqs = [
  ['ما هو مر؟', 'What is MOR?', 'مر تجربة طلب واستلام من السيارة تربطك بالمقاهي والمطاعم القريبة.', 'MOR is a curbside ordering and pickup experience connecting you with nearby cafés and restaurants.'],
  ['كيف أستلم طلبي؟', 'How do I pick up my order?', 'بعد ما يجهز طلبك، اضغط «أنا بالطريق». وعند وصولك اضغط «وصلت» ليحضره المتجر للسيارة.', 'When your order is ready, tap “I’m on my way.” At the store, tap “I’ve arrived” and the merchant brings it to your car.'],
  ['هل مر خدمة توصيل؟', 'Is MOR a delivery service?', 'لا. أنت تمر على المتجر، ومر يجعل الاستلام أسرع وأسهل من السيارة.', 'No. You drive to the store; MOR makes curbside pickup faster and easier.'],
  ['كيف أسجل متجري؟', 'How do I register my store?', 'انتقل إلى صفحة المتاجر وشاركنا بياناتك. يراجع فريق مر طلب الاهتمام ويتواصل معك.', 'Visit the merchant page and share your details. The MOR team reviews your interest and contacts you.'],
  ['ما أنواع المتاجر المتاحة؟', 'What store types are available?', 'يركز مر حاليًا على المقاهي والمطاعم، مع إمكانية التوسع مستقبلًا.', 'MOR currently focuses on cafés and restaurants, with room to expand later.'],
] as const;

function App() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('mor-language') === 'en' ? 'en' : 'ar');
  const [path, setPath] = useState(window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('mor-language', language);
    document.title = language === 'ar' ? 'مر | استلم طلبك من متاجر حيّك بسهولة' : 'MOR | Curbside Pickup From Local Stores';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ar' ? 'اطلب من المقاهي والمطاعم القريبة واستلم طلبك من السيارة بسهولة مع مر.' : 'Order from nearby cafés and restaurants and pick up from your car with MOR.');
  }, [language]);
  useEffect(() => {
    const pop = () => setPath(location.pathname);
    const scroll = () => setScrolled(scrollY > 24);
    addEventListener('popstate', pop); addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { removeEventListener('popstate', pop); removeEventListener('scroll', scroll); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('in-view')), { threshold: .14 });
    document.querySelectorAll('.reveal').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [path, language]);

  const go: Navigate = href => {
    const [nextPath, hash] = href.split('#');
    if (nextPath && nextPath !== location.pathname) { history.pushState({}, '', href); setPath(nextPath); scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
    setMenuOpen(false);
  };

  return <Shell language={language} setLanguage={setLanguage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrolled={scrolled} go={go}>
    {path === '/' ? <Home language={language} go={go} /> : path === '/merchants' ? <MerchantPage language={language} /> : path === '/contact' ? <ContactPage language={language} /> : path === '/privacy' || path === '/terms' ? <LegalPage language={language} kind={path.slice(1) as 'privacy' | 'terms'} /> : <NotFound language={language} go={go} />}
  </Shell>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'compact' : ''}`}><span className="brand-mark" aria-hidden="true"><img src={morMark} alt="" /></span><span className="brand-type"><b>مر</b><small>MOR</small></span></span>;
}

function Shell({ children, language, setLanguage, menuOpen, setMenuOpen, scrolled, go }: { children: ReactNode; language: Language; setLanguage: (l: Language) => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void; scrolled: boolean; go: Navigate }) {
  const c = copy[language], ar = language === 'ar';
  const links = [['/#top', c.nav[0]], ['/#how', c.nav[1]], ['/#customers', c.nav[2]], ['/#business', c.nav[3]], ['/#faq', c.nav[4]]];
  return <div className="site-shell"><a className="skip-link" href="#main">{ar ? 'تخطّ إلى المحتوى' : 'Skip to content'}</a>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}><div className="header-inner">
      <a className="brand-link" href="/" onClick={e => { e.preventDefault(); go('/'); }} aria-label={ar ? 'مر، الرئيسية' : 'MOR, home'}><Brand compact /></a>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>{links.map(([href, label]) => <a key={href} href={href} onClick={e => { e.preventDefault(); go(href); }}>{label}</a>)}<a className="button primary mobile-only" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a></nav>
      <div className="header-actions"><a className="button primary desktop-cta" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div></header>{children}<div className="floating-language" role="group" aria-label={ar ? 'اختيار اللغة' : 'Choose language'}><button className={ar ? 'active' : ''} onClick={() => setLanguage('ar')} aria-pressed={ar}><span aria-hidden="true">🇸🇦</span><b>عربي</b></button><button className={!ar ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={!ar}><span aria-hidden="true">🇺🇸</span><b>English</b></button></div></div>;
}

function Home({ language, go }: { language: Language; go: Navigate }) {
  const c = copy[language], ar = language === 'ar';
  return <main id="main" className="world-page">
    <section className="world-hero" id="top">
      <div className="world-glow"/><div className="world-grid"/>
      <div className="world-hero-inner">
        <div className="world-copy reveal"><span className="world-kicker"><span className="pulse-dot"/>{c.heroTag}</span><h1>{c.heroTitle}</h1><p>{c.heroBody}</p><div className="actions"><a className="button bright" href="#journey" onClick={e => { e.preventDefault(); go('/#journey'); }}>{c.discover}{ar ? <ArrowLeft/> : <ArrowRight/>}</a><a className="button glass" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a></div><div className="world-proof"><span><strong>01</strong>{ar ? 'اطلب من القريب' : 'Order nearby'}</span><i/><span><strong>02</strong>{ar ? 'استلم من السيارة' : 'Pick up curbside'}</span></div></div>
        <div className="neighborhood-stage reveal"><img src={neighborhoodHero} alt={ar ? 'حي عصري يربط المقاهي والمطاعم بسيارة العميل عبر طريق مر' : 'A modern neighborhood connecting cafés and restaurants to the customer car through the MOR road'} /><div className="scene-status"><span className="status-orbit"><i/></span><small>{ar ? 'نقطة الاستلام' : 'PICKUP POINT'}</small><b>{ar ? 'طلبك جاهز' : 'Order ready'}</b></div><div className="scene-chip"><Car/>{ar ? 'أنت بالطريق' : 'You’re on the way'}</div></div>
      </div><div className="hero-scroll-cue"><span>{ar ? 'تابع الرحلة' : 'Follow the journey'}</span><i/></div>
    </section>

    <JourneyStory language={language}/>
    <ProductStory language={language}/>
    <MerchantWorld language={language} go={go}/>
    <StoreTypes language={language}/>
    <FAQ language={language}/>
    <section className="contact-cta reveal"><div><span className="section-label">{ar ? 'فريق مر' : 'MOR TEAM'}</span><h2>{c.finalTitle}</h2><p>{c.finalBody}</p></div><a className="button primary" href="/contact#contact-name" onClick={e => { e.preventDefault(); go('/contact#contact-name'); }}>{ar ? 'تواصل معنا' : 'Contact us'}{ar ? <ArrowLeft/> : <ArrowRight/>}</a></section>
  </main>;
}

function JourneyStory({ language }: { language: Language }) {
  const ar = language === 'ar';
  const steps = ar ? ['اختر متجرك','اطلب','أنا بالطريق','وصلت','طلبك عند سيارتك'] : ['Choose your store','Order','I’m on my way','Arrived','Your order reaches your car'];
  return <section className="journey-world" id="journey"><div className="journey-intro reveal"><span className="section-label">{ar ? 'رحلة واحدة، بدون انقطاع' : 'ONE CONNECTED JOURNEY'}</span><h2>{ar ? 'من حيّك إلى سيارتك، على طريق مر.' : 'From your neighborhood to your car, along the MOR road.'}</h2><p>{ar ? 'مر مو توصيل. اطلب، تحرك للفرع، وخذ طلبك بدون ما تنزل من السيارة.' : 'MOR is not delivery. Order, head to the branch, and collect without leaving your car.'}</p></div><div className="journey-track reveal"><svg viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true"><path className="journey-shadow" d="M35 330 C190 65 330 65 455 230 S720 410 820 180 S1040 60 1165 125"/><path className="journey-line" d="M35 330 C190 65 330 65 455 230 S720 410 820 180 S1040 60 1165 125"/></svg><div className="journey-car" aria-hidden="true"><Car/></div>{steps.map((step,i)=><article key={step} className={`journey-step step-${i+1}`}><span>{String(i+1).padStart(2,'0')}</span><b>{step}</b>{i===3 && <i className="arrival-ring"/>}</article>)}</div></section>;
}

function ProductStory({ language }: { language: Language }) {
  const ar=language==='ar';
  return <section className="product-world" id="customers"><div className="product-copy reveal"><span className="section-label">{ar ? 'تجربة العميل' : 'CUSTOMER EXPERIENCE'}</span><h2>{ar ? 'كل شيء واضح. من الطلب إلى الوصول.' : 'Everything stays clear, from order to arrival.'}</h2><p>{ar ? 'واجهة هادئة تعرض القريب، حالة الطلب، سيارتك، ونقطة الاستلام في اللحظة المناسبة.' : 'A calm interface surfaces nearby stores, order status, your vehicle and pickup point exactly when needed.'}</p><div className="product-notes"><span><i>01</i>{ar?'متاجر قريبة فعلًا':'Truly nearby stores'}</span><span><i>02</i>{ar?'حالة الطلب مباشرة':'Live order status'}</span><span><i>03</i>{ar?'وصول مفهوم للمتجر':'Arrival the store understands'}</span></div></div><div className="phone-scene reveal"><div className="phone-halo"/><div className="phone-shell"><div className="phone-island"/><div className="phone-top"><Brand compact/><Bell/></div><small>{ar?'مساء الخير':'Good evening'}</small><h3>{ar?'وش ودك اليوم؟':'What would you like today?'}</h3><div className="map-surface"><span className="map-road one"/><span className="map-road two"/><span className="map-pin pin-one"><i/></span><span className="map-pin pin-two"><i/></span><div className="map-car"><Car/></div></div><div className="phone-order"><span><b>{ar?'طلبك جاهز':'Your order is ready'}</b><small>{ar?'الاستلام من السيارة':'Curbside pickup'}</small></span><button>{ar?'أنا بالطريق':"I'm on my way"}</button></div></div><div className="floating-arrival"><span className="arrival-icon"><MapPin/></span><small>{ar?'تم إشعار المتجر':'Store notified'}</small><b>{ar?'وصلت لنقطة الاستلام':'You’ve reached pickup'}</b></div><div className="floating-vehicle"><Car/><span><small>{ar?'السيارة':'VEHICLE'}</small><b>2030 · N T U</b></span></div></div></section>;
}

function MerchantWorld({ language, go }: { language: Language; go: Navigate }) {
  const ar=language==='ar'; const items=ar?['طلب جديد','جاري التجهيز','العميل بالطريق','العميل وصل','تم التسليم']:['New order','Preparing','Customer en route','Customer arrived','Handed over'];
  return <section className="merchant-world" id="business"><div className="merchant-aura"/><div className="merchant-inner"><div className="merchant-copy reveal"><span className="section-label">MOR BUSINESS</span><h2>{ar?'خل متجرك أقرب لعملائك':'Bring your store closer to customers'}</h2><p>{ar?'تدفق تشغيلي واحد يوضح لفريقك متى يجهّز، ومتى يتحرك العميل، ومتى وصل.':'One operational flow tells your team when to prepare, when the customer leaves, and when they arrive.'}</p><a className="button bright" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{ar?'سجّل متجرك':'Register your store'}{ar?<ArrowLeft/>:<ArrowRight/>}</a></div><div className="merchant-console reveal"><div className="console-top"><span><i/><b>{ar?'مر للأعمال':'MOR BUSINESS'}</b></span><small>{ar?'الفرع يعمل':'BRANCH LIVE'}</small></div><div className="console-body"><div className="console-order"><span className="order-no">#1048</span><div><b>{ar?'طلب استلام من السيارة':'Curbside order'}</b><small>{ar?'سيدان · 2030 N T U':'Sedan · 2030 N T U'}</small></div><strong>{ar?'وصل':'ARRIVED'}</strong></div><div className="console-flow">{items.map((item,i)=><div className={i<4?'done':''} key={item}><span>{i<4?<Check/>:String(i+1)}</span><b>{item}</b></div>)}</div></div><div className="console-pulse"><MapPin/></div></div></div></section>;
}

function HeroRoad({ language }: { language: Language }) { const ar = language === 'ar'; return <div className="hero-visual reveal"><div className="logo-orbit"><img src={morMark} alt={ar ? 'شعار مر' : 'MOR logo'} /></div><svg className="road-svg" viewBox="0 0 620 560" aria-hidden="true"><defs><linearGradient id="roadGlow" x1="0" x2="1"><stop stopColor="#18d7ff" /><stop offset="1" stopColor="#1658f0" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path className="road-base" d="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/><path className="road-line" d="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/><circle className="moving-light" r="7" fill="url(#roadGlow)" filter="url(#glow)"><animateMotion dur="5.5s" repeatCount="indefinite" path="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/></circle></svg><div className="journey-card journey-ready"><BadgeCheck/><span><small>{ar ? 'حالة الطلب' : 'ORDER STATUS'}</small><b>{ar ? 'طلبك جاهز' : 'Order ready'}</b></span></div><div className="journey-card journey-arrived"><MapPin/><span><small>{ar ? 'عند الوصول' : 'ON ARRIVAL'}</small><b>{ar ? 'اضغط «وصلت»' : 'Tap “I’ve arrived”'}</b></span></div></div>; }

function How({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="section how-section" id="how"><Heading eyebrow={c.howEyebrow} title={c.howTitle} body={c.howBody} /><div className="road-flow reveal"><div className="flow-track"><span /></div>{flow.map(([a, e, Icon], i) => <div className="flow-stop" key={a}><div className="flow-node"><Icon /><span>{String(i + 1).padStart(2, '0')}</span></div><b>{ar ? a : e}</b></div>)}</div></section>; }

function CustomerExperience({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="customer-section" id="customers"><div className="section customer-grid"><div className="customer-copy reveal"><Heading eyebrow={c.customerEyebrow} title={c.customerTitle} body={c.customerBody} /><div className="benefit-lines"><span><Search />{ar ? 'اكتشف القريب' : 'Discover nearby'}</span><span><Zap />{ar ? 'اطلب بخطوات أقل' : 'Order in fewer steps'}</span><span><Car />{ar ? 'استلم من السيارة' : 'Pick up from your car'}</span></div></div><div className="app-concept reveal" aria-label={ar ? 'تصور توضيحي لتجربة مر' : 'Illustrative MOR experience'}><span className="concept-note">{ar ? 'تصور توضيحي للتجربة' : 'EXPERIENCE CONCEPT'}</span><div className="concept-phone"><div className="concept-head"><Brand compact/><Bell/></div><h3>{ar ? 'وين ودك تمر اليوم؟' : 'Where are you stopping today?'}</h3><div className="concept-search"><Search/>{ar ? 'ابحث عن قهوة أو مطعم' : 'Search cafés or restaurants'}</div><div className="concept-categories"><span><Coffee/>{ar ? 'قهوة' : 'Coffee'}</span><span><Utensils/>{ar ? 'مطاعم' : 'Restaurants'}</span></div><div className="concept-nearby"><div><MapPin/><span><b>{ar ? 'متجر قريب' : 'Nearby store'}</b><small>{ar ? 'الاستلام من السيارة متاح' : 'Curbside pickup available'}</small></span></div><ArrowLeft/></div><div className="concept-action">{ar ? 'أنا بالطريق' : "I'm on my way"}<Car/></div></div><div className="arrival-pulse"><span/><MapPin/></div></div></div></section>; }

function StoreTypes({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="section types-section reveal"><Heading eyebrow={c.typesEyebrow} title={c.typesTitle} body={c.typesBody} /><div className="type-pair"><article><span>01</span><Coffee/><h3>{ar ? 'قهوة' : 'Coffee'}</h3><p>{ar ? 'طلبك المعتاد جاهز قبل ما توصل.' : 'Your usual order, ready before you arrive.'}</p></article><article><span>02</span><Utensils/><h3>{ar ? 'مطاعم' : 'Restaurants'}</h3><p>{ar ? 'استلام مرتب، بدون انتظار طويل.' : 'A smoother pickup without the long wait.'}</p></article></div></section>; }

function MerchantExperience({ language, go }: { language: Language; go: Navigate }) { const c = copy[language], ar = language === 'ar'; const items = ar ? ['استقبل الطلب', 'جهّز الطلب', 'اعرف أن العميل بالطريق', 'استعد عند وصوله', 'سلّم الطلب للسيارة'] : ['Receive the order', 'Prepare it', 'Know when the customer departs', 'Prepare for arrival', 'Hand it over at the car']; return <section className="business-section" id="business"><div className="section business-grid"><div className="business-copy reveal"><Heading eyebrow={c.merchantEyebrow} title={c.merchantTitle} body={c.merchantBody} /><a className="button bright" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}{ar ? <ArrowLeft/> : <ArrowRight/>}</a></div><div className="ops-panel reveal"><div className="ops-head"><span><Store/><b>{ar ? 'تدفق الاستلام' : 'Pickup workflow'}</b></span><i>{ar ? 'تشغيلي وواضح' : 'Clear operations'}</i></div>{items.map((item, i) => <div className="ops-row" key={item}><span>{String(i + 1).padStart(2, '0')}</span><b>{item}</b><Check/></div>)}</div></div></section>; }

function FAQ({ language }: { language: Language }) { const [open, setOpen] = useState(0), ar = language === 'ar'; return <section className="section faq-section" id="faq"><Heading eyebrow="FAQ" title={copy[language].faqTitle} body={ar ? 'إجابات مباشرة عن تجربة مر.' : 'Straight answers about the MOR experience.'} /><div className="faq-list reveal">{faqs.map(([qa, qe, aa, ae], i) => <article className={`faq-item ${open === i ? 'open' : ''}`} key={qa}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{ar ? qa : qe}</span><ChevronDown/></button><div><p>{ar ? aa : ae}</p></div></article>)}</div></section>; }
function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <div className="section-heading reveal"><span className="section-label">{eyebrow}</span><h2>{title}</h2><p>{body}</p></div>; }

function MerchantPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main id="main" className="inner-page"><section className="inner-hero"><span className="eyebrow light"><Store/>{ar ? 'مر للأعمال' : 'MOR for business'}</span><h1>{ar ? 'خل متجرك أقرب لعملائك' : 'Bring your store closer to customers'}</h1><p>{ar ? 'شاركنا بيانات متجرك، وفريق مر بيتواصل معك لمناقشة تجربة الاستلام.' : 'Share your store details and the MOR team will contact you about curbside pickup.'}</p></section><section className="section form-layout"><div><Heading eyebrow={ar ? 'ابدأ من هنا' : 'Start here'} title={ar ? 'عرّفنا على متجرك' : 'Tell us about your store'} body={ar ? 'التسجيل يعبر عن الاهتمام ولا ينشئ حسابًا تلقائيًا.' : 'Registration expresses interest and does not automatically create an account.'}/><div className="form-points"><span><Check/>{ar ? 'لا توجد رسوم أو التزامات في هذه الخطوة' : 'No fees or commitment at this stage'}</span><span><Check/>{ar ? 'يراجع الفريق الطلب ويتواصل معك' : 'Our team reviews and follows up'}</span></div></div><EmailForm language={language} type="merchant"/></section></main>; }
function ContactPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main id="main" className="inner-page contact-page"><section className="inner-hero compact"><span className="eyebrow light"><Mail/>{ar ? 'تواصل معنا' : 'Contact MOR'}</span><h1>{ar ? 'نسمع منك.' : 'We’re listening.'}</h1><p>{ar ? 'اكتب رسالتك، ونرجع لك على بيانات التواصل التي تضيفها.' : 'Send us your message and we’ll reply using the contact details you provide.'}</p></section><section className="section contact-form-wrap"><EmailForm language={language} type="contact"/></section></main>; }

function EmailForm({ language, type }: { language: Language; type: 'merchant' | 'contact' }) {
  const ar = language === 'ar';
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, type }) });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      form.reset();
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  return <form ref={formRef} className="lead-form" onSubmit={submit} aria-busy={status === 'sending'}><input className="form-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"/><div className="form-grid">{type === 'merchant' && <><Field name="store" label={ar ? 'اسم المتجر' : 'Store name'} /><Field name="business" label={ar ? 'نوع النشاط' : 'Business type'} /></>}<Field name="name" id={type === 'contact' ? 'contact-name' : undefined} autoFocus={type === 'contact'} label={ar ? 'الاسم' : 'Name'} /><Field name="phone" type="tel" label={ar ? 'رقم الجوال' : 'Phone number'} /><Field name="email" type="email" label={ar ? 'البريد الإلكتروني' : 'Email'} />{type === 'merchant' && <Field name="city" label={ar ? 'المدينة' : 'City'} />}</div>{type === 'contact' && <label className="field full"><span>{ar ? 'الرسالة' : 'Message'}</span><textarea name="message" rows={5} required/></label>}<button className="button primary form-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? (ar ? 'جارٍ الإرسال…' : 'Sending…') : type === 'merchant' ? (ar ? 'إرسال الطلب' : 'Send request') : (ar ? 'إرسال الرسالة' : 'Send message')}<ArrowLeft/></button><small className="form-disclosure">{ar ? 'تُرسل البيانات بأمان مباشرة إلى فريق مر، ولن يفتح تطبيق البريد.' : 'Your details are sent securely to the MOR team without opening an email app.'}</small>{status === 'success' && <p className="form-status" role="status">{ar ? 'وصلتنا رسالتك بنجاح. شكرًا لتواصلك مع مر.' : 'Your message was sent successfully. Thanks for contacting MOR.'}</p>}{status === 'error' && <p className="form-status error" role="alert">{ar ? 'تعذر إرسال الرسالة الآن. حاول مرة أخرى بعد قليل.' : 'We could not send your message. Please try again shortly.'}</p>}</form>;
}
function Field({ name, label, type = 'text', id, autoFocus = false }: { name: string; label: string; type?: string; id?: string; autoFocus?: boolean }) { return <label className="field"><span>{label}</span><input id={id} name={name} type={type} required autoFocus={autoFocus} autoComplete={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'name'}/></label>; }

function LegalPage({ language, kind }: { language: Language; kind: 'privacy' | 'terms' }) { const ar = language === 'ar', privacy = kind === 'privacy'; const headings = privacy ? (ar ? ['المعلومات التي تقدمها', 'استخدام المعلومات', 'مشاركة البيانات', 'حماية البيانات', 'حقوقك', 'التواصل'] : ['Information you provide', 'How information is used', 'Data sharing', 'Data protection', 'Your rights', 'Contact']) : (ar ? ['استخدام الموقع', 'توفر الخدمة', 'محتوى الموقع', 'حدود المسؤولية', 'التغييرات', 'التواصل'] : ['Website use', 'Service availability', 'Website content', 'Liability limits', 'Changes', 'Contact']); return <main id="main" className="inner-page legal-page"><section className="inner-hero compact"><span className="eyebrow light"><BadgeCheck/>{ar ? 'يتطلب مراجعة قانونية' : 'Requires legal review'}</span><h1>{privacy ? (ar ? 'سياسة الخصوصية' : 'Privacy Policy') : (ar ? 'الشروط والأحكام' : 'Terms & Conditions')}</h1><p>{ar ? 'مسودة أولية تحتاج مراجعة واعتمادًا قانونيًا قبل النشر النهائي.' : 'A preliminary draft requiring legal review before final publication.'}</p></section><article className="legal-content"><div className="legal-note">{ar ? 'تنبيه: هذا النص مؤقت وليس استشارة قانونية.' : 'Notice: This is temporary copy, not legal advice.'}</div>{headings.map((heading, i) => <section key={heading}><span>{String(i + 1).padStart(2, '0')}</span><h2>{heading}</h2><p>{ar ? `سيتم استكمال تفاصيل ${heading} بعد اعتماد نموذج تشغيل الخدمة ومراجعة المختص القانوني. للتواصل: ${SUPPORT_EMAIL}.` : `Details for ${heading.toLowerCase()} will be finalized after the service model is confirmed and reviewed by legal counsel. Contact: ${SUPPORT_EMAIL}.`}</p></section>)}</article></main>; }
function NotFound({ language, go }: { language: Language; go: Navigate }) { const ar = language === 'ar'; return <main id="main" className="not-found"><span>404</span><h1>{ar ? 'الصفحة غير موجودة' : 'Page not found'}</h1><a className="button primary" href="/" onClick={e => { e.preventDefault(); go('/'); }}>{ar ? 'العودة للرئيسية' : 'Back home'}</a></main>; }
export { HeroRoad, How, CustomerExperience, MerchantExperience };
export default App;
