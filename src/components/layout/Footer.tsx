import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-auto w-full pb-20 md:pb-0">
      <div className="w-full px-4 py-6 md:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/arenalogo.png" 
                alt="MinesArena Logo" 
                className="w-8 h-8"
              />
              <span className="font-bold text-lg text-white">MinesArena</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Free casino simulator 2026. Play virtual casino games with provably fair mechanics.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/bhavinmodhh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg hover:bg-pink-500/10 border border-transparent hover:border-pink-500/30 flex items-center justify-center transition-all"
              >
                <img 
                  src="/myinsta.png" 
                  alt="Instagram" 
                  className="w-5 h-5 object-contain"
                />
              </a>
            </div>
          </div>

          {/* Games Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Games</h3>
            <ul className="space-y-2">
              {[
                { name: 'Mines', href: '/games/mines' },
                { name: 'Dice', href: '/games/dice' },
                { name: 'Coinflip', href: '/games/coinflip' },
                { name: 'Plinko', href: '/games/plinko' },
              ].map((game) => (
                <li key={game.href}>
                  <Link 
                    href={game.href}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/leaderboard"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  How to Play
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Provably Fair
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy-policy"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/responsible-gaming"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-6 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            {/* Copyright */}
            <div className="text-xs md:text-sm text-slate-400 text-center md:text-left">
              © {currentYear} MinesArena. All rights reserved.
            </div>

            {/* Made with Love */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for gamers</span>
            </div>

            {/* Keywords for SEO - hidden on very small screens */}
            <div className="hidden sm:block text-xs text-slate-600 text-center md:text-right">
              Casino Simulator • Virtual Casino • Stake Alternative
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
