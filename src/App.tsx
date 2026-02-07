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
      <div className="max-w-[1280px] min-w-[270px] w-[90vw] flex flex-col gap-8 max-md:justify-center max-md:gap-[58px] max-[1240px]:items-center">
        <div className="flex flex-col gap-[122px] max-md:gap-[38px]">
          <div className="grid-hero">
            <OpeningHours />
            <HeroSection />
            <Slideshow />
          </div>
        </div>

        <BookingProvider>
          <BookingContainer />
        </BookingProvider>

        <div className="flex flex-col gap-[122px] max-md:gap-[38px]">
          <ProductsSection />
          <BarberSection />
          <Footer />
        </div>
      </div>
    </>
  );
}
