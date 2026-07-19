/** Verified on-site fields only. Placeholder fields require clinic-provided data before publish/index. */
export const MISSING_DATA = 'GERÇEK VERİ GEREKİYOR';
const DEFAULT_LOCALE = 'tr';

const PROFILE_FIELDS = [
  'education',
  'experience',
  'interests',
  'publications',
  'conferences',
  'memberships',
  'approach',
  'certifications',
];

/**
 * Doctor profile scaffold.
 * indexed: false → pages render with noindex until verified fields are supplied.
 * Schema (Person/Physician) is emitted via doctor-schema.js only when profileCompleted and indexed.
 */
export const DOCTORS = [
  {
    slug: 'mubin-hosnuter',
    name: 'Prof. Dr. Mübin Hoşnuter',
    title: 'Prof. Dr.',
    specialty: 'Plastik Rekonstrüktif Ve Estetik Cerrahi',
    specialtyByLocale: {
      tr: 'Plastik Rekonstrüktif ve Estetik Cerrahi',
      en: 'Plastic, Reconstructive and Aesthetic Surgery',
      ar: 'جراحة التجميل والترميم',
      es: 'Cirugía plástica, reconstructiva y estética',
      fr: 'Chirurgie plastique, reconstructrice et esthétique',
      it: 'Chirurgia plastica, ricostruttiva ed estetica',
      ru: 'Пластическая, реконструктивная и эстетическая хирургия',
      de: 'Plastische, rekonstruktive und ästhetische Chirurgie',
    },
    photo: '/images/site/home/doctor-mubin-hosnuter.webp',
    image: '/images/site/home/doctor-mubin-hosnuter.webp',
    imageAvif: '/images/site/home/doctor-mubin-hosnuter.avif',
    imageAlt: 'Prof. Dr. Mübin Hoşnuter',
    serviceCategories: ['plastic'],
    relatedServiceSlugs: ['rhinoplasty', 'breast-augmentation', 'liposuction'],
    education: MISSING_DATA,
    experience: MISSING_DATA,
    interests: MISSING_DATA,
    publications: MISSING_DATA,
    conferences: MISSING_DATA,
    congresses: MISSING_DATA,
    memberships: MISSING_DATA,
    certifications: MISSING_DATA,
    approach: MISSING_DATA,
    indexed: false,
  },
  {
    slug: 'ayca-koku',
    name: 'Dt. Ayça Koku',
    title: 'Dt.',
    specialty: 'Diş Hekimi',
    specialtyByLocale: {
      tr: 'Diş Hekimi',
      en: 'Dentist',
      ar: 'طبيبة أسنان',
      es: 'Odontóloga',
      fr: 'Chirurgienne-dentiste',
      it: 'Odontoiatra',
      ru: 'Стоматолог',
      de: 'Zahnärztin',
    },
    photo: '/images/site/home/doctor-ayca-koku.webp',
    image: '/images/site/home/doctor-ayca-koku.webp',
    imageAvif: '/images/site/home/doctor-ayca-koku.avif',
    imageAlt: 'Dt. Ayça Koku',
    serviceCategories: ['dental'],
    relatedServiceSlugs: ['dental-implant', 'hollywood-smile', 'zirconium-crown'],
    education: MISSING_DATA,
    experience: MISSING_DATA,
    interests: MISSING_DATA,
    publications: MISSING_DATA,
    conferences: MISSING_DATA,
    congresses: MISSING_DATA,
    memberships: MISSING_DATA,
    certifications: MISSING_DATA,
    approach: MISSING_DATA,
    indexed: false,
  },
  {
    slug: 'sina-evsen',
    name: 'Uzm. Dr. Sina Evsen',
    title: 'Uzm. Dr.',
    specialty: 'Göz Hastalıkları Uzmanı',
    specialtyByLocale: {
      tr: 'Göz Hastalıkları Uzmanı',
      en: 'Ophthalmology Specialist',
      ar: 'أخصائي أمراض العيون',
      es: 'Especialista en oftalmología',
      fr: 'Spécialiste en ophtalmologie',
      it: 'Specialista in oftalmologia',
      ru: 'Врач-офтальмолог',
      de: 'Facharzt für Augenheilkunde',
    },
    photo: '/images/goz-hastaliklari/uzm-dr-sina-evsen.jpg',
    image: '/images/goz-hastaliklari/uzm-dr-sina-evsen.jpg',
    imageAvif: '/images/goz-hastaliklari/uzm-dr-sina-evsen.avif',
    imageAlt: 'Uzm. Dr. Sina Evsen',
    serviceCategories: ['eye-health'],
    relatedServiceSlugs: [],
    education: MISSING_DATA,
    experience: MISSING_DATA,
    interests: MISSING_DATA,
    publications: MISSING_DATA,
    conferences: MISSING_DATA,
    congresses: MISSING_DATA,
    memberships: MISSING_DATA,
    certifications: MISSING_DATA,
    approach: MISSING_DATA,
    indexed: false,
  },
];

export const DOCTORS_BY_SLUG = Object.fromEntries(DOCTORS.map((doctor) => [doctor.slug, doctor]));

export function getDoctorBySlug(slug) {
  return DOCTORS_BY_SLUG[slug] || null;
}

export function getDoctorsForCategory(category) {
  return DOCTORS.filter((doctor) => doctor.serviceCategories.includes(category));
}

export function getDoctorSpecialty(doctor, locale = DEFAULT_LOCALE) {
  return doctor?.specialtyByLocale?.[locale] || doctor?.specialtyByLocale?.[DEFAULT_LOCALE] || doctor?.specialty || '';
}

export function isDoctorProfileComplete(doctor) {
  if (!doctor) return false;
  return PROFILE_FIELDS.every((field) => doctor[field] && doctor[field] !== MISSING_DATA);
}

export function getDoctorProfileCompleted(doctor) {
  return Boolean(doctor?.indexed && isDoctorProfileComplete(doctor));
}

DOCTORS.forEach((doctor) => {
  Object.defineProperty(doctor, 'profileCompleted', {
    get() {
      return getDoctorProfileCompleted(this);
    },
    enumerable: true,
  });
});
