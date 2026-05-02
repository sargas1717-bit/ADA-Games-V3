// view_jueces.js
function JuecesView({ users, fetchUsers, showToast, confirm }) {
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ username: '', name: '', role: 'judge', category: 'quest', passcode: '' });
  
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast('✅ Usuario registrado exitosamente');
        setShowForm(false);
        setForm({ username: '', name: '', role: 'judge', category: 'quest', passcode: '' });
        fetchUsers();
      } else {
        showToast('⚠️ Error al registrar usuario');
      }
    } catch (err) {
      showToast('⚠️ Error de red');
    }
  };

  const handleDelete = async (id) => {
    confirm({
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de eliminar este usuario? No podrá volver a acceder.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('🗑️ Usuario eliminado');
            fetchUsers();
          }
        } catch (err) {
          showToast('⚠️ Error al eliminar');
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-blue-900 uppercase italic">Gestión de Jueces</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Administración de accesos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-500/20 transition-all">
          {showForm ? 'Cancelar' : '+ Nuevo Juez'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Usuario</label>
            <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Nombre Completo</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Rol</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none">
              <option value="judge">Juez</option>
              <option value="admin">Administrador</option>
              <option value="tv">Pantalla TV</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Categoría Asignada</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none">
              {Object.values(CATEGORY_REGISTRY).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">Contraseña / PIN</label>
            <input required type="password" value={form.passcode} onChange={e => setForm({...form, passcode: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 outline-none" />
          </div>
          <div className="col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-green-500/20">Registrar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Juez</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Rol</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Categoría</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5">
                  <p className="font-black text-slate-800 text-sm">{u.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">@{u.username}</p>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'tv' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </td>
                <td className="p-5 text-center">
                  <span className="text-xs font-bold text-slate-600">{getCategoryPlugin(u.category).title}</span>
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete(u.id)} className="w-8 h-8 inline-flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Icon name="trash-2" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.JuecesView = JuecesView;
