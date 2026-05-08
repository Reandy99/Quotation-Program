"use client"

import Link from 'next/link'
import { Zap, ArrowRight, Bell, Calendar, AlertCircle, BarChart3, DollarSign, Trophy, FileText, TrendingUp, Moon, LayoutDashboard, Users, Receipt, Settings, UserRound } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import './landing-page.css'

const AMBER  = '#D4A84B'
const AMBER2 = '#F59E0B'
const ROSE   = '#FB7185'

const t = {
  id: {
    navFeatures: 'Fitur', navPricing: 'Harga', navAbout: 'Tentang', navBlog: 'Blog',
    navCta: 'Coba Gratis →',
    heroBadge: 'Dibuat untuk fotografer & videografer Indonesia',
    heroTitle: 'Dari leads masuk sampai invoice lunas,',
    heroTitleGrad: 'FrameFlow yang urus semuanya.',
    heroSub: 'FrameFlow membantu kamu kelola leads, kirim penawaran profesional, dan tagih klien — tanpa pusing soal admin.',
    heroBtn1: 'Mulai gratis 14 hari →', heroBtn2: 'Lihat demo',
    logosLabel: 'Dipakai kreator dari',
    featLabel: 'Fitur',
    featTitle: 'Dibangun dari kebutuhan nyata kreator Indonesia',
    featSub: 'Bukan software kantoran yang dipaksakan untuk fotografer. FrameFlow dirancang sesuai cara kerja kamu — dari kontak pertama hingga bayar lunas.',
    features: [
      { title: 'Manajemen Lead', desc: 'Tidak ada lagi klien yang terlupakan di inbox. Lacak setiap prospek dari kontak pertama sampai deal ditutup — lengkap dengan status, reminder, dan jadwal sesi.', icon: '👥', wide: true },
      { title: 'Penawaran Profesional', desc: 'Buat PDF penawaran berbranding yang bikin klien terkesan — dalam hitungan menit, bukan jam.', icon: '📄', wide: false },
      { title: 'Invoice Tanpa Ribet', desc: 'Ubah penawaran jadi invoice dalam satu klik. Pantau mana yang belum bayar, terlambat, atau sudah lunas — tanpa spreadsheet.', icon: '💸', wide: false },
      { title: 'Follow-up Otomatis', desc: 'Jangan kehilangan deal hanya karena lupa follow-up. Template pesan WA sudah siap, tinggal kirim satu klik.', icon: '💬', wide: false },
      { title: 'Dashboard Bisnis', desc: 'Pantau kesehatan bisnis kamu sekilas — pipeline aktif, tingkat konversi, hingga pendapatan bulan ini, semua dalam satu layar.', icon: '📊', wide: false },
    ],
    testiLabel: 'Dari pengguna kami',
    testiTitle: 'Kata mereka yang sudah pakai FrameFlow',
    testimonials: [
      { text: '"Dulu leads nyebar di mana-mana — chat, Notes, Excel. Sekarang semua masuk FrameFlow, dan aku bisa fokus ke hal yang memang aku suka."', name: 'Arya Ramadhan', role: 'Wedding Photographer · Jakarta', initials: 'AR' },
      { text: '"Bikin penawaran yang tadinya ribet banget, sekarang 5 menit sudah jadi PDF rapi dan langsung bisa dikirim. Klienku langsung notice perbedaannya."', name: 'Dina Sari', role: 'Videografer · Bandung', initials: 'DS' },
      { text: '"Senang banget ada platform yang memang dibikin buat fotografer Indonesia. Terasa beda dibanding pakai tools luar yang kurang relevan sama cara kerja kita."', name: 'Rico Kurniawan', role: 'Fotografer & Content Creator · Bali', initials: 'RK' },
    ],
    pricingLabel: 'Harga', pricingTitle: 'Harga yang jujur, fitur yang berguna',
    pricingSub: 'Mulai gratis selama kamu explore. Upgrade ke Pro kalau bisnis sudah mulai serius. Tidak ada kontrak.',
    starterName: 'Starter', starterPrice: 'Gratis', starterPeriod: 'Selamanya · tidak perlu kartu kredit',
    starterFeatures: ['Hingga 10 leads aktif', 'Penawaran & invoice dasar', '1 profil bisnis', 'Follow-up via WhatsApp'],
    starterFeaturesOff: ['PDF branding kustom', 'Analitik & laporan bisnis'],
    starterBtn: 'Mulai Gratis →',
    proName: 'Pro', proPrice: 'Rp 99.000', proPeriod: '/bulan · tanpa kontrak panjang',
    proFeatures: ['Leads & klien tak terbatas', 'PDF berbranding kustom', 'Tanda tangan digital', 'Analitik & laporan bisnis lengkap', 'Database klien penuh', 'Prioritas support'],
    proBtn: 'Coba Gratis 14 Hari →', proBadge: '✦ PALING POPULER',
    ctaBadge: '✦ Gratis 14 hari · tanpa kartu kredit',
    ctaTitle: 'Bisnis kamu layak dikelola', ctaTitleHl: 'dengan lebih baik.',
    ctaSub: 'Bergabung bersama fotografer dan videografer Indonesia yang sudah mengelola klien, penawaran, dan invoice mereka dengan lebih rapi.',
    ctaBtn: 'Mulai gratis sekarang →',
    footerTagline: 'Dari lead pertama hingga pembayaran lunas — FrameFlow mengurus semua administrasi bisnis kreatif kamu.',
    footerProduct: 'Produk', footerCompany: 'Perusahaan', footerLegal: 'Legal',
    footerCopyright: '© 2026 FrameFlow. All rights reserved.',
    footerLove: 'Dibuat dengan ♥ untuk kreator Indonesia',
    linkFeatures: 'Fitur', linkPricing: 'Harga', linkChangelog: 'Changelog',
    linkAbout: 'Tentang', linkBlog: 'Blog', linkCareer: 'Karir',
    linkPrivacy: 'Privasi', linkTerms: 'Syarat & Ketentuan',
  },
  en: {
    navFeatures: 'Features', navPricing: 'Pricing', navAbout: 'About', navBlog: 'Blog',
    navCta: 'Get Started Free →',
    heroBadge: 'Built for photographers & videographers in Indonesia',
    heroTitle: 'From first lead to final payment,',
    heroTitleGrad: 'FrameFlow handles everything.',
    heroSub: 'FrameFlow helps you manage leads, send professional proposals, and invoice clients — without the admin headache.',
    heroBtn1: 'Start free for 14 days →', heroBtn2: 'Watch demo',
    logosLabel: 'Used by creators from',
    featLabel: 'Features',
    featTitle: 'Built from the real needs of Indonesian creators',
    featSub: 'Not office software forced onto photographers. FrameFlow is designed around how you actually work — from first contact to final payment.',
    features: [
      { title: 'Lead Management', desc: 'No more clients lost in your inbox. Track every prospect from first contact to closed deal — with status updates, reminders, and session schedules.', icon: '👥', wide: true },
      { title: 'Professional Proposals', desc: 'Create branded proposal PDFs that impress clients — in minutes, not hours.', icon: '📄', wide: false },
      { title: 'Hassle-Free Invoicing', desc: "Convert proposals to invoices in one click. Track what's unpaid, overdue, or settled — no spreadsheets needed.", icon: '💸', wide: false },
      { title: 'Automated Follow-ups', desc: "Don't lose a deal just because you forgot to follow up. WhatsApp message templates are ready — send in one click.", icon: '💬', wide: false },
      { title: 'Business Dashboard', desc: 'Monitor your business health at a glance — active pipeline, conversion rates, and monthly revenue, all on one screen.', icon: '📊', wide: false },
    ],
    testiLabel: 'From our users',
    testiTitle: 'What FrameFlow users are saying',
    testimonials: [
      { text: "\"My leads used to be scattered everywhere — chat, Notes, Excel. Now everything's in FrameFlow, and I can focus on what I actually love.\"", name: 'Arya Ramadhan', role: 'Wedding Photographer · Jakarta', initials: 'AR' },
      { text: '"Proposals that used to take forever are now a clean PDF in 5 minutes, ready to send. My clients immediately noticed the difference."', name: 'Dina Sari', role: 'Videographer · Bandung', initials: 'DS' },
      { text: "\"So glad there's a platform actually built for Indonesian photographers. It feels completely different from foreign tools that don't fit how we work.\"", name: 'Rico Kurniawan', role: 'Photographer & Content Creator · Bali', initials: 'RK' },
    ],
    pricingLabel: 'Pricing', pricingTitle: "Honest pricing, features you'll actually use",
    pricingSub: 'Start free while you explore. Upgrade to Pro when your business gets serious. No contracts.',
    starterName: 'Starter', starterPrice: 'Free', starterPeriod: 'Forever · no credit card needed',
    starterFeatures: ['Up to 10 active leads', 'Basic proposals & invoices', '1 business profile', 'WhatsApp follow-ups'],
    starterFeaturesOff: ['Custom branded PDF', 'Analytics & business reports'],
    starterBtn: 'Start Free →',
    proName: 'Pro', proPrice: 'Rp 99.000', proPeriod: '/month · no long-term contract',
    proFeatures: ['Unlimited leads & clients', 'Custom branded PDFs', 'Digital signature', 'Full analytics & business reports', 'Full client database', 'Priority support'],
    proBtn: 'Try Free for 14 Days →', proBadge: '✦ MOST POPULAR',
    ctaBadge: '✦ Free 14 days · no credit card',
    ctaTitle: 'Your business deserves to be run', ctaTitleHl: 'properly.',
    ctaSub: 'Join photographers and videographers across Indonesia who are managing clients, proposals, and invoices more professionally.',
    ctaBtn: 'Start free now →',
    footerTagline: 'From your first lead to your final payment — FrameFlow handles every part of running your creative business.',
    footerProduct: 'Product', footerCompany: 'Company', footerLegal: 'Legal',
    footerCopyright: '© 2026 FrameFlow. All rights reserved.',
    footerLove: 'Made with ♥ for Indonesian creators',
    linkFeatures: 'Features', linkPricing: 'Pricing', linkChangelog: 'Changelog',
    linkAbout: 'About', linkBlog: 'Blog', linkCareer: 'Careers',
    linkPrivacy: 'Privacy', linkTerms: 'Terms & Conditions',
  },
}

const featureBorderColors = [
  'rgba(212,168,75,0.2)',
  'rgba(61,40,85,0.5)',
  'rgba(46,64,16,0.5)',
  'rgba(92,58,0,0.5)',
  'rgba(85,25,42,0.5)',
]
const featureIconBgs = [
  'rgba(212,168,75,0.12)',
  '#3D2855',
  '#2E4010',
  '#5C3A00',
  '#55192A',
]

const previewHeroStats = [
  { icon: DollarSign, bg: '#BFEAF3', iconColor: '#0E4F63', value: 'Rp 8,4jt', label: 'Pipeline Value', sub: 'Active opportunities' },
  { icon: Trophy, bg: '#DDEFCB', iconColor: '#2D5016', value: '5', label: 'Won Deals', sub: '62% conversion rate' },
  { icon: AlertCircle, bg: '#FEF9C3', iconColor: '#713F12', value: 'Rp 2,1jt', label: 'Unpaid Invoices', sub: '2 overdue' },
]

const previewMetricStats = [
  { icon: Zap, value: '12', label: 'Total Leads' },
  { icon: FileText, value: '7', label: 'Quotations' },
  { icon: Bell, value: '3', label: 'Follow-ups Today' },
  { icon: Calendar, value: '2', label: 'Shoots This Week' },
  { icon: TrendingUp, value: '62%', label: 'Conversion Rate' },
  { icon: AlertCircle, value: '2', label: 'Overdue' },
]

const previewPipelineStages = [
  { stage: 'New', count: 3, width: 60, color: '#CBD5E1' },
  { stage: 'Contacted', count: 4, width: 80, color: '#BFEAF3' },
  { stage: 'Quoted', count: 2, width: 40, color: '#93C5FD' },
  { stage: 'Follow Up', count: 3, width: 60, color: '#F6E57A' },
  { stage: 'Won', count: 5, width: 100, color: '#DDEFCB' },
]

const previewLeads = [
  { name: 'Sarah', meta: 'Pre-wedding · 12 May', status: 'Quoted', tone: 'lav' },
  { name: 'Budi & Ani', meta: 'Wedding · 16 May', status: 'Won', tone: 'lime' },
  { name: 'PT Maju', meta: 'Product Shoot · 18 May', status: 'Follow-up', tone: 'amb' },
]

const previewQuotes = [
  { title: 'Wedding Full Day', meta: 'QF-2026-012 · Rp 7,8jt', status: 'Draft', tone: 'slate' },
  { title: 'Corporate Profile', meta: 'QF-2026-011 · Rp 4,2jt', status: 'Accepted', tone: 'lime' },
  { title: 'Engagement Session', meta: 'QF-2026-010 · Rp 2,6jt', status: 'Sent', tone: 'amb' },
]

const previewInvoices = [
  { title: 'Wedding Full Day', meta: 'INV-2026-021 · Rp 3,9jt', status: 'Sent', tone: 'blue' },
  { title: 'Corporate Profile', meta: 'INV-2026-020 · Rp 4,2jt', status: 'Paid', tone: 'lime' },
  { title: 'Engagement Session', meta: 'INV-2026-019 · Rp 1,3jt', status: 'Overdue', tone: 'rose' },
]

const previewSidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Leads', icon: Users },
  { label: 'Quotations', icon: FileText },
  { label: 'Follow-ups', icon: Bell },
  { label: 'Clients', icon: UserRound },
  { label: 'Invoices', icon: Receipt },
  { label: 'Calendar', icon: Calendar },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

export default function Home() {
  const [lang, setLang] = useLanguage()
  const tx = t[lang]

  return (
    <div style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav className="lp-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="lp-nav-inner" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px', maxWidth: 1280, margin: '0 auto', gap: 24,
        }}>
          <div className="lp-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${AMBER2}, ${ROSE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" />
            </div>
            FrameFlow
          </div>
          <div className="lp-nav-links hidden md:flex" style={{ gap: 32 }}>
            {[tx.navFeatures, tx.navPricing, tx.navAbout, tx.navBlog].map(label => (
              <a key={label} href="#" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <div className="lp-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <LanguageToggle lang={lang} onLangChange={setLang} />
            <Link href="/signup" className="lp-nav-cta" style={{
              background: 'var(--text-primary)', color: 'var(--app-bg)',
              border: 'none', borderRadius: 24,
              padding: '10px 22px', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              <span className="lp-nav-cta-full">{tx.navCta}</span>
              <span className="lp-nav-cta-short">{lang === 'id' ? 'Coba Gratis' : 'Get Started'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero-grid" style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 108, paddingBottom: 0, paddingLeft: 24, paddingRight: 24,
      }}>
        <div className="lp-blob1" />
        <div className="lp-blob2" />

        {/* Badge */}
        <div className="lp-hero-badge" style={{
          position: 'relative', zIndex: 1,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(212,168,75,0.1)', border: '1px solid rgba(212,168,75,0.25)',
          borderRadius: 99, padding: '6px 16px', marginBottom: 28,
          fontSize: 13, fontWeight: 600, color: AMBER,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: AMBER, display: 'inline-block' }} />
          {tx.heroBadge}
        </div>

        {/* Headline */}
        <h1 style={{
          position: 'relative', zIndex: 1,
          fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, lineHeight: 1.15,
          letterSpacing: '-1.2px', textAlign: 'center',
          maxWidth: 900, marginBottom: 22,
        }}>
          {tx.heroTitle}<br />
          <span style={{ background: `linear-gradient(90deg, ${AMBER2}, ${ROSE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {tx.heroTitleGrad}
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          position: 'relative', zIndex: 1,
          fontSize: 17, fontWeight: 400, lineHeight: 1.75,
          color: 'var(--text-secondary)', textAlign: 'center',
          maxWidth: 510, marginBottom: 40,
        }}>
          {tx.heroSub}
        </p>

        {/* CTAs */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, marginBottom: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            background: 'var(--text-primary)', color: 'var(--app-bg)',
            border: 'none', borderRadius: 12,
            padding: '12px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {tx.heroBtn1}
          </Link>
          <Link href="/dashboard" style={{
            background: 'transparent', border: '1px solid rgba(128,100,60,0.3)',
            color: 'var(--text-primary)', borderRadius: 12,
            padding: '12px 28px', fontSize: 14, fontWeight: 500, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            ▶ {tx.heroBtn2}
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div className="lp-dash-wrap" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1080 }}>
        <div className="lp-dash" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1080 }}>
          <div className="lp-dm-bar">
            <span className="lp-dot lp-dot-r" /><span className="lp-dot lp-dot-y" /><span className="lp-dot lp-dot-g" />
            <div className="lp-dm-url">app.frameflow.id/dashboard</div>
          </div>
          <div className="lp-dm-body">
            {/* Sidebar */}
            <div className="lp-sidebar">
              <div className="lp-sb-brand">
                <div className="lp-sb-brand-ico">⚡</div>
                <div><div className="lp-sb-brand-name">Frameflow</div><div className="lp-sb-brand-sub">Creative Studio</div></div>
              </div>
              {previewSidebarItems.map(({ label, icon: Icon, active }) => (
                <div key={label} className={`lp-sb-item${active ? ' on' : ''}`}>
                  <Icon className="lp-sb-icon" size={12} strokeWidth={2} />
                  {label}
                </div>
              ))}
              <div className="lp-sb-spacer" />
              <div className="lp-sb-user">
                <div className="lp-sb-avatar">R</div>
                <div className="lp-sb-uname">reandysetiawan1</div>
              </div>
            </div>

            {/* Main */}
            <div className="lp-dm-main">
              <div className="lp-dm-topbar">
                <div>
                  <div className="lp-dm-title">Dashboard</div>
                  <div className="lp-dm-sub">Welcome back to FrameFlow. Here&apos;s your business summary.</div>
                </div>
                <div className="lp-dm-topbar-right">
                  <div className="lp-dm-icon-btn"><Moon size={11} strokeWidth={2} /></div>
                  <div className="lp-dm-icon-btn"><Bell size={11} strokeWidth={2} /></div>
                  <div className="lp-dm-lang"><span className="on">ID</span><span className="off">EN</span></div>
                </div>
              </div>

              <div className="lp-qa-row">
                <div className="lp-qa dk">+ New Lead</div>
                <div className="lp-qa lav">+ New Quote</div>
                <div className="lp-qa lime">+ New Invoice</div>
                <div className="lp-qa amb">Follow-up</div>
                <div className="lp-qa gray">Calendar</div>
                <div className="lp-qa gray">Reports</div>
              </div>

              <div className="lp-stats">
                {previewHeroStats.map(({ icon: Icon, bg, iconColor, value, label, sub }) => (
                  <div key={label} className="lp-sc">
                    <div className="lp-sc-ico" style={{ background: bg }}>
                      <Icon size={15} strokeWidth={2} style={{ color: iconColor }} />
                    </div>
                    <div className="lp-sc-val">{value}</div>
                    <div className="lp-sc-lbl">{label}</div>
                    <div className="lp-sc-sub">{sub}</div>
                  </div>
                ))}
              </div>

              <div className="lp-metrics">
                {previewMetricStats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="lp-mc">
                    <div className="lp-mc-ico"><Icon size={11} strokeWidth={2} /></div>
                    <div className="lp-mc-val">{value}</div>
                    <div className="lp-mc-lbl">{label}</div>
                  </div>
                ))}
              </div>

              <div className="lp-dashboard-grid">
                <div className="lp-bc">
                  <div className="lp-bc-hdr">
                    <div className="lp-bc-title">Pipeline</div>
                    <div className="lp-bc-icon"><BarChart3 size={10} strokeWidth={2} /></div>
                  </div>
                  <div className="lp-stage-list">
                    {previewPipelineStages.map((stage) => (
                      <div key={stage.stage} className="lp-stage-item">
                        <div className="lp-stage-head">
                          <span className="lp-pi-lbl">{stage.stage}</span>
                          <span className="lp-pi-val">{stage.count}</span>
                        </div>
                        <div className="lp-stage-track">
                          <div className="lp-stage-fill" style={{ width: `${stage.width}%`, backgroundColor: stage.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lp-bc">
                  <div className="lp-bc-hdr"><div className="lp-bc-title">Recent Leads</div><div className="lp-bc-link">View all →</div></div>
                  {previewLeads.map((item) => (
                    <div key={item.name} className="lp-preview-row">
                      <div>
                        <div className="lp-preview-title">{item.name}</div>
                        <div className="lp-preview-meta">{item.meta}</div>
                      </div>
                      <span className={`lp-tag lp-tag-${item.tone}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-bc">
                  <div className="lp-bc-hdr"><div className="lp-bc-title">Recent Quotations</div><div className="lp-bc-link">View all →</div></div>
                  {previewQuotes.map((item) => (
                    <div key={item.title} className="lp-preview-row">
                      <div>
                        <div className="lp-preview-title">{item.title}</div>
                        <div className="lp-preview-meta">{item.meta}</div>
                      </div>
                      <span className={`lp-tag lp-tag-${item.tone}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-bc">
                  <div className="lp-bc-hdr"><div className="lp-bc-title">Recent Invoices</div><div className="lp-bc-link">View all →</div></div>
                  {previewInvoices.map((item) => (
                    <div key={item.title} className="lp-preview-row">
                      <div>
                        <div className="lp-preview-title">{item.title}</div>
                        <div className="lp-preview-meta">{item.meta}</div>
                      </div>
                      <span className={`lp-tag lp-tag-${item.tone}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── LOGOS BAR ── */}
      <div className="lp-logos-bar" style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
        padding: '28px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {tx.logosLabel}
        </div>
        <div className="lp-logos-cities" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['📷 Jakarta','🎬 Bandung','🖼️ Surabaya','✨ Bali','🎞️ Yogyakarta','🌟 Medan'].map(c => (
            <span key={c} style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.7 }}>{c}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-section" style={{ background: 'var(--app-bg)', padding: '96px 48px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: AMBER, marginBottom: 12 }}>{tx.featLabel}</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, maxWidth: 540, marginBottom: 14 }}>{tx.featTitle}</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 52, lineHeight: 1.7 }}>{tx.featSub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="lp-bento">
            {tx.features.map((f, i) => (
              <div key={f.title} className="lp-feature-card" style={{
                background: 'var(--card-bg)',
                border: `1px solid ${featureBorderColors[i]}`,
                borderRadius: 18, padding: 26, position: 'relative', overflow: 'hidden',
                gridColumn: f.wide ? 'span 2' : 'span 1',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: featureIconBgs[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</div>
                {f.wide && (
                  <div className="lp-pipe-mini">
                    <div className="lp-pm-col"><div className="lp-pm-lbl">New</div><div className="lp-pm-item">Sarah W.</div><div className="lp-pm-item">Tono K.</div></div>
                    <div className="lp-pm-col"><div className="lp-pm-lbl">Proposal</div><div className="lp-pm-item">Rina S.</div></div>
                    <div className="lp-pm-col"><div className="lp-pm-lbl">Deal ✓</div><div className="lp-pm-item won">Budi A.</div><div className="lp-pm-item won">Dewi L.</div></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section" style={{ background: 'var(--card-bg)', padding: '96px 48px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: AMBER, marginBottom: 12 }}>{tx.testiLabel}</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, maxWidth: 540, marginBottom: 48 }}>{tx.testiTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="lp-testi-grid">
            {tx.testimonials.map(t => (
              <div key={t.name} style={{ background: 'var(--app-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 22 }}>
                <div style={{ color: AMBER2, fontSize: 13, marginBottom: 10 }}>★★★★★</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${AMBER2}, ${ROSE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#120F0C', flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section" style={{ background: 'var(--app-bg)', padding: '96px 48px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: AMBER, marginBottom: 12 }}>{tx.pricingLabel}</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 14 }}>{tx.pricingTitle}</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.7 }}>{tx.pricingSub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, textAlign: 'left' }} className="lp-pricing-grid">
            {/* Starter */}
            <div style={{ borderRadius: 22, padding: 34, border: '1.5px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>{tx.starterName}</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 4 }}>{tx.starterPrice}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 26 }}>{tx.starterPeriod}</div>
              <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                {tx.starterFeatures.map(f => (
                  <li key={f} style={{ fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: AMBER }}>✓</span> {f}
                  </li>
                ))}
                {tx.starterFeaturesOff.map(f => (
                  <li key={f} style={{ fontSize: 14, color: 'var(--text-secondary)', padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--border-color)' }}>✗</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, textAlign: 'center', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', background: 'transparent', textDecoration: 'none' }}>
                {tx.starterBtn}
              </Link>
            </div>

            {/* Pro */}
            <div style={{ borderRadius: 22, padding: 34, border: `1.5px solid ${AMBER}55`, background: 'var(--card-bg)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: AMBER }}>
                {tx.proBadge}
              </span>
              <div style={{ fontSize: 13, fontWeight: 700, color: AMBER, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>{tx.proName}</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 4 }}>{tx.proPrice}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 26 }}>{tx.proPeriod}</div>
              <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                {tx.proFeatures.map(f => (
                  <li key={f} style={{ fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: AMBER }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, textAlign: 'center', background: AMBER, color: '#120F0C', textDecoration: 'none', border: 'none' }}>
                {tx.proBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section" style={{ background: 'var(--card-bg)', padding: '112px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,168,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 22, background: 'rgba(170,219,106,0.1)', border: '1px solid rgba(170,219,106,0.25)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#AADB6A' }}>
          {tx.ctaBadge}
        </div>
        <h2 style={{ position: 'relative', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.15 }}>
          {tx.ctaTitle}<br />
          <span style={{ color: AMBER }}>{tx.ctaTitleHl}</span>
        </h2>
        <p style={{ position: 'relative', fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          {tx.ctaSub}
        </p>
        <Link href="/signup" style={{ position: 'relative', display: 'inline-block', background: 'var(--text-primary)', color: 'var(--app-bg)', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          {tx.ctaBtn}
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer-wrap" style={{ background: 'var(--app-bg)', padding: '52px 48px 28px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 36 }}>
            <div style={{ maxWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${AMBER2}, ${ROSE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>FrameFlow</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tx.footerTagline}</p>
            </div>
            {[
              { title: tx.footerProduct, links: [[tx.linkFeatures,'#'],[tx.linkPricing,'#'],[tx.linkChangelog,'#']] },
              { title: tx.footerCompany, links: [[tx.linkAbout,'#'],[tx.linkBlog,'#'],[tx.linkCareer,'#']] },
              { title: tx.footerLegal,   links: [[tx.linkPrivacy,'#'],[tx.linkTerms,'#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 14 }}>{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 9 }}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 22, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>{tx.footerCopyright}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
