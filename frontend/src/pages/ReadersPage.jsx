import { useEffect, useState } from 'react';
import { createReader, deleteReader, listReaders, updateReader } from '../services/readerService';

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [filters, setFilters] = useState({ name: '', cpfOrRa: '', email: '', status: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    cpfOrRa: '',
    email: '',
    phone: '',
    address: '',
    status: 'ATIVO',
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadReaders();
  }, []);

  const loadReaders = async (query = filters) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(query).filter(([, value]) => value));
      const data = await listReaders(cleanFilters);
      setReaders(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar leitores');
      setReaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loadReaders(filters);
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      cpfOrRa: '',
      email: '',
      phone: '',
      address: '',
      status: 'ATIVO',
    });
    setEditing(false);
  };

  const startEdit = (reader) => {
    setForm({
      id: reader.id,
      name: reader.name,
      cpfOrRa: reader.cpfOrRa,
      email: reader.email,
      phone: reader.phone,
      address: reader.address,
      status: reader.status,
    });
    setEditing(true);
  };

  const handleFormChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.name || !form.cpfOrRa || !form.email || !form.phone || !form.address) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      if (editing) {
        await updateReader(form.id, form);
      } else {
        await createReader(form);
      }

      resetForm();
      await loadReaders(filters);
    } catch (err) {
      setError(err.message || 'Erro ao salvar leitor');
    }
  };

  const handleDelete = async (readerId) => {
    if (!confirm('Excluir este leitor?')) return;
    setError(null);

    try {
      await deleteReader(readerId);
      await loadReaders(filters);
    } catch (err) {
      setError(err.message || 'Erro ao excluir leitor');
    }
  };

  const toggleStatus = async (reader) => {
    const nextStatus = reader.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    setError(null);

    try {
      await updateReader(reader.id, { status: nextStatus });
      await loadReaders(filters);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar status');
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Cadastro</p>
          <h2>Leitores</h2>
        </div>
        <div>
          <button type="button" onClick={resetForm}>Novo Leitor</button>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#fee', border: '1px solid #f88', borderRadius: '4px', color: '#c00' }}>{error}</div>}
      {loading && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#eef', border: '1px solid #88f', borderRadius: '4px', color: '#008' }}>Carregando...</div>}

      <form className="form" onSubmit={handleFormSubmit} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <input name="name" placeholder="Nome" value={form.name} onChange={handleFormChange} />
          <input name="cpfOrRa" placeholder="CPF ou RA" value={form.cpfOrRa} onChange={handleFormChange} />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleFormChange} />
          <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleFormChange} />
          <input name="address" placeholder="Endereço" value={form.address} onChange={handleFormChange} />
          <select name="status" value={form.status} onChange={handleFormChange}>
            <option value="ATIVO">ATIVO</option>
            <option value="INATIVO">INATIVO</option>
          </select>
        </div>
        <button type="submit">{editing ? 'Salvar alterações' : 'Cadastrar leitor'}</button>
      </form>

      <form className="filters" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={filters.name} onChange={handleChange} />
        <input name="cpfOrRa" placeholder="CPF ou RA" value={filters.cpfOrRa} onChange={handleChange} />
        <input name="email" type="email" placeholder="E-mail" value={filters.email} onChange={handleChange} />
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Filtrar por status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <button type="submit">Filtrar</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF/RA</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {readers.map((reader) => (
              <tr key={reader.id}>
                <td>{reader.name}</td>
                <td>{reader.cpfOrRa}</td>
                <td>{reader.email}</td>
                <td>{reader.phone}</td>
                <td>{reader.address}</td>
                <td>{reader.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => startEdit(reader)}>Editar</button>
                    <button type="button" onClick={() => toggleStatus(reader)}>
                      {reader.status === 'ATIVO' ? 'Inativar' : 'Ativar'}
                    </button>
                    <button type="button" onClick={() => handleDelete(reader.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}