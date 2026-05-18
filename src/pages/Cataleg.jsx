import { Link } from 'react-router-dom'
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

export default function Cataleg() {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filtres
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [sort, setSort] = useState('');
    const [preuMin, setPreuMin] = useState('');
    const [preuMax, setPreuMax] = useState('');

    const sessionId = getSessionId();

    useEffect(() => {
        fetchProducts();
        fetchCarrito();
    }, []);

    // Tornar a buscar quan canvien filtres
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, categoria, sort, preuMin, preuMax]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoria) params.append('categoria', categoria);
            if (sort) params.append('sort', sort);
            if (preuMin) params.append('preuMin', preuMin);
            if (preuMax) params.append('preuMax', preuMax);

            const response = await fetch(`${API_URL}/productes?${params.toString()}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error carregant productes:', error);
            showNotification('Error carregant productes', 'error');
        }
        setLoading(false);
    };

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
    };

    const addToCart = async (product) => {
        try {
            const response = await fetch(`${API_URL}/carrito/${sessionId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rellotgeId: product._id, quantitat: 1 })
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
    };

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

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const categories = [
        { value: '', label: 'Totes les categories' },
        { value: 'digital', label: 'Digital' },
        { value: 'analògic', label: 'Analògic' },
        { value: 'intel·ligent', label: 'Intel·ligent' },
        { value: 'lux', label: 'Luxe' },
        { value: 'esportiu', label: 'Esportiu' }
    ];

    const sortOptions = [
        { value: '', label: 'Ordenar per...' },
        { value: 'preu_asc', label: 'Preu: Menor a major' },
        { value: 'preu_desc', label: 'Preu: Major a menor' },
        { value: 'marca_asc', label: 'Marca: A-Z' },
        { value: 'marca_desc', label: 'Marca: Z-A' }
    ];

    const clearFilters = () => {
        setSearch('');
        setCategoria('');
        setSort('');
        setPreuMin('');
        setPreuMax('');
    };

    const hasActiveFilters = search || categoria || sort || preuMin || preuMax;

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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }

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
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.15);
        }

        .cart-item { transition: all 0.3s ease; }
        .cart-item:hover { background: rgba(99, 102, 241, 0.1); }

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

        .notification {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .filter-input {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }
        .filter-input:focus {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          outline: none;
        }
        .filter-input::placeholder { color: rgba(156, 163, 175, 0.6); }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
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
                        <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
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
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:gap-x-10">
                        <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
                            Inici
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/cataleg" className="text-sm font-medium text-white transition-colors duration-200 relative group">
                            Catàleg
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-all duration-300"></span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
                        <Link
                            to="/login"
                            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-amber-900 hover:to-amber-800 border border-gray-700 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group"
                        >
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        {/* Carrito */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-amber-900 hover:to-amber-800 border border-gray-700 hover:border-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 relative group"
                            >
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown del carrito */}
                            {isCartOpen && (
                                <div className="absolute right-0 mt-3 w-96 glass-effect rounded-2xl shadow-2xl overflow-hidden animate-slideDown">
                                    <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-800">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-white">El teu Carrito</h3>
                                            <span className="text-sm text-amber-400 font-medium">{totalItems} items</span>
                                        </div>
                                    </div>

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
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-white mb-1 truncate">{item.name}</h4>
                                                            <p className="text-xs text-gray-400 mb-2">Quantitat: {item.quantity}</p>
                                                            <p className="text-base font-bold text-amber-400">€{item.price.toLocaleString()}</p>
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

                                    <div className="p-5 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400 font-medium">Total:</span>
                                            <span className="text-2xl font-bold text-white">€{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <Link to="/checkout" className="btn-primary block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 text-center">
                                            <span className="relative z-10">Finalitzar Compra</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Page header */}
            <div className="pt-28 pb-12 px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
                <div className="mx-auto max-w-7xl relative">
                    <div className="text-center animate-fadeInUp">
                        <h1 className="text-5xl font-bold text-white sm:text-6xl mb-4">
                            Catàleg de{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                                Rellotges
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
                            Descobreix la nostra col·lecció completa de rellotges de luxe i esportius
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtres i productes */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                {/* Barra de filtres */}
                <div className="glass-effect rounded-2xl p-6 mb-10 animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Cerca */}
                        <div className="flex-1 min-w-[250px]">
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cercar rellotges..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="filter-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        {/* Categoria */}
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="filter-input px-4 py-3 rounded-xl text-sm min-w-[180px] cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value} className="bg-gray-900">{cat.label}</option>
                            ))}
                        </select>

                        {/* Ordenar */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="filter-input px-4 py-3 rounded-xl text-sm min-w-[200px] cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                            ))}
                        </select>

                        {/* Preu min */}
                        <input
                            type="number"
                            placeholder="Preu mín."
                            value={preuMin}
                            onChange={(e) => setPreuMin(e.target.value)}
                            className="filter-input px-4 py-3 rounded-xl text-sm w-[130px]"
                            min="0"
                        />

                        {/* Preu max */}
                        <input
                            type="number"
                            placeholder="Preu màx."
                            value={preuMax}
                            onChange={(e) => setPreuMax(e.target.value)}
                            className="filter-input px-4 py-3 rounded-xl text-sm w-[130px]"
                            min="0"
                        />

                        {/* Netejar filtres */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Netejar
                            </button>
                        )}
                    </div>
                </div>

                {/* Recompte de resultats */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-400 text-sm">
                        {loading ? 'Carregant...' : `${products.length} producte${products.length !== 1 ? 's' : ''} trobat${products.length !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {/* Grid de productes */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass-effect rounded-2xl overflow-hidden">
                                <div className="skeleton aspect-[4/3]"></div>
                                <div className="p-5">
                                    <div className="skeleton h-4 rounded mb-3 w-3/4"></div>
                                    <div className="skeleton h-3 rounded mb-2 w-1/2"></div>
                                    <div className="skeleton h-6 rounded mt-4 w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-20 h-20 mx-auto mb-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white mb-3">No s'han trobat productes</h3>
                        <p className="text-gray-400 mb-6">Prova a canviar els filtres de cerca</p>
                        <button
                            onClick={clearFilters}
                            className="btn-primary rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white hover:from-amber-600 hover:to-amber-700 shadow-lg transition-all"
                        >
                            <span className="relative z-10">Netejar filtres</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <article
                                key={product._id}
                                className="product-card glass-effect rounded-2xl overflow-hidden group cursor-pointer animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Imatge */}
                                <div
                                    className="relative overflow-hidden"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <img
                                        src={product.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'}
                                        alt={`${product.marca} ${product.model}`}
                                        className="aspect-[4/3] w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* Badge categoria */}
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm bg-amber-500/80">
                                            {product.categoria === 'lux' ? '✨ Luxe' :
                                                product.categoria === 'esportiu' ? '⚡ Esportiu' :
                                                    product.categoria === 'digital' ? '🔢 Digital' :
                                                        product.categoria === 'analògic' ? '⏱️ Analògic' :
                                                            product.categoria === 'intel·ligent' ? '🧠 Smart' : product.categoria}
                                        </span>
                                    </div>

                                    {/* Stock badge */}
                                    {product.stock <= 3 && product.stock > 0 && (
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-red-300 backdrop-blur-sm bg-red-500/30 border border-red-500/30">
                                                Últimes {product.stock} unitats!
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                                            Veure detalls
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    <p className="text-xs text-amber-500/70 font-medium tracking-wider uppercase mb-1">{product.marca}</p>
                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{product.model}</h3>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.descripcio}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                                        <p className="text-2xl font-bold text-amber-400">€{product.preu?.toLocaleString()}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="btn-primary rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/50 transition-all flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="relative z-10">Afegir</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de detall del producte */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedProduct(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

                    {/* Modal content */}
                    <div
                        className="relative glass-effect rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Imatge */}
                            <div className="relative">
                                <img
                                    src={selectedProduct.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'}
                                    alt={`${selectedProduct.marca} ${selectedProduct.model}`}
                                    className="w-full h-full object-cover aspect-square"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm bg-amber-500/80">
                                        {selectedProduct.categoria === 'lux' ? '✨ Luxe' :
                                            selectedProduct.categoria === 'esportiu' ? '⚡ Esportiu' :
                                                selectedProduct.categoria === 'digital' ? '🔢 Digital' :
                                                    selectedProduct.categoria === 'analògic' ? '⏱️ Analògic' :
                                                        selectedProduct.categoria === 'intel·ligent' ? '🧠 Smart' : selectedProduct.categoria}
                                    </span>
                                </div>
                            </div>

                            {/* Detalls */}
                            <div className="p-8 flex flex-col">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-gray-400 ml-2">(5.0)</span>
                                </div>

                                <p className="text-amber-500 text-sm font-medium tracking-wider uppercase mb-1">{selectedProduct.marca}</p>
                                <h2 className="text-3xl font-bold text-white mb-4">{selectedProduct.model}</h2>

                                <p className="text-gray-400 leading-relaxed mb-6 flex-1">
                                    {selectedProduct.descripcio || 'Un rellotge d\'excepcional qualitat i disseny únic.'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                                        <span className="text-gray-500 text-sm">Categoria</span>
                                        <span className="text-white text-sm font-medium capitalize">{selectedProduct.categoria}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                                        <span className="text-gray-500 text-sm">Stock</span>
                                        <span className={`text-sm font-medium ${selectedProduct.stock > 5 ? 'text-green-400' : selectedProduct.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {selectedProduct.stock > 0 ? `${selectedProduct.stock} disponibles` : 'Esgotat'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-4xl font-bold text-amber-400">€{selectedProduct.preu?.toLocaleString()}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock === 0}
                                    className="btn-primary w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="relative z-10">Afegir al Carrito</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-black border-t border-gray-900">
                <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                            </svg>
                            <div className="flex flex-col">
                                <span className="logo-text text-lg font-bold text-white tracking-wider">ALTA</span>
                                <span className="text-[10px] text-amber-500 tracking-[0.3em] -mt-1 font-light">TEMPUS</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            &copy; 2024 Pau Ros. Tots els drets reservats.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
