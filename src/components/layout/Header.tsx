'use client';

import { useSession } from 'next-auth/react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';
import { Coins, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();
  const { coins } = useGameStore();
  const [showMenu, setShowMenu] = useState(false);
  const displayUser = session?.user ?? null;

  if (!session) return null;

  // Mask email: show first 2 chars and domain, hide rest with ****
  const maskEmail = (email: string | null | undefined) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.substring(0, 2) + '****';
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="flex items-center gap-4">
      {/* User Profile Dropdown */}
      <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:bg-[var(--accent)] transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {((displayUser as any)?.username || displayUser?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-[var(--foreground)]">
                {(displayUser as any)?.username || displayUser?.name || 'User'}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                {maskEmail(displayUser?.email)}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--muted-foreground)] transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-40 bg-[var(--card)] rounded-lg py-1.5 shadow-xl border border-[var(--border)] z-50"
                >
                  <Link 
                    href="/profile" 
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--accent)] transition-colors text-[var(--foreground)]"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Profile</span>
                  </Link>
                  
                  <div className="border-t border-[var(--border)] my-1" />
                  
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 transition-colors text-red-600 dark:text-red-400 w-full text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
}
