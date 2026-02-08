import logoSrc from '../../assets/images/logo.svg';

export default function Header() {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none -z-10">
        <img
          src={logoSrc}
          alt="Looks & Books Logo"
          // Added max-w-none to prevent shrinking
          className="absolute -right-0 top-12 w-[2300px] max-w-none top-0 opacity-3"
        />
      </div>
      <img
        src={logoSrc}
        className="h-18 mt-20 mb-8 block mx-auto"
        alt="Looks & Books Logo"
      />
    </>
  );
}
