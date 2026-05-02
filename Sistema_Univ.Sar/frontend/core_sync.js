// core_sync.js
const API_BASE = "/api";

function useDataSync(currentUser) {
  const [teams, setTeams] = React.useState([]);
  const [tracks, setTracks] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(false);
  const isSavingRef = React.useRef(false);

  const fetchData = React.useCallback(async () => {
    if (isSavingRef.current) return;
    try {
      const url = currentUser?.category ? `${API_BASE}/data?category=${currentUser.category}` : `${API_BASE}/data`;
      const res = await fetch(url);
      const data = await res.json();
      setTeams(data.teams || []);
      setTracks(data.tracks || {});
      localStorage.setItem('ada_teams', JSON.stringify(data.teams || []));
      localStorage.setItem('ada_tracks', JSON.stringify(data.tracks || {}));
      setLoading(false);
      return data;
    } catch (err) {
      console.error("[SYNC] Error cargando datos:", err);
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  React.useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ada_teams') setTeams(JSON.parse(e.newValue) || []);
      if (e.key === 'ada_tracks') setTracks(JSON.parse(e.newValue) || {});
    };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  const postTeams = React.useCallback(async (newTeams) => {
    setTeams(newTeams);
    localStorage.setItem('ada_teams', JSON.stringify(newTeams));
    setIsSaving(true);
    setSaveError(false);
    isSavingRef.current = true;
    const url = currentUser?.category ? `${API_BASE}/teams?category=${currentUser.category}` : `${API_BASE}/teams`;
    try {
      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeams)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveError(false);
    } catch (err) {
      console.error("[SYNC] Error guardando:", err);
      setSaveError(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => { isSavingRef.current = false; }, 2000);
    }
  }, [currentUser]);

  const postTracks = React.useCallback((newTracks) => {
    setTracks(newTracks);
    localStorage.setItem('ada_tracks', JSON.stringify(newTracks));
    const cat = currentUser?.category || 'quest';
    fetch(`${API_BASE}/tracks?category=${cat}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTracks)
    });
  }, [currentUser]);

  return { teams, setTeams, tracks, setTracks, loading, isSaving, saveError, postTeams, postTracks, fetchData };
}

function useCategoryTimer(categoryId) {
  const storageKey = `ada_timer_${categoryId}`;
  const storageActiveKey = `ada_timer_active_${categoryId}`;
  const [timer, setTimer] = React.useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved) : 1800;
  });
  const [timerActive, setTimerActive] = React.useState(() => {
    return localStorage.getItem(storageActiveKey) === 'true';
  });

  React.useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        const next = Math.max(0, prev - 1);
        if (next % 5 === 0) localStorage.setItem(storageKey, next.toString());
        if (next <= 0) {
          setTimerActive(false);
          localStorage.setItem(storageActiveKey, 'false');
          fetch(`${API_BASE}/timer`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [categoryId]: { timer: 0, timerActive: false } })
          }).catch(() => {});
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, categoryId]);

  const toggle = async () => {
    const next = !timerActive;
    setTimerActive(next);
    localStorage.setItem(storageActiveKey, next.toString());
    try {
      await fetch(`${API_BASE}/timer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [categoryId]: { timer, timerActive: next } })
      });
    } catch (e) {}
  };

  const reset = async (durationSeconds) => {
    setTimer(durationSeconds);
    setTimerActive(false);
    localStorage.setItem(storageKey, durationSeconds.toString());
    localStorage.setItem(storageActiveKey, 'false');
    try {
      await fetch(`${API_BASE}/timer`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [categoryId]: { timer: durationSeconds, timerActive: false } })
      });
    } catch (e) {}
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return { timer, timerActive, toggle, reset, formatTime };
}

function useUsers() {
  const [users, setUsers] = React.useState([]);
  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      setUsers(await res.json() || []);
    } catch (e) {}
  }, []);
  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);
  return { users, fetchUsers };
}

window.API_BASE = API_BASE;
window.useDataSync = useDataSync;
window.useCategoryTimer = useCategoryTimer;
window.useUsers = useUsers;
