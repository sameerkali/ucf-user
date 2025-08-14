import { useState, useEffect } from 'react';

export const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loading for 2.5 seconds

    // Cleanup
    return () => clearTimeout(loadingTimer);
  }, []);

  return isLoading;
};
