"""
Motor Modular Adagames - Sistema_Univ.Sar
Backend expandible con archivos de datos separados por categoría.
Puerto: 8080 (clon independiente del Adagames original en 8001)
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
import shutil
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import socket
import tempfile
import threading
from datetime import datetime
import time
import uuid
from fastapi.staticfiles import StaticFiles

# ==============================================================================
# CONFIGURACIÓN CENTRAL - Modificar aquí para añadir/quitar categorías
# ==============================================================================
REGISTERED_CATEGORIES = [
    "quest",
    "line_follower",
    "sumo",           # Futuro
    "stands",         # Futuro
]

# ==============================================================================
# SISTEMA DE ARCHIVOS SEPARADOS POR CATEGORÍA
# Cada categoría tiene su propio data_<categoria>.json
# Si una categoría falla, NO contamina las demás.
# ==============================================================================

DATA_DIR = os.path.abspath(os.path.dirname(__file__))
USERS_FILE = os.path.join(DATA_DIR, "users.json")

def get_data_file(category: str) -> str:
    """Devuelve la ruta del archivo de datos para una categoría específica."""
    safe_name = category.replace("/", "_").replace("\\", "_")
    return os.path.join(DATA_DIR, f"data_{safe_name}.json")

# Carpeta para mapas
MAPS_DIR = os.path.join(os.path.dirname(DATA_DIR), "frontend", "maps")
if not os.path.exists(MAPS_DIR):
    os.makedirs(MAPS_DIR, exist_ok=True)

# Lock por categoría (RLock para permitir reentrada y evitar deadlocks en migraciones)
_locks: Dict[str, threading.RLock] = {cat: threading.RLock() for cat in REGISTERED_CATEGORIES}

def get_lock(category: str) -> threading.RLock:
    if category not in _locks:
        _locks[category] = threading.RLock()
    return _locks[category]

# ==============================================================================
# HELPERS
# ==============================================================================
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def generate_initial_tracks():
    structure = {}
    for r in range(1, 6):
        structure[str(r)] = {}
        for p in range(1, 6):
            structure[str(r)][str(p)] = {"sequence": [], "obstacles": []}
    return structure

def generate_initial_timer():
    return {"timer": 1800, "timerActive": False, "updatedAt": time.time()}

def generate_initial_timers():
    return {cat: generate_initial_timer() for cat in REGISTERED_CATEGORIES}

def get_calculated_timer(timer_data):
    """Calcula el tiempo restante real basado en cuándo se activó."""
    if not timer_data.get("timerActive", False):
        return timer_data
    elapsed = int(time.time() - timer_data.get("updatedAt", time.time()))
    current = max(0, timer_data.get("timer", 0) - elapsed)
    return {"timer": current, "timerActive": current > 0, "updatedAt": timer_data.get("updatedAt")}

# ==============================================================================
# LECTURA Y ESCRITURA ATÓMICA POR CATEGORÍA
# ==============================================================================
def load_category_data(category: str) -> dict:
    """Carga el archivo de datos de una categoría. Genera uno vacío si no existe."""
    if category not in REGISTERED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Categoría '{category}' no registrada.")
    
    filepath = get_data_file(category)
    lock = get_lock(category)

    with lock:
        if not os.path.exists(filepath):
            initial = {
                "teams": [],
                "tracks": generate_initial_tracks(),
                "timers": {category: generate_initial_timer()},
                "category": category,
                "meta": {
                    "created_at": datetime.now().isoformat(),
                    "version": "1.0"
                }
            }
            # Escribir el archivo inicial
            _write_file_atomic(filepath, initial, lock=None)  # lock ya está tomado
            return initial

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

    # Migración: asegurar campos necesarios en los equipos
    changed = False
    for team in data.get("teams", []):
        if "practiceTickets" not in team:
            team["practiceTickets"] = 5; changed = True
        if "evaluationTickets" not in team:
            team["evaluationTickets"] = {"1": 1, "2": 1, "3": 1, "4": 1, "5": 1}; changed = True
        if "qualifiedRounds" not in team:
            team["qualifiedRounds"] = [1]; changed = True
        if "category" not in team:
            team["category"] = category; changed = True

    if changed:
        save_category_data(category, data)

    return data

def save_category_data(category: str, data: dict):
    """Escritura atómica al archivo de la categoría específica."""
    filepath = get_data_file(category)
    lock = get_lock(category)
    _write_file_atomic(filepath, data, lock)

def _write_file_atomic(filepath: str, data: dict, lock: Optional[threading.Lock]):
    """Escribe un archivo JSON de forma atómica usando archivo temporal."""
    data_dir = os.path.dirname(os.path.abspath(filepath)) or "."
    tmp_fd, tmp_path = tempfile.mkstemp(dir=data_dir, suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        shutil.move(tmp_path, filepath)
    except Exception:
        try:
            os.unlink(tmp_path)
        except:
            pass
        raise

# ==============================================================================
# VISTA GLOBAL - Combina todas las categorías en un único objeto
# ==============================================================================
def load_global_data() -> dict:
    """Carga y combina los datos de TODAS las categorías registradas."""
    all_teams = []
    all_timers = {}
    all_tracks = {}

    for cat in REGISTERED_CATEGORIES:
        try:
            cat_data = load_category_data(cat)
            all_teams.extend(cat_data.get("teams", []))
            if "timers" in cat_data:
                all_timers.update(cat_data["timers"])
            if cat in ["quest", "line_follower"]:  # Solo categorías con mapa de pistas
                all_tracks[cat] = cat_data.get("tracks", {})
        except Exception as e:
            print(f"[WARN] Error cargando categoría {cat}: {e}")

    return {
        "teams": all_teams,
        "tracks": all_tracks,
        "timers": all_timers,
        "categories": REGISTERED_CATEGORIES
    }

def load_users():
    if not os.path.exists(USERS_FILE):
        return [
            {"id": "admin", "name": "Administrador Central", "role": "admin", "password": "ada123admin"},
            {"id": "juez1", "name": "Juez Principal", "role": "judge", "password": "juez1"}
        ]
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=4, ensure_ascii=False)

# ==============================================================================
# FASTAPI APP
# ==============================================================================
app = FastAPI(title="Motor Modular Adagames API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Servir carpeta de mapas como estática
app.mount("/maps", StaticFiles(directory=MAPS_DIR), name="maps")

@app.post("/upload_map")
async def upload_map(
    ronda: str = Form(...), 
    pista: str = Form(...), 
    file: UploadFile = File(...)
):
    try:
        # Generar nombre único
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        filename = f"map_R{ronda}_P{pista}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(MAPS_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"status": "ok", "url": f"maps/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# RUTAS DE DATOS
# ==============================================================================
@app.get("/api/data")
def get_all_data(category: Optional[str] = None):
    """Si se pasa ?category=quest devuelve solo quest. Sin parámetro devuelve todo."""
    if category:
        data = load_category_data(category)
        # Calcular timer real
        if "timers" in data and category in data["timers"]:
            data["timers"][category] = get_calculated_timer(data["timers"][category])
        
        # Normalizar para compatibilidad con el frontend de forma dinámica
        timers_compat = {cat: generate_initial_timer() for cat in REGISTERED_CATEGORIES}
        if "timers" in data:
            timers_compat.update(data["timers"])
            
        data["timers"] = timers_compat
        return data
    else:
        data = load_global_data()
        # Calcular timers reales para todas las categorías
        for cat in data.get("timers", {}):
            data["timers"][cat] = get_calculated_timer(data["timers"][cat])
        return data

@app.get("/api/categories")
def get_categories():
    """Lista todas las categorías registradas y el estado de sus archivos."""
    result = []
    for cat in REGISTERED_CATEGORIES:
        filepath = get_data_file(cat)
        exists = os.path.exists(filepath)
        team_count = 0
        if exists:
            try:
                d = load_category_data(cat)
                team_count = len(d.get("teams", []))
            except:
                pass
        result.append({"id": cat, "file": os.path.basename(filepath), "teams": team_count, "file_exists": exists})
    return result

@app.get("/api/users")
def get_users():
    return load_users()

@app.post("/api/users")
def save_user(user: Dict[str, Any]):
    users = load_users()
    for i, u in enumerate(users):
        if u["id"] == user["id"]:
            users[i] = user
            save_users(users)
            return {"status": "ok"}
    users.append(user)
    save_users(users)
    return {"status": "ok"}

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str):
    if user_id == "admin":
        raise HTTPException(status_code=400, detail="No se puede eliminar al admin")
    users = [u for u in load_users() if u["id"] != user_id]
    save_users(users)
    return {"status": "ok"}

@app.post("/api/teams")
def update_teams(teams: List[Dict[str, Any]], category: Optional[str] = None):
    if not category:
        # Fallback: agrupar por categoría y guardar en cada archivo
        by_cat: Dict[str, list] = {}
        for team in teams:
            cat = team.get("category", "quest")
            by_cat.setdefault(cat, []).append(team)
        for cat, cat_teams in by_cat.items():
            data = load_category_data(cat)
            data["teams"] = cat_teams
            save_category_data(cat, data)
    else:
        data = load_category_data(category)
        data["teams"] = teams
        save_category_data(category, data)
    return {"status": "ok"}

@app.post("/api/teams/bulk")
def bulk_add_teams(new_teams: List[Dict[str, Any]], category: Optional[str] = None):
    for team in new_teams:
        team["id"] = f"t_{uuid.uuid4().hex[:8]}"
        team["status"] = "pending"
        team["score"] = 0
        team["history"] = []
        if category and "category" not in team:
            team["category"] = category

    cat = category or "quest"
    data = load_category_data(cat)
    data["teams"].extend(new_teams)
    save_category_data(cat, data)
    return {"status": "ok", "imported": len(new_teams)}

@app.post("/api/tracks")
def update_tracks(tracks: Dict[str, Any], category: Optional[str] = "quest"):
    data = load_category_data(category)
    data["tracks"] = tracks
    save_category_data(category, data)
    return {"status": "ok"}

# ==============================================================================
# TIMERS
# ==============================================================================
class TimerData(BaseModel):
    timer: int
    timerActive: bool

class TimersSync(BaseModel):
    quest: Optional[TimerData] = None
    line_follower: Optional[TimerData] = None

@app.get("/api/timer")
def get_timer(category: Optional[str] = None):
    cats = [category] if category else REGISTERED_CATEGORIES
    result = {}
    for cat in cats:
        try:
            data = load_category_data(cat)
            t = data.get("timers", {}).get(cat, generate_initial_timer())
            result[cat] = get_calculated_timer(t)
        except:
            result[cat] = generate_initial_timer()
    return result

@app.post("/api/timer")
def update_timer(sync: TimersSync):
    # Actualiza el timer de quest en su archivo
    if sync.quest is not None:
        data = load_category_data("quest")
        data.setdefault("timers", {})["quest"] = {"timer": sync.quest.timer, "timerActive": sync.quest.timerActive, "updatedAt": time.time()}
        save_category_data("quest", data)
    if sync.line_follower is not None:
        data = load_category_data("line_follower")
        data.setdefault("timers", {})["line_follower"] = {"timer": sync.line_follower.timer, "timerActive": sync.line_follower.timerActive, "updatedAt": time.time()}
        save_category_data("line_follower", data)
    return {"status": "ok"}

# ==============================================================================
# RESET Y RESPALDO
# ==============================================================================
class ResetAuth(BaseModel):
    userId: str
    password: str

@app.post("/api/reset")
def reset_competition(auth: ResetAuth, category: Optional[str] = None):
    users = load_users()
    admin = next((u for u in users if u["id"] == auth.userId and u["password"] == auth.password and u.get("role") == "admin"), None)
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    cats_to_reset = [category] if category else REGISTERED_CATEGORIES
    backups_dir = os.path.join(DATA_DIR, "backups")
    os.makedirs(backups_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    for cat in cats_to_reset:
        filepath = get_data_file(cat)
        if os.path.exists(filepath):
            shutil.copy2(filepath, os.path.join(backups_dir, f"backup_{cat}_{timestamp}.json"))
        save_category_data(cat, {"teams": [], "tracks": generate_initial_tracks(), "timers": {cat: generate_initial_timer()}, "category": cat})

    return {"status": "ok", "reset_categories": cats_to_reset}

@app.post("/api/upload_map")
async def upload_map(ronda: int = Form(...), pista: int = Form(...), file: UploadFile = File(...)):
    frontend_path = os.path.abspath(os.path.join(DATA_DIR, "..", "frontend"))
    maps_dir = os.path.join(frontend_path, "maps")
    os.makedirs(maps_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"mapa_ronda{ronda}_pista{pista}.{ext}"
    with open(os.path.join(maps_dir, filename), "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {"url": f"/maps/{filename}?t={int(time.time())}"}

# ==============================================================================
# SERVIR FRONTEND
# ==============================================================================
frontend_path = os.path.abspath(os.path.join(DATA_DIR, "..", "frontend"))
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    local_ip = get_local_ip()
    print(f"\n{'#'*55}")
    print(f"  MOTOR MODULAR ADAGAMES - Sistema_Univ.Sar")
    print(f"  Categorias activas: {', '.join(REGISTERED_CATEGORIES)}")
    print(f"  ACCESO LOCAL: http://localhost:8080")
    print(f"  ACCESO WIFI:  http://{local_ip}:8080")
    print(f"{'#'*55}\n")
    uvicorn.run(app, host="0.0.0.0", port=8080)
