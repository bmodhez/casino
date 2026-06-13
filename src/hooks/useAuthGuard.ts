'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useAuthGuard() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const requireAuth = useCallback((): boolean => {
    if (isAuthenticated) return true;
    setShowModal(true);
    return false;
  }, [isAuthenticated]);

  return {
    requireAuth,
    showModal,
    setShowModal,
    isAuthenticated,
    isLoading: status === 'loading',
  };
}
