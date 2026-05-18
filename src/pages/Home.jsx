import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Generar o obtenir sessionId del localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('carritoSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('carritoSessionId', sessionId);
  }
  return sessionId;
};

const API_URL = 'http://localhost:4000/api';

export default function Home() {
  const navigate = useNavigate()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Auth state
  const [usuari, setUsuari] = useState(() => {
    const saved = localStorage.getItem('usuari');
    return saved ? JSON.parse(saved) : null;
  });

  const sessionId = getSessionId();

  const [featuredProducts, setFeaturedProducts] = useState([]);

  // ✅ USEEFFECT per carregar productes i carret a l'inici
  useEffect(() => {
    fetchProducts();
    fetchCarrito();
  }, []);

  // Carregar productes del backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/productes`);
      const data = await response.json();
      setFeaturedProducts(data);
    } catch (error) {
      console.error('Error carregant productes:', error);
      showNotification('Error carregant productes', 'error');
    }
  };

  // Obtenir carrito del backend
  const fetchCarrito = async () => {
    try {
      const response = await fetch(`${API_URL}/carrito/${sessionId}`);
      const data = await response.json();
      if (data.items) {
        // Transformar els items per tenir la estructura esperada
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
  };

  // Afegir producte al carrito
  const addToCart = async (product) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/carrito/${sessionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rellotgeId: product._id,
          quantitat: 1
        })
      });

      if (response.ok) {
        await fetchCarrito();
        showNotification(`${product.marca} ${product.model} afegit al carrito!`);
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error afegint al carrito', 'error');
      }
    } catch (error) {
      console.error('Error afegint al carrito:', error);
      showNotification('Error de connexió', 'error');
    }
    setLoading(false);
  };

  // Eliminar producte del carrito
  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/carrito/${sessionId}/items/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCarrito();
        showNotification('Producte eliminat del carrito');
      }
    } catch (error) {
      console.error('Error eliminant del carrito:', error);
    }
  };

  // Mostrar notificació
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch (err) {
      console.error('Error logout:', err);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuari');
    setUsuari(null);
    setIsUserMenuOpen(false);
    showNotification('Sessió tancada correctament');
  };


  return (
    <div className="bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        h1, h2, h3, .logo-text {
          font-family: 'Playfair Display', serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .glass-effect {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .product-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover {
          transform: translateY(-8px);
        }

        .cart-item {
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-primary::before {
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

        .btn-primary:hover::before {
          width: 300px;
          height: 300px;
        }

        .feature-icon {
          transition: all 0.3s ease;
        }

        .feature-item:hover .feature-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .notification {
          animation: slideInRight 0.5s ease-out forwards;
        }
      `}</style>

      {/* Notificació */}
      {notification && (
        <div className={`notification fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl ${notification.type === 'error'
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-green-500 to-green-600'
          } text-white font-medium`}>
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass-effect">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-3 group">
              <span className="sr-only">Alta Tempus</span>
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
            </a>
          </div>

          {/* Links desktop */}
          <div className="hidden lg:flex lg:gap-x-10">
            <Link to="/cataleg" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
              Catàleg
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
              Categorías
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
              Marcas
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
              Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* User icon y carrito */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
            {/* Icono usuario / Nom usuari */}
            {usuari ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-amber-900 hover:to-amber-800 border border-gray-700 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white text-sm font-bold">
                    {usuari.nom.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                    {usuari.nom}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-effect rounded-xl shadow-2xl overflow-hidden animate-slideDown">
                    <div className="p-4 border-b border-gray-700/50">
                      <p className="text-sm font-semibold text-white">{usuari.nom} {usuari.cognoms}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{usuari.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {usuari.rol === 'admin' ? '👑 Admin' : '👤 Client'}
                      </span>
                    </div>
                    
                    <div className="py-1 border-b border-gray-700/50">
                      <Link
                        to="/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 transition-all duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        El meu perfil
                      </Link>
                      
                      {usuari.rol === 'admin' && (
                        <Link
                          to="/admin"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-amber-500/10 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Panell Admin
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-red-500/10 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Tancar sessió
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-amber-900 hover:to-amber-800 border border-gray-700 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Carrito */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-amber-900 hover:to-amber-800 border border-gray-700 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 relative group"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {/* Badge con cantidad */}
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Dropdown del carrito */}
              {isCartOpen && (
                <div className="absolute right-0 mt-3 w-96 glass-effect rounded-2xl shadow-2xl overflow-hidden animate-slideDown">
                  <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">El teu Carrito</h3>
                      <span className="text-sm text-amber-400 font-medium">{cartItems.length} items</span>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="max-h-96 overflow-y-auto">
                    {cartItems.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>El carrito està buit</p>
                      </div>
                    ) : (
                      cartItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="cart-item p-4 border-b border-gray-800/50"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white mb-1 truncate">{item.name}</h4>
                              <p className="text-xs text-gray-400 mb-2">Quantitat: {item.quantity}</p>
                              <p className="text-base font-bold text-amber-400">
                                €{item.price.toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors self-start p-1 hover:bg-red-500/10 rounded"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Total y botones */}
                  <div className="p-5 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 font-medium">Total:</span>
                      <span className="text-2xl font-bold text-white">€{totalPrice.toLocaleString()}</span>
                    </div>
                    <Link to="/checkout" className="btn-primary block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 mb-2 shadow-lg hover:shadow-amber-500/50 text-center">
                      <span className="relative z-10">Finalitzar Compra</span>
                    </Link>
                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 border border-gray-700">
                      Veure Carrito
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero section con imagen de fondo */}
      <div className="relative isolate px-6 pt-14 lg:px-8 min-h-screen flex items-center">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&q=80"
            alt="Luxury watches"
            className="h-full w-full object-cover brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-gray-950/50 to-gray-950"></div>

          {/* Overlay con patrón decorativo */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 text-center relative z-10">
          <div className="mb-6 animate-fadeIn">
            <span className="inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium tracking-wide">
              Col·lecció Exclusiva 2024
            </span>
          </div>

          <h1 className="text-6xl font-bold tracking-tight text-white sm:text-8xl mb-8 animate-fadeInUp leading-tight">
            El temps és
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mt-2">
              luxe etern
            </span>
          </h1>

          <p className="mt-8 text-xl font-light text-gray-300 sm:text-2xl max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Descobreix la col·lecció més exclusiva de rellotges de luxe i esportius. Cada peça explica una història única.
          </p>

          <div className="mt-12 flex items-center justify-center gap-x-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/cataleg"
              className="btn-primary rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Veure col·lecció</span>
            </Link>
            <a href="#" className="text-base font-semibold text-white hover:text-amber-400 transition-colors duration-300 flex items-center gap-2 group">
              Saber més
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features section */}
      <div className="overflow-hidden bg-gray-950 py-24 sm:py-32 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">

            {/* Texto */}
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold text-amber-500 tracking-wide uppercase mb-3">Experts en rellotgeria</h2>
                <p className="mt-2 text-5xl font-bold tracking-tight text-white sm:text-6xl leading-tight">
                  Per què escollir-nos
                </p>
                <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
                  Amb més de 20 anys d'experiència en el mercat d'alta rellotgeria, ens hem consolidat com a referents en la venda de rellotges de luxe i esportius.
                </p>

                <dl className="mt-12 max-w-xl space-y-8 text-base text-gray-400 lg:max-w-none">
                  {/* Feature 1 */}
                  <div className="relative pl-12 feature-item group">
                    <dt className="inline font-semibold text-white">
                      <div className="feature-icon absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      Autenticitat garantida.
                    </dt>
                    <dd className="inline ml-2">Tots els nostres rellotges són 100% autèntics amb certificat de garantia oficial de cada marca.</dd>
                  </div>

                  {/* Feature 2 */}
                  <div className="relative pl-12 feature-item group">
                    <dt className="inline font-semibold text-white">
                      <div className="feature-icon absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Servei tècnic especialitzat.
                    </dt>
                    <dd className="inline ml-2">Comptem amb rellotgers certificats per mantenir el teu rellotge en perfectes condicions.</dd>
                  </div>

                  {/* Feature 3 */}
                  <div className="relative pl-12 feature-item group">
                    <dt className="inline font-semibold text-white">
                      <div className="feature-icon absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Enviament internacional.
                    </dt>
                    <dd className="inline ml-2">Enviem a tot el món amb seguiment complet i assegurança inclosa.</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Imagen */}
            <div className="flex items-start justify-end lg:order-first">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1587836374058-4ec0b6c1b9e8?w=800&q=80"
                  alt="Rellotger treballant"
                  className="w-[48rem] max-w-none rounded-2xl shadow-2xl ring-1 ring-white/10 sm:w-[57rem]"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de productos destacados */}
      <div id="productes" className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold text-amber-500 tracking-wide uppercase mb-3">
              La nostra selecció
            </h2>
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-4">
              Productes destacats
            </p>
            <p className="text-lg text-gray-400 font-light">
              Els rellotges més exclusius de la nostra col·lecció
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <article key={product._id} className="product-card flex flex-col items-start glass-effect rounded-2xl overflow-hidden group">
                <div className="relative w-full overflow-hidden">
                  <img
                    src={product.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'}
                    alt={`${product.marca} ${product.model}`}
                    className="aspect-[16/9] w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur bg-amber-500/90`}>
                      {product.categoria === 'lux' ? 'Lux' : product.categoria === 'esportiu' ? 'Esportiu' : 'Nou'}
                    </span>
                  </div>
                </div>
                <div className="p-6 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < (product.rating || 5) ? 'text-amber-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">({product.reviews || 0} ressenyes)</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {product.marca} {product.model}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {product.descripcio}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800">
                    <p className="text-3xl font-bold text-amber-400">€{product.preu?.toLocaleString()}</p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={loading}
                      className="btn-primary rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="relative z-10">Afegir</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>

      {/* Marcas section */}
      <div className="bg-gray-950 py-24 sm:py-32 border-t border-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-base font-semibold text-amber-500 tracking-wide uppercase mb-12">
            Treballem amb les millors marques del món
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-12 gap-y-12 sm:max-w-xl sm:grid-cols-3 sm:gap-x-16 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {['ROLEX', 'OMEGA', 'TAG HEUER', 'SEIKO', 'CASIO'].map((brand) => (
              <div key={brand} className="col-span-1 flex justify-center group">
                <span className="text-white text-2xl font-bold opacity-40 group-hover:opacity-100 transition-all duration-300 tracking-wider group-hover:text-amber-400">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="xl:grid xl:grid-cols-3 xl:gap-12">
            {/* Company info */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="h-11 w-11 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="logo-text text-2xl font-bold text-white tracking-wider">ALTA</span>
                  <span className="text-xs text-amber-500 tracking-[0.3em] -mt-1 font-light">TEMPUS</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Experts en rellotgeria des de 2004. El teu temps mereix el millor.
              </p>
              <div className="flex space-x-6">
                {[
                  { name: 'Facebook', path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
                  { name: 'Instagram', path: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z' },
                  { name: 'Twitter', path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' }
                ].map((social) => (
                  <a key={social.name} href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
                    <span className="sr-only">{social.name}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d={social.path} clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links sections */}
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Productes</h3>
                  <ul className="mt-4 space-y-3">
                    {['Rellotges Premium', 'Rellotges Casual', 'Rellotges Esportius', 'Accessoris'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold text-white mb-4">Suport</h3>
                  <ul className="mt-4 space-y-3">
                    {['Garantia', 'Servei Tècnic', 'Enviaments', 'Devolucions'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Empresa</h3>
                  <ul className="mt-4 space-y-3">
                    {['Sobre Nosaltres', 'Blog', 'Contacte'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
                  <ul className="mt-4 space-y-3">
                    {['Privacitat', 'Termes'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-gray-900 pt-8">
            <p className="text-xs text-gray-500 text-center">
              &copy; 2024 Pau Ros. Tots els drets reservats.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}