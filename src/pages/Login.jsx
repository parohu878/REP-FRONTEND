import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const API_URL = 'http://localhost:4000/api';

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    contrasenya: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Guardar tokens i dades de l'usuari al localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('usuari', JSON.stringify(data.usuari));

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }

        .glass-card {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
        }

        .btn-gold {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-gold::before {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transform: translate(-50%,-50%);
          transition: width 0.6s, height 0.6s;
        }
        .btn-gold:hover::before {
          width: 300px; height: 300px;
        }
      `}</style>

      {/* Imatge de fons */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1920&q=80"
          alt="Luxury watches"
          className="h-full w-full object-cover brightness-[0.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-gray-950/60 to-gray-950"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(251, 191, 36, 0.12) 0%, transparent 50%),
                          radial-gradient(circle at 70% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Targeta login */}
      <div className="relative z-10 w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <svg className="h-10 w-10 text-amber-500 transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-wider" style={{fontFamily: 'Playfair Display, serif'}}>ALTA</span>
              <span className="text-xs text-amber-500 tracking-[0.3em] -mt-1 font-light">TEMPUS</span>
            </div>
          </Link>
        </div>

        <div className="glass-card rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Benvingut de nou
          </h2>
          <p className="text-center text-gray-400 mb-8 text-sm">Inicia sessió al teu compte</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Correu */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correu electrònic
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border border-gray-700/50 bg-gray-800/50 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                  placeholder="exemple@correu.com"
                />
              </div>
            </div>

            {/* Contrasenya */}
            <div>
              <label htmlFor="contrasenya" className="block text-sm font-medium text-gray-300 mb-2">
                Contrasenya
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="contrasenya"
                  type="password"
                  required
                  value={formData.contrasenya}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border border-gray-700/50 bg-gray-800/50 pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botó */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 font-semibold text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Iniciant sessió...
                  </>
                ) : 'Iniciar sessió'}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700/50"></div>
            <span className="px-4 text-xs text-gray-500 uppercase tracking-wider">o</span>
            <div className="flex-1 border-t border-gray-700/50"></div>
          </div>

          {/* Enllaç registre */}
          <p className="text-center text-sm text-gray-400">
            Encara no tens compte?{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Registra't aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}