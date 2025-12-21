export const OPENING_HOURS = [
  { day: 'Måndag', hours: '10:00-18:00', shortDay: 'Mån-Fre' },
  { day: 'Tisdag', hours: '10:00-18:00' },
  { day: 'Onsdag', hours: '10:00-18:00' },
  { day: 'Torsdag', hours: '10:00-18:00' },
  { day: 'Fredag', hours: '10:00-18:00' },
  { day: 'Lördag', hours: '10:00-17:00', shortDay: 'Lör' },
  { day: 'Söndag', hours: 'Stängt', shortDay: 'Sön' },
] as const

export const STAFF_TITLES: Record<string, string> = {
  Petra: 'Frisör',
  Hannah: 'Frisör',
  Fadi: 'Frisör',
  Emma: 'Frisör',
  Olivia: 'Frisör',
  Simon: 'Frisör',
}

export const DEFAULT_STAFF = [
  { resourceId: 'emma', name: 'Emma' },
  { resourceId: 'petra', name: 'Petra' },
  { resourceId: 'fadi', name: 'Fadi' },
  { resourceId: 'hannah', name: 'Hannah' },
  { resourceId: 'simon', name: 'Simon' },
  { resourceId: 'olivia', name: 'Olivia' },
] as const

export const API_CONFIG = {
  baseUrl: import.meta.env.DEV ? 'http://localhost:8888' : '',
  onlineBookingUrlName: 'looksbooks',
} as const

export const CONTACT = {
  phone: '021-12 22 10',
  phoneLink: 'tel:021-122210',
  instagram: '@SalongLooksAndBooks',
  instagramUrl: 'https://www.instagram.com/salonglooksandbooks/',
  address: 'Köpmangatan 3, 722 15 Västerås',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2018.385285702785!2d16.540642877786656!3d59.6099475747515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465e619bcfa15ac9%3A0x651d75d180d78f5!2sLooks%20%26%20Books!5e0!3m2!1sen!2sse!4v1683709479155!5m2!1sen!2sse',
} as const
