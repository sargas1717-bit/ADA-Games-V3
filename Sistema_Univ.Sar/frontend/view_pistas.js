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
                      const updated = { ...tracks };
                      if (!updated[selRonda]) updated[selRonda] = {};
                      updated[selRonda].mapUrl = e.target.value;
                      updateTrackData(selRonda, 1, { __dummy: Date.now() }, updated); // Trigger save with updated round object
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

// ============================================================================
// LINE FOLLOWER: MAP CONFIGURATOR
// ============================================================================
function LineFollowerMapConfigurator({ tracks, updateTrackData, showToast }) {
  const [selRonda, setSelRonda] = React.useState(1);
  const [selPista, setSelPista] = React.useState(1);
  const canvasRef = React.useRef(null);
  
  const [bgImage, setBgImage] = React.useState(null);
  const [points, setPoints] = React.useState([]);
  const [guideX, setGuideX] = React.useState(50);
  const [guideY, setGuideY] = React.useState(50);
  
  const [selectedPointId, setSelectedPointId] = React.useState(null);
  const [dragTarget, setDragTarget] = React.useState(null);

  React.useEffect(() => {
    let newPoints = [];
    if (tracks && tracks[selRonda] && tracks[selRonda][selPista]) {
      const data = tracks[selRonda][selPista];
      setBgImage(data.bgImage || null);
      newPoints = data.points || [];
      setGuideX(data.guideX || 50);
      setGuideY(data.guideY || 50);
    } else {
      setBgImage(null);
      setGuideX(50);
      setGuideY(50);
    }
    setPoints(newPoints);
    setSelectedPointId(null);
  }, [tracks, selRonda, selPista]);

  const saveCurrentTrack = () => {
    if (updateTrackData) {
      updateTrackData(selRonda, selPista, { bgImage, points, guideX, guideY });
      showToast(`¡Pista ${selPista} de Ronda ${selRonda} guardada correctamente!`);
    }
  };

  const clearCurrentTrack = () => {
    setBgImage(null);
    setPoints([]);
    setGuideX(50);
    setGuideY(50);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input') return;
      if (selectedPointId && (e.key === 'Delete' || e.key === 'Backspace')) {
        setPoints(prevPoints => prevPoints.filter(p => p.id !== selectedPointId));
        setSelectedPointId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPointId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("ronda", selRonda);
      formData.append("pista", selPista);
      formData.append("file", file);

      try {
        const response = await fetch(`${window.API_BASE || '/api'}/upload_map`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.url) {
          setBgImage(data.url);
        }
      } catch (err) {
        console.error("Error subiendo mapa:", err);
        const reader = new FileReader();
        reader.onload = (event) => setBgImage(event.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (dragTarget || e.target.closest('.point-marker') || e.target.closest('.guide-handle')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPoint = { id: Date.now(), x, y, value: 10, isCompleted: false };
    setPoints([...points, newPoint]);
    setSelectedPointId(newPoint.id);
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

  const handleMouseUp = () => setDragTarget(null);

  const handlePointMouseDown = (e, id) => {
    e.stopPropagation();
    setDragTarget({ type: 'point', id });
    setSelectedPointId(id);
  };

  const updatePointValue = (id, newValue) => {
    setPoints(points.map(p => p.id === id ? { ...p, value: Number(newValue) } : p));
  };

  const deletePoint = (id) => {
    setPoints(points.filter(p => p.id !== id));
    if (selectedPointId === id) setSelectedPointId(null);
  };

  const getQuadrant = (x, y) => {
    if (x <= guideX && y <= guideY) return 'Q1';
    if (x > guideX && y <= guideY) return 'Q2';
    if (x <= guideX && y > guideY) return 'Q3';
    return 'Q4';
  };

  const stats = React.useMemo(() => {
    let maxTotal = 0;
    const quadrants = {
      Q1: { score: 0, max: 0 }, Q2: { score: 0, max: 0 },
      Q3: { score: 0, max: 0 }, Q4: { score: 0, max: 0 }
    };
    points.forEach(p => {
      const q = getQuadrant(p.x, p.y);
      quadrants[q].max += p.value;
      maxTotal += p.value;
    });
    return { maxTotal, quadrants };
  }, [points, guideX, guideY]);

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full bg-[#0f111a] text-slate-200 font-sans overflow-hidden select-none rounded-[2.5rem] shadow-xl animate-fadeIn">
      <div className="flex-1 flex flex-col relative overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="h-16 border-b border-[#2a2e3f] bg-[#161925] px-8 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2 text-white">
            <Icon name="map" className="w-5 h-5 text-blue-500" /> CONFIGURAR NUEVO MAPA
          </h2>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Ronda</span>
              <select value={selRonda} onChange={e => setSelRonda(parseInt(e.target.value))} className="bg-[#0a0c12] border border-[#2a2e3f] rounded-lg px-2 py-1 text-sm text-white font-bold cursor-pointer">
                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Pista</span>
              <select value={selPista} onChange={e => setSelPista(parseInt(e.target.value))} className="bg-[#0a0c12] border border-[#2a2e3f] rounded-lg px-2 py-1 text-sm text-white font-bold cursor-pointer">
                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={saveCurrentTrack} className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95">
              <Icon name="save" className="w-4 h-4" /> Guardar Pista
            </button>
            <button
              onClick={async () => {
                if (!canvasRef.current) return;
                showToast("Generando imagen...");
                try {
                  const canvas = await html2canvas(canvasRef.current, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff'
                  });
                  const link = document.createElement('a');
                  link.download = `pista_${selRonda}_${selPista}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                  showToast("Imagen descargada exitosamente");
                } catch (err) {
                  showToast("Error exportando imagen");
                  console.error(err);
                }
              }}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Icon name="image" className="w-4 h-4" /> Exportar PNG
            </button>
            <button onClick={clearCurrentTrack} title="Limpiar Pista" className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
              <Icon name="trash-2" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-6 text-sm font-medium bg-[#0f111a] py-2 px-4 rounded-xl border border-[#2a2e3f]">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <div key={q} className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 mb-0.5">{q}</span>
                <span className="text-slate-300">
                  0/{stats.quadrants[q].max || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8 relative overflow-hidden flex items-center justify-center bg-[#0a0c12]">
          <div className="relative w-full max-w-5xl aspect-[16/10]">
            <div className="absolute -top-6 left-0 text-xs font-bold text-slate-400 pointer-events-none">Q1 Sup Izq</div>
            <div className="absolute -top-6 right-0 text-xs font-bold text-slate-400 pointer-events-none">Q2 Sup Der</div>
            <div className="absolute -bottom-6 left-0 text-xs font-bold text-slate-400 pointer-events-none">Q3 Inf Izq</div>
            <div className="absolute -bottom-6 right-0 text-xs font-bold text-slate-400 pointer-events-none">Q4 Inf Der</div>

            <div ref={canvasRef} onClick={handleCanvasClick} className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-dashed border-blue-500/50 cursor-crosshair">
              {bgImage ? (
                <img src={bgImage} alt="Pista" className="absolute inset-0 w-full h-full object-contain pointer-events-none bg-white" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-500 pointer-events-none">
                  <Icon name="image" className="w-16 h-16 mb-4 opacity-30 text-slate-800" />
                  <p className="font-semibold text-lg text-slate-600">Sube una imagen para la pista</p>
                  <p className="text-sm mt-2 text-slate-500">Haz clic en el panel inferior para cargar</p>
                </div>
              )}
              <div className="guide-handle absolute top-0 bottom-0 w-6 -ml-3 flex justify-center z-10 cursor-col-resize hover:bg-black/5" style={{ left: `${guideX}%` }} onMouseDown={(e) => { e.stopPropagation(); setDragTarget({ type: 'guideX' }); }}>
                <div className="w-0 h-full border-l-4 border-dashed border-red-500/80" />
              </div>
              <div className="guide-handle absolute left-0 right-0 h-6 -mt-3 flex items-center z-10 cursor-row-resize hover:bg-black/5" style={{ top: `${guideY}%` }} onMouseDown={(e) => { e.stopPropagation(); setDragTarget({ type: 'guideY' }); }}>
                <div className="h-0 w-full border-t-4 border-dashed border-red-500/80" />
              </div>
              {points.map(point => (
                <div key={point.id} className={`point-marker absolute -translate-x-1/2 -translate-y-1/2 rounded shadow-lg flex items-center justify-center font-bold text-xs transition-all cursor-grab active:cursor-grabbing ${selectedPointId === point.id ? 'ring-2 ring-yellow-400 z-20' : 'z-10'} bg-[#2a2e3f] text-slate-300 border border-slate-600`} style={{ left: `${point.x}%`, top: `${point.y}%`, width: '42px', height: '24px' }} onClick={(e) => { e.stopPropagation(); setSelectedPointId(point.id); }} onMouseDown={(e) => handlePointMouseDown(e, point.id)}>
                  {point.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-24 bg-[#161925] border-t border-[#2a2e3f] px-6 py-4 flex items-center shrink-0 z-10">
          <div className="flex w-full items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-[#0f111a] px-4 py-2 rounded-xl border border-[#2a2e3f]">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold hover:text-blue-400 transition-colors">
                <Icon name="upload" className="w-5 h-5" /> <span>Cargar Mapa</span>
                <input type="file" accept="image/*,.svg,image/svg+xml" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="flex items-center gap-6 bg-[#0f111a] px-6 py-2 rounded-xl border border-[#2a2e3f] flex-1 max-w-xl">
              <span className="text-sm font-semibold text-slate-400 whitespace-nowrap">Guías Cuadrantes:</span>
              <div className="flex items-center gap-2 flex-1"><span className="text-xs font-bold text-red-400">X</span><input type="range" min="0" max="100" value={guideX} onChange={(e) => setGuideX(e.target.value)} className="w-full accent-red-500 h-1" /></div>
              <div className="flex items-center gap-2 flex-1"><span className="text-xs font-bold text-red-400">Y</span><input type="range" min="0" max="100" value={guideY} onChange={(e) => setGuideY(e.target.value)} className="w-full accent-red-500 h-1" /></div>
            </div>
            <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border transition-all ${selectedPointId ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#0f111a] border-[#2a2e3f] opacity-50'}`}>
              <span className="text-sm font-semibold text-slate-300">Valor Pieza:</span>
              <input type="number" value={selectedPointId ? points.find(p => p.id === selectedPointId)?.value || 0 : ''} onChange={(e) => selectedPointId && updatePointValue(selectedPointId, e.target.value)} disabled={!selectedPointId} className="w-20 bg-[#1a1d2d] border border-[#2a2e3f] rounded px-2 py-1 text-center font-bold focus:outline-none focus:border-blue-500 text-slate-200" />
              <button onClick={() => selectedPointId && deletePoint(selectedPointId)} disabled={!selectedPointId} className="p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded transition-colors disabled:opacity-50"><Icon name="trash-2" className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ROUTER: PISTAS VIEW
// ============================================================================
function PistasView({ tracks, currentUser, postTracks, showToast }) {
  const plugin = getCategoryPlugin(currentUser?.category);
  
  // Debug info
  const debugInfo = `Cat: ${currentUser?.category || 'null'} | Plugin: ${plugin?.id || 'null'} | Type: ${plugin?.trackType || 'null'}`;

  const handleUpdateTrack = (ronda, pista, newData) => {
    const updated = { ...tracks };
    if (!updated[ronda]) updated[ronda] = {};
    updated[ronda][pista] = { ...(updated[ronda][pista] || {}), ...newData };
    postTracks(updated);
  };

  let content = null;
  if (plugin?.id === 'quest' || plugin?.trackType === 'quest_map') {
    content = <QuestMapConfigurator tracks={tracks} updateTrackData={handleUpdateTrack} showToast={showToast} />;
  } else if (plugin?.id === 'line_follower' || plugin?.trackType === 'line_follower_grid') {
    content = <LineFollowerMapConfigurator tracks={tracks} updateTrackData={handleUpdateTrack} showToast={showToast} />;
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
      {/* Banner de depuración discreto */}
      <div className="absolute -top-6 right-0 text-[8px] text-slate-300 font-mono">
        {debugInfo} | v10.1
      </div>
      {content}
    </div>
  );
}


window.PistasView = PistasView;
