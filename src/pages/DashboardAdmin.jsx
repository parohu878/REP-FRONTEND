import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const API_URL = 'http://localhost:4000/api'

const authFetch = (url, opts = {}) => {
  const token = localStorage.getItem('accessToken')
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
  })
}

const ESTAT_COLORS = {
  'pendent': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'en procés': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'enviada': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'completada': 'bg-green-500/20 text-green-300 border-green-500/40',
  'cancel·lada': 'bg-red-500/20 text-red-300 border-red-500/40',
  'pagat': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
}

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#9ca3af' } } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
}

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('resum')
  const [stats, setStats] = useState(null)
  const [usuaris, setUsuaris] = useState([])
  const [comandes, setComandes] = useState([])
  const [productes, setProductes] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [searchUser, setSearchUser] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({
    marca: '', model: '', descripcio: '', categoria: 'lux', preu: '', stock: '', imatge_url: ''
  })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rStats, rUsuaris, rComandes, rProductes] = await Promise.all([
        authFetch(`${API_URL}/dashboard/admin/stats`),
        authFetch(`${API_URL}/dashboard/admin/usuaris`),
        authFetch(`${API_URL}/dashboard/admin/comandes`),
        fetch(`${API_URL}/productes`)
      ])
      if (rStats.status === 401) { navigate('/login'); return }
      if (rStats.status === 403) { navigate('/'); return }
      const [dStats, dUsuaris, dComandes, dProductes] = await Promise.all([
        rStats.json(), rUsuaris.json(), rComandes.json(), rProductes.json()
      ])
      setStats(dStats)
      setUsuaris(Array.isArray(dUsuaris) ? dUsuaris : [])
      setComandes(Array.isArray(dComandes) ? dComandes : [])
      setProductes(Array.isArray(dProductes) ? dProductes : [])
    } catch { showMsg('Error carregant dades', 'error') }
    finally { setLoading(false) }
  }

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3500)
  }

  const handleChangeRol = async (userId, newRol) => {
    setUpdatingId(userId)
    try {
      const r = await authFetch(`${API_URL}/dashboard/admin/usuaris/${userId}/rol`, {
        method: 'PUT', body: JSON.stringify({ rol: newRol })
      })
      if (!r.ok) throw new Error()
      setUsuaris(prev => prev.map(u => u._id === userId ? { ...u, rol: newRol } : u))
      showMsg('Rol actualitzat correctament')
    } catch { showMsg('Error canviant rol', 'error') }
    finally { setUpdatingId(null) }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Segur que vols eliminar aquest usuari?')) return
    setUpdatingId(userId)
    try {
      const r = await authFetch(`${API_URL}/dashboard/admin/usuaris/${userId}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setUsuaris(prev => prev.filter(u => u._id !== userId))
      showMsg('Usuari eliminat')
    } catch { showMsg('Error eliminant usuari', 'error') }
    finally { setUpdatingId(null) }
  }

  const handleChangeEstat = async (comandaId, estat) => {
    setUpdatingId(comandaId)
    try {
      const r = await authFetch(`${API_URL}/dashboard/admin/comandes/${comandaId}/estat`, {
        method: 'PUT', body: JSON.stringify({ estat })
      })
      if (!r.ok) throw new Error()
      setComandes(prev => prev.map(c => c._id === comandaId ? { ...c, estat } : c))
      showMsg('Estat actualitzat')
    } catch { showMsg('Error actualitzant estat', 'error') }
    finally { setUpdatingId(null) }
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setUpdatingId('product')
    try {
      const url = productForm._id ? `${API_URL}/productes/${productForm._id}` : `${API_URL}/productes`
      const method = productForm._id ? 'PUT' : 'POST'
      const r = await authFetch(url, { method, body: JSON.stringify(productForm) })
      if (!r.ok) throw new Error()
      
      showMsg(`Producte ${productForm._id ? 'actualitzat' : 'creat'} correctament`)
      setShowProductForm(false)
      loadAll() // Recarregar per actualitzar estadístiques i llistes
    } catch { showMsg('Error guardant producte', 'error') }
    finally { setUpdatingId(null) }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Segur que vols eliminar aquest rellotge?')) return
    try {
      const r = await authFetch(`${API_URL}/productes/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setProductes(prev => prev.filter(p => p._id !== id))
      showMsg('Producte eliminat')
    } catch { showMsg('Error eliminant producte', 'error') }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      })
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('usuari')
    navigate('/login')
  }

  // Chart data
  const barData = {
    labels: stats?.vendesPerMes?.map(v => v.mes) || [],
    datasets: [
      {
        label: 'Comandes',
        data: stats?.vendesPerMes?.map(v => v.comandes) || [],
        backgroundColor: 'rgba(245,158,11,0.7)',
        borderRadius: 6,
      },
    ]
  }

  const lineData = {
    labels: stats?.vendesPerMes?.map(v => v.mes) || [],
    datasets: [
      {
        label: 'Ingressos (€)',
        data: stats?.vendesPerMes?.map(v => v.ingressos) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const perEstat = stats?.perEstat || {}
  const doughnutData = {
    labels: Object.keys(perEstat),
    datasets: [{
      data: Object.values(perEstat),
      backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444','#059669'],
      borderWidth: 0,
    }]
  }

  const filteredUsers = usuaris.filter(u =>
    `${u.nom} ${u.cognoms} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  )
  const filteredOrders = comandes.filter(c =>
    `${c.usuari?.nom} ${c.usuari?.email} ${c._id}`.toLowerCase().includes(searchOrder.toLowerCase())
  )
  const filteredProducts = productes.filter(p => 
    `${p.marca} ${p.model} ${p.categoria}`.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const tabs = [
    { id: 'resum', label: 'Resum & Gràfics', icon: '📊' },
    { id: 'productes', label: 'Rellotges', icon: '⌚' },
    { id: 'usuaris', label: 'Usuaris', icon: '👥' },
    { id: 'comandes', label: 'Comandes', icon: '📦' },
  ]

  const kpis = stats ? [
    { label: 'Usuaris totals', value: stats.totalUsuaris, icon: '👥', color: 'from-blue-500/20 to-blue-600/10' },
    { label: 'Comandes totals', value: stats.totalComandes, icon: '📦', color: 'from-amber-500/20 to-amber-600/10' },
    { label: 'Productes', value: stats.totalProductes, icon: '⌚', color: 'from-purple-500/20 to-purple-600/10' },
    { label: 'Ingressos totals', value: `€${(stats.ingressosTotals || 0).toLocaleString('ca-ES', { minimumFractionDigits: 2 })}`, icon: '💶', color: 'from-emerald-500/20 to-emerald-600/10' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-family:'Outfit',sans-serif; }
        h1,h2,h3 { font-family:'Playfair Display',serif; }
        .glass { background:rgba(17,24,39,0.75); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.08); }
        .stat-card { transition:transform .3s,box-shadow .3s; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(245,158,11,.12); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        .fade-in { animation:fadeIn .35s ease forwards; }
        select option { background:#1f2937; color:#fff; }
      `}</style>

      {msg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium fade-in ${msg.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
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
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
              👑 Administrador
            </span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white bg-gray-800/60 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sortir
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-white">Panel d'Administració</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona usuaris, comandes i visualitza estadístiques del negoci</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${tab === t.id ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600/50 shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white bg-gray-800/50 border-gray-700/50 hover:border-gray-600'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* ── RESUM & GRÀFICS ── */}
            {tab === 'resum' && (
              <div className="fade-in space-y-8">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map(k => (
                    <div key={k.label} className={`stat-card glass rounded-2xl p-5 bg-gradient-to-br ${k.color}`}>
                      <div className="text-3xl mb-3">{k.icon}</div>
                      <p className="text-2xl font-bold text-white">{k.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{k.label}</p>
                    </div>
                  ))}
                </div>

                {/* Gràfics */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Comandes per mes (últims 6 mesos)</h3>
                    <Bar data={barData} options={CHART_OPTS}/>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Ingressos mensuals (€)</h3>
                    <Line data={lineData} options={CHART_OPTS}/>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Comandes per estat</h3>
                    <div className="flex items-center justify-center" style={{maxHeight:260}}>
                      <Doughnut data={doughnutData} options={{ responsive:true, plugins:{ legend:{ position:'right', labels:{ color:'#9ca3af' }}}}}/>
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Resumràpid</h3>
                    <div className="space-y-3">
                      {Object.entries(perEstat).map(([estat, count]) => (
                        <div key={estat} className="flex items-center justify-between">
                          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${ESTAT_COLORS[estat] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>{estat}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{width:`${stats.totalComandes ? (count/stats.totalComandes)*100 : 0}%`}}/>
                            </div>
                            <span className="text-sm font-medium text-white w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── USUARIS ── */}
            {tab === 'usuaris' && (
              <div className="fade-in space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-white">Gestió d'usuaris <span className="text-lg text-gray-400 font-normal">({usuaris.length})</span></h2>
                  <input value={searchUser} onChange={e => setSearchUser(e.target.value)}
                    placeholder="Cercar per nom o email…"
                    className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors w-64"/>
                </div>
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Usuari</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Email</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Rol</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Data registre</th>
                          <th className="px-5 py-3.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/3 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                                  {u.nom?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-white font-medium">{u.nom} {u.cognoms}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-400">{u.email}</td>
                            <td className="px-5 py-4">
                              <select value={u.rol}
                                onChange={e => handleChangeRol(u._id, e.target.value)}
                                disabled={updatingId === u._id}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                                <option value="client">👤 Client</option>
                                <option value="admin">👑 Admin</option>
                              </select>
                            </td>
                            <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('ca-ES')}</td>
                            <td className="px-5 py-4 text-right">
                              <button onClick={() => handleDeleteUser(u._id)} disabled={updatingId === u._id}
                                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                                title="Eliminar usuari">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">Cap usuari trobat</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTES (RELLOTGES) ── */}
            {tab === 'productes' && (
              <div className="fade-in space-y-4">
                {showProductForm ? (
                  <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">{productForm._id ? 'Editar Rellotge' : 'Afegir Nou Rellotge'}</h2>
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Marca</label>
                          <input required value={productForm.marca} onChange={e => setProductForm({...productForm, marca: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Model</label>
                          <input required value={productForm.model} onChange={e => setProductForm({...productForm, model: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-400 mb-1">Descripció</label>
                          <textarea value={productForm.descripcio} onChange={e => setProductForm({...productForm, descripcio: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500 h-24" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                          <select required value={productForm.categoria} onChange={e => setProductForm({...productForm, categoria: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500">
                            <option value="digital">Digital</option>
                            <option value="analògic">Analògic</option>
                            <option value="intel·ligent">Intel·ligent</option>
                            <option value="lux">Lux</option>
                            <option value="esportiu">Esportiu</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Preu (€)</label>
                          <input type="number" step="0.01" required value={productForm.preu} onChange={e => setProductForm({...productForm, preu: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Stock</label>
                          <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">URL Imatge</label>
                          <input type="url" value={productForm.imatge_url} onChange={e => setProductForm({...productForm, imatge_url: e.target.value})} className="w-full rounded-xl bg-gray-800/70 border border-gray-700 text-white px-4 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={updatingId === 'product'} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                          {updatingId === 'product' ? 'Guardant...' : 'Guardar Rellotge'}
                        </button>
                        <button type="button" onClick={() => setShowProductForm(false)} className="px-6 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors">
                          Cancel·lar
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h2 className="text-2xl font-bold text-white">Catàleg de Rellotges <span className="text-lg text-gray-400 font-normal">({productes.length})</span></h2>
                      <div className="flex items-center gap-3">
                        <input value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
                          placeholder="Cercar marca o model…"
                          className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors w-64"/>
                        <button onClick={() => { setProductForm({ marca: '', model: '', descripcio: '', categoria: 'lux', preu: '', stock: '', imatge_url: '' }); setShowProductForm(true); }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                          Nou Rellotge
                        </button>
                      </div>
                    </div>
                    <div className="glass rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Producte</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Categoria</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Preu</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Stock</th>
                              <th className="px-5 py-3.5"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map(p => (
                              <tr key={p._id} className="border-b border-gray-800/50 hover:bg-white/3 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={p.imatge_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=80&q=60'} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-700"/>
                                    <div>
                                      <span className="text-white font-medium block">{p.marca} {p.model}</span>
                                      <span className="text-gray-500 text-xs">#{p._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 capitalize">{p.categoria}</span></td>
                                <td className="px-5 py-4 text-amber-400 font-semibold">€{p.preu?.toLocaleString()}</td>
                                <td className="px-5 py-4">
                                  <span className={`font-medium ${p.stock > 10 ? 'text-green-400' : p.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{p.stock} u.</span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setProductForm(p); setShowProductForm(true); }} className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Editar">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">Cap producte trobat</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── COMANDES ── */}
            {tab === 'comandes' && (
              <div className="fade-in space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-white">Gestió de comandes <span className="text-lg text-gray-400 font-normal">({comandes.length})</span></h2>
                  <input value={searchOrder} onChange={e => setSearchOrder(e.target.value)}
                    placeholder="Cercar per client o ID…"
                    className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors w-64"/>
                </div>
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">ID Comanda</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Client</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Total</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Data</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Estat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(c => (
                          <tr key={c._id} className="border-b border-gray-800/50 hover:bg-white/3 transition-colors">
                            <td className="px-5 py-4 font-mono text-amber-400 text-xs">#{c._id.slice(-8).toUpperCase()}</td>
                            <td className="px-5 py-4">
                              <p className="text-white font-medium">{c.usuari?.nom} {c.usuari?.cognoms}</p>
                              <p className="text-gray-500 text-xs">{c.usuari?.email}</p>
                            </td>
                            <td className="px-5 py-4 text-white font-semibold">€{c.preu_total?.toLocaleString()}</td>
                            <td className="px-5 py-4 text-gray-400 text-xs">{new Date(c.data_creacio || c.createdAt).toLocaleDateString('ca-ES')}</td>
                            <td className="px-5 py-4">
                              <select value={c.estat}
                                onChange={e => handleChangeEstat(c._id, e.target.value)}
                                disabled={updatingId === c._id}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                                {['pendent','en procés','enviada','completada','cancel·lada','pagat'].map(e => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">Cap comanda trobada</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
