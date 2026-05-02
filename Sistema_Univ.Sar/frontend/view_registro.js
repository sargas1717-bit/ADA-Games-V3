// ============================================================================
// view_registro.js
// ============================================================================

function RegistroView({ teams, currentUser, onAddTeam, onBulkAdd, showToast }) {
  const [form, setForm] = React.useState({ teamName: '', schoolName: '' });
  const plugin = getCategoryPlugin(currentUser.category);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.teamName || !form.schoolName) { showToast('⚠️ Completa ambos campos'); return; }
    onAddTeam(form);
    setForm({ teamName: '', schoolName: '' });
  };

  const recentTeams = [...teams].filter(t => t.category === currentUser.category).reverse().slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-black text-blue-900 uppercase italic">Registro de Equipos</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Alta de participantes para {plugin.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Icon name="user-plus" className="w-4 h-4" /> Registro Manual
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Nombre del Equipo</label>
              <input value={form.teamName} onChange={e => setForm(p => ({...p, teamName: e.target.value}))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Institución Educativa</label>
              <input value={form.schoolName} onChange={e => setForm(p => ({...p, schoolName: e.target.value}))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-lg shadow-blue-500/20">Registrar Equipo</button>
          </form>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Importación Masiva (Excel/JSON)</h3>
          <div className="border-2 border-dashed border-slate-700 rounded-3xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer">
            <Icon name="upload-cloud" className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Arrastra tu archivo aquí</p>
          </div>
          <p className="text-[9px] text-slate-500 mt-4 leading-tight uppercase font-bold">Acepta archivos CSV generados por el sistema de inscripción centralizado Adagames.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase">Últimos Registros</p>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">En Vivo</span>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTeams.map(t => (
            <div key={t.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <SchoolLogo schoolName={t.schoolName} size={44} />
              <div className="flex-1">
                <p className="font-black text-slate-800 text-sm">{t.teamName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{t.schoolName}</p>
              </div>
              <div className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Pendiente</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.RegistroView = RegistroView;
