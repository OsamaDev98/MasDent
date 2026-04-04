import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import WhyChooseUs from '@/components/WhyChooseUs';
import Team from '@/components/Team';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import AppointmentForm from '@/components/AppointmentForm';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhyChooseUs />
        <Team />
        <Gallery />
        <Testimonials />
        <AppointmentForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
