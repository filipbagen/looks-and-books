import { BookingProvider } from './context/BookingContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import OpeningHours from './components/sections/OpeningHours';
import HeroSection from './components/sections/HeroSection';
import Slideshow from './components/sections/Slideshow';
import ProductsSection from './components/sections/ProductsSection';
import BarberSection from './components/sections/BarberSection';
import BookingContainer from './components/booking/BookingContainer';

export default function App() {
  return (
    <>
      <Header />
      <div className="max-w-screen-xl min-w-64 w-[85vw] flex flex-col gap-8 max-md:justify-center max-md:gap-14 max-xl:items-center">
        <div className="flex flex-col gap-32 max-md:gap-10">
          <div className="grid-hero">
            <OpeningHours />
            <HeroSection />
            <Slideshow />
          </div>
        </div>

        <BookingProvider>
          <BookingContainer />
        </BookingProvider>

        <div className="flex flex-col gap-32 max-md:gap-10">
          <ProductsSection />
          <BarberSection />
          <Footer />
        </div>
      </div>
    </>
  );
}
