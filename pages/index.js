import dynamic from 'next/dynamic';

// Completely disable SSR for the entire homepage
const HomePage = dynamic(() => import('../components/HomePage'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/images/center-logo-shield.png" alt="Loading..." width="100" height="85" />
        <div style={{ marginTop: '20px' }}>Loading...</div>
      </div>
    </div>
  )
});

export default function Home() {
  return <HomePage />;
}