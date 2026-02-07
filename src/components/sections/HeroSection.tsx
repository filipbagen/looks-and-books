import iconSrc from '../../assets/images/icon.svg';
import { smoothScrollTo } from '../../utils/scroll';

export default function HeroSection() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollTo('bookingContainer');
  };

  return (
    <div className="area-intro flex flex-col justify-between gap-8">
      <div className="flex flex-col gap-6">
        <h1>Välkommen</h1>
        <p>
          Vår passion för hår och böcker har blivit till en salong i kombination
          med begagnade böcker.
        </p>
        <p>Vi har lång erfarenhet inom hår, hud och barbering.</p>
        <p>
          Vi välkomnar er alla till oss för att ta del av tjänsterna vi
          erbjuder. Ni kan dessutom komma in för att köpa böcker, hänga i våra
          mysiga soffor eller svänga förbi för att klappa vår salongshund
          Phoebe.
        </p>
      </div>

      <a
        className="w-min flex justify-center gap-2 items-center whitespace-nowrap text-brand-black py-4 px-10 rounded-[var(--radius-brand)] border-2 border-solid border-brand-black bg-primary text-center font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:cursor-pointer"
        href="#bookingContainer"
        onClick={handleClick}
      >
        Boka tid
        <img src={iconSrc} className="h-6 !rounded-none max-md:h-4" alt="Scissors" />
      </a>
    </div>
  );
}
