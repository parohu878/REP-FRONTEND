import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function CheckoutSuccess() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    // Netejar el carritoSessionId per al proper shopping
    // El backend ja ha buidat el carrito via webhook
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        h1, h2 { font-family: 'Playfair Display', serif; }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .icon-wrap {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .check-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkDraw 0.6s 0.4s ease-out forwards;
        }
        .ripple-ring {
          animation: ripple 1.5s 0.3s ease-out infinite;
        }
        .content-wrap {
          opacity: 0;
          animation: fadeInUp 0.5s 0.6s ease-out forwards;
        }
        .float-btn {
          animation: float 3s ease-in-out infinite;
        }
        .glass-card {
          background: rgba(17,24,39,0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .success-glow {
          box-shadow: 0 0 60px rgba(16,185,129,0.15), 0 0 120px rgba(16,185,129,0.05);
        }
        .btn-shop {
          transition: all 0.3s ease;
        }
        .btn-shop:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(245,158,11,0.4);
        }
      `}</style>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className={`relative glass-card success-glow rounded-3xl p-10 sm:p-14 max-w-lg w-full text-center transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
        {/* Success icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="ripple-ring absolute w-28 h-28 rounded-full border border-green-400/30" />
          <div className="icon-wrap relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 flex items-center justify-center border-2 border-green-400/40">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
              <path
                className="check-path"
                d="M5 13l4 4L19 7"
                stroke="rgb(52, 211, 153)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="content-wrap">
          <span className="inline-block text-xs font-semibold tracking-widest text-green-400 uppercase mb-3 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            Pagament confirmat
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Gràcies per la<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">teva compra!</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-2">
            El teu pagament s'ha processat correctament.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Rebràs un correu de confirmació en breus moments amb els detalls de la teva comanda.
          </p>

          {/* Details */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-300">Pagament processat per Stripe</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span className="text-sm text-gray-300">Preparant la teva comanda</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-300">Confirmació enviada per correu</span>
            </div>
          </div>

          <Link
            to="/"
            id="btn-back-to-shop"
            className="float-btn inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-xl btn-shop shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Tornar a la botiga
          </Link>
        </div>
      </div>
    </div>
  );
}
