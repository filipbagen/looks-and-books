import iconSrc from '../../assets/images/icon.svg';
import { smoothScrollTo } from '../../utils/scroll';

export default function HeroSection() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollTo('bookingContainer');
  };

  return (
    <div className="area-intro w-full h-full flex flex-col justify-between max-[1240px]:gap-8 max-md:gap-3 max-md:w-full max-md:h-auto">
      <div className="flex flex-col gap-1 w-full">
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
        className="w-[132px] flex justify-evenly items-center whitespace-nowrap text-brand-black py-[12pt] px-[18pt] rounded-[var(--radius-brand)] border-2 border-solid border-brand-black bg-primary text-center font-semibold text-lg transition-all duration-200 hover:shadow-[0px_0px_15px_1px_rgba(53,53,53,0.3)] hover:cursor-pointer max-md:py-[10px] max-md:px-2"
        href="#bookingContainer"
        onClick={handleClick}
      >
        Boka tid
        <img src={iconSrc} className="h-[20pt] ml-[6pt] !rounded-none max-md:ml-0" alt="Scissors" />
      </a>
    </div>
  );
}
