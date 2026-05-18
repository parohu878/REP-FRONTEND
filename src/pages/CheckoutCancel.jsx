import { Link } from 'react-router-dom'

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        h1 { font-family: 'Playfair Display', serif; }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-10deg); }
          40% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }

        .icon-wrap { animation: scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .shake-icon { animation: shake 0.6s 0.5s ease-out forwards; }
        .content-wrap { opacity: 0; animation: fadeInUp 0.5s 0.5s ease-out forwards; }

        .glass-card {
          background: rgba(17,24,39,0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .cancel-glow {
          box-shadow: 0 0 60px rgba(239,68,68,0.1), 0 0 120px rgba(239,68,68,0.04);
        }
        .btn-primary { transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(245,158,11,0.4); }
        .btn-secondary { transition: all 0.3s ease; }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); }
      `}</style>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative glass-card cancel-glow rounded-3xl p-10 sm:p-14 max-w-lg w-full text-center">
        {/* Cancel icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="icon-wrap shake-icon w-24 h-24 rounded-full bg-gradient-to-br from-red-400/20 to-red-600/20 flex items-center justify-center border-2 border-red-400/30">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <div className="content-wrap">
          <span className="inline-block text-xs font-semibold tracking-widest text-red-400 uppercase mb-3 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
            Pagament cancel·lat
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pagament <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500">cancel·lat</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-2">
            No s'ha realitzat cap càrrec al teu compte.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Els teus articles segueixen al carrit. Pots intentar el pagament de nou o continuar comprant.
          </p>

          {/* Info box */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-200/70">
                El teu carrit s'ha conservat. Pots tornar a intentar el pagament en qualsevol moment.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/checkout"
              id="btn-retry-checkout"
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tornar a intentar
            </Link>
            <Link
              to="/cart"
              id="btn-back-to-cart"
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-300 hover:text-white font-semibold px-6 py-3.5 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Veure carrit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
