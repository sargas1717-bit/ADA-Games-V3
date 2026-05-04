// ============================================================================
// view_evaluacion.js - ROUTER DE EVALUACIÓN
// Sistema_Univ.Sar - Motor Modular Adagames
//
// Este archivo es solo el enrutador/contenedor.
// Cada panel específico está en su propio archivo:
//   view_eval_quest.js   → QuestEvalPanel
//   view_eval_lf.js      → LineFollowerEvalPanel
//   view_eval_sumo.js    → SumoEvalPanel
//   view_eval_stands.js  → StandsEvalPanel
// ============================================================================

function EvaluacionView({ teams, tracks, currentUser, onAddScore, onDeleteEvaluation, showToast, confirm, timerSeconds, competitionDuration }) {

  const [selectedTeamId, setSelectedTeamId] = React.useState('');
  const [selectedRound, setSelectedRound] = React.useState(1);

  const plugin = getCategoryPlugin(currentUser?.category);
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const isAdmin = currentUser?.role === 'admin';

  const myTeams = teams
    .filter(t => t.category === currentUser?.category && t.status === 'inspected')
    .sort((a, b) => (a.teamName || '').localeCompare(b.teamName || ''));

  const softDelete = (historyIndex) => {
    confirm({
      title: '🗂️ Anular Intento',
      message: 'Este intento quedará marcado como anulado (voided) pero permanecerá en el historial para auditoría. ¿Confirmar?',
      onConfirm: () => {
        onDeleteEvaluation(selectedTeamId, historyIndex, { voided: true });
        showToast('Intento anulado. Score recalculado.');
      }
    });
  };

  // Lógica más robusta para detectar Sigue Líneas (por ID, tipo o título)
  const isLF = plugin.id.includes('line') || plugin.trackType === 'line_follower_grid' || plugin.title.includes('Línea');

  return (
    <div className={`${isLF ? 'max-w-[1300px]' : 'max-w-3xl'} mx-auto p-4 md:p-6 space-y-5 animate-fadeIn`}>
      {/* Ocultar cabecera estándar para Sigue Líneas ya que el panel premium tiene la suya */}
      {!isLF && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
            <Icon name="clipboard-list" className="w-6 h-6 text-blue-500" />
            Evaluación
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${plugin.badgeClass}`}>{plugin.title}</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Seleccionar Equipo</label>
              <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all">
                <option value="">-- Seleccionar equipo --</option>
                {myTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.teamName} — {t.schoolName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Ronda de Competición</label>
              <select value={selectedRound} onChange={e => setSelectedRound(parseInt(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all">
                {Array.from({ length: plugin.maxRounds || 5 }, (_, i) => i + 1).map(r => (
                  <option key={r} value={r}>Ronda {r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {isLF && !selectedTeam && (
        <div className="bg-[#161925] rounded-[2rem] p-10 border border-[#2a2e3f] shadow-2xl flex flex-col items-center text-center">
           <div className="bg-blue-600/20 p-4 rounded-2xl mb-6">
              <Icon name="play" className="w-12 h-12 text-blue-500" />
           </div>
           <h2 className="text-3xl font-black text-white mb-2 italic uppercase tracking-tight">Evaluación de Sigue Líneas</h2>
           <p className="text-slate-400 mb-8 max-w-sm">Selecciona un equipo de la lista para abrir la mesa del juez y comenzar la evaluación.</p>
           <div className="w-full max-w-md">
              <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}
                className="w-full bg-[#0a0c12] border border-[#2a2e3f] rounded-2xl px-6 py-4 text-white font-black text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none text-center cursor-pointer">
                <option value="">-- SELECCIONAR EQUIPO --</option>
                {myTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.teamName}</option>
                ))}
              </select>
           </div>
        </div>
      )}

      {/* Panel de evaluación según trackType del plugin */}
      {selectedTeam ? (
        <div className="space-y-8">
          {(plugin.id === 'quest' || plugin.trackType === 'quest_map') && (
            <QuestEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} tracks={tracks}
              onAddScore={onAddScore} showToast={showToast}
              timerSeconds={timerSeconds} competitionDuration={competitionDuration} />
          )}
          {isLF && (
            <LineFollowerEvalPanel key={`lf-${selectedTeamId}-${selectedRound}`}
              team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} tracks={tracks}
              onAddScore={onAddScore} showToast={showToast} 
              onBack={() => setSelectedTeamId('')} />
          )}
          {plugin.trackType === 'sumo_versus' && (
            <SumoEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} tracks={tracks}
              onAddScore={onAddScore} showToast={showToast} allTeams={teams} />
          )}
          {plugin.trackType === 'stands_rubric' && (
            <StandsEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} tracks={tracks}
              onAddScore={onAddScore} showToast={showToast} />
          )}

          {/* Fallback si no hay panel renderizado */}
          {!isLF && !['quest_map', 'sumo_versus', 'stands_rubric'].includes(plugin.trackType) && (
             <div className="bg-red-50 p-6 rounded-3xl text-red-600 text-sm font-black uppercase text-center border-2 border-red-100">
                ⚠️ Error: Panel de evaluación no disponible para {plugin.title}
             </div>
          )}

          {/* Historial del equipo */}
          <div className={isLF ? "mt-12" : ""}>
            <TeamHistoryPanel team={selectedTeam} currentUser={currentUser}
              onSoftDelete={softDelete} isAdmin={isAdmin} plugin={plugin} />
          </div>
        </div>

      ) : (
        !isLF && (
          <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border-4 border-dashed border-slate-100">
            <Icon name="clipboard-list" className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Esperando Selección</h3>
            <p className="text-slate-300 text-sm mt-2">Elige un equipo para ver su historial y comenzar la evaluación.</p>
          </div>
        )
      )}
    </div>
  );
}

// ---- Historial con Soft Delete ----------------------------------------------
function TeamHistoryPanel({ team, currentUser, onSoftDelete, isAdmin, plugin }) {
  const { score } = calculateTeamScore(team);
  const history = team.history || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700">Historial — {team.teamName}</h3>
        <span className="font-black text-blue-700 text-xl">{score} pts</span>
      </div>
      {history.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-4">Sin evaluaciones registradas aún.</p>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {history.map((h, i) => (
          <div key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${h.voided ? 'bg-red-50 opacity-50 line-through' : h.practice ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <div>
              <span className="font-medium">
                {h.voided ? '🚫 Anulado' : h.practice ? '🔵 Práctica' : '✅ Oficial'}{' '}
                R{h.ronda}{h.pista > 0 ? ` P${h.pista}` : ''} →{' '}
                <strong>{h.points || h.percentage || 0} pts</strong>
              </span>
              {h.finalTimeMs > 0 && (
                <span className="text-slate-400 ml-2 text-xs font-mono">
                  {Math.floor(h.finalTimeMs/60000)}:{String(Math.floor((h.finalTimeMs%60000)/1000)).padStart(2,'0')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
              <span className="hidden sm:inline">{h.judgeName}</span>
              <span>{h.date}</span>
              {isAdmin && !h.voided && (
                <button onClick={() => onSoftDelete(i)}
                  title="Anular intento (soft delete)"
                  className="text-red-300 hover:text-red-600 transition ml-1">
                  <Icon name="x-circle" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.EvaluacionView = EvaluacionView;
