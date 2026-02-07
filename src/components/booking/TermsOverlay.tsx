interface TermsOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsOverlay({ visible, onClose }: TermsOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-brand-white p-8 rounded-lg relative max-w-[85%] max-h-[70%] overflow-auto">
        <span
          className="absolute top-2.5 right-2.5 text-2xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </span>
        <h2>Användarvillkor för onlinebokning i EasyCashier Bokningskalender</h2>
        <h3>Definitioner</h3>
        <p>
          <b>Användaren</b> - Du / person som genomför onlinebokningen.
        </p>
        <p>
          <b>Bokningskalendern</b> - EasyCashier bokningskalender och tillhörande
          onlinebokning.
        </p>
        <p>
          <b>Företaget</b> - Det företag som använder sig av tjänsten EasyCashier
          bokningskalender och tillhörande onlinebokning på sin hemsida.
        </p>
        <p>
          <b>Personuppgifter</b> - Information som enskilt eller tillsammans med
          annan information kan identifiera en person.
        </p>
        <h3>Villkor</h3>
        <p>
          Då Användaren genomför en onlinebokning ger man samtycke till att
          Användarens Personuppgifter sparas och behandlas i Företagets
          Bokningskalender.
        </p>
        <p>
          De Personuppgifter som sparas om Användaren är förnamn, efternamn,
          epostadress samt mobiltelefonnummer.
        </p>
        <p>
          Personuppgifterna sparas för att Företaget ska kunna använda
          Bokningskalendern och dess tjänster på ett korrekt sätt gentemot
          Användaren.
        </p>
        <p>
          Om användaren önskar att få ta del av vilka personuppgifter som lagras,
          eller önskar att dessa personuppgifter tas bort, så åligger det
          Användaren att kontakta Företaget som då utan dröjsmål ska utföra detta.
        </p>
        <p>
          Om Företaget slutar att använda Bokningskalendern så kommer samtliga
          personuppgifter om Användare att tas bort 1 senast månad efter att
          tjänsten avslutats.
        </p>
      </div>
    </div>
  );
}
