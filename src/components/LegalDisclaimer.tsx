'use client';

import { AlertCircle } from 'lucide-react';

export function LegalDisclaimer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-amber-500/20 to-transparent border-t border-amber-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-amber-200 leading-relaxed">
              <strong className="font-bold">FOR ENTERTAINMENT ONLY:</strong> MinesArena is a free social gaming platform for entertainment purposes only. 
              Virtual coins have <strong>NO MONETARY VALUE</strong> and cannot be exchanged for real money or prizes. 
              No real money gambling is involved. Must be 18+ to play. Play responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
