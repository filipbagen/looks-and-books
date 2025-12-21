import { OPENING_HOURS, CONTACT } from '@/utils/constants'
import { getTodayIndex } from '@/utils/date'
import instagramIcon from '@/assets/images/icons/instagram.svg'
import phoneIcon from '@/assets/images/icons/phone.svg'

export function Footer() {
  const todayIndex = getTodayIndex()
  const footerHours = [
    { label: 'Måndag-Fredag', hours: '10:00-18:00', indices: [0, 1, 2, 3, 4] },
    { label: 'Lördag', hours: '10:00-17:00', indices: [5] },
    { label: 'Söndag', hours: 'Stängt', indices: [6] },
  ]

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-1 flex-col items-center gap-20 text-center lg:flex-row lg:justify-around lg:text-left">
        {/* Contact */}
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="mb-5 text-3xl">Kontakta oss</h1>
          <div className="flex flex-col gap-4">
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-70"
            >
              <img src={instagramIcon} alt="Instagram" className="h-9 w-9" />
              <span>{CONTACT.instagram}</span>
            </a>
            <a href={CONTACT.phoneLink} className="flex items-center gap-3 hover:opacity-70">
              <img src={phoneIcon} alt="Telefon" className="h-9 w-9" />
              <span>{CONTACT.phone}</span>
            </a>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="mb-5 text-3xl">Öppettider</h1>
          <div className="flex flex-col items-center gap-2 lg:items-start">
            {footerHours.map((item) => (
              <p
                key={item.label}
                className={`${
                  item.indices.includes(todayIndex)
                    ? 'rounded-lg bg-secondary px-4 py-2 font-bold text-white'
                    : ''
                }`}
              >
                {item.label}: {item.hours}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <iframe
        className="h-[336px] w-full rounded-t-2xl lg:h-[364px] lg:w-1/2"
        src={CONTACT.mapEmbedUrl}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Looks & Books location"
      />
    </div>
  )
}
