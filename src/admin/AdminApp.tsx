import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Bell, Building2, CheckCircle2, ChevronLeft, CircleGauge, ClipboardList,
  Clock3, FileClock, Headphones, Inbox, LogOut, Menu, MessageCircle,
  RefreshCw, Search, Send, Settings, ShieldCheck, Store, UserRound, X, XCircle,
} from 'lucide-react';
import morMark from '../assets/brand/mor-mark-transparent.png';
import { date, hasSupabaseConfig, supabase, text, type Row } from './supabase';
import './admin.css';

type AdminRoute = 'dashboard' | 'applications' | 'merchants' | 'support' | 'audit' | 'settings';
type LoadState = 'loading' | 'ready' | 'error';

const nav: Array<[AdminRoute, string, typeof CircleGauge]> = [
  ['dashboard', 'لوحة التحكم', CircleGauge], ['applications', 'طلبات التجار', ClipboardList],
  ['merchants', 'التجار', Store], ['support', 'الدعم', Headphones],
  ['audit', 'سجل العمليات', FileClock], ['settings', 'الإعدادات', Settings],
];

function routeFromPath(): AdminRoute {
  const segment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  return nav.some(([route]) => route === segment) ? segment as AdminRoute : 'dashboard';
}

export default function AdminApp() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [route, setRoute] = useState<AdminRoute>(routeFromPath);
  const [menuOpen, setMenuOpen] = useState(false);

  const verify = useCallback(async (nextUser: User | null) => {
    setBooting(true); setAuthError(''); setUser(nextUser);
    if (!nextUser || !supabase) { setAuthorized(false); setBooting(false); return; }
    const { data, error } = await supabase.rpc('is_admin');
    if (error || data !== true) {
      setAuthorized(false);
      setAuthError(error ? 'تعذر التحقق من صلاحية الإدارة.' : 'هذا الحساب لا يملك صلاحية دخول لوحة مر.');
      await supabase.auth.signOut();
    } else setAuthorized(true);
    setBooting(false);
  }, []);

  useEffect(() => {
    document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl';
    document.title = 'مر | لوحة الإدارة';
    if (!supabase) { setBooting(false); return; }
    supabase.auth.getSession().then(({ data }) => verify(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => verify(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [verify]);

  useEffect(() => {
    const pop = () => setRoute(routeFromPath()); addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  }, []);

  useEffect(() => {
    if (booting) return;
    if (!user || !authorized) {
      if (location.pathname !== '/admin/login') history.replaceState({}, '', '/admin/login');
      return;
    }
    if (location.pathname === '/admin/login') {
      history.replaceState({}, '', '/admin');
      setRoute('dashboard');
    }
  }, [authorized, booting, user]);

  const go = (next: AdminRoute) => {
    history.pushState({}, '', next === 'dashboard' ? '/admin' : `/admin/${next}`);
    setRoute(next); setMenuOpen(false); scrollTo({ top: 0 });
  };

  if (!hasSupabaseConfig) return <AdminMessage title="إعداد Supabase مطلوب" body="أضف VITE_SUPABASE_URL وVITE_SUPABASE_ANON_KEY إلى ملف البيئة المحلي ثم أعد تشغيل Vite."/>;
  if (booting) return <AdminMessage title="جاري التحقق" body="نتحقق من الجلسة وصلاحية الإدارة…" loading/>;
  if (!user || !authorized) return <AdminLogin initialError={authError}/>;

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="admin-brand"><img src={morMark} alt=""/><span><b>مر</b><small>MOR ADMIN</small></span></div>
      <nav aria-label="التنقل الإداري">{nav.map(([key, label, Icon]) => <button key={key} className={route === key ? 'active' : ''} onClick={() => go(key)}><Icon/><span>{label}</span></button>)}</nav>
      <div className="admin-account"><span dir="ltr">{user.phone ?? user.email}</span><button type="button" onClick={() => supabase?.auth.signOut()}><LogOut/> تسجيل الخروج</button></div>
    </aside>
    {menuOpen && <button type="button" className="admin-scrim" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"/>}
    <div className="admin-main">
      <header className="admin-topbar"><button type="button" className="admin-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>{menuOpen ? <X/> : <Menu/>}</button><div><small>منصة مر</small><b>{nav.find(([key]) => key === route)?.[1]}</b></div><NotificationBell onNavigate={go}/></header>
      <main>{route === 'dashboard' ? <Dashboard/> : route === 'applications' ? <Applications/> : route === 'merchants' ? <Merchants/> : route === 'support' ? <Support/> : route === 'audit' ? <AuditLog/> : <AdminSettings user={user}/>}</main>
    </div>
  </div>;
}

function AdminLogin({ initialError }: { initialError?: string }) {
  const adminPhone = import.meta.env.VITE_ADMIN_PHONE_E164 || '+966580229777';
  const [error, setError] = useState(initialError ?? ''); const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false); const [code, setCode] = useState(''); const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendCode = async () => {
    if (!supabase || cooldown > 0) return;
    setLoading(true); setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: adminPhone, options: { shouldCreateUser: false } });
    if (otpError) setError('تعذر إرسال رمز التحقق. تأكد من إعداد رسائل الجوال في Supabase ثم حاول مجددًا.');
    else { setCodeSent(true); setCooldown(60); }
    setLoading(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!supabase) return; setLoading(true); setError('');
    if (!/^\d{6}$/.test(code)) { setError('أدخل رمز التحقق المكوّن من 6 أرقام.'); setLoading(false); return; }
    const { error: loginError } = await supabase.auth.verifyOtp({ phone: adminPhone, token: code, type: 'sms' });
    if (loginError) setError('رمز التحقق غير صحيح أو انتهت صلاحيته.');
    setLoading(false);
  };
  return <main className="admin-login"><section className="login-brand"><img src={morMark} alt="شعار مر"/><span>MOR CONTROL</span><h1>إدارة مر، بوضوح.</h1><p>بوابة خاصة لفريق مر لمراجعة التجار ومتابعة الدعم والعمليات.</p></section><section className="login-panel"><div><span className="admin-kicker"><ShieldCheck/> دخول محمي</span><h2>تسجيل دخول الإدارة</h2><p>الدخول متاح لرقم مدير مر المصرح له فقط.</p><div className="admin-phone" dir="ltr">{adminPhone}</div>{!codeSent ? <button type="button" className="admin-primary admin-login-action" disabled={loading} onClick={sendCode}>{loading ? 'جاري إرسال الرمز…' : 'إرسال رمز التحقق'}</button> : <form onSubmit={submit}><label><span>رمز التحقق</span><input name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} dir="ltr" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" autoFocus required/></label><button className="admin-primary" disabled={loading || code.length !== 6}>{loading ? 'جاري التحقق…' : 'دخول لوحة الإدارة'}</button><button type="button" className="admin-resend" disabled={loading || cooldown > 0} onClick={sendCode}>{cooldown > 0 ? `إعادة الإرسال بعد ${cooldown}ث` : 'إعادة إرسال الرمز'}</button></form>}{error && <p className="admin-error" role="alert">{error}</p>}<p className="admin-security-note">بعد التحقق من الجوال، تُفحص صلاحية الحساب عبر قاعدة البيانات قبل فتح لوحة الإدارة.</p></div></section></main>;
}

function AdminMessage({ title, body, loading }: { title: string; body: string; loading?: boolean }) {
  return <main className="admin-message">{loading ? <RefreshCw className="spin"/> : <ShieldCheck/>}<h1>{title}</h1><p>{body}</p></main>;
}

function useRows(table: string, order = 'created_at') {
  const [rows, setRows] = useState<Row[]>([]); const [state, setState] = useState<LoadState>('loading'); const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!supabase) return; setState('loading'); setError('');
    const { data, error: queryError } = await supabase.from(table).select('*').order(order, { ascending: false });
    if (queryError) { setError(queryError.message); setState('error'); } else { setRows((data ?? []) as Row[]); setState('ready'); }
  }, [table, order]);
  useEffect(() => { load(); }, [load]);
  return { rows, state, error, reload: load };
}

function Dashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, support: 0, unread: 0 });
  const [state, setState] = useState<LoadState>('loading');
  useEffect(() => { (async () => {
    if (!supabase) return;
    const [pending, approved, rejected, support, unread] = await Promise.all([
      supabase.from('merchant_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('merchant_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('support_conversations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).is('read_at', null),
    ]);
    setStats({ pending: pending.count ?? 0, approved: approved.count ?? 0, rejected: rejected.count ?? 0, support: support.count ?? 0, unread: unread.count ?? 0 }); setState('ready');
  })(); }, []);
  const items = [['طلبات بانتظار المراجعة', stats.pending, ClipboardList], ['تجار معتمدون', stats.approved, CheckCircle2], ['طلبات مرفوضة', stats.rejected, XCircle], ['محادثات دعم مفتوحة', stats.support, Headphones], ['إشعارات غير مقروءة', stats.unread, Bell]] as const;
  return <Page title="نظرة عامة" subtitle="حالة عمليات مر الحالية، بدون أرقام تجريبية."><div className="stat-grid">{items.map(([label, value, Icon]) => <article key={label}><Icon/><span>{label}</span><strong>{state === 'loading' ? '…' : value}</strong></article>)}</div><section className="admin-note"><ShieldCheck/><div><b>إدارة محمية من الخلفية</b><p>الدخول لا يعتمد على البريد الظاهر؛ كل جلسة تُفحص عبر public.is_admin() وسياسات RLS.</p></div></section></Page>;
}

function Applications() {
  const { rows, state, error, reload } = useRows('merchant_applications', 'submitted_at'); const [filter, setFilter] = useState('pending'); const [selected, setSelected] = useState<Row | null>(null);
  const filtered = filter === 'all' ? rows : rows.filter(row => row.status === filter);
  return <Page title="طلبات التجار" subtitle="راجع الطلب كاملًا، ثم استخدم عملية الموافقة الآمنة."><Toolbar><div className="filter-tabs">{[['pending','قيد المراجعة'],['approved','معتمد'],['rejected','مرفوض'],['all','الكل']].map(([value,label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div><button className="icon-button" onClick={reload}><RefreshCw/></button></Toolbar>{state === 'error' ? <DataError message={error}/> : <DataTable loading={state === 'loading'} empty="لا توجد طلبات بهذه الحالة."><thead><tr><th>المتجر</th><th>مقدم الطلب</th><th>التصنيف</th><th>المدينة</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>{filtered.map(row => <tr key={String(row.id)} onClick={() => setSelected(row)}><td><b>{text(row,'name_ar')}</b><small>{text(row,'name_en')}</small></td><td>{text(row,'applicant_name')}<small>{text(row,'phone','email')}</small></td><td>{text(row,'category')}</td><td>{text(row,'city')}</td><td>{date(row.submitted_at)}</td><td><Status value={String(row.status)}/></td></tr>)}</tbody></DataTable>}{selected && <ApplicationDrawer application={selected} onClose={() => setSelected(null)} onReviewed={() => { setSelected(null); reload(); }}/>}</Page>;
}

function ApplicationDrawer({ application, onClose, onReviewed }: { application: Row; onClose: () => void; onReviewed: () => void }) {
  const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState('');
  const review = async (decision: 'approved' | 'rejected') => {
    if (!supabase || (decision === 'rejected' && !reason.trim())) { setFeedback('سبب الرفض مطلوب.'); return; }
    setBusy(true); setFeedback('');
    const { error } = await supabase.rpc('review_merchant_application', { p_application_id: String(application.id), p_decision: decision, p_reason: reason.trim() || undefined });
    if (error) { setFeedback(`تعذر تنفيذ المراجعة: ${error.message}`); setBusy(false); } else onReviewed();
  };
  const fields = [['الاسم العربي','name_ar'],['الاسم الإنجليزي','name_en'],['مقدم الطلب','applicant_name'],['الجوال','phone'],['البريد','email'],['التصنيف','category'],['الفرع','branch_name'],['المدينة','city'],['الحي','district'],['العنوان','address_ar'],['الإحداثيات','coordinates'],['ساعات العمل','opening_hours'],['الاستلام من السيارة','curbside_enabled'],['تاريخ التقديم','submitted_at'],['سبب/ملاحظة الإدارة','admin_reason']];
  return <Drawer title="تفاصيل طلب التاجر" onClose={onClose}><div className="application-title"><div className="image-placeholder"><Building2/></div><div><h3>{text(application,'name_ar')}</h3><p>{text(application,'name_en')}</p><Status value={String(application.status)}/></div></div><div className="detail-grid">{fields.map(([label,key]) => { let value: ReactNode = text(application,key); if (key === 'coordinates') value = `${String(application.latitude ?? '—')}, ${String(application.longitude ?? '—')}`; if (key === 'opening_hours') value = <code>{JSON.stringify(application.opening_hours)}</code>; if (key === 'curbside_enabled') value = application.curbside_enabled ? 'مفعّل' : 'غير مفعّل'; if (key === 'submitted_at') value = date(application.submitted_at); return <div key={key}><small>{label}</small><span>{value}</span></div>; })}</div>{application.status === 'pending' && <div className="review-box"><label><span>سبب الرفض أو ملاحظة المراجعة</span><textarea value={reason} onChange={event => setReason(event.target.value)} rows={3}/></label><div><button className="admin-primary" disabled={busy} onClick={() => review('approved')}><CheckCircle2/> اعتماد</button><button className="admin-danger" disabled={busy} onClick={() => review('rejected')}><XCircle/> رفض</button></div>{feedback && <p className="admin-error">{feedback}</p>}</div>}</Drawer>;
}

function Merchants() {
  const { rows, state, error, reload } = useRows('merchants'); const [selected, setSelected] = useState<Row | null>(null); const [query, setQuery] = useState('');
  const filtered = rows.filter(row => `${text(row,'name_ar')} ${text(row,'name_en')}`.toLowerCase().includes(query.toLowerCase()));
  return <Page title="التجار" subtitle="المتاجر المعتمدة والمسجلة فعليًا في قاعدة مر."><Toolbar><label className="admin-search"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن متجر…"/></label><button className="icon-button" onClick={reload}><RefreshCw/></button></Toolbar>{state === 'error' ? <DataError message={error}/> : <div className="merchant-grid">{state === 'loading' ? <LoadingRows/> : filtered.map(row => <button key={String(row.id)} onClick={() => setSelected(row)}><div className="merchant-logo">{row.logo_url ? <img src={String(row.logo_url)} alt=""/> : <Store/>}</div><div><h3>{text(row,'name_ar')}</h3><p>{text(row,'name_en')}</p><span>{text(row,'category')}</span></div><Status value={row.active ? 'active' : 'inactive'}/><ChevronLeft/></button>)}</div>}{selected && <MerchantDrawer merchant={selected} onClose={() => setSelected(null)}/>}</Page>;
}

function MerchantDrawer({ merchant, onClose }: { merchant: Row; onClose: () => void }) {
  const [branches, setBranches] = useState<Row[]>([]); const [staff, setStaff] = useState<Row[]>([]); const [application, setApplication] = useState<Row | null>(null);
  useEffect(() => { if (!supabase) return; Promise.all([supabase.from('merchant_branches').select('*').eq('merchant_id', merchant.id), supabase.from('merchant_staff').select('*').eq('merchant_id', merchant.id), supabase.from('merchant_applications').select('*').eq('merchant_id', merchant.id).maybeSingle()]).then(([b,s,a]) => { setBranches((b.data ?? []) as Row[]); setStaff((s.data ?? []) as Row[]); setApplication(a.data as Row | null); }); }, [merchant]);
  return <Drawer title="تفاصيل التاجر" onClose={onClose}><div className="application-title"><div className="merchant-logo">{merchant.logo_url ? <img src={String(merchant.logo_url)} alt=""/> : <Store/>}</div><div><h3>{text(merchant,'name_ar')}</h3><p>{text(merchant,'name_en')}</p><Status value={merchant.active ? 'active' : 'inactive'}/></div></div><h4 className="drawer-heading">الفروع</h4>{branches.map(branch => <article className="branch-card" key={String(branch.id)}><b>{text(branch,'name')}</b><p>{text(branch,'city')} · {text(branch,'district')}</p><span>{text(branch,'address_ar')}</span><small>{String(branch.latitude)}, {String(branch.longitude)}</small></article>)}{!branches.length && <p className="empty-inline">لا توجد فروع ظاهرة.</p>}<h4 className="drawer-heading">فريق التاجر</h4>{staff.map(member => <div className="staff-row" key={`${member.user_id}`}><span>{text(member,'role')}</span><Status value={String(member.status)}/></div>)}{application && <details className="technical"><summary>تفاصيل تقنية</summary><code>Merchant: {String(merchant.id)}<br/>Application: {String(application.id)}</code></details>}</Drawer>;
}

function Support() {
  const [rows, setRows] = useState<Row[]>([]); const [initialLoading, setInitialLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState(''); const [selectedId, setSelectedId] = useState<string | null>(null);
  const requestId = useRef(0); const refreshTimer = useRef<number | undefined>(undefined);
  const reload = useCallback(async (initial = false) => {
    if (!supabase) return; const id = ++requestId.current; initial ? setInitialLoading(true) : setRefreshing(true); setError('');
    const { data, error: queryError } = await supabase.rpc('admin_support_inbox');
    if (id !== requestId.current) return;
    if (queryError) setError('تعذر تحديث صندوق الدعم. بقيت البيانات الحالية ظاهرة ويمكنك المحاولة مجددًا.'); else setRows((data ?? []) as Row[]);
    setInitialLoading(false); setRefreshing(false);
  }, []);
  const scheduleRefresh = useCallback(() => { window.clearTimeout(refreshTimer.current); refreshTimer.current = window.setTimeout(() => reload(false), 450); }, [reload]);
  useEffect(() => { reload(true); const client = supabase; if (!client) return; const channel = client.channel('admin-support-inbox-v2').on('postgres_changes', { event: '*', schema: 'public', table: 'support_conversations' }, scheduleRefresh).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, scheduleRefresh).subscribe(); return () => { window.clearTimeout(refreshTimer.current); client.removeChannel(channel); }; }, [reload, scheduleRefresh]);
  const selected = selectedId ? rows.find(row => String(row.id) === selectedId) ?? null : null;
  const updateRow = useCallback((id: string, changes: Row) => setRows(current => current.map(row => String(row.id) === id ? { ...row, ...changes } : row)), []);
  const handleRowChange = useCallback((changes: Row) => { if (selectedId) updateRow(selectedId, changes); }, [selectedId, updateRow]);
  const subjectLabel = (value: unknown) => value === 'general' ? 'محادثة عامة' : typeof value === 'string' && value.trim() ? value : 'محادثة دعم';
  return <Page title="الدعم" subtitle="كل محادثة خيط مستقل محفوظ برقمها وحالتها."><div className={`support-layout ${selected ? 'has-selection' : ''}`}><section className="support-list"><div className="support-list-head"><span><Inbox/><b>صندوق الوارد</b></span><button type="button" className="icon-button" disabled={refreshing} onClick={() => reload(false)} aria-label="تحديث المحادثات"><RefreshCw className={refreshing ? 'spin' : ''}/></button></div>{error && rows.length > 0 && <p className="support-refresh-error" role="alert">{error}</p>}{initialLoading ? <LoadingRows/> : error && !rows.length ? <DataError message={error}/> : rows.map(row => { const unread = Number(row.unread_customer_count ?? 0); return <button type="button" key={String(row.id)} className={selectedId === String(row.id) ? 'active' : ''} onClick={() => setSelectedId(String(row.id))}><div className="support-avatar"><UserRound/></div><span><b>{text(row,'customer_name','masked_phone').replace('—','عميل مر')}</b><small>{subjectLabel(row.subject)} · {date(row.updated_at)}</small><em>{text(row,'last_message')}</em></span><div className="support-list-meta"><Status value={String(row.status)}/>{unread > 0 && <strong>{unread}</strong>}</div></button>; })}{!initialLoading && !rows.length && !error && <div className="empty-state"><MessageCircle/><b>لا توجد محادثات دعم</b></div>}</section><section className="conversation-panel">{selected ? <Conversation conversation={selected} onBack={() => setSelectedId(null)} onRowChange={handleRowChange}/> : <div className="empty-state"><Headphones/><b>اختر محادثة</b><p>ستظهر الرسائل والردود هنا بوضوح.</p></div>}</section></div></Page>;
}

function Conversation({ conversation, onBack, onRowChange }: { conversation: Row; onBack: () => void; onRowChange: (changes: Row) => void }) {
  const [messages, setMessages] = useState<Row[]>([]); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [statusBusy, setStatusBusy] = useState(false); const [loading, setLoading] = useState(true); const [sendError, setSendError] = useState(''); const [status, setStatus] = useState(String(conversation.status));
  useEffect(() => setStatus(String(conversation.status)), [conversation.status]);
  const load = useCallback(async () => { if (!supabase) return; setLoading(true); const { data, error } = await supabase.from('support_messages').select('*').eq('conversation_id', conversation.id).order('created_at'); if (!error) setMessages((data ?? []) as Row[]); else setSendError('تعذر تحميل الرسائل.'); setLoading(false); }, [conversation.id]);
  useEffect(() => { load(); supabase?.rpc('mark_support_read', { p_conversation_id: String(conversation.id) }).then(() => onRowChange({ unread_customer_count: 0 })); const client = supabase; if (!client) return; const channel = client.channel(`admin-support-thread-${conversation.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${conversation.id}` }, payload => { const incoming = payload.new as Row; setMessages(current => current.some(row => row.id === incoming.id) ? current : [...current, incoming]); if (incoming.sender_type === 'customer') client.rpc('mark_support_read', { p_conversation_id: String(conversation.id) }).then(() => onRowChange({ unread_customer_count: 0 })); }).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_conversations', filter: `id=eq.${conversation.id}` }, payload => { const next = payload.new as Row; setStatus(String(next.status)); onRowChange(next); }).subscribe(); return () => { client.removeChannel(channel); }; }, [conversation.id, load, onRowChange]);
  const send = async (event: FormEvent) => { event.preventDefault(); if (!supabase || !message.trim() || status !== 'open') return; setBusy(true); setSendError(''); const { data: messageId, error } = await supabase.rpc('staff_send_support_message', { p_conversation_id: String(conversation.id), p_message: message.trim() }); if (!error) { setMessage(''); const { data } = await supabase.from('support_messages').select('*').eq('id', messageId).maybeSingle(); if (data) setMessages(current => current.some(row => row.id === data.id) ? current : [...current, data as Row]); } else setSendError('تعذر إرسال الرد. تحقق من أن المحادثة مفتوحة ثم حاول مرة أخرى.'); setBusy(false); };
  const toggle = async () => { if (!supabase || statusBusy) return; setStatusBusy(true); setSendError(''); const next = status === 'open' ? 'closed' : 'open'; const { error } = await supabase.rpc('set_support_conversation_status', { p_conversation_id: String(conversation.id), p_status: next }); if (!error) { const result = await supabase.from('support_conversations').select('status, updated_at').eq('id', conversation.id).single(); if (!result.error && result.data.status === next) { setStatus(next); onRowChange(result.data as Row); } else setSendError('لم يتم تأكيد تغيير الحالة من قاعدة البيانات.'); } else setSendError('تعذر تغيير حالة المحادثة. لم تتغير الحالة.'); setStatusBusy(false); };
  const customerName = text(conversation,'customer_name','masked_phone').replace('—','عميل مر');
  return <div className="conversation"><header><button type="button" className="conversation-back" onClick={onBack} aria-label="العودة إلى صندوق الوارد"><ChevronLeft/></button><div className="conversation-customer"><span className="support-avatar"><UserRound/></span><span><b>{customerName}</b><small><Clock3/> بدأت {date(conversation.created_at)}</small></span></div><div className="conversation-actions"><Status value={status}/><button type="button" disabled={statusBusy} onClick={toggle}>{statusBusy ? 'جارٍ الحفظ…' : status === 'open' ? 'إغلاق المحادثة' : 'إعادة فتح المحادثة'}</button></div></header><div className="messages">{loading ? <LoadingRows/> : messages.map(row => { const kind = String(row.sender_type); const label = kind === 'customer' ? customerName : kind === 'system' ? 'مر' : kind === 'admin' ? 'إدارة مر' : 'فريق دعم مر'; return <article key={String(row.id)} className={`message message-${kind}`}><b>{label}</b><p dir="auto">{text(row,'message')}</p><small>{date(row.created_at)}{row.read_at && kind !== 'customer' ? ' · مقروءة' : ''}</small></article>; })}{!loading && !messages.length && <div className="empty-state"><MessageCircle/><b>لا توجد رسائل</b></div>}</div>{status === 'closed' ? <div className="conversation-closed"><ShieldCheck/> هذه المحادثة مغلقة. أعد فتحها للرد.</div> : <form onSubmit={send}><div><input aria-label="رسالة الدعم" value={message} onChange={event => setMessage(event.target.value)} placeholder="اكتب رد فريق دعم مر…" dir="auto"/><small>سيظهر الرد للعميل باسم «دعم مر».</small>{sendError && <span className="admin-error" role="alert">{sendError}</span>}</div><button className="admin-primary" disabled={busy || !message.trim()}><Send/>{busy ? 'جارٍ الإرسال…' : 'إرسال'}</button></form>}</div>;
}

function AuditLog() {
  const { rows, state, error, reload } = useRows('merchant_audit_log');
  return <Page title="سجل العمليات" subtitle="أثر تدقيق دائم لقرارات الإدارة."><Toolbar><span>آخر العمليات</span><button className="icon-button" onClick={reload}><RefreshCw/></button></Toolbar>{state === 'error' ? <DataError message={error}/> : <DataTable loading={state === 'loading'} empty="لا توجد عمليات."><thead><tr><th>الوقت</th><th>الإجراء</th><th>الكيان</th><th>الممثل</th><th>السبب/البيانات</th></tr></thead><tbody>{rows.map(row => <tr key={String(row.id)}><td>{date(row.created_at)}</td><td><b>{text(row,'action')}</b></td><td>{text(row,'entity_type')}</td><td>{text(row,'actor_id')}</td><td><code>{JSON.stringify(row.metadata)}</code></td></tr>)}</tbody></DataTable>}</Page>;
}

function AdminSettings({ user }: { user: User }) { return <Page title="الإعدادات" subtitle="معلومات جلسة الإدارة الحالية."><section className="settings-panel"><div><small>الحساب</small><b dir="ltr">{user.phone ?? user.email}</b></div><div><small>التحقق</small><b><ShieldCheck/> مصرح عبر public.is_admin()</b></div><div><small>الموقع العام</small><a href="/">morapp.tech</a></div></section></Page>; }

function NotificationBell({ onNavigate }: { onNavigate: (route: AdminRoute) => void }) {
  const [items, setItems] = useState<Row[]>([]); const [open, setOpen] = useState(false);
  const load = useCallback(async () => { if (!supabase) return; const { data } = await supabase.from('admin_notifications').select('*, merchants(name_ar)').order('created_at', { ascending: false }).limit(12); setItems((data ?? []) as Row[]); }, []);
  useEffect(() => { load(); const client = supabase; if (!client) return; const channel = client.channel('admin-notifications').on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, load).subscribe(); return () => { client.removeChannel(channel); }; }, [load]);
  const unread = items.filter(item => !item.read_at).length;
  const activate = async (item: Row) => { if (!supabase) return; if (!item.read_at) { const readAt = new Date().toISOString(); const { error } = await supabase.from('admin_notifications').update({ read_at: readAt }).eq('id', item.id); if (!error) setItems(current => current.map(row => row.id === item.id ? { ...row, read_at: readAt } : row)); } const target = `${item.event_type ?? ''} ${item.entity_type ?? ''}`; if (/support|message|customer/i.test(target)) onNavigate('support'); else if (/application/i.test(target)) onNavigate('applications'); else if (/merchant|change/i.test(target)) onNavigate('merchants'); setOpen(false); };
  return <div className="notification-wrap"><button type="button" className="notification-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="الإشعارات"><Bell/>{unread > 0 && <span>{unread}</span>}</button>{open && <div className="notification-popover"><header><span><Bell/><b>الإشعارات</b></span><small>{unread} غير مقروء</small></header>{items.map(item => { const merchant = item.merchants as Row | null; return <button type="button" key={String(item.id)} className={!item.read_at ? 'unread' : ''} onClick={() => activate(item)}><span className="notification-icon"><NotificationIcon type={String(item.event_type)}/></span><span><b>{notificationTitle(item)}</b>{merchant?.name_ar && <em>{String(merchant.name_ar)}</em>}<p>{notificationBody(item)}</p><small>{date(item.created_at)}</small></span>{!item.read_at && <i aria-label="غير مقروء"/>}</button>; })}{!items.length && <div className="empty-notifications"><Bell/><p>لا توجد إشعارات جديدة.</p></div>}</div>}</div>;
}

function NotificationIcon({ type }: { type: string }) { return /support|message/i.test(type) ? <MessageCircle/> : /merchant|application|change/i.test(type) ? <Store/> : <Bell/>; }
function notificationTitle(item: Row) { const type = String(item.event_type ?? ''); if (/merchant_change|pending_change/i.test(type)) return 'تغيير بيانات متجر بانتظار المراجعة'; if (/application/i.test(type)) return 'طلب تاجر يحتاج إلى المراجعة'; if (/support/i.test(type)) return 'رسالة دعم جديدة'; return text(item,'title').replace(/^merchant$/i,'تحديث متعلق بمتجر'); }
function notificationBody(item: Row) { const body = text(item,'body'); const rawValues = ['merchant','application','change_request','pending_change']; if (body !== '—' && !rawValues.includes(body)) return body; const entity: Record<string,string> = { merchant:'متجر', merchant_application:'طلب تاجر', application:'طلب تاجر', change_request:'تغيير بيانات متجر', pending_change:'تغيير بيانات متجر' }; return entity[String(item.entity_type)] ?? 'يوجد تحديث جديد يحتاج إلى انتباهك.'; }

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="admin-page"><header className="page-heading"><h1>{title}</h1><p>{subtitle}</p></header>{children}</div>; }
function Toolbar({ children }: { children: ReactNode }) { return <div className="admin-toolbar">{children}</div>; }
function Status({ value }: { value: string }) { const labels: Record<string,string> = { pending:'قيد المراجعة',approved:'معتمد',rejected:'مرفوض',active:'نشط',inactive:'متوقف',open:'مفتوحة',closed:'مغلقة' }; return <span className={`status status-${value}`}>{labels[value] ?? value}</span>; }
function DataError({ message }: { message: string }) { return <div className="data-error"><XCircle/><div><b>تعذر تحميل البيانات</b><p>{message}</p></div></div>; }
function LoadingRows() { return <div className="loading-rows"><i/><i/><i/></div>; }
function DataTable({ children, loading, empty }: { children: ReactNode; loading: boolean; empty: string }) { if (loading) return <LoadingRows/>; const body = Array.isArray(children) ? children[1] : null; const hasRows = body && typeof body === 'object' && 'props' in body && Boolean((body as { props?: { children?: unknown[] } }).props?.children?.length); if (!hasRows) return <div className="empty-state"><ClipboardList/><b>{empty}</b></div>; return <div className="table-wrap"><table>{children}</table></div>; }
function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><aside className="admin-drawer"><header><h2>{title}</h2><button onClick={onClose}><X/></button></header><div className="drawer-content">{children}</div></aside></div>; }
