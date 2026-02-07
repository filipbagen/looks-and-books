// @ts-expect-error -- react-splide types don't resolve under "exports"
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';

import slide1 from '../../assets/images/slideshow/slideshow1.jpg';
import slide2 from '../../assets/images/slideshow/slideshow2.jpg';
import slide3 from '../../assets/images/slideshow/slideshow3.jpg';
import slide4 from '../../assets/images/slideshow/slideshow4.jpg';
import slide5 from '../../assets/images/slideshow/slideshow5.jpg';
import slide6 from '../../assets/images/slideshow/slideshow6.jpg';

const slides = [slide1, slide2, slide3, slide4, slide5, slide6];

export default function Slideshow() {
  return (
    <section className="splide-wrapper area-slideshow ml-[42px] max-[1240px]:ml-0">
      <Splide
        options={{
          type: 'loop',
          pauseOnHover: false,
          pauseOnFocus: false,
          gap: 0,
          padding: 0,
          width: '100%',
          height: 490,
          cover: true,
          focus: 'center',
          autoplay: true,
          rewind: true,
          interval: 6000,
        }}
      >
        {slides.map((src, i) => (
          <SplideSlide key={i}>
            <img src={src} alt={`Looks & Books ${i + 1}`} />
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
}
