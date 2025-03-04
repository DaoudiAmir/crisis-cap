import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/HomePage'); 
  }, [router]);

  return null; 
};

export default HomePage;
