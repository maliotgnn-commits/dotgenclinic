import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SHARED_IMAGES = {
  hero: '/images/production/production-hero.png',
  content: '/images/production/mert-can-director.png',
};

const PRODUCTION_PAGES = {
  en: {
    navLabel: 'Production',
    title: 'Dr Otgen Clinic Production',
    categoryLabel: 'Corporate',
    heroTag: 'Corporate Information',
    heroSubtitle: 'Health and science stories told through the language of cinema',
    summary: 'Dr Otgen Clinic also communicates its work in health and science through creative production projects; our short films bring human stories together with a powerful cinematic language.',
    overview: [
      'Dr Otgen Clinic also tells its work in health and science through creative production projects. Our short film projects, directed by Mert Can, bring together human stories, awareness themes, and social messages through a strong cinematic language.',
      'The short films we produce are submitted to prestigious international short film festivals and competitions; the awards we have received in this field carry our creative vision to international platforms.',
      'In every project, we aim not only to produce a film, but to tell stories that leave a mark on the audience, make them think, and inspire them.',
    ],
    sections: [
      {
        title: 'Creative Storytelling and Direction',
        blocks: [
          { type: 'subheading', text: 'Director: Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, who directs our short film projects, adopts a cinematic approach that combines human-centered storytelling, a strong visual language, and themes of social awareness. In every shot, he aims to bring emotional depth and clarity of message together in the same frame.',
          },
          {
            type: 'paragraph',
            text: 'Our production process is built on disciplined planning, professional team coordination, and high production standards from script development to post-production.',
          },
        ],
      },
      {
        title: 'Festivals and International Recognition',
        blocks: [
          {
            type: 'paragraph',
            text: 'Our short films reach a wide audience through international festival programs and competitions. These platforms support our goal of creating social awareness beyond the scientific and health work we carry out as a clinic.',
          },
          {
            type: 'list',
            items: [
              'Submissions and screenings at prestigious international short film festivals',
              'International visibility through awards and official selections',
              'A distinctive cinematic language on themes of health, science, and human stories',
              'A production approach that integrates brand value with art and social impact',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Short film cinema projects',
      'International festival participation and awards',
      'Storytelling focused on awareness and social messages',
      'Professional production team and direction',
    ],
    suitableIntro: 'Our production projects are creative content initiatives independent of our clinical services.',
    suitableFor: [
      'Institutions seeking projects for cinema and short film festivals',
      'Stakeholders running health- and science-themed awareness campaigns',
      'Media and brand teams seeking creative production partnerships',
      'Audiences interested in original storytelling with a social message',
    ],
    quickFacts: [
      { label: 'Format', value: 'Short film cinema' },
      { label: 'Director', value: 'Mert Can' },
      { label: 'Focus', value: 'Health, science, and human stories' },
      { label: 'Access', value: 'International festival and competition platforms' },
    ],
    process: [
      {
        title: 'Concept and Script',
        description: 'The story idea, message, and target audience are clarified; the script and production plan are created.',
      },
      {
        title: 'Filming and Production',
        description: 'Filming is completed with a professional crew and equipment; direction and art direction processes are coordinated.',
      },
      {
        title: 'Post-Production and Festival Process',
        description: 'Editing, sound, and color work are completed; films are submitted to international festivals and competitions.',
      },
    ],
    faqs: [
      {
        question: 'Are production projects related to clinical services?',
        answer: 'Our production work consists of creative projects independent of our clinical services; it aims to tell health and science themes through the language of cinema.',
      },
      {
        question: 'On which platforms are the films shown?',
        answer: 'Our short films reach audiences through international festival programs, competitions, and select screening platforms.',
      },
      {
        question: 'How can collaboration or production requests be submitted?',
        answer: 'You can submit your request through our clinic communication channels for creative production collaborations; suitable projects are evaluated.',
      },
    ],
  },
  ar: {
    navLabel: 'الإنتاج',
    title: 'إنتاج Dr Otgen Clinic',
    categoryLabel: 'الشركات',
    heroTag: 'معلومات الشركة',
    heroSubtitle: 'قصص الصحة والعلم رواها لغة السينما',
    summary: 'تروي Dr Otgen Clinic أعمالها في مجال الصحة والعلم أيضًا من خلال مشاريع إنتاج إبداعية؛ أفلامنا القصيرة تجمع بين قصص الإنسان ولغة سينمائية قوية.',
    overview: [
      'تروي Dr Otgen Clinic أعمالها في مجال الصحة والعلم أيضًا من خلال مشاريع إنتاج إبداعية. مشاريع أفلامنا القصيرة التي يخرجها Mert Can تجمع بين قصص الإنسان وموضوعات التوعية والرسائل المجتمعية بلغة سينمائية قوية.',
      'تُرسل الأفلام القصيرة التي ننتجها إلى مهرجانات ومسابقات أفلام قصيرة دولية مرموقة؛ والجوائز التي حصلنا عليها في هذا المجال تنقل رؤيتنا الإبداعية إلى منصات دولية.',
      'في كل مشروع، لا نهدف فقط إلى إنتاج فيلم، بل إلى سرد قصص تترك أثرًا لدى المشاهد وتدفعه للتفكير وتلهمه.',
    ],
    sections: [
      {
        title: 'السرد الإبداعي والإخراج',
        blocks: [
          { type: 'subheading', text: 'المخرج: Mert Can' },
          {
            type: 'paragraph',
            text: 'يتبنى Mert Can، مخرج مشاريع أفلامنا القصيرة، نهجًا سينمائيًا يجمع بين سرد يركز على الإنسان ولغة بصرية قوية وموضوعات التوعية المجتمعية. في كل لقطة، يسعى إلى الجمع بين العمق العاطفي ووضوح الرسالة في الإطار نفسه.',
          },
          {
            type: 'paragraph',
            text: 'تقوم عملية الإنتاج لدينا على تخطيط منضبط وتنسيق احترافي للفريق ومعايير إنتاج عالية من تطوير السيناريو إلى ما بعد الإنتاج.',
          },
        ],
      },
      {
        title: 'المهرجانات والاعتراف الدولي',
        blocks: [
          {
            type: 'paragraph',
            text: 'تصل أفلامنا القصيرة إلى جمهور واسع من خلال برامج ومسابقات المهرجانات الدولية. تدعم هذه المنصات هدفنا في خلق توعية مجتمعية تتجاوز الأعمال العلمية والصحية التي ننفذها كعيادة.',
          },
          {
            type: 'list',
            items: [
              'التقديم والعرض في مهرجانات أفلام قصيرة دولية مرموقة',
              'ظهور دولي من خلال الجوائز وعمليات الاختيار',
              'لغة سينمائية مميزة في موضوعات الصحة والعلم وقصص الإنسان',
              'نهج إنتاج يدمج قيمة العلامة التجارية مع الفن والأثر المجتمعي',
            ],
          },
        ],
      },
    ],
    highlights: [
      'مشاريع أفلام قصيرة',
      'المشاركة في المهرجانات الدولية والجوائز',
      'سرد يركز على التوعية والرسائل المجتمعية',
      'فريق إنتاج محترف وإخراج',
    ],
    suitableIntro: 'مشاريع الإنتاج لدينا هي أعمال محتوى إبداعي مستقلة عن خدماتنا السريرية.',
    suitableFor: [
      'المؤسسات التي تبحث عن مشاريع لمهرجانات السينما والأفلام القصيرة',
      'الشركاء الذين ينفذون حملات توعية في مجال الصحة والعلم',
      'فرق الإعلام والعلامات التجارية التي تبحث عن شراكات إنتاج إبداعية',
      'المشاهدون المهتمون بسرد قصصي أصيل يحمل رسالة مجتمعية',
    ],
    quickFacts: [
      { label: 'الصيغة', value: 'أفلام قصيرة' },
      { label: 'المخرج', value: 'Mert Can' },
      { label: 'التركيز', value: 'الصحة والعلم وقصص الإنسان' },
      { label: 'الوصول', value: 'منصات المهرجانات والمسابقات الدولية' },
    ],
    process: [
      {
        title: 'المفهوم والسيناريو',
        description: 'يتم توضيح فكرة القصة والرسالة والجمهور المستهدف؛ ويُعد السيناريو وخطة الإنتاج.',
      },
      {
        title: 'التصوير والإنتاج',
        description: 'تُنجز عمليات التصوير بفريق ومعدات احترافية؛ ويُنسَّق الإخراج وإدارة الفن.',
      },
      {
        title: 'ما بعد الإنتاج وعملية المهرجانات',
        description: 'تُكمل أعمال المونتاج والصوت والألوان؛ وتُوجَّه الأفلام إلى طلبات المهرجانات والمسابقات الدولية.',
      },
    ],
    faqs: [
      {
        question: 'هل ترتبط مشاريع الإنتاج بالخدمات السريرية؟',
        answer: 'أعمال الإنتاج لدينا مشاريع إبداعية مستقلة عن خدماتنا السريرية؛ وتهدف إلى سرد موضوعات الصحة والعلم بلغة السينما.',
      },
      {
        question: 'على أي منصات تُعرض الأفلام؟',
        answer: 'تصل أفلامنا القصيرة إلى الجمهور من خلال برامج المهرجانات الدولية والمسابقات ومنصات العرض المختارة.',
      },
      {
        question: 'كيف يمكن تقديم طلب تعاون أو إنتاج؟',
        answer: 'يمكنكم إرسال طلبكم عبر قنوات التواصل في العيادة للتعاون الإنتاجي الإبداعي؛ ويتم تقييم المشاريع المناسبة.',
      },
    ],
  },
  es: {
    navLabel: 'Producción',
    title: 'Producción Dr Otgen Clinic',
    categoryLabel: 'Corporativo',
    heroTag: 'Información corporativa',
    heroSubtitle: 'Historias de salud y ciencia contadas con lenguaje cinematográfico',
    summary: 'Dr Otgen Clinic también comunica su trabajo en salud y ciencia a través de proyectos de producción creativa; nuestros cortometrajes unen historias humanas con un potente lenguaje cinematográfico.',
    overview: [
      'Dr Otgen Clinic también narra su trabajo en salud y ciencia mediante proyectos de producción creativa. Nuestros cortometrajes, dirigidos por Mert Can, combinan historias humanas, temas de concienciación y mensajes sociales con un fuerte lenguaje cinematográfico.',
      'Los cortometrajes que producimos se envían a prestigiosos festivales y concursos internacionales de cortometrajes; los premios obtenidos en este ámbito llevan nuestra visión creativa a plataformas internacionales.',
      'En cada proyecto, no buscamos solo producir una película, sino contar historias que dejen huella en el espectador, inviten a la reflexión e inspiren.',
    ],
    sections: [
      {
        title: 'Narrativa creativa y dirección',
        blocks: [
          { type: 'subheading', text: 'Director: Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, director de nuestros cortometrajes, adopta un enfoque cinematográfico que combina narrativa centrada en las personas, un lenguaje visual sólido y temas de concienciación social. En cada toma, busca reunir profundidad emocional y claridad del mensaje en el mismo encuadre.',
          },
          {
            type: 'paragraph',
            text: 'Nuestro proceso de producción se basa en una planificación disciplinada, coordinación profesional del equipo y altos estándares de producción, desde el desarrollo del guion hasta la postproducción.',
          },
        ],
      },
      {
        title: 'Festivales y reconocimiento internacional',
        blocks: [
          {
            type: 'paragraph',
            text: 'Nuestros cortometrajes llegan a una amplia audiencia a través de programas y concursos de festivales internacionales. Estas plataformas apoyan nuestro objetivo de generar concienciación social más allá del trabajo científico y sanitario que realizamos como clínica.',
          },
          {
            type: 'list',
            items: [
              'Presentación y proyección en prestigiosos festivales internacionales de cortometrajes',
              'Visibilidad internacional mediante premios y selecciones oficiales',
              'Lenguaje cinematográfico distintivo en temas de salud, ciencia e historias humanas',
              'Enfoque de producción que integra el valor de marca con el arte y el impacto social',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Proyectos de cortometrajes',
      'Participación en festivales internacionales y premios',
      'Narrativa centrada en la concienciación y mensajes sociales',
      'Equipo de producción profesional y dirección',
    ],
    suitableIntro: 'Nuestros proyectos de producción son iniciativas creativas independientes de nuestros servicios clínicos.',
    suitableFor: [
      'Instituciones que buscan proyectos para festivales de cine y cortometrajes',
      'Interesados en campañas de concienciación sobre salud y ciencia',
      'Equipos de medios y marcas que buscan colaboraciones de producción creativa',
      'Espectadores interesados en narrativas originales con mensaje social',
    ],
    quickFacts: [
      { label: 'Formato', value: 'Cortometraje' },
      { label: 'Director', value: 'Mert Can' },
      { label: 'Enfoque', value: 'Salud, ciencia e historias humanas' },
      { label: 'Acceso', value: 'Plataformas de festivales y concursos internacionales' },
    ],
    process: [
      {
        title: 'Concepto y guion',
        description: 'Se definen la idea, el mensaje y el público objetivo; se elabora el guion y el plan de producción.',
      },
      {
        title: 'Rodaje y producción',
        description: 'Se completan las grabaciones con equipo y material profesional; se coordinan la dirección y la dirección artística.',
      },
      {
        title: 'Postproducción y proceso de festivales',
        description: 'Se completan montaje, sonido y color; las películas se envían a festivales y concursos internacionales.',
      },
    ],
    faqs: [
      {
        question: '¿Los proyectos de producción están relacionados con los servicios clínicos?',
        answer: 'Nuestro trabajo de producción son proyectos creativos independientes de nuestros servicios clínicos; busca narrar temas de salud y ciencia con lenguaje cinematográfico.',
      },
      {
        question: '¿En qué plataformas se muestran las películas?',
        answer: 'Nuestros cortometrajes llegan al público a través de programas de festivales internacionales, concursos y plataformas selectas de proyección.',
      },
      {
        question: '¿Cómo se puede enviar una solicitud de colaboración o producción?',
        answer: 'Puede enviar su solicitud a través de nuestros canales de comunicación de la clínica para colaboraciones de producción creativa; se evalúan los proyectos adecuados.',
      },
    ],
  },
  fr: {
    navLabel: 'Production',
    title: 'Production Dr Otgen Clinic',
    categoryLabel: 'Entreprise',
    heroTag: 'Informations sur l\'entreprise',
    heroSubtitle: 'Des histoires de santé et de science racontées par le langage du cinéma',
    summary: 'Dr Otgen Clinic présente également son travail en santé et en science à travers des projets de production créative ; nos courts métrages associent des histoires humaines à un langage cinématographique fort.',
    overview: [
      'Dr Otgen Clinic raconte aussi son action en santé et en science à travers des projets de production créative. Nos courts métrages, réalisés par Mert Can, associent histoires humaines, thèmes de sensibilisation et messages sociaux dans un langage cinématographique fort.',
      'Les courts métrages que nous produisons sont soumis à des festivals et concours internationaux prestigieux ; les prix obtenus dans ce domaine portent notre vision créative sur des plateformes internationales.',
      'Dans chaque projet, nous visons non seulement à produire un film, mais à raconter des histoires qui marquent le spectateur, le font réfléchir et l\'inspirent.',
    ],
    sections: [
      {
        title: 'Narration créative et réalisation',
        blocks: [
          { type: 'subheading', text: 'Réalisateur : Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, réalisateur de nos courts métrages, adopte une approche cinématographique qui combine narration centrée sur l\'humain, langage visuel fort et thèmes de sensibilisation sociale. À chaque prise, il cherche à réunir profondeur émotionnelle et clarté du message dans le même cadre.',
          },
          {
            type: 'paragraph',
            text: 'Notre processus de production repose sur une planification rigoureuse, une coordination professionnelle de l\'équipe et des standards de production élevés, du développement du scénario à la post-production.',
          },
        ],
      },
      {
        title: 'Festivals et reconnaissance internationale',
        blocks: [
          {
            type: 'paragraph',
            text: 'Nos courts métrages touchent un large public via des programmes et concours de festivals internationaux. Ces plateformes soutiennent notre objectif de sensibilisation sociale au-delà du travail scientifique et de santé mené en clinique.',
          },
          {
            type: 'list',
            items: [
              'Candidatures et projections dans des festivals internationaux prestigieux de courts métrages',
              'Visibilité internationale grâce aux prix et aux sélections officielles',
              'Langage cinématographique distinctif autour de la santé, de la science et des histoires humaines',
              'Approche de production intégrant valeur de marque, art et impact social',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Projets de courts métrages',
      'Participation à des festivals internationaux et récompenses',
      'Narration axée sur la sensibilisation et les messages sociaux',
      'Équipe de production professionnelle et réalisation',
    ],
    suitableIntro: 'Nos projets de production sont des initiatives créatives indépendantes de nos services cliniques.',
    suitableFor: [
      'Institutions recherchant des projets pour festivals de cinéma et de courts métrages',
      'Partenaires menant des campagnes de sensibilisation sur la santé et la science',
      'Équipes médias et marques recherchant des partenariats de production créative',
      'Public intéressé par des récits originaux porteurs d\'un message social',
    ],
    quickFacts: [
      { label: 'Format', value: 'Court métrage' },
      { label: 'Réalisateur', value: 'Mert Can' },
      { label: 'Focus', value: 'Santé, science et histoires humaines' },
      { label: 'Accès', value: 'Plateformes de festivals et concours internationaux' },
    ],
    process: [
      {
        title: 'Concept et scénario',
        description: 'L\'idée, le message et le public cible sont clarifiés ; le scénario et le plan de production sont élaborés.',
      },
      {
        title: 'Tournage et production',
        description: 'Les prises de vues sont réalisées avec une équipe et un matériel professionnels ; direction et direction artistique sont coordonnées.',
      },
      {
        title: 'Post-production et processus festivalier',
        description: 'Montage, son et étalonnage sont finalisés ; les films sont soumis aux festivals et concours internationaux.',
      },
    ],
    faqs: [
      {
        question: 'Les projets de production sont-ils liés aux services cliniques ?',
        answer: 'Notre production regroupe des projets créatifs indépendants de nos services cliniques ; elle vise à raconter des thèmes de santé et de science par le langage du cinéma.',
      },
      {
        question: 'Sur quelles plateformes les films sont-ils diffusés ?',
        answer: 'Nos courts métrages rencontrent le public via des programmes de festivals internationaux, des concours et des plateformes de projection sélectionnées.',
      },
      {
        question: 'Comment transmettre une demande de collaboration ou de production ?',
        answer: 'Vous pouvez envoyer votre demande via nos canaux de communication de la clinique pour des collaborations de production créative ; les projets adaptés sont évalués.',
      },
    ],
  },
  it: {
    navLabel: 'Produzione',
    title: 'Produzione Dr Otgen Clinic',
    categoryLabel: 'Aziendale',
    heroTag: 'Informazioni aziendali',
    heroSubtitle: 'Storie di salute e scienza raccontate con il linguaggio del cinema',
    summary: 'Dr Otgen Clinic racconta anche il proprio lavoro in salute e scienza attraverso progetti di produzione creativa; i nostri cortometraggi uniscono storie umane a un potente linguaggio cinematografico.',
    overview: [
      'Dr Otgen Clinic racconta anche il proprio impegno in salute e scienza attraverso progetti di produzione creativa. I nostri cortometraggi, diretti da Mert Can, uniscono storie umane, temi di sensibilizzazione e messaggi sociali con un forte linguaggio cinematografico.',
      'I cortometraggi che produciamo vengono inviati a prestigiosi festival e concorsi internazionali di cortometraggi; i premi ottenuti in questo ambito portano la nostra visione creativa su piattaforme internazionali.',
      'In ogni progetto, non miriamo solo a produrre un film, ma a raccontare storie che lascino il segno nello spettatore, lo facciano riflettere e lo ispirino.',
    ],
    sections: [
      {
        title: 'Narrazione creativa e regia',
        blocks: [
          { type: 'subheading', text: 'Regista: Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, regista dei nostri cortometraggi, adotta un approccio cinematografico che combina narrazione centrata sulla persona, linguaggio visivo forte e temi di sensibilizzazione sociale. In ogni ripresa, mira a unire profondità emotiva e chiarezza del messaggio nello stesso inquadratura.',
          },
          {
            type: 'paragraph',
            text: 'Il nostro processo produttivo si basa su pianificazione disciplinata, coordinamento professionale del team e standard di produzione elevati, dallo sviluppo della sceneggiatura alla post-produzione.',
          },
        ],
      },
      {
        title: 'Festival e riconoscimento internazionale',
        blocks: [
          {
            type: 'paragraph',
            text: 'I nostri cortometraggi raggiungono un ampio pubblico attraverso programmi e concorsi di festival internazionali. Queste piattaforme sostengono il nostro obiettivo di sensibilizzazione sociale oltre il lavoro scientifico e sanitario svolto in clinica.',
          },
          {
            type: 'list',
            items: [
              'Candidature e proiezioni in prestigiosi festival internazionali di cortometraggi',
              'Visibilità internazionale tramite premi e selezioni ufficiali',
              'Linguaggio cinematografico distintivo su salute, scienza e storie umane',
              'Approccio produttivo che integra valore del brand, arte e impatto sociale',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Progetti di cortometraggi',
      'Partecipazione a festival internazionali e premi',
      'Narrazione incentrata su sensibilizzazione e messaggi sociali',
      'Team di produzione professionale e regia',
    ],
    suitableIntro: 'I nostri progetti di produzione sono iniziative creative indipendenti dai servizi clinici.',
    suitableFor: [
      'Istituzioni in cerca di progetti per festival del cinema e del cortometraggio',
      'Partner che conducono campagne di sensibilizzazione su salute e scienza',
      'Team media e brand in cerca di collaborazioni di produzione creativa',
      'Spettatori interessati a narrazioni originali con un messaggio sociale',
    ],
    quickFacts: [
      { label: 'Formato', value: 'Cortometraggio' },
      { label: 'Regista', value: 'Mert Can' },
      { label: 'Focus', value: 'Salute, scienza e storie umane' },
      { label: 'Accesso', value: 'Piattaforme di festival e concorsi internazionali' },
    ],
    process: [
      {
        title: 'Concept e sceneggiatura',
        description: 'Vengono definiti idea, messaggio e pubblico target; si elaborano sceneggiatura e piano di produzione.',
      },
      {
        title: 'Riprese e produzione',
        description: 'Le riprese vengono completate con crew e attrezzature professionali; si coordinano regia e direzione artistica.',
      },
      {
        title: 'Post-produzione e processo festivaliero',
        description: 'Si completano montaggio, audio e color grading; i film vengono inviati a festival e concorsi internazionali.',
      },
    ],
    faqs: [
      {
        question: 'I progetti di produzione sono collegati ai servizi clinici?',
        answer: 'Il nostro lavoro di produzione consiste in progetti creativi indipendenti dai servizi clinici; mira a raccontare temi di salute e scienza con il linguaggio del cinema.',
      },
      {
        question: 'Su quali piattaforme vengono mostrati i film?',
        answer: 'I nostri cortometraggi raggiungono il pubblico tramite programmi di festival internazionali, concorsi e piattaforme selezionate di proiezione.',
      },
      {
        question: 'Come inviare una richiesta di collaborazione o produzione?',
        answer: 'Potete inviare la richiesta attraverso i canali di comunicazione della clinica per collaborazioni di produzione creativa; i progetti idonei vengono valutati.',
      },
    ],
  },
  ru: {
    navLabel: 'Производство',
    title: 'Производство Dr Otgen Clinic',
    categoryLabel: 'Корпоративный',
    heroTag: 'Корпоративная информация',
    heroSubtitle: 'Истории о здоровье и науке, рассказанные языком кино',
    summary: 'Dr Otgen Clinic также рассказывает о своей работе в области здравоохранения и науки через творческие продакшн-проекты; наши короткометражные фильмы объединяют человеческие истории с выразительным киноязыком.',
    overview: [
      'Dr Otgen Clinic также рассказывает о своей работе в области здравоохранения и науки через творческие продакшн-проекты. Наши короткометражные проекты под руководством Mert Can объединяют человеческие истории, темы осведомленности и социальные послания с сильным киноязыком.',
      'Созданные нами короткометражные фильмы отправляются на престижные международные фестивали и конкурсы короткометражного кино; полученные нами награды выводят наше творческое видение на международные площадки.',
      'В каждом проекте мы стремимся не просто снять фильм, а рассказать истории, которые оставляют след у зрителя, заставляют задуматься и вдохновляют.',
    ],
    sections: [
      {
        title: 'Творческий рассказ и режиссура',
        blocks: [
          { type: 'subheading', text: 'Режиссёр: Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, режиссёр наших короткометражных проектов, придерживается кинематографического подхода, сочетающего человекоцентричное повествование, сильный визуальный язык и темы социальной осведомленности. В каждом кадре он стремится объединить эмоциональную глубину и ясность послания.',
          },
          {
            type: 'paragraph',
            text: 'Наш продакшн-процесс основан на дисциплинированном планировании, профессиональной координации команды и высоких стандартах производства — от разработки сценария до постпродакшна.',
          },
        ],
      },
      {
        title: 'Фестивали и международное признание',
        blocks: [
          {
            type: 'paragraph',
            text: 'Наши короткометражные фильмы достигают широкой аудитории через международные фестивальные программы и конкурсы. Эти площадки поддерживают нашу цель формировать общественную осведомленность за пределами научной и медицинской работы, которую мы ведём как клиника.',
          },
          {
            type: 'list',
            items: [
              'Подачи заявок и показы на престижных международных фестивалях короткометражного кино',
              'Международная видимость через награды и отборы',
              'Уникальный киноязык на темы здоровья, науки и человеческих историй',
              'Продакшн-подход, объединяющий ценность бренда с искусством и социальным влиянием',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Проекты короткометражного кино',
      'Участие в международных фестивалях и награды',
      'Повествование, ориентированное на осведомленность и социальные послания',
      'Профессиональная продакшн-команда и режиссура',
    ],
    suitableIntro: 'Наши продакшн-проекты — это творческие инициативы, не связанные с клиническими услугами.',
    suitableFor: [
      'Организации, ищущие проекты для кинофестивалей и фестивалей короткометражного кино',
      'Партнёры, проводящие кампании по темам здоровья и науки',
      'Медиа- и бренд-команды, ищущие творческие продакшн-партнёрства',
      'Зрители, интересующиеся оригинальным повествованием с социальным посланием',
    ],
    quickFacts: [
      { label: 'Формат', value: 'Короткометражное кино' },
      { label: 'Режиссёр', value: 'Mert Can' },
      { label: 'Фокус', value: 'Здоровье, наука и человеческие истории' },
      { label: 'Доступ', value: 'Международные фестивали и конкурсные площадки' },
    ],
    process: [
      {
        title: 'Концепция и сценарий',
        description: 'Уточняются идея истории, послание и целевая аудитория; создаются сценарий и план производства.',
      },
      {
        title: 'Съёмки и продакшн',
        description: 'Съёмки выполняются профессиональной командой и оборудованием; координируются режиссура и художественное руководство.',
      },
      {
        title: 'Постпродакшн и фестивальный процесс',
        description: 'Завершаются монтаж, звук и цветокоррекция; фильмы направляются на международные фестивали и конкурсы.',
      },
    ],
    faqs: [
      {
        question: 'Связаны ли продакшн-проекты с клиническими услугами?',
        answer: 'Наша продакшн-деятельность — это творческие проекты, независимые от клинических услуг; она направлена на рассказ о темах здоровья и науки языком кино.',
      },
      {
        question: 'На каких площадках показываются фильмы?',
        answer: 'Наши короткометражные фильмы доходят до зрителей через международные фестивальные программы, конкурсы и избранные показные платформы.',
      },
      {
        question: 'Как подать запрос на сотрудничество или продакшн?',
        answer: 'Вы можете направить запрос через каналы связи клиники для творческих продакшн-коллабораций; подходящие проекты рассматриваются.',
      },
    ],
  },
  de: {
    navLabel: 'Produktion',
    title: 'Dr Otgen Clinic Produktion',
    categoryLabel: 'Unternehmen',
    heroTag: 'Unternehmensinformationen',
    heroSubtitle: 'Geschichten über Gesundheit und Wissenschaft in der Sprache des Kinos',
    summary: 'Dr Otgen Clinic erzählt seine Arbeit in Gesundheit und Wissenschaft auch durch kreative Produktionsprojekte; unsere Kurzfilme verbinden menschliche Geschichten mit einer starken Filmsprache.',
    overview: [
      'Dr Otgen Clinic erzählt seine Arbeit in Gesundheit und Wissenschaft auch durch kreative Produktionsprojekte. Unsere Kurzfilmprojekte unter der Regie von Mert Can verbinden menschliche Geschichten, Bewusstseinsthemen und gesellschaftliche Botschaften mit einer starken Filmsprache.',
      'Die von uns produzierten Kurzfilme werden an renommierte internationale Kurzfilmfestivals und Wettbewerbe eingereicht; die in diesem Bereich gewonnenen Auszeichnungen tragen unsere kreative Vision auf internationale Plattformen.',
      'In jedem Projekt wollen wir nicht nur einen Film produzieren, sondern Geschichten erzählen, die beim Publikum Spuren hinterlassen, zum Nachdenken anregen und inspirieren.',
    ],
    sections: [
      {
        title: 'Kreatives Erzählen und Regie',
        blocks: [
          { type: 'subheading', text: 'Regisseur: Mert Can' },
          {
            type: 'paragraph',
            text: 'Mert Can, Regisseur unserer Kurzfilmprojekte, verfolgt einen filmischen Ansatz, der menschenzentriertes Erzählen, eine starke Bildsprache und Themen gesellschaftlicher Aufmerksamkeit verbindet. In jeder Einstellung zielt er darauf ab, emotionale Tiefe und Klarheit der Botschaft im selben Bild zu vereinen.',
          },
          {
            type: 'paragraph',
            text: 'Unser Produktionsprozess basiert auf disziplinierter Planung, professioneller Teamkoordination und hohen Produktionsstandards – von der Drehbuchentwicklung bis zur Postproduktion.',
          },
        ],
      },
      {
        title: 'Festivals und internationale Anerkennung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Unsere Kurzfilme erreichen ein breites Publikum über internationale Festivalprogramme und Wettbewerbe. Diese Plattformen unterstützen unser Ziel, gesellschaftliches Bewusstsein über die wissenschaftliche und gesundheitliche Arbeit hinaus zu schaffen, die wir als Klinik leisten.',
          },
          {
            type: 'list',
            items: [
              'Einreichungen und Vorführungen auf renommierten internationalen Kurzfilmfestivals',
              'Internationale Sichtbarkeit durch Auszeichnungen und offizielle Auswahlen',
              'Eine unverwechselbare Filmsprache zu Themen Gesundheit, Wissenschaft und menschliche Geschichten',
              'Ein Produktionsansatz, der Markenwert mit Kunst und gesellschaftlicher Wirkung verbindet',
            ],
          },
        ],
      },
    ],
    highlights: [
      'Kurzfilmprojekte',
      'Internationale Festivalteilnahmen und Auszeichnungen',
      'Erzählweise mit Fokus auf Bewusstsein und gesellschaftliche Botschaften',
      'Professionelles Produktionsteam und Regie',
    ],
    suitableIntro: 'Unsere Produktionsprojekte sind kreative Inhaltsinitiativen, die unabhängig von unseren klinischen Leistungen sind.',
    suitableFor: [
      'Institutionen, die Projekte für Kino- und Kurzfilmfestivals suchen',
      'Partner, die Awareness-Kampagnen zu Gesundheits- und Wissenschaftsthemen durchführen',
      'Medien- und Markenteams, die kreative Produktionspartnerschaften suchen',
      'Zuschauer mit Interesse an originellem Storytelling mit gesellschaftlicher Botschaft',
    ],
    quickFacts: [
      { label: 'Format', value: 'Kurzfilm' },
      { label: 'Regisseur', value: 'Mert Can' },
      { label: 'Fokus', value: 'Gesundheit, Wissenschaft und menschliche Geschichten' },
      { label: 'Zugang', value: 'Internationale Festival- und Wettbewerbsplattformen' },
    ],
    process: [
      {
        title: 'Konzept und Drehbuch',
        description: 'Story-Idee, Botschaft und Zielgruppe werden geklärt; Drehbuch und Produktionsplan werden erstellt.',
      },
      {
        title: 'Dreh und Produktion',
        description: 'Dreharbeiten werden mit professionellem Team und Equipment abgeschlossen; Regie und Art Direction werden koordiniert.',
      },
      {
        title: 'Postproduktion und Festivalprozess',
        description: 'Schnitt, Ton und Farbkorrektur werden abgeschlossen; Filme werden für internationale Festivals und Wettbewerbe eingereicht.',
      },
    ],
    faqs: [
      {
        question: 'Sind Produktionsprojekte mit klinischen Leistungen verbunden?',
        answer: 'Unsere Produktionsarbeit umfasst kreative Projekte, die unabhängig von unseren klinischen Leistungen sind; sie zielt darauf ab, Gesundheits- und Wissenschaftsthemen in Filmsprache zu erzählen.',
      },
      {
        question: 'Auf welchen Plattformen werden die Filme gezeigt?',
        answer: 'Unsere Kurzfilme erreichen das Publikum über internationale Festivalprogramme, Wettbewerbe und ausgewählte Vorführplattformen.',
      },
      {
        question: 'Wie kann eine Kooperations- oder Produktionsanfrage übermittelt werden?',
        answer: 'Sie können Ihre Anfrage über unsere Klinik-Kommunikationskanäle für kreative Produktionskooperationen senden; geeignete Projekte werden geprüft.',
      },
    ],
  },
};

for (const [locale, translated] of Object.entries(PRODUCTION_PAGES)) {
  const file = resolve(ROOT, `src/i18n/content/${locale}.json`);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const index = data.pages.findIndex((page) => page.slug === 'production');
  if (index === -1) {
    throw new Error(`production page not found in ${locale}.json`);
  }

  data.pages[index] = {
    category: 'corporate',
    slug: 'production',
    navAppendOnly: true,
    images: SHARED_IMAGES,
    ...translated,
  };

  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`[seed-production-translations] Updated ${locale}.json`);
}
