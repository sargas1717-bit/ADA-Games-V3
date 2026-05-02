// ============================================================================
// plugins.js - REGISTRO CENTRAL DE CATEGORÍAS
// Sistema_Univ.Sar - Motor Modular Adagames
// ============================================================================

window.QUEST_ROWS = [6, 5, 4, 3, 2, 1];
window.QUEST_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];


const CATEGORY_REGISTRY = {

  // ==========================================================================
  // ROBOTICS QUEST - Navegación táctica por pistas
  // ==========================================================================
  quest: {
    id: "quest",
    title: "Robotics Quest",
    icon: "map",
    color: "blue",
    colorClass: "bg-blue-600",
    badgeClass: "bg-blue-100 text-blue-800",

    // Configuración de rondas y puntuación
    maxRounds: 5,
    maxPointsPerTrackByRound: { 1: 8, 2: 8, 3: 8, 4: 10, 5: 11 },
    maxPointsPerRound:        { 1: 40, 2: 40, 3: 40, 4: 50, 5: 55 },

    // Tickets de práctica y evaluación
    defaultPracticeTickets: 5,
    defaultEvalTickets: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },

    // Motor de puntuación: recibe el array history de un equipo y devuelve { score, lastTime }
    calculateScore(history) {
      const offHist = history.filter(h => !h.practice && !h.voided);
      let totalScore = 0, lastTime = 0;
      for (let r = 1; r <= 5; r++) {
        const rh = offHist.filter(h => h.ronda === r);
        if (!rh.length) continue;
        const cap = this.maxPointsPerRound[r] / 5; // cap por pista individual
        const globalEntry = rh.slice().reverse().find(h => h.pista === 0);
        if (globalEntry) {
          totalScore += Math.min(this.maxPointsPerRound[r], globalEntry.points || 0);
          lastTime = globalEntry.finalTimeMs || 0;
        } else {
          const unique = {};
          rh.forEach(h => { unique[h.pista] = h; });
          Object.values(unique).forEach(h => {
            totalScore += Math.min(cap, h.points || 0);
          });
          if (unique[5]) lastTime = unique[5].finalTimeMs || 0;
        }
      }
      if (lastTime === 0 && offHist.length > 0) {
        lastTime = offHist[offHist.length - 1].finalTimeMs || 0;
      }
      return { score: totalScore, lastTime };
    },

    // Ordenamiento: Mayor puntaje primero, menor tiempo como desempate
    rankingSort(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (a.lastTime || Infinity) - (b.lastTime || Infinity);
    },

    // Tipo de pista que se genera para la evaluación
    trackType: "quest_map",  // → view_evaluacion.js sabrá qué componente renderizar
  },

  // ==========================================================================
  // SEGUIDOR DE LÍNEA - Velocidad y precisión en cuadrícula
  // ==========================================================================
  line_follower: {
    id: "line_follower",
    title: "Seguidor de Línea",
    icon: "route",
    color: "green",
    colorClass: "bg-green-600",
    badgeClass: "bg-green-100 text-green-800",

    maxRounds: 3,
    maxAttempts: 3,   // Mejor de 3 por pista
    timerSeconds: 120, // 2 minutos por intento

    defaultPracticeTickets: 3,
    defaultEvalTickets: { "1": 3, "2": 3, "3": 3 },

    // Motor: toma el MEJOR intento por pista (mayor %, menor tiempo de desempate)
    calculateScore(history) {
      const offHist = history.filter(h => !h.practice && !h.voided);
      let totalScore = 0, totalTime = 0;
      const trackGroups = {};
      offHist.forEach(h => {
        const p = h.pista;
        if (!trackGroups[p]) trackGroups[p] = [];
        trackGroups[p].push(h);
      });
      Object.values(trackGroups).forEach(intentos => {
        if (!intentos.length) return;
        const mejor = intentos.reduce((best, h) => {
          const bPts = best.points || best.percentage || 0;
          const hPts = h.points || h.percentage || 0;
          if (hPts > bPts) return h;
          if (hPts === bPts && (h.finalTimeMs || 0) < (best.finalTimeMs || 0)) return h;
          return best;
        });
        totalScore += mejor.points || mejor.percentage || 0;
        totalTime += mejor.finalTimeMs || 0;
      });
      return { score: totalScore, lastTime: totalTime };
    },

    rankingSort(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (a.lastTime || Infinity) - (b.lastTime || Infinity);
    },

    trackType: "line_follower_grid",
  },

  // ==========================================================================
  // SUMO BOTS - Combate directo (Módulo futuro - plantilla lista)
  // ==========================================================================
  sumo: {
    id: "sumo",
    title: "Sumo Bots",
    icon: "swords",
    color: "red",
    colorClass: "bg-red-600",
    badgeClass: "bg-red-100 text-red-800",

    maxRounds: 5,   // Rondas de combate en torneo suizo

    calculateScore(history) {
      const official = history.filter(h => !h.practice && !h.voided);
      let wins = 0, draws = 0;
      official.forEach(h => {
        wins += h.data?.wins || 0;
        draws += h.data?.draws || 0;
      });
      // Sistema de puntos: 3 por victoria, 1 por empate
      return { score: (wins * 3) + draws, lastTime: 0 };
    },

    rankingSort(a, b) {
      return b.score - a.score;
    },

    trackType: "sumo_versus",
  },

  // ==========================================================================
  // STANDS / FERIA DE PROYECTOS - Evaluación por rúbrica (Módulo futuro)
  // ==========================================================================
  stands: {
    id: "stands",
    title: "Evaluación de Stands",
    icon: "presentation",
    color: "purple",
    colorClass: "bg-purple-600",
    badgeClass: "bg-purple-100 text-purple-800",

    // Criterios de evaluación con sus pesos (deben sumar 100)
    rubricCriteria: [
      { id: "innovation",       label: "Innovación",        weight: 0.40, max: 100 },
      { id: "technical_depth",  label: "Profundidad Técnica", weight: 0.30, max: 100 },
      { id: "presentation",     label: "Presentación Oral", weight: 0.30, max: 100 },
    ],

    calculateScore(history) {
      const official = history.filter(h => !h.practice && !h.voided);
      if (!official.length) return { score: 0, lastTime: 0 };
      // Promedio ponderado de todos los jueces que evaluaron
      const totalWeighted = official.reduce((acc, h) => {
        const d = h.data || {};
        return acc + (d.innovation || 0) * 0.40 + (d.technical_depth || 0) * 0.30 + (d.presentation || 0) * 0.30;
      }, 0);
      return { score: Math.round(totalWeighted / official.length), lastTime: 0 };
    },

    rankingSort(a, b) {
      return b.score - a.score;
    },

    trackType: "stands_rubric",
  },
};

// Función global de utilidad: devuelve el plugin de la categoría activa
function getCategoryPlugin(categoryId) {
  return CATEGORY_REGISTRY[categoryId] || CATEGORY_REGISTRY["quest"];
}

// Función global: calcula score y lastTime para cualquier equipo
function calculateTeamScore(team) {
  const plugin = getCategoryPlugin(team.category);
  return plugin.calculateScore(team.history || []);
}

// Función global: calcula score de una ronda específica
function calculateTeamRoundScore(team, round) {
  const plugin = getCategoryPlugin(team.category);
  const roundHistory = (team.history || []).filter(h => h.ronda === round);
  return plugin.calculateScore(roundHistory);
}


// Exportar al global para Babel
window.CATEGORY_REGISTRY = CATEGORY_REGISTRY;
window.getCategoryPlugin = getCategoryPlugin;
window.calculateTeamScore = calculateTeamScore;
window.calculateTeamRoundScore = calculateTeamRoundScore;

