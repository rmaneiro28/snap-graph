import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCcw, Share2, Globe, Download, Smartphone, Box } from 'lucide-react';
import { toPng } from 'html-to-image';

const TEMPLATES = [
  { id: 'dark-neon', name: 'Dark Neon', icon: <Zap size={18} /> },
  { id: 'minimal', name: 'Minimal', icon: <Smartphone size={18} /> },
  { id: 'corporate', name: 'Corporate', icon: <Box size={18} /> }
];

function App() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('dark-neon');
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
        setMetadata(data.data);
      } else {
        setError('No se pudo encontrar información de este sitio.');
      }
    } catch (err) {
      setError('Error al conectar con la red.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (previewRef.current === null) return;
    setDownloading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      
      const hostname = url ? new URL(url).hostname.replace('www.', '').split('.')[0] : 'image';
      const filename = `snapgraph-og-image-generator-${hostname}-${selectedTemplate}.png`;

      const dataUrl = await toPng(previewRef.current, { 
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      alert('Error al generar la imagen. Detalles: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const getTemplateStyles = (compId) => {
    switch (compId) {
      case 'minimal':
        return {
          background: '#ffffff',
          color: '#000000',
          accent: '#4facfe',
          titleSize: '80px',
          descSize: '32px'
        };
      case 'corporate':
        return {
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          accent: '#00f2fe',
          titleSize: '70px',
          descSize: '28px'
        };
      default: // dark-neon
        return {
          background: 'radial-gradient(circle at top right, #1a1a1a, #000000)',
          color: '#ffffff',
          accent: '#00f2fe',
          titleSize: '90px',
          descSize: '36px'
        };
    }
  };

  const tStyles = getTemplateStyles(selectedTemplate);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 selection:bg-cyan-500/30">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <img src="/logo-2.png" alt="SnapGraph Logo" className="md:w-48 object-contain brightness-0 invert" />
        </div>
        <nav className="flex gap-4 items-center">
          <span className="hidden md:inline-block text-xs font-bold opacity-40 px-3 py-1 border border-white/5 rounded-full uppercase tracking-widest">v1.2 Tailwind Engine</span>
          <button className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
            Upgrade ⚡
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <section className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-gradient leading-tight mb-6">
              Atrae más clics con <br />
              <span className="text-white">Gráficos de Impacto.</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-lg leading-relaxed">
              SnapGraph automatiza la creación de tus OG-Images. Solo pega el link y nosotros hacemos el resto en segundos.
            </p>
          </motion.div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex gap-2">
              <input 
                type="text" 
                placeholder="Escribe tu URL aquí..."
                className="snap-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchMetadata()}
              />
              <button 
                onClick={fetchMetadata}
                disabled={loading || downloading}
                className="btn-primary"
              >
                {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Zap size={18} fill="black" />}
                <span className="hidden sm:inline">Snap It</span>
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm font-medium mt-2">{error}</p>}

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Selecciona un Estilo</h3>
            <div className="grid grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <button 
                  key={t.id} 
                  className={`glass glass-hover p-4 flex flex-col items-center gap-3 border-2 transition-all ${
                    selectedTemplate === t.id ? 'border-cyan-500/50 bg-white/[0.08]' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  <div className={`${selectedTemplate === t.id ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    {t.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedTemplate === t.id ? 'text-white' : 'text-zinc-500'
                  }`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Share2 size={14} className="text-cyan-400" /> Previsualización
            </h3>
            <AnimatePresence>
              {metadata && (
                <motion.button 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={handleDownload} 
                  disabled={downloading}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-xs font-black tracking-widest transition-all disabled:opacity-50"
                >
                  {downloading ? <RefreshCcw size={14} className="animate-spin" /> : <Download size={14} />}
                  {downloading ? 'GENERANDO...' : 'DESCARGAR PNG'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {!metadata && !loading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass w-full aspect-video flex flex-col items-center justify-center border-dashed border-zinc-800"
              >
                <div className="p-6 rounded-full bg-white/[0.02] mb-4">
                  <Globe size={40} className="text-zinc-700" />
                </div>
                <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Esperando una URL...</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass w-full aspect-video flex flex-col items-center justify-center"
              >
                <RefreshCcw size={48} className="animate-spin text-cyan-400" />
                <p className="mt-8 text-cyan-400 font-black uppercase tracking-[0.3em] text-sm group">
                  Analizando Sitio<span className="animate-pulse">...</span>
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass overflow-hidden shadow-2xl relative"
              >
                <div className="flex gap-1.5 p-4 border-b border-white/[0.05]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                </div>
                <div 
                  className="p-8 md:p-12 h-[320px] md:h-[400px] flex flex-col justify-center gap-6"
                  style={{ 
                    background: tStyles.background, 
                    color: tStyles.color,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {metadata.logo ? (
                      <img 
                        src={`https://images.weserv.nl/?url=${encodeURIComponent(metadata.logo.url)}&default=${encodeURIComponent(metadata.logo.url)}`} 
                        alt="logo" 
                        crossOrigin="anonymous"
                        className="w-8 h-8 object-contain" 
                      />
                    ) : (
                      <img src="/logo.png" alt="SnapGraph Isotype" className="w-8 h-8 object-contain" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{metadata.publisher || 'SNAPGRAPH'}</span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black leading-tight line-clamp-2">{metadata.title}</h4>
                  <p className="text-sm md:text-base opacity-60 line-clamp-3 leading-relaxed">
                    {metadata.description}
                  </p>
                  <div className="mt-4 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                     <span className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: tStyles.accent }}>{url ? new URL(url).hostname : ''}</span>
                     <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest">v1.2 Engine</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* HIDDEN CANVAS FOR EXPORT (STABLE REF) */}
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
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(metadata.logo.url)}&default=${encodeURIComponent(metadata.logo.url)}`} 
                  alt="logo" 
                  crossOrigin="anonymous"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                />
              ) : (
                <img src="/logo.png" alt="SnapGraph Isotype" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: tStyles.accent, fontSize: '1.5rem', fontWeight: 900 }}>
              <div style={{ height: '2px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
              <span style={{ textTransform: 'uppercase', letterSpacing: '8px' }}>{url ? new URL(url).hostname : ''}</span>
            </div>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto mt-32 py-12 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">SnapGraph Engine &copy; 2026. Premium OG Generator.</p>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
