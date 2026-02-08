export default function ProductsSection() {
  return (
    <div>
      <hr />
      <div
        className="w-full flex justify-center mt-6 gap-9 max-xl:w-[90vw] max-xl:gap-14 max-md:flex-col max-md:items-center max-md:gap-3"
        data-nosnippet
      >
        <div className="w-88 max-md:w-full">
          <h2>Keune</h2>
          <p>
            Vi arbetar med Keune som är ett holländskt familjeägt B Corp företag.
            De skapar högkvalitativa produkter exklusivt för frisörer. Alla
            produkter är cruelty free och hållbara. Allt från idé till produktion
            sker under samma tak. Gå gärna in och läs mer om Keune på{' '}
            <a href="https://www.keune.com/se/" target="_blank" rel="noreferrer">
              Keune.com
            </a>
          </p>
        </div>
        <div className="w-88 max-md:w-full">
          <h2>Hairtalk</h2>
          <p>
            Vi är certifierade hairtalk stylister, så vill du veta mer ring oss
            på <a href="tel:021-12 22 10">021-12 22 10</a> eller läs på{' '}
            <a href="https://hairtalk.se">Hairtalk.se</a>
          </p>
        </div>
      </div>
    </div>
  );
}
