// [LOCALITZACIÓ: -backend/front]
// Estàs al FRONT-END. Punt d'entrada React amb rutes protegides per rol.
// [LOCALITZACIÓ: -RBAC frontend]
// Les rutes /dashboard i /admin estan envoltades per ProtectedRoute.
// /dashboard → requiredRole='client'  → NOMÉS clients (i admins via lògica de servei)
// /admin     → requiredRole='admin'   → EXCLUSIVAMENT admins
// Un token de 'client' que intenti accedir a /admin serà redirigit a /.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Cataleg from './pages/Cataleg.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import CheckoutSuccess from './pages/CheckoutSuccess.jsx'
import CheckoutCancel from './pages/CheckoutCancel.jsx'
import DashboardUser from './pages/DashboardUser.jsx'
import DashboardAdmin from './pages/DashboardAdmin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="cataleg" element={<Cataleg />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="checkout/cancel" element={<CheckoutCancel />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Ruta protegida: dashboard client (rol 'client' o 'admin') */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="client">
                <DashboardUser />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida: dashboard admin (ÚNICAMENT rol 'admin') */}
          <Route
            path="admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
