'use client';

import { useEffect } from 'react';
import { Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#0a0a0f',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff'
      }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
              opacity: 0.5
            }}>
              ⚠️
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              Critical Error
            </h1>

            {/* Message */}
            <p style={{
              fontSize: '18px',
              color: '#94a3b8',
              marginBottom: '32px'
            }}>
              The application encountered a critical error and needs to restart.
            </p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={reset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                <RefreshCw size={20} />
                Restart Application
              </button>

              <a
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#475569',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Home size={20} />
                Go Home
              </a>
            </div>

            {/* Error Details */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{
                marginTop: '32px',
                padding: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#f87171',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  margin: 0
                }}>
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
