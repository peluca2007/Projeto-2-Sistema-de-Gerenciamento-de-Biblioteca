import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasRole } from '../utils/auth';

export default function RoleRoute({ children, allowedRoles, fallbackTo = '/books' }) {
  const token = localStorage.getItem('biblioteca_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  if (!hasRole(user, allowedRoles)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return children;
}