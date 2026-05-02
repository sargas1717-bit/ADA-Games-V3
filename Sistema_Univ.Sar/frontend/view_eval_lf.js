// view_eval_lf.js
const LF_ROWS = [6,5,4,3,2,1];
const LF_COLS = ['A','B','C','D','E','F','G','H','I','J'];

function LineFollowerEvalPanel({ team, ronda, currentUser, plugin, onAddScore, showToast }) {
  const [selected, setSelected] = React.useState(new Set());
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [attemptType, setAttemptType] = React.useState('evaluation');
  const intervalRef = React.useRef(null);
  
  const maxSecs = plugin.timerSeconds || 120;
  const prevAttempts = (team.history || []).filter(h => !h.practice && !h.voided && h.ronda === ronda).length;
  const maxAttempts = plugin.maxAttempts || 3;
  const attemptsLeft = maxAttempts - prevAttempts;

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= maxSecs) { setRunning(false); return maxSecs; }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, maxSecs]);

  const remaining = maxSecs - elapsed;
  const fmtTime = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const totalCells = LF_ROWS.length * LF_COLS.length;
  const percentage = Math.round((selected.size / totalCells) * 100);

  const handleToggle = (key) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const handleSave = () => {
    if (attemptsLeft <= 0 && attemptType !== 'practice') {
      showToast('⚠️ Sin intentos disponibles en esta ronda.');
      return;
    }
    setRunning(false);
    onAddScore(team.id, ronda, 1, percentage, elapsed * 1000, attemptType);
    setSelected(new Set());
    setElapsed(0);
    showToast(`✅ Intento guardado: ${percentage}% en ${fmtTime(elapsed)}`);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setSelected(new Set());
  };

  const bestAttempt = (team.history || []).filter(h => !h.practice && !h.voided && h.ronda === ronda).reduce((best, h) => {
    const pts = h.points || h.percentage || 0;
    return pts > (best?.points || 0) ? h : best;
  }, null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-slate-700">Seguidor de Línea — Ronda {ronda}</h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < prevAttempts ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-300'}`} />
            ))}
          </div>
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${attemptsLeft > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {attemptsLeft > 0 ? `${attemptsLeft} disponibles` : 'Agotados'}
          </span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['practice','evaluation'].map(t => (
              <button key={t} onClick={() => setAttemptType(t)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${attemptType===t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                {t === 'practice' ? 'Práctica' : 'Oficial'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-6 shadow-inner relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
            <div className={`text-6xl font-black font-mono tracking-tighter ${remaining <= 20 ? 'text-red-500 animate-pulse' : remaining <= 60 ? 'text-orange-400' : 'text-blue-400'}`}>
              {fmtTime(remaining)}
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <button onClick={() => setRunning(r => !r)} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${running ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'}`}>
                {running ? '⏹ Detener' : '▶ Iniciar'}
              </button>
              <button onClick={handleReset} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold text-xs uppercase transition-all">
                ↺ Resetear
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-5xl font-black text-green-600">{percentage}%</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{selected.size} / {totalCells} celdas cruzadas</p>
            </div>
            <button onClick={handleSave} disabled={attemptsLeft <= 0 && attemptType !== 'practice'} className={`px-8 py-4 font-black text-sm uppercase rounded-2xl transition-all shadow-lg ${attemptsLeft > 0 || attemptType === 'practice' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              Guardar Score
            </button>
          </div>
          
          {bestAttempt && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mejor intento guardado:</span>
              <span className="text-lg font-black text-blue-800">{bestAttempt.points || bestAttempt.percentage}% <span className="text-sm font-bold text-blue-500 ml-2">en {fmtTime((bestAttempt.finalTimeMs||0)/1000)}</span></span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 bg-white border-2 border-slate-100 p-4 rounded-2xl shadow-sm self-start">
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex mb-1 ml-6">
                {LF_COLS.map(c => <div key={c} className="w-8 text-center text-[10px] text-slate-400 font-black">{c}</div>)}
              </div>
              {LF_ROWS.map(row => (
                <div key={row} className="flex items-center mb-1">
                  <span className="text-[10px] text-slate-400 font-black w-5 text-right mr-1">{row}</span>
                  {LF_COLS.map(col => {
                    const key = `${col}${row}`;
                    const isSel = selected.has(key);
                    return (
                      <button key={key} onClick={() => handleToggle(key)} className={`w-8 h-8 mx-0.5 rounded-lg text-xs font-black border-2 transition-all ${isSel ? 'bg-green-500 border-green-600 text-white scale-105 shadow-md' : 'bg-slate-50 border-slate-200 text-transparent hover:bg-green-50 hover:border-green-300 hover:text-green-300'}`}>
                        {isSel ? '✓' : '✓'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LineFollowerEvalPanel = LineFollowerEvalPanel;
