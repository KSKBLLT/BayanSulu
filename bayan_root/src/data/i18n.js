/**
 * i18n — Bayan Sulu bilingual string table
 * Keys are flat dot-notation strings.
 * ru = Russian, kz = Kazakh (Cyrillic)
 */

export const translations = {
  /* ── App-wide ── */
  'app.name':            { ru: 'Баян Сулу',        kz: 'Баян Сұлу' },
  'app.tagline':         { ru: 'Путешествие по Казахстану', kz: 'Қазақстан бойынша саяхат' },

  /* ── Header screen titles ── */
  'screen.onboarding':   { ru: 'Баян Сулу',        kz: 'Баян Сұлу' },
  'screen.map':          { ru: 'Карта путешествия', kz: 'Саяхат картасы' },
  'screen.reward':       { ru: 'Награда',           kz: 'Марапат' },
  'screen.studio':       { ru: 'Мир Боты',          kz: 'Боты әлемі' },
  'screen.shop':         { ru: 'Призы',             kz: 'Сыйлықтар' },
  'screen.parent':       { ru: 'Родителям',         kz: 'Ата-аналарға' },
  'screen.cards':        { ru: 'Карточки знаний',   kz: 'Білім карточкалары' },
  'screen.math':         { ru: 'Счёт с КамБотом',   kz: 'КамБотпен санаймыз' },
  'screen.memory':       { ru: 'Найди пару',         kz: 'Жұпты тап' },
  'screen.words':        { ru: 'Қазақша сөздер',    kz: 'Қазақша сөздер' },
  'screen.qr':           { ru: 'QR-сканер',         kz: 'QR-сканер' },
  'screen.analytics':    { ru: 'Аналитика',         kz: 'Аналитика' },
  'screen.dev':          { ru: 'Dev Console',       kz: 'Dev Console' },

  /* ── Bottom nav labels ── */
  'nav.map':             { ru: 'Карта',             kz: 'Карта' },
  'nav.studio':          { ru: 'Мой мир',           kz: 'Менің әлемім' },
  'nav.cards':           { ru: 'Знания',            kz: 'Білім' },
  'nav.shop':            { ru: 'Призы',             kz: 'Сыйлықтар' },
  'nav.parent':          { ru: 'Родителям',         kz: 'Ата-аналарға' },

  /* ── Common UI ── */
  'ui.back':             { ru: '←',                kz: '←' },
  'ui.next':             { ru: 'Дальше →',          kz: 'Келесі →' },
  'ui.play':             { ru: '▶ Играть',          kz: '▶ Ойнау' },
  'ui.playAgain':        { ru: '▶ Сыграть снова',   kz: '▶ Қайта ойнау' },
  'ui.playAll':          { ru: '🏆 Всё пройдено!',  kz: '🏆 Бәрі аяқталды!' },
  'ui.coins':            { ru: 'ботакоинов',        kz: 'ботакоин' },

  /* ── MapPage ── */
  'map.completed':       { ru: 'пройдено',          kz: 'өтілді' },
  'map.qrLocations':     { ru: 'QR локации',        kz: 'QR орындар' },
  'map.progress':        { ru: 'Пройдено',          kz: 'Өтілді' },
  'map.progressOf':      { ru: 'из',               kz: 'ның' },
  'map.chest.title':     { ru: 'Ежедневный сундук', kz: 'Күнделікті сандық' },
  'map.chest.sub':       { ru: 'Пройди одно задание — получи бонус', kz: 'Бір тапсырма орында — бонус ал' },
  'map.chest.open':      { ru: '✓ Открыт',          kz: '✓ Ашылды' },
  'map.chest.locked':    { ru: '🔒 Закрыт',         kz: '🔒 Жабық' },
  'map.play':            { ru: '▶ Играть',          kz: '▶ Ойнау' },
  'map.playAgain':       { ru: '▶ Сыграть снова',   kz: '▶ Қайта ойнау' },

  /* ── Onboarding ── */
  'onb.badge':           { ru: '🇰🇿 Путешествие по Казахстану', kz: '🇰🇿 Қазақстан бойынша саяхат' },
  'onb.greeting':        { ru: 'Сәлем! Я КамБот — твой проводник! Пойдём?', kz: 'Сәлем! Мен КамБот — сенің жолбасшың! Жүреміз бе?' },
  'onb.title':           { ru: 'Привет! Я КамБот.',  kz: 'Сәлем! Мен КамБот.' },
  'onb.sub':             { ru: 'Вместе мы откроем 8 мест Казахстана, научимся считать и говорить по-казахски!', kz: 'Бірге Қазақстанның 8 орнын ашамыз, санауды және қазақша сөйлеуді үйренеміз!' },
  'onb.feat.locations':  { ru: '8 локаций',          kz: '8 орын' },
  'onb.feat.games':      { ru: '3 игры',             kz: '3 ойын' },
  'onb.feat.coins':      { ru: 'Ботакоины',          kz: 'Ботакоин' },
  'onb.start':           { ru: 'Начать путешествие! 🚀', kz: 'Саяхатты бастау! 🚀' },
  'onb.step.about':      { ru: 'Расскажи о себе',    kz: 'Өзің туралы айт' },
  'onb.name':            { ru: 'Имя',                kz: 'Атың' },
  'onb.namePlaceholder': { ru: 'Например, Алия или Нурлан', kz: 'Мысалы, Алия немесе Нұрлан' },
  'onb.age':             { ru: 'Возраст',            kz: 'Жасың' },
  'onb.companion':       { ru: 'Выбери спутника',    kz: 'Серігіңді таңда' },
  'onb.companionSub':    { ru: 'Он будет помогать тебе в путешествии', kz: 'Ол саяхатта саған көмектеседі' },
  'onb.thinking':        { ru: 'Как тебя зовут? Сколько лет?', kz: 'Атың кім? Жасың нешеде?' },
  'onb.goBtn':           { ru: 'В путь',             kz: 'Жолға' },

  /* ── RewardPage ── */
  'reward.new':          { ru: 'Новый предмет открыт!', kz: 'Жаңа зат ашылды!' },
  'reward.repeat':       { ru: 'Предмет уже открыт',  kz: 'Зат бұрын ашылған' },
  'reward.title':        { ru: 'Жарайсың! 🎉',        kz: 'Жарайсың! 🎉' },
  'reward.speech':       { ru: 'Смотри, что ты открыл!', kz: 'Қара, не аштың!' },
  'reward.earned':       { ru: 'Заработано:',         kz: 'Жиналды:' },
  'reward.toMap':        { ru: 'На карту →',          kz: 'Картаға →' },
  'reward.toStudio':     { ru: 'Посмотреть в мире →', kz: 'Әлемде қарау →' },

  /* ── QR Page ── */
  'qr.title':            { ru: 'Отсканируй QR-код',  kz: 'QR-кодты сканерлеңіз' },
  'qr.sub':              { ru: 'чтобы открыть эту локацию', kz: 'осы орынды ашу үшін' },
  'qr.back':             { ru: '← Назад',            kz: '← Артқа' },

  /* ── Shop Page ── */
  'shop.title':          { ru: 'Призы',              kz: 'Сыйлықтар' },
  'shop.coins':          { ru: 'ботакоинов',         kz: 'ботакоин' },
  'shop.request':        { ru: 'Попросить',          kz: 'Сұрау' },
  'shop.pending':        { ru: 'Ожидает',            kz: 'Күтілуде' },
  'shop.approved':       { ru: 'Одобрено',           kz: 'Мақұлданды' },

  /* ── Parent Mode ── */
  'parent.title':        { ru: 'Родительский режим', kz: 'Ата-ана режимі' },
  'parent.analytics':    { ru: 'Аналитика →',        kz: 'Аналитика →' },
  'parent.reset':        { ru: 'Сбросить прогресс',  kz: 'Прогресті тазалау' },

  /* ── Cards Gallery ── */
  'cards.locked':        { ru: 'Пройди игру, чтобы открыть', kz: 'Ашу үшін ойынды аяқта' },
  'cards.fact':          { ru: 'Факт',               kz: 'Факт' },

  /* ── Language toggle ── */
  'lang.ru':             { ru: 'РУ',                 kz: 'РУ' },
  'lang.kz':             { ru: 'ҚАЗ',               kz: 'ҚАЗ' },
};

/**
 * Returns translation for a key in the given language.
 * Falls back to Russian if Kazakh string is missing.
 */
export function translate(key, lang = 'ru') {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.ru || key;
}
