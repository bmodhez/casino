'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface AuthTooltipProps {
  show: boolean;
  position?: 'top' | 'bottom';
}

export function AuthTooltip({ show, position = 'top' }: AuthTooltipProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className={`absolute ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 z-50 pointer-events-none`}
        >
          <div className="relative">
            {/* Arrow */}
            <div className={`absolute ${position === 'top' ? '-bottom-2' : '-top-2'} left-1/2 -translate-x-1/2 w-4 h-4 rotate-45`}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.98) 0%, rgba(124, 58, 237, 0.98) 100%)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                borderRight: position === 'top' ? 'none' : '1px solid rgba(167, 139, 250, 0.4)',
                borderTop: position === 'top' ? 'none' : '1px solid rgba(167, 139, 250, 0.4)',
                borderBottom: position === 'top' ? '1px solid rgba(167, 139, 250, 0.4)' : 'none',
                borderLeft: position === 'top' ? '1px solid rgba(167, 139, 250, 0.4)' : 'none',
              }}
            />
            
            {/* Tooltip content */}
            <div className="relative px-5 py-3.5 rounded-xl min-w-[280px] max-w-[320px]"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.98) 0%, rgba(124, 58, 237, 0.98) 100%)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                boxShadow: '0 12px 48px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm mb-1.5 leading-tight">
                    Authentication Required
                  </div>
                  <div className="text-purple-100 text-xs leading-relaxed">
                    Please sign in or create an account to start playing and save your progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
