export const EYE_HEALTH_PAGE = {
  title: 'Göz Hastalıkları | Dr Otgen Clinic',
  description:
    'Göz muayenesi, kırma kusurları, katarakt, retina, göz kapağı ve diğer göz sağlığı başlıklarına ilişkin genel bilgilendirme.',
  canonicalPath: '/tr/goz-hastaliklari.html',
  hero: {
    tag: 'GÖZ HASTALIKLARI',
    title: 'Göz Sağlığınız İçin Kapsamlı Değerlendirme',
    description:
      'Göz sağlığına ilişkin değerlendirmeler, muayene bulguları ve kişisel ihtiyaçlar doğrultusunda planlanır.',
    cta: 'Randevu Talep Et',
    image: '/images/goz-hastaliklari/hero-goz-muayenesi-ai.webp',
    imageAlt: 'Temsili göz muayenesi sahnesi',
  },
  process: [
    {
      title: 'Göz Muayenesi',
      description:
        'Görme ve göz sağlığına ilişkin ilk değerlendirme, muayene bulguları doğrultusunda yapılır.',
    },
    {
      title: 'Ayrıntılı Değerlendirme',
      description:
        'Gereksinim duyulan incelemeler, bireysel bulgular ve ihtiyaçlar doğrultusunda ele alınır.',
    },
    {
      title: 'Kişiye Özel Planlama',
      description:
        'Bilgilendirme ve izlenecek yaklaşım, muayene sonucunda kişisel ihtiyaçlar doğrultusunda planlanır.',
    },
  ],
  doctor: {
    sectionTitle: 'Göz Sağlığında Uzman Değerlendirmesi',
    name: 'Uzm. Dr. Sina Evsen',
    role: 'Göz Hastalıkları Uzmanı',
    description:
      'Göz sağlığına ilişkin değerlendirmelerde, muayene bulguları ve kişisel ihtiyaçlar doğrultusunda planlama yapılır.',
    image: '/images/goz-hastaliklari/uzm-dr-sina-evsen.jpg',
    imageAlt: 'Uzm. Dr. Sina Evsen, Göz Hastalıkları Uzmanı',
    cta: 'Randevu Talep Et',
  },
  categoriesIntro: {
    title: 'Göz Hastalıkları',
    description:
      'Göz sağlığına ilişkin farklı başlıklar, muayene bulguları ve kişisel ihtiyaçlar doğrultusunda değerlendirilir.',
  },
  closingCta: {
    title: 'Göz Sağlığınız İçin Randevu Talep Edin',
    description:
      'Muayene ve değerlendirme süreci hakkında bilgi almak için randevu talebinizi iletebilirsiniz.',
    cta: 'Randevu Talep Et',
  },
};

export const EYE_HEALTH_CATEGORIES = [
  {
    id: 'goz-muayenesi-genel-saglik',
    title: 'Göz Muayenesi ve Genel Göz Sağlığı',
    icon: 'exam',
    topics: [
      {
        title: 'Göz Muayenesi',
        description:
          'Görme düzeyi, gözün ön ve arka yapıları ile ihtiyaç duyulan testlerin birlikte değerlendirildiği muayene sürecidir.',
      },
      {
        title: 'Konjonktivit',
        description:
          'Gözün ön yüzeyini örten konjonktiva tabakasıyla ilişkili tahriş ve iltihabi durumların değerlendirilmesini kapsar.',
      },
      {
        title: 'Arpacık',
        description:
          'Göz kapağında kızarıklık, hassasiyet ve şişlikle görülebilen lokal kapak bezi sorunlarının değerlendirilmesini kapsar.',
      },
      {
        title: 'Şalazyon',
        description:
          'Göz kapağındaki yağ bezlerinin tıkanmasıyla gelişebilen sınırlı şişliklerin değerlendirilmesini kapsar.',
      },
    ],
  },
  {
    id: 'goz-kusurlari-ve-lazer',
    title: 'Göz Kusurları ve Lazer Uygulamaları',
    icon: 'laser',
    topics: [
      {
        title: 'Göz Çizdirme',
        description:
          'Kırma kusurlarında lazer uygulamalarına uygunluk, ayrıntılı göz muayenesi sonrasında değerlendirilir.',
      },
      {
        title: 'Miyop',
        description: 'Uzak mesafedeki nesnelerin bulanık görülmesine yol açabilen bir kırma kusurudur.',
      },
      {
        title: 'Astigmat',
        description:
          'Gözün optik yapısındaki düzensizliklere bağlı olarak bulanık veya dağınık görmeye neden olabilen bir kırma kusurudur.',
      },
      {
        title: 'Hipermetrop',
        description: 'Yakın mesafede görme güçlüğüyle ilişkili olabilen bir kırma kusurudur.',
      },
    ],
  },
  {
    id: 'katarakt-ve-goz-ici-mercekler',
    title: 'Katarakt ve Göz İçi Mercekler',
    icon: 'lens',
    topics: [
      {
        title: 'Katarakt Nedir?',
        description:
          'Katarakt, göz içindeki doğal merceğin saydamlığını kaybetmesiyle ilişkilendirilen bir durumdur.',
      },
      {
        title: 'Katarakt Ameliyatı',
        description:
          'Katarakta yönelik cerrahi seçenekler, muayene bulguları ve kişisel ihtiyaçlar doğrultusunda değerlendirilir.',
      },
      {
        title: 'Göz İçi Mercek',
        description:
          'Göz içi mercek seçenekleri, göz yapısı ve görme ihtiyaçları doğrultusunda değerlendirilir.',
      },
      {
        title: 'Trifokal Mercek',
        description:
          'Uzak, orta ve yakın görme ihtiyaçlarına yönelik çok odaklı mercek seçeneklerinin değerlendirilmesini kapsar.',
      },
    ],
  },
  {
    id: 'retina-ve-goz-ici-hastaliklar',
    title: 'Retina ve Göz İçi Hastalıklar',
    icon: 'retina',
    topics: [
      {
        title: 'Sarı Nokta Hastalığı',
        description:
          'Sarı nokta hastalığı, merkezi görmeden sorumlu makula bölgesini etkileyebilen durumların değerlendirilmesini kapsar.',
      },
      {
        title: 'Retina',
        description:
          'Retina, gözün arka bölümünde görüntünün algılanmasında görev alan ışığa duyarlı tabakadır.',
      },
      {
        title: 'Üveit',
        description:
          'Üveit, gözün uvea tabakasını etkileyebilen iltihabi durumların değerlendirilmesini kapsar.',
      },
    ],
  },
  {
    id: 'goz-kapagi-ve-orbita',
    title: 'Göz Kapağı ve Orbita',
    icon: 'eyelid',
    topics: [
      {
        title: 'Göz Kapağı Düşüklüğü',
        description:
          'Göz kapağı düşüklüğü, üst kapağın göz açıklığını etkileyebildiği durumların değerlendirilmesini kapsar.',
      },
      {
        title: 'Göz Kapağı Estetiği',
        description:
          'Göz kapağı bölgesine ilişkin fonksiyonel veya estetik değerlendirmeler, göz ve yüz yapısı dikkate alınarak planlanır.',
      },
      {
        title: 'Orbita Cerrahisi',
        description:
          'Orbita cerrahisi, göz çevresindeki kemik ve yumuşak doku yapılarıyla ilgili cerrahi değerlendirmeleri kapsar.',
      },
    ],
  },
  {
    id: 'diger-goz-tedavileri',
    title: 'Diğer Göz Tedavileri',
    icon: 'care',
    topics: [
      {
        title: 'Göz Ameliyatı',
        description:
          'Göz cerrahisine ilişkin seçenekler, tanı, muayene bulguları ve bireysel ihtiyaçlar doğrultusunda değerlendirilir.',
      },
      {
        title: 'Göz Kayması',
        description:
          'Göz kayması, gözlerin birlikte hareketi ve hizalanmasıyla ilişkili durumların değerlendirilmesini kapsar.',
      },
    ],
  },
];

export const EYE_HEALTH_NAV_GROUPS = EYE_HEALTH_CATEGORIES.map((category) => ({
  label: category.title,
  anchor: category.id,
  links: category.topics.map((topic) => ({
    label: topic.title,
    href: `#${category.id}`,
  })),
}));
