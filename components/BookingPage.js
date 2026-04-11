import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function BookingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to services page since booking is done through services
    router.push('/services');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: 'white',
      backgroundColor: '#1a1a1a'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Redirecting to Services...</h2>
        <p>You will be redirected to our services page where you can book your appointment.</p>
      </div>
    </div>
  );
}