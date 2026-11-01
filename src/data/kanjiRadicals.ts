export interface KanjiBreakdown {
  radical: string;
  radicalName: string;
  parts: string[];
  mnemonic: string;
}

export const RADICAL_FAMILIES: { id: string; label: string; chars: string[] }[] = [
  { id: 'person', label: '亻・人 Person', chars: ['人', '休', '何', '今', '会', '体', '働', '仕', '作', '使', '住'] },
  { id: 'speech', label: '言 Speech', chars: ['言', '語', '話', '読'] },
  { id: 'sun_time', label: '日・月 Sun & Time', chars: ['日', '月', '時', '曜', '今', '週', '毎', '早', '白', '百'] },
  { id: 'tree_plant', label: '木・艹 Tree & Plant', chars: ['木', '本', '休', '校', '東', '新', '来', '花', '薬'] },
  { id: 'gate_door', label: '門・口 Gate & Mouth', chars: ['口', '聞', '開', '閉', '名', '右', '古', '国', '四'] },
  { id: 'motion_road', label: '辶・行 Motion & Road', chars: ['行', '道', '週', '待', '歩', '走', '起', '来', '出', '入'] },
  { id: 'woman_family', label: '女・子 Woman & Family', chars: ['女', '子', '母', '父', '男', '学', '安', '姉', '妹', '兄', '弟', '始', '族'] },
  { id: 'roof_place', label: '宀・广・阝 Roof & Place', chars: ['家', '安', '室', '寝', '空', '店', '屋', '院', '病', '館', '場', '所'] },
  { id: 'heart_mind', label: '心・思 Heart & Mind', chars: ['心', '思', '考', '知', '教', '習', '勉', '強', '気'] },
  { id: 'nature_water', label: '水・雨・火・山 Nature', chars: ['水', '火', '土', '金', '山', '川', '雨', '電', '天', '温', '魚'] },
];

export const KANJI_BREAKDOWNS: Record<string, KanjiBreakdown> = {
  休: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '木 (tree)'], mnemonic: 'A person (亻) leaning against a tree (木) to take a rest.' },
  体: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '本 (root / origin)'], mnemonic: 'The root/foundation (本) of a person (亻) is their physical body.' },
  何: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '可 (can / possible)'], mnemonic: 'A person (亻) asking what (何) is possible (可).' },
  働: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '重 (heavy)', '力 (power)'], mnemonic: 'A person (亻) moving heavy (重) things with strength (力) is working (働く).' },
  仕: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '士 (samurai / scholar)'], mnemonic: 'A person (亻) standing beside a samurai/official (士) to serve and do work.' },
  作: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '乍 (craft / saw)'], mnemonic: 'A person (亻) crafting raw materials to make (作る) something.' },
  使: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '吏 (official)'], mnemonic: 'A person (亻) dispatching an official (吏) to use a tool or service.' },
  住: { radical: '亻', radicalName: 'Person (にんべん)', parts: ['亻 (person)', '主 (master / lamp)'], mnemonic: 'Where a person (亻) is the master (主) and keeps their lamp lit is where they live.' },
  語: { radical: '言', radicalName: 'Speech (ごんべん)', parts: ['言 (words)', '五 (five)', '口 (mouth)'], mnemonic: 'Words (言) spoken by five (五) mouths (口) form a whole language (語).' },
  話: { radical: '言', radicalName: 'Speech (ごんべん)', parts: ['言 (words)', '舌 (tongue)'], mnemonic: 'Using your tongue (舌) to produce words (言) when talking.' },
  読: { radical: '言', radicalName: 'Speech (ごんべん)', parts: ['言 (words)', '売 (sell / spread)'], mnemonic: 'Looking at words (言) circulated on a page and reading them aloud.' },
  聞: { radical: '門', radicalName: 'Gate (もんがまえ)', parts: ['門 (gate)', '耳 (ear)'], mnemonic: 'Putting your ear (耳) up to the gate (門) to hear and listen.' },
  開: { radical: '門', radicalName: 'Gate (もんがまえ)', parts: ['門 (gate)', '廾 (two hands)'], mnemonic: 'Two hands pulling back the bar inside a gate (門) to open it.' },
  閉: { radical: '門', radicalName: 'Gate (もんがまえ)', parts: ['門 (gate)', '才 (brace / timber)'], mnemonic: 'Placing a wooden brace (才) across the gate (門) to close and lock it.' },
  時: { radical: '日', radicalName: 'Sun (ひへん)', parts: ['日 (sun)', '寺 (temple)'], mnemonic: 'Monks at the temple (寺) tracking the sun (日) to measure time and hours.' },
  曜: { radical: '日', radicalName: 'Sun (ひへん)', parts: ['日 (sun)', '羽 (wings)', '隹 (bird)'], mnemonic: 'The sun (日) flying on wings (羽) through the days of the week.' },
  本: { radical: '木', radicalName: 'Tree (き)', parts: ['木 (tree)', '一 (root mark)'], mnemonic: 'A horizontal stroke marking the base of a tree (木): the origin and paper for books.' },
  校: { radical: '木', radicalName: 'Tree (きへん)', parts: ['木 (tree)', '交 (mix / cross)'], mnemonic: 'A wooden building (木) where students cross paths and mingle (交): school.' },
  東: { radical: '木', radicalName: 'Tree (き)', parts: ['日 (sun)', '木 (tree)'], mnemonic: 'The rising sun (日) shining right through the branches of a tree (木) in the east.' },
  新: { radical: '斤', radicalName: 'Axe (おのづくり)', parts: ['立 (stand)', '木 (tree)', '斤 (axe)'], mnemonic: 'Taking an axe (斤) to a standing (立) tree (木) reveals fresh, new wood.' },
  安: { radical: '宀', radicalName: 'Roof (うかんむり)', parts: ['宀 (roof)', '女 (woman)'], mnemonic: 'Safe and peaceful under a sturdy roof (宀): cheap and安心 (peace of mind).' },
  家: { radical: '宀', radicalName: 'Roof (うかんむり)', parts: ['宀 (roof)', '豕 (livestock)'], mnemonic: 'A roof (宀) sheltering the household and its livelihood: house and family.' },
  室: { radical: '宀', radicalName: 'Roof (うかんむり)', parts: ['宀 (roof)', '至 (arrive)'], mnemonic: 'The inner room under a roof (宀) where you arrive (至) and settle.' },
  寝: { radical: '宀', radicalName: 'Roof (うかんむり)', parts: ['宀 (roof)', '爿 (bed)', '又 (hand)'], mnemonic: 'Lying on a bed under a roof (宀) to sleep.' },
  空: { radical: '穴', radicalName: 'Cave / Hole (あな)', parts: ['穴 (opening)', '工 (craft / sky vault)'], mnemonic: 'Looking up through an opening (穴) into the vast vault of the sky (空).' },
  電: { radical: '雨', radicalName: 'Rain (あめかんむり)', parts: ['雨 (raincloud)', '電 (lightning tail)'], mnemonic: 'A flash of lightning streaking down from a raincloud (雨): electricity.' },
  駅: { radical: '馬', radicalName: 'Horse (うまへん)', parts: ['馬 (horse)', '尺 (measure / post)'], mnemonic: 'Historically a relay post where horses (馬) were changed; today a train station.' },
  道: { radical: '辶', radicalName: 'Road (しんにょう)', parts: ['辶 (road)', '首 (head)'], mnemonic: 'Pointing your head (首) forward as you walk along the road (辶).' },
  週: { radical: '辶', radicalName: 'Road (しんにょう)', parts: ['辶 (walk / cycle)', '周 (circumference)'], mnemonic: 'Moving (辶) around a full 7-day cycle (周): a week.' },
  男: { radical: '田', radicalName: 'Rice Field (た)', parts: ['田 (rice field)', '力 (strength)'], mnemonic: 'Exerting strength (力) in the rice field (田).' },
  名: { radical: '口', radicalName: 'Mouth (くち)', parts: ['夕 (evening)', '口 (mouth)'], mnemonic: 'In the dim evening (夕), calling out with your mouth (口) to state your name.' },
  国: { radical: '囗', radicalName: 'Enclosure (くにがまえ)', parts: ['囗 (border)', '玉 (jewel)'], mnemonic: 'A precious treasure (玉) protected inside national borders (囗): country.' },
  外: { radical: '夕', radicalName: 'Evening (ゆうべ)', parts: ['夕 (evening)', 'ト (divination crack)'], mnemonic: 'Stepping outside (外) under the evening (夕) sky.' },
  買: { radical: '貝', radicalName: 'Shell / Money (かい)', parts: ['罒 (net)', '貝 (cowrie shell money)'], mnemonic: 'Using shell money (貝) to net (罒) goods at the market: to buy.' },
  食: { radical: '食', radicalName: 'Food (しょく)', parts: ['人 (roof/gathering)', '良 (good)'], mnemonic: 'Gathering under a roof (人) over good (良) ingredients to eat.' },
  飲: { radical: '食', radicalName: 'Food/Drink (しょくへん)', parts: ['飠 (food/drink)', '欠 (open mouth)'], mnemonic: 'Opening your mouth wide (欠) to drink (飲).' },
  館: { radical: '食', radicalName: 'Food (しょくへん)', parts: ['飠 (hospitality)', '官 (official building)'], mnemonic: 'A large public hall or inn (館) offering hospitality.' },
  花: { radical: '艹', radicalName: 'Grass / Plant (くさかんむり)', parts: ['艹 (plant)', '化 (transform)'], mnemonic: 'A plant (艹) that transforms (化) into a blooming flower.' },
  薬: { radical: '艹', radicalName: 'Grass / Plant (くさかんむり)', parts: ['艹 (herbs)', '楽 (comfort / ease)'], mnemonic: 'Medicinal herbs (艹) that bring comfort and relief (楽): medicine.' },
  病: { radical: '疒', radicalName: 'Sickness (やまいだれ)', parts: ['疒 (sickbed)', '丙 (fever)'], mnemonic: 'Resting on a sickbed (疒) with an illness.' },
  院: { radical: '阝', radicalName: 'Mound / Wall (こざとへん)', parts: ['阝 (courtyard wall)', '完 (complete)'], mnemonic: 'An enclosed institutional complex (院) such as a hospital (病院).' },
  思: { radical: '心', radicalName: 'Heart (こころ)', parts: ['田 (brain / field)', '心 (heart)'], mnemonic: 'What occupies both your head (田) and your heart (心): to think.' },
  知: { radical: '矢', radicalName: 'Arrow (やへん)', parts: ['矢 (arrow)', '口 (mouth)'], mnemonic: 'Speaking (口) as swiftly and accurately as an arrow (矢) because you know the answer.' },
  教: { radical: '攵', radicalName: 'Action / Tap (ぼくづくり)', parts: ['孝 (filial guidance)', '攵 (guide)'], mnemonic: 'Guiding a child step by step to teach (教える) them.' },
  習: { radical: '羽', radicalName: 'Feathers / Wings (はね)', parts: ['羽 (wings)', '白 (white / sun)'], mnemonic: 'A young bird flapping its wings (羽) repeatedly until it learns (習う) to fly.' },
  強: { radical: '弓', radicalName: 'Bow (ゆみへん)', parts: ['弓 (bow)', '虫 (beetle)'], mnemonic: 'A taut bow (弓) and a rhino beetle with a tough shell: strong (強い).' },
  持: { radical: '扌', radicalName: 'Hand (てへん)', parts: ['扌 (hand)', '寺 (temple)'], mnemonic: 'Holding (持つ) something steadily in your hand (扌).' },
  待: { radical: '彳', radicalName: 'Step (ぎょうにんべん)', parts: ['彳 (footsteps)', '寺 (temple)'], mnemonic: 'Pausing your footsteps (彳) outside the temple (寺) to wait (待つ).' },
  歩: { radical: '止', radicalName: 'Stop / Foot (とめる)', parts: ['止 (footprint)', '少 (a little)'], mnemonic: 'Placing one footprint (止) a little (少) ahead of the other: to walk.' },
  起: { radical: '走', radicalName: 'Run / Rise (そうにょう)', parts: ['走 (rise / move)', '己 (oneself)'], mnemonic: 'Raising yourself (己) up out of bed: to wake up (起きる).' },
  始: { radical: '女', radicalName: 'Woman (おんなへん)', parts: ['女 (origin)', '台 (pedestal)'], mnemonic: 'Setting the foundation on a pedestal (台) to begin (始める).' },
  終: { radical: '糸', radicalName: 'Thread (いとへん)', parts: ['糸 (thread)', '冬 (winter)'], mnemonic: 'Tying off the end of a thread (糸) at the close of winter (冬): to end.' },
  旅: { radical: '方', radicalName: 'Direction / Flag (ほうへん)', parts: ['方 (banner)', '人 (travelers)', '衣 (cloak)'], mnemonic: 'People (人) in travel cloaks (衣) gathering under a guide’s banner (方) to set off on a trip (旅).' },
  温: { radical: '氵', radicalName: 'Water (さんずい)', parts: ['氵 (water)', '日 (sun)', '皿 (basin)'], mnemonic: 'Water (氵) heated by the sun (日) in a bath basin (皿): warm / hot spring (温泉).' },
};

export function getKanjiBreakdown(k: string, meaning: string, strokes: number): KanjiBreakdown {
  if (KANJI_BREAKDOWNS[k]) return KANJI_BREAKDOWNS[k];
  const fam = RADICAL_FAMILIES.find((f) => f.chars.includes(k));
  return {
    radical: fam ? fam.label.split(' ')[0] : k,
    radicalName: fam ? fam.label : `Core pictograph (${strokes} strokes)`,
    parts: [ `${k} (${meaning.split(',')[0]})` ],
    mnemonic: `Core ${strokes}-stroke character meaning "${meaning}". Practice its stroke balance in the canvas below.`,
  };
}
