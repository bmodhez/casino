'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, UserPlus, LogIn, Sparkles, Trophy, Coins, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  demoMode?: boolean;
  onContinueDemo?: () => void;
}

export function AuthModal({ isOpen, onClose, title, description }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-[100] cursor-pointer"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            style={{ 
              background: 'rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-md pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ 
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-purple-500/5 to-transparent blur-3xl -z-10" />
              
              <div className="relative overflow-hidden rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 27, 46, 0.98) 0%, rgba(12, 17, 32, 0.98) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(40px)'
                }}
              >
                {/* Animated gradient background */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-500/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

                {/* Close button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-slate-400 hover:text-white border border-white/10 hover:border-white/20 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative z-10 p-8 text-center">
                  {/* Logo or Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                    className="mb-6"
                  >
                    <div className="relative inline-block">
                      {/* Animated rings */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'conic-gradient(from 0deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.3), rgba(139, 92, 246, 0.3))',
                          filter: 'blur(20px)',
                          transform: 'scale(1.5)'
                        }}
                      />
                      
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center backdrop-blur-xl">
                        <Lock className="w-9 h-9 text-purple-300" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl font-black text-white mb-3 tracking-tight"
                  >
                    {title || '🎮 Join the Game'}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-base mb-8 leading-relaxed"
                  >
                    {description || 'Sign up to save your progress, compete on leaderboards, and unlock exclusive rewards!'}
                  </motion.p>

                  {/* Benefits Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-2 gap-3 mb-8"
                  >
                    {[
                      { icon: Coins, text: '1,000 Free Coins', color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-600/5' },
                      { icon: Trophy, text: 'Leaderboards', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5' },
                      { icon: TrendingUp, text: 'Track Stats', color: 'text-cyan-400', bg: 'from-cyan-500/10 to-cyan-600/5' },
                      { icon: Shield, text: '100% Secure', color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-600/5' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 300 }}
                        className={`relative overflow-hidden rounded-xl p-3 bg-gradient-to-br ${item.bg} border border-white/5 backdrop-blur-sm`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="text-xs font-semibold text-slate-300 text-center leading-tight">{item.text}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-3"
                  >
                    <Link href="/auth/register" className="block">
                      <button className="relative group w-full py-3.5 rounded-xl font-bold text-base overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.5)',
                          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        
                        <span className="relative flex items-center justify-center gap-2.5 text-white">
                          <UserPlus className="w-5 h-5" />
                          Create Free Account
                          <Sparkles className="w-4 h-4 opacity-70" />
                        </span>
                      </button>
                    </Link>

                    <Link href="/auth/login" className="block">
                      <button className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'rgb(226, 232, 240)'
                        }}
                      >
                        <span className="flex items-center justify-center gap-2.5">
                          <LogIn className="w-4 h-4" />
                          I Have an Account
                        </span>
                      </button>
                    </Link>
                  </motion.div>

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-6 flex items-center justify-center gap-2 text-xs"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-500">No real money • 100% free to play</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
