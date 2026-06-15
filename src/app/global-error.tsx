'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring (in production, send to logging service)
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#0c101a',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px' }}>
          <div style={{ 
            marginBottom: '2rem',
            fontSize: '4rem'
          }}>
            ⚠️
          </div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Oops! Something went wrong
          </h1>
          
          <p style={{ 
            color: '#94a3b8',
            marginBottom: '2rem',
            fontSize: '1.1rem'
          }}>
            We're experiencing a temporary issue. Your data is safe!
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🔄</span> Try Again
            </button>

            <a 
              href="/dashboard"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#475569',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🏠</span> Back to Home
            </a>
          </div>

          <div style={{ 
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <p>If this problem continues, please refresh the page</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Error ID: {error.digest || 'Unknown'}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
