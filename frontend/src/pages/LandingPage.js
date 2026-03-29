import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Video, Users, Zap, Shield, Globe, ArrowRight,
  Check, Star, Menu, X, Play, Link2, Bell, BarChart2, Layers, Code,
  RefreshCw, Lock, ChevronRight
} from 'lucide-react';

/* ─── colour tokens (strict b&w) ─────────────── */
const C = {
  bg:        '#ffffff',
  bgSoft:    '#f8f8f8',
  bgMuted:   '#f0f0f0',
  border:    '#e0e0e0',
  border2:   '#cccccc',
  text:      '#0a0a0a',
  text2:     '#404040',
  text3:     '#707070',
  text4:     '#a0a0a0',
  text5:     '#d0d0d0',
  black:     '#0a0a0a',
  white:     '#ffffff',
};

/* ─── Navbar ─────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled ? 'rgba(255,255,255,0.96)' : '#ffffff',
      borderBottom: `1px solid ${scrolled ? C.border : C.border}`,
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'all 250ms',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.black, letterSpacing: '-0.3px' }}>Cal.clone</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Product','Pricing','Enterprise','Blog'].map(item => (
            <a key={item} href="#" style={{ fontSize: 14, color: C.text3, fontWeight: 500 }}>{item}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/dashboard/event-types" style={{ fontSize: 14, fontWeight: 500, color: C.text2, padding: '8px 14px' }}>
            Sign in
          </Link>
          <Link to="/dashboard/event-types" style={{
            fontSize: 14, fontWeight: 600, color: C.white,
            padding: '9px 20px', backgroundColor: C.black, borderRadius: 8,
          }}>
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────── */
function Hero() {
  return (
    <section style={{ backgroundColor: C.bg, paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, border: `1px solid ${C.border}`, backgroundColor: C.bgSoft, marginBottom: 32, fontSize: 13, color: C.text3, fontWeight: 500 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.black }} />
          The open-source scheduling infrastructure
        </div>

        <h1 style={{ fontSize: 'clamp(40px,8vw,76px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2.5px', color: C.black, marginBottom: 24 }}>
          You had me at<br />"scheduling"
        </h1>

        <p style={{ fontSize: 19, color: C.text3, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px', fontWeight: 400 }}>
          The open-source scheduling tool that helps you schedule more, stress less.
          Meet less. Get more done.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/dashboard/event-types" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 9,
            backgroundColor: C.black, color: C.white,
            fontSize: 15, fontWeight: 600,
          }}>
            Get started for free <ArrowRight size={15} />
          </Link>
          <a href="#demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 9,
            border: `1px solid ${C.border}`, color: C.text2,
            fontSize: 15, fontWeight: 500,
          }}>
            <Play size={14} /> Watch demo
          </a>
        </div>

        <p style={{ marginTop: 18, fontSize: 13, color: C.text5 }}>
          No credit card required · Free plan available
        </p>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div style={{ marginTop: 72, maxWidth: 860, margin: '72px auto 0', position: 'relative' }}>
      <div style={{ backgroundColor: '#f8f8f8', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.12)' }}>
        {/* Browser bar */}
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.white }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#d0d0d0','#d0d0d0','#d0d0d0'].map((c,i) => <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c }} />)}
          </div>
          <div style={{ flex: 1, backgroundColor: C.bgSoft, borderRadius: 5, padding: '4px 12px', fontSize: 12, color: C.text4, marginLeft: 8, border: `1px solid ${C.border}` }}>
            cal.clone/alex
          </div>
        </div>
        {/* App layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', minHeight: 340 }}>
          {/* Sidebar */}
          <div style={{ backgroundColor: C.white, borderRight: `1px solid ${C.border}`, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={12} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.black }}>Cal.clone</span>
            </div>
            {['Event types','Bookings','Availability','Settings'].map((item,i) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 6, marginBottom: 2, backgroundColor: i===0 ? C.bgMuted : 'transparent', color: i===0 ? C.black : C.text4, fontSize: 13, fontWeight: i===0?600:400 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: i===0?C.border:C.bgMuted }} />
                {item}
              </div>
            ))}
          </div>
          {/* Content */}
          <div style={{ padding: 22, backgroundColor: C.bgSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.black, marginBottom: 3 }}>Event Types</div>
                <div style={{ fontSize: 12, color: C.text4 }}>Configure events for people to book</div>
              </div>
              <div style={{ padding: '6px 14px', backgroundColor: C.black, borderRadius: 6, fontSize: 12, color: C.white, fontWeight: 600 }}>+ New</div>
            </div>
            {[
              { title: '30 min meeting',        slug: '/alex/30min' },
              { title: '15 min quick chat',     slug: '/alex/15min' },
              { title: '60 min strategy call',  slug: '/alex/60min' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8, backgroundColor: C.white }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: C.border2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.black }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: C.text4, marginTop: 1 }}>{item.slug}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 34, height: 19, borderRadius: 10, backgroundColor: C.black, position: 'relative' }}>
                    <div style={{ position: 'absolute', right: 2, top: 2, width: 15, height: 15, borderRadius: '50%', backgroundColor: C.white }} />
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: C.bgMuted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link2 size={11} color={C.text4} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logos ──────────────────────────────────── */
function Logos() {
  const companies = ['Vercel','Stripe','Shopify','GitHub','Notion','Linear','Figma','Loom'];
  return (
    <section style={{ padding: '44px 24px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.text5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 22 }}>
          Trusted by teams at
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 40px' }}>
          {companies.map(c => <span key={c} style={{ fontSize: 15, fontWeight: 700, color: C.text5, letterSpacing: '-0.3px' }}>{c}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────── */
function Features() {
  const items = [
    { icon: Calendar,  title: 'Smart scheduling',    desc: 'Automatically detects conflicts and suggests the best times based on your real availability.' },
    { icon: Globe,     title: 'Works globally',      desc: 'Timezone-aware scheduling that shows your calendar in the invitee\'s local time. No confusion.' },
    { icon: Video,     title: 'Video conferencing',  desc: 'Integrates with Zoom, Google Meet, Microsoft Teams, and more. Meeting links created automatically.' },
    { icon: Bell,      title: 'Smart reminders',     desc: 'Automated email reminders sent to both parties. Reduce no-shows significantly.' },
    { icon: BarChart2, title: 'Analytics',           desc: 'Understand your scheduling patterns. See peak booking times and team utilization.' },
    { icon: Code,      title: 'Developer friendly',  desc: 'Open-source and fully customizable. REST API, webhooks, and embeddable widgets.' },
    { icon: Lock,      title: 'Privacy first',       desc: 'GDPR compliant. Your data is yours. Self-host on your own infrastructure.' },
    { icon: RefreshCw, title: 'Rescheduling',        desc: 'One-click rescheduling from any confirmation email. Buffers and limits handled automatically.' },
  ];
  return (
    <section style={{ padding: '96px 24px', backgroundColor: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>
            Features
          </div>
          <h2 style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, letterSpacing: '-1.5px', color: C.black, lineHeight: 1.1, marginBottom: 14 }}>
            Everything you need to schedule better
          </h2>
          <p style={{ fontSize: 17, color: C.text3, maxWidth: 500, margin: '0 auto' }}>
            Powerful features that make scheduling effortless for both you and the people booking with you.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: 28, backgroundColor: C.white, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, transition: 'background-color 180ms', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bgSoft}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.white}
            >
              <div style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: C.bgMuted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={17} color={C.text2} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.black, marginBottom: 7 }}>{title}</h3>
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Connect your calendar',  desc: 'Link your Google, Outlook or Apple calendar. Cal.clone checks your real-time availability automatically.', icon: Calendar },
    { num: '02', title: 'Create event types',      desc: 'Set up different meeting types — 15-min calls, 30-min demos, 1-hour strategy sessions.', icon: Layers },
    { num: '03', title: 'Share your link',         desc: 'Get a personalized booking page. Share it anywhere — email, LinkedIn, your website.', icon: Link2 },
    { num: '04', title: 'People book time',        desc: 'Invitees pick a time that works for them. You get a confirmation — zero back-and-forth.', icon: Check },
  ];
  return (
    <section style={{ padding: '96px 24px', backgroundColor: C.bgSoft, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, letterSpacing: '-1.5px', color: C.black, marginBottom: 14 }}>
            Up and running in minutes
          </h2>
          <p style={{ fontSize: 17, color: C.text3, maxWidth: 460, margin: '0 auto' }}>
            Four simple steps from sign-up to your first booking.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
          {steps.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} style={{ textAlign: 'center', padding: '28px 18px', backgroundColor: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', position: 'relative' }}>
                <Icon size={20} color="#fff" />
                <div style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', backgroundColor: C.bgMuted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.black }}>{num.slice(1)}</div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.black, marginBottom: 9 }}>{title}</h3>
              <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────── */
function Pricing() {
  const plans = [
    { name: 'Free',  price: '$0',   period: 'forever',        desc: 'Perfect for individuals getting started.', highlight: false,
      features: ['Unlimited event types','1 calendar connection','Booking page','Email notifications','Cal.clone branding'], cta: 'Get started free' },
    { name: 'Pro',   price: '$12',  period: '/month',         desc: 'For professionals who need more power.',   highlight: true,
      features: ['Everything in Free','Remove branding','Custom questions','Buffer times','Analytics','Priority support'], cta: 'Start 14-day trial' },
    { name: 'Team',  price: '$15',  period: '/user/month',    desc: 'For teams that schedule together.',       highlight: false,
      features: ['Everything in Pro','Round-robin routing','Team analytics','SAML SSO','Custom domain'], cta: 'Start team trial' },
  ];
  return (
    <section style={{ padding: '96px 24px', backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, letterSpacing: '-1.5px', color: C.black, marginBottom: 14 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 17, color: C.text3 }}>Start free. Upgrade when you need more.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {plans.map(plan => (
            <div key={plan.name} style={{ padding: 30, borderRadius: 14, backgroundColor: plan.highlight ? C.black : C.white, border: `1px solid ${plan.highlight ? C.black : C.border}`, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '3px 14px', borderRadius: 20, backgroundColor: C.black, border: `1px solid #444`, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.highlight ? '#888' : C.text3, marginBottom: 7 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 7 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: plan.highlight ? C.white : C.black, letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: plan.highlight ? '#888' : C.text4 }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? '#888' : C.text3 }}>{plan.desc}</p>
              </div>
              <div style={{ flex: 1, marginBottom: 26 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: plan.highlight ? '#333' : C.bgMuted, border: `1px solid ${plan.highlight ? '#555' : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={9} color={plan.highlight ? C.white : C.text2} />
                    </div>
                    <span style={{ fontSize: 13, color: plan.highlight ? '#c8c8c8' : C.text2 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/event-types" style={{ display: 'block', textAlign: 'center', padding: '11px 20px', borderRadius: 8, backgroundColor: plan.highlight ? C.white : C.black, color: plan.highlight ? C.black : C.white, fontSize: 14, fontWeight: 600 }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────── */
function Testimonials() {
  const items = [
    { name: 'Sarah Chen',      role: 'Product Manager, Vercel',  av: 'SC', text: 'Cal.clone completely changed how I run discovery calls. I went from 2 hours of email back-and-forth per week to zero.' },
    { name: 'Marcus Williams', role: 'Founder, BuildFast',       av: 'MW', text: 'The best scheduling tool I\'ve ever used. Simple, fast, and never gets in the way. Our close rate improved after adding the booking link.' },
    { name: 'Priya Sharma',    role: 'VP Sales, TechCo',         av: 'PS', text: 'We switched our entire sales team. The round-robin feature alone saves us countless hours every week.' },
  ];
  return (
    <section style={{ padding: '96px 24px', backgroundColor: C.bgSoft, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, letterSpacing: '-1.5px', color: C.black, marginBottom: 14 }}>
            Loved by thousands
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            {Array(5).fill(0).map((_,i) => <Star key={i} size={16} color={C.black} fill={C.black} />)}
            <span style={{ fontSize: 13, color: C.text3, marginLeft: 8 }}>4.9 / 5 from 2,000+ reviews</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {items.map(t => (
            <div key={t.name} style={{ padding: 26, backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array(5).fill(0).map((_,i) => <Star key={i} size={13} color={C.black} fill={C.black} />)}
              </div>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.7, marginBottom: 18 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.white }}>{t.av}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.black }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.text4 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ padding: '96px 24px', backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: '64px 48px', borderRadius: 20, backgroundColor: C.black, position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: 'clamp(26px,5vw,42px)', fontWeight: 800, letterSpacing: '-1.5px', color: C.white, lineHeight: 1.1, marginBottom: 14 }}>
            Ready to schedule smarter?
          </h2>
          <p style={{ fontSize: 17, color: '#888', marginBottom: 36 }}>
            Join 50,000+ professionals who've simplified their scheduling.
          </p>
          <Link to="/dashboard/event-types" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 9, backgroundColor: C.white, color: C.black, fontSize: 15, fontWeight: 700 }}>
            Get started free <ArrowRight size={15} />
          </Link>
          <p style={{ marginTop: 14, fontSize: 13, color: '#555' }}>Free plan · No credit card needed</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────── */
function Footer() {
  const cols = [
    { title: 'Product',    links: ['Features','Pricing','Changelog','Roadmap','Status'] },
    { title: 'Developers', links: ['Documentation','API Reference','GitHub','Self-hosting','Webhooks'] },
    { title: 'Company',    links: ['About','Blog','Careers','Press','Contact'] },
    { title: 'Legal',      links: ['Privacy','Terms','Cookie Policy','GDPR','Security'] },
  ];
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '60px 24px 36px', backgroundColor: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4,1fr)', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.black }}>Cal.clone</span>
            </div>
            <p style={{ fontSize: 13, color: C.text4, lineHeight: 1.7, maxWidth: 200 }}>Open-source scheduling infrastructure for everyone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {['GitHub','Twitter','Discord'].map(s => (
                <a key={s} href="#" style={{ fontSize: 12, color: C.text4, padding: '5px 10px', border: `1px solid ${C.border}`, borderRadius: 6 }}>{s}</a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 11, fontWeight: 600, color: C.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{col.title}</h4>
              {col.links.map(link => (
                <a key={link} href="#" style={{ display: 'block', fontSize: 13, color: C.text4, marginBottom: 9 }}>{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 13, color: C.text5 }}>© 2025 Cal.clone. All rights reserved.</p>
          <p style={{ fontSize: 13, color: C.text5 }}>Built with ❤️ by the open-source community.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────── */
export default function LandingPage() {
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#0a0a0a';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0a0a0a' }}>
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
