# Plan de Arquitectura Modular - Motor Adagames

Este documento define la estructura para transformar el sistema actual en un motor expandible capaz de soportar múltiples categorías de competencia (Quest, Seguidor, Sumo, Stands, etc.) de forma dinámica.

## 🏗️ 1. El Concepto: Arquitectura por "Registry"
En lugar de tener lógica de categorías dispersa por todo el código, el sistema utilizará un **Registro de Categorías**. Cada categoría será un objeto que define:
- **Metadatos**: Nombre, icono, color.
- **Esquema de Evaluación**: Los campos que el juez debe llenar.
- **Motor de Puntuación**: La fórmula matemática para calcular el score.
- **Reglas de Ranking**: Cómo se ordena la tabla (¿Puntos ascendentes? ¿Tiempo descendente?).

---

## 🧩 2. Estructura de Secciones (Frontend)

### Secciones Núcleo (Core)
- **Dashboard**: Vista general y estadísticas.
- **Auth System**: Login, gestión de usuarios y permisos.
- **Global Sync**: Sistema de `StorageEvents` y polling para mantener a todos los jueces sincronizados.
- **Global Timer**: Cronómetro maestro compartido.

### Secciones Dinámicas (Plugins)
El componente `EvaluationView` y `RankingView` consultarán el registro:

```javascript
const CATEGORY_PLUGINS = {
  'quest': {
    title: 'Robotics Quest',
    fields: ['points', 'finalTimeMs', 'pista'],
    calculateScore: (history) => { /* Lógica de Quest */ },
    rankingSort: (a, b) => b.score - a.score || a.lastTime - b.lastTime
  },
  'sumo': {
    title: 'Sumo Bot',
    fields: ['wins', 'losses', 'draws'],
    calculateScore: (history) => history.reduce((acc, h) => acc + (h.wins * 3) + h.draws, 0),
    rankingSort: (a, b) => b.score - a.score
  },
  'stands': {
    title: 'Evaluación de Stands',
    fields: ['innovation', 'presentation', 'technical_depth'],
    calculateScore: (history) => { /* Promedio o suma de criterios */ },
    rankingSort: (a, b) => b.score - a.score
  }
};
```

---

## 🗄️ 3. Modelo de Datos Universal
Para que el sistema sea expandible, `data.json` debe dejar de ser rígido.

```json
{
  "teams": [
    {
      "id": "123",
      "category": "stands",
      "history": [
        {
          "judgeId": "juez1",
          "data": {
            "innovation": 9,
            "presentation": 8,
            "technical_depth": 10
          },
          "timestamp": "2026-05-01..."
        }
      ]
    }
  ]
}
```

---

## 🛠️ 4. Hoja de Roadmap para la Refactorización

### Fase 1: Abstracción del Scoring
- Mover las funciones `calculateScore` de `app.js` a un archivo independiente `scoringEngines.js`.
- Crear una función única `getScore(team)` que use el motor correspondiente.

### Fase 2: Generador de Formularios Dinámicos
- Crear un componente `AutoForm` que lea los campos definidos en el plugin de la categoría y renderice los inputs necesarios (números, checkboxes, sliders).

### Fase 3: Backend Genérico
- Actualizar el servidor para que acepte cualquier estructura en el campo `data` de las evaluaciones, validando solo que el ID del equipo y del juez existan.

---

## 🚀 5. Ventajas del Nuevo Clon
1. **Mantenimiento**: Si cambian las reglas de "Sumo", solo editas 10 líneas en el plugin de Sumo.
2. **Reusabilidad**: Puedes usar el mismo software para ferias científicas, torneos de robótica o competencias de arte.
3. **Escalabilidad**: Soporta 100 categorías diferentes sin aumentar la complejidad del código base.

---
*Propuesta Técnica - Adagames Scalable Engine 2026*
✅ ¡Sistema_Univ.Sar creado completo! El Adagames original no fue tocado.

Resumen de lo que se construyó:
Sistema_Univ.Sar/
├── start.bat                    ← Arranque en puerto 8080
├── backend/
│   ├── main.py                  ← Backend modular (data_quest.json, data_seguidor.json...)
│   ├── users.json               ← Copiado del original
│   └── requirements.txt
└── frontend/
    ├── index.html               ← Carga los 10 scripts en orden documentado
    │
    ├── plugins.js               ← REGISTRO CENTRAL: añadir categorías aquí
    ├── core_auth.js             ← Login, logout, sesión
    ├── core_sync.js             ← Polling, timers, escritura atómica
    ├── core_ui.js               ← Toast, modales, SchoolLogo, SaveIndicator
    │
    ├── view_registro.js         ← Registro + CSV import
    ├── view_inspeccion.js       ← Inspección + Force Override + Gestión de Fases
    ├── view_evaluacion.js       ← Quest/Seguidor/Sumo/Stands + Soft Delete
    ├── view_ranking.js          ← Ranking + Hot-Patch + Suspense + PNG
    ├── view_tv.js               ← TV View + Modo Espejo (fallback)
    └── app.js                   ← Enrutador (solo conecta, sin lógica)
Para arrancar: ejecuta Sistema_Univ.Sar/start.bat y accede en http://localhost:8080

Para añadir Sumo u otra categoría en el futuro: solo editas plugins.js con las nuevas reglas. ¡Sin tocar ningún otro archivo!