export function getCurrentUser() {
  const rawUser = localStorage.getItem('biblioteca_user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function hasRole(user, allowedRoles) {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

export function isAdmin(user) {
  return user?.role === 'ADMIN';
}

export function canManageCatalog(user) {
  return user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO';
}