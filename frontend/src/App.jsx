import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';
import ReadersPage from './pages/ReadersPage';
import LoansPage from './pages/LoansPage';
import UsersPage from './pages/UsersPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="readers" element={<RoleRoute allowedRoles={['ADMIN', 'BIBLIOTECARIO']}><ReadersPage /></RoleRoute>} />
        <Route path="loans" element={<LoansPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}