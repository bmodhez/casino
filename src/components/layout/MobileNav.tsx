'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bomb, Dice5, CircleDot, LayoutDashboard, Triangle, User, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { RewardsModal } from '@/components/rewards/RewardsModal';

const mobileItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mines', href: '/games/mines', icon: Bomb },
  { label: 'Dice', href: '/games/dice', icon: Dice5 },
  { label: 'Coinflip', href: '/games/coinflip', icon: CircleDot },
  { label: 'Plinko', href: '/games/plinko', icon: Triangle },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <RewardsModal isOpen={showRewardsModal} onClose={() => setShowRewardsModal(false)} />
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <div className="w-full flex justify-center px-4 pb-4">
          {/* Glassmorphism pill container */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full shadow-2xl shadow-black/20">
            <div className="flex items-center gap-1 px-3 py-2.5">
              {mobileItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link 
                    key={href} 
                    href={href} 
                    className="relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-full transition-all duration-300"
                  >
                    {/* Active background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-white/[0.1] rounded-full backdrop-blur-sm" />
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <Icon className={`w-5 h-5 transition-all duration-300 ${
                        isActive 
                          ? 'text-purple-400 scale-110' 
                          : 'text-slate-500'
                      }`} />
                    </div>
                    
                    {/* Label - only show for active */}
                    {isActive && (
                      <span className="relative z-10 text-[9px] font-semibold text-purple-400 whitespace-nowrap">
                        {label}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Rewards button - only show when logged in */}
              {session && (
                <button
                  onClick={() => setShowRewardsModal(true)}
                  className="relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-full transition-all duration-300"
                >
                  <div className="relative z-10">
                    <Gift className="w-5 h-5 text-amber-400 transition-all duration-300" />
                  </div>
                </button>
              )}
              
              {/* Profile / Login button */}
              {session ? (
                <Link 
                  href="/profile"
                  className={`relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-full transition-all duration-300 ${
                    pathname === '/profile' ? 'bg-white/[0.1]' : ''
                  }`}
                >
                  <div className="relative z-10">
                    <User className={`w-5 h-5 transition-all duration-300 ${
                      pathname === '/profile'
                        ? 'text-purple-400 scale-110' 
                        : 'text-slate-500'
                    }`} />
                  </div>
                  {pathname === '/profile' && (
                    <span className="relative z-10 text-[9px] font-semibold text-purple-400 whitespace-nowrap">
                      Profile
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-full transition-all duration-300"
                >
                  <div className="relative z-10">
                    <User className="w-5 h-5 text-blue-400 transition-all duration-300" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
