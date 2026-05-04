// ============================================================================
// view_pistas.js - CONFIGURADOR DE MAPAS MODULAR
// Sistema_Univ.Sar - Motor Modular Adagames
// ============================================================================


// ============================================================================
// QUEST: MAP CONFIGURATOR
// ============================================================================
function QuestMapConfigurator({ tracks, updateTrackData }) {
  const [selRonda, setSelRonda] = React.useState(1);
  const [selPista, setSelPista] = React.useState(1);
  const [mode, setMode] = React.useState('sequence');

  const currentTrack = (tracks[selRonda] && tracks[selRonda][selPista])
    ? tracks[selRonda][selPista]
    : { sequence: [], obstacles: [] };

  const toggleCell = (id) => {
    const sequence = currentTrack.sequence || [];
    const obstacles = currentTrack.obstacles || [];
    
    if (mode === 'sequence') {
      const idx = sequence.indexOf(id);
      if (idx > -1) {
        updateTrackData(selRonda, selPista, { sequence: sequence.filter(c => c !== id) });
      } else {
        updateTrackData(selRonda, selPista, {
          sequence: [...sequence, id],
          obstacles: obstacles.filter(c => c !== id)
        });
      }
    } else if (mode === 'bonus_start') {
      updateTrackData(selRonda, selPista, {
        bonusStart: currentTrack.bonusStart === id ? '' : id
      });
    } else {
      const isObs = obstacles.includes(id);
      updateTrackData(selRonda, selPista, {
        obstacles: isObs ? obstacles.filter(c => c !== id) : [...obstacles, id],
        sequence: sequence.filter(c => c !== id)
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn">
      <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-3xl shadow-xl border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="space-y-3 md:space-y-4 w-full lg:w-auto">
            <h2 className="text-xl md:text-2xl font-black text-blue-900 tracking-tight uppercase leading-tight">Configurador de Mapas</h2>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setSelRonda(r)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-xs font-black transition-all ${selRonda === r ? 'bg-blue-600 text-white shadow-blue-500/40 shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {r === 5 ? 'FINAL' : `R${r}`}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} onClick={() => setSelPista(p)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-xs font-black transition-all ${selPista === p ? 'bg-blue-400 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  P{p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto mt-2 lg:mt-0 overflow-x-auto no-scrollbar">
            <button onClick={() => setMode('sequence')} className={`flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black flex items-center justify-center gap-1.5 md:gap-2 transition-all whitespace-nowrap ${mode === 'sequence' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" /> RUTA
            </button>
            <button onClick={() => setMode('obstacle')} className={`flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black flex items-center justify-center gap-1.5 md:gap-2 transition-all whitespace-nowrap ${mode === 'obstacle' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
              <Icon name="x-circle" className="w-3 h-3 text-red-600" /> OBSTÁCULO
            </button>
            <button onClick={() => setMode('bonus_start')} className={`flex-1 lg:flex-none px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black flex items-center justify-center gap-1.5 md:gap-2 transition-all whitespace-nowrap ${mode === 'bonus_start' ? 'bg-white text-yellow-600 shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
              ⭐ BONUS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
          <div className="xl:col-span-3 flex flex-col items-center">
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar no-scrollbar relative">
              <div className="inline-block min-w-[650px] border-[6px] md:border-[8px] border-blue-600 rounded-[1.5rem] md:rounded-2xl bg-white shadow-2xl overflow-hidden mx-auto relative">
                {/* Imagen de fondo opcional */}
                {tracks[selRonda]?.mapUrl && (
                  <img 
                    src={tracks[selRonda].mapUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                    alt=""
                  />
                )}
                <div className="grid grid-cols-11 bg-blue-600 text-white font-black text-[10px] md:text-[12px] relative z-10">
                  <div className="p-2 md:p-3 border-r border-blue-500/50 flex items-center justify-center bg-blue-700">#</div>
                  {QUEST_COLS.map(c => <div key={c} className="p-2 md:p-3 text-center flex items-center justify-center">{c}</div>)}
                </div>
                {QUEST_ROWS.map(r => (
                  <div key={r} className="grid grid-cols-11 border-b border-blue-50 last:border-0 relative z-10">
                    <div className="bg-blue-600 text-white font-black text-[10px] md:text-[12px] flex items-center justify-center border-r border-blue-500/50 p-3 md:p-4">{r}</div>
                    {QUEST_COLS.map(c => {
                      const id = `${c}${r}`;
                      const seqIdx = (currentTrack.sequence || []).indexOf(id);
                      const isObs = (currentTrack.obstacles || []).includes(id);
                      const isBonusStart = currentTrack.bonusStart === id;
                      return (
                        <button key={id} onClick={() => toggleCell(id)} className={`aspect-square border-r border-blue-50 last:border-0 flex items-center justify-center relative hover:bg-blue-50/50 transition-colors ${isObs ? 'bg-red-50/50' : ''}`}>
                          {isBonusStart && (
                            <div className="absolute -top-1.5 md:-top-2 -right-1.5 md:-right-2 w-5 h-5 md:w-8 md:h-8 bg-yellow-400 flex items-center justify-center shadow-xl rounded-full transform border border-yellow-200 z-20 text-[10px] md:text-sm">
                              ⭐
                            </div>
                          )}
                          {seqIdx > -1 && (
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shadow-lg border md:border-2 border-blue-300 text-[10px] md:text-sm">
                              {seqIdx + 1}
                            </div>
                          )}
                          {isObs && (
                            <div className="w-7 h-7 md:w-10 md:h-10 bg-red-600 flex items-center justify-center shadow-xl rounded-md transform border md:border-2 border-red-400">
                              <Icon name="x-circle" className="text-white w-4 h-4 md:w-7 md:h-7" />
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


          <div className="bg-blue-50/50 p-5 md:p-6 rounded-[2rem] md:rounded-3xl border border-blue-100 h-fit">
            <h3 className="font-black text-blue-900 text-[11px] md:text-sm mb-4 flex items-center gap-2 uppercase">
              <Icon name="star" className="text-blue-600 w-4 h-4" /> Resumen Pista {selPista}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 md:gap-4">
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-blue-100">
                  <p className="text-[9px] md:text-[10px] font-bold text-blue-400 mb-0.5 md:mb-1 uppercase">Puntos Ruta</p>
                  <p className="text-2xl md:text-3xl font-black text-blue-600 leading-none">{(currentTrack.sequence || []).length}</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-red-100">
                  <p className="text-[9px] md:text-[10px] font-bold text-red-400 mb-0.5 md:mb-1 uppercase">Obstáculos</p>
                  <p className="text-2xl md:text-3xl font-black text-red-50">{(currentTrack.obstacles || []).length}</p>
                </div>
              </div>

              <div className="bg-yellow-50/50 p-4 rounded-2xl shadow-sm border border-yellow-200 mt-4 space-y-3">
                <h4 className="text-[9px] md:text-[10px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Icon name="star" className="w-3 h-3" /> Ajustes de Bonus
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] md:text-[9px] font-bold text-yellow-600 mb-1 uppercase">Puntaje Bonus</p>
                    <input
                      type="number"
                      value={currentTrack.bonusPoints || 3}
                      onChange={(e) => updateTrackData(selRonda, selPista, { bonusPoints: parseInt(e.target.value) || 0 })}
                      className="w-full text-[12px] p-2 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-yellow-800 font-black text-center"
                    />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] font-bold text-yellow-600 mb-1 uppercase">Orientación</p>
                    <div className="flex gap-1 h-[34px]">
                      {['N', 'S', 'E', 'O'].map(dir => (
                        <button key={dir} onClick={() => updateTrackData(selRonda, selPista, { bonusDir: dir === currentTrack.bonusDir ? '' : dir })} className={`flex-1 rounded-lg text-[10px] font-black transition-all ${currentTrack.bonusDir === dir ? 'bg-yellow-500 text-white shadow-md' : 'bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-100'}`}>
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-bold text-yellow-600 mb-1 uppercase">Reglas</p>
                  <textarea
                    value={currentTrack.bonusRules || ''}
                    onChange={(e) => updateTrackData(selRonda, selPista, { bonusRules: e.target.value })}
                    className="w-full text-[10px] p-2 md:p-3 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-yellow-800 placeholder-yellow-300 font-bold leading-tight"
                    placeholder="Nota del bonus..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 mt-4 space-y-2">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Icon name="image" className="w-3 h-3" /> Mapa Base - Ronda {selRonda}
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="URL del mapa..."
                    value={tracks[selRonda]?.mapUrl || ''}
                    onChange={(e) => {
                      updateTrackData(selRonda, 1, { mapUrl: e.target.value });
                    }}
                    className="flex-1 text-[10px] p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <p className="text-[7px] text-slate-400 uppercase font-bold italic">La imagen se mostrará detrás de la cuadrícula</p>
              </div>

              <button onClick={() => updateTrackData(selRonda, selPista, { sequence: [], obstacles: [], bonusStart: '', bonusDir: '', bonusRules: '' })} className="w-full py-3 md:py-4 text-red-500 text-[9px] md:text-[10px] font-black hover:bg-red-50 rounded-2xl transition-all border border-red-200 flex items-center justify-center gap-2 uppercase">
                <Icon name="trash-2" className="w-3.5 h-3.5 md:w-4 md:h-4" /> Limpiar Pista
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function LineFollowerMapConfigurator({ tracks, updateTrackData, showToast }) {
  const [selRonda, setSelRonda] = React.useState(1);
  const [selPista, setSelPista] = React.useState(1);
  const [bgImage, setBgImage] = React.useState(null);
  const [points, setPoints] = React.useState([]);
  const [guideX, setGuideX] = React.useState(50);
  const [guideY, setGuideY] = React.useState(50);
  const [selectedPointId, setSelectedPointId] = React.useState(null);
  const [dragTarget, setDragTarget] = React.useState(null);
  const canvasRef = React.useRef(null);

  // Sincronización robusta con el estado global
  const trackDataStr = React.useMemo(() => JSON.stringify(tracks?.[selRonda]?.[selPista] || {}), [tracks, selRonda, selPista]);

  React.useEffect(() => {
    const data = tracks?.[selRonda]?.[selPista] || {};
    setBgImage(data.bgImage || null);
    setPoints(data.points || []);
    setGuideX(data.guideX || 50);
    setGuideY(data.guideY || 50);
  }, [selRonda, selPista, trackDataStr]);

  const saveCurrentTrack = () => {
    updateTrackData(selRonda, selPista, { bgImage, points, guideX, guideY });
    if (showToast) showToast(`¡Pista ${selPista} de Ronda ${selRonda} guardada!`, 'success');
  };

  const handleCanvasClick = (e) => {
    if (dragTarget || e.target.closest('.point-marker') || e.target.closest('.guide-handle')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPoint = { id: Date.now(), x, y, value: 10, isCompleted: false };
    const updatedPoints = [...points, newPoint];
    setPoints(updatedPoints);
    setSelectedPointId(newPoint.id);
    updateTrackData(selRonda, selPista, { points: updatedPoints });
  };

  const handleMouseMove = (e) => {
    if (!dragTarget) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    if (dragTarget.type === 'point') {
      setPoints(points.map(p => p.id === dragTarget.id ? { ...p, x, y } : p));
    } else if (dragTarget.type === 'guideX') {
      setGuideX(x);
    } else if (dragTarget.type === 'guideY') {
      setGuideY(y);
    }
  };

  const handleMouseUp = () => {
    if (dragTarget) {
      updateTrackData(selRonda, selPista, { points, guideX, guideY });
    }
    setDragTarget(null);
  };

  const handlePointMouseDown = (e, id) => {
    e.stopPropagation();
    setDragTarget({ type: 'point', id });
    setSelectedPointId(id);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("ronda", selRonda);
      formData.append("pista", selPista);
      formData.append("file", file);
      try {
        const response = await fetch(`/api/upload_map`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.url) {
          setBgImage(data.url);
          updateTrackData(selRonda, selPista, { bgImage: data.url });
        }
      } catch (err) {
        console.error("Error subiendo mapa:", err);
      }
    }
  };

  const updatePointValue = (id, val) => {
    const updated = points.map(p => p.id === id ? { ...p, value: parseInt(val) || 0 } : p);
    setPoints(updated);
    updateTrackData(selRonda, selPista, { points: updated });
  };

  const deletePoint = (id) => {
    const updated = points.filter(p => p.id !== id);
    setPoints(updated);
    if (selectedPointId === id) setSelectedPointId(null);
    updateTrackData(selRonda, selPista, { points: updated });
  };

  const stats = React.useMemo(() => {
    const quadrants = { Q1: { max: 0 }, Q2: { max: 0 }, Q3: { max: 0 }, Q4: { max: 0 } };
    points.forEach(p => {
      let q = 'Q4';
      if (p.x <= guideX && p.y <= guideY) q = 'Q1';
      else if (p.x > guideX && p.y <= guideY) q = 'Q2';
      else if (p.x <= guideX && p.y > guideY) q = 'Q3';
      quadrants[q].max += p.value;
    });
    return { quadrants };
  }, [points, guideX, guideY]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0a0c12] rounded-[2rem] overflow-hidden border border-[#2a2e3f] shadow-2xl animate-fadeIn"
         onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      <div className="bg-[#161925] border-b border-[#2a2e3f] p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Configuración</span>
            <div className="flex gap-2">
              <select value={selRonda} onChange={e => setSelRonda(parseInt(e.target.value))} className="bg-[#0a0c12] border border-[#2a2e3f] rounded-xl px-4 py-2 text-sm font-black text-white outline-none">
                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>Ronda {r}</option>)}
              </select>
              <select value={selPista} onChange={e => setSelPista(parseInt(e.target.value))} className="bg-[#0a0c12] border border-[#2a2e3f] rounded-xl px-4 py-2 text-sm font-black text-white outline-none">
                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>Pista {p}</option>)}
              </select>
            </div>
          </div>
          <div className="h-10 w-px bg-[#2a2e3f]"></div>
          <div className="flex gap-4">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <div key={q} className="flex flex-col items-center">
                <span className="text-[8px] text-slate-500 font-bold uppercase">{q}</span>
                <span className="text-white font-black text-xs">{stats.quadrants[q].max}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => canvasRef.current && html2canvas(canvasRef.current).then(c => {
            const link = document.createElement('a');
            link.download = `pista_R${selRonda}_P${selPista}.png`;
            link.href = c.toDataURL();
            link.click();
          })} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2">
            <Icon name="image" className="w-4 h-4" /> Exportar
          </button>
          <button onClick={saveCurrentTrack} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-blue-600/20">
            <Icon name="save" className="w-4 h-4" /> Guardar Pista
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#0a0c12] p-8 flex items-center justify-center overflow-hidden">
        <div ref={canvasRef} onClick={handleCanvasClick} className="relative w-full max-w-5xl aspect-[16/10] bg-white rounded-2xl shadow-2xl overflow-hidden cursor-crosshair border-2 border-[#2a2e3f]">
          {bgImage ? (
            <img src={bgImage} alt="Map" className="w-full h-full object-fill pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <Icon name="image" className="w-16 h-16 opacity-20 mb-4" />
              <p className="font-black text-xl uppercase italic opacity-20 text-center">Subir Mapa para Continuar</p>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 border-l-2 border-red-500/40" style={{ left: `${guideX}%` }}></div>
            <div className="absolute left-0 right-0 border-t-2 border-red-500/40" style={{ top: `${guideY}%` }}></div>
          </div>

          <div onMouseDown={() => setDragTarget({ type: 'guideX' })} className="guide-handle absolute top-0 bottom-0 w-6 -ml-3 cursor-ew-resize flex items-center justify-center group pointer-events-auto" style={{ left: `${guideX}%` }}>
            <div className="w-1 h-20 bg-red-500 rounded-full group-hover:w-2 transition-all"></div>
          </div>
          <div onMouseDown={() => setDragTarget({ type: 'guideY' })} className="guide-handle absolute left-0 right-0 h-6 -mt-3 cursor-ns-resize flex items-center justify-center group pointer-events-auto" style={{ top: `${guideY}%` }}>
            <div className="h-1 w-20 bg-red-500 rounded-full group-hover:h-2 transition-all"></div>
          </div>

          {points.map(p => (
            <div key={p.id} 
                 onMouseDown={(e) => handlePointMouseDown(e, p.id)}
                 onClick={(e) => { e.stopPropagation(); setSelectedPointId(p.id); }}
                 className={`point-marker absolute w-10 h-10 -ml-5 -mt-5 rounded-lg border-2 flex items-center justify-center font-black text-xs shadow-xl transition-all cursor-move z-10 ${selectedPointId === p.id ? 'bg-blue-600 border-white scale-110 z-20' : 'bg-[#161925] border-blue-500 text-blue-400'}`}
                 style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {p.value}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#161925] border-t border-[#2a2e3f] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input type="file" id="mapUpload" className="hidden" onChange={handleImageUpload} />
          <label htmlFor="mapUpload" className="px-5 py-3 bg-[#1c1f2e] hover:bg-[#2a2e3f] text-slate-300 rounded-xl text-xs font-black uppercase cursor-pointer flex items-center gap-2 border border-[#2a2e3f] transition-all">
            <Icon name="upload" className="w-4 h-4" /> {bgImage ? 'Cambiar Mapa' : 'Subir Mapa'}
          </label>
        </div>

        <div className="flex items-center gap-6 flex-1 max-w-xl bg-[#0a0c12] p-2 rounded-2xl border border-[#2a2e3f]">
          <div className="flex items-center gap-3 flex-1 px-4">
            <span className="text-[10px] font-black text-red-500 uppercase">Guía X</span>
            <input type="range" min="0" max="100" value={guideX} onChange={e => {
              const val = parseInt(e.target.value);
              setGuideX(val);
              updateTrackData(selRonda, selPista, { guideX: val });
            }} className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500" />
          </div>
          <div className="flex items-center gap-3 flex-1 px-4 border-l border-[#2a2e3f]">
            <span className="text-[10px] font-black text-red-500 uppercase">Guía Y</span>
            <input type="range" min="0" max="100" value={guideY} onChange={e => {
              const val = parseInt(e.target.value);
              setGuideY(val);
              updateTrackData(selRonda, selPista, { guideY: val });
            }} className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-500" />
          </div>
        </div>

        <div className={`flex items-center gap-4 px-6 py-2 rounded-2xl border-2 transition-all ${selectedPointId ? 'bg-blue-600/10 border-blue-500' : 'bg-[#0a0c12] border-[#2a2e3f] opacity-50'}`}>
          <span className="text-[10px] font-black text-blue-400 uppercase">Valor</span>
          <input type="number" 
                 value={selectedPointId ? points.find(p => p.id === selectedPointId)?.value || 0 : ''} 
                 onChange={(e) => updatePointValue(selectedPointId, e.target.value)}
                 disabled={!selectedPointId}
                 className="w-16 bg-[#161925] border border-[#2a2e3f] rounded-lg px-2 py-1 text-center font-black text-white outline-none" />
          <button onClick={() => deletePoint(selectedPointId)} disabled={!selectedPointId} className="text-red-400 hover:text-red-300 p-1">
            <Icon name="trash-2" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ROUTER: PISTAS VIEW
// ============================================================================
function PistasView({ tracks, currentUser, postTracks, showToast }) {
  try {
    // Asegurar que tracks nunca sea null
    const safeTracks = tracks || {};
    const plugin = typeof getCategoryPlugin === 'function' ? getCategoryPlugin(currentUser?.category) : { id: 'quest' };
    
    const handleUpdateTrack = (ronda, pista, newData) => {
      const updated = { 
        ...safeTracks,
        [ronda]: {
          ...(safeTracks[ronda] || {}),
          [pista]: {
            ...(safeTracks[ronda]?.[pista] || {}),
            ...newData
          }
        }
      };
      
      // Manejo especial para datos a nivel de ronda (como mapUrl)
      if (newData.mapUrl !== undefined) {
        updated[ronda].mapUrl = newData.mapUrl;
      }
      
      postTracks(updated);
    };

    const debugInfo = `Cat: ${currentUser?.category || 'null'} | Plugin: ${plugin?.id || 'null'} | Type: ${plugin?.trackType || 'null'}`;

    let content = null;
    if (plugin?.id === 'quest' || plugin?.trackType === 'quest_map') {
      content = <QuestMapConfigurator tracks={safeTracks} updateTrackData={handleUpdateTrack} showToast={showToast} />;
    } else if (plugin?.id === 'line_follower' || plugin?.trackType === 'line_follower_grid') {
      content = <LineFollowerMapConfigurator tracks={safeTracks} updateTrackData={handleUpdateTrack} showToast={showToast} />;
    } else {
      content = (
        <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-[2rem] border border-slate-100">
          <Icon name="map" className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">Generador de Pistas no aplicable</h2>
          <p className="text-slate-400 mt-2">La categoría "{plugin?.title || currentUser?.category}" no utiliza mapas digitales avanzados.</p>
          <p className="text-[10px] text-slate-300 mt-4 font-mono">{debugInfo}</p>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute -top-6 right-0 text-[8px] text-slate-300 font-mono">
          {debugInfo} | v10.2 (Safe)
        </div>
        {content}
      </div>
    );
  } catch (error) {
    console.error("Critical Error in PistasView:", error);
    return (
      <div className="p-8 bg-red-50 border-2 border-red-200 rounded-3xl text-red-900">
        <h2 className="font-black uppercase italic mb-2">⚠️ Error Crítico en Pistas</h2>
        <p className="text-xs font-mono mb-4">{error.message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase">Reiniciar Aplicación</button>
      </div>
    );
  }
}


window.PistasView = PistasView;
