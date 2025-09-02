import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  profileStatus: string;
  role: string;
  // Add other user properties as needed
}

export function useVerificationStatus(): boolean {
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const checkVerificationStatus = (): void => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setIsPending(false);
          return;
        }

        const user: User = JSON.parse(userData);
        setIsPending(user?.profileStatus !== 'completed');
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsPending(false);
      }
    };

    checkVerificationStatus();

    // Listen for localStorage changes to update status dynamically
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === 'user') {
        checkVerificationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isPending;
}
