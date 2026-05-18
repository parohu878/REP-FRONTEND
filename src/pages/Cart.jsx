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

export default function Cart() {
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchCarrito();
  }, []);

  const fetchCarrito = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/carrito/${sessionId}`);
      const data = await res.json();
      if (data.items) {
        setCartItems(data.items.map(item => ({
          id: item.rellotge?._id || 'deleted',
          name: item.rellotge ? `${item.rellotge.marca} ${item.rellotge.model}` : 'Producte no disponible',
          price: item.rellotge?.preu || 0,
          stock: item.rellotge?.stock || 0,
          image: item.rellotge?.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&q=80',
          quantity: item.quantitat
        })));
      }
    } catch (err) {
      console.error('Error carregant carrito:', err);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(itemId);
    try {
      await fetch(`${API_URL}/carrito/${sessionId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantitat: newQty })
      });
      await fetchCarrito();
    } catch (err) {
      console.error('Error actualitzant quantitat:', err);
    }
    setUpdating(null);
  };

  const removeItem = async (itemId) => {
    setUpdating(itemId);
    try {
      await fetch(`${API_URL}/carrito/${sessionId}/items/${itemId}`, { method: 'DELETE' });
      await fetchCarrito();
    } catch (err) {
      console.error('Error eliminant producte:', err);
    }
    setUpdating(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 14.99;
  const total = subtotal + shipping;

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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .spinner { animation: spin 1s linear infinite; }

        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cart-item {
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cart-item:hover { background: rgba(245,158,11,0.03); }
        .qty-btn {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .qty-btn:hover { background: rgba(245,158,11,0.2); border-color: rgba(245,158,11,0.4); }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .remove-btn {
          color: rgba(239,68,68,0.6);
          transition: color 0.2s;
          cursor: pointer;
          background: none; border: none; padding: 4px;
        }
        .remove-btn:hover { color: rgb(239,68,68); }
        .btn-checkout {
          position: relative; overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-checkout:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(245,158,11,0.35);
        }
        .btn-checkout:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 20px rgba(245,158,11,0.1); }
          50% { box-shadow: 0 0 35px rgba(245,158,11,0.25); }
        }
        .summary-glow { animation: pulse-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 glass-card">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
            <div className="relative">
              <svg className="h-11 w-11 text-amber-500 transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="logo-text text-2xl font-bold text-white tracking-wider">ALTA</span>
              <span className="text-xs text-amber-500 tracking-[0.3em] -mt-1 font-light">TEMPUS</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/cataleg" className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continuar comprant
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            El teu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Carrit</span>
          </h1>
          <p className="text-gray-400 font-light">Revisa els teus articles abans de procedir al pagament</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="spinner w-10 h-10 border-[3px] border-gray-700 border-t-amber-500 rounded-full" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-24 animate-fadeIn">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-3">El carrit és buit</h2>
            <p className="text-gray-400 mb-8">Descobreix la nostra col·lecció de rellotges</p>
            <Link to="/cataleg" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Veure catàleg
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 animate-fadeInUp">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800/60 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Articles ({cartItems.length})</h2>
                  <span className="text-sm text-amber-400">{cartItems.reduce((s, i) => s + i.quantity, 0)} unitats</span>
                </div>

                <div className="divide-y divide-gray-800/40">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item p-5">
                      <div className="flex gap-4 items-start">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl ring-1 ring-white/10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm truncate">{item.name}</h3>
                          <p className="text-amber-400 font-bold mt-1">€{item.price.toLocaleString()}</p>
                          {item.stock <= 5 && item.stock > 0 && (
                            <p className="text-xs text-orange-400 mt-1">⚠ Últimes {item.stock} unitats</p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              className="qty-btn"
                              disabled={item.quantity <= 1 || updating === item.id}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                            </button>
                            <span className="text-white font-semibold w-6 text-center">
                              {updating === item.id ? <span className="spinner inline-block w-4 h-4 border-2 border-gray-600 border-t-amber-400 rounded-full" /> : item.quantity}
                            </span>
                            <button
                              className="qty-btn"
                              disabled={item.quantity >= item.stock || updating === item.id}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-3">
                          <p className="text-white font-bold">€{(item.price * item.quantity).toLocaleString()}</p>
                          <button className="remove-btn" onClick={() => removeItem(item.id)} disabled={updating === item.id} title="Eliminar">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card summary-glow rounded-2xl overflow-hidden sticky top-28">
                <div className="p-5 border-b border-gray-800/60 bg-gradient-to-r from-gray-900 to-gray-800">
                  <h2 className="text-lg font-bold text-white">Resum de la comanda</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-200 font-medium">€{subtotal.toLocaleString('ca', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Enviament</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-400' : 'text-gray-200'}`}>
                      {shipping === 0 ? 'Gratuït 🎉' : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">Enviament gratuït per a comandes superiors a €500</p>
                  )}
                  <div className="border-t border-gray-700/50 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                        €{total.toLocaleString('ca', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <button
                    id="btn-proceed-checkout"
                    onClick={() => navigate('/checkout')}
                    disabled={cartItems.length === 0}
                    className="btn-checkout w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg text-base"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Procedir al pagament
                    </span>
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs text-green-400">Pagament 100% segur amb Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-900 py-8 text-center">
        <p className="text-xs text-gray-600">© 2024 Alta Tempus. Tots els drets reservats.</p>
      </footer>
    </div>
  );
}
