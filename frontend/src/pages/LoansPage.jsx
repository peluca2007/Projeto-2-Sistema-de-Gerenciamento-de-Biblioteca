import { useEffect, useState } from 'react';
import { createLoan, listLoans, returnLoan } from '../services/loanService';
import { listBooks } from '../services/bookService';
import { listReaders } from '../services/readerService';
import { getCurrentUser } from '../utils/auth';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [filters, setFilters] = useState({ status: '', fromDate: '', toDate: '', readerId: '', bookId: '' });
  const [form, setForm] = useState({ readerId: '', bookId: '', dueDate: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = getCurrentUser();
  const canManageLoans = currentUser?.role !== 'LEITOR';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadLoans(),
      canManageLoans ? loadReaders() : Promise.resolve(),
      canManageLoans ? loadBooks() : Promise.resolve(),
    ]);
  };

  const loadLoans = async (query = filters) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(query).filter(([, value]) => value));
      const data = await listLoans(cleanFilters);
      setLoans(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar empréstimos');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    const data = await listBooks({});
    setBooks(data);
  };

  const loadReaders = async () => {
    const data = await listReaders();
    setReaders(data);
  };

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFormChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loadLoans(filters);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.readerId || !form.bookId || !form.dueDate) {
      setError('Leitor, livro e data de devolução são obrigatórios');
      return;
    }

    try {
      await createLoan(form);
      setForm({ readerId: '', bookId: '', dueDate: '' });
      await loadLoans(filters);
      await loadBooks();
    } catch (err) {
      setError(err.message || 'Erro ao registrar empréstimo');
    }
  };

  const handleReturn = async (id) => {
    setError(null);
    try {
      await returnLoan(id);
      await loadLoans(filters);
      await loadBooks();
    } catch (err) {
      setError(err.message || 'Erro ao registrar devolução');
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Movimentação</p>
          <h2>Empréstimos</h2>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#fee', border: '1px solid #f88', borderRadius: '4px', color: '#c00' }}>{error}</div>}
      {loading && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#eef', border: '1px solid #88f', borderRadius: '4px', color: '#008' }}>Carregando...</div>}

      {canManageLoans ? (
        <form className="form" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <select name="readerId" value={form.readerId} onChange={handleFormChange}>
              <option value="">Selecione o leitor</option>
              {readers.map((reader) => (
                <option key={reader.id} value={reader.id}>
                  {reader.name} - {reader.cpfOrRa}
                </option>
              ))}
            </select>
            <select name="bookId" value={form.bookId} onChange={handleFormChange}>
              <option value="">Selecione o livro</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.availableQuantity} disponível)
                </option>
              ))}
            </select>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleFormChange} />
          </div>
          <button type="submit">Registrar empréstimo</button>
        </form>
      ) : null}

      <form className="filters" onSubmit={handleSubmit}>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Filtrar por status</option>
          <option value="EM_ABERTO">Em Aberto</option>
          <option value="DEVOLVIDO">Devolvido</option>
          <option value="ATRASADO">Atrasado</option>
        </select>
        {canManageLoans ? (
          <select name="readerId" value={filters.readerId} onChange={handleChange}>
            <option value="">Filtrar por leitor</option>
            {readers.map((reader) => (
              <option key={reader.id} value={reader.id}>
                {reader.name}
              </option>
            ))}
          </select>
        ) : null}
        {canManageLoans ? (
          <select name="bookId" value={filters.bookId} onChange={handleChange}>
            <option value="">Filtrar por livro</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        ) : null}
        <input name="fromDate" type="date" value={filters.fromDate} onChange={handleChange} />
        <input name="toDate" type="date" value={filters.toDate} onChange={handleChange} />
        <button type="submit">Filtrar</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Livro</th>
              <th>Leitor</th>
              <th>Data do Empréstimo</th>
              <th>Data Prevista</th>
              <th>Status</th>
              {canManageLoans ? <th>Ação</th> : null}
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book?.title || loan.bookId}</td>
                <td>{loan.reader?.name || loan.readerId}</td>
                <td>{new Date(loan.loanDate).toLocaleDateString('pt-BR')}</td>
                <td>{new Date(loan.dueDate).toLocaleDateString('pt-BR')}</td>
                <td>{loan.status}</td>
                {canManageLoans ? (
                  <td>
                    {loan.status !== 'DEVOLVIDO' ? (
                      <button type="button" onClick={() => handleReturn(loan.id)}>
                        Registrar devolução
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}