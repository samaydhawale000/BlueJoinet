import Link from 'next/link';

const USE_CASES = [
  {
    label: 'HR & Recruitment',
    description:
      'Interview candidates directly inside your hiring platform. No third-party meeting links.',
  },
  {
    label: 'Telemedicine',
    description:
      'Doctor-patient consultations embedded in your healthcare product.',
  },
  {
    label: 'CRM & Sales',
    description:
      'Call leads without leaving the CRM. Call records attach to the contact automatically.',
  },
  {
    label: 'Customer Support',
    description:
      'Agents connect to customers instantly — no hold music, no plugin downloads.',
  },
  {
    label: 'Dating & Social',
    description:
      'Safe, in-app video — users never share their personal contact details.',
  },
  {
    label: 'Marketplace',
    description:
      'Buyers and sellers meet face-to-face inside your platform before a transaction.',
  },
];

const FEATURES = [
  {
    title: 'Audio & Video Calls',
    body: '1-to-1 audio and video calls over peer-to-peer WebRTC. Low latency, no monthly media bill.',
  },
  {
    title: 'Screen Sharing',
    body: 'Share a desktop or application window mid-call — no extra integration required.',
  },
  {
    title: 'Hosted Call UI',
    body: 'A ready-made call page at a URL you control. No frontend SDK, no React dependency.',
  },
  {
    title: 'REST API',
    body: 'Create, accept, reject, and end calls with plain HTTP. Any language, any framework.',
  },
  {
    title: 'WebSocket Signaling',
    body: 'Real-time call events — incoming call, offer, answer, ICE — handled server-side.',
  },
  {
    title: 'Per-project API Keys',
    body: 'Isolate credentials per product or environment. Rotate without downtime.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ── Nav ────────────────────────────────────────────────── */}
      <header
        style={{ background: '#060A17', borderBottom: '1px solid #1A2240' }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="font-mono font-bold text-white tracking-tight text-base"
          >
            BlueCall
          </span>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        style={{
          background: '#060A17',
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        className="pt-24 pb-28 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="font-mono text-blue-500 text-xs tracking-widest uppercase mb-6"
          >
            Video Communication Infrastructure
          </p>

          <h1
            className="font-mono font-bold text-white leading-none mb-6"
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.25rem)',
              textWrap: 'balance',
              letterSpacing: '-0.02em',
            }}
          >
            Build video calls
            <br />
            into any product.
          </h1>

          <p
            className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl"
            style={{ textWrap: 'balance' }}
          >
            BlueCall gives your software a complete video communication stack —
            REST APIs, WebSocket signaling, and a hosted call UI your users land
            on directly. No frontend SDK. No per-minute pricing.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 transition-colors"
            >
              Start building →
            </Link>
            <Link
              href="/dashboard"
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-sm px-6 py-3 transition-colors"
            >
              Open dashboard
            </Link>
          </div>

          {/* API snippet */}
          <div
            style={{
              background: '#0D1425',
              border: '1px solid #1E2D50',
            }}
            className="max-w-xl"
          >
            <div
              style={{ borderBottom: '1px solid #1E2D50' }}
              className="px-4 py-2 flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
              <span className="font-mono text-slate-500 text-xs ml-2">
                POST /calls
              </span>
            </div>
            <pre
              className="font-mono text-sm px-5 py-4 overflow-x-auto"
              style={{ color: '#94A3B8', lineHeight: '1.7' }}
            >
              <span style={{ color: '#64748B' }}>{'// Your server calls BlueCall\n'}</span>
              <span style={{ color: '#7DD3FC' }}>{'fetch'}</span>
              <span style={{ color: '#94A3B8' }}>{'("https://api.bluecall.com/calls", {\n'}</span>
              <span style={{ color: '#94A3B8' }}>{'  method: "POST",\n'}</span>
              <span style={{ color: '#94A3B8' }}>{'  body: { callerId, receiverId, type: "VIDEO" }\n'}</span>
              <span style={{ color: '#94A3B8' }}>{'});\n\n'}</span>
              <span style={{ color: '#64748B' }}>{'// → redirect each user to:\n'}</span>
              <span style={{ color: '#4ADE80' }}>{'https://call.bluecall.com/call?token=…'}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Use cases ──────────────────────────────────────────── */}
      <section style={{ background: '#F5F8FF' }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-blue-600 text-xs tracking-widest uppercase mb-4">
            Who it&apos;s for
          </p>
          <h2
            className="text-3xl font-semibold text-slate-900 mb-12"
            style={{ textWrap: 'balance' }}
          >
            Any software product that needs
            <br />
            real-time video between two people
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: '#E2E8F4' }}
          >
            {USE_CASES.map((uc) => (
              <div
                key={uc.label}
                className="bg-white px-6 py-7"
              >
                <p className="font-medium text-slate-900 mb-2">{uc.label}</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-blue-600 text-xs tracking-widest uppercase mb-4">
            How it works
          </p>
          <h2
            className="text-3xl font-semibold text-slate-900 mb-14"
            style={{ textWrap: 'balance' }}
          >
            Three steps, then it&apos;s running
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: 'Create a call',
                body: 'Your backend calls POST /calls with a caller ID and receiver ID. BlueCall returns a secure token for each participant.',
              },
              {
                step: 'Redirect your users',
                body: 'Send each participant to the BlueCall hosted URL with their token. That\'s the only frontend work you do.',
              },
              {
                step: 'BlueCall takes over',
                body: 'Signaling, WebRTC negotiation, media controls, and the call UI are all handled. Your product stays out of it.',
              },
            ].map((item, i) => (
              <div key={item.step}>
                <div
                  className="font-mono text-blue-600 text-xs mb-4"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{ background: '#E2E8F4', height: '1px' }}
                  className="mb-5"
                />
                <p className="font-semibold text-slate-900 mb-2">{item.step}</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section style={{ background: '#F5F8FF' }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-blue-600 text-xs tracking-widest uppercase mb-4">
            What you get
          </p>
          <h2
            className="text-3xl font-semibold text-slate-900 mb-12"
            style={{ textWrap: 'balance' }}
          >
            Everything in the box
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div
                  className="w-1.5 h-1.5 bg-blue-600 mb-4"
                  style={{ borderRadius: 0 }}
                />
                <p className="font-semibold text-slate-900 mb-1.5">{f.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section
        style={{ background: '#060A17' }}
        className="py-24 px-6 text-center"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-mono font-bold text-white mb-4"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            Ready to ship video calls?
          </h2>
          <p className="text-slate-400 text-base mb-10">
            Create an account, make a project, get your API key. First call in
            under ten minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-8 py-3.5 transition-colors"
          >
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        style={{ background: '#060A17', borderTop: '1px solid #1A2240' }}
        className="px-6 py-8"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-mono text-slate-600 text-sm">BlueCall</span>
          <span className="text-slate-700 text-xs">
            Video Communication Infrastructure
          </span>
        </div>
      </footer>
    </div>
  );
}
