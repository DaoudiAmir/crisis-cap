import '../styles/globals.css'; 
import '../styles/styles.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastProvider from '@/components/ToastProvider';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add loading state for page transitions
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // Initial page load is complete
    setIsLoading(false);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Public pages that don't require authentication
  const isPublicPage = 
    router.pathname === '/LoginPage' || 
    router.pathname === '/SignupPage' || 
    router.pathname === '/';

  return (
    <AuthProvider>
      <ToastProvider>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <Component {...pageProps} />
        )}
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;