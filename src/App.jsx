import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Globe, Zap, RefreshCcw, Layout, Smartphone, Briefcase } from 'lucide-react';
import { toPng } from 'html-to-image';

const INITIAL_RECENT_PAGES = [
  { url: 'vercel.com', title: 'Vercel: Develop. Preview. Ship.', score: 100, color: 'bg-[#000000] text-zinc-100', isBrand: 'vercel' },
  { url: 'linear.app', title: 'Linear – Purpose-built tool for modern software teams', score: 98, color: 'bg-[#5e6ad2] text-white', isBrand: 'linear' },
  { url: 'stripe.com', title: 'Financial infrastructure for the internet | Stripe', score: 96, color: 'bg-[#635bff] text-white', isBrand: 'stripe' },
  { url: 'framer.com', title: 'Framer — Start your dream site with AI.', score: 92, color: 'bg-black text-[#00aaff]', isBrand: 'framer' },
  { url: 'openai.com', title: 'OpenAI: Creating safe AGI that benefits all of humanity', score: 87, color: 'bg-[#74aa9c] text-white', isBrand: 'openai' },
  { url: 'github.com', title: 'GitHub: Let\'s build from here · GitHub', score: 95, color: 'bg-[#24292f] text-white', isBrand: 'github' },
];

const BrandLogo = ({ brand, className }) => {
  switch (brand) {
    case 'vercel': return <svg viewBox="0 0 24 24" className={className} fill="white"><path d="M24 22.525H0L12 1.475L24 22.525Z" /></svg>;
    case 'linear': return <svg viewBox="0 0 24 24" className={className} fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm1.414 14.586l-1.414 1.414L6.414 12.414l1.414-1.414 4.172 4.172 5.586-5.586 1.414 1.414-7 7z" /></svg>;
    case 'framer': return <svg viewBox="0 0 24 24" className={className} fill="white"><path d="M4 0h16v8l-8 8V8H4V0zm0 16h8l8 8H4v-8z" /></svg>;
    case 'github': return <svg viewBox="0 0 24 24" className={className} fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>;
    case 'stripe': return <span className="text-white font-black text-xs">S</span>;
    case 'openai': return <span className="text-white font-bold text-[8px]">AI</span>;
    default: return <span className="text-zinc-500 font-black text-[10px] uppercase">OG</span>;
  }
};

const TEMPLATES = [
  { id: 'dark-neon', name: 'Dark Neon', icon: <Zap size={18} /> },
  { id: 'minimal', name: 'Minimal', icon: <Smartphone size={18} /> },
  { id: 'corporate', name: 'Corporate', icon: <Briefcase size={18} /> },
];

function App() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('dark-neon');
  const [recentHistory, setRecentHistory] = useState(() => {
    const saved = localStorage.getItem('snapgraph_history');
    return saved ? JSON.parse(saved) : INITIAL_RECENT_PAGES;
  });
  const previewRef = useRef(null);

  const fetchMetadata = async () => {
    if (!url) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    setUrl(cleanUrl);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`);
      const data = await response.json();

      if (data.status === 'success') {
        const meta = data.data;
        setMetadata(meta);

        let score = 0;
        if (meta.title) score += 30;
        if (meta.description) score += 30;
        if (meta.image) score += 30;
        if (meta.logo) score += 10;

        const newEntry = {
          url: new URL(cleanUrl).hostname,
          title: meta.title || cleanUrl,
          score: score,
          color: score > 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                 score > 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                 'bg-red-500/10 text-red-400 border-red-500/20',
          logoUrl: meta.logo?.url || `https://www.google.com/s2/favicons?domain=${new URL(cleanUrl).hostname}&sz=128`
        };

        setRecentHistory(prev => {
          const filtered = prev.filter(item => item.url !== newEntry.url);
          const updated = [newEntry, ...filtered].slice(0, 6);
          localStorage.setItem('snapgraph_history', JSON.stringify(updated));
          return updated;
        });
      } else {
        setError('No se pudo encontrar información de este sitio.');
      }
    } catch (err) {
      setError('Error al conectar con la red.');
    } finally {
      setLoading(false);
    }
  };

  const templateStyles = {
    'dark-neon': {
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#fff',
      accent: '#22d3ee',
      titleSize: '3.5rem',
      descSize: '1.25rem'
    },
    'minimal': {
      background: '#ffffff',
      color: '#000',
      accent: '#000',
      titleSize: '3rem',
      descSize: '1.1rem'
    },
    'corporate': {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: '#fff',
      accent: '#38bdf8',
      titleSize: '3.25rem',
      descSize: '1.2rem'
    }
  };

  const tStyles = templateStyles[selectedTemplate];

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 1,
      });
      const link = document.createElement('a');
      link.download = `og-image-${metadata.title.slice(0, 20)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Error al generar la imagen.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 40 40" className="w-8 h-8 fill-white">
            <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z"/><path d="M20 8l-8 12h5v12l8-12h-5V8z"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-[18px] font-black tracking-tighter leading-none">SnapGraph</span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">The URL to OG Image Generator</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-zinc-600 tracking-[0.2em] uppercase">V1.2 TAILWIND ENGINE</span>
          <button className="bg-[#111] border border-zinc-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-zinc-800 transition-all">
            Upgrade <Zap size={10} className="text-amber-500" fill="currentColor" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left Column */}
          <div className="space-y-10">
            <h1 className="text-[68px] font-black leading-[1] tracking-tight">
              <span className="text-cyan-400">Atrae más clics</span> <br />
              con <br />
              Gráficos de <br />
              Impacto.
            </h1>

            <p className="text-zinc-500 text-lg max-w-sm leading-relaxed">
              SnapGraph automatiza la creación de tus OG-Images. Solo pega el link y nosotros hacemos el resto en segundos.
            </p>

            <div className="space-y-12">
              <div className="relative group max-w-lg">
                {/* Glow Effect Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative rounded-xl p-1.5 flex items-center border border-zinc-900 group-focus-within:border-cyan-500/40 transition-all shadow-2xl overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                  <input
                    type="text"
                    placeholder="https://ogsnapgraph.app"
                    className="flex-1 bg-transparent border-none outline-none pl-4 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-700 font-medium"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchMetadata()}
                  />
                  <button
                    onClick={fetchMetadata}
                    disabled={loading}
                    className="relative bg-cyan-500 hover:bg-cyan-400 text-[#030303] px-6 py-3 rounded-lg font-black transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-[13px]  group/btn overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                    <Zap size={14} fill="currentColor" />
                    Snap It
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs font-bold mt-3 px-1">{error}</p>}
              </div>

              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Selecciona un Estilo</h3>
                <div className="flex gap-4 max-w-md">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      className={`flex-1 bg-[#0a0a0a] p-5 rounded-2xl flex flex-col items-center gap-3 border transition-all ${selectedTemplate === t.id ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-zinc-900 shadow-xl'
                        }`}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <div className={`${selectedTemplate === t.id ? 'text-cyan-400' : 'text-zinc-500'}`}>
                        {t.icon}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${selectedTemplate === t.id ? 'text-white' : 'text-zinc-600'
                        }`}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview Area */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                <Globe size={12} className="text-cyan-400" /> Previsualización
              </h3>
              <AnimatePresence>
                {metadata && (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-[9px] font-black tracking-[0.2em] transition-all"
                  >
                    <Download size={12} /> DESCARGAR PNG
                  </button>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-[#111] rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl relative">
              <div className="flex gap-1.5 p-4 border-b border-zinc-900/80 bg-[#0a0a0a]">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
              </div>
              
              <AnimatePresence mode="wait">
                {!metadata && !loading ? (
                  <div className="aspect-[1200/630] flex flex-col items-center justify-center opacity-40">
                    <Globe size={32} className="text-zinc-700 mb-4" />
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Esperando una URL...</p>
                  </div>
                ) : loading ? (
                  <div className="aspect-[1200/630] flex flex-col items-center justify-center">
                    <RefreshCcw size={48} className="animate-spin text-cyan-400" />
                    <p className="mt-8 text-cyan-400 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">
                      Analizando Sitio
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-10 aspect-[1200/630] flex flex-col justify-center gap-6"
                    style={{
                      background: tStyles.background,
                      color: tStyles.color,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {metadata.logo ? (
                        <img
                          src={`https://images.weserv.nl/?url=${encodeURIComponent(metadata.logo.url)}&output=png&default=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${url ? new URL(url).hostname : ''}&sz=128`)}`}
                          alt="logo"
                          className="w-10 h-10 object-contain shadow-2xl"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-md flex items-center justify-center">
                           <Globe size={20} className="text-cyan-400" />
                        </div>
                      )}
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40">{metadata.publisher || 'SNAPGRAPH'}</span>
                    </div>
                    <h4 className="text-4xl font-black leading-tight line-clamp-2">{metadata.title}</h4>
                    <p className="text-base opacity-60 line-clamp-3 leading-relaxed max-w-sm">
                      {metadata.description}
                    </p>
                    <div className="mt-4 pt-10 border-t border-current flex items-center justify-between" style={{ borderColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}>
                      <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">{url ? new URL(url).hostname.toUpperCase() : ''}</span>
                      <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest text-zinc-500">v1.2 Engine</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Recently Inspected Section */}
        <div className="mt-40 text-left">
          <div className="flex items-center gap-8 mb-12">
            <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-zinc-700 whitespace-nowrap">Recently Inspected</h2>
            <div className="h-px bg-zinc-900 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentHistory.map((page, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.05) }}
                key={`${page.url}-${i}`} 
                className="bg-[#0a0a0a] border border-zinc-900 p-4 rounded-xl flex items-center justify-between hover:border-cyan-500/40 transition-all cursor-pointer group shadow-2xl"
                onClick={() => {
                  setUrl(page.url);
                  fetchMetadata();
                }}
              >
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className="w-[52px] h-[52px] rounded-lg bg-black flex items-center justify-center shrink-0 border border-zinc-900 group-hover:scale-105 transition-transform overflow-hidden p-2.5">
                    {page.isBrand ? (
                      <BrandLogo brand={page.isBrand} className="w-full h-full" />
                    ) : (
                      <img src={page.logoUrl} className="w-full h-full object-contain" alt="Favicon" />
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-black text-[14px] text-zinc-100 truncate tracking-tight mb-1">{page.url}</div>
                    <div className="text-[10px] text-zinc-600 truncate font-semibold uppercase tracking-widest">{page.title}</div>
                  </div>
                </div>
                <div className={`w-[38px] h-[38px] rounded-full border border-white/5 flex items-center justify-center text-[12px] font-black leading-none shrink-0 ${page.color}`}>
                  {page.score}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* HIDDEN CANVAS FOR EXPORT */}
      <div style={{ position: 'fixed', top: '-10000px', left: 0, pointerEvents: 'none' }}>
        {metadata && (
          <div
            ref={previewRef}
            style={{
              width: '1200px',
              height: '630px',
              background: tStyles.background,
              color: tStyles.color,
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '60px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {metadata.logo ? (
                <img
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(metadata.logo.url)}&output=png&default=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${url ? new URL(url).hostname : ''}&sz=128`)}`}
                  alt="logo"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '80px', height: '80px', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="#22d3ee" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
              )}
              <span style={{ fontSize: '2rem', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '4px' }}>{metadata.publisher || (url ? new URL(url).hostname : 'SNAPGRAPH')}</span>
            </div>

            <div>
              <h1 style={{ fontSize: tStyles.titleSize, fontWeight: 900, marginBottom: '32px', lineHeight: 1.1 }}>
                {metadata.title}
              </h1>
              <p style={{ fontSize: tStyles.descSize, opacity: 0.7, maxWidth: '85%', lineHeight: 1.4 }}>
                {metadata.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#22d3ee', fontSize: '1.5rem', fontWeight: 900 }}>
              <div style={{ height: '2px', flex: 1, background: 'rgba(34, 211, 238, 0.15)' }}></div>
              <span style={{ textTransform: 'uppercase', letterSpacing: '8px' }}>{url ? new URL(url).hostname.toUpperCase() : ''}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
