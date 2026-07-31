import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const tr = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/privacy/tr.json'), 'utf8'));

const EN = {
  meta: {
    title: 'Privacy Notice on Processing of Personal Data | Dr Otgen Clinic',
    description:
      'Dr Otgen Clinic A.Ş. privacy notice on the collection, processing purposes, transfers and your rights under Turkish KVKK.',
  },
  documentTitle: 'DR OTGEN CLINIC A.Ş. PRIVACY NOTICE ON PROCESSING OF PERSONAL DATA',
  intro: [
    'As Dr Otgen Clinic A.Ş. (the "Clinic" or "Data Controller"), we attach great importance to processing and protecting the personal data of our patients, clients, employees and all persons contacting us in compliance with the Constitution of the Republic of Turkey, international treaties on human rights to which our country is a party, and the Personal Data Protection Law No. 6698 ("KVKK") and other applicable legislation.',
    'This privacy notice has been prepared under Article 10 of the KVKK to inform you about how your personal data are collected, the purposes of processing, the persons/institutions to whom they may be transferred, and your rights.',
  ],
  sections: [
    {
      heading: '1. Identity of the Data Controller',
      paragraphs: [
        'Pursuant to Law No. 6698 on the Protection of Personal Data, your personal data may be processed by Dr Otgen Clinic A.Ş. as data controller within the scope described below.',
      ],
    },
    {
      heading: '2. Your Personal Data Processed',
      paragraphs: [
        'Within the scope of the healthcare services provided by our Clinic, the following personal data may be processed:',
        'Identity Data: Your name, surname, Turkish ID number, passport number or temporary Turkish ID number, place and date of birth, marital status, gender and similar identity information.',
        'Contact Data: Your address, telephone number, e-mail address and similar contact details.',
        'Health Data (Special Categories of Personal Data): Your laboratory results, test results, examination data, appointment information, prescription information, medical history and, without limitation, all health data obtained during or as a result of medical diagnosis, treatment and care services.',
        'Financial Data: Your bank account number, IBAN, credit card information (only via POS device at the time of payment) and billing information.',
        'Visual and Audio Data: Security camera recordings when you visit our Clinic, and photo or video recordings taken to complete medical records.',
      ],
    },
    {
      heading: '3. Purposes of Processing Personal Data',
      paragraphs: ['Your personal data and special categories of personal data are processed for the following purposes, including:'],
      list: [
        'Conducting medical diagnosis, treatment and care services,',
        'Protecting public health and providing preventive medicine services,',
        'Planning and managing your appointments,',
        'Billing for the services we provide,',
        'Sharing requested information with the Ministry of Health and other public institutions under applicable legislation,',
        'Improving our healthcare services, measuring patient satisfaction and managing complaints,',
        'Ensuring in-clinic security (via camera systems),',
        'Fulfilling legal and regulatory requirements.',
      ],
    },
    {
      heading: '4. Transfer of Personal Data',
      paragraphs: [
        'Your personal data may be transferred under the conditions set out in Articles 8 and 9 of the KVKK and for the purposes listed above;',
      ],
      list: [
        'To the Ministry of Health of the Republic of Turkey, provincial health directorates and affiliated units,',
        'To the Social Security Institution (SGK),',
        'To private insurance companies (health, pension, life insurance and similar),',
        'To the General Directorate of Security and other law enforcement authorities,',
        'To the General Directorate of Civil Registration,',
        'To the Turkish Pharmacists\' Association,',
        'To authorized judicial authorities,',
        'To laboratories, medical centres, ambulance services, medical device providers and healthcare institutions with which we cooperate for medical diagnosis and treatment,',
        'To our lawyers in possible legal disputes and to our financial/tax advisers for financial and tax processes',
      ],
      paragraphsAfterList: ['within this scope.'],
    },
    {
      heading: '5. Method and Legal Basis of Data Collection',
      paragraphs: [
        'Your personal data are obtained verbally, in writing, visually or electronically so that the healthcare services provided by our Clinic can be carried out in accordance with standards and laws.',
        'Your data are collected and processed based on the legal grounds set out in Articles 5 and 6 of the KVKK, including:',
      ],
      list: [
        'Explicitly provided for by laws (Basic Law on Healthcare Services No. 3359, Decree Law No. 663, Patient Rights Regulation, etc.),',
        'Necessary to protect the life or physical integrity of a person who is unable to disclose consent due to physical impossibility or whose consent is not legally valid,',
        'Directly related to the establishment or performance of a contract,',
        'Necessary for the data controller to fulfil its legal obligation,',
        'Protection of public health, preventive medicine, medical diagnosis, treatment and care services, and planning and management of healthcare services and financing (for special categories of data)',
      ],
      paragraphsAfterList: ['as legal grounds.'],
    },
    {
      heading: '6. Your Rights under KVKK (Article 11)',
      paragraphs: [
        'Under Article 11 of the KVKK, you may exercise the following rights regarding your personal data by applying to our Clinic as Data Controller:',
      ],
      list: [
        'To learn whether your personal data are processed,',
        'To request information if your personal data have been processed,',
        'To learn the purpose of processing and whether they are used in accordance with that purpose,',
        'To know the third parties to whom your personal data are transferred domestically or abroad,',
        'To request correction if your personal data are incomplete or inaccurate,',
        'To request deletion or destruction of your personal data under the conditions set out in Article 7 of the KVKK,',
        'To request notification of correction, deletion or destruction to third parties to whom your data were transferred,',
        'To object to a result arising against you through analysis exclusively by automated systems,',
        'To request compensation for damage if you suffer harm due to unlawful processing of your personal data.',
      ],
    },
    {
      heading: '7. Contact',
      paragraphs: [
        'To exercise the rights listed above, you may submit your written application containing the information necessary to identify you and your explanations regarding the right you wish to exercise under Article 11 of the KVKK;',
        'Address: Anadolu Plaza No:23, Karşıyaka, İzmir, 35560, Türkiye',
        'E-mail: kvkk@drotgenclinic.com',
        'in person, via notary or by other methods specified in applicable legislation. Your applications will be concluded free of charge as soon as possible and within 30 (thirty) days at the latest depending on the nature of your request.',
      ],
    },
  ],
  webFormSection: {
    title: 'Website Appointment Form',
    items: [
      'Data collected: full name, phone, e-mail, message, selected service',
      'Form submission: transmitted via the FormSubmit service to the appointment mailbox drotgenclinic@gmail.com used by Dr Otgen Clinic.',
      'Purpose: evaluating the appointment request and contacting the user',
      'Retention: until the request is concluded',
      'Transfer: with respect to form inputs, no transfer is made to any recipient other than FormSubmit.',
    ],
  },
  locationsSection: {
    title: 'Clinic Locations',
    branches: [
      { name: 'Izmir', address: 'Anadolu Plaza No:23, Karşıyaka, İzmir, 35560, Türkiye' },
      { name: 'Denizli', address: 'Merkez Efendi, 29 Ekim Blv. No:102, 20010 Denizli Merkezefendi/Denizli' },
      { name: 'Leverkusen', address: 'Münsters Gäßchen 14, 51375 Leverkusen, Germany' },
    ],
    sharedPhoneLabel: 'Shared phone',
    sharedPhone: '0541 159 56 36',
    sharedWhatsappLabel: 'Shared WhatsApp',
    sharedWhatsapp: 'https://wa.me/905411595636',
    sharedEmailLabel: 'Shared e-mail',
    sharedEmail: 'info@drotgenclinic.com',
    hoursLabel: 'Opening hours',
    hoursWeekdays: 'Monday–Saturday: 08:00–17:00',
    hoursSunday: 'Sunday: Closed',
  },
  signature: 'Dr Otgen Clinic A.Ş.',
  backLinkLabel: 'Back to Home',
  footerLinkLabel: 'Privacy & KVKK',
  consentLabelHtml:
    'I have read the <a href="/en/privacy.html" data-privacy-link>Privacy Notice on Processing of Personal Data</a>. I consent to the processing of my personal data for the purpose of evaluating my appointment request.',
};

function cloneWithLabels(locale, labels, body) {
  return {
    ...body,
    meta: labels.meta,
    documentTitle: labels.documentTitle,
    webFormSection: { ...body.webFormSection, title: labels.webFormTitle, items: body.webFormSection.items },
    locationsSection: {
      ...body.locationsSection,
      title: labels.locationsTitle,
      sharedPhoneLabel: labels.sharedPhoneLabel,
      sharedWhatsappLabel: labels.sharedWhatsappLabel,
      sharedEmailLabel: labels.sharedEmailLabel,
      hoursLabel: labels.hoursLabel,
      hoursWeekdays: labels.hoursWeekdays,
      hoursSunday: labels.hoursSunday,
    },
    signature: 'Dr Otgen Clinic A.Ş.',
    backLinkLabel: labels.backLinkLabel,
    footerLinkLabel: labels.footerLinkLabel,
    consentLabelHtml: labels.consentLabelHtml,
  };
}

writeFileSync(resolve(ROOT, 'src/i18n/privacy/en.json'), `${JSON.stringify(EN, null, 2)}\n`);

const fromEn = (locale, labels) => {
  const content = cloneWithLabels(locale, labels, EN);
  writeFileSync(resolve(ROOT, `src/i18n/privacy/${locale}.json`), `${JSON.stringify(content, null, 2)}\n`);
};

fromEn('de', {
  meta: { title: 'Datenschutzhinweis zur Verarbeitung personenbezogener Daten | Dr Otgen Clinic', description: 'Datenschutzhinweis der Dr Otgen Clinic A.Ş. zur Erhebung, Verarbeitung, Übermittlung und Ihren Rechten nach dem türkischen KVKK.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. DATENSCHUTZHINWEIS ZUR VERARBEITUNG PERSONENBEZOGENER DATEN',
  webFormTitle: 'Website-Terminformular',
  locationsTitle: 'Klinikstandorte',
  sharedPhoneLabel: 'Gemeinsame Telefonnummer',
  sharedWhatsappLabel: 'Gemeinsame WhatsApp',
  sharedEmailLabel: 'Gemeinsame E-Mail',
  hoursLabel: 'Öffnungszeiten',
  hoursWeekdays: 'Montag–Samstag: 08:00–17:00',
  hoursSunday: 'Sonntag: Geschlossen',
  backLinkLabel: 'Zur Startseite',
  footerLinkLabel: 'Datenschutz & KVKK',
  consentLabelHtml: 'Ich habe die <a href="/de/privacy.html" data-privacy-link>Datenschutzhinweise zur Verarbeitung personenbezogener Daten</a> gelesen. Ich stimme der Verarbeitung meiner personenbezogenen Daten zum Zweck der Bearbeitung meiner Terminanfrage zu.',
});

fromEn('es', {
  meta: { title: 'Aviso de privacidad sobre el tratamiento de datos personales | Dr Otgen Clinic', description: 'Aviso de privacidad de Dr Otgen Clinic A.Ş. sobre recopilación, fines de tratamiento, transferencias y sus derechos bajo la KVKK turca.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. AVISO DE PRIVACIDAD SOBRE EL TRATAMIENTO DE DATOS PERSONALES',
  webFormTitle: 'Formulario de cita del sitio web',
  locationsTitle: 'Ubicaciones de la clínica',
  sharedPhoneLabel: 'Teléfono compartido',
  sharedWhatsappLabel: 'WhatsApp compartido',
  sharedEmailLabel: 'Correo compartido',
  hoursLabel: 'Horario de atención',
  hoursWeekdays: 'Lunes–Sábado: 08:00–17:00',
  hoursSunday: 'Domingo: Cerrado',
  backLinkLabel: 'Volver al inicio',
  footerLinkLabel: 'Privacidad y KVKK',
  consentLabelHtml: 'He leído el <a href="/es/privacy.html" data-privacy-link>Aviso de privacidad sobre el tratamiento de datos personales</a>. Acepto el tratamiento de mis datos personales con el fin de evaluar mi solicitud de cita.',
});

fromEn('fr', {
  meta: { title: 'Notice de confidentialité relative au traitement des données personnelles | Dr Otgen Clinic', description: 'Notice de confidentialité de Dr Otgen Clinic A.Ş. sur la collecte, les finalités, les transferts et vos droits au titre de la KVKK turque.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. NOTICE DE CONFIDENTIALITÉ RELATIVE AU TRAITEMENT DES DONNÉES PERSONNELLES',
  webFormTitle: 'Formulaire de rendez-vous du site web',
  locationsTitle: 'Emplacements des cliniques',
  sharedPhoneLabel: 'Téléphone commun',
  sharedWhatsappLabel: 'WhatsApp commun',
  sharedEmailLabel: 'E-mail commun',
  hoursLabel: "Heures d'ouverture",
  hoursWeekdays: 'Lundi–Samedi : 08:00–17:00',
  hoursSunday: 'Dimanche : Fermé',
  backLinkLabel: "Retour à l'accueil",
  footerLinkLabel: 'Confidentialité et KVKK',
  consentLabelHtml: "J'ai lu la <a href=\"/fr/privacy.html\" data-privacy-link>notice de confidentialité relative au traitement des données personnelles</a>. J'accepte le traitement de mes données personnelles aux fins de l'évaluation de ma demande de rendez-vous.",
});

fromEn('it', {
  meta: { title: 'Informativa sulla privacy relativa al trattamento dei dati personali | Dr Otgen Clinic', description: 'Informativa privacy di Dr Otgen Clinic A.Ş. su raccolta, finalità, trasferimenti e diritti ai sensi del KVKK turco.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. INFORMATIVA SULLA PRIVACY RELATIVA AL TRATTAMENTO DEI DATI PERSONALI',
  webFormTitle: 'Modulo appuntamento del sito web',
  locationsTitle: 'Sedi della clinica',
  sharedPhoneLabel: 'Telefono condiviso',
  sharedWhatsappLabel: 'WhatsApp condiviso',
  sharedEmailLabel: 'E-mail condivisa',
  hoursLabel: 'Orari di apertura',
  hoursWeekdays: 'Lunedì–Sabato: 08:00–17:00',
  hoursSunday: 'Domenica: Chiuso',
  backLinkLabel: 'Torna alla home',
  footerLinkLabel: 'Privacy e KVKK',
  consentLabelHtml: "Ho letto l'<a href=\"/it/privacy.html\" data-privacy-link>Informativa sulla privacy relativa al trattamento dei dati personali</a>. Acconsento al trattamento dei miei dati personali ai fini della valutazione della mia richiesta di appuntamento.",
});

fromEn('ru', {
  meta: { title: 'Уведомление о конфиденциальности об обработке персональных данных | Dr Otgen Clinic', description: 'Уведомление Dr Otgen Clinic A.Ş. о сборе, целях обработки, передаче данных и ваших правах по турецкому KVKK.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. УВЕДОМЛЕНИЕ О КОНФИДЕНЦИАЛЬНОСТИ ОБ ОБРАБОТКЕ ПЕРСОНАЛЬНЫХ ДАННЫХ',
  webFormTitle: 'Форма записи на сайте',
  locationsTitle: 'Адреса клиник',
  sharedPhoneLabel: 'Общий телефон',
  sharedWhatsappLabel: 'Общий WhatsApp',
  sharedEmailLabel: 'Общий e-mail',
  hoursLabel: 'Часы работы',
  hoursWeekdays: 'Понедельник–Суббота: 08:00–17:00',
  hoursSunday: 'Воскресенье: Закрыто',
  backLinkLabel: 'На главную',
  footerLinkLabel: 'Конфиденциальность и KVKK',
  consentLabelHtml: 'Я прочитал(а) <a href="/ru/privacy.html" data-privacy-link>Уведомление о конфиденциальности об обработке персональных данных</a>. Я согласен(на) на обработку моих персональных данных для оценки моего запроса на запись.',
});

fromEn('ar', {
  meta: { title: 'إشعار الخصوصية المتعلق بمعالجة البيانات الشخصية | Dr Otgen Clinic', description: 'إشعار خصوصية Dr Otgen Clinic A.Ş. حول جمع البيانات وأغراض المعالجة والنقل وحقوقكم بموجب KVKK التركي.' },
  documentTitle: 'DR OTGEN CLINIC A.Ş. إشعار الخصوصية المتعلق بمعالجة البيانات الشخصية',
  webFormTitle: 'نموذج موعد الموقع',
  locationsTitle: 'مواقع العيادة',
  sharedPhoneLabel: 'الهاتف المشترك',
  sharedWhatsappLabel: 'واتساب المشترك',
  sharedEmailLabel: 'البريد الإلكتروني المشترك',
  hoursLabel: 'ساعات العمل',
  hoursWeekdays: 'الاثنين–السبت: 08:00–17:00',
  hoursSunday: 'الأحد: مغلق',
  backLinkLabel: 'العودة إلى الصفحة الرئيسية',
  footerLinkLabel: 'الخصوصية وKVKK',
  consentLabelHtml: 'لقد قرأت <a href="/ar/privacy.html" data-privacy-link>إشعار الخصوصية المتعلق بمعالجة البيانات الشخصية</a>. أوافق على معالجة بياناتي الشخصية لغرض تقييم طلب الموعد.',
});

console.log('[seed-privacy-locales] Wrote en, de, es, fr, it, ru, ar privacy content files');
