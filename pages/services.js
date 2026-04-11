import dynamic from 'next/dynamic';

const ServicesPage = dynamic(() => import('../components/ServicesPage'), {
  ssr: false
});

export default function Services() {
  return <ServicesPage />;
}