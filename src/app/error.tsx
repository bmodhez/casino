'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white font-bold text-xl">!</span>
            </div>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Something Went Wrong
        </h1>
        
        {/* Error Message */}
        <p className="text-lg text-slate-400 mb-2">
          We encountered an unexpected error. Don't worry, your data is safe!
        </p>
        
        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left max-w-xl mx-auto">
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all hover:scale-105">
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 mb-2">
            If this problem persists, please contact support
          </p>
          <p className="text-xs text-slate-600">
            Error ID: {error.digest || 'N/A'}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-10">💥</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10">⚠️</div>
      </div>
    </div>
  );
}
