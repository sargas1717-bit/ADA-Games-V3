// view_eval_stands.js - Evaluación Stands con cuestionario de preguntas y puntajes

// Preguntas por defecto — pueden configurarse en plugins.js por categoría
const DEFAULT_STANDS_QUESTIONS = [
  { id: 'q1', section: '🔬 Innovación (40%)',    question: '¿Resuelve un problema real de forma novedosa?',           maxPts: 10 },
  { id: 'q2', section: '🔬 Innovación (40%)',    question: '¿Usa tecnología apropiada para el nivel educativo?',       maxPts: 10 },
  { id: 'q3', section: '🔬 Innovación (40%)',    question: '¿Tiene potencial de impacto o escalabilidad?',             maxPts: 10 },
  { id: 'q4', section: '⚙️ Profundidad Técnica (30%)', question: '¿El equipo explica el funcionamiento técnico?',      maxPts: 10 },
  { id: 'q5', section: '⚙️ Profundidad Técnica (30%)', question: '¿El diseño es funcional y robusto?',                 maxPts: 10 },
  { id: 'q6', section: '⚙️ Profundidad Técnica (30%)', question: '¿Los circuitos/código están bien organizados?',      maxPts: 10 },
  { id: 'q7', section: '🎤 Presentación Oral (30%)', question: '¿La presentación es clara y ordenada?',               maxPts: 10 },
  { id: 'q8', section: '🎤 Presentación Oral (30%)', question: '¿Responden preguntas con seguridad?',                 maxPts: 10 },
  { id: 'q9', section: '🎤 Presentación Oral (30%)', question: '¿Toda la cohesión del equipo estuvo presente?',        maxPts: 10 },
];

const SCORE_OPTIONS = [0, 2, 4, 6, 8, 10];
const SCORE_LABELS  = ['Nulo', 'Básico', 'Regular', 'Bueno', 'Muy Bueno', 'Excelente'];

function StandsEvalPanel({ team, ronda, currentUser, plugin, tracks, onAddScore, showToast }) {
  const questions = plugin.rubricQuestions || DEFAULT_STANDS_QUESTIONS;
  const [scores, setScores] = React.useState(Object.fromEntries(questions.map(q => [q.id, 0])));
  const [notes, setNotes] = React.useState('');

  const totalMax = questions.reduce((acc, q) => acc + (q.maxPts || 10), 0);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentage = Math.round((totalScore / totalMax) * 100);

  // Agrupar preguntas por sección
  const sections = questions.reduce((acc, q) => {
    const sec = q.section || 'General';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(q);
    return acc;
  }, {});

  const handleSave = () => {
    if (totalScore === 0) { showToast('⚠️ Asigna al menos un puntaje antes de guardar.'); return; }
    // Guardamos el puntaje total como score principal
    onAddScore(team.id, ronda, 1, totalScore, 0, 'evaluation');
    setScores(Object.fromEntries(questions.map(q => [q.id, 0])));
    setNotes('');
    showToast(`✅ Stand evaluado: ${totalScore}/${totalMax} pts (${percentage}%)`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Evaluación de Stand — Ronda {ronda}</h3>
        <div className="text-right">
          <p className="text-3xl font-black text-purple-700">{totalScore}<span className="text-base text-slate-400 font-normal">/{totalMax}</span></p>
          <p className="text-xs text-slate-400">{percentage}% — {totalScore >= 80 ? '⭐ Excelente' : totalScore >= 60 ? '✅ Bueno' : totalScore >= 40 ? '🔶 Regular' : '🔴 Básico'}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className="bg-purple-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }} />
      </div>

      {/* Cuestionario por secciones */}
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionName, qs]) => {
          const secScore = qs.reduce((acc, q) => acc + (scores[q.id] || 0), 0);
          const secMax   = qs.reduce((acc, q) => acc + (q.maxPts || 10), 0);
          return (
            <div key={sectionName}>
              {/* Encabezado de sección */}
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100">
                <p className="font-bold text-slate-700 text-sm">{sectionName}</p>
                <span className="text-xs font-black text-purple-600">{secScore}/{secMax}</span>
              </div>

              {/* Preguntas */}
              <div className="space-y-4">
                {qs.map(q => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-slate-600 text-sm font-medium">{q.question}</p>
                    {/* Fila de opciones de puntaje */}
                    <div className="flex gap-2 flex-wrap">
                      {SCORE_OPTIONS.filter(o => o <= (q.maxPts || 10)).map((opt, idx) => (
                        <button key={opt} onClick={() => setScores(prev => ({ ...prev, [q.id]: opt }))}
                          className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 text-xs font-bold transition min-w-[52px] ${scores[q.id] === opt
                            ? 'border-purple-600 bg-purple-600 text-white shadow-md scale-105'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-purple-300 hover:bg-purple-50'}`}>
                          <span className="text-lg font-black">{opt}</span>
                          <span className="text-[10px] font-normal">{SCORE_LABELS[idx] || ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Observaciones */}
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Observaciones del Juez (opcional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Comentarios adicionales sobre el stand..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      {/* Guardar */}
      <button onClick={handleSave}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded-xl transition">
        Guardar Evaluación — {totalScore} pts
      </button>
    </div>
  );
}

// Exportar al global para Babel
window.StandsEvalPanel = StandsEvalPanel;
