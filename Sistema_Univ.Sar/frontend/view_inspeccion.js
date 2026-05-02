// ============================================================================
// view_inspeccion.js - INSPECCIÓN Y AUDITORÍA DE CONTINGENCIA
// Sistema_Univ.Sar - Motor Modular Adagames
// ============================================================================

function InspeccionView({ teams, currentUser, onUpdateStatus, onUpdateTeam, onDeleteTeam, onUpdateQualifiedRounds, onUpdateManyQualified, onUpdateEvaluation, onDeleteEvaluation, showToast, confirm }) {
  const [filter, setFilter] = React.useState('');
  const [historyTeamId, setHistoryTeamId] = React.useState(null);

  const myTeams = teams.filter(t => t.category === currentUser.category);
  const filtered = myTeams
    .filter(t => (t.teamName || '').toLowerCase().includes(filter.toLowerCase()) || (t.schoolName || '').toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (a.teamName || '').localeCompare(b.teamName || ''));

  const handleApprove = (id) => onUpdateStatus(id, 'inspected');
  const handlePending = (id) => onUpdateStatus(id, 'pending');
  const handleDisqualify = (id) => {
    confirm({
      title: 'Descalificar',
      message: '¿Descalificar a este equipo?',
      onConfirm: () => {
        onUpdateStatus(id, 'disqualified');
        showToast('Equipo descalificado');
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Inspección Técnica</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Aprobación y auditoría de equipos</p>
        </div>
        <div className="text-right bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Aprobados</p>
          <p className="text-2xl font-black text-green-600">
            {myTeams.filter(t => t.status === 'inspected').length}/{myTeams.length}
          </p>
        </div>
      </div>

      <input value={filter} onChange={e => setFilter(e.target.value)}
        placeholder="🔍 Buscar por nombre o escuela..."
        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-blue-500 shadow-sm" />

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Equipo / Escuela</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Categoría</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Score</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-5">
                  <p className="font-black text-slate-800 text-sm">{t.teamName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t.schoolName}</p>
                  {t.status === 'disqualified' && (
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-0.5">⛔ {t.disqualifiedReason || 'Descalificado'}</p>
                  )}
                </td>
                <td className="p-5 text-center">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getCategoryPlugin(t.category).badgeClass}`}>
                    {getCategoryPlugin(t.category).title}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl inline-block ${t.status === 'inspected' ? 'bg-green-100 text-green-700' : t.status === 'disqualified' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {t.status === 'inspected' ? '✅ Aprobado' : t.status === 'disqualified' ? '⛔ Desc.' : '⏳ Pendiente'}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <span className="font-black text-blue-600 text-xl">{t.score || 0}</span>
                </td>
                <td className="p-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setHistoryTeamId(t.id)} title="Auditoría de puntajes"
                      className="w-9 h-9 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-blue-100">
                      <Icon name="file-text" className="w-4 h-4" />
                    </button>
                    {t.status !== 'inspected' ? (
                      <button onClick={() => handleApprove(t.id)}
                        className="w-9 h-9 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-green-100">
                        <Icon name="check" className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handlePending(t.id)}
                        className="w-9 h-9 bg-yellow-50 hover:bg-yellow-500 text-yellow-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-yellow-100">
                        <Icon name="clock" className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDisqualify(t.id)}
                      className="w-9 h-9 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-100">
                      <Icon name="x-circle" className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteTeam(t.id)}
                      className="w-9 h-9 bg-slate-50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200">
                      <Icon name="trash-2" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {historyTeamId && (
        <AuditoriaModal
          team={teams.find(t => t.id === historyTeamId)}
          currentUser={currentUser}
          onClose={() => setHistoryTeamId(null)}
          onDeleteEvaluation={(idx, patch) => { onDeleteEvaluation(historyTeamId, idx, patch); }}
          onUpdateEvaluation={(idx, data) => { onUpdateEvaluation(historyTeamId, idx, data); }}
          onAddContingency={(entries) => {
            const t = teams.find(x => x.id === historyTeamId);
            if (t) onUpdateTeam(t.id, t.teamName, t.schoolName, { newHistoryEntries: entries });
          }}
          showToast={showToast} confirm={confirm}
        />
      )}
    </div>
  );
}

function AuditoriaModal({ team, currentUser, onClose, onDeleteEvaluation, onUpdateEvaluation, onAddContingency, showToast, confirm }) {
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editPoints, setEditPoints] = React.useState(0);
  const [editTime, setEditTime] = React.useState(0);

  const [showContingency, setShowContingency] = React.useState(false);
  const [cRonda, setCRonda] = React.useState(1);
  const [cPista, setCPista] = React.useState(1);
  const [cPoints, setCPoints] = React.useState(0);
  const [cTime, setCTime] = React.useState(0);

  if (!team) return null;

  const handleSaveEdit = (i) => {
    onUpdateEvaluation(i, {
      points: Number(editPoints),
      percentage: Number(editPoints),
      finalTimeMs: Number(editTime) * 1000,
      finalTime: Number(editTime) * 1000
    });
    setEditingIndex(null);
    showToast('✅ Evaluación corregida');
  };

  const handleSoftDelete = (i) => {
    confirm({
      title: 'Anular Entrada',
      message: '¿Anular (soft delete) este intento? Quedará en auditoría.',
      onConfirm: () => {
        onDeleteEvaluation(i, { voided: true });
        showToast('⚪ Intento anulado');
      }
    });
  };

  const handleAddContingency = () => {
    onAddContingency([{
      ronda: cRonda,
      pista: cPista,
      points: Number(cPoints),
      finalTimeMs: Number(cTime) * 1000,
      practice: false,
      voided: false,
      contingency: true,
      date: new Date().toLocaleTimeString(),
      judgeId: currentUser.id,
      judgeName: currentUser.name
    }]);
    setShowContingency(false);
    showToast('✅ Entrada de contingencia agregada');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Auditoría de Desempeño</p>
            <h3 className="text-2xl font-black text-slate-900">
              {team.teamName}
              <span className="text-slate-400 text-base font-bold ml-2">— {team.schoolName}</span>
            </h3>
          </div>
          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 p-3 rounded-2xl transition-all">
            <Icon name="x" className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {(team.history || []).length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Icon name="clipboard" className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Sin evaluaciones</p>
            </div>
          ) : (
            (team.history || []).map((h, i) => {
              const isEditing = editingIndex === i;
              const timeMs = h.finalTimeMs || h.finalTime || 0;
              return (
                <div key={i} className={`flex items-center gap-4 bg-white border p-5 rounded-2xl shadow-sm transition-all ${h.voided ? 'opacity-40 border-slate-100' : 'border-slate-200 hover:shadow-md'}`}>
                  <div className="flex-shrink-0">
                    {isEditing ? (
                      <input type="number" value={editPoints} onChange={e => setEditPoints(e.target.value)}
                        className="w-16 h-12 border-2 border-blue-500 rounded-xl text-center font-black text-xl text-blue-600 outline-none" />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${h.voided ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-600/20'}`}>
                        {h.points || h.percentage || 0}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-slate-800 text-sm uppercase">
                        {h.pista === 0 ? `Global — R${h.ronda}` : `Pista ${h.pista} — R${h.ronda}`}
                      </p>
                      {h.practice && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase">Práctica</span>}
                      {h.voided && <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded text-[9px] font-black uppercase">Anulado</span>}
                      {h.contingency && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Contingencia</span>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Icon name="user" className="w-3 h-3" /> {h.judgeName || 'Juez'} · {h.date}
                    </p>
                  </div>
                  <div className="text-right text-sm font-mono text-slate-400">
                    {isEditing ? (
                      <input type="number" step="0.1" value={editTime} onChange={e => setEditTime(e.target.value)}
                        className="w-20 p-1 border-2 border-blue-500 rounded text-right font-bold text-xs outline-none" />
                    ) : (
                      `${Math.floor(timeMs/60000)}:${Math.floor((timeMs%60000)/1000).toString().padStart(2,'0')}.${Math.floor((timeMs%1000)/10).toString().padStart(2,'0')}`
                    )}
                  </div>
                  {currentUser.role === 'admin' && !h.voided && (
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveEdit(i)} className="w-9 h-9 bg-green-500 text-white rounded-xl flex items-center justify-center"><Icon name="check" className="w-4 h-4" /></button>
                          <button onClick={() => setEditingIndex(null)} className="w-9 h-9 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center"><Icon name="x" className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingIndex(i); setEditPoints(h.points||h.percentage||0); setEditTime(timeMs/1000); }}
                            className="w-9 h-9 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl flex items-center justify-center border border-blue-100 transition-all">
                            <Icon name="edit-3" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSoftDelete(i)}
                            className="w-9 h-9 bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl flex items-center justify-center border border-orange-100 transition-all">
                            <Icon name="eye-off" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(window.confirm('¿Eliminar definitivamente?')) { onDeleteEvaluation(i, {}); showToast('Eliminado'); } }}
                            className="w-9 h-9 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center border border-red-100 transition-all">
                            <Icon name="trash-2" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {currentUser.role === 'admin' && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            {!showContingency ? (
              <button onClick={() => setShowContingency(true)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
                <Icon name="plus-circle" className="w-4 h-4" /> Agregar Entrada de Contingencia
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Modo Contingencia — Entrada Manual</p>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Ronda</label>
                    <input type="number" value={cRonda} onChange={e => setCRonda(parseInt(e.target.value)||0)}
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Pista</label>
                    <input type="number" value={cPista} onChange={e => setCPista(parseInt(e.target.value)||0)}
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Puntos</label>
                    <input type="number" value={cPoints} onChange={e => setCPoints(parseInt(e.target.value)||0)}
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tiempo(s)</label>
                    <input type="number" value={cTime} onChange={e => setCTime(parseInt(e.target.value)||0)}
                      className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowContingency(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                  <button onClick={handleAddContingency} className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Guardar Contingencia</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.InspeccionView = InspeccionView;
window.AuditoriaModal = AuditoriaModal;
