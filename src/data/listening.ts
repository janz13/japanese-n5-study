/** JLPT N5-style listening (聴解) items. `audio` is pure kana (with 、 pauses) so browser TTS never misreads counters/dates; `transcript` is what the user sees. */
export interface ListeningItem {
  id: string;
  type: 'time' | 'number' | 'price' | 'direction' | 'situation' | 'dialogue';
  audio: string;
  /** Transcript shown after answering. */
  transcript: string;
  question: string;
  options: string[];
  answer: number;
  note?: string;
}

export const LISTENING_TYPES: Record<ListeningItem['type'], string> = {
  time: '🕒 Times & Dates',
  number: '🔢 Numbers',
  price: '💴 Prices',
  direction: '🧭 Directions',
  situation: '💬 Situations',
  dialogue: '👥 Dialogues',
};

export const LISTENING: ListeningItem[] = [
  // Times
  { id: 't1', type: 'time', audio: 'でんしゃは、しちじはんに でます。', transcript: '電車は 七時半（しちじはん）に 出ます。', question: 'What time does the train leave?', options: ['7:30', '4:30', '7:00', '8:30'], answer: 0, note: '七時 = しちじ (not なな). 半 = half past.' },
  { id: 't2', type: 'time', audio: 'かいぎは、くじから、じゅういちじまでです。', transcript: '会議は 九時（くじ）から 十一時までです。', question: 'When is the meeting?', options: ['9:00 – 11:00', '7:00 – 11:00', '9:00 – 10:00', '4:00 – 11:00'], answer: 0, note: '九時 = くじ. 四時 = よじ. から〜まで = from ~ until.' },
  { id: 't3', type: 'time', audio: 'たんじょうびは、しがつ ようかです。', transcript: '誕生日は 四月（しがつ） 八日（ようか）です。', question: 'When is the birthday?', options: ['April 8', 'April 4', 'July 8', 'August 4'], answer: 0, note: '四月 = しがつ; 八日 = ようか (irregular date reading).' },
  { id: 't4', type: 'time', audio: 'みせは、ごご さんじに あきます。', transcript: '店は 午後（ごご） 三時に 開きます。', question: 'When does the shop open?', options: ['3:00 PM', '3:00 AM', '1:00 PM', '5:00 PM'], answer: 0, note: '午前 = AM, 午後 = PM.' },
  { id: 't5', type: 'time', audio: 'テストは、はつかの きんようびです。', transcript: 'テストは 二十日（はつか）の 金曜日です。', question: 'When is the test?', options: ['Friday the 20th', 'Monday the 2nd', 'Friday the 10th', 'Saturday the 20th'], answer: 0, note: '二十日 = はつか (irregular). 金曜日 = Friday.' },
  // Numbers
  { id: 'n1', type: 'number', audio: 'さんばんせんの でんしゃに、のって ください。', transcript: '三番線（さんばんせん）の 電車に 乗って ください。', question: 'Which platform?', options: ['Platform 3', 'Platform 4', 'Platform 8', 'Platform 1'], answer: 0, note: '番線 (ばんせん) = platform/track number.' },
  { id: 'n2', type: 'number', audio: 'でんわばんごうは、ゼロ、きゅう、ゼロの、ろく、に、はち です。', transcript: '電話番号は 090（ゼロきゅうゼロ）の 628 です。', question: 'What is the number?', options: ['090-628', '070-628', '090-528', '090-638'], answer: 0 },
  { id: 'n3', type: 'number', audio: 'へやは、ごかいの、ごひゃくにごうしつです。', transcript: '部屋は 五階の 502号室（ごひゃくにごうしつ）です。', question: 'Which room?', options: ['Room 502, 5th floor', 'Room 205, 2nd floor', 'Room 520, 5th floor', 'Room 502, 2nd floor'], answer: 0 },
  { id: 'n4', type: 'number', audio: 'りんごを、むっつ ください。', transcript: 'りんごを 六つ（むっつ） ください。', question: 'How many apples?', options: ['6', '3', '4', '8'], answer: 0, note: 'ひとつ, ふたつ, みっつ, よっつ, いつつ, むっつ…' },
  // Prices
  { id: 'p1', type: 'price', audio: 'コーヒーは、さんびゃくごじゅうえんです。', transcript: 'コーヒーは 三百五十円（さんびゃくごじゅうえん）です。', question: 'How much is the coffee?', options: ['¥350', '¥315', '¥530', '¥3,500'], answer: 0, note: '三百 = さんびゃく (b sound change).' },
  { id: 'p2', type: 'price', audio: 'この かばんは、はっせんえんです。', transcript: 'この かばんは 八千円（はっせんえん）です。', question: 'How much is the bag?', options: ['¥8,000', '¥800', '¥80,000', '¥1,800'], answer: 0, note: '八千 = はっせん (small っ).' },
  { id: 'p3', type: 'price', audio: 'ぜんぶで、せんろっぴゃくえんに なります。', transcript: '全部で 千六百円（せんろっぴゃくえん）に なります。', question: 'What is the total?', options: ['¥1,600', '¥1,060', '¥6,100', '¥160'], answer: 0, note: '六百 = ろっぴゃく. 全部で = in total.' },
  { id: 'p4', type: 'price', audio: 'きっぷは、いちまい、にひゃくじゅうえんです。', transcript: '切符は 一枚 二百十円（にひゃくじゅうえん）です。', question: 'How much is one ticket?', options: ['¥210', '¥201', '¥2,100', '¥120'], answer: 0, note: '枚 (まい) counts flat things like tickets.' },
  // Directions
  { id: 'd1', type: 'direction', audio: 'まっすぐ いって、ふたつめの かどを、みぎに まがって ください。', transcript: 'まっすぐ 行って、二つ目の 角を 右に 曲がって ください。', question: 'How do you get there?', options: ['Straight, then right at the 2nd corner', 'Straight, then left at the 2nd corner', 'Right at the 1st corner', 'Left, then straight'], answer: 0, note: '右 = right, 左 = left, 角 (かど) = corner.' },
  { id: 'd2', type: 'direction', audio: 'ぎんこうは、えきの まえに あります。', transcript: '銀行は 駅の 前（まえ）に あります。', question: 'Where is the bank?', options: ['In front of the station', 'Behind the station', 'Inside the station', 'Next to the park'], answer: 0, note: '前 = front, 後ろ (うしろ) = behind, 隣 (となり) = next to.' },
  { id: 'd3', type: 'direction', audio: 'トイレは、にかいの ひだりです。', transcript: 'トイレは 二階（にかい）の 左（ひだり）です。', question: 'Where is the restroom?', options: ['2nd floor, on the left', '2nd floor, on the right', '3rd floor, on the left', '1st floor, on the left'], answer: 0 },
  { id: 'd4', type: 'direction', audio: 'ゆうびんきょくは、こうえんの となりです。', transcript: '郵便局は 公園の 隣（となり）です。', question: 'Where is the post office?', options: ['Next to the park', 'Inside the park', 'Across from the school', 'Behind the station'], answer: 0 },
  // Situations
  { id: 's1', type: 'situation', audio: 'すみません、ここで しゃしんを、とっても いいですか。', transcript: 'すみません、ここで 写真を 撮っても いいですか。', question: 'What is the person asking?', options: ['May I take photos here?', 'Can you take my photo?', 'Where is the camera shop?', 'Is this seat free?'], answer: 0, note: '〜ても いいですか = May I ~?' },
  { id: 's2', type: 'situation', audio: 'まどを、あけて ください。', transcript: '窓を 開けて ください。', question: 'What should you do?', options: ['Open the window', 'Close the window', 'Close the door', 'Turn on the light'], answer: 0, note: '開けて = open; 閉めて = close.' },
  { id: 's3', type: 'situation', audio: 'いらっしゃいませ。なんめいさまですか。', transcript: 'いらっしゃいませ。何名様（なんめいさま）ですか。', question: 'What is the restaurant staff asking?', options: ['How many people?', 'What would you like to order?', 'Smoking or non-smoking?', 'Cash or card?'], answer: 0, note: 'Answer with 二人です (ふたりです) etc.' },
  { id: 's4', type: 'situation', audio: 'あしたは あめですから、かさを もって きて ください。', transcript: '明日は 雨ですから、傘（かさ）を 持って 来て ください。', question: 'What should you bring tomorrow?', options: ['An umbrella', 'A lunch box', 'A jacket', 'A dictionary'], answer: 0 },
  // Dialogues (JLPT 聴解 style: two speakers, question about the outcome)
  { id: 'c1', type: 'dialogue', audio: 'おとこのひとと、おんなのひとが はなしています。おんなのひとは、なにを のみますか。……M:コーヒーと こうちゃ、どちらが いいですか。……F:そうですね、こうちゃを ください。あ、やっぱり、つめたい おちゃに します。', transcript: '男：コーヒーと 紅茶、どちらが いいですか。\n女：そうですね、紅茶を ください。あ、やっぱり、冷たい お茶に します。', question: 'What will the woman drink?', options: ['Cold green tea', 'Black tea', 'Coffee', 'Water'], answer: 0, note: 'やっぱり signals a change of mind — JLPT loves this trap!' },
  { id: 'c2', type: 'dialogue', audio: 'おんなのひとと、おとこのひとが はなしています。ふたりは、なんじに あいますか。……F:あしたは、くじに えきで あいましょう。……M:くじは ちょっと はやいです。じゅうじは どうですか。……F:いいですよ。じゃあ、じゅうじに。', transcript: '女：明日は 九時に 駅で 会いましょう。\n男：九時は ちょっと 早いです。十時は どうですか。\n女：いいですよ。じゃあ、十時に。', question: 'What time will they meet?', options: ['10:00', '9:00', '9:30', '11:00'], answer: 0, note: 'The first time mentioned is often NOT the answer — listen to the end.' },
  { id: 'c3', type: 'dialogue', audio: 'みせで、おとこのひとと、てんいんが はなしています。おとこのひとは、ぜんぶで いくら はらいますか。……M:すみません、この ペンは いくらですか。……F:ひゃくえんです。……M:じゃあ、みっつ ください。', transcript: '男：すみません、この ペンは いくらですか。\n店員：百円です。\n男：じゃあ、三つ ください。', question: 'How much does the man pay in total?', options: ['¥300', '¥100', '¥200', '¥3,000'], answer: 0, note: '百円 × 三つ = 三百円 (さんびゃくえん).' },
  { id: 'c4', type: 'dialogue', audio: 'がっこうで、せんせいが はなしています。がくせいは、あした なにを もって きますか。……M:あしたは、こうえんで えを かきます。えんぴつと、おべんとうを もって きて ください。ノートは いりません。', transcript: '先生：明日は 公園で 絵を かきます。鉛筆と お弁当を 持って 来て ください。ノートは いりません。', question: 'What should students bring tomorrow?', options: ['Pencils and lunch', 'A notebook and lunch', 'Pencils and a notebook', 'Only a notebook'], answer: 0, note: 'いりません = not needed. Watch for items that are explicitly excluded.' },
  { id: 'c5', type: 'dialogue', audio: 'えきで、おんなのひとと、えきいんが はなしています。おんなのひとは、なんばんせんに いきますか。……F:すみません、しんじゅくへ いきたいんですが。……M:しんじゅくなら、にばんせんです。あ、すみません、きょうは こうじで、ごばんせんです。', transcript: '女：すみません、新宿へ 行きたいんですが。\n駅員：新宿なら 二番線です。あ、すみません、今日は 工事で 五番線です。', question: 'Which platform should she go to?', options: ['Platform 5', 'Platform 2', 'Platform 7', 'Platform 1'], answer: 0, note: '工事 (こうじ) = construction. The correction at the end is the real answer.' },
];