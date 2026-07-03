import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin, canManageCatalog } from '../utils/auth';

export default function Layout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem('biblioteca_token');
    localStorage.removeItem('biblioteca_user');
    navigate('/login');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Projeto 2</p>
          <h1>Sistema de Gerenciamento de Biblioteca</h1>
        </div>
        <div className="user-chip">
          <span>{user?.name || 'Usuário'}</span>
          <button type="button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <nav className="nav">
        <Link to="/books">Livros</Link>
        {canManageCatalog(user) ? <Link to="/readers">Leitores</Link> : null}
        <Link to="/loans">Empréstimos</Link>
        {isAdmin(user) ? <Link to="/users">Gerenciar Usuários</Link> : null}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}