const WHATSAPP_NUMBER = '905411595636';

const CATEGORY_MESSAGES = {
  tr: {
    hair: 'Saç ekimi hakkında bilgi almak istiyorum.',
    dental: 'Diş estetiği hakkında bilgi almak istiyorum.',
    plastic: 'Estetik cerrahi için danışmanlık almak istiyorum.',
    medical: 'Medikal estetik hakkında bilgi almak istiyorum.',
    longevity: 'Longevity programları hakkında bilgi almak istiyorum.',
    corporate: 'Dr Otgen Clinic hakkında bilgi almak istiyorum.',
    default: 'Randevu ve bilgi almak istiyorum.',
  },
  en: {
    hair: 'I would like information about hair transplantation.',
    dental: 'I would like information about dental aesthetics.',
    plastic: 'I would like a consultation for aesthetic surgery.',
    medical: 'I would like information about medical aesthetics.',
    longevity: 'I would like information about longevity programs.',
    corporate: 'I would like information about Dr Otgen Clinic.',
    default: 'I would like to book an appointment and get information.',
  },
  de: {
    hair: 'Ich möchte Informationen zur Haartransplantation.',
    dental: 'Ich möchte Informationen zur Zahnästhetik.',
    plastic: 'Ich möchte eine Beratung zur ästhetischen Chirurgie.',
    medical: 'Ich möchte Informationen zur medizinischen Ästhetik.',
    longevity: 'Ich möchte Informationen zu Longevity-Programmen.',
    corporate: 'Ich möchte Informationen zur Dr Otgen Clinic.',
    default: 'Ich möchte einen Termin vereinbaren und Informationen erhalten.',
  },
  fr: {
    hair: 'Je souhaite des informations sur la greffe de cheveux.',
    dental: 'Je souhaite des informations sur l esthétique dentaire.',
    plastic: 'Je souhaite une consultation en chirurgie esthétique.',
    medical: 'Je souhaite des informations sur l esthétique médicale.',
    longevity: 'Je souhaite des informations sur les programmes longevity.',
    corporate: 'Je souhaite des informations sur Dr Otgen Clinic.',
    default: 'Je souhaite prendre rendez-vous et obtenir des informations.',
  },
  it: {
    hair: 'Vorrei informazioni sul trapianto di capelli.',
    dental: 'Vorrei informazioni sull estetica dentale.',
    plastic: 'Vorrei una consulenza per chirurgia estetica.',
    medical: 'Vorrei informazioni sull estetica medica.',
    longevity: 'Vorrei informazioni sui programmi longevity.',
    corporate: 'Vorrei informazioni su Dr Otgen Clinic.',
    default: 'Vorrei prenotare un appuntamento e ricevere informazioni.',
  },
  ru: {
    hair: 'Хочу получить информацию о пересадке волос.',
    dental: 'Хочу получить информацию о стоматологической эстетике.',
    plastic: 'Хочу получить консультацию по эстетической хирургии.',
    medical: 'Хочу получить информацию о медицинской эстетике.',
    longevity: 'Хочу получить информацию о программах longevity.',
    corporate: 'Хочу получить информацию о Dr Otgen Clinic.',
    default: 'Хочу записаться на приём и получить информацию.',
  },
  es: {
    hair: 'Me gustaría información sobre trasplante capilar.',
    dental: 'Me gustaría información sobre estética dental.',
    plastic: 'Me gustaría una consulta de cirugía estética.',
    medical: 'Me gustaría información sobre estética médica.',
    longevity: 'Me gustaría información sobre programas longevity.',
    corporate: 'Me gustaría información sobre Dr Otgen Clinic.',
    default: 'Me gustaría reservar una cita y obtener información.',
  },
  ar: {
    hair: 'أود الحصول على معلومات حول زراعة الشعر.',
    dental: 'أود الحصول على معلومات حول تجميل الأسنان.',
    plastic: 'أود استشارة حول الجراحة التجميلية.',
    medical: 'أود الحصول على معلومات حول التجميل الطبي.',
    longevity: 'أود الحصول على معلومات حول برامج longevity.',
    corporate: 'أود الحصول على معلومات حول عيادة Dr Otgen.',
    default: 'أود حجز موعد والحصول على معلومات.',
  },
};

function resolveMessage(locale, category, pageTitle) {
  const localeMessages = CATEGORY_MESSAGES[locale] || CATEGORY_MESSAGES.tr;
  const base = localeMessages[category] || localeMessages.default;
  if (!pageTitle) return base;
  return `${base} (${pageTitle})`;
}

export function buildWhatsAppUrl({ locale = 'tr', category = 'default', pageTitle = '' } = {}) {
  const text = resolveMessage(locale, category, pageTitle);
  const params = new URLSearchParams({ text });
  return `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;
}

export function renderWhatsAppFloat({ locale, category, pageTitle, ariaLabel = 'WhatsApp' }) {
  const href = buildWhatsAppUrl({ locale, category, pageTitle });
  return `
    <a href="${href}" target="_blank" rel="noopener noreferrer" class="whatsapp-float" aria-label="${ariaLabel}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  `.trim();
}
