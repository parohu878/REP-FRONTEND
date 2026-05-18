import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const getSessionId = () => {
  let sessionId = localStorage.getItem('carritoSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('carritoSessionId', sessionId);
  }
  return sessionId;
};

const API_URL = 'http://localhost:4000/api';

const COUNTRIES = [
  'Espanya', 'França', 'Itàlia', 'Alemanya', 'Portugal', 'Regne Unit',
  'Estats Units', 'Canadà', 'Suïssa', 'Andorra', 'Bèlgica', 'Holanda',
  'Àustria', 'Japó', 'Austràlia'
];

export default function Checkout() {
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Espanya',
    phone: ''
  });

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    try {
      const response = await fetch(`${API_URL}/carrito/${sessionId}`);
      const data = await response.json();
      if (data.items) {
        const transformedItems = data.items.map(item => ({
          id: item.rellotge?._id || 'deleted',
          name: item.rellotge ? `${item.rellotge.marca} ${item.rellotge.model}` : 'Producte no disponible',
          price: item.rellotge?.preu || 0,
          image: item.rellotge?.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&q=80',
          quantity: item.quantitat
        }));
        setCartItems(transformedItems);
      }
    } catch (error) {
      console.error('Error carregant carrito:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 14.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Verificar que l'usuari estigui autenticat
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Has d\'iniciar sessió per completar el pagament.');
        navigate('/login');
        setProcessing(false);
        return;
      }

      // Cridar el backend per crear la sessió de Stripe
      // Els preus es validen al servidor (mai del frontend)
      const shippingData = {
        nom: formData.fullName,
        email: formData.email,
        adreca: formData.address,
        ciutat: formData.city,
        codiPostal: formData.postalCode,
        pais: formData.country,
        telefon: formData.phone
      };

      const res = await fetch(`${API_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, shippingData })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error en el pagament. Torna-ho a intentar.');
        
        // Si el token és invàlid o ha expirat, neteja'l i redirigeix a login
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
        
        setProcessing(false);
        return;
      }

      // Redirigir directament a la pàgina de pagament de Stripe a través de la URL de la sessió
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No s\'ha pogut generar l\'enllaç de pagament.');
      }

    } catch (err) {
      console.error('Error en el checkout:', err);
      // Mostrem l'error exacte per saber si falla Stripe o el backend
      alert(`Error: ${err.message || 'Error desconegut'}. Si us plau refresca la pàgina o reinicia el servidor Vite/Backend.`);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

        * { font-family: 'Outfit', sans-serif; }
        h1, h2, h3, .logo-text { font-family: 'Playfair Display', serif; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.3); }
        }

        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }

        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .input-field {
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          outline: none;
        }
        .input-field::placeholder {
          color: rgba(156, 163, 175, 0.5);
        }

        .payment-option {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .payment-option:hover {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.05);
        }
        .payment-option.active {
          border-color: rgba(245, 158, 11, 0.6);
          background: rgba(245, 158, 11, 0.1);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
        }

        .summary-card {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .checkout-item {
          transition: all 0.3s ease;
        }
        .checkout-item:hover {
          background: rgba(99, 102, 241, 0.05);
        }

        .btn-pay {
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .btn-pay::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .btn-pay:hover::before {
          width: 400px;
          height: 400px;
        }
        .btn-pay:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);
        }

        .secure-badge {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Navbar simplificada */}
      <header className="fixed inset-x-0 top-0 z-50 glass-card">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
              <div className="relative">
                <svg className="h-11 w-11 text-amber-500 transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="logo-text text-2xl font-bold text-white tracking-wider">ALTA</span>
                <span className="text-xs text-amber-500 tracking-[0.3em] -mt-1 font-light">TEMPUS</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tornar a la botiga
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Finalitzar <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Compra</span>
          </h1>
          <p className="text-gray-400 text-lg font-light">Completa la teva informació per processar la comanda</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-10 h-10 border-3 border-gray-700 border-t-amber-500 rounded-full"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-3">El teu carrito està buit</h2>
            <p className="text-gray-400 mb-8">Afegeix productes al carrito per continuar</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tornar a la botiga
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* ====== LEFT: CHECKOUT FORM (3 cols) ====== */}
              <div className="lg:col-span-3 space-y-8 animate-fadeInUp">

                {/* Informació personal */}
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Informació Personal</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nom Complet</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Introdueix el teu nom complet"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Correu Electrònic</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="exemple@correu.com"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telèfon</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+34 600 000 000"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Adreça d'enviament */}
                <div className="glass-card rounded-2xl p-6 sm:p-8" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Adreça d'Enviament</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Adreça</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Carrer, número, pis"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ciutat</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Barcelona"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Codi Postal</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="08001"
                        className="input-field w-full rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">País</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="input-field w-full rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c} className="bg-gray-900">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mètode de pagament — Stripe */}
                <div className="glass-card rounded-2xl p-6 sm:p-8" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Mètode de Pagament</h2>
                  </div>

                  {/* Stripe payment info */}
                  <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Stripe logo */}
                      <div className="flex items-center justify-center w-16 h-10 rounded-lg bg-white/10 border border-white/10">
                        <svg className="w-12 h-5" viewBox="0 0 60 25" fill="none">
                          <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a13.4 13.4 0 0 1-4.56.83c-4.14 0-6.91-2.45-6.91-7.14 0-4.38 2.65-7.24 6.41-7.24 3.57 0 5.87 2.58 5.87 6.81v1.82zm-4.22-5.29c-1.25 0-2.16.98-2.35 2.58h4.5c-.07-1.6-.84-2.58-2.15-2.58zM36.95 19.86V.5l4.22-.82v7.37c.75-.56 1.72-.9 2.83-.9 3.08 0 5.23 2.56 5.23 6.95 0 4.9-2.47 7.53-5.64 7.53-1.13 0-2.22-.38-3.05-1.15l-.16.98h-3.43zm4.22-3.52c.57.54 1.22.8 1.93.8 1.67 0 2.83-1.32 2.83-3.98 0-2.42-1.05-3.81-2.72-3.81-.75 0-1.42.27-2.04.87v6.12zM27.59 5.65l4.22-.82v15.03h-4.22V5.65zm0-5.15L31.81 0v3.52l-4.22.82V.5zM20.1 6.29c1.3 0 2.43.22 3.49.67v3.74c-1-.54-2.16-.87-3.26-.87-1.13 0-1.7.4-1.7 1.02 0 .76.94 1.1 2.1 1.6 1.87.82 3.17 1.88 3.17 3.92 0 3-2.34 4.46-5.56 4.46-1.48 0-2.85-.32-3.87-.78v-3.83c1.15.72 2.6 1.1 3.66 1.1 1.2 0 1.79-.38 1.79-1.05 0-.75-.72-1.08-1.93-1.61-1.86-.82-3.18-1.87-3.18-4 0-2.82 2.15-4.37 5.29-4.37zM6.32 12.3c0-1.87-.67-2.9-2.23-2.9-.75 0-1.42.27-2.04.87v6.12c.57.54 1.22.8 1.93.8 1.67 0 2.34-1.4 2.34-4.89zm4.22-.42c0 4.9-2.47 7.53-5.64 7.53-1.13 0-2.22-.38-3.05-1.15l-.16.98H1.55V.5L5.77 0v6.62c.75-.56 1.72-.9 2.83-.9 3.08 0 5.94 2.23 5.94 6.16z" fill="#6772E5"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-base">Stripe Checkout</h3>
                        <p className="text-gray-400 text-xs">Pagament segur i encriptat</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-sm text-gray-300">Seràs redirigit a la pàgina segura de Stripe per completar el pagament</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-sm text-gray-300">Accepta targeta de crèdit, dèbit, Google Pay i Apple Pay</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm text-gray-300">Les teves dades bancàries mai passen pel nostre servidor</p>
                      </div>
                    </div>

                    {/* Accepted cards icons */}
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500">Acceptem:</span>
                      <div className="flex items-center gap-2">
                        {/* Visa */}
                        <div className="w-10 h-6 rounded bg-white/10 flex items-center justify-center">
                          <svg className="w-7 h-4" viewBox="0 0 48 16" fill="none">
                            <path d="M17.83 1.14L11.58 14.86H7.6L4.56 4.03C4.37 3.29 4.2 3.02 3.64 2.72C2.73 2.24 1.25 1.79 0 1.51L0.1 1.14H6.53C7.38 1.14 8.14 1.7 8.32 2.68L9.87 10.74L13.79 1.14H17.83ZM34.06 10.23C34.08 6.68 29.05 6.49 29.08 4.89C29.09 4.39 29.57 3.86 30.61 3.73C31.13 3.66 32.53 3.61 34.12 4.35L34.78 1.49C33.93 1.17 32.83 0.86 31.47 0.86C27.67 0.86 24.97 2.93 24.94 5.88C24.92 8.07 26.88 9.29 28.37 10.02C29.9 10.77 30.43 11.24 30.42 11.9C30.41 12.92 29.2 13.37 28.07 13.38C26.24 13.41 25.19 12.9 24.35 12.51L23.67 15.46C24.52 15.84 26.09 16.18 27.72 16.2C31.76 16.2 34.04 14.16 34.06 10.23ZM44.01 14.86H47.52L44.47 1.14H41.28C40.55 1.14 39.93 1.55 39.65 2.2L33.98 14.86H38.01L38.81 12.63H43.72L44.01 14.86ZM39.91 9.63L41.94 4.03L43.11 9.63H39.91ZM23.59 1.14L20.44 14.86H16.6L19.75 1.14H23.59Z" fill="#1A1F71"/>
                          </svg>
                        </div>
                        {/* Mastercard */}
                        <div className="w-10 h-6 rounded bg-white/10 flex items-center justify-center">
                          <svg className="w-7 h-5" viewBox="0 0 48 32" fill="none">
                            <circle cx="18" cy="16" r="7" fill="#EB001B" opacity="0.9" />
                            <circle cx="30" cy="16" r="7" fill="#F79E1B" opacity="0.9" />
                            <path d="M24 10.5a7 7 0 010 11 7 7 0 010-11z" fill="#FF5F00" opacity="0.9" />
                          </svg>
                        </div>
                        {/* Amex */}
                        <div className="w-10 h-6 rounded bg-white/10 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-blue-400">AMEX</span>
                        </div>
                        {/* Apple Pay */}
                        <div className="w-10 h-6 rounded bg-white/10 flex items-center justify-center">
                          <span className="text-[7px] font-semibold text-gray-300"> Pay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ====== RIGHT: ORDER SUMMARY (2 cols) ====== */}
              <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                <div className="glass-card summary-card rounded-2xl overflow-hidden sticky top-28">

                  {/* Header */}
                  <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Resum de Comanda</h2>
                      <span className="text-sm text-amber-400 font-medium">{cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="max-h-80 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={item.id} className="checkout-item p-4 border-b border-gray-800/50" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex gap-4">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"></div>
                            {/* Quantity badge */}
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">Quantitat: {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-amber-400">€{(item.price * item.quantity).toLocaleString()}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500 mt-1">€{item.price.toLocaleString()} /u</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="p-6 space-y-3 bg-gradient-to-b from-gray-900/50 to-black/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-gray-300 font-medium">€{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Enviament</span>
                      <span className={`font-medium ${shipping === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                        {shipping === 0 ? 'Gratuït' : `€${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-green-400/70">Enviament gratuït en comandes superiors a €500</p>
                    )}

                    <div className="border-t border-gray-700/50 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                          €{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Pay button */}
                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-pay w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                    >
                      {processing ? (
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                          Processant...
                        </span>
                      ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Completar Pagament
                        </span>
                      )}
                    </button>

                    {/* Secure badge */}
                    <div className="secure-badge rounded-xl p-3 mt-3 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-xs text-green-400 font-medium">Pagament segur amb encriptació SSL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-900 py-8 text-center">
        <p className="text-xs text-gray-500">&copy; 2024 Alta Tempus. Tots els drets reservats.</p>
      </footer>
    </div>
  );
}
