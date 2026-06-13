import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl md:text-8xl opacity-20">🎲</div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
          Oops! Looks like this page got lost in the casino. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </Link>

          <Link href="/games/mines">
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
              <Search className="w-5 h-5" />
              Play Games
            </button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: 'Mines', href: '/games/mines' },
              { name: 'Dice', href: '/games/dice' },
              { name: 'Coinflip', href: '/games/coinflip' },
              { name: 'Plinko', href: '/games/plinko' },
              { name: 'Leaderboard', href: '/leaderboard' },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="text-sm text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-bounce">🎰</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>🃏</div>
      </div>
    </div>
  );
}
