// view_eval_lf.js
// Re-implementación fiel al diseño original solicitado por el usuario

function LineFollowerEvalPanel({ team, ronda: propRonda, currentUser, plugin, tracks, onAddScore, showToast, onBack }) {
  // Estado local sincronizado con props y tracks
  const [selRonda, setSelRonda] = React.useState(propRonda || 1);
  const [selPista, setSelPista] = React.useState(1);
  const [points, setPoints] = React.useState([]);
  const [bgImage, setBgImage] = React.useState(null);
  const [guideX, setGuideX] = React.useState(50);
  const [guideY, setGuideY] = React.useState(50);
  
  const [time, setTime] = React.useState(120000);
  const [running, setRunning] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const [attemptType, setAttemptType] = React.useState('evaluation');
  const [penalties, setPenalties] = React.useState(0);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const maxSecs = React.useMemo(() => parseInt(localStorage.getItem('ada_lf_max_secs') || plugin.timerSeconds || 180), [plugin.timerSeconds]);
  const maxAttempts = plugin.maxAttempts || 3;

  React.useEffect(() => {
    setTime(maxSecs * 1000);
  }, [maxSecs]);



  // DERIVACIÓN ULTRA-ROBUSTA DE DATOS DE PISTA
  const trackData = React.useMemo(() => {
    if (!tracks) return {};
    
    // Lista de posibles contenedores de rondas
    const containers = [
      tracks,                          // Estructura directa: { "1": {...} }
      tracks.tracks,                   // Estructura envuelta: { tracks: { "1": {...} } }
      tracks.line_follower,            // Estructura global: { line_follower: { "1": {...} } }
      tracks.line_follower?.tracks     // Estructura global anidada
    ];

    let rData = null;
    for (const c of containers) {
      if (!c) continue;
      rData = c[selRonda] || c[selRonda.toString()];
      if (rData) break;
    }

    if (rData) {
      return rData[selPista] || rData[selPista.toString()] || {};
    }
    
    // Log de emergencia si no se encuentra nada
    console.warn("[LF Eval] No se encontró rData para:", { ronda: selRonda, pista: selPista, keys: Object.keys(tracks) });
    return {};
  }, [tracks, selRonda, selPista]);

  const trackDataStr = React.useMemo(() => JSON.stringify(trackData), [trackData]);

  // Actualizar estados locales cuando derivamos nuevos datos
  React.useEffect(() => {
    // Estabilizar datos para evitar bucles
    const data = trackData || {};
    const newBg = data.bgImage || data.mapUrl || null;
    const newPoints = Array.isArray(data.points) ? data.points : [];
    
    console.log("[LF Eval] CARGANDO PISTA:", { 
      ronda: selRonda, 
      pista: selPista, 
      hasBg: !!newBg, 
      pointsCount: newPoints.length,
      url: newBg 
    });
    
    setBgImage(newBg);
    setPoints(newPoints.map(p => ({ ...p, isCompleted: false })));
    setGuideX(data.guideX !== undefined ? data.guideX : 50);
    setGuideY(data.guideY !== undefined ? data.guideY : 50);
  }, [trackDataStr, selRonda, selPista]);

  // Sincronizar ronda si cambia desde el selector superior del router
  React.useEffect(() => {
    const pR = parseInt(propRonda);
    const sR = parseInt(selRonda);
    if (pR && pR !== sR) {
      console.log("[LF Eval] Sincronizando Ronda desde Router:", pR);
      setSelRonda(pR);
    }
  }, [propRonda]);

  React.useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (maxSecs * 1000) - elapsed);
        setTime(remaining);
        if (remaining <= 0) setRunning(false);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [running, startTime, maxSecs]);

  const togglePoint = (id) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p));
  };

  const currentScore = points.reduce((acc, p) => acc + (p.isCompleted ? p.value : 0), 0);
  const maxScore = points.reduce((acc, p) => acc + p.value, 0);

  const formatStopwatch = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const msecs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const requestSave = () => {
    const prevAttempts = (team.history || []).filter(h => !h.practice && !h.voided && h.ronda === selRonda && h.pista === selPista).length;
    if (prevAttempts >= maxAttempts && attemptType !== 'practice') {
      showToast('⚠️ Sin intentos disponibles para esta pista.');
      return;
    }
    setRunning(false);
    setShowConfirm(true);
  };

  const confirmSave = () => {
    const timeTaken = (maxSecs * 1000) - time;
    const finalTime = timeTaken + (penalties * 5000);
    onAddScore(team.id, selRonda, selPista, currentScore, finalTime, attemptType, { penalties });
    showToast(`✅ Guardado: ${currentScore} pts`, 'success');
    setShowConfirm(false);
  };

  const prevAttemptsCount = (team.history || []).filter(h => !h.practice && !h.voided && h.ronda === selRonda && h.pista === selPista).length;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn max-w-[1200px] mx-auto pb-10">
      
      {/* SECCIÓN SUPERIOR: MESA DEL JUEZ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* PANEL IZQUIERDO: CONTROLES */}
        <div className="lg:col-span-7 bg-[#161925] border border-[#2a2e3f] rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Mesa del Juez</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex-1">Equipo en Pista</label>
                  {onBack && (
                    <button onClick={onBack} className="text-[10px] bg-[#2a2e3f] hover:bg-blue-600 px-3 py-1 rounded text-white font-bold transition-colors shadow flex items-center gap-1">
                      <Icon name="users" className="w-3 h-3" /> Cambiar
                    </button>
                  )}
                </div>
                <div className="bg-[#0a0c12] border border-[#2a2e3f] rounded-xl px-4 py-3 text-white font-black text-sm uppercase italic truncate">
                  {team.name || team.teamName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Ronda</label>
                  <select value={selRonda} onChange={e => setSelRonda(parseInt(e.target.value))} className="w-full bg-[#0a0c12] border border-[#2a2e3f] rounded-xl px-3 py-2.5 text-xs font-black text-white outline-none">
                    {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>Ronda {r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Pista</label>
                  <select value={selPista} onChange={e => setSelPista(parseInt(e.target.value))} className="w-full bg-[#0a0c12] border border-[#2a2e3f] rounded-xl px-3 py-2.5 text-xs font-black text-white outline-none">
                    {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>Pista {p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intentos (Máx {maxAttempts})</label>
               <div className="flex gap-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${i <= prevAttemptsCount ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-[#0a0c12] border-[#2a2e3f]'}`}></div>
                 ))}
               </div>
               <div className="flex bg-[#0a0c12] p-1 rounded-xl border border-[#2a2e3f] mt-2">
                {['practice', 'evaluation'].map(t => (
                  <button key={t} onClick={() => setAttemptType(t)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${attemptType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                    {t === 'practice' ? 'Práctica' : 'Oficial'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL: TIMER */}
        <div className="lg:col-span-3 bg-[#161925] border border-[#2a2e3f] rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon name="clock" className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Tiempo Restante</span>
          </div>
          <div className={`text-6xl font-black font-mono tracking-tighter ${time < 20000 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {formatStopwatch(time)}
          </div>
          {!running ? (
            <button onClick={() => { setStartTime(Date.now() - ((maxSecs * 1000) - time)); setRunning(true); }} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-green-900/20">
              <Icon name="play" className="w-4 h-4 fill-current" /> Iniciar
            </button>
          ) : (
            <button onClick={() => setRunning(false)} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-orange-900/20">
              <Icon name="pause" className="w-4 h-4 fill-current" /> Pausar
            </button>
          )}
        </div>

        {/* PANEL DERECHO: SCORE */}
        <div className="lg:col-span-2 bg-blue-600 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center justify-center text-white border-b-8 border-blue-800 transform hover:scale-[1.02] transition-transform">
          <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80 text-center">Puntos Actuales</span>
          <span className="text-7xl font-black tracking-tighter drop-shadow-2xl">{currentScore}</span>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-[10px] font-black opacity-60 uppercase">{maxScore} MAX</span>
            <span className="text-[9px] font-black opacity-40">{Math.round((currentScore/maxScore)*100) || 0}%</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TABLERO DE EVALUACIÓN */}
      <div className="bg-[#161925] border border-[#2a2e3f] rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#2a2e3f] pb-6">
          <div className="flex items-center gap-3">
            <Icon name="map" className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Tablero de Evaluación</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setPenalties(p => p + 1)} className="px-6 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
              <Icon name="alert-triangle" className="w-4 h-4" /> Penalización {penalties > 0 && `(${penalties})`}
            </button>
            <button onClick={() => { setPoints(points.map(p => ({ ...p, isCompleted: false }))); setPenalties(0); setTime(maxSecs * 1000); setRunning(false); }} className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-[10px] font-black uppercase transition-all">
              Reiniciar
            </button>
            <button onClick={requestSave} className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-1">
              <Icon name="save" className="w-4 h-4" /> Guardar Intento
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[16/9] bg-white rounded-3xl overflow-hidden shadow-inner border-2 border-[#2a2e3f] group">
          {bgImage ? (
            <img src={bgImage} className="w-full h-full object-fill select-none pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
              <div className="bg-[#161925] p-8 rounded-[2rem] border border-[#2a2e3f] shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Icon name="map-pin" className="w-10 h-10 text-blue-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Pista no configurada</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">No hay mapa ni puntos registrados para Ronda {selRonda} — Pista {selPista}.</p>
                </div>
                {/* Debug info para el desarrollador si tracks está presente pero vacío */}
                <div className="mt-4 pt-4 border-t border-[#2a2e3f] w-full">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Estado de Sincronización</p>
                  <div className="flex justify-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${tracks ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      DATA: {tracks ? (Object.keys(tracks).length > 0 ? 'POBLADA' : 'VACÍA') : 'NULL'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-black">
                      KEYS: {tracks ? Object.keys(tracks).join(',') : 'NONE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guías rojas discontinuas como en la foto */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500/60" style={{ left: `${guideX}%` }}></div>
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-red-500/60" style={{ top: `${guideY}%` }}></div>
            
            {/* Etiquetas de cuadrantes */}
            <span className="absolute text-[10px] font-black text-slate-500 p-4" style={{ top: 0, left: 0 }}>Q1 Sup Izq</span>
            <span className="absolute text-[10px] font-black text-slate-500 p-4" style={{ top: 0, right: 0 }}>Q2 Sup Der</span>
          </div>

          {/* Puntos interactivos */}
          {points.map(p => (
            <button key={p.id} onClick={() => togglePoint(p.id)}
              className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-4 shadow-2xl flex items-center justify-center font-black text-xs transition-all transform hover:scale-110 active:scale-90 z-10 ${p.isCompleted ? 'bg-green-500 border-white text-white shadow-green-500/50 scale-110 rotate-[360deg]' : 'bg-slate-900/80 border-slate-700 text-slate-300'}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {p.isCompleted ? <Icon name="check" className="w-6 h-6" /> : p.value}
            </button>
          ))}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[#0a0c12]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161925] border border-[#2a2e3f] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Confirmación de Juez</p>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                  <Icon name="check-square" className="w-5 h-5" /> Verificar Datos
                </h3>
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-blue-200 hover:text-white bg-blue-700/50 hover:bg-blue-700 p-2 rounded-full transition-colors">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#0a0c12] border border-[#2a2e3f] rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Equipo Evaluado</p>
                <p className="text-lg font-black text-white leading-tight">{team.teamName}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">{team.schoolName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0c12] border border-[#2a2e3f] rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Puntuación Final</p>
                  <p className="text-3xl font-black text-blue-500 leading-none">{currentScore}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Puntos</p>
                </div>
                <div className="bg-[#0a0c12] border border-[#2a2e3f] rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tiempo Registrado</p>
                  <p className="text-3xl font-black text-orange-500 leading-none">{((maxSecs * 1000 - time) / 1000).toFixed(2)}s</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Segundos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-[#0a0c12] border border-[#2a2e3f] rounded-2xl p-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ronda</p>
                  <p className="text-sm font-black text-white">Ronda {selRonda}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pista</p>
                  <p className="text-sm font-black text-white">Pista {selPista}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#2a2e3f] grid grid-cols-2 gap-4 bg-[#11131c]">
              <button onClick={() => setShowConfirm(false)} className="py-4 rounded-xl font-black text-xs uppercase text-slate-400 hover:text-white bg-[#1a1d2d] hover:bg-[#2a2e3f] transition-colors">
                Cancelar
              </button>
              <button onClick={confirmSave} className="py-4 rounded-xl font-black text-xs uppercase text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <Icon name="save" className="w-4 h-4" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

window.LineFollowerEvalPanel = LineFollowerEvalPanel;
