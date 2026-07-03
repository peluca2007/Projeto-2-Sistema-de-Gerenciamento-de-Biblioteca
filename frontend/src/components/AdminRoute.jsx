import { Navigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('biblioteca_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  if (!isAdmin(user)) {
    return <Navigate to="/books" replace />;
  }

  return children;
}
