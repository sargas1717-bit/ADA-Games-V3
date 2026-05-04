// ============================================================================
// view_tv.js - MODO TELEVISIÓN / PANTALLA DE COMPETENCIA (V5)
// Sistema_Univ.Sar - Motor Modular Adagames
// ============================================================================

function TVView({ teams, currentUser, onClose }) {
  const [tvMode, setTvMode] = React.useState('individual');  // 'individual' | 'dual'
  const [catA, setCatA] = React.useState(currentUser?.category || 'quest');
  const [catB, setCatB] = React.useState('line_follower');
  const [showConfig, setShowConfig] = React.useState(true);
  const [selRondaView, setSelRondaView] = React.useState('global'); // 'global' | '1'..'5'
  const [suspenseMode, setSuspenseMode] = React.useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = React.useState(false);

  const activeCategories = Object.values(CATEGORY_REGISTRY);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col font-sans overflow-hidden animate-fadeIn">
      
      {/* ---- PANEL DE CONFIGURACIÓN ---- */}
      {showConfig && (
        <div className="absolute inset-0 bg-slate-950/98 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl border border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Configurar Pantalla TV</h2>
                <p className="text-slate-400 text-sm font-medium">Selecciona el modo y las categorías para la transmisión</p>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { id: 'individual', label: 'Modo Individual', icon: 'monitor', desc: 'Con Podio Animado y Tabla' },
                { id: 'dual', label: 'Modo Dual', icon: 'layout', desc: 'Dos categorías comparativas' },
              ].map(m => (
                <button key={m.id} onClick={() => setTvMode(m.id)}
                  className={`flex flex-col p-6 rounded-3xl border-2 text-left transition-all ${tvMode === m.id ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'}`}>
                  <Icon name={m.icon} className={`w-8 h-8 mb-3 ${tvMode === m.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  <p className="font-black text-white text-lg uppercase tracking-tight">{m.label}</p>
                  <p className="text-slate-400 text-xs mt-1 font-medium">{m.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    {tvMode === 'dual' ? 'Panel Izquierdo' : 'Categoría Principal'}
                  </label>
                  <select value={catA} onChange={e => setCatA(e.target.value)}
                    className="w-full bg-slate-800/80 text-white rounded-2xl px-5 py-3.5 border-2 border-slate-700 focus:outline-none focus:border-blue-500 font-bold cursor-pointer">
                    {activeCategories.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                {tvMode === 'dual' && (
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Panel Derecho</label>
                    <select value={catB} onChange={e => setCatB(e.target.value)}
                      className="w-full bg-slate-800/80 text-white rounded-2xl px-5 py-3.5 border-2 border-slate-700 focus:outline-none focus:border-blue-500 font-bold cursor-pointer">
                      {activeCategories.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setShowConfig(false)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest active:scale-95">
              ▶ Iniciar Transmisión
            </button>
          </div>
        </div>
      )}

      {/* ---- HEADER GLOBAL ---- */}
      {!showConfig && (
        <div className="flex justify-between items-center px-8 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex-shrink-0 z-[60]">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
              <Icon name="layout" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase">Ranking {tvMode === 'dual' ? 'Dual' : 'Individual'}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                Sincronizado en tiempo real · Adagames 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Modo Suspenso</span>
              <button
                onClick={() => setSuspenseMode(!suspenseMode)}
                className={`w-10 h-5 rounded-full relative transition-all ${suspenseMode ? 'bg-orange-500' : 'bg-slate-700'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${suspenseMode ? 'left-[22px]' : 'left-[4px]'}`}></div>
              </button>
            </div>

            <button onClick={() => setIsAutoScrolling(!isAutoScrolling)} 
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${isAutoScrolling ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              <Icon name="chevron-down" className={`w-3 h-3 ${isAutoScrolling ? 'animate-bounce' : ''}`} /> Auto Scroll
            </button>

            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button onClick={() => setSelRondaView('global')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selRondaView === 'global' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Global</button>
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setSelRondaView(r.toString())} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selRondaView === r.toString() ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>R{r}</button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowConfig(true)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl border border-slate-700"><Icon name="settings" className="w-5 h-5" /></button>
              <button onClick={onClose} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase transition-all border border-red-500/20">Salir</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- CONTENIDO ---- */}
      {!showConfig && (
        <div className="flex flex-1 overflow-hidden">
          {tvMode === 'individual' ? (
            <TVPanelIndividual 
              teams={teams} 
              categoryId={catA} 
              selectedRound={selRondaView} 
              suspenseMode={suspenseMode}
              autoScroll={isAutoScrolling}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex w-full h-full divide-x divide-slate-800">
              <div className="flex-1 overflow-hidden">
                <TVPanelIndividual teams={teams} categoryId={catA} selectedRound={selRondaView} suspenseMode={suspenseMode} autoScroll={isAutoScrolling} currentUser={currentUser} isDual />
              </div>
              <div className="flex-1 overflow-hidden">
                <TVPanelIndividual teams={teams} categoryId={catB} selectedRound={selRondaView} suspenseMode={suspenseMode} autoScroll={isAutoScrolling} currentUser={currentUser} isDual />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TVPanelIndividual({ teams, categoryId, selectedRound, suspenseMode, autoScroll, currentUser, isDual }) {
  const plugin = getCategoryPlugin(categoryId);
  const { timer, timerActive, toggle, reset, formatTime: formatTimer } = useCategoryTimer(categoryId);
  const listRef = React.useRef(null);
  const prevPositions = React.useRef({});
  const [shuffleSeed, setShuffleSeed] = React.useState(0);
  const [isShuffling, setIsShuffling] = React.useState(false);

  React.useEffect(() => {
    let interval;
    if (autoScroll) {
      interval = setInterval(() => {
        if (listRef.current) {
          const maxScroll = listRef.current.scrollHeight - listRef.current.clientHeight;
          if (listRef.current.scrollTop >= maxScroll - 5) {
            setTimeout(() => { if (listRef.current) listRef.current.scrollTop = 0; }, 3000);
          } else {
            listRef.current.scrollTop += 1;
          }
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [autoScroll]);

  React.useLayoutEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.children;
    for (let card of cards) {
      const id = card.getAttribute('data-id');
      const rect = card.getBoundingClientRect();
      if (prevPositions.current[id]) {
        const delta = prevPositions.current[id] - rect.top;
        if (delta !== 0) {
          card.style.transition = 'none';
          card.style.transform = `translateY(${delta}px)`;
          requestAnimationFrame(() => {
            card.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = 'translateY(0)';
          });
        }
      }
      prevPositions.current[id] = rect.top;
    }
  });

  React.useEffect(() => {
    let timeout;
    if (suspenseMode) {
      const schedule = () => {
        const delay = Math.floor(Math.random() * (15000)) + 10000;
        timeout = setTimeout(() => {
          setIsShuffling(true);
          setShuffleSeed(s => s + 1);
          setTimeout(() => setIsShuffling(false), 800);
          schedule();
        }, delay);
      };
      schedule();
    } else {
      setShuffleSeed(0);
      setIsShuffling(false);
    }
    return () => clearTimeout(timeout);
  }, [suspenseMode]);

  const liveTeams = teams.length > 0 ? teams : JSON.parse(localStorage.getItem('ada_teams') || '[]');
  const ranked = React.useMemo(() => {
    const list = liveTeams.filter(t => t.category === categoryId && t.status !== 'disqualified');
    const rd = parseInt(selectedRound);
    const filtered = selectedRound === 'global' ? list : list.filter(t => 
      (t.qualifiedRounds || [1]).includes(rd) || (t.history && t.history.some(h => h.ronda === rd))
    );
    const processed = filtered.map(t => {
      let res = selectedRound === 'global' ? calculateTeamScore(t) : calculateTeamRoundScore(t, rd);
      return { ...t, score: res.score, lastTime: res.lastTime };
    });
    if (suspenseMode) {
      let result = [...processed];
      const pseudoRandom = (s) => {
        let x = Math.sin(s + shuffleSeed + (categoryId === 'quest' ? 1 : 2)) * 10000;
        return x - Math.floor(x);
      };
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(pseudoRandom(i) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }
    return processed.sort(plugin.rankingSort);
  }, [liveTeams, categoryId, selectedRound, suspenseMode, shuffleSeed]);

  const fmtTime = (ms) => {
    if (!ms || ms >= 999999 || ms === 0) return "--:--.--";
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), ms_ = Math.floor((ms % 1000) / 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms_.toString().padStart(2, '0')}`;
  };

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="flex flex-col h-full bg-[#0a0c12]">
      {/* HEADER CON CRONÓMETRO PREMIUM */}
      <div className={`p-6 border-b border-white/5 flex flex-col items-center bg-slate-950 relative overflow-hidden`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-10 h-10 ${plugin.colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon name={plugin.icon} className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/90">{plugin.title}</h2>
        </div>

        {/* Cronómetro estilo "Digital Glow" */}
        <div className={`relative px-12 py-4 rounded-[1.5rem] bg-[#05070a] border-2 transition-all duration-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${timer < 300 && timerActive ? 'border-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-slate-800'}`}>
          <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
          <p className={`relative text-7xl font-black font-mono tracking-tighter leading-none ${timer < 300 && timerActive ? 'text-red-500' : 'text-white'}`} style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            {formatTimer(timer)}
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="flex gap-2 mt-4 z-10">
            <button onClick={toggle} className={`px-5 py-1.5 rounded-lg font-black text-[9px] uppercase transition-all ${timerActive ? 'bg-orange-500' : 'bg-emerald-600'} text-white shadow-lg`}>{timerActive ? 'PAUSAR' : 'INICIAR'}</button>
            <button onClick={() => reset(30 * 60)} className="px-5 py-1.5 bg-slate-800 text-slate-400 rounded-lg font-black text-[9px] uppercase border border-slate-700">RESET</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* PODIO */}
        {!isShuffling && ranked.length > 0 && !isDual && (
          <div className="flex items-end justify-center gap-4 py-8 animate-fadeIn">
            {/* 2do */}
            <div className="w-64 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center transform hover:scale-105 transition-all">
              <div className="relative inline-block mb-4">
                <SchoolLogo schoolName={top3[1]?.schoolName} size={80} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-black border-2 border-[#0a0c12]">2</div>
              </div>
              <p className="text-lg font-black text-white uppercase truncate">{top3[1]?.teamName || '---'}</p>
              <div className="bg-slate-400/20 text-slate-300 font-black py-1 px-4 rounded-full inline-block mt-2 text-xl">{suspenseMode ? '??' : (top3[1]?.score || 0)} <span className="text-[10px] opacity-60">PTS</span></div>
            </div>

            {/* 1ro */}
            <div className="w-80 bg-gradient-to-b from-slate-900 to-black border-2 border-yellow-500/50 rounded-[2.5rem] p-8 text-center transform -translate-y-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] hover:scale-105 transition-all">
              <div className="relative inline-block mb-6">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">👑</div>
                <SchoolLogo schoolName={top3[0]?.schoolName} size={110} />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black border-4 border-[#0a0c12]">1</div>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{top3[0]?.teamName || '---'}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-4">{top3[0]?.schoolName}</p>
              <div className="bg-yellow-500 text-black font-black py-2 px-8 rounded-2xl inline-block text-4xl shadow-lg shadow-yellow-500/20">{suspenseMode ? '???' : (top3[0]?.score || 0)} <span className="text-sm">PTS</span></div>
              <p className="text-[10px] text-yellow-500 font-black uppercase mt-4 tracking-widest animate-pulse">Campeón Provisional</p>
            </div>

            {/* 3ro */}
            <div className="w-64 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center transform hover:scale-105 transition-all">
              <div className="relative inline-block mb-4">
                <SchoolLogo schoolName={top3[2]?.schoolName} size={80} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black border-2 border-[#0a0c12]">3</div>
              </div>
              <p className="text-lg font-black text-white uppercase truncate">{top3[2]?.teamName || '---'}</p>
              <div className="bg-orange-600/20 text-orange-400 font-black py-1 px-4 rounded-full inline-block mt-2 text-xl">{suspenseMode ? '??' : (top3[2]?.score || 0)} <span className="text-[10px] opacity-60">PTS</span></div>
            </div>
          </div>
        )}

        <div ref={listRef} className="space-y-2.5">
          {(isDual ? ranked : rest).map((team, i) => {
            const idx = isDual ? i : i + 3;
            const isPodium = !suspenseMode && idx < 3;
            const posColor = isPodium ? (idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-orange-400') : 'text-blue-400';
            return (
              <div key={team.id} data-id={team.id} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-800/50 bg-slate-900/40 hover:bg-slate-800/60 transition-all shadow-md">
                <div className="w-12 text-center font-black italic text-2xl"><span className={posColor}>{suspenseMode ? '??' : `#${idx + 1}`}</span></div>
                <SchoolLogo schoolName={team.schoolName} size={isDual ? 40 : 52} />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white uppercase italic truncate">{team.teamName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{team.schoolName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-black ${posColor} leading-none`}>{suspenseMode ? '???' : team.score}</p>
                  <p className="text-[11px] text-slate-500 font-bold mt-1 font-mono">{suspenseMode ? '--:--.--' : fmtTime(team.lastTime)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.TVView = TVView;
