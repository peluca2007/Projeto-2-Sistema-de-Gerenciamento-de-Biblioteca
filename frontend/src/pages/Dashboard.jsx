import { useEffect, useState } from 'react';
import { getDashboard } from '../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState({ available: 0, loaned: 0, total: 0, overdue: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { name: 'Disponíveis', value: data.available },
    { name: 'Emprestados', value: data.loaned },
  ];

  return (
    <div>
      <div className="page-card">
        <div className="page-header">
          <div>
            <p className="eyebrow">Painel</p>
            <h2>Dashboard</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#34d399' : '#fb923c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="eyebrow">Empréstimos Atrasados</div>
            {loading ? <p>Carregando...</p> : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Leitor</th>
                      <th>Livro</th>
                      <th>Data Venc.</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.overdue && data.overdue.length ? data.overdue.map((l) => (
                      <tr key={l.id}>
                        <td>{l.Reader?.name || '—'}</td>
                        <td>{l.Book?.title || '—'}</td>
                        <td>{l.dueDate ? new Date(l.dueDate).toLocaleDateString() : '—'}</td>
                        <td>{l.status}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="muted">Nenhum empréstimo atrasado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
