import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { isAdmin } from '../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(formData);
      localStorage.setItem('biblioteca_token', data.token);
      localStorage.setItem('biblioteca_user', JSON.stringify(data.user));
      navigate(isAdmin(data.user) ? '/' : '/books');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div>
        <p className="eyebrow">Acesso restrito</p>
        <h2>Entre com seu usuário</h2>
        <p className="muted">Todos os acessos dependem de JWT válido.</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>
          Senha
          <input name="password" type="password" value={formData.password} onChange={handleChange} required />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}