// [LOCALITZACIÓ: -RBAC frontend]
// ProtectedRoute — Component guardia de rutes al frontend.
// Comprova dues coses:
//   1. Que hi hagi un accessToken al localStorage (usuari autenticat)
//   2. Que el rol de l'usuari coincideixi amb el rol requerit per la ruta
// Si no compleix, redirigeix a /login (sense token) o a / (rol incorrecte).
// Això evita que un 'client' accedeixi al dashboard d'admin i viceversa.

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('accessToken');
  const usuariRaw = localStorage.getItem('usuari');

  // 1. Sense token → redirigir a login
  if (!token || !usuariRaw) {
    return <Navigate to="/login" replace />;
  }

  // 2. Comprovar rol si s'especifica
  if (requiredRole) {
    let usuari;
    try {
      usuari = JSON.parse(usuariRaw);
    } catch {
      // Token corrupte → logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('usuari');
      return <Navigate to="/login" replace />;
    }

    if (usuari.rol !== requiredRole) {
      // Rol incorrecte → redirigir a inici (NO al dashboard contrari)
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
