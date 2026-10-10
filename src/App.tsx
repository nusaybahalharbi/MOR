import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Car, Check, ChevronDown,
  Coffee, MapPin, Menu, PackageCheck, Search, ShoppingBag,
  Store, Utensils, X, Zap
} from 'lucide-react';
import morMark from './assets/brand/mor-mark-transparent.png';
import neighborhoodHero from './assets/brand/mor-neighborhood-hero.png';

type Language = 'ar' | 'en';
type Navigate = (href: string) => void;

const SUPPORT_EMAIL = 'support@morapp.tech';
const COMPLETE_EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

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
    const metadata: Record<string, { ar: [string, string]; en: [string, string] }> = {
      '/': {
        ar: ['مر | استلم طلبك من متاجر حيّك بسهولة', 'اطلب من المقاهي والمطاعم القريبة واستلم طلبك من السيارة بسهولة مع مر.'],
        en: ['MOR | Curbside Pickup From Local Stores', 'Order from nearby cafés and restaurants and pick up from your car with MOR.'],
      },
      '/privacy': {
        ar: ['سياسة الخصوصية | مر', 'تعرّف على كيفية جمع مر لبياناتك الشخصية واستخدامها وحمايتها، وعلى حقوقك وفق الأنظمة المعمول بها في المملكة العربية السعودية.'],
        en: ['Privacy Policy | MOR', 'Learn how MOR collects, uses and protects personal data, and understand your privacy rights under applicable Saudi law.'],
      },
      '/terms': {
        ar: ['الشروط والأحكام | مر', 'الشروط والأحكام المنظمة لاستخدام موقع وخدمات مر.'],
        en: ['Terms & Conditions | MOR', 'Terms and conditions governing use of the MOR website and services.'],
      },
      '/contact': {
        ar: ['انضم إلى مر | مر للأعمال', 'أرسل بيانات متجرك للانضمام إلى مر للأعمال.'],
        en: ['Join MOR | MOR Business', 'Share your business details to join MOR Business.'],
      },
      '/merchants': {
        ar: ['سجّل متجرك | مر للأعمال', 'سجّل اهتمام متجرك بخدمة الاستلام من السيارة مع مر.'],
        en: ['Register Your Store | MOR Business', 'Register your interest in offering curbside pickup with MOR.'],
      },
    };
    const [title, description] = (metadata[path] ?? metadata['/'])[language];
    const canonicalUrl = `https://morapp.tech${path === '/' ? '/' : path}`;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'ar' ? 'ar_SA' : 'en_US');
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  }, [language, path]);
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
    if (nextPath && nextPath !== location.pathname) { history.pushState({}, '', href); setPath(nextPath); if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 50); else scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
    setMenuOpen(false);
  };

  return <Shell language={language} setLanguage={setLanguage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrolled={scrolled} go={go}>
    {path === '/' ? <Home language={language} go={go} /> : path === '/merchants' || path === '/contact' ? <MerchantPage language={language} /> : path === '/privacy' || path === '/terms' ? <LegalPage language={language} kind={path.slice(1) as 'privacy' | 'terms'} /> : <NotFound language={language} go={go} />}
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
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>{links.map(([href, label]) => <a key={href} href={href} onClick={e => { e.preventDefault(); go(href); }}>{label}</a>)}<div className="mobile-language" role="group" aria-label={ar ? 'اختيار اللغة' : 'Choose language'}><button className={ar ? 'active' : ''} onClick={() => setLanguage('ar')} aria-pressed={ar}><span aria-hidden="true">🇸🇦</span>عربي</button><button className={!ar ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={!ar}><span aria-hidden="true">🇺🇸</span>English</button></div><a className="button primary mobile-only" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a></nav>
      <div className="header-actions"><a className="button primary desktop-cta" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div></header>{children}<footer className="legal-footer"><span>© {new Date().getFullYear()} MOR · مر</span><nav aria-label={ar ? 'روابط قانونية' : 'Legal links'}><a href="/privacy" onClick={e => { e.preventDefault(); go('/privacy'); }}>{ar ? 'سياسة الخصوصية' : 'Privacy Policy'}</a><a href="/terms" onClick={e => { e.preventDefault(); go('/terms'); }}>{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</a><a href="/merchants#merchant-name" onClick={e => { e.preventDefault(); go('/merchants#merchant-name'); }}>{ar ? 'انضم إلى مر للأعمال' : 'Join MOR Business'}</a></nav></footer><div className="floating-language" role="group" aria-label={ar ? 'اختيار اللغة' : 'Choose language'}><button className={ar ? 'active' : ''} onClick={() => setLanguage('ar')} aria-pressed={ar}><span aria-hidden="true">🇸🇦</span><b>عربي</b></button><button className={!ar ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={!ar}><span aria-hidden="true">🇺🇸</span><b>English</b></button></div></div>;
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
    <section className="contact-cta reveal"><div><span className="section-label">{ar ? 'مر للأعمال' : 'MOR BUSINESS'}</span><h2>{ar ? 'جاهز تقرّب متجرك لعملائك؟' : 'Ready to bring your store closer?'}</h2><p>{ar ? 'شاركنا بيانات متجرك، وفريق مر للأعمال بيتواصل معك.' : 'Share your store details and the MOR Business team will contact you.'}</p></div><a className="button primary" href="/merchants#merchant-name" onClick={e => { e.preventDefault(); go('/merchants#merchant-name'); }}>{ar ? 'سجّل اهتمامك' : 'Register interest'}{ar ? <ArrowLeft/> : <ArrowRight/>}</a></section>
  </main>;
}

function JourneyStory({ language }: { language: Language }) {
  const ar = language === 'ar';
  const steps = ar ? ['اختر متجرك','اطلب','أنا بالطريق','وصلت','طلبك عند سيارتك'] : ['Choose your store','Order','I’m on my way','Arrived','Your order reaches your car'];
  return <section className="journey-world" id="journey"><div className="journey-intro reveal"><span className="section-label">{ar ? 'رحلة واحدة، بدون انقطاع' : 'ONE CONNECTED JOURNEY'}</span><h2>{ar ? 'من حيّك إلى سيارتك، على طريق مر.' : 'From your neighborhood to your car, along the MOR road.'}</h2><p>{ar ? 'مر مو توصيل. اطلب، تحرك للفرع، وخذ طلبك بدون ما تنزل من السيارة.' : 'MOR is not delivery. Order, head to the branch, and collect without leaving your car.'}</p></div><DesktopJourney steps={steps}/><MobileJourney steps={steps} label={ar ? 'خطوات تجربة مر' : 'The MOR journey'}/></section>;
}

function DesktopJourney({ steps }: { steps: string[] }) {
  return <div className="journey-track journey-desktop reveal"><svg viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true"><path className="journey-shadow" d="M35 330 C190 65 330 65 455 230 S720 410 820 180 S1040 60 1165 125"/><path className="journey-line" d="M35 330 C190 65 330 65 455 230 S720 410 820 180 S1040 60 1165 125"/></svg><div className="journey-car" aria-hidden="true"><Car/></div>{steps.map((step,i)=><article key={step} className={`journey-step step-${i+1}`}><span>{String(i+1).padStart(2,'0')}</span><b>{step}</b>{i===3 && <i className="arrival-ring"/>}</article>)}</div>;
}

function MobileJourney({ steps, label }: { steps: string[]; label: string }) {
  return <div className="journey-mobile reveal" aria-label={label}><svg className="mobile-road" viewBox="0 0 390 700" preserveAspectRatio="none" aria-hidden="true"><path className="mobile-road-shadow" d="M195 65 C65 125 325 170 195 205 S65 285 195 340 S325 420 195 475 S65 560 195 635"/><path className="mobile-road-line" d="M195 65 C65 125 325 170 195 205 S65 285 195 340 S325 420 195 475 S65 560 195 635"/></svg><div className="mobile-journey-car" aria-hidden="true"><Car/></div><div className="mobile-steps">{steps.map((step,i)=><article key={step} className="mobile-step"><span>{String(i+1).padStart(2,'0')}</span><b>{step}</b><i aria-hidden="true"/></article>)}</div></div>;
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

function MerchantPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main id="main" className="inner-page"><section className="inner-hero"><span className="eyebrow light"><Store/>{ar ? 'مر للأعمال' : 'MOR for business'}</span><h1>{ar ? 'خل متجرك أقرب لعملائك' : 'Bring your store closer to customers'}</h1><p>{ar ? 'هذه الصفحة مخصصة للمقاهي والمطاعم الراغبة بالانضمام إلى مر. شاركنا بيانات متجرك وسيتواصل معك فريق مر للأعمال.' : 'This page is for cafés and restaurants interested in joining MOR. Share your business details and the MOR Business team will contact you.'}</p></section><section className="section form-layout"><div><Heading eyebrow={ar ? 'طلب انضمام تاجر' : 'Merchant enquiry'} title={ar ? 'عرّفنا على متجرك' : 'Tell us about your store'} body={ar ? 'هذا طلب اهتمام للانضمام إلى مر للأعمال، وليس قناة دعم. الدعم متاح داخل تطبيق مر.' : 'This is a merchant interest form, not a support channel. Support is available inside the MOR app.'}/><div className="form-points"><span><Check/>{ar ? 'لا توجد رسوم أو التزامات في هذه الخطوة' : 'No fees or commitment at this stage'}</span><span><Check/>{ar ? 'يراجع فريق مر للأعمال الطلب ويتواصل معك' : 'The MOR Business team reviews and follows up'}</span></div></div><EmailForm language={language}/></section></main>; }

function EmailForm({ language }: { language: Language }) {
  const ar = language === 'ar';
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    emailInput.setCustomValidity('');
    if (!COMPLETE_EMAIL_PATTERN.test(String(data.email ?? '').trim())) {
      emailInput.setCustomValidity(ar ? 'أدخل بريدًا إلكترونيًا كاملًا مثل name@example.com' : 'Enter a complete email such as name@example.com');
      emailInput.reportValidity();
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, type: 'merchant' }) });
      if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
      form.reset();
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  return <form ref={formRef} className="lead-form" onSubmit={submit} aria-busy={status === 'sending'}><input className="form-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"/><div className="form-grid"><Field name="store" label={ar ? 'اسم المتجر' : 'Store name'} /><SelectField name="business" label={ar ? 'نوع النشاط' : 'Business type'} placeholder={ar ? 'اختر نوع النشاط' : 'Select business type'} options={[['cafe', ar ? 'مقهى' : 'Café'], ['restaurant', ar ? 'مطعم' : 'Restaurant']]}/><Field name="name" id="merchant-name" label={ar ? 'اسم المسؤول' : 'Contact name'} /><PhoneField language={language} reset={status === 'success'}/><Field name="email" type="email" inputMode="email" autoComplete="email" pattern="[^\s@]+@[^\s@]+\.[A-Za-z]{2,}" title={ar ? 'أدخل بريدًا إلكترونيًا صحيحًا مثل name@example.com' : 'Enter a valid email such as name@example.com'} label={ar ? 'البريد الإلكتروني للعمل' : 'Business email'} /><Field name="city" label={ar ? 'المدينة' : 'City'} /></div><button className="button primary form-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? (ar ? 'جارٍ إرسال الطلب…' : 'Sending request…') : (ar ? 'إرسال طلب الانضمام' : 'Send merchant enquiry')}<ArrowLeft/></button><small className="form-disclosure">{ar ? 'تُرسل بياناتك مباشرة إلى فريق مر للأعمال. الدعم متاح داخل تطبيق مر.' : 'Your details go directly to the MOR Business team. Support is available inside the MOR app.'}</small>{status === 'success' && <p className="form-status" role="status">{ar ? 'وصل طلبك إلى فريق مر للأعمال بنجاح. سنتواصل معك قريبًا.' : 'Your enquiry reached the MOR Business team. We’ll contact you soon.'}</p>}{status === 'error' && <p className="form-status error" role="alert">{ar ? 'تعذر إرسال الطلب الآن. تحقق من رقم الجوال والبريد ثم حاول مرة أخرى.' : 'We could not send the request. Check the phone number and email, then try again.'}</p>}</form>;
}
function Field({ name, label, type = 'text', id, inputMode, pattern, title, autoComplete }: { name: string; label: string; type?: string; id?: string; inputMode?: 'email' | 'text'; pattern?: string; title?: string; autoComplete?: string }) { return <label className="field"><span>{label}</span><input id={id} name={name} type={type} required inputMode={inputMode} pattern={name === 'email' ? String.raw`[^\s@]+@[^\s@]+\.[A-Za-z]{2,}` : pattern} title={title} autoComplete={autoComplete ?? (name === 'email' ? 'email' : 'name')} onInput={event => { if (name === 'email') event.currentTarget.setCustomValidity(''); }}/></label>; }
function SelectField({ name, label, placeholder, options }: { name: string; label: string; placeholder: string; options: [string, string][] }) { return <label className="field"><span>{label}</span><select name={name} required defaultValue=""><option value="" disabled>{placeholder}</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }

const phoneCountries = [
  { code: 'SA', flag: '🇸🇦', dial: '+966', ar: 'السعودية', en: 'Saudi Arabia', digits: 9, placeholder: '5X XXX XXXX' },
  { code: 'KW', flag: '🇰🇼', dial: '+965', ar: 'الكويت', en: 'Kuwait', digits: 8, placeholder: 'XXXX XXXX' },
  { code: 'BH', flag: '🇧🇭', dial: '+973', ar: 'البحرين', en: 'Bahrain', digits: 8, placeholder: 'XXXX XXXX' },
  { code: 'QA', flag: '🇶🇦', dial: '+974', ar: 'قطر', en: 'Qatar', digits: 8, placeholder: 'XXXX XXXX' },
  { code: 'AE', flag: '🇦🇪', dial: '+971', ar: 'الإمارات', en: 'UAE', digits: 9, placeholder: '5X XXX XXXX' },
  { code: 'OM', flag: '🇴🇲', dial: '+968', ar: 'عُمان', en: 'Oman', digits: 8, placeholder: 'XXXX XXXX' },
] as const;

function PhoneField({ language, reset }: { language: Language; reset: boolean }) {
  const [country, setCountry] = useState<(typeof phoneCountries)[number]>(phoneCountries[0]);
  const [value, setValue] = useState('');
  useEffect(() => { if (reset) { setCountry(phoneCountries[0]); setValue(''); } }, [reset]);
  const groups = country.digits === 9 ? [2, 3, 4] : [4, 4];
  const formatted = groups.reduce<string[]>((parts, size) => { const used = parts.join('').length; const part = value.slice(used, used + size); return part ? [...parts, part] : parts; }, []).join(' ');
  return <label className="field phone-field"><span>{language === 'ar' ? 'رقم الجوال' : 'Mobile number'}</span><div className="phone-control" dir="ltr"><select name="country" aria-label={language === 'ar' ? 'الدولة' : 'Country'} value={country.code} onChange={event => { setCountry(phoneCountries.find(item => item.code === event.target.value) ?? phoneCountries[0]); setValue(''); }}>{phoneCountries.map(item => <option key={item.code} value={item.code}>{item.flag} {language === 'ar' ? item.ar : item.en} ({item.dial})</option>)}</select><span className="dial-code">{country.dial}</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={formatted} onChange={event => setValue(event.target.value.replace(/\D/g, '').slice(0, country.digits))} placeholder={country.placeholder} minLength={country.digits + (country.digits === 9 ? 2 : 1)} maxLength={country.digits + (country.digits === 9 ? 2 : 1)} required aria-label={language === 'ar' ? 'رقم الجوال بدون مفتاح الدولة' : 'Mobile number without country code'}/></div></label>;
}

type PolicySection = { id: string; title: string; body: ReactNode };

function PrivacyPolicy({ language }: { language: Language }) {
  const ar = language === 'ar';
  const sections: PolicySection[] = ar ? [
    { id: 'scope', title: 'من نحن ونطاق السياسة', body: <><p>مر («مر» أو «نحن») منصة سعودية تساعد العملاء على الطلب من المتاجر القريبة واستلام الطلب من السيارة. توضح هذه السياسة كيف نتعامل مع البيانات الشخصية عند استخدام موقع <bdi>morapp.tech</bdi>، وتطبيقات مر، وخدمات العملاء والتجار والدعم المرتبطة بها.</p><p>تُعد مر جهة التحكم في البيانات التي تحدد أغراض ووسائل معالجتها، ما لم نوضح خلاف ذلك في خدمة محددة.</p></> },
    { id: 'collection', title: 'البيانات التي نجمعها', body: <><p>قد نجمع البيانات التالية بحسب الخدمة التي تستخدمها:</p><ul><li><strong>بيانات الحساب والتواصل:</strong> الاسم، رقم الجوال، البريد الإلكتروني، وبيانات التحقق وتسجيل الدخول.</li><li><strong>بيانات الطلب والاستلام:</strong> الطلبات، الفرع، حالة الطلب والوصول، وقت الاستلام، ومعلومات السيارة واللوحة اللازمة لتسليم الطلب الصحيح.</li><li><strong>بيانات الموقع:</strong> الموقع التقريبي أو الدقيق عند منح الإذن وحين تكون هذه البيانات مطلوبة لإظهار المتاجر القريبة أو تنفيذ الاستلام.</li><li><strong>بيانات التجار:</strong> اسم المنشأة والنشاط والفروع والعناوين وساعات العمل ووسائل التواصل والمعلومات المقدمة في طلب التسجيل أو التحديث.</li><li><strong>الدعم والمراسلات:</strong> محتوى المحادثات والرسائل والمرفقات ومعلومات معالجة الطلب.</li><li><strong>البيانات التقنية:</strong> عنوان بروتوكول الإنترنت، نوع الجهاز والمتصفح، معرفات الجلسة، سجلات الأعطال والأمان، وتفضيل اللغة.</li></ul><p>نجمع البيانات منك مباشرة، أو تلقائيًا أثناء استخدام الخدمة، أو من متجر تتعامل معه عندما يكون ذلك لازمًا لتنفيذ طلبك.</p></> },
    { id: 'purposes', title: 'لماذا نستخدم بياناتك', body: <><p>نستخدم البيانات بالقدر اللازم من أجل:</p><ul><li>إنشاء الحساب والتحقق من الهوية وإدارة الجلسة.</li><li>تنفيذ الطلبات وربط العميل بالفرع وإدارة حالة «أنا بالطريق» و«وصلت» والاستلام من السيارة.</li><li>معالجة طلبات انضمام التجار وتحديث بيانات الفروع وتشغيل لوحة الأعمال.</li><li>تقديم الدعم والرد على الرسائل ومعالجة الشكاوى.</li><li>حماية الخدمة ومنع إساءة الاستخدام والاحتيال والتحقيق في الحوادث.</li><li>تحسين الأداء وتجربة الاستخدام وإعداد إحصاءات مجمعة لا تحدد هوية الأفراد.</li><li>الامتثال للالتزامات النظامية وإنفاذ الشروط وحماية الحقوق.</li><li>إرسال رسائل خدمية ضرورية، أو رسائل تسويقية عندما يسمح النظام بذلك وبعد الحصول على الموافقة اللازمة.</li></ul></> },
    { id: 'basis', title: 'المسوغ النظامي للمعالجة', body: <p>نعالج البيانات بناءً على موافقتك عندما تكون الموافقة مطلوبة، أو لتنفيذ خدمة أو طلب أبرمته معنا، أو للوفاء بالتزام نظامي، أو لتحقيق مصلحة مشروعة يسمح بها النظام مثل حماية المنصة ومنع الاحتيال وتحسين موثوقيتها، مع مراعاة حقوقك ومصالحك. يمكنك سحب الموافقة في أي وقت للمعالجات القائمة عليها، دون أن يؤثر ذلك في مشروعية المعالجة السابقة للسحب.</p> },
    { id: 'sharing', title: 'متى نشارك البيانات', body: <><p>لا نبيع بياناتك الشخصية. وقد نشارك الحد الأدنى اللازم منها مع:</p><ul><li>المتجر أو الفرع الذي اخترته، حتى يتمكن من تجهيز الطلب وتسليمه.</li><li>مزودي الخدمات الذين يعملون نيابةً عنا، مثل الاستضافة وقواعد البيانات والتحقق بالرسائل والبريد والدعم والتحليلات، بموجب التزامات مناسبة للسرية والحماية.</li><li>الجهات الحكومية أو التنظيمية أو القضائية عندما يلزمنا النظام أو يكون الإفصاح ضروريًا لحماية الحقوق أو السلامة.</li><li>طرف في عملية إعادة تنظيم أو استحواذ محتملة، مع استمرار حماية البيانات وفق المتطلبات النظامية.</li></ul></> },
    { id: 'transfer', title: 'نقل البيانات خارج المملكة', body: <p>قد يستخدم بعض مزودي الخدمة بنية تقنية خارج المملكة العربية السعودية. إذا استلزم تشغيل الخدمة نقل بيانات شخصية خارج المملكة، فسيتم ذلك وفق متطلبات نظام حماية البيانات الشخصية ولوائحه، وبالضمانات النظامية المناسبة وبالقدر الضروري فقط.</p> },
    { id: 'retention', title: 'مدة الاحتفاظ', body: <p>نحتفظ بالبيانات فقط للمدة اللازمة للأغراض الموضحة في هذه السياسة، ولتنفيذ الطلبات والدعم، والوفاء بالمتطلبات المحاسبية أو النظامية، وتسوية النزاعات وحماية الخدمة. عند انتهاء الحاجة، نحذف البيانات أو نتلفها بطريقة آمنة أو نحولها إلى بيانات لا يمكن ربطها بك، ما لم يتطلب النظام الاحتفاظ بها مدة أطول.</p> },
    { id: 'security', title: 'كيف نحمي بياناتك', body: <p>نطبق تدابير تقنية وتنظيمية معقولة تشمل التحكم في الصلاحيات، وتقييد الوصول بحسب الدور، وحماية الاتصالات، والمراقبة والنسخ الاحتياطي ومراجعة مزودي الخدمة. ومع ذلك، لا توجد وسيلة نقل أو تخزين إلكتروني آمنة بنسبة مطلقة؛ لذلك نعمل باستمرار على تقليل المخاطر والاستجابة للحوادث وفق المتطلبات النظامية.</p> },
    { id: 'rights', title: 'حقوقك', body: <><p>وفق نظام حماية البيانات الشخصية واللوائح ذات الصلة، قد يكون لك الحق في:</p><ul><li>العلم بسبب جمع بياناتك والغرض من معالجتها.</li><li>الوصول إلى بياناتك الشخصية والحصول على نسخة واضحة منها.</li><li>طلب تصحيح البيانات غير الدقيقة أو إكمالها أو تحديثها.</li><li>طلب إتلاف البيانات التي انتهت الحاجة إليها، مع مراعاة الاستثناءات النظامية.</li><li>سحب الموافقة للمعالجة القائمة عليها.</li><li>تقديم شكوى إلى الجهة المختصة إذا لم تُعالج ملاحظتك بصورة مناسبة.</li></ul><p>لتقديم طلب، راسلنا من البريد المرتبط بحسابك واذكر طبيعة الطلب. قد نحتاج إلى التحقق من هويتك قبل تنفيذه، وقد تنطبق قيود أو استثناءات نظامية.</p></> },
    { id: 'cookies', title: 'ملفات الارتباط والتخزين المحلي', body: <p>يستخدم الموقع تقنيات ضرورية لتشغيله وتذكر اختياراتك، مثل حفظ اللغة المفضلة في التخزين المحلي. إذا استخدمنا مستقبلًا أدوات تحليل أو ملفات ارتباط غير ضرورية، فسنقدم المعلومات وخيارات الموافقة اللازمة قبل تشغيلها حيثما يقتضي النظام.</p> },
    { id: 'children', title: 'خصوصية الأطفال', body: <p>الخدمات ليست موجهة لمن هم دون 18 عامًا بصورة مستقلة. إذا علمنا أننا جمعنا بيانات طفل دون أساس نظامي أو موافقة وليه عند الحاجة، فسنتخذ خطوات مناسبة لحذفها.</p> },
    { id: 'updates', title: 'تحديث هذه السياسة', body: <p>قد نحدث هذه السياسة عند تطوير الخدمات أو تغير المتطلبات النظامية. سننشر النسخة المحدثة في هذه الصفحة ونوضح تاريخ آخر تحديث، وسنقدم إشعارًا إضافيًا إذا كان التغيير جوهريًا متى كان ذلك مطلوبًا.</p> },
    { id: 'contact', title: 'التواصل وطلبات الخصوصية', body: <><p>للاستفسار عن هذه السياسة أو ممارسة حقوقك، تواصل مع فريق خصوصية مر:</p><p className="policy-contact"><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><span><bdi>https://morapp.tech/contact</bdi></span><span>المملكة العربية السعودية</span></p><p>سنؤكد استلام طلبك ونتعامل معه ضمن المدد والمتطلبات المقررة نظامًا.</p></> },
  ] : [
    { id: 'scope', title: 'Who we are and what this policy covers', body: <><p>MOR (“MOR”, “we”, “us”) is a Saudi platform that helps customers order from nearby stores and collect their orders curbside. This policy explains how we handle personal data when you use <bdi>morapp.tech</bdi>, MOR applications, and related customer, merchant and support services.</p><p>MOR is the controller that determines why and how personal data is processed, unless a specific service tells you otherwise.</p></> },
    { id: 'collection', title: 'Personal data we collect', body: <><p>Depending on the service you use, we may collect:</p><ul><li><strong>Account and contact data:</strong> name, mobile number, email address, and authentication or sign-in information.</li><li><strong>Order and pickup data:</strong> orders, selected branch, order and arrival status, pickup time, and the vehicle and plate details needed to deliver the correct order.</li><li><strong>Location data:</strong> approximate or precise location when you grant permission and it is needed to show nearby stores or enable pickup.</li><li><strong>Merchant data:</strong> business and branch names, business type, addresses, opening hours, contact details, and information submitted in registration or change requests.</li><li><strong>Support and communications:</strong> messages, attachments, conversation content, and case-handling information.</li><li><strong>Technical data:</strong> IP address, device and browser type, session identifiers, security and crash logs, and language preference.</li></ul><p>We collect data directly from you, automatically when you use the service, or from a merchant you transact with when needed to fulfil your order.</p></> },
    { id: 'purposes', title: 'How we use personal data', body: <><p>We use personal data only as reasonably necessary to:</p><ul><li>Create accounts, authenticate users and manage sessions.</li><li>Process orders, connect customers with branches, manage “I’m on my way” and “I’ve arrived” states, and enable curbside handoff.</li><li>Review merchant applications, process branch updates and operate MOR Business.</li><li>Provide support, answer enquiries and resolve complaints.</li><li>Secure the service, prevent abuse and fraud, and investigate incidents.</li><li>Improve reliability and user experience and produce non-identifying aggregate insights.</li><li>Meet legal obligations, enforce terms and protect rights.</li><li>Send necessary service messages, or marketing only where permitted and after obtaining any required consent.</li></ul></> },
    { id: 'basis', title: 'Legal grounds for processing', body: <p>We process personal data with your consent where consent is required; to provide a service or fulfil a request you make; to meet a legal obligation; or for a legitimate interest permitted by law, such as protecting MOR, preventing fraud and improving reliability, while respecting your rights and interests. You may withdraw consent at any time for processing based on consent, without affecting processing that was lawful before withdrawal.</p> },
    { id: 'sharing', title: 'When we share personal data', body: <><p>We do not sell personal data. We may share only what is necessary with:</p><ul><li>The merchant or branch you choose so it can prepare and hand over your order.</li><li>Service providers acting for us, such as hosting, database, message verification, email, support and analytics providers, subject to appropriate confidentiality and security commitments.</li><li>Government, regulatory or judicial authorities where required by law or necessary to protect rights or safety.</li><li>A party to a proposed reorganisation or acquisition, while continuing to protect personal data as required by law.</li></ul></> },
    { id: 'transfer', title: 'International data transfers', body: <p>Some service providers may operate infrastructure outside Saudi Arabia. Where operating MOR requires a transfer of personal data outside the Kingdom, we will follow the Saudi Personal Data Protection Law and its Regulations, use appropriate legal safeguards, and transfer only what is necessary.</p> },
    { id: 'retention', title: 'How long we keep data', body: <p>We keep personal data only for as long as needed for the purposes in this policy, to fulfil orders and support requests, meet accounting or legal requirements, resolve disputes, and protect the service. When it is no longer needed, we securely delete or destroy it, or convert it into data that can no longer be linked to you, unless the law requires longer retention.</p> },
    { id: 'security', title: 'How we protect personal data', body: <p>We use reasonable technical and organisational safeguards, including role-based access, access restrictions, protected communications, monitoring, backups and service-provider reviews. No electronic transmission or storage method is completely secure, but we continuously work to reduce risk and respond to incidents in accordance with applicable requirements.</p> },
    { id: 'rights', title: 'Your privacy rights', body: <><p>Under the Saudi Personal Data Protection Law and related regulations, you may have the right to:</p><ul><li>Be informed why your data is collected and how it is processed.</li><li>Access your personal data and request a clear copy.</li><li>Correct, complete or update inaccurate data.</li><li>Request destruction of data that is no longer needed, subject to legal exceptions.</li><li>Withdraw consent where processing relies on it.</li><li>Complain to the competent authority if your concern is not appropriately resolved.</li></ul><p>To make a request, email us from the address associated with your account and describe the request. We may need to verify your identity, and legal limitations or exceptions may apply.</p></> },
    { id: 'cookies', title: 'Cookies and local storage', body: <p>The website uses technologies necessary to operate and remember your choices, such as storing your language preference locally. If we later use non-essential analytics or cookies, we will provide the required information and consent choices before activating them where the law requires.</p> },
    { id: 'children', title: 'Children’s privacy', body: <p>MOR services are not intended for independent use by anyone under 18. If we learn that we collected a child’s data without a lawful basis or a guardian’s consent where required, we will take appropriate steps to delete it.</p> },
    { id: 'updates', title: 'Changes to this policy', body: <p>We may update this policy as our services develop or legal requirements change. We will publish the updated version here and revise the “Last updated” date. Where required, we will provide additional notice of material changes.</p> },
    { id: 'contact', title: 'Contact and privacy requests', body: <><p>For questions about this policy or to exercise your rights, contact the MOR privacy team:</p><p className="policy-contact"><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><span><bdi>https://morapp.tech/contact</bdi></span><span>Kingdom of Saudi Arabia</span></p><p>We will acknowledge and handle requests within the periods and requirements prescribed by applicable law.</p></> },
  ];
  return <main id="main" className="inner-page legal-page"><section className="inner-hero legal-hero"><span className="eyebrow light"><BadgeCheck/>{ar ? 'خصوصيتك جزء من الثقة' : 'PRIVACY BUILT ON TRUST'}</span><h1>{ar ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1><p>{ar ? 'نشرح هنا بوضوح ما نجمعه، ولماذا نحتاجه، وكيف نحميه، والخيارات المتاحة لك.' : 'A clear explanation of what we collect, why we need it, how we protect it, and the choices available to you.'}</p><div className="policy-meta"><span>{ar ? 'تاريخ السريان' : 'Effective date'}<b>{ar ? '9 أكتوبر 2026' : '9 October 2026'}</b></span><span>{ar ? 'آخر تحديث' : 'Last updated'}<b>{ar ? '9 أكتوبر 2026' : '9 October 2026'}</b></span></div></section><div className="policy-layout"><aside className="policy-nav" aria-label={ar ? 'محتويات السياسة' : 'Policy contents'}><strong>{ar ? 'المحتويات' : 'Contents'}</strong>{sections.map((section, i) => <a key={section.id} href={`#${section.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{section.title}</a>)}</aside><article className="legal-content policy-content"><div className="policy-summary"><BadgeCheck/><div><strong>{ar ? 'التزام مر' : 'MOR’s commitment'}</strong><p>{ar ? 'لا نبيع بياناتك الشخصية، ولا نجمع موقعك الدقيق إلا بإذن وعندما تحتاجه الخدمة.' : 'We do not sell personal data, and we collect precise location only with permission and when the service needs it.'}</p></div></div>{sections.map((section, i) => <section id={section.id} key={section.id}><span>{String(i + 1).padStart(2, '0')}</span><h2>{section.title}</h2><div className="policy-body">{section.body}</div></section>)}</article></div></main>;
}

function TermsPage({ language }: { language: Language }) {
  const ar = language === 'ar';
  const headings = ar ? ['استخدام الموقع', 'توفر الخدمة', 'محتوى الموقع', 'حدود المسؤولية', 'التغييرات', 'التواصل'] : ['Website use', 'Service availability', 'Website content', 'Liability limits', 'Changes', 'Contact'];
  return <main id="main" className="inner-page legal-page"><section className="inner-hero compact"><span className="eyebrow light"><BadgeCheck/>{ar ? 'شروط الاستخدام' : 'TERMS OF USE'}</span><h1>{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</h1><p>{ar ? 'القواعد الأساسية لاستخدام موقع وخدمات مر.' : 'The basic rules governing use of the MOR website and services.'}</p></section><article className="legal-content"><div className="legal-note">{ar ? 'هذه الصفحة قيد الاستكمال والمراجعة القانونية. سياسة الخصوصية منشورة بصورة مستقلة.' : 'This page is being finalised and legally reviewed. The Privacy Policy is published separately.'}</div>{headings.map((heading, i) => <section key={heading}><span>{String(i + 1).padStart(2, '0')}</span><h2>{heading}</h2><p>{ar ? `سيتم استكمال تفاصيل ${heading} في النسخة النهائية. للاستفسار: ${SUPPORT_EMAIL}.` : `Details for ${heading.toLowerCase()} will be completed in the final version. Questions: ${SUPPORT_EMAIL}.`}</p></section>)}</article></main>;
}

function LegalPage({ language, kind }: { language: Language; kind: 'privacy' | 'terms' }) { return kind === 'privacy' ? <PrivacyPolicy language={language}/> : <TermsPage language={language}/>; }
function NotFound({ language, go }: { language: Language; go: Navigate }) { const ar = language === 'ar'; return <main id="main" className="not-found"><span>404</span><h1>{ar ? 'الصفحة غير موجودة' : 'Page not found'}</h1><a className="button primary" href="/" onClick={e => { e.preventDefault(); go('/'); }}>{ar ? 'العودة للرئيسية' : 'Back home'}</a></main>; }
export { HeroRoad, How, CustomerExperience, MerchantExperience };
export default App;
