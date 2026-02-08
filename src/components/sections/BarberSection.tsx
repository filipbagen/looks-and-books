import barberSvg from '../../assets/images/barber.svg';
import barberJpg from '../../assets/images/barber.jpg';

export default function BarberSection() {
  return (
    <div className="w-full">
      <div className="flex justify-between gap-20 w-full items-center max-md:flex-col max-md:items-center max-md:gap-7">
        <div className="flex flex-col items-start w-full">
          <img src={barberSvg} className="h-32 max-w-24" alt="Barbering" />
          <p>
            På vår frisörsalong har vi professionella barberare med lång
            erfarenhet inom området. Vi strävar alltid efter att ge våra kunder
            den bästa barberingsupplevelsen och det gör vi genom att använda de
            bästa verktygen och produkterna. Vi är specialiserade på att skapa
            skarpa linjer, trendiga stilar och att ta hand om alla olika typer av
            skägg. Oavsett om du vill ha en klassisk rakning eller en modern
            trimning är du varmt välkommen.
          </p>
        </div>
        <img
          src={barberJpg}
          className="max-h-[28rem] max-w-lg min-w-72 w-full object-cover max-xl:h-fit max-md:max-w-full"
          alt="Barbering"
        />
      </div>
    </div>
  );
}
