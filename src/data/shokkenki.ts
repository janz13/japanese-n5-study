export interface TicketButton {
  id: string;
  row: 'dining' | 'main' | 'topping' | 'side';
  icon: string;
  kanji: string;
  kana: string;
  en: string;
  price: number;
}

export interface ShokkenkiMission {
  id: string;
  title: string;
  orderEn: string;
  requiredIds: string[];
  maxBudget?: number;
  kitchenCallKana: string;
  explain: string;
}

export const TICKET_BUTTONS: TicketButton[] = [
  // Row 1: Dine-in vs Takeout
  { id: 'dine_in', row: 'dining', icon: '🍽️', kanji: '店内（お召し上がり）', kana: 'てんない おめしあがり', en: 'Dine-In (Eat here)', price: 0 },
  { id: 'take_out', row: 'dining', icon: '📦', kanji: '持ち帰り（弁当）', kana: 'もちかえり', en: 'Take-Out (To go)', price: 0 },

  // Row 2: Main bowls
  { id: 'tonkotsu_reg', row: 'main', icon: '🍜', kanji: '豚骨ラーメン 並盛', kana: 'とんこつ ラーメン なみもり', en: 'Tonkotsu Ramen (Regular)', price: 800 },
  { id: 'tonkotsu_lg', row: 'main', icon: '🍜', kanji: '豚骨ラーメン 大盛', kana: 'とんこつ ラーメン おおもり', en: 'Tonkotsu Ramen (Large)', price: 950 },
  { id: 'shoyu_reg', row: 'main', icon: '🍜', kanji: '醤油ラーメン 並盛', kana: 'しょうゆ ラーメン なみもり', en: 'Soy Sauce Ramen (Regular)', price: 780 },
  { id: 'miso_sp', row: 'main', icon: '🍲', kanji: '特製 味噌ラーメン', kana: 'とくせい みそ ラーメン', en: 'Special Miso Ramen', price: 1050 },

  // Row 3: Toppings & Customizations
  { id: 'ajitama', row: 'topping', icon: '🥚', kanji: '半熟 味玉', kana: 'はんじゅく あじたま', en: 'Soft-Boiled Seasoned Egg', price: 120 },
  { id: 'kaedama', row: 'topping', icon: '🍥', kanji: '替玉（麺追加）', kana: 'かえだま', en: 'Kaedama (Extra Noodle Refill)', price: 150 },
  { id: 'chashu', row: 'topping', icon: '🍖', kanji: '焼豚（チャーシュー）増し', kana: 'チャーシュー まし', en: 'Extra Roasted Pork Slices', price: 250 },
  { id: 'no_negi', row: 'topping', icon: '🚫', kanji: 'ねぎ抜き', kana: 'ねぎぬき', en: 'No Green Onions', price: 0 },

  // Row 4: Sides & Drinks
  { id: 'gyoza', row: 'side', icon: '🍙', kanji: '焼き餃子（五個）', kana: 'やきぎょうざ ごこ', en: 'Pan-Fried Gyoza (5 pcs)', price: 350 },
  { id: 'rice_sm', row: 'side', icon: '🍚', kanji: '白ご飯（小）', kana: 'しろごはん しょう', en: 'White Rice (Small)', price: 150 },
  { id: 'nama_beer', row: 'side', icon: '🍺', kanji: '生ビール（中ジョッキ）', kana: 'なまビール', en: 'Draft Beer (Medium Mug)', price: 500 },
  { id: 'free_water', row: 'side', icon: '💧', kanji: 'お冷や（セルフ水）', kana: 'おひや', en: 'Cold Water (Self-Serve)', price: 0 },
];

export const SHOKKENKI_MISSIONS: ShokkenkiMission[] = [
  {
    id: 'm1',
    title: 'Mission 1 · Classic Dine-In Order',
    orderEn: 'Order for Dine-In: 1 Large Tonkotsu Ramen + 1 Soft-Boiled Egg (味玉) + No Green Onions (ねぎ抜き).',
    requiredIds: ['dine_in', 'tonkotsu_lg', 'ajitama', 'no_negi'],
    kitchenCallKana: 'いらっしゃいませ！ てんないで、とんこつ おおもり、あじたま、ねぎぬき ですね！',
    explain: '店内 = dine-in, 大盛 = large portion, 半熟味玉 = soft-boiled egg, ねぎ抜き = without green onions (抜き = omit).',
  },
  {
    id: 'm2',
    title: 'Mission 2 · Hungry Noodle Refill',
    orderEn: 'Order for Dine-In: 1 Regular Soy Sauce (醤油) Ramen + 1 Extra Noodle Refill (替玉) + Small White Rice.',
    requiredIds: ['dine_in', 'shoyu_reg', 'kaedama', 'rice_sm'],
    kitchenCallKana: 'ありがとうございます！ しょうゆ なみもり、かえだま、しろごはん しょう、はいります！',
    explain: '並盛 (なみもり) = regular size, 替玉 (かえだま) = extra noodle refill, 白ご飯（小） = small white rice.',
  },
  {
    id: 'm3',
    title: 'Mission 3 · Take-Out Gyoza & Ramen',
    orderEn: 'Order for Take-Out (持ち帰り): 1 Regular Tonkotsu Ramen + Pan-Fried Gyoza (5 pcs).',
    requiredIds: ['take_out', 'tonkotsu_reg', 'gyoza'],
    kitchenCallKana: 'おもちかえりで、とんこつ なみもりと やきぎょうざ ごこ ですね！ しょうしょう おまちください。',
    explain: '持ち帰り (もちかえり) = take-out / to go, 焼き餃子（五個） = 5 pan-fried dumplings.',
  },
  {
    id: 'm4',
    title: 'Mission 4 · After-Work Izakaya Set',
    orderEn: 'Order for Dine-In: 1 Special Miso Ramen + Extra Pork (焼豚増し) + 1 Draft Beer (生ビール).',
    requiredIds: ['dine_in', 'miso_sp', 'chashu', 'nama_beer'],
    kitchenCallKana: 'まいど！ とくせい みそラーメン、チャーシューまし、なまビール いちょう はいります！',
    explain: '特製 (とくせい) = special, 増し (まし) = extra portion, 生ビール (なまビール) = draft beer.',
  },
];
