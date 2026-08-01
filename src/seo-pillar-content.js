/**
 * Published SEO pillar guide pages (TR source).
 * Consumed by subpages-data.js and rendered via the existing service page pipeline.
 */

function guidePage({
  category,
  slug,
  navLabel,
  title,
  categoryLabel,
  heroTag,
  heroSubtitle,
  summary,
  overview,
  sections,
  highlights,
  suitableFor,
  quickFacts,
  process,
  faqs,
}) {
  return {
    category,
    slug,
    navLabel,
    title,
    categoryLabel,
    heroTag,
    heroSubtitle,
    summary,
    images: {
      hero: `/images/site/categories/${category}.webp`,
      content: `/images/site/categories/${category}.webp`,
    },
    overview,
    sections,
    highlights,
    suitableIntro: '',
    suitableFor,
    quickFacts,
    process,
    faqs,
  };
}

export const PILLAR_GUIDE_PAGES = [
  guidePage({
    category: 'hair',
    slug: 'hair-transplant-guide',
    navLabel: 'Saç Ekimi Rehberi',
    title: 'Saç Ekimi Rehberi',
    categoryLabel: 'Saç Ekimi ve Saç Tedavileri',
    heroTag: 'Saç Sağlığı',
    heroSubtitle: 'FUE, DHI, Safir FUE ve destek tedavilerini tek çerçevede karşılaştırın',
    summary:
      'Saç ekimi rehberi; FUE, DHI ve Safir FUE yöntemlerini, aday değerlendirmesini, iyileşme sürecini ve PRP/eksozom desteklerini şeffaf bir planlama çerçevesinde açıklar.',
    overview: [
      'Saç ekimi kararı yalnızca teknik seçimden ibaret değildir. Donör kapasitesi, dökülme tipi, saç çizgisi tasarımı, beklenti yönetimi ve iyileşme planı birlikte değerlendirilir.',
      'Bu rehber; DHI, Safir FUE, kök hücre destekli yaklaşımlar ile PRP ve eksozom gibi destek tedavilerini karşılaştırarak doğru soruları sormanıza yardımcı olur.',
      'Dr. Otgen Clinic’te süreç; klinik değerlendirme, kişiye özel greft planı, operasyon ve yapılandırılmış takip adımlarıyla ilerler. Nihai uygunluk her zaman yüz yüze veya online konsültasyon sonrası belirlenir.',
    ],
    sections: [
      {
        title: 'Saç Ekimi Yöntemleri Nasıl Karşılaştırılır?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Modern saç ekiminde temel ayrım, greftlerin toplanma ve yerleştirilme biçimindedir. FUE ailesi yöntemlerde greftler tek tek alınır; DHI’de ise kanal açma ve yerleştirme aynı sekansta ilerleyebilir.',
          },
          {
            type: 'subheading',
            text: 'Safir FUE',
          },
          {
            type: 'paragraph',
            text: 'Safir uçlu bıçaklarla açılan mikro kanallar, greft yönü ve yoğunluğu üzerinde daha kontrollü bir planlama imkânı sunabilir. Özellikle geniş alan ekimleri ve doğal saç çizgisi tasarımında sık tercih edilir.',
          },
          {
            type: 'subheading',
            text: 'DHI',
          },
          {
            type: 'paragraph',
            text: 'Choi implanter kalemi ile doğrudan implantasyon; mevcut saçların korunması gereken sıklaştırma vakalarında ve açı-yön hassasiyetinin yüksek olduğu bölgelerde öne çıkar.',
          },
          {
            type: 'subheading',
            text: 'Destek tedaviler',
          },
          {
            type: 'list',
            items: [
              'ACell PRP: İyileşme ve greft çevresi destek amacıyla değerlendirilebilir',
              'Eksozom terapileri: Saç derisi kalitesi ve destek protokollerinde planlanabilir',
              'Lazer destekli bakımlar: Operasyon öncesi/sonrası programlara eklenebilir',
            ],
          },
          {
            type: 'paragraph',
            text: 'Yöntem seçimi “en yeni teknik” sloganıyla değil; donör kalitesi, hedef yoğunluk, tıraş tercihi ve iyileşme beklentisiyle yapılmalıdır. Detaylı yöntem sayfalarına ilgili tedaviler bölümünden ulaşabilirsiniz.',
          },
        ],
      },
      {
        title: 'Adaylık, Hazırlık ve İyileşme',
        blocks: [
          {
            type: 'paragraph',
            text: 'Uygun adaylık için genel sağlık durumu, ilaç kullanımı, donör bölge yoğunluğu ve gerçekçi beklenti birlikte değerlendirilir. Aktif dermatolojik sorunlar veya kontrolsüz sistemik hastalıklar süreci erteletebilir.',
          },
          {
            type: 'list',
            items: [
              'Operasyon öncesi kan sulandırıcı ve bazı takviyelerin yönetimi',
              'Sigara/alkol kısıtlaması ve saç derisi hazırlığı',
              'İlk 7–14 günde yıkama, uyku pozisyonu ve travmadan kaçınma',
              'Şok dökülme döneminin normal bir süreç olduğunun bilinmesi',
              '12 aya kadar uzayan sonuç olgunlaşma takvimi',
            ],
          },
          {
            type: 'paragraph',
            text: 'İyileşme hızı kişiye göre değişir. Klinik ekip, greft güvenliği ve doğal görünüm önceliğiyle yazılı bakım protokolü paylaşır.',
          },
        ],
      },
    ],
    highlights: [
      'FUE / DHI / Safir FUE karşılaştırma çerçevesi',
      'Donör analizi ve greft planlama odaklı yaklaşım',
      'PRP ve eksozom destek seçeneklerinin konumlandırılması',
      'Şeffaf iyileşme ve takip takvimi',
    ],
    suitableFor: [
      'Saç ekimi yöntemlerini karşılaştırmak isteyen adaylar',
      'Sıklaştırma veya geniş alan ekimi düşünen hastalar',
      'Uluslararası hasta koordinasyonu arayan kişiler',
      'Operasyon öncesi net bilgilendirme bekleyenler',
    ],
    quickFacts: [
      { label: 'Değerlendirme', value: 'Saç analizi + medikal konsültasyon' },
      { label: 'Operasyon süresi', value: 'Genellikle 4–8 saat' },
      { label: 'İlk iyileşme', value: '7–14 gün' },
      { label: 'Sonuç olgunlaşması', value: 'Yaklaşık 9–12 ay' },
      { label: 'Yöntemler', value: 'Safir FUE, DHI, destek tedaviler' },
    ],
    process: [
      {
        title: 'Konsültasyon ve Analiz',
        description: 'Dökülme tipi, donör kapasitesi ve beklentiler değerlendirilerek yöntem önerisi oluşturulur.',
      },
      {
        title: 'Kişiye Özel Plan',
        description: 'Saç çizgisi, greft dağılımı, tıraş tercihi ve destek tedaviler birlikte planlanır.',
      },
      {
        title: 'Operasyon ve Takip',
        description: 'İşlem sonrası bakım protokolü uygulanır; planlı kontrollerle sonuçlar izlenir.',
      },
    ],
    faqs: [
      {
        question: 'FUE ve DHI arasında nasıl seçim yapılır?',
        answer:
          'Seçim; donör kapasitesi, hedef bölge, mevcut saçların korunma ihtiyacı ve istenen yoğunluk profiline göre yapılır. Konsültasyonda her iki yöntemin artı/eksi yönleri kişiye özel anlatılır.',
      },
      {
        question: 'Saç ekimi sonrası ne zaman doğal görünüm oluşur?',
        answer:
          'İlk iyileşme genellikle 1–2 haftada tamamlanır. Şok dökülme sonrası büyüme kademeli ilerler; nihai görünüm çoğu vakada 9–12 ayda değerlendirilir.',
      },
      {
        question: 'PRP veya eksozom saç ekiminin yerine geçer mi?',
        answer:
          'Hayır. Bu uygulamalar destekleyici protokoller olarak planlanabilir; ileri dökülmede greft ekiminin yerini tutmaz.',
      },
      {
        question: 'Uluslararası hastalar için süreç nasıl işler?',
        answer:
          'Online ön değerlendirme, seyahat planlaması, operasyon ve dönüş sonrası takip tek bir koordinasyon akışında yürütülür.',
      },
    ],
  }),

  guidePage({
    category: 'plastic',
    slug: 'aesthetic-surgery-guide',
    navLabel: 'Estetik Cerrahi Rehberi',
    title: 'Estetik Cerrahi Rehberi',
    categoryLabel: 'Estetik Cerrahi',
    heroTag: 'Cerrahi Estetik',
    heroSubtitle: 'Rinoplasti, yüz, meme ve vücut estetiğinde bilinçli karar çerçevesi',
    summary:
      'Estetik cerrahi rehberi; rinoplasti, yüz germe, blefaroplasti, meme ve vücut şekillendirme seçeneklerini güvenlik, planlama ve iyileşme perspektifiyle özetler.',
    overview: [
      'Estetik cerrahi kararları fonksiyon, oran, yüz/vücut uyumu ve güvenlik öncelikleriyle alınmalıdır. Tek bir “trend işlem” yerine bütüncül değerlendirme daha öngörülebilir sonuçlar üretir.',
      'Bu rehber; burun, yüz, göz kapağı, meme ve vücut kontürü prosedürlerinde hangi soruların sorulması gerektiğini ve sürecin nasıl ilerlediğini sadeleştirir.',
      'Dr. Otgen Clinic’te planlama; klinik muayene, görüntüleme/analiz ihtiyacı, anestezi güvenliği ve yapılandırılmış takip protokolüyle desteklenir.',
    ],
    sections: [
      {
        title: 'Yüz ve Burun Estetiği',
        blocks: [
          {
            type: 'paragraph',
            text: 'Rinoplasti hem nefes fonksiyonunu hem de burun-yüz dengesini etkileyebilir. Blefaroplasti ve yüz germe ise yaşlanma belirtilerini kişiye özel anatomiye göre ele alır.',
          },
          {
            type: 'list',
            items: [
              'Rinoplasti: burun sırtı, uç, nefes pasajı ve profil uyumu',
              'Blefaroplasti: üst/alt kapak fazlalığı ve yorgun bakış görünümü',
              'Yüz germe: orta yüz ve çene hattı sarkmalarında cerrahi seçenekler',
            ],
          },
          {
            type: 'paragraph',
            text: 'Yüz bölgesinde doğal sonuç için cilt kalitesi, kemik yapı ve yumuşak doku desteği birlikte okunur. Aşırı agresif müdahaleler yerine dengeli planlama tercih edilir.',
          },
        ],
      },
      {
        title: 'Meme ve Vücut Şekillendirme',
        blocks: [
          {
            type: 'paragraph',
            text: 'Meme büyütme, küçültme ve jinekomasti; vücut oranları, doku kalitesi ve yaşam tarzı dikkate alınarak planlanır. Liposuction, karın germe ve kalça kaldırma ise kontür hedeflerine göre kombine edilebilir.',
          },
          {
            type: 'list',
            items: [
              'Hedef oran ve ölçülerin gerçekçi belirlenmesi',
              'Ameliyathane ve anestezi güvenlik standartları',
              'Korse, hareket kısıtı ve işe dönüş planı',
              'Kombinasyon cerrahilerinde risk-fayda dengesi',
            ],
          },
          {
            type: 'paragraph',
            text: 'Her prosedürün iyileşme penceresi farklıdır. Rehber genel bilgilendirme amaçlıdır; nihai endikasyon muayene sonrası netleşir.',
          },
        ],
      },
    ],
    highlights: [
      'Fonksiyon + estetik dengeli planlama',
      'Yüz, meme ve vücut prosedürlerinde karar çerçevesi',
      'Güvenlik ve takip odaklı süreç yönetimi',
      'Kişiye özel beklenti yönetimi',
    ],
    suitableFor: [
      'Estetik cerrahi seçeneklerini araştıran adaylar',
      'Birden fazla prosedürü karşılaştıran hastalar',
      'İyileşme süresi ve riskleri net anlamak isteyenler',
      'Uluslararası hasta yolculuğu planlayan kişiler',
    ],
    quickFacts: [
      { label: 'Değerlendirme', value: 'Klinik muayene + planlama' },
      { label: 'Süre aralığı', value: 'İşleme göre 1–4 saat' },
      { label: 'İyileşme', value: 'Genellikle 7–21 gün' },
      { label: 'Anestezi', value: 'Lokal/sedasyon/genel (işleme göre)' },
      { label: 'Odak', value: 'Güvenlik, oran ve doğal sonuç' },
    ],
    process: [
      {
        title: 'Muayene ve Hedef Belirleme',
        description: 'Anatomi, beklenti ve tıbbi öykü değerlendirilir; uygun prosedür çerçevesi çizilir.',
      },
      {
        title: 'Cerrahi Plan',
        description: 'Teknik seçim, anestezi yaklaşımı ve olası kombinasyonlar netleştirilir.',
      },
      {
        title: 'Ameliyat ve Kontroller',
        description: 'Operasyon sonrası bakım ve kontrol randevularıyla iyileşme izlenir.',
      },
    ],
    faqs: [
      {
        question: 'Estetik cerrahi için doğru zaman nasıl anlaşılır?',
        answer:
          'Genel sağlık durumu uygunsa, beklenti gerçekçi ise ve iyileşme için yeterli zaman ayırabiliyorsanız planlama yapılabilir. Nihai karar muayene sonrası verilir.',
      },
      {
        question: 'Birden fazla işlem aynı seansta yapılabilir mi?',
        answer:
          'Bazı kombinasyonlar mümkündür; ancak süre, kan kaybı, anestezi süresi ve iyileşme yükü dikkate alınarak güvenlik öncelikli karar verilir.',
      },
      {
        question: 'İyileşme sürecinde nelere dikkat edilmelidir?',
        answer:
          'İstirahat, yara bakımı, aktivite kısıtları ve kontrol randevuları prosedüre göre değişir. Size özel yazılı protokol paylaşılır.',
      },
      {
        question: 'Sonuç ne zaman oturur?',
        answer:
          'Erken şişlik ve morluklar haftalar içinde azalır; nihai kontür ve doku oturması prosedüre göre birkaç ay sürebilir.',
      },
    ],
  }),

  guidePage({
    category: 'dental',
    slug: 'dental-aesthetics-guide',
    navLabel: 'Diş Estetiği Rehberi',
    title: 'Diş Estetiği Rehberi',
    categoryLabel: 'Diş Estetiği',
    heroTag: 'Gülümseme Tasarımı',
    heroSubtitle: 'İmplant, zirkonyum, Hollywood Smile ve beyazlatma yol haritası',
    summary:
      'Diş estetiği rehberi; implant, zirkonyum kaplama, Hollywood Smile, ortodonti ve beyazlatma seçeneklerini fonksiyonel ve estetik dengeyle açıklar.',
    overview: [
      'Gülüş tasarımı yalnızca renk veya şekil düzeltmesi değildir. Isırma ilişkisi, diş eti sağlığı, çene uyumu ve uzun dönem dayanıklılık birlikte planlanmalıdır.',
      'Bu rehber; implant, zirkonyum, laminate/veneer yaklaşımları ve destekleyici tedavileri doğru sırayla düşünmenize yardımcı olur.',
      'Dr. Otgen Clinic’te dijital planlama, klinik muayene ve aşamalı tedavi takvimiyle öngörülebilir bir hasta yolculuğu hedeflenir.',
    ],
    sections: [
      {
        title: 'Temel Diş Estetiği Seçenekleri',
        blocks: [
          {
            type: 'paragraph',
            text: 'Hollywood Smile genellikle veneer veya kaplama kombinasyonlarıyla gülüş hattını yeniden tasarlar. Zirkonyum kaplamalar dayanıklılık ve estetik denge arayan vakalarda sık tercih edilir.',
          },
          {
            type: 'list',
            items: [
              'Dental implant: eksik diş restorasyonunda kök benzeri çözüm',
              'Zirkonyum kaplama: renk, form ve dayanıklılık dengesi',
              'Hollywood Smile: gülüş hattı ve oran odaklı tasarım',
              'Diş beyazlatma: mine rengine yönelik kısa süreli estetik iyileştirme',
              'Ortodonti / pembe estetik: hizalama ve diş eti uyumu',
            ],
          },
          {
            type: 'paragraph',
            text: 'Aktif diş eti hastalığı veya çürük varlığında estetik fazdan önce sağlıklı temelin kurulması gerekir. Sıralama, uzun ömürlü sonuç için kritiktir.',
          },
        ],
      },
      {
        title: 'Planlama ve Beklenti Yönetimi',
        blocks: [
          {
            type: 'paragraph',
            text: 'Dijital gülüş tasarımı, fotoğraf analizi ve gerekirse geçici prova ile sonuç öngörüsü güçlendirilebilir. Malzeme seçimi, ısırma kuvveti ve bakım alışkanlıklarına göre yapılır.',
          },
          {
            type: 'list',
            items: [
              'Fonksiyonel oklüzyon kontrolü',
              'Diş eti sağlığının stabilize edilmesi',
              'Estetik deneme / mock-up ihtiyacı',
              'Bakım ve kontrol aralıklarının belirlenmesi',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Fonksiyon + estetik birlikte planlama',
      'İmplant, zirkonyum ve gülüş tasarımı çerçevesi',
      'Aşamalı tedavi sıralaması',
      'Uzun dönem bakım odaklı yaklaşım',
    ],
    suitableFor: [
      'Gülüş tasarımı seçeneklerini araştıranlar',
      'Eksik diş veya kaplama ihtiyacı olan hastalar',
      'Kısa sürede planlı estetik çözüm arayanlar',
      'Uluslararası dental tedavi planı isteyenler',
    ],
    quickFacts: [
      { label: 'Değerlendirme', value: 'Klinik muayene + dijital planlama' },
      { label: 'Seans modeli', value: 'İşleme göre 1–6 seans' },
      { label: 'Süre', value: '30–120 dakika / seans' },
      { label: 'Odak', value: 'Dayanıklılık, oran ve doğal gülüş' },
    ],
    process: [
      {
        title: 'Muayene ve Analiz',
        description: 'Diş, diş eti ve ısırma ilişkisi değerlendirilir; öncelikli ihtiyaçlar sıralanır.',
      },
      {
        title: 'Gülüş / Restorasyon Planı',
        description: 'Malzeme, renk, form ve aşama planı netleştirilir.',
      },
      {
        title: 'Uygulama ve Kontroller',
        description: 'Tedavi uygulanır; uyum, hijyen ve uzun dönem takip planlanır.',
      },
    ],
    faqs: [
      {
        question: 'Hollywood Smile herkes için uygun mudur?',
        answer:
          'Hayır. Diş eti sağlığı, mine/dentin durumu ve ısırma ilişkisi uygun değilse önce hazırlık tedavileri gerekebilir. Uygunluk muayene ile belirlenir.',
      },
      {
        question: 'İmplant süreci ne kadar sürer?',
        answer:
          'Kemik ve yumuşak doku durumuna göre değişir. Bazı vakalarda aşamalı iyileşme gerekir; net takvim klinik değerlendirme sonrası verilir.',
      },
      {
        question: 'Zirkonyum ile laminate farkı nedir?',
        answer:
          'Zirkonyum kaplamalar genellikle daha kapsamlı restorasyonlarda tercih edilirken laminate yaklaşımlar daha konservatif mine preparasyonuyla gülüş tasarımında kullanılabilir. Seçim vaka özelidir.',
      },
      {
        question: 'Tedavi sonrası bakım nasıl olmalı?',
        answer:
          'Düzenli fırçalama, diş ipi/arayüz temizliği ve periyodik kontroller restorasyon ömrünü doğrudan etkiler. Size özel bakım önerileri paylaşılır.',
      },
    ],
  }),

  guidePage({
    category: 'medical',
    slug: 'medical-aesthetics-guide',
    navLabel: 'Medikal Estetik Rehberi',
    title: 'Medikal Estetik Rehberi',
    categoryLabel: 'Medikal Estetik',
    heroTag: 'Minimal İnvaziv Tedaviler',
    heroSubtitle: 'Botoks, dolgu, lazer ve cilt yenileme seçeneklerini bilinçli karşılaştırın',
    summary:
      'Medikal estetik rehberi; botoks, dudak/çene hattı dolgusu, lazer epilasyon ve cilt yenileme protokollerini güvenlik ve doğal sonuç odaklı açıklar.',
    overview: [
      'Medikal estetikte amaç abartılı değişim değil; yüz oranlarını koruyan, mimik doğallığını bozmayan ve cilt kalitesini destekleyen planlamadır.',
      'Bu rehber; botoks, dolgu, lazer ve cilt bakım protokollerinin hangi hedeflere hizmet ettiğini ve kombine planların nasıl düşünülmesi gerektiğini özetler.',
      'Dr. Otgen Clinic’te uygulamalar; anatomik değerlendirme, ürün/protokol seçimi ve seans aralığı yönetimiyle kişiye özel kurgulanır.',
    ],
    sections: [
      {
        title: 'Botoks ve Dolgu',
        blocks: [
          {
            type: 'paragraph',
            text: 'Botoks dinamik kırışıklıkların yumuşatılmasında; dolgu ise hacim kaybı, kontür ve oran düzenlemelerinde kullanılır. İki yaklaşım farklı mekanizmalara sahiptir ve birbirinin yerine geçmez.',
          },
          {
            type: 'list',
            items: [
              'Botoks: mimik çizgileri ve önleyici planlamalar',
              'Dudak dolgusu: form, simetri ve nem görünümü',
              'Çene hattı dolgusu: alt yüz dengesi ve kontür',
              'Göz altı uygulamaları: kişiye özel endikasyon değerlendirmesi',
            ],
          },
          {
            type: 'paragraph',
            text: 'Doğal sonuç için doz, ürün seçimi ve enjeksiyon düzlemi kadar “ne yapmamak gerektiği” de önemlidir.',
          },
        ],
      },
      {
        title: 'Cilt Kalitesi ve Lazer',
        blocks: [
          {
            type: 'paragraph',
            text: 'PRP, somon DNA, medikal cilt bakımı ve lazer protokolleri cilt dokusu, leke ve epilasyon hedeflerinde tamamlayıcı rol oynar. Seans aralığı cilt tipine göre ayarlanır.',
          },
          {
            type: 'list',
            items: [
              'Lazer epilasyon: kıl tipine uygun protokol seçimi',
              'Cilt yenileme: doku kalitesi ve ışıldama hedefleri',
              'Kombinasyon planları: botoks/dolgu ile zamanlama yönetimi',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Doğal mimik ve oran koruma yaklaşımı',
      'Botoks–dolgu ayrımının netleştirilmesi',
      'Cilt kalitesi ve lazer protokollerinin konumlandırılması',
      'Seans aralığı ve takip disiplini',
    ],
    suitableFor: [
      'Minimal invaziv estetik seçenekleri araştıranlar',
      'Yüz oranını koruyarak ince rötuş isteyenler',
      'Cilt kalitesi ve epilasyon programı planlayanlar',
      'Kombinasyon tedavi yol haritası isteyen hastalar',
    ],
    quickFacts: [
      { label: 'Süre', value: 'Genellikle 20–60 dakika' },
      { label: 'Seans modeli', value: '1–6 seans (işleme göre)' },
      { label: 'Sosyal dönüş', value: 'Çoğu uygulamada aynı gün' },
      { label: 'Odak', value: 'Doğal sonuç + güvenlik' },
    ],
    process: [
      {
        title: 'Yüz / Cilt Analizi',
        description: 'Anatomi, cilt tipi ve hedefler değerlendirilir; öncelikli protokol belirlenir.',
      },
      {
        title: 'Uygulama Planı',
        description: 'Ürün, doz/alan ve seans aralığı netleştirilir.',
      },
      {
        title: 'Kontrol ve İdame',
        description: 'Sonuç izlenir; ihtiyaç halinde idame planı oluşturulur.',
      },
    ],
    faqs: [
      {
        question: 'Botoks ile dolgu aynı seansta yapılabilir mi?',
        answer:
          'Birçok vakada aynı seansta planlanabilir; ancak uygulama alanları ve şişlik riski dikkate alınarak sıra ve zamanlama klinik kararla belirlenir.',
      },
      {
        question: 'Medikal estetik sonuçları ne kadar sürer?',
        answer:
          'Botoks etkisi genelde aylık dönemlerle sınırlıdır; dolgu ve cilt protokolleri ürün/kişisel metabolizmaya göre değişir. İdame planı kişiye özeldir.',
      },
      {
        question: 'İşlem sonrası nelere dikkat edilmeli?',
        answer:
          'Uygulamaya göre sıcak ortam, yoğun egzersiz, makyaj ve baskıdan kaçınma önerileri değişir. Size özel aftercare listesi verilir.',
      },
      {
        question: 'Kimler için uygun olmayabilir?',
        answer:
          'Gebelik, emzirme, aktif enfeksiyon, bazı otoimmün durumlar veya ilgili alerji öyküsü sürecin ertelenmesine neden olabilir. Uygunluk muayene ile değerlendirilir.',
      },
    ],
  }),

  guidePage({
    category: 'longevity',
    slug: 'longevity-guide',
    navLabel: 'Longevity Rehberi',
    title: 'Longevity Rehberi',
    categoryLabel: 'Longevity',
    heroTag: 'Longevity',
    heroSubtitle: 'IV terapi, glutatyon, ozon ve wellness programlarını doğru konumlandırın',
    summary:
      'Longevity rehberi; IV terapiler, glutatyon, ozon, beslenme ve wellness programlarını koruyucu sağlık perspektifiyle açıklar.',
    overview: [
      'Longevity yaklaşımı tek bir “serum” veya kısa süreli detoks vaadinden ibaret değildir. Uyku, beslenme, hareket, stres yönetimi ve klinik değerlendirme birlikte ele alınmalıdır.',
      'Bu rehber; IV terapi, glutatyon, ozon ve wellness programlarının ne zaman destekleyici olabileceğini ve nasıl planlanması gerektiğini sade bir çerçevede sunar.',
      'Dr. Otgen Clinic’te protokoller kişiye özel ihtiyaç ve klinik uygunluk doğrultusunda kurgulanır; abartılı garanti dili kullanılmaz.',
    ],
    sections: [
      {
        title: 'Klinik Destek Protokolleri',
        blocks: [
          {
            type: 'paragraph',
            text: 'IV terapiler ve glutatyon uygulamaları; hekim değerlendirmesi sonrası, laboratuvar ve klinik öykü dikkate alınarak planlanabilir. Ozon terapisi de benzer şekilde endikasyon ve kontrendikasyon kontrolü gerektirir.',
          },
          {
            type: 'list',
            items: [
              'IV terapiler: kişiye özel destek protokolleri',
              'Glutatyon: antioksidan destek çerçevesinde değerlendirme',
              'Ozon terapi: klinik uygunluk sonrası planlama',
              'LPG ve beslenme: yaşam tarzı destek bileşenleri',
            ],
          },
          {
            type: 'paragraph',
            text: 'Wellness oteli / destinasyon programları (Bodrum, Kapadokya vb.) klinik tedavilerin tamamlayıcısı olarak konumlandırılabilir; tıbbi tedavinin yerine geçmez.',
          },
        ],
      },
      {
        title: 'Gerçekçi Beklenti ve Güvenlik',
        blocks: [
          {
            type: 'paragraph',
            text: 'Koruyucu sağlık programlarında ölçülebilir hedefler (enerji, toparlanma, yaşam kalitesi) tanımlanmalı; mucizevi iddialardan uzak durulmalıdır.',
          },
          {
            type: 'list',
            items: [
              'Ön değerlendirme ve gerekirse laboratuvar',
              'Protokol sıklığının kişiye göre ayarlanması',
              'İlaç etkileşimleri ve kontrendikasyon kontrolü',
              'Yaşam tarzı önerileriyle bütünleyici takip',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Koruyucu sağlık odaklı çerçeve',
      'IV, glutatyon ve ozon protokollerinin konumlandırılması',
      'Wellness programlarıyla klinik denge',
      'Gerçekçi beklenti ve güvenlik önceliği',
    ],
    suitableFor: [
      'Koruyucu sağlık ve wellness programı araştıranlar',
      'IV / glutatyon seçeneklerini anlamak isteyenler',
      'Destinasyon wellness ile klinik desteği birleştirmek isteyenler',
      'Yaşam kalitesi odaklı sürdürülebilir plan arayanlar',
    ],
    quickFacts: [
      { label: 'Süre', value: '30–90 dakika / seans' },
      { label: 'Model', value: 'Program bazlı periyodik plan' },
      { label: 'Dönüş', value: 'Çoğu protokolde aynı gün' },
      { label: 'Odak', value: 'Koruyucu sağlık + yaşam kalitesi' },
    ],
    process: [
      {
        title: 'Ön Değerlendirme',
        description: 'Öykü, ihtiyaçlar ve uygunluk kontrolüyle başlangıç çerçevesi belirlenir.',
      },
      {
        title: 'Protokol Seçimi',
        description: 'IV, glutatyon, ozon veya wellness bileşenleri kişiye özel planlanır.',
      },
      {
        title: 'Takip ve İdame',
        description: 'Yanıt izlenir; sıklık ve yaşam tarzı önerileri güncellenir.',
      },
    ],
    faqs: [
      {
        question: 'IV terapi herkese uygulanır mı?',
        answer:
          'Hayır. Klinik öykü, ilaç kullanımı ve gerekirse laboratuvar sonuçlarına göre uygunluk değerlendirilir. Uygun olmayan durumlarda alternatif plan önerilir.',
      },
      {
        question: 'Longevity programı tek seansta sonuç verir mi?',
        answer:
          'Kalıcı fayda genelde düzenli yaşam tarzı değişiklikleri ve ihtiyaç halinde tekrarlayan protokollerle ilişkilidir. Tek seans “kalıcı dönüşüm” vaadi taşımaz.',
      },
      {
        question: 'Wellness oteli programları tıbbi tedavi midir?',
        answer:
          'Hayır. Destinasyon wellness programları destekleyici deneyimlerdir; tanı ve tedavi yerine geçmez. Klinik ihtiyaçlar ayrı değerlendirilir.',
      },
      {
        question: 'Ne sıklıkla planlama yapılır?',
        answer:
          'Sıklık; hedef, klinik uygunluk ve verilen yanıta göre kişiselleştirilir. Standart bir “herkese aynı takvim” yaklaşımı uygulanmaz.',
      },
    ],
  }),
];

export const PILLAR_GUIDE_SLUGS = PILLAR_GUIDE_PAGES.map((page) => page.slug);
