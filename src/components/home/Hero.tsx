import { Button } from '@/components/ui'
import { useScrollTo } from '@/hooks/useScrollTo'
import scissorIcon from '@/assets/images/icons/icon.svg'


export function Hero() {
  const scrollTo = useScrollTo()

  return (
    <div className="flex h-full flex-col justify-between gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="mb-5 text-4xl">Välkommen</h1>
        <p className="leading-relaxed">
          Vår passion för hår och böcker har blivit till en salong i kombination med begagnade
          böcker.
        </p>
        <p className="leading-relaxed">Vi har lång erfarenhet inom hår, hud och barbering.</p>
        <p className="leading-relaxed">
          Vi välkomnar er alla till oss för att ta del av tjänsterna vi erbjuder. Ni kan dessutom
          komma in för att köpa böcker, hänga i våra mysiga soffor eller svänga förbi för att klappa
          vår salongshund Phoebe.
        </p>
      </div>

      <Button variant="outline" onClick={() => scrollTo('booking')} className="w-fit">
        Boka tid
        <img src={scissorIcon} alt="" className="ml-2 h-5" />
      </Button>
    </div>
  )
}
