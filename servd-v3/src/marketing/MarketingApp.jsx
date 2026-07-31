import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useScroll, useTransform } from "motion/react";

const CALENDLY_LINK = "https://calendly.com/pankaj_singh-servd/30min";
// wa.me links take the number with country code, digits only — no
// spaces, dashes, or leading "+". 778 is a Canadian (BC) area code, so
// country code 1.
const WHATSAPP_PREFILL = "Hi! I'm reaching out about Servd for my restaurant — I have a few questions. (servd.tech)";
const WHATSAPP_LINK = `https://wa.me/17782018181?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgogdjrb";
const DEMO_MENU_URL = "https://servd.tech/index_v3.html?table=5";
const REDUCED_MOTION_KEY = "servd_marketing_reduced_motion";

function qrImageUrl(url, size = 220) {
  const params = new URLSearchParams({
    size: `${size}x${size}`, data: url, color: "1A3626", bgcolor: "F3F1E8", qzone: "1", margin: "0",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

// Shared scroll-reveal wrapper — every section on this page uses this
// same in/out pattern so the motion feels like one coherent language
// rather than a different animation per section. MotionConfig upstream
// already collapses this to a simple opacity fade when reduced motion
// is active (OS setting or the in-page toggle), so nothing extra is
// needed here for that.
function Reveal({ children, delay = 0, y = 28, className = "", as = "div", ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

function Nav({ onOpenDemo, reducedMotion, onToggleReducedMotion }) {
  const { scrollY, scrollYProgress } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "#about", label: "About" },
    { href: "#demo", label: "See The Demo" },
    { href: "#features", label: "Features" },
    { href: "#owner", label: "Owner Dashboard" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="m-nav">
      <motion.div className="m-nav-bg" style={{ opacity: bgOpacity }} />
      <motion.div className="m-scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <div className="m-nav-inner">
        <a href="#top" className="m-wordmark">
          <span className="m-wordmark-mark" aria-hidden="true" />
          <span className="m-wordmark-text">Servd</span>
        </a>
        <nav className="m-nav-links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="m-nav-actions">
          <button
            type="button"
            className="m-motion-toggle"
            aria-pressed={reducedMotion}
            aria-label={reducedMotion ? "Reduced motion is on — click to re-enable animations" : "Animations are on — click to reduce motion"}
            title={reducedMotion ? "Reduced motion: on" : "Reduced motion: off"}
            onClick={onToggleReducedMotion}
          >
            {reducedMotion ? "⏸" : "▶"}
          </button>
          <button type="button" onClick={onOpenDemo} className="m-btn m-btn-primary m-nav-cta">
            Book a Live Demo
          </button>
          <button
            type="button"
            className="m-nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={menuOpen ? "is-open" : ""} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="m-nav-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <button type="button" className="m-btn m-btn-primary" onClick={() => { setMenuOpen(false); onOpenDemo(); }}>
              Book a Live Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function PhoneTicket() {
  const lines = [
    { name: "Hyderabadi Chicken Biryani", spice: "Hot", price: "$21.95" },
    { name: "Butter Chicken", spice: "Mild", price: "$19.95" },
    { name: "Garlic Naan × 2", spice: null, price: "$9.90" },
  ];
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setConfirmed((v) => !v), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="m-phone-mock-head">
        <span className="m-phone-mock-table">TABLE 5</span>
        <span className="m-phone-mock-guests">Alex &amp; Sam</span>
      </div>
      <ul className="m-phone-mock-lines">
        {lines.map((l) => (
          <li key={l.name}>
            <span>{l.name}{l.spice && <em>{l.spice}</em>}</span>
            <span className="m-phone-mock-price">{l.price}</span>
          </li>
        ))}
      </ul>
      <motion.div layout className={`m-phone-mock-status${confirmed ? " is-confirmed" : ""}`} transition={{ duration: 0.4, ease: "easeOut" }}>
        <motion.span
          className="m-phone-mock-dot"
          animate={confirmed ? { scale: 1 } : { scale: [1, 0.4, 1] }}
          transition={confirmed ? { duration: 0.3 } : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={confirmed ? "confirmed" : "pending"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {confirmed ? "Confirmed — sent to kitchen" : "Needs confirmation"}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// The "high-fidelity hero artwork" deliverable: a layered tablet
// (owner dashboard) + phone (customer ticket) composition, built as
// CSS/SVG rather than photography or a produced video — those need
// either real product photography or a video editing pass I can't
// author or verify from here. Scroll-linked parallax (tablet moves
// slower than the phone) is real motion, not decorative-only.
function DeviceMockup() {
  const stageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const tabletY = useTransform(scrollYProgress, [0, 1], [0, -26]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -64]);

  return (
    <div className="m-device-stack" ref={stageRef}>
      <motion.div className="m-tablet-mock" style={{ y: tabletY }} aria-hidden="true">
        <div className="m-tablet-mock-screen">
          <div className="m-tablet-mock-header"><span>Needs Review</span><span className="m-tablet-mock-count">2</span></div>
          <div className="m-tablet-mock-row"><span>Table 5</span><span className="m-tablet-mock-badge">Split by item</span></div>
          <div className="m-tablet-mock-row"><span>Table 9</span><span className="m-tablet-mock-badge">One bill</span></div>
          <div className="m-tablet-mock-header"><span>In Kitchen</span><span className="m-tablet-mock-count">1</span></div>
          <div className="m-tablet-mock-row"><span>Table 3</span><span className="m-tablet-mock-badge">Split equally</span></div>
        </div>
      </motion.div>
      <motion.div className="m-phone-mock" style={{ y: phoneY }}>
        <PhoneTicket />
      </motion.div>
    </div>
  );
}

function Hero({ onOpenDemo }) {
  const words = ["Guests order the moment they're ready.", "Not when a server finally is."];
  return (
    <header className="m-hero" id="top">
      <div className="m-wrap m-hero-grid">
        <div>
          <Reveal className="m-eyebrow" y={12}>The Menu &amp; Ordering Layer For Your Existing Setup</Reveal>
          <h1 className="m-hero-h1">
            {words.map((line, i) => (
              <motion.span
                key={line}
                className={`m-hero-word${i === 1 ? " is-accent" : ""}`}
                style={{ display: "block" }}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 * i }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <Reveal as="p" delay={0.3} className="m-hero-sub">
            No more sitting at a table waiting to flag someone down, and no more servers circling
            back three times just to ask if you're ready. Guests scan, browse the live menu, and
            order straight from their phone whenever they're ready — it lands with staff to confirm
            and send whenever they get a free moment. Works alongside your POS and payment system;
            Servd handles the menu and ordering, not the till.
          </Reveal>
          <Reveal delay={0.4} className="m-hero-ctas">
            <button type="button" onClick={onOpenDemo} className="m-btn m-btn-primary m-btn-lg">
              Book a Live Demo
            </button>
            <a href="#demo" className="m-btn m-btn-ghost m-btn-lg">See the full process ↓</a>
          </Reveal>
          <Reveal delay={0.48} as="p" className="m-hero-trust">
            Built for independent restaurants in <strong>Metro Vancouver, BC</strong> · No commissions, ever.
          </Reveal>
        </div>

        <Reveal delay={0.2} y={40} className="m-hero-visual">
          <DeviceMockup />
          <p className="m-hero-caption">A live-feeling mock of the real Servd product, not a screenshot.</p>
        </Reveal>
      </div>
    </header>
  );
}

// NOTE for whoever edits this next: the founder bio below is a first
// draft written to match the tone Pankaj asked for (developer + genuine
// stake in the problem), not a verified biography — no specific claims
// about years of experience, past employers, or education are made
// because none were confirmed. Replace the generic lines with real
// specifics whenever they're provided.
function AboutUs() {
  const provinces = [
    "British Columbia", "Alberta", "Saskatchewan", "Manitoba", "Ontario", "Quebec",
    "New Brunswick", "Nova Scotia", "Prince Edward Island", "Newfoundland & Labrador",
    "Yukon", "Northwest Territories", "Nunavut",
  ];

  return (
    <section id="about" className="m-section m-section-tint">
      <div className="m-wrap m-about-grid">
        <Reveal>
          <p className="m-eyebrow">About Servd</p>
          <h2>Built by someone who kept noticing the same thing.</h2>
          <p className="m-section-sub">
            I'm Pankaj Singh — the developer behind Servd, not a company that hired one. I kept
            seeing the same scene play out at restaurant after restaurant: a server stretched thin
            across a full floor, a table quietly waiting just to place an order, food written off at
            close because there was no fast way to mark it down while it still had buyers. That's not
            a big, abstract industry problem — it's a specific, fixable one, and fixing specific
            problems for real businesses is the kind of software I actually want to build. I write
            every line of Servd myself and test it against a real, live menu, not a demo dataset built
            to look good in a deck.
          </p>
          <p className="m-section-sub">
            Servd is built in Burnaby, British Columbia — but the problem isn't a Burnaby problem.
            A busy Friday shift and a walk-in cooler that doesn't sell itself down by close looks the
            same at an independent restaurant anywhere. That's who this is for.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="m-where-card">
          <h3>Where We Serve</h3>
          <div className="m-where-row">
            <span className="m-where-label">Headquartered</span>
            <span className="m-where-value">Burnaby, British Columbia, Canada</span>
          </div>
          <div className="m-where-row">
            <span className="m-where-label">Serving</span>
            <span className="m-where-value">Independent restaurants across Canada</span>
          </div>
          <div className="m-province-pills">
            {provinces.map((p) => <span className="m-province-pill" key={p}>{p}</span>)}
          </div>
          <div className="m-where-row">
            <span className="m-where-label">Expanding</span>
            <span className="m-where-value">United States, with a long-term vision of reaching independent restaurants everywhere</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// The full walkthrough, start to finish — scan through kitchen. This is
// the page's centerpiece "demo," so each step gets a real visual, not
// just a numbered paragraph: a small mockup chip showing exactly what
// changes on-screen at that point in the flow.
function DemoProcess() {
  const steps = [
    {
      icon: "📷",
      title: "Guest scans the code at the table",
      body: "One tap of their phone camera. No app to download, no account to create.",
      chip: (
        <div className="m-process-chip m-process-chip-qr">
          <img src={qrImageUrl(DEMO_MENU_URL, 72)} alt="Example branded QR code for Table 5" width={40} height={40} loading="lazy" />
          <span>Table 5's code</span>
        </div>
      ),
    },
    {
      icon: "🌐",
      title: "The live menu opens on their phone",
      body: "Straight into their browser, with the table already attached — nothing to type in.",
      chip: <div className="m-process-chip">servd.tech/order · Table 5</div>,
    },
    {
      icon: "📝",
      title: "They order, add their name, and choose how to split",
      body: "One bill for the table, split evenly, or split by what each person ordered — set once, and it applies to everyone who orders after them.",
      chip: (
        <div className="m-process-chip-row">
          <span className="m-process-pill">One bill</span>
          <span className="m-process-pill is-active">Split by item</span>
          <span className="m-process-pill">Split evenly</span>
        </div>
      ),
    },
    {
      icon: "👀",
      title: "It waits for staff, not the other way around",
      body: "No server has to notice the table or walk over to ask if you're ready — the order's already sitting there. Whoever's free confirms it, and can add something the guest asked for out loud or pull an item that's out of stock, before it goes back.",
      chip: <div className="m-process-chip m-process-chip-review">Needs Review · Table 5</div>,
    },
    {
      icon: "🍽️",
      title: "Confirmed, and it's in the kitchen",
      body: "One tap and it's sent, timestamped, and tagged with who confirmed it — payment still happens exactly how it does today, on your existing system.",
      chip: <div className="m-process-chip m-process-chip-confirmed">✓ Confirmed — In Kitchen</div>,
    },
  ];

  return (
    <section id="demo" className="m-section">
      <div className="m-wrap">
        <Reveal className="m-section-head">
          <p className="m-eyebrow">See The Full Process</p>
          <h2>From a scanned code to a confirmed kitchen ticket.</h2>
          <p className="m-section-sub">
            Five steps, start to finish — no app to install, and no changes to your POS or how
            guests pay. Servd adds the menu and ordering layer; everything else stays exactly as it
            is today.
          </p>
        </Reveal>

        <div className="m-process">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="m-process-step">
              <div className="m-process-marker">
                <span className="m-process-icon">{s.icon}</span>
                {i < steps.length - 1 && <span className="m-process-line" />}
              </div>
              <div className="m-process-content">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.chip}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "🚫", title: "Mark Items Sold Out, Instantly", body: "No more \"actually, we're out of that\" after the order's already in. Flip a switch and it disappears from every phone at every table, live." },
    { icon: "🏷", title: "Markdown Items Before They're Wasted", body: "Running low toward close? Drop the price on what's left right from the dashboard — sell it at a discount instead of throwing it out." },
    { icon: "✓", title: "Staff Confirm When They're Free", body: "Guests order the moment they're ready. It waits for a staff member instead of a staff member having to notice the table." },
    { icon: "🌶", title: "Spice & Variant Selector", body: "Mild, Medium, Hot, Extra Hot per dish, with optional price bumps — upsells happen automatically." },
    { icon: "👥", title: "Per-Guest Order Tracking", body: "Know exactly who ordered what, even when the whole table scanned the same QR code." },
    { icon: "🧾", title: "Flexible Split Billing", body: "Together, split evenly, or split per person — chosen in one tap, no table-side math." },
    { icon: "📋", title: "Live Menu Editing", body: "Update descriptions, prices, and photos any time — changes show up on the customer menu immediately, no reprinting." },
    { icon: "▦", title: "Branded QR Generator", body: "Generate a table-ready QR code right from the owner dashboard — no separate tool needed." },
  ];
  return (
    <section id="features" className="m-section m-section-tint">
      <div className="m-wrap">
        <Reveal className="m-section-head">
          <p className="m-eyebrow">The Full Menu</p>
          <h2>Everything on the table, plainly stated.</h2>
        </Reveal>
        <div className="m-feature-grid">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05} y={20}>
              <motion.div className="m-feature-card" whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                <span className="m-feature-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OwnerOverview() {
  const pending = ["Table 5 — Split by item", "Table 9 — One bill"];
  const inKitchen = ["Table 3 — Split equally"];
  return (
    <section id="owner" className="m-section">
      <div className="m-wrap m-owner-grid">
        <Reveal>
          <p className="m-eyebrow">Your Whole Floor, At A Glance</p>
          <h2>The owner dashboard runs the shift, not just the menu.</h2>
          <p className="m-section-sub">
            Every order lands in Needs Review the moment a guest sends it — no one has to notice the
            table. Confirm, edit, or reject in a tap whenever staff have a moment, and watch it move
            into In Kitchen live.
          </p>
          <ul className="m-checklist">
            <li>Two-column live queue: Needs Review and In Kitchen</li>
            <li>Mark items sold out or mark them down, live, from any device</li>
            <li>Staff PINs with instant, real-time revocation on removal</li>
            <li>Menu management with owner-assignable Trending / Chef's Specials / Discount tags</li>
            <li>Branded QR generator, built in — no third-party tool required</li>
            <li>Works alongside your existing POS — payment stays exactly how it works today</li>
          </ul>
        </Reveal>

        <Reveal delay={0.15} className="m-dash-mock">
          <div className="m-dash-mock-col">
            <div className="m-dash-mock-header"><span>Needs Review</span><span className="m-dash-mock-count">{pending.length}</span></div>
            {pending.map((p, i) => (
              <motion.div key={p} className="m-dash-mock-card" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}>
                {p}
              </motion.div>
            ))}
          </div>
          <div className="m-dash-mock-col">
            <div className="m-dash-mock-header"><span>In Kitchen</span><span className="m-dash-mock-count">{inKitchen.length}</span></div>
            {inKitchen.map((p, i) => (
              <motion.div key={p} className="m-dash-mock-card is-active" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.1 }}>
                {p}
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Starter", price: "$149", period: "/mo", note: "One location, everything you need to launch.",
      features: ["Unlimited tables & QR codes", "Live menu with sold-out & markdowns", "Works alongside your existing POS", "Split billing"],
    },
    {
      name: "Growth", price: "$249", period: "/mo", note: "For a busier floor with more staff.", featured: true,
      features: ["Everything in Starter", "Unlimited staff PINs", "Owner-assignable tags & carousels", "Priority support from the person who built it"],
    },
    {
      name: "Full Service", price: "Let's talk", period: "", note: "Multiple locations or a custom rollout.",
      features: ["Everything in Growth", "Multi-location dashboard", "White-label branding", "Onboarding & staff training included"],
    },
  ];
  return (
    <section id="pricing" className="m-section m-section-tint">
      <div className="m-wrap">
        <Reveal className="m-section-head">
          <p className="m-eyebrow">Simple, No-Commission Pricing</p>
          <h2>One flat monthly rate. Never a cut of your sales.</h2>
          <p className="m-section-sub">
            Straightforward tiers built around how a real shift runs — walk through which one fits
            on your demo call.
          </p>
        </Reveal>
        <div className="m-pricing-grid">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className={`m-price-card${t.featured ? " is-featured" : ""}`}>
                <p className="m-price-name">{t.name}</p>
                <p className="m-price-amount">{t.price}<span>{t.period}</span></p>
                <p className="m-price-note">{t.note}</p>
                <ul>
                  {t.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="m-pricing-footnote">Every plan: no per-order commission, ever.</p>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: "Does this replace my POS or payment system?", a: "No. Servd is a menu and ordering layer that sits alongside what you already have — guests still pay you exactly how they do today, on your existing system. Servd doesn't touch payment at all." },
    { q: "Does Servd take a cut of my sales?", a: "No. It's a flat monthly rate, never a percentage of what you ring in — see Pricing above." },
    { q: "What happens when a guest sends an order?", a: "It lands in Needs Review right away — no server has to notice the table or walk over. Whoever's free confirms it, edits it if needed, and sends it on." },
    { q: "Do my guests need to download an app?", a: "No. The QR opens the menu directly in their phone's browser." },
    { q: "Can I run this on my existing tablet or do I need new hardware?", a: "Any modern tablet or laptop with a browser works for the owner dashboard — no special hardware or POS integration required." },
    { q: "What if my internet or Wi-Fi drops mid-shift?", a: "This is an honest limitation worth knowing up front: Servd needs an internet connection to sync orders in real time. We can talk through backup plans for your specific setup on the demo call." },
  ];
  return (
    <section id="faq" className="m-section">
      <div className="m-wrap">
        <Reveal className="m-section-head" style={{ margin: "0 auto 2.5rem", textAlign: "center" }}>
          <p className="m-eyebrow">Questions Worth Asking</p>
          <h2>Straight answers, before you ask.</h2>
        </Reveal>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="m-faq-list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className="m-faq-item" key={item.q} data-open={isOpen}>
            <button
              type="button"
              className="m-faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className="m-faq-plus" aria-hidden="true">+</span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <p className="m-faq-a-inner">{item.a}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="m-contact-form" onSubmit={handleSubmit}>
      <h3>Prefer email? Request a demo here.</h3>
      <label className="m-form-field">
        Name
        <input type="text" name="name" required autoComplete="name" />
      </label>
      <label className="m-form-field">
        Restaurant
        <input type="text" name="restaurant" autoComplete="organization" />
      </label>
      <label className="m-form-field">
        Email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label className="m-form-field">
        Anything specific you want to see on the call?
        <textarea name="message" rows={3} />
      </label>
      <button type="submit" className="m-btn m-btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send request"}
      </button>
      {status === "success" && <p className="m-form-note is-success">Thanks — I'll follow up by email to find a time.</p>}
      {status === "error" && <p className="m-form-note is-error">Something went wrong sending that. Try again, or book directly above instead.</p>}
    </form>
  );
}

function FinalCta({ onOpenDemo }) {
  return (
    <section id="contact" className="m-section m-cta-final">
      <div className="m-wrap">
        <Reveal className="m-cta-inner">
          <h2>See it running on a real table, live on the call.</h2>
          <p>
            No slide deck, no canned screenshots — I'll pull up the actual customer menu and owner
            dashboard and walk through a full order, confirmation, and split bill with you.
          </p>
          <div className="m-cta-ctas">
            <button type="button" onClick={onOpenDemo} className="m-btn m-btn-primary m-btn-lg">
              Book a Live Demo
            </button>
            <a href="/feature-sheet.html" target="_blank" rel="noopener" className="m-btn m-btn-outline-light m-btn-lg">
              Download Feature Sheet
            </a>
          </div>
          <p className="m-cta-trust">Built for independent restaurants across Canada · No commissions, ever.</p>

          <div className="m-direct-contact">
            <p className="m-direct-contact-label">Prefer to just email me directly?</p>
            <a href="mailto:pankaj_singh@servd.tech" className="m-direct-contact-email">pankaj_singh@servd.tech</a>
            <p className="m-direct-contact-location">Burnaby, British Columbia, Canada</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener" className="m-whatsapp-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.2 1.25-1.96 1.4-.53.11-1.22.2-3.53-.76-2.96-1.22-4.87-4.2-5.02-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.46.75-2.17 1.02-2.47.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.6.45.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.27.72 1.19 1.55 1.92 1.06.95 1.96 1.24 2.23 1.38.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.14.45.2.51.32.07.11.07.65-.17 1.33Z" />
              </svg>
              Or message on WhatsApp
            </a>
          </div>

          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

function DemoModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="m-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="m-modal-shell" role="dialog" aria-modal="true" aria-label="Book a live demo">
            <motion.div className="m-modal-panel" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
              <button type="button" className="m-modal-close" onClick={onClose} aria-label="Close booking dialog">×</button>
              <iframe src={CALENDLY_LINK} title="Book a live demo with Servd" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Footer({ onOpenDemo }) {
  return (
    <footer className="m-footer">
      <div className="m-wrap m-footer-inner">
        <div>
          <a href="#top" className="m-wordmark">
            <span className="m-wordmark-mark" aria-hidden="true" />
            <span className="m-wordmark-text">Servd</span>
          </a>
          <p>The menu and ordering layer for your existing setup.</p>
        </div>
        <div className="m-footer-links">
          <a href="/feature-sheet.html" target="_blank" rel="noopener">Feature Sheet (PDF)</a>
          <button type="button" onClick={onOpenDemo} className="m-btn m-btn-ghost">Book a Live Demo</button>
        </div>
      </div>
    </footer>
  );
}

// Fixed, always-reachable click-to-chat button — the standard pattern
// visitors already recognize from other business sites, so it doesn't
// need explaining.
function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener"
      className="m-whatsapp-btn"
      aria-label="Message Servd on WhatsApp"
      title="Message us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.2 1.25-1.96 1.4-.53.11-1.22.2-3.53-.76-2.96-1.22-4.87-4.2-5.02-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.46.75-2.17 1.02-2.47.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.6.45.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.27.72 1.19 1.55 1.92 1.06.95 1.96 1.24 2.23 1.38.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.14.45.2.51.32.07.11.07.65-.17 1.33Z" />
      </svg>
    </motion.a>
  );
}

function readReducedMotionPref() {
  try {
    return localStorage.getItem(REDUCED_MOTION_KEY) === "true";
  } catch {
    return false;
  }
}

export default function MarketingApp() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotionPref);

  function toggleReducedMotion() {
    setReducedMotion((v) => {
      const next = !v;
      try { localStorage.setItem(REDUCED_MOTION_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div className="m-page">
        <Nav onOpenDemo={() => setDemoOpen(true)} reducedMotion={reducedMotion} onToggleReducedMotion={toggleReducedMotion} />
        <main>
          <Hero onOpenDemo={() => setDemoOpen(true)} />
          <AboutUs />
          <DemoProcess />
          <Features />
          <OwnerOverview />
          <Pricing />
          <Faq />
          <FinalCta onOpenDemo={() => setDemoOpen(true)} />
        </main>
        <Footer onOpenDemo={() => setDemoOpen(true)} />
        <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
        <WhatsAppButton />
      </div>
    </MotionConfig>
  );
}
