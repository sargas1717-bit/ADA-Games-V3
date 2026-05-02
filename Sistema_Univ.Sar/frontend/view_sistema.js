// view_sistema.js
function SistemaView({ teams, currentUser, fetchData, showToast, confirm, postTeams, users }) {
  const [resetCode, setResetCode] = React.useState('');
  
  const handleHardReset = () => {
    if (resetCode !== 'RESET-2026') {
      showToast('⚠️ Código de confirmación incorrecto');
      return;
    }
    confirm({
      title: '🚨 DANGER: Hard Reset Global',
      message: '¿Estás absolutamente seguro? Esto borrará el historial de evaluaciones de TODOS los equipos en TODAS las categorías. Los equipos registrados se mantendrán, pero sus puntajes volverán a cero.',
      onConfirm: () => {
        const resetTeams = teams.map(t => ({
          ...t,
          score: 0,
          lastTime: 0,
          status: 'pending',
          history: [],
          qualifiedRounds: [1]
        }));
        postTeams(resetTeams);
        setResetCode('');
        showToast('💥 Hard Reset Ejecutado. Todo el historial ha sido borrado.');
      }
    });
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ teams, users }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `adagames_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    showToast('✅ Copia de seguridad descargada');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-black text-blue-900 uppercase italic">Sistema</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración Global y Mantenimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <Icon name="database" className="w-4 h-4" /> Gestión de Datos
          </h3>
          
          <button onClick={fetchData} className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl transition-all group">
            <div className="bg-white p-2 rounded-xl shadow-sm group-hover:text-blue-600"><Icon name="refresh-cw" className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="font-black text-sm text-slate-800">Forzar Sincronización</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Descarga los últimos datos del servidor</p>
            </div>
          </button>

          <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-green-50 border-2 border-slate-100 hover:border-green-200 rounded-2xl transition-all group">
            <div className="bg-white p-2 rounded-xl shadow-sm group-hover:text-green-600"><Icon name="download" className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="font-black text-sm text-slate-800">Descargar Backup Local</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Guarda un archivo JSON con la BD actual</p>
            </div>
          </button>
        </div>

        <div className="bg-red-50 p-8 rounded-[2rem] shadow-xl border border-red-100 space-y-6">
          <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
            <Icon name="alert-triangle" className="w-4 h-4" /> Zona de Peligro
          </h3>
          
          <div className="space-y-4">
            <p className="text-xs text-red-800 font-medium">Escribe <strong>RESET-2026</strong> para habilitar el borrado total del historial de competencias. Esto NO se puede deshacer.</p>
            <input 
              value={resetCode} 
              onChange={e => setResetCode(e.target.value)}
              placeholder="Código de confirmación" 
              className="w-full bg-white border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-600 placeholder-red-300 focus:outline-none focus:border-red-500 text-center uppercase"
            />
            <button 
              onClick={handleHardReset}
              disabled={resetCode !== 'RESET-2026'}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Ejecutar Hard Reset Global
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SistemaView = SistemaView;
