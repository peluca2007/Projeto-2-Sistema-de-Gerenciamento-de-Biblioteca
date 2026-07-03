import { useEffect, useState } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { getCurrentUser } from '../utils/auth';

export default function UsersPage() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '', role: 'LEITOR', status: 'ATIVO' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (query = filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers(Object.fromEntries(Object.entries(query).filter(([, value]) => value)));
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({ id: null, name: '', email: '', password: '', role: 'LEITOR', status: 'ATIVO' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || (!editing && !form.password)) {
      setError('Nome, e-mail' + (!editing ? ' e senha' : '') + ' são obrigatórios');
      return;
    }

    try {
      if (editing) {
        await updateUser(form.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      }

      resetForm();
      setEditing(false);
      await loadUsers(filters);
    } catch (err) {
      setError(err.message || 'Erro ao salvar usuário');
    }
  };

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await loadUsers(filters);
    } catch (err) {
      setError(err.message || 'Erro ao filtrar');
    }
  };

  const startEdit = (u) => {
    setForm({ id: u.id, name: u.name, email: u.email, password: '', role: u.role, status: u.status });
    setEditing(true);
  };

  const confirmDelete = async (id) => {
    setError(null);
    try {
      await deleteUser(id);
      await loadUsers(filters);
    } catch (err) {
      setError(err.message || 'Erro ao excluir usuário');
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administração</p>
          <h2>Gerenciar Usuários</h2>
        </div>
        <div>
          <button onClick={() => { resetForm(); setEditing(false); }}>Novo Usuário</button>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#fee', border: '1px solid #f88', borderRadius: '4px', color: '#c00' }}>{error}</div>}
      {loading && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#eef', border: '1px solid #88f', borderRadius: '4px', color: '#008' }}>Carregando...</div>}

      <form className="filters" onSubmit={handleFilterSubmit} style={{ marginBottom: 16 }}>
        <input name="q" placeholder="Buscar por nome ou e-mail" value={filters.q} onChange={handleFilterChange} />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">Todos os perfis</option>
          <option value="ADMIN">ADMIN</option>
          <option value="BIBLIOTECARIO">BIBLIOTECARIO</option>
          <option value="LEITOR">LEITOR</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos os status</option>
          <option value="ATIVO">ATIVO</option>
          <option value="INATIVO">INATIVO</option>
        </select>
        <button type="submit">Filtrar</button>
      </form>

      <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="ADMIN">ADMIN</option>
            <option value="BIBLIOTECARIO">BIBLIOTECARIO</option>
            <option value="LEITOR">LEITOR</option>
          </select>
          <input placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit">{editing ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>

      {loading ? <p>Carregando...</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => startEdit(u)}>Editar</button>
                      {currentUser?.id !== u.id ? (
                        <button type="button" onClick={() => confirmDelete(u.id)}>Excluir</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
