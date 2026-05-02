// ============================================================================
// view_ranking.js - TABLA DE POSICIONES (Premium UI)
// Sistema_Univ.Sar - Motor Modular Adagames
//
// Responsabilidades:
//   - Clasificación en tiempo real por categoría
//   - Criterios de desempate automáticos (Puntos > Tiempo)
//   - Visualización de Podio y Top 10
//   - Modo Suspense (Ocultar Top 3 para premiación)
// ============================================================================

function RankingView({ teams, currentUser, showToast }) {
  const [suspenseMode, setSuspenseMode] = React.useState(false);
  const plugin = getCategoryPlugin(currentUser?.category);

  const rankedTeams = React.useMemo(() => {
    return teams
      .filter(t => t.category === currentUser?.category && t.status !== 'disqualified')
      .map(t => {
        const { score, lastTime } = calculateTeamScore(t);
        return { ...t, score, lastTime };
      })
      .sort((a, b) => plugin.rankingSort(a, b));
  }, [teams, currentUser?.category, plugin]);

  const top3 = rankedTeams.slice(0, 3);
  const others = rankedTeams.slice(3);

  const formatTime = (ms) => {
    if (!ms) return '--:--';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-blue-900 uppercase italic leading-none">Tabla de Posiciones</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Resultados Oficiales — {plugin.title}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setSuspenseMode(!suspenseMode)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg ${
              suspenseMode ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-slate-500 border border-slate-100'
            }`}>
            {suspenseMode ? '🔓 Desactivar Suspense' : '🔒 Modo Suspense'}
          </button>
        </div>
      </div>

      {/* PODIO */}
      {!suspenseMode && rankedTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-10 pb-4">
          {/* 2do Lugar */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-white p-6 rounded-[2.5rem] shadow-xl border-t-4 border-slate-300 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 shadow-md">2</div>
              <div className="text-center">
                <SchoolLogo schoolName={top3[1].schoolName} size={64} className="mx-auto mb-4" />
                <p className="font-black text-slate-800 truncate">{top3[1].teamName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{top3[1].schoolName}</p>
                <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-xl font-black text-slate-600">{top3[1].score} <span className="text-[10px]">PTS</span></div>
              </div>
            </div>
          )}
          {/* 1er Lugar */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-t-8 border-yellow-500 relative transform md:scale-110 z-10">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                <Icon name="crown" className="w-8 h-8 text-white -rotate-12" />
              </div>
              <div className="text-center pt-4">
                <SchoolLogo schoolName={top3[0].schoolName} size={80} className="mx-auto mb-4 border-2 border-yellow-500/30" />
                <p className="text-xl font-black text-white truncate">{top3[0].teamName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">{top3[0].schoolName}</p>
                <div className="inline-block px-6 py-2 bg-yellow-500 rounded-2xl text-3xl font-black text-white shadow-lg shadow-yellow-500/20">
                  {top3[0].score} <span className="text-xs uppercase opacity-80">Pts</span>
                </div>
                <p className="text-[10px] font-bold text-yellow-500 uppercase mt-4">CAMPEÓN PROVISIONAL</p>
              </div>
            </div>
          )}
          {/* 3er Lugar */}
          {top3[2] && (
            <div className="order-3 bg-white p-6 rounded-[2.5rem] shadow-xl border-t-4 border-orange-300 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center font-black text-orange-400 shadow-md">3</div>
              <div className="text-center">
                <SchoolLogo schoolName={top3[2].schoolName} size={64} className="mx-auto mb-4" />
                <p className="font-black text-slate-800 truncate">{top3[2].teamName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{top3[2].schoolName}</p>
                <div className="inline-block px-4 py-1 bg-orange-50 rounded-full text-xl font-black text-orange-600">{top3[2].score} <span className="text-[10px]">PTS</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABLA RESTANTE */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-center w-20">Rango</th>
              <th className="p-6 text-[10px] font-black uppercase">Equipo / Escuela</th>
              <th className="p-6 text-[10px] font-black uppercase text-center">Mejor Tiempo</th>
              <th className="p-6 text-[10px] font-black uppercase text-center w-32">Puntaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(suspenseMode ? others : rankedTeams).map((t, i) => {
              const rank = suspenseMode ? i + 4 : i + 1;
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 text-center">
                    <span className="text-xl font-black text-slate-300">#{rank}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <SchoolLogo schoolName={t.schoolName} size={40} />
                      <div>
                        <p className="text-sm font-black text-slate-800">{t.teamName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{t.schoolName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="font-mono text-slate-500 font-bold">{formatTime(t.lastTime)}</span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-black text-xl">
                      {t.score}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rankedTeams.length === 0 && (
              <tr>
                <td colSpan="4" className="p-20 text-center text-slate-300">
                  <Icon name="bar-chart-2" className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-black uppercase text-xs tracking-widest">Sin resultados registrados todavía</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Exportar al global para Babel
window.RankingView = RankingView;
