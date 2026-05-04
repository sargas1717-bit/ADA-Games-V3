// core_ui.js
const Icon = ({ name, className }) => {
  const spanRef = React.useRef(null);

  React.useEffect(() => {
    if (spanRef.current && window.lucide) {
      // Usar innerHTML para que React no rastree el elemento <i>.
      // Así evitamos el error "NotFoundError" cuando lucide reemplaza el <i> por un <svg>.
      spanRef.current.innerHTML = `<i data-lucide="${name || 'help-circle'}" class="${className || 'w-5 h-5'}"></i>`;
      try { 
        lucide.createIcons({ root: spanRef.current }); 
      } catch (e) {
        try { lucide.createIcons(); } catch (e2) {}
      }
    }
  }, [name, className]);

  return <span ref={spanRef} className="inline-flex items-center justify-center pointer-events-none"></span>;
};

function SaveIndicator({ isSaving, saveError }) {
  if (saveError) return (
    <div className="fixed bottom-6 left-6 bg-red-600 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce z-50">
      <Icon name="alert-circle" /> <span className="text-xs font-bold uppercase">Error de Sincronización</span>
    </div>
  );
  if (isSaving) return (
    <div className="fixed bottom-6 left-6 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 z-50">
      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
    </div>
  );
  return null;
}

function SchoolLogo({ schoolName, size = 48 }) {
  const getLogoPath = (name) => {
    const schoolMap = {
      "Juan Vicente González": "1-Juan_Vicente_Gonzlez.jpg",
      "Don Bosco": "10-Don-Bosco.png",
      "U.E. Menca de Leoni": "2-UE_Menca.png",
      "U.E. La Paz": "3-U.E_La Paz.png",
      "Colegio Ideal": "4-Colegio Ideal.PNG",
      "Nueva Barcelona": "9-Nueva-Barcelona.jpg"
    };
    const filename = schoolMap[schoolName] || "default.png";
    return `logos/${filename}`;
  };
  const fallbackSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50' y='55' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'>ADA</text></svg>";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ width: size, height: size }}>
      <img src={getLogoPath(schoolName)} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = fallbackSrc; }} />
    </div>
  );
}

function useToast() {
  const [message, setMessage] = React.useState('');
  const showToast = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };
  const ToastComponent = message ? (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-3xl shadow-2xl z-[100] flex items-center gap-3 animate-fadeIn border border-white/10">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <span className="text-sm font-bold">{message}</span>
    </div>
  ) : null;
  return { showToast, ToastComponent };
}

function useConfirmDialog() {
  const [config, setConfig] = React.useState(null);
  const confirm = (opts) => setConfig(opts);
  const DialogComponent = config ? (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100">
        <h3 className="text-xl font-black text-blue-900 uppercase italic mb-2">{config.title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{config.message}</p>
        <div className="flex gap-3">
          <button onClick={() => setConfig(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">Cancelar</button>
          <button onClick={() => { config.onConfirm(); setConfig(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Confirmar</button>
        </div>
      </div>
    </div>
  ) : null;
  return { confirm, DialogComponent };
}

window.Icon = Icon;
window.SaveIndicator = SaveIndicator;
window.SchoolLogo = SchoolLogo;
window.useToast = useToast;
window.useConfirmDialog = useConfirmDialog;
