import { useMemo } from 'react';
import instagramSrc from '../../assets/images/instagram.svg';
import phoneSrc from '../../assets/images/phone.svg';

const FOOTER_HOURS = [
  { label: 'Måndag-Fredag: 10:00-18:00', days: [1, 2, 3, 4, 5] },
  { label: 'Lördag: 10:00-17:00', days: [6] },
  { label: 'Söndag: Stängt', days: [0] },
];

export default function Footer() {
  const todayIndex = useMemo(() => new Date().getDay(), []);

  return (
    <div
      id="footer"
      className="flex flex-row justify-between items-center gap-[50px] w-full max-[1240px]:flex-col max-[1240px]:gap-[38px] max-md:flex-col"
    >
      <div className="flex flex-col justify-between w-1/2 text-center max-[1240px]:w-full max-[1240px]:gap-6">
        <div className="flex gap-8 justify-between max-[1240px]:justify-center max-[1240px]:gap-[100px] max-[1240px]:w-full max-md:flex-col max-md:items-center max-md:gap-20">
          <div className="flex justify-center flex-col items-center mb-[30pt]">
            <h1>Kontakta oss</h1>
            <div className="flex flex-col max-[1240px]:h-9">
              <div className="flex items-center flex-row mb-[15pt]">
                <img src={instagramSrc} className="w-[32pt] mr-[10pt] !rounded-none" alt="Instagram" />
                <a href="https://www.instagram.com/salonglooksandbooks/">@SalongLooksAndBooks</a>
              </div>
              <div className="flex items-center flex-row mb-[15pt]">
                <img src={phoneSrc} className="w-[32pt] mr-[10pt] !rounded-none" alt="Telefon" />
                <a href="tel:021-12 22 10">021-12 22 10</a>
              </div>
            </div>
          </div>

          <div>
            <h1>Öppettider</h1>
            <div className="flex justify-between gap-[22px] items-center flex-col">
              {FOOTER_HOURS.map((h) => (
                <p key={h.label} className={`m-0 ${h.days.includes(todayIndex) ? 'today' : ''}`}>
                  {h.label}
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="muted">
          Designad och utvecklad av{' '}
          <u>
            <a href="https://filipbagen.com/" target="_blank" rel="noreferrer">
              Filip Malm-Bägén
            </a>
          </u>
        </p>
      </div>

      <iframe
        className="h-[364px] w-1/2 rounded-t-[var(--radius-brand)] rounded-b-none max-[1240px]:w-full max-md:h-[336px]"
        title="Looks & Books map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2018.385285702785!2d16.540642877786656!3d59.6099475747515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465e619bcfa15ac9%3A0x651d75d180d78f5!2sLooks%20%26%20Books!5e0!3m2!1sen!2sse!4v1683709479155!5m2!1sen!2sse"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
