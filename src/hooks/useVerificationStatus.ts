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

        // Parse userData as array or single object fallback
        let userArray: User[] = [];
        try {
          const parsed = JSON.parse(userData);
          if (Array.isArray(parsed)) {
            userArray = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            // If somehow single object stored, wrap it in array
            userArray = [parsed];
          }
        } catch {
          // If parsing fails, treat as no user
          setIsPending(false);
          return;
        }

        const user = userArray[0];
        if (!user) {
          setIsPending(false);
          return;
        }

        setIsPending(user.profileStatus !== 'completed');
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsPending(false);
      }
    };

    checkVerificationStatus();

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === 'user') {
        checkVerificationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isPending;
}
