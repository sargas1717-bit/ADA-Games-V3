# Lógica de Sigue Líneas (Extraída de app.js)

Este documento contiene la lógica exacta de la categoría **Sigue Líneas** del sistema original, organizada por secciones funcionales y estéticas.

## 1. Configuración y Estados Globales
Definición de tiempos y estados iniciales para la categoría.

```javascript
// Líneas 64-75 de app.js
const [lineDuration, setLineDuration] = useState(() => {
  const saved = localStorage.getItem('ada_line_duration');
  return saved ? parseInt(saved) : 30; // 30 min por defecto
});
const [lineTimer, setLineTimer] = useState(() => {
  const saved = localStorage.getItem('ada_line_timer');
  return saved ? parseInt(saved) : 1800;
});
const [lineTimerActive, setLineTimerActive] = useState(() => {
  const saved = localStorage.getItem('ada_line_timer_active');
  return saved === 'true';
});
```

### Estética del Panel de Control (Sistema)
El panel de ajustes usa un esquema de color **Púrpura/Emerald** para diferenciarse de Quest (Azul).

```html
<!-- Estructura del Panel de Ajustes (Líneas 1415-1455) -->
<div class="space-y-4 md:space-y-6 bg-purple-50/50 p-5 md:p-6 rounded-3xl border border-purple-100">
  <div>
    <p class="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Sigue Líneas</p>
    <h4 class="text-base md:text-lg font-black text-purple-900 uppercase italic leading-tight">Duración de Competencia</h4>
  </div>
  <div class="flex items-center gap-4 md:gap-6">
    <div class="flex-1">
      <input type="range" class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
    </div>
    <div class="bg-white border-2 border-purple-500 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-lg">
      <span class="text-xl md:text-2xl font-black text-purple-600 font-mono">{lineDuration}</span>
      <span class="text-[9px] md:text-[10px] font-black text-purple-400 ml-1 uppercase">min</span>
    </div>
  </div>
</div>
```

---

## 2. Lógica del Cronómetro (Sync Servidor)
Control del tiempo de competencia sincronizado con el backend.

```javascript
// Líneas 212-234: Efecto del Cronómetro
useEffect(() => {
  let intervalLine = null;
  if (lineTimerActive && lineTimer > 0) {
    intervalLine = setInterval(() => {
      setLineTimer(prev => {
        const next = prev - 1;
        if (next % 5 === 0) localStorage.setItem('ada_line_timer', next.toString());
        if (next <= 0) {
          fetch(`${API_BASE}/timer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ line_follower: { timer: 0, timerActive: false } })
          }).catch(() => { });
          setLineTimerActive(false);
          return 0;
        }
        return next;
      });
    }, 1000);
  }
  return () => clearInterval(intervalLine);
}, [lineTimerActive, lineTimer]);
```

---

## 3. Motor de Cálculo de Puntajes (Mejor de 3)
La lógica crítica de cómo se calcula el puntaje global de un equipo en Sigue Líneas (Mejor de 3 intentos por pista).

```javascript
// Líneas 634-653 (Dentro de addScore)
// LINE FOLLOWER: Mejor de 3 intentos por pista
const trackGroups = {};
rh.forEach(h => {
  const p = h.pista;
  if (!trackGroups[p]) trackGroups[p] = [];
  trackGroups[p].push(h);
});
Object.values(trackGroups).forEach(intentos => {
  const validos = intentos.filter(h => !h.voided);
  if (validos.length === 0) return;
  const mejor = validos.reduce((best, h) => {
    const bPts = best.points || best.percentage || 0;
    const hPts = h.points || h.percentage || 0;
    if (hPts > bPts) return h;
    if (hPts === bPts && (h.finalTimeMs || 0) < (best.finalTimeMs || 0)) return h;
    return best;
  });
  totalScore += (mejor.points || mejor.percentage || 0);
  lastTime += (mejor.finalTimeMs || mejor.finalTime || 0);
});
```

### Estética de la Tabla de Resultados (Líneas 3928-3932)
El ranking individual usa un panel lateral oscuro con puntaje en grande.

```html
<div class="bg-slate-950/50 px-10 py-6 rounded-3xl border border-slate-800/50 flex flex-col items-end justify-center min-w-[250px] shadow-inner">
  <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Puntaje Total</p>
  <p class="text-6xl font-black tracking-tighter text-blue-400">{stats.score}</p>
  <p class="text-lg font-bold text-slate-400 mt-2 tracking-widest leading-none drop-shadow-md">{formatResultTime(stats.time)}</p>
</div>
```

---

## 4. Componente: EvaluadorDePistas (Interactivo)
Este es el componente principal que maneja el mapa, los puntos de control y los 3 intentos.

### Definición Inicial y Estados
```javascript
// Líneas 3949-3974
function EvaluadorDePistas({ initialMode, tracks, updateTrackData, teams, activeTeams, addScore, currentUser, disqualifyTeam, postTeams, showToast, isRunningInMainApp, onUpdateTeamBase, onDeleteTeam, viewCategory }) {
  const [mode, setMode] = useState(initialMode || 'edit');
  const [penalties, setPenalties] = useState(0);
  const [attempts, setAttempts] = useState(['pending', 'pending', 'pending']);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [savedResults, setSavedResults] = useState(null);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const canvasRef = React.useRef(null);
```

### Estética del Panel del Juez (Líneas 4325-4439)
Diseño oscuro "Cyberpunk" con indicadores LED para los intentos.

```html
<div class="w-full md:w-80 bg-[#161925] border-r border-[#2a2e3f] flex flex-col z-10 shadow-2xl relative overflow-y-auto">
  <!-- Cabecera de Mesa -->
  <div class="p-6 border-b border-[#2a2e3f]">
    <h1 class="text-xl font-bold text-white flex items-center gap-2">
      <Icon name="play-circle" class="text-blue-500 fill-blue-500" /> MESA DEL JUEZ
    </h1>
  </div>

  <!-- Indicadores de Intentos (Líneas 4368-4373) -->
  <div class="flex gap-4">
    {attempts.map((st, i) => (
      <div key={i} class={`w-5 h-5 rounded-full border-2 transition-all ${
        st === 'valid' ? 'bg-green-500 border-green-400 shadow-[0_0_12px_#22c55e]' : 
        st === 'nulled' ? 'bg-red-500 border-red-400 shadow-[0_0_12px_#ef4444]' : 
        i === currentAttempt ? 'bg-yellow-500/50 border-yellow-400 animate-pulse' : 
        'bg-slate-800 border-slate-600'
      }`} />
    ))}
  </div>

  <!-- Temporizador (Líneas 4380-4382) -->
  <div class="text-5xl font-mono font-bold tracking-widest text-white">
    {formatTime(timeLeft)}
  </div>
</div>
```

### Estética del Mapa Interactivo (Líneas 4501-4530)
El mapa se renderiza en un contenedor con aspecto 16:10 y guías de cuadrante punteadas rojas.

```html
<div class="relative w-full max-w-5xl aspect-[16/10]">
  <div ref={canvasRef} class="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2a2e3f]">
    <!-- Guías Rojas -->
    <div class="absolute top-0 bottom-0 w-0 border-l-4 border-dashed border-red-500/80" style={{ left: `${guideX}%` }} />
    <div class="absolute left-0 right-0 h-0 border-t-4 border-dashed border-red-500/80" style={{ top: `${guideY}%` }} />
    
    <!-- Puntos de Control (Marcadores) -->
    {points.map(point => (
      <div class="absolute -translate-x-1/2 -translate-y-1/2 rounded shadow-lg flex items-center justify-center font-bold text-xs"
           style={{ left: `${point.x}%`, top: `${point.y}%`, width: '42px', height: '24px' }}>
        {point.value}
      </div>
    ))}
  </div>
</div>
```

---

## 5. Lógica de Ranking (TV)
Cómo se ordenan los equipos en el Ranking de Sigue Líneas.

```javascript
// Líneas 3755-3764
return [...list].sort((a, b) => {
  // Prioridad 1: Descalificados al final
  if (a.status === 'disqualified' && b.status !== 'disqualified') return 1;
  if (a.status !== 'disqualified' && b.status === 'disqualified') return -1;

  const statsA = getRoundStats(a, selRondaView);
  const statsB = getRoundStats(b, selRondaView);
  if (statsB.score !== statsA.score) return statsB.score - statsA.score;
  return statsA.time - statsB.time; // Menor tiempo gana en empate de puntos
});
```

### Estética de la Transmisión TV (Líneas 3501-3529)
La transmisión dual usa un separador animado con carros de carreras ("🏎️", "🤖", "⚡").

```html
<!-- Separador Central Animado -->
<div class="relative w-16 bg-slate-950 overflow-hidden">
  <div class="absolute inset-0 flex flex-col items-center">
    <div class="w-0.5 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse"></div>
  </div>
  <!-- Animación de Carritos @keyframes racingCar -->
  <div class="relative z-10 flex flex-col items-center gap-3">
    {/* Emojis animados fluyendo hacia abajo */}
  </div>
</div>
```

### Paneles de TV (Emerald para Sigue Líneas)
```html
<div class="bg-emerald-900/40 border-b-4 border-emerald-600 p-6 flex flex-col items-center">
  <h2 class="text-3xl font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3">
    <Icon name="zap" class="w-8 h-8" /> Sigue Líneas
  </h2>
  <div class="px-12 py-3 rounded-[2rem] border-4 border-emerald-500/30 bg-slate-950 shadow-2xl">
    <p class="text-7xl font-black font-mono tracking-widest text-white">
      {formatTime(lineTimer)}
    </p>
  </div>
</div>
```

---

## 6. Diferencia con Categoría Quest
Es fundamental notar que en `app.js` se usa `viewCategory` o `t.category` para bifurcar la lógica:

1.  **Quest**: 1 intento oficial por pista. Puntos limitados por ronda (40, 50, 55).
2.  **Sigue Líneas**: 3 intentos por pista. Se toma el **mejor** de los 3 (basado en puntos y luego tiempo). Puntos ilimitados (según configuración del mapa).
