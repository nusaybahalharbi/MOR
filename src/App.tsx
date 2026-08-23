import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Car, Check, ChevronDown, CircleHelp,
  Clock3, Coffee, Flower2, Menu, PackageCheck, Pill, Search, ShoppingBag,
  Sparkles, Store, WashingMachine, X
} from 'lucide-react';

type Language = 'ar' | 'en';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@morapp.tech';
const MERCHANT_EMAIL = import.meta.env.VITE_MERCHANT_EMAIL || 'support@morapp.tech';

const t = {
  ar: {
    nav: ['الرئيسية', 'كيف يعمل', 'للمتاجر', 'عن مر', 'الأسئلة الشائعة'],
    heroTag: 'تجربة استلام أذكى من متاجر حيّك', heroTitle: 'كل اللي في حيّك،\nأقرب لك مع مر',
    heroCopy: 'اطلب من متاجرك القريبة، وخذ طلبك من السيارة. بدون انتظار طويل، وبدون ما تغيّر طريقك.',
    discover: 'اكتشف مر', merchants: 'سجّل متجرك', howTitle: 'من الطلب للسيارة، بخطوات واضحة',
    howCopy: 'اختر اللي تحتاجه، ومر على المتجر وقت ما يكون طلبك جاهز.',
    localTitle: 'حيّك فيه كل اللي تحتاجه', localCopy: 'مر يجمع تجربة الاستلام من المقاهي والمخابز والورد والصيدليات والمغاسل والمتاجر المتخصصة — مو بس الأكل.',
    merchantTitle: 'خل متجرك أقرب لعملائك', merchantCopy: 'استقبل طلبات الاستلام، حدّث توفر منتجاتك، واعرف متى العميل بالطريق ومتى وصل.',
    faqTitle: 'أسئلة واضحة، وإجابات مختصرة', finalTitle: 'طلبك بطريقك. مو العكس.',
  },
  en: {
    nav: ['Home', 'How it works', 'For merchants', 'About MOR', 'FAQ'],
    heroTag: 'Smarter pickup from neighborhood stores', heroTitle: 'Everything nearby,\ncloser with MOR',
    heroCopy: 'Order from local stores and pick up from your car. Less waiting, without changing your route.',
    discover: 'Discover MOR', merchants: 'Register your store', howTitle: 'From order to car, in clear steps',
    howCopy: 'Choose what you need, then pass by when your order is ready.',
    localTitle: 'Your neighborhood has what you need', localCopy: 'MOR brings curbside pickup to cafés, bakeries, florists, pharmacies, laundries, and specialty stores — not only food.',
    merchantTitle: 'Bring your store closer to customers', merchantCopy: 'Receive pickup orders, update availability, and know when a customer is on the way or has arrived.',
    faqTitle: 'Clear questions, concise answers', finalTitle: 'Your order, on your way.',
  }
} as const;

const steps = [
  ['اختر متجرك', 'Choose a store', 'تصفح متاجر حيّك واختر اللي تحتاجه.', 'Browse nearby stores and choose what you need.', Store],
  ['اطلب', 'Order', 'أرسل طلبك وخله يتجهز قبل وصولك.', 'Place your order so it is prepared before you arrive.', ShoppingBag],
  ['أنا بالطريق', "I'm on my way", 'علّم المتجر أنك تحركت للموقع.', 'Let the store know you are heading over.', Car],
  ['وصلت', "I've arrived", 'المتجر يجيب الطلب لسيارتك.', 'The store brings the order to your car.', PackageCheck],
] as const;

const categories = [
  ['مقاهي', 'Cafés', Coffee], ['مخابز', 'Bakeries', ShoppingBag], ['ورد', 'Florists', Flower2],
  ['صيدليات', 'Pharmacies', Pill], ['مغاسل', 'Laundry', WashingMachine], ['متاجر متخصصة', 'Specialty', Store],
] as const;

const faqs = [
  ['ما هو مر؟', 'What is MOR?', 'مر تجربة طلب واستلام من السيارة تربطك بمتاجر حيّك القريبة.', 'MOR is a curbside ordering and pickup experience connecting you with nearby local stores.'],
  ['كيف أستلم طلبي؟', 'How do I pick up my order?', 'بعد ما يجهز طلبك، اضغط «أنا بالطريق». وعند وصولك اضغط «وصلت» ليحضره المتجر للسيارة.', 'Once your order is ready, tap “I’m on my way.” At the store, tap “I’ve arrived” and the merchant brings it to your car.'],
  ['هل مر خدمة توصيل؟', 'Is MOR a delivery service?', 'لا. أنت تمر على المتجر، ومر يجعل الاستلام أسرع وأسهل من السيارة.', 'No. You drive to the store; MOR makes curbside pickup faster and easier.'],
  ['كيف أسجل متجري؟', 'How do I register my store?', 'عبّ نموذج الاهتمام، وسيفتح جهازك رسالة جاهزة لإرسالها إلى فريق المتاجر.', 'Complete the interest form and your device will open a prepared email to our merchant team.'],
  ['هل يمكن لأي نوع متجر الانضمام؟', 'Can any type of store join?', 'مر مصمم لمختلف متاجر الأحياء. التسجيل يعبر عن الاهتمام، ويؤكد الفريق الملاءمة والتوفر.', 'MOR is designed for many neighborhood businesses. Registration expresses interest; our team confirms fit and availability.'],
  ['كيف يعرف المتجر أني وصلت؟', 'How does the store know I arrived?', 'في تجربة مر، ترسل حالة «وصلت» تنبيهًا للمتجر ليبدأ تسليم الطلب.', 'In the MOR experience, the “I’ve arrived” status alerts the merchant to begin handoff.'],
] as const;

function App() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('mor-language') === 'en' ? 'en' : 'ar');
  const [path, setPath] = useState(() => window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('mor-language', language);
    document.title = language === 'ar' ? 'مر | استلام طلباتك من متاجر حيّك بسهولة' : 'MOR | Curbside Pickup From Local Stores';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ar' ? 'اطلب من متاجر حيّك القريبة واستلم طلبك من السيارة بسهولة مع مر.' : 'Order from nearby local stores and pick up from your car with MOR.');
  }, [language]);
  useEffect(() => { const pop = () => setPath(window.location.pathname); addEventListener('popstate', pop); return () => removeEventListener('popstate', pop); }, []);
  const go = (href: string) => {
    const [nextPath, hash] = href.split('#');
    if (nextPath && nextPath !== window.location.pathname) { history.pushState({}, '', href); setPath(nextPath); scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
    setMenuOpen(false);
  };
  return <Shell language={language} setLanguage={setLanguage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} go={go}>
    {path === '/' ? <Home language={language} go={go} /> : path === '/merchants' ? <MerchantPage language={language} /> : path === '/contact' ? <ContactPage language={language} /> : path === '/privacy' || path === '/terms' ? <LegalPage language={language} kind={path.slice(1) as 'privacy'|'terms'} /> : <NotFound language={language} go={go} />}
  </Shell>;
}

function Shell({ children, language, setLanguage, menuOpen, setMenuOpen, go }: {children:ReactNode; language:Language; setLanguage:(l:Language)=>void; menuOpen:boolean; setMenuOpen:(v:boolean)=>void; go:(h:string)=>void}) {
  const c=t[language], ar=language==='ar';
  const links=[['/#top',c.nav[0]],['/#how',c.nav[1]],['/merchants',c.nav[2]],['/#about',c.nav[3]],['/#faq',c.nav[4]]];
  return <div className="site-shell"><a className="skip-link" href="#main">{ar?'تخطّ إلى المحتوى':'Skip to content'}</a><header className="header"><a className="brand" href="/" onClick={e=>{e.preventDefault();go('/')}} aria-label={ar?'مر، الرئيسية':'MOR, home'}><span>مر</span><small>MOR</small></a><nav className={menuOpen?'nav open':'nav'} aria-label={ar?'التنقل الرئيسي':'Main navigation'}>{links.map(([href,label])=><a key={href} href={href} onClick={e=>{e.preventDefault();go(href)}}>{label}</a>)}<button className="lang mobile-lang" onClick={()=>setLanguage(ar?'en':'ar')} aria-label={ar?'Switch to English':'التبديل إلى العربية'}>{ar?'EN':'AR'}</button><a className="button primary mobile-cta" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{c.merchants}</a></nav><div className="header-actions"><button className="lang" onClick={()=>setLanguage(ar?'en':'ar')} aria-label={ar?'Switch to English':'التبديل إلى العربية'}>{ar?'EN':'AR'}</button><a className="button primary header-cta" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{c.merchants}</a><button className="menu" onClick={()=>setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen?(ar?'إغلاق القائمة':'Close menu'):(ar?'فتح القائمة':'Open menu')}>{menuOpen?<X/>:<Menu/>}</button></div></header>{children}<Footer language={language} go={go}/></div>
}

function Home({language,go}:{language:Language;go:(h:string)=>void}) { const c=t[language], ar=language==='ar'; return <main id="main">
  <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/>{c.heroTag}</div><h1>{c.heroTitle.split('\n').map((s,i)=><span key={s} className={i?'accent-line':''}>{s}</span>)}</h1><p>{c.heroCopy}</p><div className="actions"><a className="button primary" href="#how" onClick={e=>{e.preventDefault();go('/#how')}}>{c.discover}{ar?<ArrowLeft/>:<ArrowRight/>}</a><a className="button secondary" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{c.merchants}</a></div><div className="trust"><span><Check/> {ar?'استلام أسرع':'Faster pickup'}</span><span><Check/> {ar?'من المتجر للسيارة':'Store to car'}</span><span><Check/> {ar?'بدون انتظار طويل':'Less waiting'}</span></div></div><ExperienceMock language={language}/></section>
  <section className="section how" id="how"><Heading eyebrow={ar?'كيف يعمل':'How it works'} title={c.howTitle} copy={c.howCopy}/><div className="step-grid">{steps.map(([a,e,ac,ec,Icon],i)=><article className="step" key={a}><div className="step-icon"><Icon/><span>0{i+1}</span></div><h3>{ar?a:e}</h3><p>{ar?ac:ec}</p></article>)}</div></section>
  <section className="section local" id="about"><div className="local-copy"><Heading eyebrow={ar?'متاجر حيّك':'Your neighborhood'} title={c.localTitle} copy={c.localCopy}/><div className="category-list">{categories.map(([a,e,Icon])=><span key={a}><Icon/>{ar?a:e}</span>)}</div></div><div className="route-card" aria-label={ar?'تصور لمسار الاستلام':'Pickup route illustration'}><div className="route-line"/><div className="route-point store-point"><Store/><span>{ar?'اختر متجرك':'Choose store'}</span></div><div className="route-point car-point"><Car/><span>{ar?'طلبك للسيارة':'Order to car'}</span></div><div className="route-badge"><Clock3/><b>{ar?'وقت أقل في الانتظار':'Less time waiting'}</b></div></div></section>
  <MerchantBand language={language} go={go}/><FAQ language={language}/>
  <section className="final"><span>MOR / مر</span><h2>{c.finalTitle}</h2><p>{ar?'قريبًا — سجّل متجرك أو تواصل معنا لمعرفة المزيد.':'Coming soon — register your store or contact us to learn more.'}</p><div className="actions"><a className="button light" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{c.merchants}</a><a className="button ghost" href="/contact" onClick={e=>{e.preventDefault();go('/contact')}}>{ar?'تواصل معنا':'Contact us'}</a></div></section>
  </main> }

function ExperienceMock({language}:{language:Language}) { const ar=language==='ar'; return <div className="experience" aria-label={ar?'تصور توضيحي لتجربة تطبيق مر':'Illustrative MOR app experience'}><div className="mock-note">{ar?'تصور توضيحي للتجربة':'Experience concept'}</div><div className="phone"><div className="phone-top"><b>مر</b><span>MOR</span></div><p className="hello">{ar?'هلا، وين ودك تمر؟':'Where are you stopping by?'}</p><div className="search"><Search/>{ar?'ابحث في متاجر حيّك':'Search neighborhood stores'}</div><small>{ar?'قريب منك':'NEAR YOU'}</small><div className="store-tile"><div className="store-art"><Store/></div><div><b>{ar?'متجر قريب':'Nearby store'}</b><span>{ar?'جاهز للاستلام من السيارة':'Curbside pickup available'}</span></div><ArrowLeft/></div><div className="order-card"><div><span>{ar?'حالة الطلب':'ORDER STATUS'}</span><b>{ar?'طلبك جاهز':'Your order is ready'}</b></div><BadgeCheck/></div><button>{ar?'أنا بالطريق':'I’m on my way'}<Car/></button></div><div className="arrival-toast"><span><Check/></span><div><small>{ar?'عند الوصول':'WHEN YOU ARRIVE'}</small><b>{ar?'اضغط «وصلت»':'Tap “I’ve arrived”'}</b></div></div></div> }

function Heading({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}) { return <div className="heading"><span>{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div> }
function MerchantBand({language,go}:{language:Language;go:(h:string)=>void}) { const c=t[language],ar=language==='ar'; const items=ar?['استقبل طلبات الاستلام','حدّث توفر المنتجات','اعرف أن العميل بالطريق','استعد عند وصوله']:['Receive pickup orders','Update product availability','Know when customers depart','Prepare when they arrive']; return <section className="merchant-band" id="merchants"><div><span className="merchant-kicker"><Store/>{ar?'مر للمتاجر':'MOR for merchants'}</span><h2>{c.merchantTitle}</h2><p>{c.merchantCopy}</p><a className="button light" href="/merchants" onClick={e=>{e.preventDefault();go('/merchants')}}>{c.merchants}{ar?<ArrowLeft/>:<ArrowRight/>}</a></div><div className="merchant-panel">{items.map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><b>{x}</b><Check/></div>)}</div></section> }
function FAQ({language}:{language:Language}) { const [open,setOpen]=useState(0),ar=language==='ar'; return <section className="section faq" id="faq"><Heading eyebrow="FAQ" title={t[language].faqTitle} copy={ar?'كل اللي تحتاج تعرفه قبل ما تمر.':'What you need to know before you stop by.'}/><div className="faq-list">{faqs.map(([qa,qe,aa,ae],i)=><article className={open===i?'faq-item open':'faq-item'} key={qa}><button onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i}><span>{ar?qa:qe}</span><ChevronDown/></button><div><p>{ar?aa:ae}</p></div></article>)}</div></section> }

function MerchantPage({language}:{language:Language}) { const ar=language==='ar'; return <main id="main" className="inner"><section className="inner-hero"><div className="eyebrow"><Store/>{ar?'للمتاجر':'For merchants'}</div><h1>{ar?'خل متجرك أقرب لعملائك':'Bring your store closer to customers'}</h1><p>{ar?'سجّل اهتمامك بالانضمام إلى مر. النموذج يفتح رسالة بريد جاهزة في جهازك — ولن نعرض رسالة نجاح وهمية.':'Register your interest in MOR. The form opens a prepared email on your device—we do not show a false success message.'}</p></section><section className="form-section"><div><Heading eyebrow={ar?'ابدأ من هنا':'Start here'} title={ar?'عرّفنا على متجرك':'Tell us about your store'} copy={ar?'هذه الخطوة لا تنشئ حسابًا. يراجع الفريق طلب اهتمامك ويتواصل معك.':'This does not create an account. Our team reviews your interest and contacts you.'}/><div className="mini-benefits"><span><Check/>{ar?'طلبات استلام منظمة':'Organized pickup orders'}</span><span><Check/>{ar?'تنبيهات الوصول':'Arrival alerts'}</span><span><Check/>{ar?'تجربة أسرع للعميل':'Faster customer experience'}</span></div></div><EmailForm language={language} type="merchant"/></section></main> }
function ContactPage({language}:{language:Language}) { const ar=language==='ar'; return <main id="main" className="inner"><section className="inner-hero compact"><div className="eyebrow"><CircleHelp/>{ar?'تواصل معنا':'Contact us'}</div><h1>{ar?'كيف نقدر نساعدك؟':'How can we help?'}</h1><p>{ar?'للاستفسارات العامة، تواصل مع فريق مر على support@morapp.tech أو استخدم النموذج.':'For general questions, email support@morapp.tech or use the form.'}</p></section><section className="form-section contact-layout"><div className="contact-card"><span>MOR / مر</span><h2>{ar?'نسمع منك.':'We’re listening.'}</h2><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><small>morapp.tech</small></div><EmailForm language={language} type="contact"/></section></main> }

function EmailForm({language,type}:{language:Language;type:'merchant'|'contact'}) { const ar=language==='ar'; const [opened,setOpened]=useState(false); const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault(); const data=new FormData(e.currentTarget); const subject=type==='merchant'?`MOR merchant interest — ${data.get('store')}`:`MOR website inquiry — ${data.get('name')}`; const body=[...data.entries()].map(([k,v])=>`${k}: ${v}`).join('\n'); window.location.href=`mailto:${type==='merchant'?MERCHANT_EMAIL:CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; setOpened(true)}; return <form className="form" onSubmit={submit}><div className="form-grid">{type==='merchant'&&<><Field name="store" label={ar?'اسم المتجر':'Store name'}/><Field name="business" label={ar?'نوع النشاط':'Business type'}/></>}<Field name="name" label={ar?'الاسم':'Name'}/><Field name="phone" type="tel" label={ar?'رقم الجوال':'Phone number'}/><Field name="email" type="email" label={ar?'البريد الإلكتروني':'Email'}/>{type==='merchant'&&<Field name="city" label={ar?'المدينة':'City'}/>}</div>{type==='contact'&&<label className="field full"><span>{ar?'الرسالة':'Message'}</span><textarea name="message" rows={5} required/></label>}<button className="button primary form-button" type="submit">{type==='merchant'?(ar?'جهّز رسالة التسجيل':'Prepare registration email'):(ar?'جهّز الرسالة':'Prepare email')}<ArrowLeft/></button>{opened&&<p className="form-status" role="status">{ar?'فتحنا تطبيق البريد برسالة جاهزة. اضغط «إرسال» هناك لإكمال الطلب.':'We opened your email app with a prepared message. Press Send there to complete your request.'}</p>}<small className="form-note">{ar?'لن يتم إرسال أي بيانات حتى تضغط «إرسال» في تطبيق البريد.':'Nothing is sent until you press Send in your email app.'}</small></form> }
function Field({name,label,type='text'}:{name:string;label:string;type?:string}) { return <label className="field"><span>{label}</span><input name={name} type={type} required autoComplete={name==='email'?'email':name==='phone'?'tel':'on'}/></label> }

function LegalPage({language,kind}:{language:Language;kind:'privacy'|'terms'}) { const ar=language==='ar',privacy=kind==='privacy'; const heads=privacy?(ar?['المعلومات التي تقدمها','استخدام المعلومات','مشاركة البيانات','حماية البيانات','حقوقك','التواصل']:['Information you provide','How information is used','Data sharing','Data protection','Your rights','Contact']):(ar?['استخدام الموقع','توفر الخدمة','محتوى الموقع','حدود المسؤولية','التغييرات','التواصل']:['Website use','Service availability','Website content','Liability limits','Changes','Contact']); return <main id="main" className="inner legal"><section className="inner-hero compact"><div className="eyebrow"><BadgeCheck/>{ar?'يتطلب مراجعة قانونية':'Requires legal review'}</div><h1>{privacy?(ar?'سياسة الخصوصية':'Privacy Policy'):(ar?'الشروط والأحكام':'Terms & Conditions')}</h1><p>{ar?'مسودة أولية واضحة للإطلاق، وتحتاج مراجعة واعتمادًا قانونيًا قبل النشر النهائي.':'A plain-language launch draft that requires legal review and approval before final publication.'}</p></section><article className="legal-body"><div className="legal-note">{ar?'تنبيه: هذا النص مؤقت وليس استشارة قانونية.':'Notice: This is temporary copy, not legal advice.'}</div>{heads.map((h,i)=><section key={h}><span>0{i+1}</span><h2>{h}</h2><p>{ar?'سيتم توضيح تفاصيل هذا القسم بدقة بعد اعتماد طريقة تشغيل الخدمة ومراجعة المختص القانوني. للتواصل بشأن هذه الوثيقة: support@morapp.tech.':'This section will be finalized once the service model is confirmed and reviewed by legal counsel. For questions about this document: support@morapp.tech.'}</p></section>)}</article></main> }
function NotFound({language,go}:{language:Language;go:(h:string)=>void}) { const ar=language==='ar'; return <main id="main" className="not-found"><span>404</span><h1>{ar?'الصفحة غير موجودة':'Page not found'}</h1><a className="button primary" href="/" onClick={e=>{e.preventDefault();go('/')}}>{ar?'العودة للرئيسية':'Back home'}</a></main> }
function Footer({language,go}:{language:Language;go:(h:string)=>void}) { const ar=language==='ar'; const links=[['/#about',ar?'عن مر':'About MOR'],['/merchants',ar?'للمتاجر':'For merchants'],['/contact',ar?'تواصل معنا':'Contact'],['/privacy',ar?'سياسة الخصوصية':'Privacy'],['/terms',ar?'الشروط والأحكام':'Terms']]; return <footer><div className="footer-main"><div><a className="brand footer-brand" href="/" onClick={e=>{e.preventDefault();go('/')}}><span>مر</span><small>MOR</small></a><p>{ar?'استلام أسهل من متاجر حيّك.':'Easier pickup from neighborhood stores.'}</p></div><nav aria-label={ar?'روابط التذييل':'Footer links'}>{links.map(([h,l])=><a key={h} href={h} onClick={e=>{e.preventDefault();go(h)}}>{l}</a>)}</nav><div className="footer-contact"><span>{ar?'تواصل معنا':'Contact us'}</span><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><a href="https://morapp.tech">morapp.tech</a></div></div><div className="footer-bottom"><span>© 2026 MOR</span><span>{ar?'مر':'MOR'} · Riyadh, Saudi Arabia</span></div></footer> }

export default App;
