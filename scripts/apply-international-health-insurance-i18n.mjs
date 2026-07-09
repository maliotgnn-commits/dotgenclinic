import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];

const PAGE_BY_LOCALE = {
  en: {
    navLabel: 'International Health Insurance',
    title: 'International Health Insurance',
    categoryLabel: 'Corporate',
    heroTag: 'Corporate Information',
    heroSubtitle: 'International Insurance Agreements: Covered with Bupa Global and Cigna Healthcare',
    summary: 'Through agreements with Bupa Global and Cigna Healthcare, Dr Otgen Clinic provides international patients with safe and comprehensive healthcare support across aesthetic, hair, dental, medical aesthetic and longevity services.',
    overview: [
      'At Dr Otgen Clinic, we are proud to offer our international patients access to aesthetic, hair, dental, medical aesthetic and longevity services delivered to global standards.',
      'To fully support you throughout your healthcare journey, we work under agreements with Bupa Global and Cigna Healthcare, two of the world\'s leading health insurance providers.',
    ],
    sections: [
      {
        title: 'Premium Healthcare Services with Bupa Global and Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global and Cigna Healthcare are established institutions providing comprehensive health insurance solutions to millions of people worldwide. Through Dr Otgen Clinic\'s agreements with these prestigious insurers, our international patients can benefit from the following advantages:',
          },
          {
            type: 'list',
            items: [
              'Extensive Medical Network: The broad contracted provider networks of both insurers ensure global access and flexibility throughout your treatment journey.',
              'Comprehensive Coverage: Your Bupa Global and Cigna Healthcare policies can cover many treatments and services at Dr Otgen Clinic, offering financial peace of mind so you can focus on your health.',
              'International Validity: Thanks to the international validity of your insurance, you remain covered for treatments received at Dr Otgen Clinic in Türkiye.',
            ],
          },
        ],
      },
      {
        title: 'Support Dr Otgen Clinic Provides to International Patients',
        blocks: [
          {
            type: 'paragraph',
            text: 'At Dr Otgen Clinic, we offer dedicated services to help international patients experience their treatment journey as comfortably and smoothly as possible:',
          },
          {
            type: 'list',
            items: [
              'Patient Coordination: A dedicated patient coordinator accompanies you through every stage, from treatment planning to travel arrangements.',
              'Multilingual Support: Our team communicates in multiple languages, so you experience no language barriers during your treatment.',
              'Modern Treatment Approaches: With specialist physicians and advanced technology, we deliver personalized and highly effective treatment methods.',
            ],
          },
        ],
      },
      {
        title: 'Access Our Services with Your Bupa Global or Cigna Healthcare Insurance',
        blocks: [
          {
            type: 'paragraph',
            text: 'If you hold Bupa Global or Cigna Healthcare insurance, you can easily benefit from the premium aesthetic and healthcare services offered by Dr Otgen Clinic. Contact us for detailed information about treatment planning and your insurance coverage.',
          },
          {
            type: 'paragraph',
            text: 'For your health and beauty, Dr Otgen Clinic stands by you with the assurance of Bupa Global and Cigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'Agreements with Bupa Global and Cigna Healthcare',
      'Internationally valid insurance coverage',
      'Multilingual patient coordination',
      'Premium aesthetic and healthcare services',
    ],
    suitableFor: [
      'International patients with Bupa Global insurance',
      'International patients with Cigna Healthcare insurance',
      'Those seeking information about insurance coverage during treatment planning',
      'International patients looking for a trusted clinic in Türkiye',
    ],
    quickFacts: [
      { label: 'Partner Insurers', value: 'Bupa Global and Cigna Healthcare' },
      { label: 'Support', value: 'International patient coordination' },
      { label: 'Communication', value: 'Multilingual team support' },
      { label: 'Scope', value: 'Aesthetic, hair, dental, medical aesthetic and longevity' },
    ],
    process: [
      { title: 'Insurance and Treatment Assessment', description: 'Your insurance coverage and treatment needs are assessed together to create a suitable care plan.' },
      { title: 'Planning and Coordination', description: 'Your treatment schedule, communication process and operational details are organized by your patient coordinator.' },
      { title: 'Treatment and Follow-up', description: 'Multilingual support and structured follow-up are provided throughout your treatment journey.' },
    ],
    faqs: [
      {
        question: 'Is my Bupa Global or Cigna Healthcare insurance valid at Dr Otgen Clinic?',
        answer: 'Dr Otgen Clinic provides services under agreements with Bupa Global and Cigna Healthcare. Coverage validity is assessed according to your policy; contact us for detailed information.',
      },
      {
        question: 'Which services may be covered by insurance?',
        answer: 'Many of our aesthetic, hair, dental, medical aesthetic and longevity services may be eligible for insurance coverage. Final coverage depends on your policy and treatment plan.',
      },
      {
        question: 'How is international patient support provided?',
        answer: 'A dedicated patient coordinator accompanies you, supporting treatment planning, travel arrangements and multilingual communication throughout the process.',
      },
    ],
  },
  de: {
    navLabel: 'Internationale Krankenversicherung',
    title: 'Internationale Krankenversicherung',
    categoryLabel: 'Unternehmen',
    heroTag: 'Unternehmensinformationen',
    heroSubtitle: 'Internationale Versicherungsvereinbarungen: Abgesichert mit Bupa Global und Cigna Healthcare',
    summary: 'Durch Vereinbarungen mit Bupa Global und Cigna Healthcare bietet Dr Otgen Clinic internationalen Patienten sichere und umfassende Gesundheitsunterstützung in den Bereichen Ästhetik, Haar, Zahn, medizinische Ästhetik und Longevity.',
    overview: [
      'Als Dr Otgen Clinic sind wir stolz darauf, internationalen Patienten Zugang zu ästhetischen, haar-, zahn-, medizinisch-ästhetischen und Longevity-Leistungen auf globalem Niveau zu bieten.',
      'Um Sie auf Ihrer Gesundheitsreise umfassend zu unterstützen, arbeiten wir vertraglich mit Bupa Global und Cigna Healthcare, zwei führenden internationalen Krankenversicherern, zusammen.',
    ],
    sections: [
      {
        title: 'Premium-Gesundheitsleistungen mit Bupa Global und Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global und Cigna Healthcare sind etablierte Institutionen, die Millionen von Menschen weltweit umfassende Krankenversicherungslösungen anbieten. Dank der Vereinbarungen von Dr Otgen Clinic mit diesen renommierten Versicherern können internationale Patienten folgende Vorteile nutzen:',
          },
          {
            type: 'list',
            items: [
              'Breites medizinisches Netzwerk: Die weltweit vertraglich angebundenen Netzwerke beider Versicherer ermöglichen globalen Zugang und Flexibilität während Ihrer Behandlung.',
              'Umfassende Leistungen: Ihre Bupa-Global- und Cigna-Healthcare-Policen können viele Behandlungen und Leistungen in der Dr Otgen Clinic abdecken und finanzielle Sicherheit bieten.',
              'Internationale Gültigkeit: Dank der internationalen Gültigkeit Ihrer Versicherung sind Sie auch für Behandlungen in der Dr Otgen Clinic in der Türkei abgesichert.',
            ],
          },
        ],
      },
      {
        title: 'Unterstützung für internationale Patienten bei Dr Otgen Clinic',
        blocks: [
          {
            type: 'paragraph',
            text: 'Als Dr Otgen Clinic bieten wir spezielle Leistungen, damit internationale Patienten ihren Behandlungsprozess so komfortabel und reibungslos wie möglich erleben:',
          },
          {
            type: 'list',
            items: [
              'Patientenkoordination: Ein persönlicher Patientenkoordinator begleitet Sie von der Behandlungsplanung bis zu Reiseorganisation.',
              'Mehrsprachige Betreuung: Unser Team kommuniziert in mehreren Sprachen, sodass keine Sprachbarrieren entstehen.',
              'Moderne Behandlungsansätze: Mit Fachärzten und modernster Technologie bieten wir personalisierte und wirksame Behandlungsmethoden.',
            ],
          },
        ],
      },
      {
        title: 'Nutzen Sie unsere Leistungen mit Ihrer Bupa- oder Cigna-Versicherung',
        blocks: [
          {
            type: 'paragraph',
            text: 'Wenn Sie über Bupa Global oder Cigna Healthcare versichert sind, können Sie problemlos von den Premium-Ästhetik- und Gesundheitsleistungen der Dr Otgen Clinic profitieren. Kontaktieren Sie uns für Details zu Behandlungsplanung und Versicherungsschutz.',
          },
          {
            type: 'paragraph',
            text: 'Für Ihre Gesundheit und Schönheit steht Dr Otgen Clinic mit der Absicherung von Bupa Global und Cigna Healthcare an Ihrer Seite.',
          },
        ],
      },
    ],
    highlights: [
      'Vereinbarungen mit Bupa Global und Cigna Healthcare',
      'International gültige Versicherungsleistungen',
      'Mehrsprachige Patientenkoordination',
      'Premium-Ästhetik- und Gesundheitsleistungen',
    ],
    suitableFor: [
      'Internationale Patienten mit Bupa-Global-Versicherung',
      'Internationale Patienten mit Cigna-Healthcare-Versicherung',
      'Personen, die Informationen zum Versicherungsschutz bei der Behandlungsplanung suchen',
      'Internationale Patienten, die eine vertrauenswürdige Klinik in der Türkei suchen',
    ],
    quickFacts: [
      { label: 'Partnerversicherer', value: 'Bupa Global und Cigna Healthcare' },
      { label: 'Unterstützung', value: 'Internationale Patientenkoordination' },
      { label: 'Kommunikation', value: 'Mehrsprachiges Team' },
      { label: 'Leistungsumfang', value: 'Ästhetik, Haar, Zahn, medizinische Ästhetik und Longevity' },
    ],
    process: [
      { title: 'Versicherungs- und Behandlungsbewertung', description: 'Versicherungsschutz und Behandlungsbedarf werden gemeinsam bewertet und ein passender Plan erstellt.' },
      { title: 'Planung und Koordination', description: 'Behandlungsplan, Kommunikation und operative Details werden von Ihrem Patientenkoordinator organisiert.' },
      { title: 'Behandlung und Nachsorge', description: 'Während der gesamten Behandlung erhalten Sie mehrsprachige Unterstützung und strukturierte Nachbetreuung.' },
    ],
    faqs: [
      {
        question: 'Ist meine Bupa-Global- oder Cigna-Healthcare-Versicherung in der Dr Otgen Clinic gültig?',
        answer: 'Dr Otgen Clinic arbeitet vertraglich mit Bupa Global und Cigna Healthcare zusammen. Die Gültigkeit des Versicherungsschutzes wird anhand Ihrer Police bewertet; kontaktieren Sie uns für Details.',
      },
      {
        question: 'Welche Leistungen können versichert sein?',
        answer: 'Viele unserer ästhetischen, haar-, zahn-, medizinisch-ästhetischen und Longevity-Leistungen können versichert sein. Der endgültige Umfang hängt von Ihrer Police und Ihrem Behandlungsplan ab.',
      },
      {
        question: 'Wie wird internationale Patientenbetreuung gewährleistet?',
        answer: 'Ein persönlicher Patientenkoordinator begleitet Sie und unterstützt bei Behandlungsplanung, Reiseorganisation und mehrsprachiger Kommunikation.',
      },
    ],
  },
  es: {
    navLabel: 'Seguro de Salud Internacional',
    title: 'Seguro de Salud Internacional',
    categoryLabel: 'Corporativo',
    heroTag: 'Información corporativa',
    heroSubtitle: 'Acuerdos de seguro internacional: protegido con Bupa Global y Cigna Healthcare',
    summary: 'Gracias a acuerdos con Bupa Global y Cigna Healthcare, Dr Otgen Clinic ofrece a pacientes internacionales apoyo sanitario seguro y completo en estética, salud capilar, estética dental, estética médica y longevity.',
    overview: [
      'En Dr Otgen Clinic, nos enorgullece ofrecer a nuestros pacientes internacionales acceso a servicios de estética, salud capilar, estética dental, estética médica y longevity con estándares globales.',
      'Para brindarle apoyo integral durante su proceso de salud, trabajamos bajo acuerdos con Bupa Global y Cigna Healthcare, dos de los principales proveedores de seguros de salud del mundo.',
    ],
    sections: [
      {
        title: 'Servicios de salud premium con Bupa Global y Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global y Cigna Healthcare son instituciones consolidadas que ofrecen soluciones integrales de seguro de salud a millones de personas en todo el mundo. Gracias a los acuerdos de Dr Otgen Clinic con estos prestigiosos aseguradores, nuestros pacientes internacionales pueden beneficiarse de las siguientes ventajas:',
          },
          {
            type: 'list',
            items: [
              'Amplia red médica: Las extensas redes de centros concertados de ambas aseguradoras garantizan acceso global y flexibilidad durante su tratamiento.',
              'Coberturas integrales: Sus pólizas de Bupa Global y Cigna Healthcare pueden cubrir muchos tratamientos y servicios en Dr Otgen Clinic, ofreciendo tranquilidad financiera.',
              'Validez internacional: Gracias a la validez internacional de su seguro, también estará cubierto en los tratamientos recibidos en Dr Otgen Clinic en Turquía.',
            ],
          },
        ],
      },
      {
        title: 'Apoyo de Dr Otgen Clinic a pacientes internacionales',
        blocks: [
          {
            type: 'paragraph',
            text: 'En Dr Otgen Clinic, ofrecemos servicios especiales para que los pacientes internacionales vivan su proceso de tratamiento de la forma más cómoda y fluida posible:',
          },
          {
            type: 'list',
            items: [
              'Coordinación del paciente: Un coordinador personal le acompaña en todas las etapas, desde la planificación del tratamiento hasta los arreglos de viaje.',
              'Soporte multilingüe: Nuestro equipo se comunica en varios idiomas para que no haya barreras lingüísticas durante su tratamiento.',
              'Enfoques de tratamiento modernos: Con médicos especialistas y tecnología avanzada, ofrecemos métodos personalizados y eficaces.',
            ],
          },
        ],
      },
      {
        title: 'Acceda a nuestros servicios con su seguro Bupa Global o Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Si dispone de seguro Bupa Global o Cigna Healthcare, puede beneficiarse fácilmente de los servicios premium de estética y salud de Dr Otgen Clinic. Contáctenos para obtener información detallada sobre la planificación del tratamiento y su cobertura.',
          },
          {
            type: 'paragraph',
            text: 'Para su salud y belleza, Dr Otgen Clinic está a su lado con la garantía de Bupa Global y Cigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'Acuerdos con Bupa Global y Cigna Healthcare',
      'Coberturas de seguro válidas internacionalmente',
      'Coordinación multilingüe de pacientes',
      'Servicios premium de estética y salud',
    ],
    suitableFor: [
      'Pacientes internacionales con seguro Bupa Global',
      'Pacientes internacionales con seguro Cigna Healthcare',
      'Personas que buscan información sobre cobertura durante la planificación del tratamiento',
      'Pacientes internacionales que buscan una clínica de confianza en Turquía',
    ],
    quickFacts: [
      { label: 'Aseguradoras asociadas', value: 'Bupa Global y Cigna Healthcare' },
      { label: 'Apoyo', value: 'Coordinación de pacientes internacionales' },
      { label: 'Comunicación', value: 'Equipo multilingüe' },
      { label: 'Alcance', value: 'Estética, cabello, dental, estética médica y longevity' },
    ],
    process: [
      { title: 'Evaluación de seguro y tratamiento', description: 'Se evalúan juntos su cobertura y necesidades de tratamiento para crear un plan adecuado.' },
      { title: 'Planificación y coordinación', description: 'Su coordinador organiza el calendario de tratamiento, la comunicación y los detalles operativos.' },
      { title: 'Tratamiento y seguimiento', description: 'Se ofrece apoyo multilingüe y seguimiento estructurado durante todo el proceso.' },
    ],
    faqs: [
      {
        question: '¿Mi seguro Bupa Global o Cigna Healthcare es válido en Dr Otgen Clinic?',
        answer: 'Dr Otgen Clinic presta servicios bajo acuerdos con Bupa Global y Cigna Healthcare. La validez de la cobertura se evalúa según su póliza; contáctenos para más información.',
      },
      {
        question: '¿Qué servicios pueden estar cubiertos por el seguro?',
        answer: 'Muchos de nuestros servicios de estética, salud capilar, estética dental, estética médica y longevity pueden ser elegibles. La cobertura final depende de su póliza y plan de tratamiento.',
      },
      {
        question: '¿Cómo se proporciona el apoyo a pacientes internacionales?',
        answer: 'Un coordinador personal le acompaña y apoya la planificación del tratamiento, los arreglos de viaje y la comunicación multilingüe.',
      },
    ],
  },
  fr: {
    navLabel: 'Assurance Santé Internationale',
    title: 'Assurance Santé Internationale',
    categoryLabel: 'Entreprise',
    heroTag: 'Informations sur l\'entreprise',
    heroSubtitle: 'Accords d\'assurance internationale : protégé avec Bupa Global et Cigna Healthcare',
    summary: 'Grâce à des accords avec Bupa Global et Cigna Healthcare, Dr Otgen Clinic offre aux patients internationaux un soutien médical sûr et complet en esthétique, santé capillaire, esthétique dentaire, esthétique médicale et longevity.',
    overview: [
      'Chez Dr Otgen Clinic, nous sommes fiers d\'offrir à nos patients internationaux un accès à des services d\'esthétique, de santé capillaire, d\'esthétique dentaire, d\'esthétique médicale et de longevity conformes aux standards mondiaux.',
      'Pour vous accompagner pleinement tout au long de votre parcours de santé, nous travaillons avec Bupa Global et Cigna Healthcare, deux des principaux assureurs internationaux.',
    ],
    sections: [
      {
        title: 'Services de santé premium avec Bupa Global et Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global et Cigna Healthcare sont des institutions reconnues qui proposent des solutions d\'assurance santé complètes à des millions de personnes dans le monde. Grâce aux accords de Dr Otgen Clinic avec ces assureurs prestigieux, nos patients internationaux peuvent bénéficier des avantages suivants :',
          },
          {
            type: 'list',
            items: [
              'Réseau médical étendu : Les vastes réseaux de partenaires contractuels des deux assureurs garantissent un accès global et une flexibilité tout au long de votre traitement.',
              'Couvertures complètes : Vos polices Bupa Global et Cigna Healthcare peuvent couvrir de nombreux traitements et services à Dr Otgen Clinic, offrant une sécurité financière.',
              'Validité internationale : Grâce à la validité internationale de votre assurance, vous restez couvert pour les traitements reçus à Dr Otgen Clinic en Turquie.',
            ],
          },
        ],
      },
      {
        title: 'Soutien de Dr Otgen Clinic aux patients internationaux',
        blocks: [
          {
            type: 'paragraph',
            text: 'Chez Dr Otgen Clinic, nous proposons des services dédiés pour que les patients internationaux vivent leur parcours de traitement de la manière la plus confortable et fluide possible :',
          },
          {
            type: 'list',
            items: [
              'Coordination patient : Un coordinateur dédié vous accompagne à chaque étape, de la planification du traitement aux arrangements de voyage.',
              'Support multilingue : Notre équipe communique en plusieurs langues afin d\'éviter toute barrière linguistique.',
              'Approches de traitement modernes : Avec des médecins spécialistes et une technologie avancée, nous proposons des méthodes personnalisées et efficaces.',
            ],
          },
        ],
      },
      {
        title: 'Accédez à nos services avec votre assurance Bupa Global ou Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Si vous disposez d\'une assurance Bupa Global ou Cigna Healthcare, vous pouvez facilement bénéficier des services premium d\'esthétique et de santé de Dr Otgen Clinic. Contactez-nous pour des informations détaillées sur la planification du traitement et votre couverture.',
          },
          {
            type: 'paragraph',
            text: 'Pour votre santé et votre beauté, Dr Otgen Clinic est à vos côtés avec l\'assurance de Bupa Global et Cigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'Accords avec Bupa Global et Cigna Healthcare',
      'Couvertures d\'assurance valables internationalement',
      'Coordination multilingue des patients',
      'Services premium d\'esthétique et de santé',
    ],
    suitableFor: [
      'Patients internationaux assurés Bupa Global',
      'Patients internationaux assurés Cigna Healthcare',
      'Personnes souhaitant des informations sur la couverture lors de la planification du traitement',
      'Patients internationaux recherchant une clinique fiable en Turquie',
    ],
    quickFacts: [
      { label: 'Assureurs partenaires', value: 'Bupa Global et Cigna Healthcare' },
      { label: 'Soutien', value: 'Coordination des patients internationaux' },
      { label: 'Communication', value: 'Équipe multilingue' },
      { label: 'Portée', value: 'Esthétique, cheveux, dentaire, esthétique médicale et longevity' },
    ],
    process: [
      { title: 'Évaluation assurance et traitement', description: 'Votre couverture et vos besoins de traitement sont évalués ensemble pour établir un plan adapté.' },
      { title: 'Planification et coordination', description: 'Votre coordinateur organise le calendrier de traitement, la communication et les détails opérationnels.' },
      { title: 'Traitement et suivi', description: 'Un soutien multilingue et un suivi structuré sont assurés tout au long du parcours.' },
    ],
    faqs: [
      {
        question: 'Mon assurance Bupa Global ou Cigna Healthcare est-elle valable à Dr Otgen Clinic ?',
        answer: 'Dr Otgen Clinic travaille avec Bupa Global et Cigna Healthcare. La validité de la couverture est évaluée selon votre police ; contactez-nous pour plus de détails.',
      },
      {
        question: 'Quels services peuvent être couverts par l\'assurance ?',
        answer: 'De nombreux services d\'esthétique, de santé capillaire, d\'esthétique dentaire, d\'esthétique médicale et de longevity peuvent être éligibles. La couverture finale dépend de votre police et de votre plan de traitement.',
      },
      {
        question: 'Comment le soutien aux patients internationaux est-il assuré ?',
        answer: 'Un coordinateur dédié vous accompagne et soutient la planification du traitement, les arrangements de voyage et la communication multilingue.',
      },
    ],
  },
  it: {
    navLabel: 'Assicurazione Sanitaria Internazionale',
    title: 'Assicurazione Sanitaria Internazionale',
    categoryLabel: 'Aziendale',
    heroTag: 'Informazioni aziendali',
    heroSubtitle: 'Accordi assicurativi internazionali: protetti con Bupa Global e Cigna Healthcare',
    summary: 'Grazie agli accordi con Bupa Global e Cigna Healthcare, Dr Otgen Clinic offre ai pazienti internazionali un supporto sanitario sicuro e completo in estetica, salute dei capelli, estetica dentale, estetica medica e longevity.',
    overview: [
      'In Dr Otgen Clinic siamo orgogliosi di offrire ai nostri pazienti internazionali l\'accesso a servizi di estetica, salute dei capelli, estetica dentale, estetica medica e longevity secondo standard globali.',
      'Per supportarvi pienamente durante il vostro percorso di salute, collaboriamo con Bupa Global e Cigna Healthcare, due tra i principali provider assicurativi internazionali.',
    ],
    sections: [
      {
        title: 'Servizi sanitari premium con Bupa Global e Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global e Cigna Healthcare sono istituzioni consolidate che offrono soluzioni assicurative sanitarie complete a milioni di persone in tutto il mondo. Grazie agli accordi di Dr Otgen Clinic con questi prestigiosi assicuratori, i nostri pazienti internazionali possono beneficiare dei seguenti vantaggi:',
          },
          {
            type: 'list',
            items: [
              'Ampia rete medica: Le vaste reti di strutture convenzionate di entrambi gli assicuratori garantiscono accesso globale e flessibilità durante il trattamento.',
              'Coperture complete: Le polizze Bupa Global e Cigna Healthcare possono coprire molti trattamenti e servizi presso Dr Otgen Clinic, offrendo tranquillità finanziaria.',
              'Validità internazionale: Grazie alla validità internazionale dell\'assicurazione, restate coperti anche per i trattamenti ricevuti presso Dr Otgen Clinic in Turchia.',
            ],
          },
        ],
      },
      {
        title: 'Supporto di Dr Otgen Clinic ai pazienti internazionali',
        blocks: [
          {
            type: 'paragraph',
            text: 'In Dr Otgen Clinic offriamo servizi dedicati affinché i pazienti internazionali vivano il percorso di trattamento nel modo più confortevole e fluido possibile:',
          },
          {
            type: 'list',
            items: [
              'Coordinamento paziente: Un coordinatore dedicato vi accompagna in ogni fase, dalla pianificazione del trattamento agli arrangiamenti di viaggio.',
              'Supporto multilingue: Il nostro team comunica in più lingue per evitare barriere linguistiche durante il trattamento.',
              'Approcci terapeutici moderni: Con medici specialisti e tecnologia avanzata, offriamo metodi personalizzati ed efficaci.',
            ],
          },
        ],
      },
      {
        title: 'Accedete ai nostri servizi con la vostra assicurazione Bupa Global o Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Se disponete di un\'assicurazione Bupa Global o Cigna Healthcare, potete facilmente beneficiare dei servizi premium di estetica e salute di Dr Otgen Clinic. Contattateci per informazioni dettagliate sulla pianificazione del trattamento e sulla copertura assicurativa.',
          },
          {
            type: 'paragraph',
            text: 'Per la vostra salute e bellezza, Dr Otgen Clinic è al vostro fianco con la garanzia di Bupa Global e Cigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'Accordi con Bupa Global e Cigna Healthcare',
      'Coperture assicurative valide a livello internazionale',
      'Coordinamento multilingue dei pazienti',
      'Servizi premium di estetica e salute',
    ],
    suitableFor: [
      'Pazienti internazionali con assicurazione Bupa Global',
      'Pazienti internazionali con assicurazione Cigna Healthcare',
      'Chi cerca informazioni sulla copertura durante la pianificazione del trattamento',
      'Pazienti internazionali in cerca di una clinica affidabile in Turchia',
    ],
    quickFacts: [
      { label: 'Assicuratori partner', value: 'Bupa Global e Cigna Healthcare' },
      { label: 'Supporto', value: 'Coordinamento pazienti internazionali' },
      { label: 'Comunicazione', value: 'Team multilingue' },
      { label: 'Ambito', value: 'Estetica, capelli, dentale, estetica medica e longevity' },
    ],
    process: [
      { title: 'Valutazione assicurativa e del trattamento', description: 'La copertura e le esigenze di trattamento vengono valutate insieme per creare un piano adeguato.' },
      { title: 'Pianificazione e coordinamento', description: 'Il coordinatore organizza calendario del trattamento, comunicazione e dettagli operativi.' },
      { title: 'Trattamento e follow-up', description: 'Durante tutto il percorso vengono offerti supporto multilingue e follow-up strutturato.' },
    ],
    faqs: [
      {
        question: 'La mia assicurazione Bupa Global o Cigna Healthcare è valida presso Dr Otgen Clinic?',
        answer: 'Dr Otgen Clinic opera con accordi con Bupa Global e Cigna Healthcare. La validità della copertura viene valutata in base alla polizza; contattateci per maggiori dettagli.',
      },
      {
        question: 'Quali servizi possono essere coperti dall\'assicurazione?',
        answer: 'Molti dei nostri servizi di estetica, salute dei capelli, estetica dentale, estetica medica e longevity possono essere idonei. La copertura finale dipende dalla polizza e dal piano di trattamento.',
      },
      {
        question: 'Come viene garantito il supporto ai pazienti internazionali?',
        answer: 'Un coordinatore dedicato vi accompagna e supporta la pianificazione del trattamento, gli arrangiamenti di viaggio e la comunicazione multilingue.',
      },
    ],
  },
  ru: {
    navLabel: 'Международное медицинское страхование',
    title: 'Международное медицинское страхование',
    categoryLabel: 'Корпоративный',
    heroTag: 'Корпоративная информация',
    heroSubtitle: 'Международные страховые соглашения: защита с Bupa Global и Cigna Healthcare',
    summary: 'Благодаря соглашениям с Bupa Global и Cigna Healthcare клиника Dr Otgen Clinic обеспечивает международным пациентам безопасную и комплексную медицинскую поддержку в области эстетики, здоровья волос, стоматологической эстетики, медицинской эстетики и longevity.',
    overview: [
      'Клиника Dr Otgen Clinic с гордостью предоставляет международным пациентам доступ к эстетическим, трихологическим, стоматологическим, медико-эстетическим и longevity-услугам мирового уровня.',
      'Чтобы полностью поддержать вас на пути к здоровью, мы работаем по соглашениям с Bupa Global и Cigna Healthcare — ведущими международными страховщиками.',
    ],
    sections: [
      {
        title: 'Премиальные медицинские услуги с Bupa Global и Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global и Cigna Healthcare — это устоявшиеся организации, предоставляющие комплексные решения медицинского страхования миллионам людей по всему миру. Благодаря соглашениям Dr Otgen Clinic с этими престижными страховщиками наши международные пациенты могут воспользоваться следующими преимуществами:',
          },
          {
            type: 'list',
            items: [
              'Широкая медицинская сеть: обширные сети партнёрских учреждений обеих страховых компаний обеспечивают глобальный доступ и гибкость на протяжении лечения.',
              'Комплексное покрытие: полисы Bupa Global и Cigna Healthcare могут покрывать многие процедуры и услуги в Dr Otgen Clinic, обеспечивая финансовую уверенность.',
              'Международная действительность: благодаря международной действительности страховки вы остаётесь защищёнными при лечении в Dr Otgen Clinic в Турции.',
            ],
          },
        ],
      },
      {
        title: 'Поддержка международных пациентов в Dr Otgen Clinic',
        blocks: [
          {
            type: 'paragraph',
            text: 'В Dr Otgen Clinic мы предлагаем специальные услуги, чтобы международные пациенты проходили лечение максимально комфортно и без осложнений:',
          },
          {
            type: 'list',
            items: [
              'Координация пациента: персональный координатор сопровождает вас на всех этапах — от планирования лечения до организации поездки.',
              'Многоязычная поддержка: наша команда общается на разных языках, поэтому языковых барьеров не возникает.',
              'Современные подходы к лечению: с опытными врачами и передовыми технологиями мы предлагаем персонализированные и эффективные методы.',
            ],
          },
        ],
      },
      {
        title: 'Получите наши услуги по страховке Bupa Global или Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Если у вас есть страховка Bupa Global или Cigna Healthcare, вы можете легко воспользоваться премиальными эстетическими и медицинскими услугами Dr Otgen Clinic. Свяжитесь с нами для подробной информации о планировании лечения и страховом покрытии.',
          },
          {
            type: 'paragraph',
            text: 'Ради вашего здоровья и красоты Dr Otgen Clinic рядом с вами под защитой Bupa Global и Cigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'Соглашения с Bupa Global и Cigna Healthcare',
      'Международно действующие страховые покрытия',
      'Многоязычная координация пациентов',
      'Премиальные эстетические и медицинские услуги',
    ],
    suitableFor: [
      'Международные пациенты со страховкой Bupa Global',
      'Международные пациенты со страховкой Cigna Healthcare',
      'Те, кто ищет информацию о страховом покрытии при планировании лечения',
      'Международные пациенты, ищущие надёжную клинику в Турции',
    ],
    quickFacts: [
      { label: 'Партнёрские страховщики', value: 'Bupa Global и Cigna Healthcare' },
      { label: 'Поддержка', value: 'Координация международных пациентов' },
      { label: 'Коммуникация', value: 'Многоязычная команда' },
      { label: 'Охват', value: 'Эстетика, волосы, стоматология, мед. эстетика и longevity' },
    ],
    process: [
      { title: 'Оценка страховки и лечения', description: 'Страховое покрытие и потребности в лечении оцениваются совместно для составления подходящего плана.' },
      { title: 'Планирование и координация', description: 'Координатор организует график лечения, коммуникацию и операционные детали.' },
      { title: 'Лечение и сопровождение', description: 'На протяжении всего процесса предоставляется многоязычная поддержка и структурированное сопровождение.' },
    ],
    faqs: [
      {
        question: 'Действует ли моя страховка Bupa Global или Cigna Healthcare в Dr Otgen Clinic?',
        answer: 'Dr Otgen Clinic работает по соглашениям с Bupa Global и Cigna Healthcare. Действительность покрытия оценивается по вашему полису; свяжитесь с нами для подробностей.',
      },
      {
        question: 'Какие услуги могут быть покрыты страховкой?',
        answer: 'Многие наши услуги в области эстетики, здоровья волос, стоматологической эстетики, медицинской эстетики и longevity могут быть включены в покрытие. Окончательный объём зависит от полиса и плана лечения.',
      },
      {
        question: 'Как организована поддержка международных пациентов?',
        answer: 'Персональный координатор сопровождает вас и помогает с планированием лечения, организацией поездки и многоязычной коммуникацией.',
      },
    ],
  },
  ar: {
    navLabel: 'التأمين الصحي الدولي',
    title: 'التأمين الصحي الدولي',
    categoryLabel: 'الشركات',
    heroTag: 'معلومات الشركة',
    heroSubtitle: 'اتفاقيات التأمين الدولية: أنت بأمان مع Bupa Global وCigna Healthcare',
    summary: 'من خلال اتفاقيات مع Bupa Global وCigna Healthcare، تقدم عيادة Dr Otgen Clinic للمرضى الدوليين دعماً صحياً آمناً وشاملاً في التجميل وصحة الشعر وتجميل الأسنان والتجميل الطبي وخدمات longevity.',
    overview: [
      'في عيادة Dr Otgen Clinic، نفخر بتقديم خدمات التجميل وصحة الشعر وتجميل الأسنان والتجميل الطبي وlongevity للمرضى الدوليين وفق معايير عالمية.',
      'لدعمكم بالكامل خلال رحلتكم الصحية، نعمل بموجب اتفاقيات مع Bupa Global وCigna Healthcare، من أبرز مزودي التأمين الصحي في العالم.',
    ],
    sections: [
      {
        title: 'خدمات صحية متميزة مع Bupa Global وCigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'Bupa Global وCigna Healthcare مؤسستان راسختان تقدمان حلول تأمين صحي شاملة لملايين الأشخاص حول العالم. وبفضل اتفاقيات Dr Otgen Clinic مع هذين المزودين المرموقين، يمكن للمرضى الدوليين الاستفادة من المزايا التالية:',
          },
          {
            type: 'list',
            items: [
              'شبكة طبية واسعة: تضمن شبكات المؤسسات المتعاقدة الواسعة لدى شركتي التأمين وصولاً عالمياً ومرونة طوال رحلة العلاج.',
              'تغطيات شاملة: قد تغطي وثائق Bupa Global وCigna Healthcare العديد من العلاجات والخدمات في Dr Otgen Clinic، مما يمنحكم راحة مالية.',
              'صلاحية دولية: بفضل الصلاحية الدولية لوثيقتكم، تظلون مغطين بالعلاجات التي تتلقونها في Dr Otgen Clinic في تركيا.',
            ],
          },
        ],
      },
      {
        title: 'دعم Dr Otgen Clinic للمرضى الدوليين',
        blocks: [
          {
            type: 'paragraph',
            text: 'في Dr Otgen Clinic، نقدم خدمات مخصصة لمساعدة المرضى الدوليين على تجربة رحلة العلاج بأقصى درجات الراحة والسلاسة:',
          },
          {
            type: 'list',
            items: [
              'تنسيق المرضى: يرافقكم منسق مخصص في جميع المراحل من تخطيط العلاج إلى ترتيبات السفر.',
              'دعم متعدد اللغات: يتواصل فريقنا بعدة لغات حتى لا تواجهوا أي حواجز لغوية أثناء العلاج.',
              'مناهج علاج حديثة: مع أطباء متخصصين وتقنيات متقدمة، نقدم أساليب علاج شخصية وفعالة.',
            ],
          },
        ],
      },
      {
        title: 'استفيدوا من خدماتنا عبر تأمين Bupa Global أو Cigna Healthcare',
        blocks: [
          {
            type: 'paragraph',
            text: 'إذا كنتم تحملون تأمين Bupa Global أو Cigna Healthcare، يمكنكم بسهولة الاستفادة من خدمات التجميل والصحة المتميزة في Dr Otgen Clinic. تواصلوا معنا للحصول على معلومات مفصلة حول تخطيط العلاج ونطاق التغطية.',
          },
          {
            type: 'paragraph',
            text: 'من أجل صحتكم وجمالكم، Dr Otgen Clinic بجانبكم بضمان Bupa Global وCigna Healthcare.',
          },
        ],
      },
    ],
    highlights: [
      'اتفاقيات مع Bupa Global وCigna Healthcare',
      'تغطيات تأمينية سارية دولياً',
      'تنسيق متعدد اللغات للمرضى',
      'خدمات تجميل وصحة متميزة',
    ],
    suitableFor: [
      'المرضى الدوليون الحاملون لتأمين Bupa Global',
      'المرضى الدوليون الحاملون لتأمين Cigna Healthcare',
      'من يريدون معلومات عن التغطية التأمينية أثناء تخطيط العلاج',
      'المرضى الدوليون الباحثون عن عيادة موثوقة في تركيا',
    ],
    quickFacts: [
      { label: 'شركات التأمين الشريكة', value: 'Bupa Global وCigna Healthcare' },
      { label: 'الدعم', value: 'تنسيق المرضى الدوليين' },
      { label: 'التواصل', value: 'فريق متعدد اللغات' },
      { label: 'النطاق', value: 'تجميل، شعر، أسنان، تجميل طبي وlongevity' },
    ],
    process: [
      { title: 'تقييم التأمين والعلاج', description: 'يتم تقييم التغطية التأمينية واحتياجات العلاج معاً لإعداد خطة مناسبة.' },
      { title: 'التخطيط والتنسيق', description: 'ينظم منسق المريض جدول العلاج وعملية التواصل والتفاصيل التشغيلية.' },
      { title: 'العلاج والمتابعة', description: 'يُقدَّم دعم متعدد اللغات ومتابعة منظمة طوال رحلة العلاج.' },
    ],
    faqs: [
      {
        question: 'هل تأمين Bupa Global أو Cigna Healthcare ساري في Dr Otgen Clinic؟',
        answer: 'تقدم Dr Otgen Clinic خدماتها بموجب اتفاقيات مع Bupa Global وCigna Healthcare. تُقيَّم صلاحية التغطية وفق وثيقتكم؛ تواصلوا معنا للتفاصيل.',
      },
      {
        question: 'ما الخدمات التي قد تغطيها وثيقة التأمين؟',
        answer: 'قد تكون كثير من خدمات التجميل وصحة الشعر وتجميل الأسنان والتجميل الطبي وlongevity مؤهلة للتغطية. يعتمد النطاق النهائي على الوثيقة وخطة العلاج.',
      },
      {
        question: 'كيف يُقدَّم الدعم للمرضى الدوليين؟',
        answer: 'يرافقكم منسق مخصص ويدعم تخطيط العلاج وترتيبات السفر والتواصل متعدد اللغات.',
      },
    ],
  },
};

function mergePage(existing, translated) {
  return {
    ...existing,
    ...translated,
    images: existing.images,
    navAppendOnly: true,
    category: 'corporate',
    slug: 'international-health-insurance',
    suitableIntro: '',
  };
}

for (const locale of LOCALES) {
  const file = path.join(ROOT, 'src', 'i18n', 'content', `${locale}.json`);
  const catalog = JSON.parse(await fs.readFile(file, 'utf8'));
  const index = catalog.pages.findIndex((page) => page.slug === 'international-health-insurance');
  if (index === -1) {
    throw new Error(`[${locale}] international-health-insurance page not found`);
  }
  catalog.pages[index] = mergePage(catalog.pages[index], PAGE_BY_LOCALE[locale]);
  await fs.writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`[${locale}] updated international-health-insurance translations`);
}
