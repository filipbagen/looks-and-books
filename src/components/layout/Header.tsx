import logoSrc from '../../assets/images/logo.svg';

export default function Header() {
  return (
    <>
      <div className="relative">
        <img
          src={logoSrc}
          alt="Looks & Books Logo"
          className="overflow-hidden absolute -right-[50vw] h-screen opacity-[0.03] -z-10"
        />
      </div>
      <img
        src={logoSrc}
        className="h-[86px] mt-[82px] -mb-[72px] block mx-auto"
        alt="Looks & Books Logo"
      />
    </>
  );
}
