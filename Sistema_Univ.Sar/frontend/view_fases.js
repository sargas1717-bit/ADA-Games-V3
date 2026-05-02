// view_fases.js
function FasesView({ teams, currentUser, onUpdateQualified, onUpdateManyQualified, showToast, confirm }) {
  const [selRonda, setSelRonda] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const RONDAS = [1, 2, 3, 4, 5];

  const myTeams = teams.filter(t => t.category === currentUser.category && t.status !== 'disqualified');
  const inspectedTeams = myTeams.filter(t => t.status === 'inspected');

  const getStats = (team, r) => {
    const { score, lastTime } = calculateTeamRoundScore(team, r);
    const hasHistory = (team.history || []).some(h => h.ronda === r && !h.practice && !h.voided);
    return { score, lastTime, played: hasHistory };
  };

  const plugin = getCategoryPlugin(currentUser.category);

  const rankedTeams = React.useMemo(() => {
    const scored = inspectedTeams.map(t => ({ ...t, ...getStats(t, selRonda) }));
    return scored.sort((a, b) => {
      const qA = (a.qualifiedRounds || [1]).includes(selRonda);
      const qB = (b.qualifiedRounds || [1]).includes(selRonda);
      if (qA !== qB) return qB ? 1 : -1;
      return plugin.rankingSort(a, b);
    });
  }, [inspectedTeams, selRonda, plugin]);


  const toggleSelection = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const promoteSelected = (toRonda) => {
    if (!selectedIds.length) { showToast('Selecciona equipos primero'); return; }
    const updates = {};
    selectedIds.forEach(id => {
      const t = teams.find(x => x.id === id);
      if (t && !(t.qualifiedRounds || [1]).includes(toRonda)) {
        updates[id] = [...new Set([...(t.qualifiedRounds || [1]), toRonda])];
      }
    });
    if (Object.keys(updates).length) {
      onUpdateManyQualified(updates);
      showToast(`✅ ${Object.keys(updates).length} equipos promovidos a R${toRonda}`);
    }
    setSelectedIds([]);
  };

  const selectTop50 = () => {
    const played = rankedTeams.filter(t => getStats(t, selRonda).played && (t.qualifiedRounds||[1]).includes(selRonda));
    const top = played.slice(0, Math.ceil(played.length / 2));
    setSelectedIds(top.map(t => t.id));
    showToast(`✨ ${top.length} equipos seleccionados (Top 50%)`);
  };

  const toggleRound = (team, r) => {
    let rounds = [...(team.qualifiedRounds || [1])];
    if (rounds.includes(r)) {
      if (r === 1 && rounds.length === 1) return;
      rounds = rounds.filter(x => x !== r);
    } else rounds.push(r);
    onUpdateQualified(team.id, rounds);
  };

  const currentQualified = inspectedTeams.filter(t => (t.qualifiedRounds||[1]).includes(selRonda));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase italic leading-none">Gestión de Fases</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Control de acceso y promoción masiva</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {RONDAS.map(r => (
              <button key={r} onClick={() => { setSelRonda(r); setSelectedIds([]); }} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${selRonda===r ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>R{r}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-5 flex items-center gap-2"><Icon name="check-square" className="w-4 h-4" /> Acciones Masivas</h3>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Calificar para:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {RONDAS.map(r => (
                    <button key={r} onClick={() => promoteSelected(r)} disabled={!selectedIds.length} className="bg-white border-2 border-blue-100 text-blue-600 py-2 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30">R{r}</button>
                  ))}
                </div>
                <div className="pt-3 border-t border-blue-100 space-y-2">
                  <button onClick={selectTop50} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Marcar Top 50%</button>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-5 w-12 text-center"><input type="checkbox" className="w-5 h-5 rounded-lg" onChange={e => setSelectedIds(e.target.checked ? rankedTeams.map(t => t.id) : [])} checked={selectedIds.length === rankedTeams.length && rankedTeams.length > 0} /></th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Equipo</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Score R{selRonda}</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Tiempo R{selRonda}</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Habilitado</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rankedTeams.map(t => {
                  const stats = getStats(t, selRonda);
                  const isQual = (t.qualifiedRounds||[1]).includes(selRonda);
                  const isSel = selectedIds.includes(t.id);
                  return (
                    <tr key={t.id} className={`${isSel ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'} transition-colors`}>
                      <td className="p-5 text-center"><input type="checkbox" className="w-5 h-5 rounded-lg" checked={isSel} onChange={() => toggleSelection(t.id)} /></td>
                      <td className="p-5">
                        <p className={`text-sm font-black ${isQual ? 'text-slate-800' : 'text-slate-300'}`}>{t.teamName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{t.schoolName}</p>
                      </td>
                      <td className="p-5 text-center"><span className={`font-black text-lg ${stats.score > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{stats.score}</span></td>
                      <td className="p-5 text-center font-mono text-xs text-slate-400">
                        {stats.lastTime > 0 ? `${Math.floor(stats.lastTime/60000)}:${String(Math.floor((stats.lastTime%60000)/1000)).padStart(2,'0')}` : '—'}
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          {RONDAS.map(r => {
                            const q = (t.qualifiedRounds||[1]).includes(r);
                            return <button key={r} onClick={() => toggleRound(t, r)} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all border-2 ${q ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-300 hover:border-blue-300'}`}>{r}</button>;
                          })}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

window.FasesView = FasesView;
