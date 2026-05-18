import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = 'http://localhost:4000/api'

// Helper: fer peticions autenticades amb el token JWT
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken')
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  })
}

const ESTAT_COLORS = {
  'pendent':     'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'en procés':   'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'enviada':     'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'completada':  'bg-green-500/20 text-green-300 border-green-500/40',
  'cancel·lada': 'bg-red-500/20 text-red-300 border-red-500/40',
  'pagat':       'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
}

export default function DashboardUser() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('resum')
  const [perfil, setPerfil] = useState(null)
  const [comandes, setComandes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formPerfil, setFormPerfil] = useState({})
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [msg, setMsg] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  const usuari = (() => {
    try { return JSON.parse(localStorage.getItem('usuari')) } catch { return null }
  })()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [rPerfil, rComandes, rStats] = await Promise.all([
          authFetch(`${API_URL}/dashboard/perfil`),
          authFetch(`${API_URL}/dashboard/comandes`),
          authFetch(`${API_URL}/dashboard/stats`)
        ])
        if (rPerfil.status === 401) { navigate('/login'); return }
        const [dPerfil, dComandes, dStats] = await Promise.all([
          rPerfil.json(), rComandes.json(), rStats.json()
        ])
        setPerfil(dPerfil)
        setFormPerfil({ nom: dPerfil.nom, cognoms: dPerfil.cognoms, email: dPerfil.email, adreca: dPerfil.adreca })
        setComandes(Array.isArray(dComandes) ? dComandes : [])
        setStats(dStats)
      } catch (e) {
        showMsg('Error carregant dades', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  const handleSavePerfil = async (e) => {
    e.preventDefault()
    setSavingPerfil(true)
    try {
      const r = await authFetch(`${API_URL}/dashboard/perfil`, {
        method: 'PUT',
        body: JSON.stringify(formPerfil)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      setPerfil(d)
      localStorage.setItem('usuari', JSON.stringify({ ...usuari, nom: d.nom, cognoms: d.cognoms, email: d.email }))
      setEditMode(false)
      showMsg('Perfil actualitzat correctament ✓')
    } catch (err) {
      showMsg(err.message || 'Error actualitzant perfil', 'error')
    } finally {
      setSavingPerfil(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      })
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('usuari')
    navigate('/login')
  }

  const tabs = [
    { id: 'resum', label: 'Resum', icon: '📊' },
    { id: 'comandes', label: 'Les meves compres', icon: '🛍️' },
    { id: 'perfil', label: 'El meu perfil', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        h1,h2,h3 { font-family: 'Playfair Display', serif; }
        .glass { background: rgba(17,24,39,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
        .tab-active { background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
        .stat-card { transition: transform .3s ease, box-shadow .3s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(245,158,11,.15); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn .4s ease forwards; }
      `}</style>

      {/* Notificació */}
      {msg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 fade-in ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {msg.type === 'error' ? '✗' : '✓'} {msg.text}
        </div>
      )}

      {/* Navbar */}
      <header className="glass sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <svg className="h-9 w-9 text-amber-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={1.5}/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2"/>
            </svg>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-white tracking-wider" style={{fontFamily:'Playfair Display,serif'}}>ALTA</span>
              <span className="text-[10px] text-amber-500 tracking-[.3em] font-light">TEMPUS</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">Dashboard Client</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white bg-gray-800/60 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sortir
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Capçalera */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/30">
              {perfil?.nom?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{loading ? 'Carregant...' : `Hola, ${perfil?.nom}!`}</h1>
              <p className="text-gray-400 text-sm mt-1">Benvingut al teu espai personal · <span className="text-amber-400">Client</span></p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${tab === t.id ? 'tab-active border-amber-600/50 shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white bg-gray-800/50 border-gray-700/50 hover:border-gray-600'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* ── RESUM ── */}
            {tab === 'resum' && (
              <div className="fade-in space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total compres', value: stats?.totalComandes ?? 0, icon: '🛍️', color: 'from-amber-500/20 to-amber-600/10' },
                    { label: 'Total gastat', value: `€${(stats?.totalGastat ?? 0).toLocaleString('ca-ES', {minimumFractionDigits:2})}`, icon: '💶', color: 'from-emerald-500/20 to-emerald-600/10' },
                    { label: 'Compres pagades', value: stats?.comandesPagades ?? 0, icon: '✅', color: 'from-blue-500/20 to-blue-600/10' },
                    { label: 'Última compra', value: stats?.ultimaCompra ? new Date(stats.ultimaCompra).toLocaleDateString('ca-ES') : '—', icon: '📅', color: 'from-purple-500/20 to-purple-600/10' },
                  ].map(s => (
                    <div key={s.label} className={`stat-card glass rounded-2xl p-5 bg-gradient-to-br ${s.color}`}>
                      <div className="text-3xl mb-3">{s.icon}</div>
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Últimes compres */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Últimes compres</h2>
                  {comandes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Encara no has fet cap compra</p>
                  ) : (
                    <div className="space-y-3">
                      {comandes.slice(0, 3).map(c => (
                        <div key={c._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                          <div>
                            <p className="text-sm font-medium text-white">Comanda #{c._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(c.data_creacio).toLocaleDateString('ca-ES')}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${ESTAT_COLORS[c.estat] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>{c.estat}</span>
                            <span className="text-amber-400 font-bold">€{c.preu_total?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {comandes.length > 3 && (
                    <button onClick={() => setTab('comandes')} className="mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                      Veure totes les compres →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── COMPRES ── */}
            {tab === 'comandes' && (
              <div className="fade-in space-y-4">
                <h2 className="text-2xl font-bold text-white">Les meves compres</h2>
                {comandes.length === 0 ? (
                  <div className="glass rounded-2xl p-16 text-center">
                    <p className="text-5xl mb-4">🛍️</p>
                    <p className="text-gray-400">Encara no has fet cap compra</p>
                    <Link to="/cataleg" className="mt-4 inline-block px-6 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors">Explorar catàleg</Link>
                  </div>
                ) : (
                  comandes.map(c => (
                    <div key={c._id} className="glass rounded-2xl overflow-hidden">
                      <button onClick={() => setExpandedOrder(expandedOrder === c._id ? null : c._id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                            #{c._id.slice(-4).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{new Date(c.data_creacio).toLocaleDateString('ca-ES', {day:'2-digit',month:'long',year:'numeric'})}</p>
                            <p className="text-xs text-gray-400">{c.rellotges?.length || 0} producte(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${ESTAT_COLORS[c.estat] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>{c.estat}</span>
                          <span className="text-amber-400 font-bold text-lg">€{c.preu_total?.toLocaleString()}</span>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === c._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </button>
                      {expandedOrder === c._id && (
                        <div className="border-t border-gray-700/50 p-5 space-y-3 bg-gray-900/40">
                          {c.rellotges?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50">
                              <img src={item.rellotge?.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=80&q=60'} alt="" className="w-14 h-14 object-cover rounded-lg"/>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{item.rellotge?.marca} {item.rellotge?.model}</p>
                                <p className="text-xs text-gray-400">Quantitat: {item.quantitat}</p>
                              </div>
                              <p className="text-amber-400 font-semibold">€{item.rellotge?.preu?.toLocaleString()}</p>
                            </div>
                          ))}
                          {c.dadesEnviament?.nom && (
                            <div className="mt-3 p-3 rounded-xl bg-gray-800/30 text-xs text-gray-400">
                              <p className="font-medium text-gray-300 mb-1">Enviament a:</p>
                              <p>{c.dadesEnviament.nom} · {c.dadesEnviament.adreca}, {c.dadesEnviament.ciutat} {c.dadesEnviament.codiPostal}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── PERFIL ── */}
            {tab === 'perfil' && (
              <div className="fade-in max-w-2xl">
                <div className="glass rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">El meu perfil</h2>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all">
                        Editar
                      </button>
                    )}
                  </div>
                  {editMode ? (
                    <form onSubmit={handleSavePerfil} className="space-y-4">
                      {[
                        { id: 'nom', label: 'Nom', type: 'text' },
                        { id: 'cognoms', label: 'Cognoms', type: 'text' },
                        { id: 'email', label: 'Correu electrònic', type: 'email' },
                        { id: 'adreca', label: 'Adreça', type: 'text' },
                      ].map(f => (
                        <div key={f.id}>
                          <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
                          <input id={f.id} type={f.type} required value={formPerfil[f.id] || ''}
                            onChange={e => setFormPerfil({...formPerfil, [f.id]: e.target.value})}
                            className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"/>
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={savingPerfil} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                          {savingPerfil ? 'Guardant...' : 'Guardar canvis'}
                        </button>
                        <button type="button" onClick={() => setEditMode(false)} className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors">
                          Cancel·lar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: 'Nom', value: perfil?.nom },
                        { label: 'Cognoms', value: perfil?.cognoms },
                        { label: 'Correu electrònic', value: perfil?.email },
                        { label: 'Adreça', value: perfil?.adreca },
                        { label: 'Rol', value: perfil?.rol === 'admin' ? '👑 Administrador' : '👤 Client' },
                        { label: 'Membre des de', value: perfil?.createdAt ? new Date(perfil.createdAt).toLocaleDateString('ca-ES') : '—' },
                      ].map(f => (
                        <div key={f.label} className="flex justify-between items-center py-3 border-b border-gray-800/60 last:border-0">
                          <span className="text-sm text-gray-400">{f.label}</span>
                          <span className="text-sm font-medium text-white">{f.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
