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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5 animate-fadeIn">
      {/* Selectores */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          Evaluación
          <span className={`ml-3 text-sm font-bold px-2 py-0.5 rounded-full ${plugin.badgeClass}`}>{plugin.title}</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Equipo</label>
            <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Seleccionar equipo --</option>
              {myTeams.map(t => (
                <option key={t.id} value={t.id}>{t.teamName} — {t.schoolName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Ronda</label>
            <select value={selectedRound} onChange={e => setSelectedRound(parseInt(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: plugin.maxRounds || 5 }, (_, i) => i + 1).map(r => (
                <option key={r} value={r}>Ronda {r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel de evaluación según trackType del plugin */}
      {selectedTeam ? (
        <>
          {(plugin.id === 'quest' || plugin.trackType === 'quest_map') && (
            <QuestEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} tracks={tracks}
              onAddScore={onAddScore} showToast={showToast}
              timerSeconds={timerSeconds} competitionDuration={competitionDuration} />

          )}
          {(plugin.id === 'line_follower' || plugin.trackType === 'line_follower_grid') && (
            <LineFollowerEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin}
              onAddScore={onAddScore} showToast={showToast} />
          )}
          {plugin.trackType === 'sumo_versus' && (
            <SumoEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin} allTeams={teams}
              onAddScore={onAddScore} showToast={showToast} />
          )}
          {plugin.trackType === 'stands_rubric' && (
            <StandsEvalPanel team={selectedTeam} ronda={selectedRound}
              currentUser={currentUser} plugin={plugin}
              onAddScore={onAddScore} showToast={showToast} />
          )}

          {/* Debug: Si no hay panel renderizado para un equipo seleccionado */}
          {!['quest_map', 'line_follower_grid', 'sumo_versus', 'stands_rubric'].includes(plugin.trackType) && plugin.id !== 'quest' && plugin.id !== 'line_follower' && (
             <div className="bg-red-50 p-4 rounded-xl text-red-600 text-xs font-mono">
               Error: No se encontró panel para {plugin.id} / {plugin.trackType}
             </div>
          )}

          {/* Historial del equipo */}
          <TeamHistoryPanel team={selectedTeam} currentUser={currentUser}
            onSoftDelete={softDelete} isAdmin={isAdmin} plugin={plugin} />
        </>

      ) : (
        <div className="bg-slate-50 rounded-2xl p-12 text-center text-slate-400">
          <Icon name="clipboard-list" className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p>Selecciona un equipo para comenzar la evaluación</p>
        </div>
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
