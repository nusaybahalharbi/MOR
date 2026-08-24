import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Car, Check, ChevronDown,
  Clock3, Coffee, Mail, MapPin, Menu, PackageCheck, Search, ShoppingBag,
  Sparkles, Store, Utensils, X, Zap
} from 'lucide-react';
import morMark from './assets/brand/mor-mark.jpg';

type Language = 'ar' | 'en';
type Navigate = (href: string) => void;

const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@morapp.tech';
const MERCHANT_EMAIL = import.meta.env.VITE_MERCHANT_EMAIL || 'support@morapp.tech';

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
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>{links.map(([href, label]) => <a key={href} href={href} onClick={e => { e.preventDefault(); go(href); }}>{label}</a>)}<button className="language mobile-only" onClick={() => setLanguage(ar ? 'en' : 'ar')}>{ar ? 'EN' : 'AR'}</button><a className="button primary mobile-only" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a></nav>
      <div className="header-actions"><button className="language" onClick={() => setLanguage(ar ? 'en' : 'ar')} aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}>{ar ? 'EN' : 'AR'}</button><a className="button primary desktop-cta" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div></header>{children}<Footer language={language} go={go} /></div>;
}

function Home({ language, go }: { language: Language; go: Navigate }) { const c = copy[language], ar = language === 'ar'; return <main id="main">
  <section className="hero" id="top"><div className="hero-grid"><div className="hero-copy reveal"><span className="eyebrow light"><Sparkles />{c.heroTag}</span><h1>{c.heroTitle}</h1><p>{c.heroBody}</p><div className="actions"><a className="button bright" href="#how" onClick={e => { e.preventDefault(); go('/#how'); }}>{c.discover}{ar ? <ArrowLeft /> : <ArrowRight />}</a><a className="button glass" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}</a></div><div className="hero-trust"><span><Check />{ar ? 'من المتجر للسيارة' : 'Store to car'}</span><span><Clock3 />{ar ? 'بدون انتظار طويل' : 'Less waiting'}</span></div></div><HeroRoad language={language} /></div><div className="hero-grid-lines" /></section>
  <section className="section intro reveal" id="about"><div className="intro-number">01</div><div><span className="section-label">MOR / مر</span><h2>{ar ? 'مر يربط طلبك بطريقك.' : 'MOR connects your order to your route.'}</h2></div><p>{ar ? 'مو تطبيق توصيل. أنت تمر على متجرك القريب، وهم يجهزون طلبك ويسلمونه لك عند السيارة.' : 'Not a delivery app. You pass by a nearby store, and they prepare and hand over your order at your car.'}</p></section>
  <How language={language} />
  <CustomerExperience language={language} />
  <StoreTypes language={language} />
  <MerchantExperience language={language} go={go} />
  <FAQ language={language} />
  <section className="final-cta reveal"><div className="final-road" /><Brand /><h2>{c.finalTitle}</h2><p>{c.finalBody}</p><div className="actions"><a className="button bright" href="#how" onClick={e => { e.preventDefault(); go('/#how'); }}>{c.discover}</a><a className="button glass" href="/contact" onClick={e => { e.preventDefault(); go('/contact'); }}>{ar ? 'تواصل معنا' : 'Contact us'}</a></div></section>
  </main>; }

function HeroRoad({ language }: { language: Language }) { const ar = language === 'ar'; return <div className="hero-visual reveal"><div className="logo-orbit"><img src={morMark} alt={ar ? 'شعار مر' : 'MOR logo'} /></div><svg className="road-svg" viewBox="0 0 620 560" aria-hidden="true"><defs><linearGradient id="roadGlow" x1="0" x2="1"><stop stopColor="#18d7ff" /><stop offset="1" stopColor="#1658f0" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path className="road-base" d="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/><path className="road-line" d="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/><circle className="moving-light" r="7" fill="url(#roadGlow)" filter="url(#glow)"><animateMotion dur="5.5s" repeatCount="indefinite" path="M55 510 C 170 420, 155 310, 295 292 S 430 120, 585 55"/></circle></svg><div className="journey-card journey-ready"><BadgeCheck/><span><small>{ar ? 'حالة الطلب' : 'ORDER STATUS'}</small><b>{ar ? 'طلبك جاهز' : 'Order ready'}</b></span></div><div className="journey-card journey-arrived"><MapPin/><span><small>{ar ? 'عند الوصول' : 'ON ARRIVAL'}</small><b>{ar ? 'اضغط «وصلت»' : 'Tap “I’ve arrived”'}</b></span></div></div>; }

function How({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="section how-section" id="how"><Heading eyebrow={c.howEyebrow} title={c.howTitle} body={c.howBody} /><div className="road-flow reveal"><div className="flow-track"><span /></div>{flow.map(([a, e, Icon], i) => <div className="flow-stop" key={a}><div className="flow-node"><Icon /><span>{String(i + 1).padStart(2, '0')}</span></div><b>{ar ? a : e}</b></div>)}</div></section>; }

function CustomerExperience({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="customer-section" id="customers"><div className="section customer-grid"><div className="customer-copy reveal"><Heading eyebrow={c.customerEyebrow} title={c.customerTitle} body={c.customerBody} /><div className="benefit-lines"><span><Search />{ar ? 'اكتشف القريب' : 'Discover nearby'}</span><span><Zap />{ar ? 'اطلب بخطوات أقل' : 'Order in fewer steps'}</span><span><Car />{ar ? 'استلم من السيارة' : 'Pick up from your car'}</span></div></div><div className="app-concept reveal" aria-label={ar ? 'تصور توضيحي لتجربة مر' : 'Illustrative MOR experience'}><span className="concept-note">{ar ? 'تصور توضيحي للتجربة' : 'EXPERIENCE CONCEPT'}</span><div className="concept-phone"><div className="concept-head"><Brand compact/><Bell/></div><h3>{ar ? 'وين ودك تمر اليوم؟' : 'Where are you stopping today?'}</h3><div className="concept-search"><Search/>{ar ? 'ابحث عن قهوة أو مطعم' : 'Search cafés or restaurants'}</div><div className="concept-categories"><span><Coffee/>{ar ? 'قهوة' : 'Coffee'}</span><span><Utensils/>{ar ? 'مطاعم' : 'Restaurants'}</span></div><div className="concept-nearby"><div><MapPin/><span><b>{ar ? 'متجر قريب' : 'Nearby store'}</b><small>{ar ? 'الاستلام من السيارة متاح' : 'Curbside pickup available'}</small></span></div><ArrowLeft/></div><div className="concept-action">{ar ? 'أنا بالطريق' : "I'm on my way"}<Car/></div></div><div className="arrival-pulse"><span/><MapPin/></div></div></div></section>; }

function StoreTypes({ language }: { language: Language }) { const c = copy[language], ar = language === 'ar'; return <section className="section types-section reveal"><Heading eyebrow={c.typesEyebrow} title={c.typesTitle} body={c.typesBody} /><div className="type-pair"><article><span>01</span><Coffee/><h3>{ar ? 'قهوة' : 'Coffee'}</h3><p>{ar ? 'طلبك المعتاد جاهز قبل ما توصل.' : 'Your usual order, ready before you arrive.'}</p></article><article><span>02</span><Utensils/><h3>{ar ? 'مطاعم' : 'Restaurants'}</h3><p>{ar ? 'استلام مرتب، بدون انتظار طويل.' : 'A smoother pickup without the long wait.'}</p></article></div></section>; }

function MerchantExperience({ language, go }: { language: Language; go: Navigate }) { const c = copy[language], ar = language === 'ar'; const items = ar ? ['استقبل الطلب', 'جهّز الطلب', 'اعرف أن العميل بالطريق', 'استعد عند وصوله', 'سلّم الطلب للسيارة'] : ['Receive the order', 'Prepare it', 'Know when the customer departs', 'Prepare for arrival', 'Hand it over at the car']; return <section className="business-section" id="business"><div className="section business-grid"><div className="business-copy reveal"><Heading eyebrow={c.merchantEyebrow} title={c.merchantTitle} body={c.merchantBody} /><a className="button bright" href="/merchants" onClick={e => { e.preventDefault(); go('/merchants'); }}>{c.merchant}{ar ? <ArrowLeft/> : <ArrowRight/>}</a></div><div className="ops-panel reveal"><div className="ops-head"><span><Store/><b>{ar ? 'تدفق الاستلام' : 'Pickup workflow'}</b></span><i>{ar ? 'تشغيلي وواضح' : 'Clear operations'}</i></div>{items.map((item, i) => <div className="ops-row" key={item}><span>{String(i + 1).padStart(2, '0')}</span><b>{item}</b><Check/></div>)}</div></div></section>; }

function FAQ({ language }: { language: Language }) { const [open, setOpen] = useState(0), ar = language === 'ar'; return <section className="section faq-section" id="faq"><Heading eyebrow="FAQ" title={copy[language].faqTitle} body={ar ? 'إجابات مباشرة عن تجربة مر.' : 'Straight answers about the MOR experience.'} /><div className="faq-list reveal">{faqs.map(([qa, qe, aa, ae], i) => <article className={`faq-item ${open === i ? 'open' : ''}`} key={qa}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{ar ? qa : qe}</span><ChevronDown/></button><div><p>{ar ? aa : ae}</p></div></article>)}</div></section>; }
function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <div className="section-heading reveal"><span className="section-label">{eyebrow}</span><h2>{title}</h2><p>{body}</p></div>; }

function MerchantPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main id="main" className="inner-page"><section className="inner-hero"><span className="eyebrow light"><Store/>{ar ? 'مر للأعمال' : 'MOR for business'}</span><h1>{ar ? 'خل متجرك أقرب لعملائك' : 'Bring your store closer to customers'}</h1><p>{ar ? 'شاركنا بيانات متجرك، وفريق مر بيتواصل معك لمناقشة تجربة الاستلام.' : 'Share your store details and the MOR team will contact you about curbside pickup.'}</p></section><section className="section form-layout"><div><Heading eyebrow={ar ? 'ابدأ من هنا' : 'Start here'} title={ar ? 'عرّفنا على متجرك' : 'Tell us about your store'} body={ar ? 'التسجيل يعبر عن الاهتمام ولا ينشئ حسابًا تلقائيًا.' : 'Registration expresses interest and does not automatically create an account.'}/><div className="form-points"><span><Check/>{ar ? 'لا توجد رسوم أو التزامات في هذه الخطوة' : 'No fees or commitment at this stage'}</span><span><Check/>{ar ? 'يراجع الفريق الطلب ويتواصل معك' : 'Our team reviews and follows up'}</span></div></div><EmailForm language={language} type="merchant"/></section></main>; }
function ContactPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main id="main" className="inner-page"><section className="inner-hero compact"><span className="eyebrow light"><Mail/>{ar ? 'تواصل معنا' : 'Contact MOR'}</span><h1>{ar ? 'نسمع منك.' : 'We’re listening.'}</h1><p>{ar ? 'للدعم والاستفسارات العامة، تواصل مع فريق مر.' : 'For support and general questions, contact the MOR team.'}</p></section><section className="section form-layout contact-layout"><div className="contact-panel"><Brand/><h2>{ar ? 'دعم مر' : 'MOR support'}</h2><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><small>morapp.tech</small></div><EmailForm language={language} type="contact"/></section></main>; }

function EmailForm({ language, type }: { language: Language; type: 'merchant' | 'contact' }) { const ar = language === 'ar'; const [opened, setOpened] = useState(false); const formRef = useRef<HTMLFormElement>(null); const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const data = new FormData(e.currentTarget); const subject = type === 'merchant' ? `MOR merchant interest — ${data.get('store')}` : `MOR website inquiry — ${data.get('name')}`; const body = [...data.entries()].map(([key, value]) => `${key}: ${value}`).join('\n'); location.href = `mailto:${type === 'merchant' ? MERCHANT_EMAIL : SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; setOpened(true); }; return <form ref={formRef} className="lead-form" onSubmit={submit}><div className="form-grid">{type === 'merchant' && <><Field name="store" label={ar ? 'اسم المتجر' : 'Store name'} /><Field name="business" label={ar ? 'نوع النشاط' : 'Business type'} /></>}<Field name="name" label={ar ? 'الاسم' : 'Name'} /><Field name="phone" type="tel" label={ar ? 'رقم الجوال' : 'Phone number'} /><Field name="email" type="email" label={ar ? 'البريد الإلكتروني' : 'Email'} />{type === 'merchant' && <Field name="city" label={ar ? 'المدينة' : 'City'} />}</div>{type === 'contact' && <label className="field full"><span>{ar ? 'الرسالة' : 'Message'}</span><textarea name="message" rows={5} required/></label>}<button className="button primary form-submit" type="submit">{type === 'merchant' ? (ar ? 'إرسال عبر البريد' : 'Send by email') : (ar ? 'جهّز الرسالة' : 'Prepare email')}<ArrowLeft/></button><small className="form-disclosure">{ar ? 'سيفتح تطبيق البريد برسالة جاهزة. لن يتم الإرسال حتى تضغط «إرسال» هناك.' : 'Your email app will open with a prepared message. Nothing is sent until you press Send.'}</small>{opened && <p className="form-status" role="status">{ar ? 'تم تجهيز الرسالة في تطبيق البريد.' : 'The message is ready in your email app.'}</p>}</form>; }
function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) { return <label className="field"><span>{label}</span><input name={name} type={type} required autoComplete={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'on'}/></label>; }

function LegalPage({ language, kind }: { language: Language; kind: 'privacy' | 'terms' }) { const ar = language === 'ar', privacy = kind === 'privacy'; const headings = privacy ? (ar ? ['المعلومات التي تقدمها', 'استخدام المعلومات', 'مشاركة البيانات', 'حماية البيانات', 'حقوقك', 'التواصل'] : ['Information you provide', 'How information is used', 'Data sharing', 'Data protection', 'Your rights', 'Contact']) : (ar ? ['استخدام الموقع', 'توفر الخدمة', 'محتوى الموقع', 'حدود المسؤولية', 'التغييرات', 'التواصل'] : ['Website use', 'Service availability', 'Website content', 'Liability limits', 'Changes', 'Contact']); return <main id="main" className="inner-page legal-page"><section className="inner-hero compact"><span className="eyebrow light"><BadgeCheck/>{ar ? 'يتطلب مراجعة قانونية' : 'Requires legal review'}</span><h1>{privacy ? (ar ? 'سياسة الخصوصية' : 'Privacy Policy') : (ar ? 'الشروط والأحكام' : 'Terms & Conditions')}</h1><p>{ar ? 'مسودة أولية تحتاج مراجعة واعتمادًا قانونيًا قبل النشر النهائي.' : 'A preliminary draft requiring legal review before final publication.'}</p></section><article className="legal-content"><div className="legal-note">{ar ? 'تنبيه: هذا النص مؤقت وليس استشارة قانونية.' : 'Notice: This is temporary copy, not legal advice.'}</div>{headings.map((heading, i) => <section key={heading}><span>{String(i + 1).padStart(2, '0')}</span><h2>{heading}</h2><p>{ar ? `سيتم استكمال تفاصيل ${heading} بعد اعتماد نموذج تشغيل الخدمة ومراجعة المختص القانوني. للتواصل: ${SUPPORT_EMAIL}.` : `Details for ${heading.toLowerCase()} will be finalized after the service model is confirmed and reviewed by legal counsel. Contact: ${SUPPORT_EMAIL}.`}</p></section>)}</article></main>; }
function NotFound({ language, go }: { language: Language; go: Navigate }) { const ar = language === 'ar'; return <main id="main" className="not-found"><span>404</span><h1>{ar ? 'الصفحة غير موجودة' : 'Page not found'}</h1><a className="button primary" href="/" onClick={e => { e.preventDefault(); go('/'); }}>{ar ? 'العودة للرئيسية' : 'Back home'}</a></main>; }
function Footer({ language, go }: { language: Language; go: Navigate }) { const ar = language === 'ar'; const links = [['/#about', ar ? 'عن مر' : 'About MOR'], ['/#how', ar ? 'كيف يعمل' : 'How it works'], ['/merchants', ar ? 'للمتاجر' : 'For merchants'], ['/contact', ar ? 'الدعم' : 'Support'], ['/privacy', ar ? 'سياسة الخصوصية' : 'Privacy'], ['/terms', ar ? 'الشروط والأحكام' : 'Terms']]; return <footer className="site-footer"><div className="footer-road"/><div className="footer-grid"><div><Brand/><p>{ar ? 'استلام أسهل من المقاهي والمطاعم القريبة.' : 'Easier pickup from nearby cafés and restaurants.'}</p><a href="https://morapp.tech">morapp.tech</a></div><nav aria-label={ar ? 'روابط التذييل' : 'Footer links'}>{links.map(([href, label]) => <a key={href} href={href} onClick={e => { e.preventDefault(); go(href); }}>{label}</a>)}</nav><div className="footer-contact"><span>{ar ? 'تواصل' : 'Contact'}</span><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></div></div><div className="footer-bottom"><span>© 2026 MOR</span><span>مر / MOR · Saudi Arabia</span></div></footer>; }

export default App;
