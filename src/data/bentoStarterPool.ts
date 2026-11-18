export interface BentoCardSpec {
  id: string;
  kind: 'word' | 'kanji';
  front: string;
  reading: string;
  back: string;
}

/** 60 starter vocabulary & core kanji cards for Complete Beginner Bento runs */
export const BEGINNER_BENTO_POOL: BentoCardSpec[] = [
  // Greetings & Polite Responses
  { id: 'w:おはよう', kind: 'word', front: 'おはようございます', reading: 'おはようございます', back: 'Good morning (polite)' },
  { id: 'w:こんにちは', kind: 'word', front: 'こんにちは', reading: 'こんにちは', back: 'Hello / Good afternoon' },
  { id: 'w:こんばんは', kind: 'word', front: 'こんばんは', reading: 'こんばんは', back: 'Good evening' },
  { id: 'w:おやすみ', kind: 'word', front: 'おやすみなさい', reading: 'おやすみなさい', back: 'Good night' },
  { id: 'w:ありがとう', kind: 'word', front: 'ありがとうございます', reading: 'ありがとうございます', back: 'Thank you very much' },
  { id: 'w:すみません', kind: 'word', front: 'すみません', reading: 'すみません', back: 'Excuse me / I’m sorry' },
  { id: 'w:ごめん', kind: 'word', front: 'ごめんなさい', reading: 'ごめんなさい', back: 'I’m sorry' },
  { id: 'w:おねがい', kind: 'word', front: 'おねがいします', reading: 'おねがいします', back: 'Please (requesting)' },
  { id: 'w:はい', kind: 'word', front: 'はい', reading: 'はい', back: 'Yes' },
  { id: 'w:いいえ', kind: 'word', front: 'いいえ', reading: 'いいえ', back: 'No / Not at all' },
  // Pronouns & Demonstratives
  { id: 'w:わたし', kind: 'word', front: 'わたし', reading: 'わたし', back: 'I / Me' },
  { id: 'w:あなた', kind: 'word', front: 'あなた', reading: 'あなた', back: 'You' },
  { id: 'w:これ', kind: 'word', front: 'これ', reading: 'これ', back: 'This (near me)' },
  { id: 'w:それ', kind: 'word', front: 'それ', reading: 'それ', back: 'That (near you)' },
  { id: 'w:あれ', kind: 'word', front: 'あれ', reading: 'あれ', back: 'That over there' },
  { id: 'w:ここ', kind: 'word', front: 'ここ', reading: 'ここ', back: 'Here (this place)' },
  // Question Words
  { id: 'w:なに', kind: 'word', front: 'なに / なん', reading: 'なに', back: 'What' },
  { id: 'w:どこ', kind: 'word', front: 'どこ', reading: 'どこ', back: 'Where' },
  { id: 'w:いつ', kind: 'word', front: 'いつ', reading: 'いつ', back: 'When' },
  { id: 'w:だれ', kind: 'word', front: 'だれ', reading: 'だれ', back: 'Who' },
  { id: 'w:いくら', kind: 'word', front: 'いくら', reading: 'いくら', back: 'How much (price)' },
  // Numbers & Time
  { id: 'k:一', kind: 'kanji', front: '一', reading: 'イチ / ひと', back: 'One' },
  { id: 'k:二', kind: 'kanji', front: '二', reading: 'ニ / ふた', back: 'Two' },
  { id: 'k:三', kind: 'kanji', front: '三', reading: 'サン / み', back: 'Three' },
  { id: 'k:四', kind: 'kanji', front: '四', reading: 'シ / よん', back: 'Four' },
  { id: 'k:五', kind: 'kanji', front: '五', reading: 'ゴ / いつ', back: 'Five' },
  { id: 'k:十', kind: 'kanji', front: '十', reading: 'ジュウ / とお', back: 'Ten' },
  { id: 'k:百', kind: 'kanji', front: '百', reading: 'ヒャク', back: 'Hundred' },
  { id: 'w:きょう', kind: 'word', front: '今日', reading: 'きょう', back: 'Today' },
  { id: 'w:あした', kind: 'word', front: '明日', reading: 'あした', back: 'Tomorrow' },
  { id: 'w:いま', kind: 'word', front: '今', reading: 'いま', back: 'Now' },
  { id: 'w:まいにち', kind: 'word', front: '毎日', reading: 'まいにち', back: 'Every day' },
  // People & Family
  { id: 'k:人', kind: 'kanji', front: '人', reading: 'ジン / ひと', back: 'Person' },
  { id: 'w:ともだち', kind: 'word', front: '友だち', reading: 'ともだち', back: 'Friend' },
  { id: 'w:かぞく', kind: 'word', front: '家族', reading: 'かぞく', back: 'Family' },
  { id: 'w:せんせい', kind: 'word', front: '先生', reading: 'せんせい', back: 'Teacher' },
  { id: 'w:がくせい', kind: 'word', front: '学生', reading: 'がくせい', back: 'Student' },
  // Food & Drink
  { id: 'w:みず', kind: 'word', front: '水', reading: 'みず', back: 'Water' },
  { id: 'w:おちゃ', kind: 'word', front: 'お茶', reading: 'おちゃ', back: 'Tea / Green tea' },
  { id: 'w:ごはん', kind: 'word', front: 'ご飯', reading: 'ごはん', back: 'Cooked rice / Meal' },
  { id: 'w:ぱん', kind: 'word', front: 'パン', reading: 'パン', back: 'Bread' },
  { id: 'w:にく', kind: 'word', front: '肉', reading: 'にく', back: 'Meat' },
  { id: 'w:さかな', kind: 'word', front: '魚', reading: 'さかな', back: 'Fish' },
  { id: 'w:やさい', kind: 'word', front: '野菜', reading: 'やさい', back: 'Vegetables' },
  // Everyday Places & Things
  { id: 'w:うち', kind: 'word', front: '家', reading: 'うち / いえ', back: 'Home / House' },
  { id: 'w:がっこう', kind: 'word', front: '学校', reading: 'がっこう', back: 'School' },
  { id: 'k:本', kind: 'kanji', front: '本', reading: 'ホン / もと', back: 'Book, Origin' },
  { id: 'k:日', kind: 'kanji', front: '日', reading: 'ニチ / ひ', back: 'Sun, Day' },
  { id: 'w:でんしゃ', kind: 'word', front: '電車', reading: 'でんしゃ', back: 'Train' },
  { id: 'w:でんわ', kind: 'word', front: '電話', reading: 'でんわ', back: 'Telephone' },
  // Core Adjectives
  { id: 'w:おおきい', kind: 'word', front: '大きい', reading: 'おおきい', back: 'Big / Large' },
  { id: 'w:ちいさい', kind: 'word', front: '小さい', reading: 'ちいさい', back: 'Small / Little' },
  { id: 'w:あたらしい', kind: 'word', front: '新しい', reading: 'あたらしい', back: 'New' },
  { id: 'w:たかい', kind: 'word', front: '高い', reading: 'たかい', back: 'Expensive / Tall' },
  { id: 'w:いい', kind: 'word', front: 'いい', reading: 'いい', back: 'Good / Fine' },
  { id: 'w:すき', kind: 'word', front: '好き', reading: 'すき', back: 'To like / Favorite' },
  // Core Verbs
  { id: 'w:いく', kind: 'word', front: '行く', reading: 'いく', back: 'To go' },
  { id: 'w:くる', kind: 'word', front: '来る', reading: 'くる', back: 'To come' },
  { id: 'w:たべる', kind: 'word', front: '食べる', reading: 'たべる', back: 'To eat' },
  { id: 'w:のむ', kind: 'word', front: '飲む', reading: 'のむ', back: 'To drink' },
  { id: 'w:みる', kind: 'word', front: '見る', reading: 'みる', back: 'To see / watch' },
  { id: 'w:きく', kind: 'word', front: '聞く', reading: 'きく', back: 'To listen / ask' },
];

/** 60 real-world survival cards for Travel track Bento runs */
export const TRAVEL_BENTO_POOL: BentoCardSpec[] = [
  // Station & Transit
  { id: 'tr:駅', kind: 'word', front: '駅', reading: 'えき', back: 'Train station' },
  { id: 'tr:切符', kind: 'word', front: '切符', reading: 'きっぷ', back: 'Ticket' },
  { id: 'tr:改札', kind: 'word', front: '改札口', reading: 'かいさつぐち', back: 'Ticket gate' },
  { id: 'tr:乗換', kind: 'word', front: '乗り換え', reading: 'のりかえ', back: 'Train transfer' },
  { id: 'tr:出口', kind: 'word', front: '出口', reading: 'でぐち', back: 'Exit' },
  { id: 'tr:入口', kind: 'word', front: '入口', reading: 'いりぐち', back: 'Entrance' },
  { id: 'tr:新幹線', kind: 'word', front: '新幹線', reading: 'しんかんせん', back: 'Bullet train' },
  { id: 'tr:各駅', kind: 'word', front: '各駅停車', reading: 'かくえきていしゃ', back: 'Local train (all stops)' },
  { id: 'tr:終電', kind: 'word', front: '終電', reading: 'しゅうでん', back: 'Last train of the night' },
  { id: 'tr:優先席', kind: 'word', front: '優先席', reading: 'ゆうせんせき', back: 'Priority seat' },
  { id: 'tr:ロッカー', kind: 'word', front: 'コインロッカー', reading: 'コインロッカー', back: 'Coin locker' },
  { id: 'tr:空港', kind: 'word', front: '空港', reading: 'くうこう', back: 'Airport' },
  // Konbini & Shopping
  { id: 'tr:税込', kind: 'word', front: '税込', reading: 'ぜいこみ', back: 'Tax included' },
  { id: 'tr:半額', kind: 'word', front: '半額', reading: 'はんがく', back: 'Half price' },
  { id: 'tr:現金', kind: 'word', front: '現金のみ', reading: 'げんきんのみ', back: 'Cash only' },
  { id: 'tr:レジ袋', kind: 'word', front: 'レジ袋', reading: 'レジぶくろ', back: 'Plastic shopping bag' },
  { id: 'tr:お箸', kind: 'word', front: 'お箸', reading: 'おはし', back: 'Chopsticks' },
  { id: 'tr:温め', kind: 'word', front: '温めますか', reading: 'あたためますか', back: 'Want it heated up?' },
  { id: 'tr:領収書', kind: 'word', front: '領収書', reading: 'りょうしゅうしょ', back: 'Official receipt' },
  { id: 'tr:免税', kind: 'word', front: '免税', reading: 'めんぜい', back: 'Tax-free (Duty-free)' },
  { id: 'tr:カード', kind: 'word', front: 'クレジットカード', reading: 'クレジットカード', back: 'Credit card' },
  { id: 'tr:いくら', kind: 'word', front: 'いくらですか', reading: 'いくらですか', back: 'How much is it?' },
  { id: 'tr:円', kind: 'kanji', front: '円', reading: 'エン / まる', back: 'Yen (currency)' },
  { id: 'tr:営業時間', kind: 'word', front: '営業中', reading: 'えいぎょうちゅう', back: 'Open for business' },
  // Dining & Izakaya
  { id: 'tr:おすすめ', kind: 'word', front: 'おすすめ', reading: 'おすすめ', back: 'Chef’s recommendation' },
  { id: 'tr:大盛り', kind: 'word', front: '大盛り', reading: 'おおもり', back: 'Large portion' },
  { id: 'tr:飲み放題', kind: 'word', front: '飲み放題', reading: 'のみほうだい', back: 'All-you-can-drink' },
  { id: 'tr:定食', kind: 'word', front: '定食', reading: 'ていしょく', back: 'Set meal' },
  { id: 'tr:お会計', kind: 'word', front: 'お会計', reading: 'おかいけい', back: 'Bill / Check please' },
  { id: 'tr:別々', kind: 'word', front: '別々で', reading: 'べつべつで', back: 'Paying separately' },
  { id: 'tr:満席', kind: 'word', front: '満席', reading: 'まんせき', back: 'Full / No seats left' },
  { id: 'tr:予約', kind: 'word', front: '予約', reading: 'よやく', back: 'Reservation' },
  { id: 'tr:禁煙', kind: 'word', front: '禁煙', reading: 'きんえん', back: 'No smoking' },
  { id: 'tr:お水', kind: 'word', front: 'お水', reading: 'おみず', back: 'Water (polite)' },
  { id: 'tr:メニュー', kind: 'word', front: '英語メニュー', reading: 'えいごメニュー', back: 'English menu' },
  { id: 'tr:替え玉', kind: 'word', front: '替え玉', reading: 'かえだま', back: 'Extra noodle refill' },
  { id: 'tr:準備中', kind: 'word', front: '準備中', reading: 'じゅんびちゅう', back: 'Preparing / Closed now' },
  { id: 'tr:おいしい', kind: 'word', front: 'おいしい！', reading: 'おいしい', back: 'Delicious!' },
  // Hotel & Directions
  { id: 'tr:チェックイン', kind: 'word', front: 'チェックイン', reading: 'チェックイン', back: 'Hotel check-in' },
  { id: 'tr:荷物', kind: 'word', front: '荷物', reading: 'にもつ', back: 'Luggage / Bags' },
  { id: 'tr:鍵', kind: 'word', front: '鍵', reading: 'かぎ', back: 'Key / Room key' },
  { id: 'tr:お手洗い', kind: 'word', front: 'お手洗い', reading: 'おてあらい', back: 'Restroom' },
  { id: 'tr:右', kind: 'word', front: '右', reading: 'みぎ', back: 'Right (direction)' },
  { id: 'tr:左', kind: 'word', front: '左', reading: 'ひだり', back: 'Left (direction)' },
  { id: 'tr:まっすぐ', kind: 'word', front: 'まっすぐ', reading: 'まっすぐ', back: 'Straight ahead' },
  { id: 'tr:近い', kind: 'word', front: '近い', reading: 'ちかい', back: 'Near / Close by' },
  { id: 'tr:遠い', kind: 'word', front: '遠い', reading: 'とおい', back: 'Far away' },
  { id: 'tr:地図', kind: 'word', front: '地図', reading: 'ちず', back: 'Map' },
  { id: 'tr:押す', kind: 'word', front: '押す', reading: 'おす', back: 'Push (door)' },
  { id: 'tr:引く', kind: 'word', front: '引く', reading: 'ひく', back: 'Pull (door)' },
  // Polite Survival & Emergencies
  { id: 'tr:すみません', kind: 'word', front: 'すみません', reading: 'すみません', back: 'Excuse me (getting attention)' },
  { id: 'tr:お願いします', kind: 'word', front: 'これをお願いします', reading: 'これをおねがいします', back: 'This one, please' },
  { id: 'tr:大丈夫', kind: 'word', front: '大丈夫です', reading: 'だいじょうぶです', back: 'No thank you / I’m fine' },
  { id: 'tr:わかりません', kind: 'word', front: 'わかりません', reading: 'わかりません', back: 'I don’t understand' },
  { id: 'tr:もう一度', kind: 'word', front: 'もう一度', reading: 'もういちど', back: 'One more time, please' },
  { id: 'tr:写真', kind: 'word', front: '写真を撮ってもいいですか', reading: 'しゃしんをとってもいいですか', back: 'May I take a photo?' },
  { id: 'tr:撮影禁止', kind: 'word', front: '撮影禁止', reading: 'さつえいきんし', back: 'No photography allowed' },
  { id: 'tr:立入禁止', kind: 'word', front: '立入禁止', reading: 'たちいりきんし', back: 'Keep out / No entry' },
  { id: 'tr:病院', kind: 'word', front: '病院', reading: 'びょういん', back: 'Hospital / Clinic' },
  { id: 'tr:薬', kind: 'word', front: '薬', reading: 'くすり', back: 'Medicine' },
];

/** 30 foundational low-stroke N5 kanji for Beginner brushwork rotation */
export const BEGINNER_TRACE_KANJI: string[] = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '日', '月', '火', '水', '木', '金', '土', '人', '大', '小',
  '中', '上', '下', '山', '川', '口', '目', '手', '本', '円',
];
