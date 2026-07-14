/** Verified on-site fields only. Placeholder fields require clinic-provided data before publish/index. */
export const MISSING_DATA = 'GERÇEK VERİ GEREKİYOR';

/**
 * Doctor profile scaffold.
 * indexed: false → pages render with noindex until verified fields are supplied.
 * Schema (Person/Physician) must NOT be added until data is verified.
 */
export const DOCTORS = [
  {
    slug: 'mubin-hosnuter',
    name: 'Prof. Dr. Mübin Hoşnuter',
    title: 'Prof. Dr.',
    specialty: 'Plastik Rekonstrüktif Ve Estetik Cerrahi',
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
    memberships: MISSING_DATA,
    approach: MISSING_DATA,
    indexed: false,
  },
  {
    slug: 'ayca-koku',
    name: 'Dt. Ayça Koku',
    title: 'Dt.',
    specialty: 'Diş Hekimi',
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
    memberships: MISSING_DATA,
    approach: MISSING_DATA,
    indexed: false,
  },
  {
    slug: 'sina-evsen',
    name: 'Uzm. Dr. Sina Evsen',
    title: 'Uzm. Dr.',
    specialty: 'Göz Hastalıkları Uzmanı',
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
    memberships: MISSING_DATA,
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

export function isDoctorProfileComplete(doctor) {
  if (!doctor) return false;
  const fields = [
    'education',
    'experience',
    'interests',
    'publications',
    'conferences',
    'memberships',
    'approach',
  ];
  return fields.every((field) => doctor[field] && doctor[field] !== MISSING_DATA);
}
