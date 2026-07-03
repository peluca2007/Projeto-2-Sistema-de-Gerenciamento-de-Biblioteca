import { useEffect, useState } from 'react';
import { listBooks, createBook, updateBook, deleteBook } from '../services/bookService';
import { canManageCatalog, getCurrentUser } from '../utils/auth';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ title: '', author: '', category: '', isbn: '', availability: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationYear: '',
    category: '',
    isbn: '',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'DISPONIVEL',
  });
  const user = getCurrentUser();
  const canManage = canManageCatalog(user);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async (query = filters) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(query).filter(([, value]) => value));
      const data = await listBooks(cleanFilters);
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar livros');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loadBooks(filters);
  };

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.type === 'number' ? Number(event.target.value) : event.target.value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(null);

    const payload = {
      ...form,
      publicationYear: Number(form.publicationYear),
      totalQuantity: Number(form.totalQuantity),
      availableQuantity: Number(form.availableQuantity),
    };

    try {
      if (editingBookId) {
        await updateBook(editingBookId, payload);
      } else {
        await createBook(payload);
      }

      setForm({
        title: '',
        author: '',
        publisher: '',
        publicationYear: '',
        category: '',
        isbn: '',
        totalQuantity: 1,
        availableQuantity: 1,
        status: 'DISPONIVEL',
      });
      setShowForm(false);
      setEditingBookId(null);
      await loadBooks(filters);
    } catch (err) {
      setError(err.message || 'Erro ao salvar livro');
    }
  };

  const handleEdit = async (book) => {
    setEditingBookId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      category: book.category,
      isbn: book.isbn,
      totalQuantity: book.totalQuantity,
      availableQuantity: book.availableQuantity,
      status: book.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Excluir este livro?')) return;
    setError(null);

    try {
      await deleteBook(bookId);
      await loadBooks(filters);
    } catch (err) {
      setError(err.message || 'Erro ao excluir livro');
    }
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <p className="eyebrow">Consulta</p>
          <h2>Livros</h2>
        </div>
        <div>
          {canManage ? <button type="button" onClick={() => setShowForm((current) => !current)}>Cadastrar Livro</button> : null}
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#fee', border: '1px solid #f88', borderRadius: '4px', color: '#c00' }}>{error}</div>}
      {loading && <div style={{ padding: '8px 12px', marginBottom: '12px', backgroundColor: '#eef', border: '1px solid #88f', borderRadius: '4px', color: '#008' }}>Carregando...</div>}

      {canManage && showForm ? (
        <form className="form" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: 0 }}>{editingBookId ? 'Editando livro' : 'Cadastro de livro'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <input name="title" placeholder="Título" value={form.title} onChange={handleFormChange} required />
            <input name="author" placeholder="Autor" value={form.author} onChange={handleFormChange} required />
            <input name="publisher" placeholder="Editora" value={form.publisher} onChange={handleFormChange} required />
            <input name="publicationYear" type="number" placeholder="Ano de publicação" value={form.publicationYear} onChange={handleFormChange} required />
            <input name="category" placeholder="Categoria" value={form.category} onChange={handleFormChange} required />
            <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleFormChange} required />
            <input name="totalQuantity" type="number" min="1" placeholder="Quantidade total" value={form.totalQuantity} onChange={handleFormChange} required />
            <input name="availableQuantity" type="number" min="0" placeholder="Quantidade disponível" value={form.availableQuantity} onChange={handleFormChange} required />
            <select name="status" value={form.status} onChange={handleFormChange}>
              <option value="DISPONIVEL">DISPONIVEL</option>
              <option value="INDISPONIVEL">INDISPONIVEL</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingBookId ? 'Salvar alterações' : 'Salvar livro'}</button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBookId(null);
                setForm({
                  title: '',
                  author: '',
                  publisher: '',
                  publicationYear: '',
                  category: '',
                  isbn: '',
                  totalQuantity: 1,
                  availableQuantity: 1,
                  status: 'DISPONIVEL',
                });
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <form className="filters" onSubmit={handleSubmit}>
        <input name="title" placeholder="Título" value={filters.title} onChange={handleChange} />
        <input name="author" placeholder="Autor" value={filters.author} onChange={handleChange} />
        <input name="category" placeholder="Categoria" value={filters.category} onChange={handleChange} />
        <input name="isbn" placeholder="ISBN" value={filters.isbn} onChange={handleChange} />
        <select name="availability" value={filters.availability} onChange={handleChange}>
          <option value="">Disponibilidade</option>
          <option value="true">Disponível</option>
          <option value="false">Indisponível</option>
        </select>
        <button type="submit">Filtrar</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Editora</th>
              <th>Ano</th>
              <th>Categoria</th>
              <th>ISBN</th>
              <th>Total</th>
              <th>Disponível</th>
              <th>Status</th>
              {canManage ? <th>Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.publicationYear}</td>
                <td>{book.category}</td>
                <td>{book.isbn}</td>
                <td>{book.totalQuantity}</td>
                <td>{book.availableQuantity}</td>
                <td>{book.status}</td>
                {canManage ? (
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleEdit(book)}>Editar</button>
                    <button type="button" onClick={() => handleDelete(book.id)}>Excluir</button>
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