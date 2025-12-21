import barberIcon from '@/assets/images/icons/barber.svg'
import barberImage from '@/assets/images/icons/barber.jpg'

export function Services() {
  return (
    <div className="flex flex-col gap-20">
      {/* Products */}
      <div>
        <hr className="my-3 border-t-2 border-secondary opacity-25" />
        <div className="mt-6 flex flex-col justify-center gap-8 md:flex-row md:gap-12">
          <div className="md:w-80">
            <h2 className="mb-2 text-2xl">Davines</h2>
            <p className="text-sm leading-relaxed">
              Vi arbetar med Davines, som vi tycker skapar fantastiska produkter. De fokuserar på
              både kvalitet och miljömässig hållbarhet. Gå gärna in och läs mer på Davines.com
            </p>
          </div>
          <div className="md:w-80">
            <h2 className="mb-2 text-2xl">Hairtalk</h2>
            <p className="text-sm leading-relaxed">
              Vi är certifierade hairtalk stylister, så vill du veta mer ring oss på{' '}
              <a href="tel:021-122210" className="underline hover:opacity-70">
                021-12 22 10
              </a>{' '}
              eller läs på{' '}
              <a
                href="https://hairtalk.se"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
              >
                Hairtalk.se
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Barbering Section */}
      <div className="flex flex-col items-center gap-7 lg:flex-row lg:gap-20">
        <div className="flex flex-col lg:flex-1">
          <img src={barberIcon} alt="Barbering" className="mb-4 h-32 w-24" />
          <p className="leading-relaxed">
            På vår frisörsalong har vi professionella barberare med lång erfarenhet inom området. Vi
            strävar alltid efter att ge våra kunder den bästa barberingsupplevelsen och det gör vi
            genom att använda de bästa verktygen och produkterna. Vi är specialiserade på att skapa
            skarpa linjer, trendiga stilar och att ta hand om alla olika typer av skägg. Oavsett om
            du vill ha en klassisk rakning eller en modern trimning är du varmt välkommen.
          </p>
        </div>
        <img
          src={barberImage}
          alt="Barbering"
          className="max-h-[442px] w-full max-w-[522px] rounded-2xl object-cover"
        />
      </div>
    </div>
  )
}
