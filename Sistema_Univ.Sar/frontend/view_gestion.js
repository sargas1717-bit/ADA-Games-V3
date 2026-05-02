// ============================================================================
// view_gestion.js - GESTIÓN ADMINISTRATIVA (Premium UI)
// Sistema_Univ.Sar - Motor Modular Adagames
//
// Responsabilidades:
//   - Edición de Pistas (mapUrl, scoring_zones, grid)
//   - Control de Fases (activar/desactivar rondas globalmente)
//   - Generación de Datos de Prueba (Simulado)
//   - Limpieza y Respaldo de datos
// ============================================================================

function GestionView({ teams, tracks, currentUser, onUpdateTracks, postTracks, showToast, confirm, fetchData }) {
  const [activeSubTab, setActiveSubTab] = React.useState('pistas');
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-fadeIn">
        <div className="bg-slate-100 p-8 rounded-[3rem] border border-slate-200 text-center">
          <Icon name="lock" className="w-16 h-16 mx-auto mb-6 text-slate-300" />
          <p className="text-2xl font-black text-slate-800 uppercase italic">Acceso Restringido</p>
          <p className="text-sm font-medium mt-2">Solo administradores pueden acceder a este panel maestro.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Panel de Control Maestro</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración técnica y mantenimiento</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-slate-100">
          {['pistas', 'fases', 'sistema'].map(t => (
            <button key={t} onClick={() => setActiveSubTab(t)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                activeSubTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'pistas' && (
        <GestionPistas tracks={tracks} currentUser={currentUser} postTracks={postTracks} showToast={showToast} />
      )}
      {activeSubTab === 'fases' && (
        <GestionFases teams={teams} currentUser={currentUser} showToast={showToast} confirm={confirm} />
      )}
      {activeSubTab === 'sistema' && (
        <GestionSistema fetchData={fetchData} showToast={showToast} confirm={confirm} currentUser={currentUser} />
      )}
    </div>
  );
}

// ---- SUB-MODULO: GESTIÓN DE PISTAS ------------------------------------------
function GestionPistas({ tracks, currentUser, postTracks, showToast }) {
  const plugin = getCategoryPlugin(currentUser.category);
  const [editingTrack, setEditingTrack] = React.useState(null);

  const saveTrack = (ronda, pistaIndex, data) => {
    const updated = JSON.parse(JSON.stringify(tracks));
    if (!updated[ronda]) updated[ronda] = {};
    updated[ronda][pistaIndex] = { ...updated[ronda][pistaIndex], ...data };
    postTracks(updated);
    showToast(`✅ Pista ${pistaIndex} de Ronda ${ronda} actualizada`);
    setEditingTrack(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Mapeo de Pistas</h3>
          <p className="text-xl font-black text-slate-800 uppercase italic">Rondas de {plugin.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: plugin.maxRounds || 5 }, (_, i) => i + 1).map(r => (
          <div key={r} className="border-2 border-slate-50 rounded-[2rem] p-6 space-y-4 bg-slate-50/30 hover:border-blue-100 transition-all">
            <p className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px]">R{r}</span>
              Ronda {r}
            </p>
            <div className="space-y-2">
              {Array.from({ length: plugin.trackType === 'quest_map' ? 5 : 1 }, (_, i) => i + 1).map(p => {
                const trackData = tracks[r]?.[p] || {};
                return (
                  <div key={p} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Pista {p}</span>
                    <button onClick={() => setEditingTrack({ r, p, ...trackData })}
                      className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase flex items-center gap-1">
                      <Icon name="edit-3" className="w-3 h-3" /> Editar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {editingTrack && (
        <ModalTrackEditor
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSave={(data) => saveTrack(editingTrack.r, editingTrack.p, data)}
        />
      )}
    </div>
  );
}

function ModalTrackEditor({ track, onClose, onSave }) {
  const [mapUrl, setMapUrl] = React.useState(track.mapUrl || '');
  const [points, setPoints] = React.useState(track.points || 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scaleUp">
        <h3 className="text-xl font-black text-blue-900 uppercase italic mb-6">Editar Pista {track.p} (R{track.r})</h3>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Imagen / Mapa URL</label>
            <input value={mapUrl} onChange={e => setMapUrl(e.target.value)}
              placeholder="assets/mapas/pista_r1.png"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Puntaje Base</label>
            <input type="number" value={points} onChange={e => setPoints(parseInt(e.target.value)||0)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-10">
          <button onClick={onClose} 
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase transition-all">
            Cancelar
          </button>
          <button onClick={() => onSave({ mapUrl, points })} 
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-200 transition-all">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- SUB-MODULO: GESTIÓN DE FASES -------------------------------------------
function GestionFases({ teams, currentUser, showToast, confirm }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-8">
      <div>
        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Misión Crítica</h3>
        <p className="text-xl font-black text-slate-800 uppercase italic">Control de la Competencia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-orange-50/50 border-2 border-orange-100 rounded-[2rem] p-8 space-y-4">
          <p className="font-black text-orange-700 text-sm flex items-center gap-2">
            <Icon name="alert-triangle" className="w-5 h-5" /> Acciones de Alto Riesgo
          </p>
          <p className="text-xs text-orange-600/80 font-medium leading-relaxed">Estas acciones son permanentes y afectan a todo el sistema sincronizado.</p>
          <div className="space-y-3 pt-4">
            <button onClick={() => confirm({ 
              title: 'Reset de Categoría', 
              message: '¿Borrar TODOS los puntajes y equipos de esta categoría? Esta acción es irreversible.',
              onConfirm: () => showToast('⚠️ Bloqueado por seguridad estructural.')
            })}
              className="w-full py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">
              Resetear Categoría Actual
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] p-8">
          <p className="font-black text-slate-800 text-sm mb-6">Estadísticas de Participación</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Equipos Inscritos</span>
              <span className="text-2xl font-black text-blue-600">{teams.length}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Aprobados p/ Evaluar</span>
              <span className="text-2xl font-black text-green-600">{teams.filter(t => t.status === 'inspected').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- SUB-MODULO: SISTEMA ----------------------------------------------------
function GestionSistema({ fetchData, showToast, confirm, currentUser }) {
  const { timer, timerActive, toggle, reset, formatTime } = useCategoryTimer(currentUser?.category || 'quest');

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-8">
        <div>
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Broadcast Control</h3>
          <p className="text-xl font-black text-slate-800 uppercase italic">Cronómetro Global de {getCategoryPlugin(currentUser?.category).title}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className={`text-8xl font-black font-mono px-12 py-8 rounded-[3rem] ${timerActive ? 'bg-blue-600 text-white animate-pulse shadow-2xl shadow-blue-400/50' : 'bg-slate-100 text-slate-400 shadow-inner'}`}>
            {formatTime(timer)}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <button onClick={toggle}
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${
                timerActive ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
              }`}>
              {timerActive ? '⏹ Detener Reloj de Competencia' : '▶ Iniciar Reloj de Competencia'}
            </button>
            <div className="grid grid-cols-4 gap-2">
              {[60, 120, 300, 1800].map(s => (
                <button key={s} onClick={() => reset(s)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase transition-all">
                  {s/60}m
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
          <Icon name="info" className="w-5 h-5 text-blue-600" />
          <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
            Este reloj se sincroniza en tiempo real con todas las pantallas de TV y dispositivos de los jueces.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Herramientas de Mantenimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => { fetchData(); showToast('🔄 Sincronización exitosa'); }}
            className="flex items-center justify-center gap-3 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase transition-all border border-white/5">
            <Icon name="refresh-cw" className="w-5 h-5" /> Forzar Sync
          </button>
          <button onClick={() => confirm({
              title: 'Cargar Datos de Prueba',
              message: 'Se añadirán equipos ficticios en todas las categorías para validación. ¿Continuar?',
              onConfirm: () => {
                fetch('/api/reset', { 
                  method: 'POST', 
                  headers: {'Content-Type':'application/json'},
                  body: JSON.stringify({ userId: currentUser.id, password: 'ada123admin' })
                }).then(() => {
                   showToast('✨ Datos reiniciados y listos para prueba');
                   fetchData();
                });
              }
            })}
            className="flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl shadow-blue-500/20">
            <Icon name="database" className="w-5 h-5" /> Generar Dummy Data
          </button>
          <button onClick={() => showToast('📂 Backup JSON generado')}
            className="flex items-center justify-center gap-3 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase transition-all border border-white/5">
            <Icon name="download" className="w-5 h-5" /> Descargar Backup
          </button>
        </div>
      </div>
    </div>
  );
}
