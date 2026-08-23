import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  BadgeCheck,
  Bell,
  Car,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coffee,
  Flower2,
  Heart,
  House,
  Instagram,
  LayoutGrid,
  Linkedin,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Pill,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import type { ContactSubmission, MerchantLead } from '@/lib/forms';

type Language = 'ar' | 'en';

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'hello@[DOMAIN]';

const content = {
  ar: {
    nav: ['كيف يعمل', 'للمحلات', 'عن مر', 'الأسئلة الشائعة'],
    heroEyebrow: 'قريبًا في المدينة المنورة',
    heroTitle: 'طلبك جاهز قبل توصل.',
    heroCopy: 'اطلب من محلاتك المفضلة، مر عليهم، وخذ طلبك من سيارتك.',
    discover: 'اكتشف مر',
    merchantCta: 'سجّل محلك',
    howTitle: 'مرها بثلاث خطوات.',
    howCopy: 'تجربة استلام أذكى، أسرع، ومن غير ما تنزل من سيارتك.',
    categoriesTitle: 'كل اللي تحبه، بطريقك.',
    categoriesCopy: 'مر مو بس للقهوة. اكتشف محلاتك القريبة واستلم طلبك بالطريقة الأسهل.',
    merchantTitle: 'محلك أقرب لعملائك مع مر.',
    merchantCopy: 'استقبل الطلب قبل وصول العميل، جهزه بوقته، وسلمه عند السيارة.',
    benefitsTitle: 'ليش مر؟',
    launchTitle: 'البداية من المدينة.',
    launchCopy: 'مر يبدأ من المدينة المنورة، وبعدها نكبر معكم.',
    faqTitle: 'الأسئلة الشائعة',
    waitTitle: 'كن من أول مستخدمين مر.',
    waitCopy: 'سجّل اهتمامك وخلك أول من يعرف وقت الإطلاق.',
    brandMoment: 'مر علينا، وخذ طلبك.',
    finalTitle: 'جاهز تمر؟',
  },
  en: {
    nav: ['How it works', 'For merchants', 'About MOR', 'FAQ'],
    heroEyebrow: 'Coming soon to Madinah',
    heroTitle: 'Your order is ready before you arrive.',
    heroCopy: 'Order from your favorite local spots, drive over, and pick it up from your car.',
    discover: 'Discover MOR',
    merchantCta: 'Register your store',
    howTitle: 'Pass by in three steps.',
    howCopy: 'A smarter, faster pickup experience without leaving your car.',
    categoriesTitle: 'Everything you love, on your way.',
    categoriesCopy: 'MOR is more than coffee. Discover nearby businesses and pick up your order with ease.',
    merchantTitle: 'Bring your store closer to your customers.',
    merchantCopy: 'Receive orders ahead of arrival, prepare them on time, and hand them over at the car.',
    benefitsTitle: 'Why MOR?',
    launchTitle: 'Starting in Madinah.',
    launchCopy: 'MOR starts in Madinah, then grows with you.',
    faqTitle: 'Frequently asked questions',
    waitTitle: 'Be one of MOR’s first users.',
    waitCopy: 'Join the list and be the first to know when we launch.',
    brandMoment: 'Pass by. Get your order.',
    finalTitle: 'Ready to pass by?',
  },
} as const;

const steps = [
  { number: '01', ar: 'اطلب', en: 'Order', copyAr: 'اختر المحل واطلب اللي تبيه قبل توصل.', copyEn: 'Choose a store and order before you arrive.', icon: Search },
  { number: '02', ar: 'مر علينا', en: 'Pass by', copyAr: 'إذا صار طلبك جاهز، تحرك للمحل واضغط «أنا بالطريق».', copyEn: 'When your order is ready, head over and tap “I’m on my way”.', icon: Car },
  { number: '03', ar: 'خذ طلبك', en: 'Pick it up', copyAr: 'إذا وصلت، اضغط «وصلت» وطلبك يجيك للسيارة.', copyEn: 'Tap “I’ve arrived” and your order comes to your car.', icon: PackageCheck },
];

const categories = [
  { ar: 'قهوة', en: 'Coffee', icon: Coffee },
  { ar: 'مطاعم', en: 'Restaurants', icon: Utensils },
  { ar: 'مخابز', en: 'Bakeries', icon: ShoppingBag },
  { ar: 'ورد', en: 'Flowers', icon: Flower2 },
  { ar: 'صيدليات', en: 'Pharmacies', icon: Pill },
  { ar: 'تسوق', en: 'Retail', icon: Store },
];

const benefits = [
  { ar: 'ما تحتاج تنزل', en: 'Stay in your car', icon: Car },
  { ar: 'طلبك جاهز قبل توصل', en: 'Ready before you arrive', icon: Clock3 },
  { ar: 'استلام أسرع', en: 'Faster pickup', icon: Zap },
  { ar: 'محلاتك حولك', en: 'Local spots nearby', icon: MapPin },
];

const faqItems = [
  { qAr: 'وش هو مر؟', qEn: 'What is MOR?', aAr: 'مر منصة استلام من السيارة. تطلب من محل قريب قبل وصولك، ولما تكون جاهز يجيبون طلبك لسيارتك.', aEn: 'MOR is a curbside pickup platform. Order from a nearby store before you arrive, then receive it at your car.' },
  { qAr: 'هل مر تطبيق توصيل؟', qEn: 'Is MOR a delivery app?', aAr: 'لا. أنت اللي تروح للمحل، لكن ما تحتاج تنزل من السيارة. المحل يجهز طلبك ويسلمه لك عند السيارة.', aEn: 'No. You drive to the store, but you do not need to leave your car. The store brings your order to you.' },
  { qAr: 'كيف أستلم طلبي؟', qEn: 'How do I pick up my order?', aAr: 'اطلب، انتظر إشعار الجاهزية، اضغط «أنا بالطريق»، ثم «وصلت» عند وصولك.', aEn: 'Order, wait for the ready notification, tap “I’m on my way”, then tap “I’ve arrived” when you reach the store.' },
  { qAr: 'وش يصير لما أضغط «وصلت»؟', qEn: 'What happens when I tap “I’ve arrived”?', aAr: 'يوصل إشعار للمحل إنك وصلت، ويطلعون طلبك لسيارتك.', aEn: 'The store is notified that you have arrived and brings your order to your car.' },
  { qAr: 'هل أقدر أضيف أكثر من سيارة؟', qEn: 'Can I add more than one car?', aAr: 'نعم، تقدر تحفظ سياراتك وتختار السيارة المناسبة لكل طلب.', aEn: 'Yes. You can save your cars and choose the right one for each order.' },
  { qAr: 'هل مر متوفر في كل المدن؟', qEn: 'Is MOR available in every city?', aAr: 'نبدأ من المدينة المنورة، ونخطط للتوسع معكم إلى مدن أكثر.', aEn: 'We are starting in Madinah and plan to grow into more cities with you.' },
  { qAr: 'كيف أسجل محلي في مر؟', qEn: 'How do I register my store with MOR?', aAr: 'عبّ النموذج في صفحة المحلات، وفريقنا بيتواصل معك.', aEn: 'Fill out the merchant form and our team will get in touch.' },
];

function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [menuOpen, setMenuOpen] = useState(false);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const path = window.location.pathname;
  const isHome = path === '/' || path === '';
  const copy = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.title = language === 'ar' ? 'مر | اطلب قبل توصل وخذ طلبك من سيارتك' : 'MOR | Order Ahead. Pick Up From Your Car.';
  }, [direction, language]);

  const navigate = (href: string) => {
    window.history.pushState({}, '', href);
    setMenuOpen(false);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isHome) {
    return <PageShell language={language} setLanguage={setLanguage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate}><StaticPage path={path} language={language} navigate={navigate} /></PageShell>;
  }

  return <PageShell language={language} setLanguage={setLanguage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate}>
    <main>
      <Hero language={language} navigate={navigate} />
      <HowItWorks language={language} />
      <ArrivalExperience language={language} />
      <AppPreview language={language} />
      <Categories language={language} />
      <MerchantSection language={language} navigate={navigate} />
      <LaunchSection language={language} />
      <Benefits language={language} />
      <BrandMoment language={language} />
      <FAQ language={language} />
      <Waitlist language={language} />
      <FinalCTA language={language} navigate={navigate} />
    </main>
  </PageShell>;
}

function PageShell({ children, language, setLanguage, menuOpen, setMenuOpen, navigate }: { children: ReactNode; language: Language; setLanguage: (language: Language) => void; menuOpen: boolean; setMenuOpen: (open: boolean) => void; navigate: (href: string) => void }) {
  const copy = content[language];
  return <div className="site-shell">
    <header className="site-header">
      <a className="logo" href="/" onClick={(event) => { event.preventDefault(); navigate('/'); }} aria-label="MOR">
        <span>MOR</span><b lang="ar">مر</b>
      </a>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
        <a href="#how" onClick={(event) => { event.preventDefault(); navigate('/#how'); }}>{copy.nav[0]}</a>
        <a href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{copy.nav[1]}</a>
        <a href="#about" onClick={(event) => { event.preventDefault(); navigate('/#about'); }}>{copy.nav[2]}</a>
        <a href="#faq" onClick={(event) => { event.preventDefault(); navigate('/#faq'); }}>{copy.nav[3]}</a>
        <button className="language-toggle" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} aria-label="Switch language">{language === 'ar' ? 'EN' : 'عربي'}</button>
        <a className="button button-small button-blue nav-cta" href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{language === 'ar' ? 'انضم إلى مر' : 'Join MOR'}</a>
      </nav>
      <div className="header-actions"><button className="language-toggle desktop-language" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>{language === 'ar' ? 'EN' : 'عربي'}</button><a className="button button-small button-blue desktop-cta" href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{language === 'ar' ? 'انضم إلى مر' : 'Join MOR'}</a><button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
    </header>
    {children}
    <Footer language={language} navigate={navigate} />
  </div>;
}

function Hero({ language, navigate }: { language: Language; navigate: (href: string) => void }) {
  const copy = content[language];
  return <section className="hero section-pad">
    <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" />{copy.heroEyebrow}</div><h1>{copy.heroTitle}</h1><p>{copy.heroCopy}</p><div className="hero-actions"><a className="button button-blue" href="#how" onClick={(event) => { event.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}>{copy.discover}<ArrowLeft size={18} /></a><a className="button button-outline" href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{copy.merchantCta}</a></div><div className="hero-proof"><BadgeCheck size={18} /><span>{language === 'ar' ? 'تجربة استلام مصممة حول وقتك' : 'Pickup designed around your time'}</span></div></div>
    <div className="hero-visual"><div className="route-dash route-one" /><div className="route-dash route-two" /><div className="map-pin pin-one"><MapPin size={16} /></div><div className="map-pin pin-two"><MapPin size={16} /></div><div className="phone phone-hero"><PhoneScreen language={language} /></div><div className="floating-card ready-card"><span className="status-icon"><Check size={15} /></span><span><small>{language === 'ar' ? 'حالة الطلب' : 'Order status'}</small><strong>{language === 'ar' ? 'طلبك جاهز' : 'Your order is ready'}</strong></span></div><div className="floating-card arrival-card"><Car size={18} /><span>{language === 'ar' ? 'خذ طلبك من سيارتك' : 'Pick up from your car'}</span></div></div>
  </section>;
}

function PhoneScreen({ language, compact = false }: { language: Language; compact?: boolean }) {
  const ar = language === 'ar';
  return <div className={`phone-screen ${compact ? 'phone-screen-compact' : ''}`} dir="rtl"><div className="phone-top"><span className="tiny-logo">MOR <b>مر</b></span><Bell size={14} /></div><div className="greeting">{ar ? 'هلا بك' : 'Welcome'}<strong>{ar ? 'وين ودك تمر اليوم؟' : 'Where are you headed?'}</strong></div><div className="search-pill"><Search size={13} />{ar ? 'ابحث عن محل قريب' : 'Search nearby stores'}</div><div className="screen-label">{ar ? 'قريب منك' : 'Near you'}</div><div className="store-banner"><div className="store-image" /><div className="store-info"><strong>{ar ? 'قهوة ريما' : 'Reema Café'}</strong><small>{ar ? 'مختص بالقهوة' : 'Specialty coffee'}</small><span><span className="rating-dot" /> 4.8 · 15 - 20 د</span></div></div><div className="screen-label screen-label-row"><span>{ar ? 'الأكثر طلبًا' : 'Most ordered'}</span><ArrowLeft size={12} /></div><div className="product-row"><div className="product-art coffee-art" /><div><strong>{ar ? 'لاتيه' : 'Latte'}</strong><small>{ar ? '18 رس' : 'SAR 18'}</small></div><button><Plus size={13} /></button></div><div className="product-row"><div className="product-art pastry-art" /><div><strong>{ar ? 'كرواسون زبدة' : 'Butter croissant'}</strong><small>{ar ? '7 رس' : 'SAR 7'}</small></div><button><Plus size={13} /></button></div><div className="phone-tabbar"><House size={15} /><Search size={15} /><ShoppingBag size={15} /><Heart size={15} /><span className="tab-active"><LayoutGrid size={15} /></span></div></div>;
}

function HowItWorks({ language }: { language: Language }) { const copy = content[language]; return <section className="section-pad how-section" id="how"><div className="section-heading centered"><span className="section-kicker">01 / {language === 'ar' ? 'البداية' : 'The start'}</span><h2>{copy.howTitle}</h2><p>{copy.howCopy}</p></div><div className="steps-grid">{steps.map((step, index) => { const Icon = step.icon; return <div className="step-card" key={step.number}><div className="step-top"><span>{step.number}</span><Icon size={23} strokeWidth={1.7} /></div><h3>{language === 'ar' ? step.ar : step.en}</h3><p>{language === 'ar' ? step.copyAr : step.copyEn}</p>{index < 2 && <div className="step-connector"><ArrowLeft size={16} /></div>}</div>; })}</div></section>; }

function ArrivalExperience({ language }: { language: Language }) { const ar = language === 'ar'; return <section className="arrival-section section-pad" id="about"><div className="arrival-copy"><span className="section-kicker light-kicker">02 / {ar ? 'تجربة الوصول' : 'Arrival experience'}</span><h2>{ar ? <>وصلت؟<br /><em>خلك مكانك.</em></> : <>Arrived?<br /><em>Stay right there.</em></>}</h2><p>{ar ? 'علّم المحل إنك وصلت، وهم يجيبون طلبك لسيارتك.' : 'Let the store know you are here and they will bring your order to your car.'}</p><div className="route-trace"><div className="trace-line"><span /></div><div className="trace-step"><strong>{ar ? 'طلبك جاهز' : 'Order ready'}</strong><small>{ar ? 'جاهز للاستلام' : 'Ready for pickup'}</small></div><div className="trace-step"><strong>{ar ? 'أنا بالطريق' : 'I’m on my way'}</strong><small>{ar ? 'المحل يعرف أنك قادم' : 'The store knows you are coming'}</small></div><div className="trace-step active"><strong>{ar ? 'وصلت' : 'I’ve arrived'}</strong><small>{ar ? 'طلبك جايك للسيارة' : 'Your order is coming to your car'}</small></div></div></div><div className="arrival-visual"><div className="arrival-orbit orbit-a" /><div className="arrival-orbit orbit-b" /><div className="arrival-center"><span className="arrival-number">03</span><Car size={48} strokeWidth={1.2} /><strong>{ar ? 'عرفنا إنك وصلت' : 'We know you arrived'}</strong><button className="arrival-button"><MapPin size={18} />{ar ? 'وصلت' : 'I’ve arrived'}</button></div><div className="arrival-dot dot-a" /><div className="arrival-dot dot-b" /></div></section>; }

function AppPreview({ language }: { language: Language }) { const ar = language === 'ar'; return <section className="section-pad preview-section"><div className="section-heading"><span className="section-kicker">03 / {ar ? 'التطبيق' : 'The app'}</span><h2>{ar ? 'كل شيء بسيط.' : 'Everything, simple.'}</h2><p>{ar ? 'من أول طلبك إلى لحظة استلامه، كل خطوة واضحة.' : 'From your first order to pickup, every step is clear.'}</p></div><div className="phone-row"><div className="phone phone-small"><PhoneScreen language={language} compact /></div><div className="phone phone-small phone-offset"><OrderPhone language={language} /></div><div className="phone phone-small phone-hidden-mobile"><TrackingPhone language={language} /></div></div></section>; }

function OrderPhone({ language }: { language: Language }) { const ar = language === 'ar'; return <div className="phone-screen order-screen" dir="rtl"><div className="screen-nav"><ArrowRight size={15} /><strong>{ar ? 'تأكيد الطلب' : 'Confirm order'}</strong><span /></div><div className="confirm-check"><Check size={28} /></div><h3>{ar ? 'تم تأكيد طلبك' : 'Order confirmed'}</h3><p>{ar ? 'طلبك عند قهوة ريما' : 'Your order at Reema Café'}</p><div className="detail-box"><Clock3 size={16} /><span><small>{ar ? 'وقت الجاهزية' : 'Ready in'}</small><strong>10 - 15 {ar ? 'دقيقة' : 'min'}</strong></span></div><div className="detail-box"><Car size={16} /><span><small>{ar ? 'سيارتك' : 'Your car'}</small><strong>{ar ? 'تويوتا كامري' : 'Toyota Camry'}</strong></span></div><button className="screen-button">{ar ? 'عرض الطلب' : 'View order'}</button></div>; }
function TrackingPhone({ language }: { language: Language }) { const ar = language === 'ar'; return <div className="phone-screen order-screen" dir="rtl"><div className="screen-nav"><ArrowRight size={15} /><strong>{ar ? 'تتبع الطلب' : 'Track order'}</strong><span /></div><div className="track-head"><small>#1024</small><strong>{ar ? 'قهوة ريما' : 'Reema Café'}</strong></div><div className="timeline"><div className="time-line" /><div className="time-item done"><i /><span>{ar ? 'تم تأكيد الطلب' : 'Order confirmed'}</span></div><div className="time-item done"><i /><span>{ar ? 'يُجهز' : 'Preparing'}</span></div><div className="time-item current"><i /><span>{ar ? 'جاهز' : 'Ready'}</span></div><div className="time-item"><i /><span>{ar ? 'أنا بالطريق' : 'On the way'}</span></div><div className="time-item"><i /><span>{ar ? 'وصلت' : 'Arrived'}</span></div></div><button className="screen-button">{ar ? 'أنا بالطريق' : 'I’m on my way'}</button></div>; }

function Categories({ language }: { language: Language }) { const copy = content[language]; return <section className="section-pad categories-section"><div className="section-heading centered"><span className="section-kicker">04 / {language === 'ar' ? 'اكتشف' : 'Discover'}</span><h2>{copy.categoriesTitle}</h2><p>{copy.categoriesCopy}</p></div><div className="category-grid">{categories.map(({ ar, en, icon: Icon }) => <div className="category-card" key={ar}><span className="category-icon"><Icon size={23} strokeWidth={1.7} /></span><strong>{language === 'ar' ? ar : en}</strong><ArrowUpLeft size={15} /></div>)}</div></section>; }

function MerchantSection({ language, navigate }: { language: Language; navigate: (href: string) => void }) { const copy = content[language]; return <section className="merchant-section section-pad"><div className="merchant-intro"><span className="section-kicker">05 / {language === 'ar' ? 'للمحلات' : 'For merchants'}</span><h2>{copy.merchantTitle}</h2><p>{copy.merchantCopy}</p><div className="merchant-stats"><span><strong>+24%</strong><small>{language === 'ar' ? 'فرصة طلبات' : 'order opportunity'}</small></span><span><strong>−15'</strong><small>{language === 'ar' ? 'وقت انتظار' : 'waiting time'}</small></span></div><a className="button button-blue" href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{copy.merchantCta}<ArrowLeft size={18} /></a></div><div className="merchant-card"><div className="merchant-card-head"><span className="store-avatar"><Store size={19} /></span><span><strong>{language === 'ar' ? 'لوحة محلك' : 'Your store dashboard'}</strong><small>{language === 'ar' ? 'قهوة ريما' : 'Reema Café'}</small></span><span className="live-pill"><i /> Live</span></div><div className="merchant-order"><div className="merchant-order-top"><span>#1024</span><span className="ready-pill">{language === 'ar' ? 'جاهز' : 'Ready'}</span></div><strong>{language === 'ar' ? 'لاتيه + كرواسون زبدة' : 'Latte + Butter croissant'}</strong><div className="merchant-order-bottom"><span><Clock3 size={14} /> 10:42</span><span>{language === 'ar' ? 'استلام من السيارة' : 'Curbside pickup'}</span></div></div><div className="merchant-order faded"><div className="merchant-order-top"><span>#1023</span><span className="preparing-pill">{language === 'ar' ? 'يُجهز' : 'Preparing'}</span></div><strong>{language === 'ar' ? 'كابتشينو' : 'Cappuccino'}</strong><div className="merchant-order-bottom"><span><Clock3 size={14} /> 10:38</span><span>{language === 'ar' ? 'في التحضير' : 'Preparing now'}</span></div></div></div></section>; }

function LaunchSection({ language }: { language: Language }) { const copy = content[language]; return <section className="launch-section section-pad"><div className="launch-map"><div className="map-grid" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="launch-marker"><MapPin size={19} /><span /></div><div className="map-label">Madinah</div></div><div className="launch-copy"><span className="section-kicker">06 / {language === 'ar' ? 'الانطلاقة' : 'The launch'}</span><h2>{copy.launchTitle}</h2><p>{copy.launchCopy}</p><div className="launch-note"><span><Sparkles size={16} /></span>{language === 'ar' ? 'نبدأ من حيّك، ونكبر معك.' : 'Starting in your neighborhood, growing with you.'}</div></div></section>; }

function Benefits({ language }: { language: Language }) { const copy = content[language]; return <section className="section-pad benefits-section"><div className="section-heading centered"><span className="section-kicker">07 / {language === 'ar' ? 'ببساطة' : 'Simply'}</span><h2>{copy.benefitsTitle}</h2></div><div className="benefits-grid">{benefits.map(({ ar, en, icon: Icon }) => <div className="benefit-card" key={ar}><Icon size={25} strokeWidth={1.6} /><strong>{language === 'ar' ? ar : en}</strong></div>)}</div></section>; }

function BrandMoment({ language }: { language: Language }) { const copy = content[language]; return <section className="brand-moment"><div className="brand-route"><span /><span /><span /><span /><span /></div><span className="section-kicker">MOR / 2026</span><h2>{copy.brandMoment}</h2><p>{language === 'ar' ? 'وقت أقل في الانتظار. وقت أكثر لك.' : 'Less time waiting. More time for you.'}</p></section>; }

function FAQ({ language }: { language: Language }) { const [open, setOpen] = useState<number | null>(0); return <section className="section-pad faq-section" id="faq"><div className="section-heading"><span className="section-kicker">08 / FAQ</span><h2>{content[language].faqTitle}</h2></div><div className="faq-list">{faqItems.map((item, index) => <div className={`faq-item ${open === index ? 'open' : ''}`} key={item.qAr}><button onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}><span>{language === 'ar' ? item.qAr : item.qEn}</span>{open === index ? <Minus size={19} /> : <Plus size={19} />}</button><div className="faq-answer"><p>{language === 'ar' ? item.aAr : item.aEn}</p></div></div>)}</div></section>; }

function Waitlist({ language }: { language: Language }) { const [value, setValue] = useState(''); const [sent, setSent] = useState(false); const ar = language === 'ar'; const submit = (event: FormEvent) => { event.preventDefault(); if (value.trim()) setSent(true); }; return <section className="waitlist-section section-pad"><div><span className="section-kicker light-kicker">09 / {ar ? 'قبل الانطلاقة' : 'Before launch'}</span><h2>{content[language].waitTitle}</h2><p>{content[language].waitCopy}</p></div>{sent ? <div className="success-message"><Check size={18} />{ar ? 'تم تسجيل اهتمامك. شكرًا لك.' : 'You’re on the list. Thank you.'}</div> : <form className="waitlist-form" onSubmit={submit}><label className="sr-only" htmlFor="waitlist">{ar ? 'رقم الجوال أو البريد الإلكتروني' : 'Phone or email'}</label><input id="waitlist" value={value} onChange={(event) => setValue(event.target.value)} placeholder={ar ? 'رقم الجوال أو البريد الإلكتروني' : 'Phone or email'} required /><button className="button button-white" type="submit">{ar ? 'سجّلني' : 'Join the list'}<ArrowLeft size={17} /></button></form>}</section>; }

function FinalCTA({ language, navigate }: { language: Language; navigate: (href: string) => void }) { const copy = content[language]; return <section className="final-cta section-pad"><div className="section-kicker">MOR / {language === 'ar' ? 'قريبًا' : 'Coming soon'}</div><h2>{copy.finalTitle}</h2><p>{language === 'ar' ? 'قريبًا في المدينة المنورة.' : 'Coming soon to Madinah.'}</p><div className="final-actions"><a className="button button-blue" href="#waitlist" onClick={(event) => { event.preventDefault(); document.getElementById('waitlist')?.focus(); }}>{copy.discover}</a><a className="button button-outline" href="/merchants" onClick={(event) => { event.preventDefault(); navigate('/merchants'); }}>{copy.merchantCta}</a></div></section>; }

function StaticPage({ path, language, navigate }: { path: string; language: Language; navigate: (href: string) => void }) { if (path === '/merchants') return <MerchantPage language={language} />; if (path === '/contact') return <ContactPage language={language} />; if (path === '/privacy') return <LegalPage language={language} type="privacy" />; if (path === '/terms') return <LegalPage language={language} type="terms" />; return <div className="not-found section-pad"><CircleHelp size={42} /><h1>{language === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}</h1><a className="button button-blue" href="/" onClick={(event) => { event.preventDefault(); navigate('/'); }}>{language === 'ar' ? 'العودة للرئيسية' : 'Back home'}</a></div>; }

function MerchantPage({ language }: { language: Language }) { const ar = language === 'ar'; return <main className="inner-page"><section className="inner-hero section-pad"><span className="eyebrow"><Store size={15} />{ar ? 'بوابة المحلات' : 'For merchants'}</span><h1>{ar ? 'خلّ استلام الطلب أسهل.' : 'Make pickup effortless.'}</h1><p>{ar ? 'مر يساعدك تستقبل الطلب قبل وصول العميل، وتقدم تجربة أسرع وأرتب عند السيارة.' : 'MOR helps you receive orders before customers arrive and deliver a faster, smoother curbside experience.'}</p></section><section className="merchant-flow section-pad"><div className="section-heading"><span className="section-kicker">01 / {ar ? 'كيف يعمل' : 'How it works'}</span><h2>{ar ? 'من الطلب إلى السيارة، كل شيء واضح.' : 'From order to car, every step is clear.'}</h2></div><div className="flow-grid">{[ar ? 'العميل يطلب' : 'Customer orders', ar ? 'تقبل الطلب' : 'You accept', ar ? 'تجهز الطلب' : 'You prepare', ar ? 'العميل يقول أنا بالطريق' : 'Customer is on the way', ar ? 'العميل يقول وصلت' : 'Customer has arrived', ar ? 'تسلّم الطلب عند السيارة' : 'You hand it over'].map((text, index) => <div className="flow-item" key={text}><span>{String(index + 1).padStart(2, '0')}</span><strong>{text}</strong></div>)}</div></section><section className="merchant-form-section section-pad"><LeadForm language={language} /></section></main>; }

function LeadForm({ language }: { language: Language }) { const ar = language === 'ar'; const [sent, setSent] = useState(false); const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)) as unknown as MerchantLead; void data; setSent(true); }; return <div className="form-layout"><div className="section-heading"><span className="section-kicker">02 / {ar ? 'انضم إلى مر' : 'Join MOR'}</span><h2>{ar ? 'خلّنا نتعرف على محلك.' : 'Tell us about your store.'}</h2><p>{ar ? 'سجل اهتمامك، وفريق مر بيتواصل معك قريبًا.' : 'Register your interest and the MOR team will be in touch.'}</p></div>{sent ? <div className="form-success"><BadgeCheck size={26} /><h3>{ar ? 'وصلنا طلبك.' : 'We received your request.'}</h3><p>{ar ? 'شكرًا لاهتمامك. سنتواصل معك قريبًا.' : 'Thanks for your interest. We will be in touch soon.'}</p></div> : <form className="lead-form" onSubmit={submit}><Field label={ar ? 'اسم المحل' : 'Store name'} name="storeName" required /><Field label={ar ? 'نوع النشاط' : 'Business type'} name="businessType" required /><Field label={ar ? 'المدينة' : 'City'} name="city" required defaultValue={ar ? 'المدينة المنورة' : 'Madinah'} /><Field label={ar ? 'اسم المسؤول' : 'Contact name'} name="contactName" required /><Field label={ar ? 'رقم الجوال' : 'Phone number'} name="phone" type="tel" required /><Field label={ar ? 'البريد الإلكتروني' : 'Email'} name="email" type="email" required /><button className="button button-blue form-submit" type="submit">{ar ? 'أرسل طلب الانضمام' : 'Send registration request'}<ArrowLeft size={18} /></button></form>}</div>; }
function Field({ label, name, type = 'text', required = false, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) { return <label className="field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue} required={required} /></label>; }

function ContactPage({ language }: { language: Language }) { const ar = language === 'ar'; const [sent, setSent] = useState(false); const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)) as unknown as ContactSubmission; void data; setSent(true); }; return <main className="inner-page"><section className="inner-hero section-pad compact-inner"><span className="eyebrow"><CircleHelp size={15} />{ar ? 'تواصل معنا' : 'Contact MOR'}</span><h1>{ar ? 'وش تبي تعرف عن مر؟' : 'How can we help?'}</h1><p>{ar ? 'للاستفسارات العامة أو الدعم أو الشراكات، اترك رسالتك وسنعود لك.' : 'For general questions, support, or partnerships, send us a note and we will get back to you.'}</p></section><section className="contact-section section-pad"><div className="contact-note"><span className="contact-icon"><Smartphone size={22} /></span><h2>{ar ? 'نحن قريبين.' : 'We are close by.'}</h2><p>{ar ? 'مر يبدأ من المدينة. تواصل معنا عن أي شيء يخص التجربة.' : 'MOR starts in Madinah. Reach out about anything related to the experience.'}</p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div>{sent ? <div className="form-success"><BadgeCheck size={26} /><h3>{ar ? 'تم إرسال رسالتك.' : 'Your message was sent.'}</h3><p>{ar ? 'شكرًا لتواصلك معنا.' : 'Thanks for reaching out.'}</p></div> : <form className="lead-form contact-form" onSubmit={submit}><Field label={ar ? 'الاسم' : 'Name'} name="name" required /><Field label={ar ? 'البريد الإلكتروني' : 'Email'} name="email" type="email" required /><Field label={ar ? 'رقم الجوال' : 'Phone number'} name="phone" type="tel" /><Field label={ar ? 'نوع الاستفسار' : 'Inquiry type'} name="inquiryType" required /><label className="field"><span>{ar ? 'الرسالة' : 'Message'}</span><textarea name="message" rows={5} required /></label><button className="button button-blue form-submit" type="submit">{ar ? 'أرسل الرسالة' : 'Send message'}<ArrowLeft size={18} /></button></form>}</section></main>; }

function LegalPage({ language, type }: { language: Language; type: 'privacy' | 'terms' }) { const ar = language === 'ar'; const privacy = type === 'privacy'; const title = privacy ? (ar ? 'الخصوصية' : 'Privacy') : (ar ? 'الشروط والأحكام' : 'Terms of use'); const sections = privacy ? (ar ? ['المعلومات التي نجمعها', 'المصادقة برقم الجوال', 'الموقع والسيارات', 'الطلبات والتفاعل مع المحلات', 'التحليلات والإشعارات', 'الاحتفاظ بالبيانات', 'الأمان وحقوقك', 'التواصل'] : ['Information collected', 'Phone authentication', 'Location and vehicles', 'Orders and merchant interaction', 'Analytics and notifications', 'Data retention', 'Security and your rights', 'Contact']) : (ar ? ['استخدام الموقع', 'حسابات المستخدمين', 'الطلبات والاستلام', 'المحلات والشركاء', 'المحتوى والتواصل', 'تعديل الشروط', 'التواصل'] : ['Use of this website', 'User accounts', 'Orders and pickup', 'Merchants and partners', 'Content and communication', 'Changes to these terms', 'Contact']); return <main className="inner-page legal-page"><section className="inner-hero section-pad compact-inner"><span className="eyebrow"><BadgeCheck size={15} />{ar ? 'مستند للمراجعة' : 'Document for review'}</span><h1>{title}</h1><p>{ar ? 'هذه مسودة أولية معدة للمراجعة القانونية قبل الإطلاق.' : 'This is a preliminary draft prepared for legal review before launch.'}</p></section><article className="legal-content section-pad"><div className="review-note">{ar ? 'ملاحظة: هذا النص إرشادي ويحتاج إلى مراجعة قانونية نهائية قبل استخدامه رسميًا.' : 'Note: This text is a guide and requires final legal review before official use.'}</div>{sections.map((heading) => <section key={heading}><h2>{heading}</h2><p>{ar ? `يقدم هذا القسم معلومات واضحة عن ${heading.toLowerCase()} وكيف يتعامل مر معها بما يتناسب مع تجربة الاستلام من السيارة. سيتم استكمال التفاصيل النهائية بعد المراجعة القانونية.` : `This section explains ${heading.toLowerCase()} and how MOR approaches it for a curbside pickup experience. Final details will be completed after legal review.`}</p></section>)}</article></main>; }

function Footer({ language, navigate }: { language: Language; navigate: (href: string) => void }) { const ar = language === 'ar'; const links = [{ label: ar ? 'عن مر' : 'About MOR', href: '/#about' }, { label: ar ? 'كيف يعمل' : 'How it works', href: '/#how' }, { label: ar ? 'للمحلات' : 'For merchants', href: '/merchants' }, { label: ar ? 'الأسئلة الشائعة' : 'FAQ', href: '/#faq' }, { label: ar ? 'الخصوصية' : 'Privacy', href: '/privacy' }, { label: ar ? 'الشروط' : 'Terms', href: '/terms' }, { label: ar ? 'تواصل معنا' : 'Contact', href: '/contact' }]; return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><a className="logo" href="/" onClick={(event) => { event.preventDefault(); navigate('/'); }}><span>MOR</span><b>مر</b></a><p>{ar ? 'مر علينا، وخذ طلبك.' : 'Pass by. Get your order.'}</p></div><div className="footer-links">{links.map((link) => <a key={link.href} href={link.href} onClick={(event) => { event.preventDefault(); navigate(link.href); }}>{link.label}</a>)}</div><div className="footer-contact"><span>{ar ? 'تواصل' : 'Contact'}</span><a href={`mailto:${contactEmail}`}>{contactEmail}</a><div className="socials"><a href="#instagram" aria-label="Instagram"><Instagram size={17} /></a><a href="#x" aria-label="X">𝕏</a><a href="#linkedin" aria-label="LinkedIn"><Linkedin size={17} /></a></div></div></div><div className="footer-bottom"><span>© 2026 MOR. All rights reserved.</span><span>{ar ? 'صُنع للوقت اللي يهمك.' : 'Made for the time that matters.'}</span></div></footer>; }

export default App;
