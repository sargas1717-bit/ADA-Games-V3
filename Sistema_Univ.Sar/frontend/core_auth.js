// ============================================================================
// core_auth.js - AUTENTICACIÓN Y GESTIÓN DE SESIÓN
// Sistema_Univ.Sar - Motor Modular Adagames
// ============================================================================

function useCurrentUser() {
  const [currentUser, setCurrentUser] = React.useState(() => {
    const saved = localStorage.getItem('ada_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    localStorage.setItem('ada_user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ada_user');
    setCurrentUser(null);
  };

  const switchCategory = (newCat) => {
    const updatedUser = { ...currentUser, category: newCat };
    localStorage.setItem('ada_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  React.useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ada_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  return { currentUser, login, logout, switchCategory };
}

function LoginScreen({ onLogin, users }) {
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId && u.password === password);
    if (!user) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }
    const userData = { ...user, category: user.category || 'quest' };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icon name="trophy" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Adagames</h1>
          <p className="text-slate-400 text-sm mt-1">Motor Modular de Competencias</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">Usuario</label>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">-- Seleccionar usuario --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

window.useCurrentUser = useCurrentUser;
window.LoginScreen = LoginScreen;
