// ============================================================================
// app.js - ORQUESTADOR PRINCIPAL
// Sistema_Univ.Sar — Motor Modular Adagames
// ============================================================================

const { useState, useMemo, useRef, useEffect } = React;

// ---- LÓGICA DE SCORING (copiada del sistema original) ----------------------
// Nota: recalcScore ha sido movido a plugins.js como calculateTeamScore para centralizar la lógica.

// ---- COMPONENTE NAVBUTTON (Sidebar) ----------------------------------------
function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          : 'text-blue-300 hover:bg-blue-900/60 hover:text-white'
      }`}>
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="hidden md:block">{label}</span>
    </button>
  );
}

// ---- APP PRINCIPAL ---------------------------------------------------------
function App() {
  const { currentUser, login, logout, switchCategory } = useCurrentUser();
  const { users, fetchUsers } = useUsers();
  const { teams, setTeams, tracks, setTracks, loading, isSaving, saveError, postTeams, postTracks, fetchData } = useDataSync(currentUser);
  const { showToast, ToastComponent } = useToast();
  const { confirm, DialogComponent } = useConfirmDialog();

  // Temporizador por categoría
  const { timer, timerActive, toggle: toggleTimer, reset: resetTimer, formatTime } = useCategoryTimer(currentUser?.category || 'quest');
  const competitionDuration = 30; // 30 minutos por defecto


  const [activeTab, setActiveTab] = useState('registro');
  const [tvMode, setTvMode] = useState(false);
  const [tvModeType, setTvModeType] = useState('individual'); // 'individual' | 'dual'
  const [suspenseMode, setSuspenseMode] = useState(false);

  // ---- ACCIONES NEGOCIO ----
  const addTeam = (teamData) => {
    const plugin = getCategoryPlugin(currentUser.category);
    const newId = Date.now().toString();
    postTeams([...teams, {
      id: newId, ...teamData,
      status: 'pending', score: 0, history: [],
      category: currentUser.category,
      qualifiedRounds: [1],
      practiceTickets: plugin.defaultPracticeTickets || 5,
      evaluationTickets: plugin.defaultEvalTickets || { "1": 1 },
      lastTime: 0,
    }]);
    showToast('✅ Equipo registrado');
  };

  const bulkAddTeams = async (newTeams) => {
    try {
      const cat = currentUser.category;
      const res = await fetch(`${API_BASE}/teams/bulk?category=${cat}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeams)
      });
      const result = await res.json();
      if (result.status === 'ok') { await fetchData(); showToast(`✅ ${result.imported} equipos importados`); }
    } catch (e) { showToast('⚠️ Error en importación'); }
  };

  const updateStatus = (teamId, status, extra = {}) => {
    postTeams(teams.map(t => t.id === teamId ? { ...t, status, ...extra } : t));
  };

  const deleteTeam = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    confirm({
      title: 'Eliminar Equipo',
      message: `¿Eliminar permanentemente a "${team?.teamName}"? No se puede deshacer.`,
      onConfirm: () => { postTeams(teams.filter(t => t.id !== teamId)); showToast('🗑️ Eliminado'); }
    });
  };

  // Hot-patch: edita nombre o inyecta historial (modo contingencia)
  const updateTeamBase = (teamId, teamName, schoolName, extraPatch = {}) => {
    const updated = teams.map(t => {
      if (t.id !== teamId) return t;
      let newHistory = t.history;
      if (extraPatch.newHistoryEntries?.length > 0)
        newHistory = [...t.history, ...extraPatch.newHistoryEntries];
      const { score, lastTime } = calculateTeamScore({ ...t, history: newHistory });
      const restPatch = Object.assign({}, extraPatch);
      delete restPatch.newHistoryEntries;
      return { ...t, teamName, schoolName, ...restPatch, history: newHistory, score, lastTime };
    });
    postTeams(updated);
    showToast('✅ Equipo actualizado');
  };

  const updateQualifiedRounds = (teamId, rounds) =>
    postTeams(teams.map(t => t.id === teamId ? { ...t, qualifiedRounds: rounds } : t));

  const updateManyQualifiedRounds = (updates) =>
    postTeams(teams.map(t => updates[t.id] ? { ...t, qualifiedRounds: updates[t.id] } : t));

  const addScore = (teamId, ronda, pista, points, finalTimeMs = null, attemptType = 'evaluation', data = null) => {
    const updated = teams.map(t => {
      if (t.id !== teamId) return t;
      let practiceTickets = t.practiceTickets !== undefined ? t.practiceTickets : 5;
      if (attemptType === 'practice' || attemptType === 'practice_to_eval')
        practiceTickets = Math.max(0, practiceTickets - 1);
      const newHistory = [...t.history, {
        ronda, pista, points, finalTimeMs, data,
        practice: attemptType === 'practice',
        convertedFromPractice: attemptType === 'practice_to_eval',
        voided: false,
        date: new Date().toLocaleTimeString(),
        judgeId: currentUser.id, judgeName: currentUser.name
      }];
      const { score, lastTime } = calculateTeamScore({ ...t, history: newHistory });
      return { ...t, history: newHistory, score, lastTime, practiceTickets };
    });
    postTeams(updated);
    if (attemptType === 'practice') showToast('Práctica registrada');
    else showToast('✅ Evaluación oficial guardada');
  };

  const deleteEvaluation = (teamId, historyIndex, patch = {}) => {
    const updated = teams.map(t => {
      if (t.id !== teamId) return t;
      const newHistory = [...t.history];
      if (patch.voided) {
        newHistory[historyIndex] = { ...newHistory[historyIndex], ...patch, voidedBy: currentUser.id };
      } else {
        newHistory.splice(historyIndex, 1);
      }
      const { score, lastTime } = calculateTeamScore({ ...t, history: newHistory });
      return { ...t, history: newHistory, score, lastTime };
    });
    postTeams(updated);
    showToast('Evaluación eliminada');
  };

  const updateEvaluation = (teamId, historyIndex, newData) => {
    const updated = teams.map(t => {
      if (t.id !== teamId) return t;
      const newHistory = [...t.history];
      newHistory[historyIndex] = { ...newHistory[historyIndex], ...newData };
      const { score, lastTime } = calculateTeamScore({ ...t, history: newHistory });
      return { ...t, history: newHistory, score, lastTime };
    });
    postTeams(updated);
    showToast('Evaluación actualizada');
  };

  const disqualifyTeam = (teamId, reason) => {
    confirm({
      title: 'Descalificar Equipo',
      message: `¿Descalificar por: "${reason}"?`,
      onConfirm: () => {
        postTeams(teams.map(t => t.id === teamId ? { ...t, status: 'disqualified', disqualifiedReason: reason } : t));
        showToast('Equipo descalificado');
      }
    });
  };

  // ---- GUARDS ----
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Icon name="trophy" className="w-12 h-12 text-blue-400" />
        <h2 className="font-black text-2xl uppercase tracking-widest">Cargando Motor Adagames...</h2>
        <p className="text-slate-400 text-sm">Puerto 8080 — Sistema_Univ.Sar</p>
      </div>
    </div>
  );

  if (!currentUser) return <LoginScreen onLogin={login} users={users} />;

  if (tvMode) return (
    <TVView
      teams={teams} currentUser={currentUser}
      mode={tvModeType} suspenseMode={suspenseMode}
      onClose={() => setTvMode(false)}
    />
  );

  const plugin = getCategoryPlugin(currentUser.category);
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 relative">
      {ToastComponent}
      {DialogComponent}
      <SaveIndicator isSaving={isSaving} saveError={saveError} />

      {/* ===== SIDEBAR LATERAL (igual al original) ===== */}
      <nav className="bg-blue-950 text-white md:w-64 flex-shrink-0 flex flex-col shadow-2xl z-20 sticky top-0 md:h-screen w-full md:max-h-screen overflow-hidden">
        {/* Logo */}
        <div className="p-4 md:p-5 border-b border-blue-900 flex md:block items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 md:mb-4">
            <div className="bg-blue-500 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Icon name="trophy" className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="font-black text-base md:text-lg tracking-tighter leading-tight uppercase italic">
                ADAGAMES <span className="text-blue-400">2026</span>
              </h1>
              <p className="text-[8px] text-blue-400 font-bold tracking-widest uppercase">{plugin.title}</p>
            </div>
          </div>
          <button onClick={logout} className="md:hidden p-2 bg-red-500/20 text-red-400 rounded-lg">
            <Icon name="log-out" className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Categoría */}
        <div className="px-4 py-3 border-b border-blue-900">
          <select value={currentUser.category} onChange={e => switchCategory(e.target.value)}
            className="w-full bg-blue-900/60 text-white text-[10px] font-black uppercase rounded-xl px-3 py-2.5 border border-blue-800 focus:outline-none cursor-pointer">
            {Object.values(CATEGORY_REGISTRY).map(p => (
              <option key={p.id} value={p.id} className="bg-blue-950">{p.title}</option>
            ))}
          </select>
        </div>

        {/* Nav Items */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2 gap-1 border-b border-blue-900 md:border-0 no-scrollbar flex-1">
          {isAdmin && (<>
            <NavButton active={activeTab==='registro'}   onClick={()=>setActiveTab('registro')}   icon={<Icon name="users"/>}          label="Registro"/>
            <NavButton active={activeTab==='inspeccion'} onClick={()=>setActiveTab('inspeccion')} icon={<Icon name="clipboard-check"/>} label="Inspección"/>
            <NavButton active={activeTab==='jueces'}     onClick={()=>setActiveTab('jueces')}     icon={<Icon name="user-cog"/>}        label="Jueces"/>
            <NavButton active={activeTab==='pistas'}     onClick={()=>setActiveTab('pistas')}     icon={<Icon name="map"/>}             label="Pistas"/>
            <NavButton active={activeTab==='fases'}      onClick={()=>setActiveTab('fases')}      icon={<Icon name="list-checks"/>}     label="Fases"/>
            <NavButton active={activeTab==='sistema'}    onClick={()=>setActiveTab('sistema')}    icon={<Icon name="settings"/>}        label="Sistema"/>
          </>)}
          {currentUser.role !== 'tv' && (
            <NavButton active={activeTab==='evaluacion'} onClick={()=>setActiveTab('evaluacion')} icon={<Icon name="play-circle"/>} label="Evaluación"/>
          )}
          <NavButton active={activeTab==='ranking'} onClick={()=>setActiveTab('ranking')} icon={<Icon name="trophy"/>} label="Ranking"/>
        </div>

        {/* Acciones de Transmisión */}
        <div className="p-4 border-t border-blue-900 space-y-2 mt-auto">
          {(isAdmin || currentUser.role === 'tv') && (<>
            {/* Modo Suspense Toggle */}
            <div className="bg-blue-900/40 p-3 rounded-2xl border border-blue-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Modo Suspenso</span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer"
                    checked={suspenseMode} onChange={e => setSuspenseMode(e.target.checked)} />
                  <div className="w-8 h-4 bg-blue-900 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                </div>
              </label>
              <p className="text-[7px] font-bold text-blue-500/50 mt-1 uppercase tracking-tighter">Oculta posición en TV</p>
            </div>

            <button onClick={() => { setTvModeType('individual'); setTvMode(true); }}
              className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">
              <Icon name="monitor" className="w-4 h-4" /> Lanzar TV Individual
            </button>
            <button onClick={() => { setTvModeType('dual'); setTvMode(true); }}
              className="w-full flex items-center gap-3 p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20">
              <Icon name="layout" className="w-4 h-4" /> Lanzar TV Dual
            </button>
          </>)}

          <button onClick={logout}
            className="w-full flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/20 font-black text-[10px] uppercase tracking-widest">
            <Icon name="log-out" className="w-4 h-4" /> Cerrar Sesión
          </button>

          {/* Indicador de conexión */}
          <div className="pt-2 flex items-center gap-2">
            {isSaving ? (
              <><div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-widest">Guardando...</span></>
            ) : saveError ? (
              <><div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest">Error de Red</span></>
            ) : (
              <><div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
              <span className="text-[9px] font-bold text-green-300 uppercase tracking-widest">Sincronizado</span></>
            )}
          </div>
        </div>
      </nav>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
        {activeTab === 'registro' && isAdmin && (
          <RegistroView teams={teams} currentUser={currentUser}
            onAddTeam={addTeam} onBulkAdd={bulkAddTeams} showToast={showToast} />
        )}
        {activeTab === 'inspeccion' && isAdmin && (
          <InspeccionView teams={teams} currentUser={currentUser}
            onUpdateStatus={updateStatus} onUpdateTeam={updateTeamBase}
            onDeleteTeam={deleteTeam} onUpdateQualifiedRounds={updateQualifiedRounds}
            onUpdateManyQualified={updateManyQualifiedRounds}
            onUpdateEvaluation={updateEvaluation} onDeleteEvaluation={deleteEvaluation}
            showToast={showToast} confirm={confirm} />
        )}
        {activeTab === 'jueces' && isAdmin && (
          <JuecesView users={users} fetchUsers={fetchUsers} showToast={showToast} confirm={confirm} />
        )}
        {activeTab === 'pistas' && isAdmin && (
          <PistasView tracks={tracks} currentUser={currentUser}
            postTracks={postTracks} showToast={showToast} />
        )}
        {activeTab === 'fases' && isAdmin && (
          <FasesView teams={teams} currentUser={currentUser}
            onUpdateQualified={updateQualifiedRounds}
            onUpdateManyQualified={updateManyQualifiedRounds}
            showToast={showToast} confirm={confirm} />
        )}
        {activeTab === 'sistema' && isAdmin && (
          <SistemaView teams={teams} currentUser={currentUser}
            fetchData={fetchData} showToast={showToast} confirm={confirm}
            postTeams={postTeams} users={users} />
        )}
        {activeTab === 'evaluacion' && currentUser.role !== 'tv' && (
          <EvaluacionView teams={teams} tracks={tracks} currentUser={currentUser}
            onAddScore={addScore} onDeleteEvaluation={deleteEvaluation}
            onUpdateEvaluation={updateEvaluation}
            timerSeconds={timer} competitionDuration={competitionDuration}
            showToast={showToast} confirm={confirm} />


        )}
        {activeTab === 'ranking' && (
          <RankingView teams={teams} currentUser={currentUser}
            suspenseMode={suspenseMode} setSuspenseMode={setSuspenseMode}
            onUpdateEvaluation={updateEvaluation} onDeleteEvaluation={deleteEvaluation}
            showToast={showToast} />
        )}
      </main>
    </div>
  );
}

// ---- Montar la aplicación --------------------------------------------------
const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
