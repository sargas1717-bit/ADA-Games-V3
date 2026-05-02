// view_eval_sumo.js - Evaluación Sumo Bots con arena y condiciones por ronda

// Condiciones/pistas que se pueden configurar para Sumo
const SUMO_CONDITIONS = [
  { id: 'ring_out',    label: '🔵 Fuera del Ring',  pts: 1, desc: 'Robot empuja al rival fuera del tatami' },
  { id: 'immobilize',  label: '🔴 Inmovilización',  pts: 1, desc: 'Robot deja al rival sin movimiento por 5s' },
  { id: 'fall_out',    label: '⚪ Caída propia',     pts: -1, desc: 'Robot propio cae o sale solo (penalización)' },
  { id: 'timeout_win', label: '⏱️ Por Tiempo',       pts: 1, desc: 'Se acaba el tiempo y el robot domina el ring' },
];

function SumoEvalPanel({ team, ronda, currentUser, plugin, onAddScore, showToast, allTeams }) {
  const [rivalId, setRivalId] = React.useState('');
  const [events, setEvents] = React.useState([]); // { type, pts, time }
  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [roundTime] = React.useState(180); // 3 minutos por combate
  const intervalRef = React.useRef(null);

  // Solo equipos de la misma categoría, excluyendo el actual
  const rivals = (allTeams || []).filter(t => t.category === team.category && t.id !== team.id && t.status === 'inspected');

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => { if (prev >= roundTime) { setRunning(false); return roundTime; } return prev + 1; });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmtTime = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const remaining = roundTime - elapsed;
  const wins = events.filter(e => e.pts > 0).length;
  const fouls = events.filter(e => e.pts < 0).length;
  const totalScore = events.reduce((acc, e) => acc + e.pts, 0);

  const addEvent = (condition) => {
    setEvents(prev => [...prev, { ...condition, time: elapsed, timestamp: new Date().toLocaleTimeString() }]);
  };

  const removeLastEvent = () => setEvents(prev => prev.slice(0, -1));

  const handleSave = () => {
    if (!rivalId) { showToast('⚠️ Selecciona un rival antes de guardar.'); return; }
    // Guardamos wins, losses si el score es negativo, etc.
    const finalScore = Math.max(0, totalScore);
    const data = { 
      wins: events.filter(e => e.pts > 0).length,
      draws: events.filter(e => e.pts === 0).length,
      rivalId 
    };
    onAddScore(team.id, ronda, 1, finalScore, elapsed * 1000, 'evaluation', data);
    setEvents([]); setElapsed(0); setRunning(false); setRivalId('');
    showToast(`✅ Combate R${ronda}: ${finalScore} pts guardados`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Sumo Bots — Ronda {ronda}</h3>
        <div className={`text-3xl font-black font-mono ${remaining <= 30 ? 'text-red-600 animate-pulse' : 'text-red-700'}`}>
          {fmtTime(remaining)}
        </div>
      </div>

      {/* Selector de rival */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center border-2 border-blue-200">
          <p className="text-xs text-blue-500 mb-1 font-medium">EVALUADO</p>
          <p className="font-black text-blue-800 text-sm truncate">{team.teamName}</p>
          <p className="text-blue-500 text-xs truncate">{team.schoolName}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">VS — Rival</label>
          <select value={rivalId} onChange={e => setRivalId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="">-- Seleccionar --</option>
            {rivals.map(r => <option key={r.id} value={r.id}>{r.teamName}</option>)}
          </select>
        </div>
      </div>

      {/* Controles de tiempo */}
      <div className="flex gap-2">
        <button onClick={() => setRunning(r => !r)}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${running ? 'bg-red-500 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {running ? '⏹ Detener' : '▶ Iniciar Combate'}
        </button>
        <button onClick={() => { setRunning(false); setElapsed(0); setEvents([]); }}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">↺ Reset</button>
      </div>

      {/* Botones de Condiciones/Pistas */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registrar Evento</p>
        <div className="grid grid-cols-2 gap-2">
          {SUMO_CONDITIONS.map(c => (
            <button key={c.id} onClick={() => addEvent(c)}
              className={`p-3 rounded-xl border-2 text-left transition hover:scale-105 active:scale-95 ${c.pts > 0 ? 'border-green-200 bg-green-50 hover:bg-green-100' : 'border-red-200 bg-red-50 hover:bg-red-100'}`}>
              <p className="font-bold text-sm">{c.label}</p>
              <p className="text-xs text-slate-500">{c.desc}</p>
              <p className={`text-xs font-black mt-1 ${c.pts > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {c.pts > 0 ? '+' : ''}{c.pts} pts
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Log de eventos */}
      {events.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-500">Log del combate</p>
            <button onClick={removeLastEvent} className="text-xs text-red-400 hover:text-red-600">↩ Deshacer</button>
          </div>
          {events.map((e, i) => (
            <div key={i} className="flex justify-between text-xs py-0.5">
              <span>{e.label}</span>
              <span className="font-mono text-slate-400">{fmtTime(e.time)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Totales y guardar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-center"><p className="text-2xl font-black text-green-600">{wins}</p><p className="text-xs text-slate-400">Puntos</p></div>
          <div className="text-center"><p className="text-2xl font-black text-red-500">{fouls}</p><p className="text-xs text-slate-400">Faltas</p></div>
          <div className="text-center"><p className="text-2xl font-black text-blue-700">{Math.max(0, totalScore)}</p><p className="text-xs text-slate-400">Score</p></div>
        </div>
        <button onClick={handleSave}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl">
          Guardar Combate
        </button>
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.SumoEvalPanel = SumoEvalPanel;
