// view_eval_quest.js
// QUEST_ROWS y QUEST_COLS ya están definidos globalmente en view_pistas.js


function QuestEvalPanel({ team, ronda, currentUser, plugin, tracks, onAddScore, showToast, timerSeconds, competitionDuration }) {
  const [selPista, setSelPista] = React.useState(1);
  const [attemptType, setAttemptType] = React.useState('practice'); // 'practice' | 'evaluation' | 'practice_to_eval'
  const [progressIdx, setProgressIdx] = React.useState(-1);
  const [bonus, setBonus] = React.useState(false);
  const [bonusIntention, setBonusIntention] = React.useState(null);
  const [showConfirmSave, setShowConfirmSave] = React.useState(false);

  const track = (tracks[ronda] && tracks[ronda][selPista])
    ? tracks[ronda][selPista]
    : { sequence: [], obstacles: [], bonusPoints: 3 };

  // Pillar: Reglas de negocio (Bloqueo de duplicados y tickets)
  const existingEvaluation = React.useMemo(() => {
    return team?.history?.find(h => h.ronda === ronda && h.pista === selPista && h.practice !== true);
  }, [team, ronda, selPista]);

  const practiceRemaining = React.useMemo(() => {
    const roundPractices = team?.history?.filter(h => 
      h.ronda === ronda && (h.practice === true || h.convertedFromPractice === true)
    ) || [];
    return Math.max(0, 5 - roundPractices.length);
  }, [team, ronda]);

  const evalRemaining = React.useMemo(() => {
    const roundEval = team?.history?.find(h => h.ronda === ronda && h.pista === selPista && h.practice !== true);
    return !roundEval;
  }, [team, ronda, selPista]);

  // Forzar tipo de intento según disponibilidad
  React.useEffect(() => {
    if (practiceRemaining <= 0) {
      setAttemptType('evaluation');
    } else if (!evalRemaining) {
      setAttemptType('practice');
    }
  }, [practiceRemaining, evalRemaining]);

  const handleSave = () => {
    if (attemptType === 'evaluation' && !evalRemaining) {
      showToast('❌ Evaluación ya agotada para esta pista', 'error');
      return;
    }
    if (attemptType === 'practice' && practiceRemaining <= 0) {
      showToast('❌ Tickets de práctica agotados', 'error');
      return;
    }
    setShowConfirmSave(true);
  };

  const confirmSave = () => {
    const bonusValue = track.bonusPoints || 3;
    const total = (progressIdx + 1) + (bonus ? bonusValue : 0);

    let finalTimeMs = 0;
    if (selPista === 5) {
      let timeTakenSeconds = (competitionDuration * 60) - timerSeconds;
      if (timeTakenSeconds < 0) timeTakenSeconds = 0;
      finalTimeMs = timeTakenSeconds * 1000;
    }

    onAddScore(team.id, ronda, selPista, total, finalTimeMs, attemptType);
    
    // Reset local state
    setProgressIdx(-1);
    setBonus(false);
    setBonusIntention(null);
    setAttemptType('practice');
    setShowConfirmSave(false);
  };

  const trackImg = tracks?.[ronda]?.mapUrl || null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR DE CONTROL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2 uppercase">
              <Icon name="play-circle" className="text-blue-600" /> Mesa de Juez
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Pista</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(p => (
                    <button key={p} onClick={() => { setSelPista(p); setProgressIdx(-1); setBonusIntention(null); }} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${selPista === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                      P{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* TICKETS */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Tickets de Práctica</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-3 h-5 rounded-sm border ${i <= practiceRemaining ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200 border-slate-300 opacity-30'}`}></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-orange-100/50">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Evaluación P{selPista}</span>
                  <div className={`w-10 h-5 rounded-full flex items-center px-1 transition-all ${evalRemaining ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${evalRemaining ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[8px] font-black">{evalRemaining ? 'DISP.' : 'AGOT.'}</span>
                  </div>
                </div>
              </div>

              {/* MODO DE INTENTO */}
              {!existingEvaluation && evalRemaining && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => setAttemptType('practice')} disabled={practiceRemaining <= 0} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${attemptType === 'practice' ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'} ${practiceRemaining <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>🎟️ Práctica</button>
                    <button onClick={() => setAttemptType('evaluation')} disabled={!evalRemaining} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${attemptType === 'evaluation' ? 'bg-green-600 border-green-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'} ${!evalRemaining ? 'opacity-30 cursor-not-allowed' : ''}`}>🎯 Evaluación</button>
                  </div>
                  <button onClick={() => setAttemptType('practice_to_eval')} disabled={practiceRemaining <= 0 || !evalRemaining} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${attemptType === 'practice_to_eval' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'} ${practiceRemaining <= 0 || !evalRemaining ? 'opacity-30 cursor-not-allowed' : ''}`}>⭐ Práctica + Evaluación</button>
                </div>
              )}

              {existingEvaluation && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex gap-3 items-start animate-fadeIn">
                  <Icon name="info" className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Ya evaluado</p>
                    <p className="text-xs text-orange-800 font-medium">Este equipo ya fue evaluado en la Ronda {ronda} por {existingEvaluation.judgeName}.</p>
                  </div>
                </div>
              )}

              {/* BONUS SECTION */}
              {!existingEvaluation && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">¿Intento de Bonus?</label>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => setBonusIntention(true)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${bonusIntention === true ? 'bg-yellow-400 text-white shadow-lg border-2 border-yellow-400' : 'bg-white text-slate-400 border-2 border-slate-100 hover:bg-slate-50'}`}>SÍ</button>
                    <button onClick={() => { setBonusIntention(false); setBonus(false); }} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${bonusIntention === false ? 'bg-slate-800 text-white shadow-lg border-2 border-slate-800' : 'bg-white text-slate-400 border-2 border-slate-100 hover:bg-slate-50'}`}>NO</button>
                  </div>

                  {bonusIntention === true && (
                    <div className="bg-yellow-50/50 border border-yellow-200 p-4 rounded-xl mb-4 relative overflow-hidden animate-fadeIn">
                      <h4 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                        <Icon name="star" className="w-3 h-3" /> Reglas del Bonus
                      </h4>
                      {track.bonusStart && (
                        <p className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-2">
                          <span className="bg-yellow-200 px-2 py-0.5 rounded text-yellow-900 shadow-sm">⭐ {track.bonusStart}</span>
                          {track.bonusDir && <span className="bg-yellow-200 px-2 py-0.5 rounded text-yellow-900 shadow-sm">{track.bonusDir}</span>}
                        </p>
                      )}
                      <p className="text-xs font-medium text-yellow-700 italic border-t border-yellow-200/50 pt-2">{track.bonusRules || 'No hay notas adicionales'}</p>
                    </div>
                  )}

                  <button onClick={() => setBonus(!bonus)} disabled={!bonusIntention} className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${bonus ? 'bg-yellow-400 border-yellow-300 text-white shadow-lg' : 'bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50'} ${!bonusIntention ? 'opacity-30' : ''}`}>
                    <Icon name="star" className={bonus ? 'fill-white' : ''} /> LO LOGRARON (+{track.bonusPoints || 3} PTS)
                  </button>
                </div>
              )}

              {/* PUNTAJE TOTAL */}
              <div className="bg-blue-600 rounded-3xl p-6 text-center shadow-2xl">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Puntos a Sumar</p>
                <div className="text-7xl font-black text-white">
                  {existingEvaluation ? existingEvaluation.points : ((progressIdx + 1) + (bonus ? (track.bonusPoints || 3) : 0))}
                </div>
              </div>

              <button onClick={handleSave} disabled={progressIdx === -1 || existingEvaluation} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black py-5 rounded-2xl shadow-lg transition-all uppercase tracking-widest">
                {existingEvaluation ? 'Registrado' : 'Guardar Resultado'}
              </button>
            </div>
          </div>
        </div>

        {/* MAPA DE SEGUIMIENTO */}
        <div className="lg:col-span-8 bg-white p-2 md:p-4 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col items-stretch relative overflow-hidden">
          {existingEvaluation && <div className="absolute inset-0 z-20 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/90 px-8 py-4 rounded-full shadow-2xl border border-white font-black text-blue-900 uppercase tracking-widest text-sm flex items-center gap-3">
              <Icon name="lock" className="w-4 h-4" /> Vista de Lectura
            </div>
          </div>}

          <div className="text-center mb-6">
            <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Panel de Seguimiento</span>
            <h3 className="text-2xl font-black text-blue-900 mt-3 uppercase italic">Pista {selPista} - Ronda {ronda}</h3>
          </div>

          <div className="w-full overflow-x-auto pb-4 custom-scrollbar relative">
            <div className="w-full min-w-[700px] border-[12px] border-blue-600 rounded-[3rem] bg-white shadow-2xl overflow-hidden relative">
              {/* Imagen de fondo del mapa */}
              {trackImg && (
                <img src={trackImg} className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" alt="" />
              )}
              
              <div className="relative z-10 grid bg-blue-600 text-white font-black text-[11px]" style={{ gridTemplateColumns: '40px repeat(10, 1fr)' }}>
                <div className="p-3 border-r border-blue-500/50 bg-blue-700 text-center">#</div>
                {QUEST_COLS.map(c => <div key={c} className="p-3 text-center">{c}</div>)}
              </div>
              
              {QUEST_ROWS.map(r => (
                <div key={r} className="relative z-10 grid border-b border-blue-100 last:border-0" style={{ gridTemplateColumns: '40px repeat(10, 1fr)' }}>
                  <div className="bg-blue-600 text-white font-black text-[11px] flex items-center justify-center border-r border-blue-500/50 p-3">{r}</div>
                  {QUEST_COLS.map(c => {
                    const id = `${c}${r}`;
                    const seqIdx = track.sequence.indexOf(id);
                    const isObs = track.obstacles.includes(id);
                    
                    const evalIdx = existingEvaluation 
                      ? existingEvaluation.points - (existingEvaluation.points > track.sequence.length ? (track.bonusPoints || 3) : 0) - 1 
                      : -1;
                    
                    const isReached = seqIdx !== -1 && (existingEvaluation ? seqIdx <= evalIdx : seqIdx <= progressIdx);
                    const isBonusStart = bonusIntention && track.bonusStart === id;

                    return (
                      <button key={id} onClick={() => !existingEvaluation && seqIdx !== -1 && setProgressIdx(seqIdx)} className={`aspect-square border-r border-blue-100 last:border-0 flex items-center justify-center relative transition-all ${seqIdx !== -1 ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}`}>
                        {isBonusStart && <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 flex items-center justify-center shadow-xl rounded-full border-2 border-white z-20 text-sm">⭐</div>}
                        
                        {isReached && (
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shadow-lg border-2 border-blue-300 animate-scaleIn">
                            {seqIdx + 1}
                          </div>
                        )}
                        {!isReached && seqIdx !== -1 && (
                          <div className="w-8 h-8 rounded-full border-2 border-blue-200 text-blue-200 font-bold flex items-center justify-center">
                            {seqIdx + 1}
                          </div>
                        )}
                        {isObs && (
                          <div className="w-10 h-10 bg-red-600 flex items-center justify-center shadow-xl rounded-md border-2 border-red-400">
                            <Icon name="x-circle" className="text-white w-7 h-7" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmSave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="check-circle" className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase italic">¿Guardar Intento?</h3>
            <p className="text-slate-500 mb-8 font-medium">Se registrarán <strong>{(progressIdx + 1) + (bonus ? (track.bonusPoints || 3) : 0)} puntos</strong> para el equipo <strong>{team.teamName}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmSave(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Cancelar</button>
              <button onClick={confirmSave} className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-500/30 transition-all uppercase tracking-widest text-xs">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.QuestEvalPanel = QuestEvalPanel;
