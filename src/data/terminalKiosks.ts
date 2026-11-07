/**
 * Interactive Japanese Terminal Simulators Dataset
 * Covers:
 * 1. Convenience Store POS Cash Register (コンビニPOSレジ)
 * 2. Izakaya Tabletop Touchscreen Tablet (居酒屋卓上端末)
 * 3. Station Multi-Function Ticket Kiosk & Beverage Vending Machine (駅多機能券売機・自動販売機)
 */

export type TerminalType = 'conbini' | 'izakaya' | 'kiosk';

// ============================================================================
// 1. CONBINI POS REGISTER (コンビニPOSレジ)
// ============================================================================

export type ConbiniPaymentMethod = 'suica' | 'cash' | 'credit' | 'qr';

export interface ConbiniItem {
  id: string;
  nameJp: string;
  nameKana: string;
  nameEn: string;
  price: number;
  category: 'bento' | 'snack' | 'drink' | 'alcohol' | 'daily';
  requiresAgeCheck?: boolean;
  canHeat?: boolean;
  icon: string;
}

export interface ConbiniMission {
  id: string;
  terminalType: 'conbini';
  title: string;
  titleJp: string;
  scenarioEn: string;
  basket: ConbiniItem[];
  expectedPointCard: 'present' | 'none';
  expectedHeating: 'yes' | 'no';
  expectedBag: 'none' | 'small' | 'large';
  expectedAgeConfirmed?: boolean;
  expectedPayment: ConbiniPaymentMethod;
  clerkDialogue: {
    greeting: string;
    pointCardPrompt: string;
    heatPrompt?: string;
    bagPrompt: string;
    agePrompt?: string;
    paymentPrompt: string;
    farewell: string;
  };
  explanation: string;
  culturalNote: string;
}

export const CONBINI_ITEMS: Record<string, ConbiniItem> = {
  karaage_bento: {
    id: 'karaage_bento',
    nameJp: '特製から揚げ弁当',
    nameKana: 'とくせい からあげ べんとう',
    nameEn: 'Special Fried Chicken Bento',
    price: 550,
    category: 'bento',
    canHeat: true,
    icon: '🍱',
  },
  iemon_cha: {
    id: 'iemon_cha',
    nameJp: '伊右衛門 緑茶 500ml',
    nameKana: 'いえもん りょくちゃ',
    nameEn: 'Iemon Green Tea (500ml)',
    price: 160,
    category: 'drink',
    icon: '🍵',
  },
  asahi_beer: {
    id: 'asahi_beer',
    nameJp: 'アサヒ スーパードライ 350ml',
    nameKana: 'アサヒ スーパードライ',
    nameEn: 'Asahi Super Dry Beer (350ml)',
    price: 220,
    category: 'alcohol',
    requiresAgeCheck: true,
    icon: '🍺',
  },
  yakitori_tare: {
    id: 'yakitori_tare',
    nameJp: '炭火焼き鳥（タレ）',
    nameKana: 'すみび やきとり タレ',
    nameEn: 'Charcoal Grilled Yakitori (Tare Sauce)',
    price: 150,
    category: 'snack',
    canHeat: true,
    icon: '🍢',
  },
  potato_chips: {
    id: 'potato_chips',
    nameJp: 'うすしお ポテトチップス',
    nameKana: 'うすしお ポテトチップス',
    nameEn: 'Lightly Salted Potato Chips',
    price: 140,
    category: 'snack',
    icon: '🥔',
  },
  shake_onigiri: {
    id: 'shake_onigiri',
    nameJp: '手巻おにぎり 熟成紅鮭',
    nameKana: 'てまき おにぎり じゅくせい べにざけ',
    nameEn: 'Hand-wrapped Salmon Onigiri',
    price: 170,
    category: 'bento',
    icon: '🍙',
  },
  hot_canned_coffee: {
    id: 'hot_canned_coffee',
    nameJp: 'ホット缶コーヒー 微糖',
    nameKana: 'ホット かんコーヒー びとう',
    nameEn: 'Hot Canned Coffee (Low Sugar)',
    price: 130,
    category: 'drink',
    icon: '☕',
  },
  umbrella: {
    id: 'umbrella',
    nameJp: 'ワンタッチ ビニール傘 65cm',
    nameKana: 'ワンタッチ ビニールがさ',
    nameEn: 'One-Touch Clear Vinyl Umbrella',
    price: 700,
    category: 'daily',
    icon: '☂️',
  },
  mobile_battery: {
    id: 'mobile_battery',
    nameJp: '急速充電モバイルバッテリー',
    nameKana: 'きゅうそく じゅうでん モバイルバッテリー',
    nameEn: 'Fast-Charging Power Bank',
    price: 1800,
    category: 'daily',
    icon: '🔋',
  },
};

export const CONBINI_MISSIONS: ConbiniMission[] = [
  {
    id: 'conbini_m1',
    terminalType: 'conbini',
    title: 'Mission 1 · Lunch Rush Bento Combo',
    titleJp: '昼の定番お弁当セット',
    scenarioEn:
      'You are buying a Karaage Bento and Green Tea. Decline point card, request bento heated (温める), decline shopping bag (袋不要), and pay with Suica (交通系IC).',
    basket: [CONBINI_ITEMS.karaage_bento, CONBINI_ITEMS.iemon_cha],
    expectedPointCard: 'none',
    expectedHeating: 'yes',
    expectedBag: 'none',
    expectedAgeConfirmed: false,
    expectedPayment: 'suica',
    clerkDialogue: {
      greeting: 'いらっしゃいませ！',
      pointCardPrompt: 'ポイントカードはお持ちですか？',
      heatPrompt: 'お弁当温めますか？',
      bagPrompt: 'レジ袋はご利用ですか？',
      paymentPrompt: 'お支払い方法をお選びください。',
      farewell: 'ありがとうございました！またお越しくださいませ。',
    },
    explanation:
      'ポイントカードなし = no point card, 温めてください = please heat it, レジ袋いりません = no plastic bag, 交通系IC = transit IC card.',
    culturalNote:
      'In Japan, convenience store bentos are heated in commercial microwaves behind the counter in 20-30 seconds. Plastic shopping bags cost ¥3-5 since the plastic bag charge law (レジ袋有料化).',
  },
  {
    id: 'conbini_m2',
    terminalType: 'conbini',
    title: 'Mission 2 · Friday Night Beer & Snack',
    titleJp: '華金の晩酌セット',
    scenarioEn:
      'You are buying Asahi beer, yakitori, and chips. Present point card (カード提示), heat yakitori (温める), request small bag (レジ袋小 ¥3), confirm 20+ age check (年齢確認), and pay with cash (現金).',
    basket: [CONBINI_ITEMS.asahi_beer, CONBINI_ITEMS.yakitori_tare, CONBINI_ITEMS.potato_chips],
    expectedPointCard: 'present',
    expectedHeating: 'yes',
    expectedBag: 'small',
    expectedAgeConfirmed: true,
    expectedPayment: 'cash',
    clerkDialogue: {
      greeting: 'いらっしゃいませ！',
      pointCardPrompt: 'ポイントカードはお持ちですか？',
      heatPrompt: '焼き鳥温めますか？',
      bagPrompt: 'レジ袋はご利用になりますか？',
      agePrompt: '画面の年齢確認ボタンを押してください。',
      paymentPrompt: 'お支払い方法をお選びください。自動釣銭機へ現金を投入してください。',
      farewell: 'おつりとレシートのお受け取りをお確かめください。ありがとうございました！',
    },
    explanation:
      '年齢確認 = age verification (required for alcohol/tobacco), 20歳以上 = 20 years or older (legal drinking age in Japan), 現金 = cash.',
    culturalNote:
      'When purchasing alcohol or tobacco in Japan, the POS screen locks with a chime displaying 『あなたは20歳以上ですか？』. Clerks cannot legally press this button for you — you must press 『はい（20歳以上）』 yourself.',
  },
  {
    id: 'conbini_m3',
    terminalType: 'conbini',
    title: 'Mission 3 · Morning Commute Breakfast',
    titleJp: '朝の通勤おにぎりセット',
    scenarioEn:
      'You are buying Salmon Onigiri and Hot Canned Coffee. Decline point card, do NOT heat (そのままで), decline bag, and pay with Barcode / QR (PayPay).',
    basket: [CONBINI_ITEMS.shake_onigiri, CONBINI_ITEMS.hot_canned_coffee],
    expectedPointCard: 'none',
    expectedHeating: 'no',
    expectedBag: 'none',
    expectedAgeConfirmed: false,
    expectedPayment: 'qr',
    clerkDialogue: {
      greeting: 'おはようございます！',
      pointCardPrompt: 'ポイントカードはお持ちですか？',
      heatPrompt: 'おにぎり温めますか？',
      bagPrompt: 'レジ袋はご利用ですか？',
      paymentPrompt: 'バーコード決済ですね。画面をスキャナーにかざしてください。',
      farewell: 'ピッ！お支払い完了です。いってらっしゃいませ！',
    },
    explanation:
      'そのままで大丈夫です = fine as is (no heating), バーコード決済 = barcode / QR payment (PayPay, Rakuten Pay, etc.).',
    culturalNote:
      'QR code / barcode payments (バーコード決済) like PayPay and d-Barai are widely used in Japan. The customer shows a dynamic barcode on their phone, and the clerk scans it with a handheld optical scanner.',
  },
  {
    id: 'conbini_m4',
    terminalType: 'conbini',
    title: 'Mission 4 · Rainy Day Emergency Supplies',
    titleJp: '雨の日の必需品',
    scenarioEn:
      'A sudden downpour! You need an umbrella and a power bank. Present point card, request large bag (レジ袋大 ¥5), and pay with contactless credit card (クレジットカード).',
    basket: [CONBINI_ITEMS.umbrella, CONBINI_ITEMS.mobile_battery],
    expectedPointCard: 'present',
    expectedHeating: 'no',
    expectedBag: 'large',
    expectedAgeConfirmed: false,
    expectedPayment: 'credit',
    clerkDialogue: {
      greeting: 'いらっしゃいませ！お足元の悪い中ありがとうございます。',
      pointCardPrompt: 'ポイントカードはお持ちですか？',
      bagPrompt: '大きな商品ですので、レジ袋（大・5円）をご利用になりますか？',
      paymentPrompt: 'クレジットカードですね。端末にカードをタッチまたは挿入してください。',
      farewell: 'ありがとうございました！お気をつけてお帰りください。',
    },
    explanation:
      'レジ袋大 = large shopping bag (¥5), クレジットカード・タッチ決済 = contactless credit card.',
    culturalNote:
      'Clear vinyl umbrellas (ビニール傘) are stocked near the door of every Japanese convenience store for sudden rain showers (にわか雨).',
  },
];

// ============================================================================
// 2. IZAKAYA TOUCHSCREEN TABLET (居酒屋卓上端末)
// ============================================================================

export type IzakayaCategory =
  | 'starter'
  | 'yakitori'
  | 'sashimi'
  | 'agemono'
  | 'gohan_men'
  | 'drink'
  | 'service';

export const IZAKAYA_CATEGORIES: IzakayaCategory[] = [
  'starter',
  'yakitori',
  'sashimi',
  'agemono',
  'gohan_men',
  'drink',
  'service',
];

export interface IzakayaMenuItem {
  id: string;
  category: IzakayaCategory;
  nameJp: string;
  nameKana: string;
  nameEn: string;
  price: number;
  icon: string;
  hasSauceChoice?: boolean; // Tare vs Shio
  hasWasabiChoice?: boolean; // Wasabi ari vs nuki
}

export interface IzakayaOrderItem {
  itemId: string;
  quantity: number;
  sauce?: 'tare' | 'shio';
  wasabi?: boolean;
}

export interface IzakayaMission {
  id: string;
  terminalType: 'izakaya';
  title: string;
  titleJp: string;
  scenarioEn: string;
  expectedItems: {
    itemId: string;
    quantity: number;
    sauce?: 'tare' | 'shio';
    wasabi?: boolean;
  }[];
  expectedPartySize?: number; // for split bill preview
  serverCallRequired?: boolean;
  kitchenResponseKana: string;
  explanation: string;
  culturalNote: string;
}

export const IZAKAYA_MENU: IzakayaMenuItem[] = [
  // Speed Starters
  { id: 'edamame', category: 'starter', nameJp: '枝豆（茹でたて）', nameKana: 'えだまめ', nameEn: 'Fresh Boiled Edamame', price: 380, icon: '🫛' },
  { id: 'hiyayakko', category: 'starter', nameJp: '冷奴（生姜・ねぎ）', nameKana: 'ひややっこ', nameEn: 'Chilled Tofu with Ginger', price: 350, icon: '🧊' },
  { id: 'kimchi', category: 'starter', nameJp: '自家製白菜キムチ', nameKana: 'きむち', nameEn: 'House Pickled Kimchi', price: 380, icon: '🥬' },
  // Yakitori (with sauce choice)
  { id: 'negima', category: 'yakitori', nameJp: 'ねぎま串', nameKana: 'ねぎまくし', nameEn: 'Chicken & Scallion Skewer', price: 180, icon: '🍢', hasSauceChoice: true },
  { id: 'tsukune', category: 'yakitori', nameJp: '特製つくね串（卵黄添え）', nameKana: 'とくせい つくね', nameEn: 'Minced Chicken Skewer w/ Egg Yolk', price: 220, icon: '🍢', hasSauceChoice: true },
  { id: 'momo', category: 'yakitori', nameJp: '若鶏もも串', nameKana: 'わかどり ももくし', nameEn: 'Juicy Chicken Thigh Skewer', price: 170, icon: '🍢', hasSauceChoice: true },
  // Sashimi (with wasabi choice)
  { id: 'maguro', category: 'sashimi', nameJp: '本マグロ赤身刺身', nameKana: 'ほんマグロ あかみ さしみ', nameEn: 'Bluefin Tuna Sashimi', price: 680, icon: '🐟', hasWasabiChoice: true },
  { id: 'salmon', category: 'sashimi', nameJp: 'サーモン刺身', nameKana: 'サーモン さしみ', nameEn: 'Fresh Salmon Sashimi', price: 620, icon: '🍣', hasWasabiChoice: true },
  // Agemono / Fried
  { id: 'karaage', category: 'agemono', nameJp: '若鶏の竜田揚げ', nameKana: 'わかどり たつたあげ', nameEn: 'Crispy Fried Chicken Karaage', price: 520, icon: '🍗' },
  { id: 'french_fries', category: 'agemono', nameJp: '山盛りフライドポテト', nameKana: 'やまもり フライドポテト', nameEn: 'Heaping French Fries', price: 420, icon: '🍟' },
  // Gohan & Noodles
  { id: 'shake_chazuke', category: 'gohan_men', nameJp: '鮭茶漬け（紀州梅添え）', nameKana: 'さけ ちゃづけ', nameEn: 'Salmon Ochazuke (Rice with Dashi)', price: 450, icon: '🍵' },
  { id: 'sauce_yakisoba', category: 'gohan_men', nameJp: '屋台風ソース焼きそば', nameKana: 'ソース やきそば', nameEn: 'Fried Sauce Yakisoba Noodles', price: 550, icon: '🍜' },
  // Drinks
  { id: 'nama_beer', category: 'drink', nameJp: '生ビール（中ジョッキ）', nameKana: 'なまビール ちゅう', nameEn: 'Draft Beer (Medium Mug)', price: 500, icon: '🍺' },
  { id: 'lemon_sour', category: 'drink', nameJp: 'こだわり酒場のレモンサワー', nameKana: 'レモンサワー', nameEn: 'Izakaya Lemon Sour', price: 420, icon: '🍋' },
  { id: 'highball', category: 'drink', nameJp: '角ハイボール', nameKana: 'かく ハイボール', nameEn: 'Whisky Highball', price: 450, icon: '🥃' },
  { id: 'oolong_tea', category: 'drink', nameJp: 'ウーロン茶（アイス）', nameKana: 'ウーロンちゃ', nameEn: 'Cold Oolong Tea', price: 280, icon: '🧋' },
  // Service (¥0)
  { id: 'service_water', category: 'service', nameJp: 'お冷（氷水・無料）', nameKana: 'おひや', nameEn: 'Free Cold Water', price: 0, icon: '💧' },
  { id: 'service_towel', category: 'service', nameJp: 'おしぼり（追加・無料）', nameKana: 'おしぼり', nameEn: 'Extra Wet Towel', price: 0, icon: '🧖' },
  { id: 'service_tea', category: 'service', nameJp: 'あがり（温かいお茶・無料）', nameKana: 'あがり', nameEn: 'Hot Green Tea (Closing Tea)', price: 0, icon: '🍵' },
  { id: 'service_call', category: 'service', nameJp: '店員呼出（スタッフ呼び出し）', nameKana: 'てんいん よびだし', nameEn: 'Call Server (Chime)', price: 0, icon: '🛎️' },
];

export const IZAKAYA_MISSIONS: IzakayaMission[] = [
  {
    id: 'izakaya_m1',
    terminalType: 'izakaya',
    title: 'Mission 1 · "First Round Toast!" (とりあえず乾杯)',
    titleJp: 'とりあえず乾杯セット',
    scenarioEn:
      'The classic starter order: Order 2 Draft Beers (生ビール中), 1 Boiled Edamame (枝豆), and 2 Negima Yakitori with Salt (ねぎま・塩 2本).',
    expectedItems: [
      { itemId: 'nama_beer', quantity: 2 },
      { itemId: 'edamame', quantity: 1 },
      { itemId: 'negima', quantity: 2, sauce: 'shio' },
    ],
    kitchenResponseKana: 'よろこんで！ 生ビール２つと枝豆、ねぎま塩２本、すぐにお持ちします！',
    explanation:
      '生ビール = draft beer, 枝豆 = edamame, ねぎま = chicken and scallion, 塩 = salt seasoning (vs. タレ sweet soy sauce).',
    culturalNote:
      'In Japanese dining culture, it is common to quickly order drinks and a quick starter like edamame first (『とりあえず生で！』) before taking time to browse the food menu.',
  },
  {
    id: 'izakaya_m2',
    terminalType: 'izakaya',
    title: 'Mission 2 · Sashimi & Fried Chicken Feast',
    titleJp: '刺身と唐揚げの定番コース',
    scenarioEn:
      'Order 1 Salmon Sashimi with Wasabi (サーモン刺身・わさびあり), 1 Chicken Karaage (若鶏の竜田揚げ), 1 Lemon Sour, and 1 Cold Oolong Tea.',
    expectedItems: [
      { itemId: 'salmon', quantity: 1, wasabi: true },
      { itemId: 'karaage', quantity: 1 },
      { itemId: 'lemon_sour', quantity: 1 },
      { itemId: 'oolong_tea', quantity: 1 },
    ],
    kitchenResponseKana: 'まいど！ サーモン刺身わさび入り、若鶏竜田揚げ、レモンサワー、ウーロン茶はいります！',
    explanation:
      'サーモン = salmon, わさびあり = with wasabi (vs. さび抜き without wasabi), 竜田揚げ = seasoned fried chicken, レモンサワー = shochu lemon cocktail.',
    culturalNote:
      'Tablet menus allow granular preferences such as 『わさびあり』 (with wasabi) vs 『さび抜き』 (without wasabi), perfect for diners who dislike pungent wasabi.',
  },
  {
    id: 'izakaya_m3',
    terminalType: 'izakaya',
    title: 'Mission 3 · Water, Towels & Tsukune Skewers',
    titleJp: 'お冷とおしぼり、タレ串追加',
    scenarioEn:
      'Mid-meal refresh: Request 2 Free Cold Waters (お冷 x2), 1 Extra Wet Towel (おしぼり), and order 2 Tsukune Skewers with Sweet Sauce (つくね・タレ 2本).',
    expectedItems: [
      { itemId: 'service_water', quantity: 2 },
      { itemId: 'service_towel', quantity: 1 },
      { itemId: 'tsukune', quantity: 2, sauce: 'tare' },
    ],
    kitchenResponseKana: 'お冷とおしぼりお持ちしました！ つくねタレ２本、少々お待ちください！',
    explanation:
      'お冷 (おひや) = cold drinking water (complimentary), おしぼり = wet hand towel, つくね・タレ = minced chicken skewer with sweet soy tare.',
    culturalNote:
      'Free table service requests like extra wet towels (おしぼり) and cold water (お冷) can be ordered for ¥0 directly from the touch terminal without flagging down busy servers.',
  },
  {
    id: 'izakaya_m4',
    terminalType: 'izakaya',
    title: 'Mission 4 · Closing Tea & 3-Person Bill Split',
    titleJp: '締めのあがりと割り勘計算',
    scenarioEn:
      'End of the meal: Order 1 Salmon Ochazuke (鮭茶漬け) and 1 Closing Hot Tea (あがり). Then open the Split Bill modal (割り勘) and preview the share for a party of 3 (3名).',
    expectedItems: [
      { itemId: 'shake_chazuke', quantity: 1 },
      { itemId: 'service_tea', quantity: 1 },
    ],
    expectedPartySize: 3,
    kitchenResponseKana: '鮭茶漬けと温かいあがりをお持ちしました！ ごゆっくりお過ごしください。',
    explanation:
      '鮭茶漬け = salmon dashi rice, あがり = complimentary ending green tea in sushi/izakaya jargon, 割り勘 (わりかん) = split bill.',
    culturalNote:
      'In Japanese restaurant jargon, 『あがり』 specifically refers to the final cup of hot green tea served at the conclusion of a meal. Modern izakaya tablets include a built-in 『割り勘計算』 button to divide the total among diners evenly.',
  },
];

export function calculateSplitBill(totalYen: number, partySize: number) {
  const safeSize = Math.max(1, partySize);
  const perPersonRaw = Math.ceil(totalYen / safeSize);
  // Round up to nearest 100 yen (standard Japanese dining etiquette so nobody pays coins)
  const perPersonRounded = Math.ceil(perPersonRaw / 100) * 100;
  return {
    totalYen,
    partySize: safeSize,
    perPersonRaw,
    perPersonRounded,
    surplus: perPersonRounded * safeSize - totalYen,
  };
}

// ============================================================================
// 3. TRAIN TRANSIT TICKET & DRINK VENDING KIOSK (駅券売機・自動販売機)
// ============================================================================

export interface StationFareOption {
  id: string;
  fareYen: number;
  labelJp: string;
  labelKana: string;
  destinationExample: string;
}

export interface VendingDrinkItem {
  id: string;
  nameJp: string;
  nameKana: string;
  nameEn: string;
  price: number;
  temp: 'cold' | 'hot'; // つめた〜い (blue) vs あたたか〜い (red)
  icon: string;
  category: 'tea' | 'coffee' | 'water' | 'soda' | 'soup';
}

export interface KioskMission {
  id: string;
  terminalType: 'kiosk';
  subType: 'station_ticket' | 'station_ic' | 'drink_vending';
  title: string;
  titleJp: string;
  scenarioEn: string;
  expectedTicket?: {
    fareYen: number;
    passengerType: 'adult' | 'child';
    count: number;
    needReceipt: boolean;
  };
  expectedCharge?: {
    chargeAmount: number;
    needReceipt: boolean;
  };
  expectedDrinks?: string[];
  expectedPayment: {
    method: 'cash' | 'ic_card';
    cashInserted?: number;
    expectedChange?: number;
  };
  machineAnnouncementKana: string;
  explanation: string;
  culturalNote: string;
}

export const STATION_FARES: StationFareOption[] = [
  { id: 'fare_140', fareYen: 140, labelJp: '140円区間', labelKana: 'ひゃくよんじゅうえん', destinationExample: '1〜3km (隣駅・山手線1駅)' },
  { id: 'fare_170', fareYen: 170, labelJp: '170円区間', labelKana: 'ひゃくななじゅうえん', destinationExample: '4〜6km (新宿 ↔ 渋谷)' },
  { id: 'fare_200', fareYen: 200, labelJp: '200円区間', labelKana: 'にひゃくえん', destinationExample: '7〜10km (新宿 ↔ 東京駅)' },
  { id: 'fare_260', fareYen: 260, labelJp: '260円区間', labelKana: 'にひゃくろくじゅうえん', destinationExample: '11〜15km (新宿 ↔ 上野)' },
  { id: 'fare_320', fareYen: 320, labelJp: '320円区間', labelKana: 'さんびゃくにじゅうえん', destinationExample: '16〜20km (新宿 ↔ 吉祥寺)' },
];

export const TRANSIT_FARES = STATION_FARES;

export const VENDING_DRINKS: VendingDrinkItem[] = [
  // Cold (つめた〜い - Blue)
  { id: 'v_ocha', nameJp: '綾鷹 緑茶 500ml', nameKana: 'あやたか りょくちゃ', nameEn: 'Ayataka Green Tea', price: 160, temp: 'cold', icon: '🍵', category: 'tea' },
  { id: 'v_water', nameJp: 'い・ろ・は・す 天然水', nameKana: 'いろはす てんねんすい', nameEn: 'I LOHAS Natural Mineral Water', price: 130, temp: 'cold', icon: '💧', category: 'water' },
  { id: 'v_sports', nameJp: 'アクエリアス スポーツ飲料', nameKana: 'アクエリアス', nameEn: 'Aquarius Sports Drink', price: 160, temp: 'cold', icon: '⚡', category: 'water' },
  { id: 'v_cider', nameJp: '三ツ矢サイダー 爽快炭酸', nameKana: 'みつやサイダー', nameEn: 'Mitsuya Sparkling Cider', price: 150, temp: 'cold', icon: '🫧', category: 'soda' },
  { id: 'v_latte', nameJp: 'ボス カフェオレ（アイス）', nameKana: 'ボス カフェオレ', nameEn: 'Boss Iced Café au Lait', price: 170, temp: 'cold', icon: '🧋', category: 'coffee' },
  // Hot (あたたか〜い - Red)
  { id: 'v_coffee_hot', nameJp: 'ボス 贅沢微糖 缶コーヒー', nameKana: 'ボス ぜいたくびとう', nameEn: 'Boss Low-Sugar Hot Coffee', price: 140, temp: 'hot', icon: '☕', category: 'coffee' },
  { id: 'v_corn_soup', nameJp: 'じっくりコトコト 濃厚コーンポタージュ', nameKana: 'のうこう コーンポタージュ', nameEn: 'Rich Hot Corn Potage Soup', price: 150, temp: 'hot', icon: '🌽', category: 'soup' },
  { id: 'v_milk_tea', nameJp: '午後の紅茶 ホットミルクティー', nameKana: 'ごごのこうちゃ ミルクティー', nameEn: 'Hot Royal Milk Tea', price: 160, temp: 'hot', icon: '🫖', category: 'tea' },
  { id: 'v_hot_lemon', nameJp: 'ほっとレモン（ビタミンC）', nameKana: 'ほっとレモン', nameEn: 'Warm Honey Lemon Drink', price: 140, temp: 'hot', icon: '🍋', category: 'tea' },
  { id: 'v_shiruko', nameJp: 'つぶ入り おしるこ（小豆）', nameKana: 'つぶいり おしるこ', nameEn: 'Sweet Red Bean Soup w/ Mochi', price: 150, temp: 'hot', icon: '🫘', category: 'soup' },
];

export const KIOSK_MISSIONS: KioskMission[] = [
  {
    id: 'kiosk_m1',
    terminalType: 'kiosk',
    subType: 'station_ticket',
    title: 'Mission 1 · Single Ride Train Ticket (普通乗車券)',
    titleJp: '切符の購入（おとな1枚・200円区間）',
    scenarioEn:
      'Buy 1 Adult Single Ride Ticket for ¥200 (おとな1枚 200円区間), insert a ¥1,000 note, decline receipt (領収書なし), and collect ticket + ¥800 change.',
    expectedTicket: {
      fareYen: 200,
      passengerType: 'adult',
      count: 1,
      needReceipt: false,
    },
    expectedPayment: {
      method: 'cash',
      cashInserted: 1000,
      expectedChange: 800,
    },
    machineAnnouncementKana: 'きっぷとおつりをお受け取りください。お忘れ物のないようご注意ください。',
    explanation:
      'きっぷ購入 = ticket purchase, おとな = adult, 200円区間 = ¥200 fare zone, おつり = change.',
    culturalNote:
      'Tokyo station ticket machines display route map fares above the machine. You locate your destination station, look at the number above it (e.g. 200), and press that fare button on the screen.',
  },
  {
    id: 'kiosk_m2',
    terminalType: 'kiosk',
    subType: 'station_ic',
    title: 'Mission 2 · Suica IC Card Recharge & Receipt',
    titleJp: 'ICカードのチャージと領収書発行',
    scenarioEn:
      'Recharge your Suica card with ¥2,000 (チャージ 2,000円). Insert a ¥5,000 bill, request a receipt (領収書発行), and collect card, receipt, and ¥3,000 change.',
    expectedCharge: {
      chargeAmount: 2000,
      needReceipt: true,
    },
    expectedPayment: {
      method: 'cash',
      cashInserted: 5000,
      expectedChange: 3000,
    },
    machineAnnouncementKana: 'カードと領収書、おつりをお受け取りください。チャージが完了しました。',
    explanation:
      'チャージ = recharge / load money, 領収書 (りょうしゅうしょ) = formal tax receipt, 挿入 (そうにゅう) = insert.',
    culturalNote:
      'In Japan, IC cards (Suica, PASMO, ICOCA) can be recharged at any station ticket machine. Japanese business travelers routinely press 『領収書』 to obtain receipts for company expense reimbursement.',
  },
  {
    id: 'kiosk_m3',
    terminalType: 'kiosk',
    subType: 'drink_vending',
    title: 'Mission 3 · Autumn Warmth Canned Soup & Coffee',
    titleJp: 'あたたか〜い缶飲料の購入',
    scenarioEn:
      'On a chilly evening, choose 1 Hot Canned Coffee (あたたか〜い ¥140) and 1 Warm Corn Potage Soup (あたたか〜い ¥150). Insert ¥500 cash, pull coin return lever, and collect drinks + ¥210 change.',
    expectedDrinks: ['v_coffee_hot', 'v_corn_soup'],
    expectedPayment: {
      method: 'cash',
      cashInserted: 500,
      expectedChange: 210,
    },
    machineAnnouncementKana: 'ガコン！ ガコン！ がたがた……おつりをお受け取りください。ありがとうございました！',
    explanation:
      'あたたか〜い = warm / hot drink (red label), コーンポタージュ = corn soup in a pull-tab can, 取出口 (とりだしぐち) = drink retrieval chute.',
    culturalNote:
      'Japanese vending machines simultaneously vend boiling hot canned drinks (red LED: あたたか〜い) and ice-cold drinks (blue LED: つめた〜い) from the same machine using heat-pump temperature zones.',
  },
  {
    id: 'kiosk_m4',
    terminalType: 'kiosk',
    subType: 'drink_vending',
    title: 'Mission 4 · Summer Thirst Cold Drinks via IC Tap',
    titleJp: 'つめた〜いドリンクとICカード決済',
    scenarioEn:
      'Summer heatwave: Select 1 Cold Green Tea (つめた〜い・綾鷹 ¥160) and 1 Cold Mineral Water (つめた〜い・天然水 ¥130). Tap your transit IC card (Suica/PASMO) to pay the exact ¥290 balance.',
    expectedDrinks: ['v_ocha', 'v_water'],
    expectedPayment: {
      method: 'ic_card',
      cashInserted: 0,
      expectedChange: 0,
    },
    machineAnnouncementKana: 'ピピッ！ ガコン！ ありがとうございました！',
    explanation:
      'つめた〜い = cold drink (blue label), 交通系IC決済 = transit card contactless tap (¥0 change).',
    culturalNote:
      'Over 90% of modern Japanese vending machines have contactless IC readers. You press the drink button first, then tap your Suica or phone to pay with a single cheerful chime.',
  },
];
