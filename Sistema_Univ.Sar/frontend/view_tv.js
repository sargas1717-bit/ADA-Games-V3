// ============================================================================
// view_tv.js - MODO TELEVISIÓN / PANTALLA DE COMPETENCIA
// Sistema_Univ.Sar - Motor Modular Adagames
//
// Modos:
//   - Individual: Ranking de una categoría seleccionada, pantalla completa
//   - Dual:       Dos categorías lado a lado (selector de cuáles mostrar)
//   - (Si hay 4 categorías activas, el selector permite elegir cualquier par)
//
// [CONTINGENCIA] Modo Espejo: si el servidor cae, carga del último backup en localStorage
// ============================================================================

function TVView({ teams, currentUser, onClose }) {
  const [tvMode, setTvMode] = React.useState('individual');  // 'individual' | 'dual'
  const [catA, setCatA] = React.useState(currentUser?.category || 'quest');
  const [catB, setCatB] = React.useState('line_follower');
  const [showConfig, setShowConfig] = React.useState(true); // Mostrar panel de config al inicio

  const activeCategories = Object.values(CATEGORY_REGISTRY);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col">
      {/* ---- Panel de configuración inicial ---- */}
      {showConfig && (
        <div className="absolute inset-0 bg-slate-950/95 z-10 flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white">Configurar Pantalla TV</h2>
                <p className="text-slate-400 text-sm">Selecciona el modo y las categorías a proyectar</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de modo */}
            <div className="flex gap-3 mb-6">
              {[
                { id: 'individual', label: 'Individual', icon: 'monitor', desc: 'Una categoría, pantalla completa' },
                { id: 'dual', label: 'Dual', icon: 'layout', desc: 'Dos categorías lado a lado' },
              ].map(m => (
                <button key={m.id} onClick={() => setTvMode(m.id)}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition ${tvMode === m.id ? 'border-blue-500 bg-blue-950' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                  <Icon name={m.icon} className="w-6 h-6 mb-2 text-blue-400" />
                  <p className="font-bold text-white text-sm">{m.label}</p>
                  <p className="text-slate-400 text-xs">{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Selector de categorías */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wider mb-1 block">
                  {tvMode === 'dual' ? 'Panel Izquierdo' : 'Categoría'}
                </label>
                <select value={catA} onChange={e => setCatA(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500">
                  {activeCategories.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              {tvMode === 'dual' && (
                <div>
                  <label className="text-slate-400 text-xs uppercase tracking-wider mb-1 block">Panel Derecho</label>
                  <select value={catB} onChange={e => setCatB(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500">
                    {activeCategories.filter(p => p.id !== catA).map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button onClick={() => setShowConfig(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-lg transition">
              ▶ Iniciar Transmisión
            </button>
          </div>
        </div>
      )}

      {/* ---- Controles flotantes (cuando está en transmisión) ---- */}
      {!showConfig && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button onClick={() => setShowConfig(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur">
            <Icon name="settings" className="w-3.5 h-3.5" /> Config
          </button>
          <button onClick={onClose}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5">
            <Icon name="x" className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      )}

      {/* ---- Contenido de Transmisión ---- */}
      {!showConfig && (
        tvMode === 'individual'
          ? <TVPanelIndividual teams={teams} categoryId={catA} />
          : <TVPanelDual teams={teams} catA={catA} catB={catB} />
      )}
    </div>
  );
}

// ---- Panel Individual (una categoría, pantalla completa) --------------------
function TVPanelIndividual({ teams, categoryId }) {
  const plugin = getCategoryPlugin(categoryId);
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());
  const { timer, timerActive, formatTime: formatGlobalTime } = useCategoryTimer(categoryId);

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // [CONTINGENCIA] Modo Espejo: si teams está vacío, usar localStorage
  const liveTeams = teams.length > 0 ? teams : JSON.parse(localStorage.getItem('ada_teams') || '[]');

  const ranked = React.useMemo(() => {
    return liveTeams
      .filter(t => t.category === categoryId && t.status !== 'disqualified')
      .map(t => {
        const { score, lastTime } = calculateTeamScore(t);
        return { ...t, score, lastTime };
      })
      .sort(plugin.rankingSort)
      .slice(0, 12);
  }, [liveTeams, categoryId]);

  const fmtTime = (ms) => {
    if (!ms || ms <= 0) return '—';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    'from-yellow-900/40 to-yellow-900/10 border-yellow-500/40',
    'from-slate-700/40 to-slate-700/10 border-slate-400/30',
    'from-orange-900/40 to-orange-900/10 border-orange-500/30',
  ];

  return (
    <div className="flex flex-col h-full p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${plugin.colorClass} rounded-xl flex items-center justify-center`}>
            <Icon name={plugin.icon} className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-widest">Ranking Oficial</h1>
            <p className={`text-xl font-bold ${plugin.colorClass.replace('bg-', 'text-').replace('600', '400')}`}>{plugin.title}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          {timerActive && (
            <div className="bg-blue-600 px-4 py-2 rounded-xl border-2 border-blue-400 animate-pulse shadow-lg">
              <p className="text-xs text-blue-200 uppercase font-bold tracking-tighter">Tiempo Restante</p>
              <p className="text-3xl font-black font-mono leading-none">{formatGlobalTime(timer)}</p>
            </div>
          )}
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider">En Vivo</p>
            <p className="text-slate-300 font-mono text-2xl">{time}</p>
            <p className="text-slate-600 text-xs animate-pulse">● Transmitiendo</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
        {ranked.map((team, i) => (
          <div key={team.id}
            className={`flex items-center gap-6 px-6 py-4 rounded-2xl border bg-gradient-to-r transition-all ${i < 3 ? podiumColors[i] : 'from-white/5 to-white/5 border-white/10'}`}>
            {/* Posición */}
            <div className="text-4xl w-14 text-center flex-shrink-0 font-black">
              {i < 3 ? medals[i] : <span className="text-slate-500 text-2xl">{i + 1}</span>}
            </div>
            {/* Logo + Nombre */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <SchoolLogo schoolName={team.schoolName} size={56} />
              <div className="min-w-0">
                <p className="text-2xl font-black text-white truncate">{team.teamName}</p>
                <p className="text-slate-400 text-base truncate">{team.schoolName}</p>
              </div>
            </div>
            {/* Score */}
            <div className="text-right flex-shrink-0">
              <p className={`text-5xl font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-blue-400'}`}>
                {team.score}
              </p>
              <p className="text-slate-500 text-sm font-mono">{fmtTime(team.lastTime)}</p>
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-700">
            <Icon name="trophy" className="w-16 h-16 mb-3" />
            <p className="text-xl font-bold">Competencia no iniciada</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center text-slate-700 text-xs uppercase tracking-widest">
        Adagames — Motor Modular Universal
      </div>
    </div>
  );
}

// ---- Panel Dual (dos categorías lado a lado) --------------------------------
function TVPanelDual({ teams, catA, catB }) {
  return (
    <div className="flex h-full">
      <div className="flex-1 border-r border-slate-800 overflow-hidden">
        <TVPanelIndividual teams={teams} categoryId={catA} />
      </div>
      <div className="flex-1 overflow-hidden">
        <TVPanelIndividual teams={teams} categoryId={catB} />
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.TVView = TVView;
