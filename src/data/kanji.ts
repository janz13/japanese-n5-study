export interface Kanji {
  k: string;
  strokes: number;
  meaning: string;
  on: string;
  kun: string;
  ex: { w: string; r: string; en: string };
}

const STROKES: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 5, 五: 4, 六: 4, 七: 2, 八: 2, 九: 2, 十: 2,
  百: 6, 千: 3, 万: 3, 円: 4, 日: 4, 月: 4, 火: 4, 水: 4, 木: 4, 金: 8,
  土: 3, 曜: 18, 年: 6, 時: 10, 分: 4, 半: 5, 今: 4, 何: 7, 週: 11, 毎: 6,
  午: 4, 前: 9, 後: 9, 人: 2, 男: 7, 女: 3, 子: 3, 父: 4, 母: 5, 友: 4,
  名: 6, 学: 8, 生: 5, 先: 6, 校: 10, 語: 14, 本: 5, 国: 8, 山: 3, 川: 3,
  天: 4, 気: 6, 雨: 8, 電: 13, 車: 7, 駅: 14, 道: 12, 店: 8, 社: 7, 会: 6,
  上: 3, 下: 3, 中: 4, 外: 5, 左: 5, 右: 5, 東: 8, 西: 6, 南: 9, 北: 5,
  大: 3, 小: 3, 高: 10, 安: 6, 長: 8, 新: 13, 古: 5, 白: 5, 多: 6, 少: 4,
  見: 7, 行: 6, 来: 7, 食: 9, 飲: 12, 聞: 14, 読: 14, 書: 10, 話: 13, 言: 7,
  買: 12, 休: 6, 立: 5, 入: 2, 出: 5, 口: 3, 目: 5, 耳: 6, 手: 4, 足: 7,
  花: 7, 魚: 11, 空: 8,
};

// Format: 字|meaning|on|kun|example:reading:meaning
const RAW = `日|day, sun|ニチ、ジツ|ひ、か|日本:にほん:Japan
一|one|イチ|ひと(つ)|一つ:ひとつ:one thing
二|two|ニ|ふた(つ)|二人:ふたり:two people
三|three|サン|みっ(つ)|三月:さんがつ:March
四|four|シ|よん、よ(つ)|四時:よじ:4 o'clock
五|five|ゴ|いつ(つ)|五分:ごふん:5 minutes
六|six|ロク|むっ(つ)|六百:ろっぴゃく:600
七|seven|シチ|なな(つ)|七時:しちじ:7 o'clock
八|eight|ハチ|やっ(つ)|八百:はっぴゃく:800
九|nine|キュウ、ク|ここの(つ)|九時:くじ:9 o'clock
十|ten|ジュウ|とお|十日:とおか:10th day
百|hundred|ヒャク|—|三百:さんびゃく:300
千|thousand|セン|ち|千円:せんえん:1,000 yen
万|ten thousand|マン|—|一万円:いちまんえん:10,000 yen
円|yen, circle|エン|まる(い)|百円:ひゃくえん:100 yen
月|month, moon|ゲツ、ガツ|つき|月曜日:げつようび:Monday
火|fire|カ|ひ|火曜日:かようび:Tuesday
水|water|スイ|みず|水曜日:すいようび:Wednesday
木|tree|モク|き|木曜日:もくようび:Thursday
金|gold, money|キン|かね|お金:おかね:money
土|earth|ド|つち|土曜日:どようび:Saturday
曜|weekday|ヨウ|—|日曜日:にちようび:Sunday
年|year|ネン|とし|今年:ことし:this year
時|time, hour|ジ|とき|時間:じかん:time
分|minute, part|フン、ブン|わ(かる)|分かる:わかる:understand
半|half|ハン|なか(ば)|半分:はんぶん:half
今|now|コン|いま|今日:きょう:today
何|what|カ|なに、なん|何時:なんじ:what time
週|week|シュウ|—|今週:こんしゅう:this week
毎|every|マイ|—|毎日:まいにち:every day
午|noon|ゴ|—|午後:ごご:p.m.
前|before|ゼン|まえ|午前:ごぜん:a.m.
後|after, behind|ゴ|うし(ろ)、あと|後ろ:うしろ:behind
人|person|ジン、ニン|ひと|日本人:にほんじん:Japanese person
男|man|ダン|おとこ|男の人:おとこのひと:man
女|woman|ジョ|おんな|女の子:おんなのこ:girl
子|child|シ|こ|子ども:こども:child
父|father|フ|ちち|お父さん:おとうさん:father
母|mother|ボ|はは|お母さん:おかあさん:mother
友|friend|ユウ|とも|友だち:ともだち:friend
名|name|メイ|な|名前:なまえ:name
学|study|ガク|まな(ぶ)|学生:がくせい:student
生|life, birth|セイ|い(きる)|先生:せんせい:teacher
先|ahead, previous|セン|さき|先週:せんしゅう:last week
校|school|コウ|—|学校:がっこう:school
語|language|ゴ|かた(る)|日本語:にほんご:Japanese
本|book, origin|ホン|もと|本:ほん:book
国|country|コク|くに|中国:ちゅうごく:China
山|mountain|サン|やま|富士山:ふじさん:Mt. Fuji
川|river|セン|かわ|川:かわ:river
天|heaven|テン|あま|天気:てんき:weather
気|spirit|キ|—|元気:げんき:healthy
雨|rain|ウ|あめ|雨:あめ:rain
電|electricity|デン|—|電車:でんしゃ:train
車|car|シャ|くるま|車:くるま:car
駅|station|エキ|—|駅:えき:station
道|road|ドウ|みち|道:みち:road
店|shop|テン|みせ|店:みせ:shop
社|company|シャ|—|会社:かいしゃ:company
会|meet|カイ|あ(う)|会う:あう:meet
上|up, above|ジョウ|うえ|上:うえ:above
下|down, below|カ、ゲ|した|下:した:below
中|middle, inside|チュウ|なか|中:なか:inside
外|outside|ガイ|そと|外国:がいこく:foreign country
左|left|サ|ひだり|左:ひだり:left
右|right|ウ|みぎ|右:みぎ:right
東|east|トウ|ひがし|東京:とうきょう:Tokyo
西|west|セイ|にし|西:にし:west
南|south|ナン|みなみ|南:みなみ:south
北|north|ホク|きた|北:きた:north
大|big|ダイ|おお(きい)|大きい:おおきい:big
小|small|ショウ|ちい(さい)|小さい:ちいさい:small
高|tall, expensive|コウ|たか(い)|高い:たかい:expensive
安|cheap|アン|やす(い)|安い:やすい:cheap
長|long|チョウ|なが(い)|長い:ながい:long
新|new|シン|あたら(しい)|新しい:あたらしい:new
古|old|コ|ふる(い)|古い:ふるい:old
白|white|ハク|しろ|白い:しろい:white
多|many|タ|おお(い)|多い:おおい:many
少|few, a little|ショウ|すく(ない)、すこ(し)|少し:すこし:a little
見|see|ケン|み(る)|見る:みる:see
行|go|コウ|い(く)|行く:いく:go
来|come|ライ|く(る)|来る:くる:come
食|eat|ショク|た(べる)|食べる:たべる:eat
飲|drink|イン|の(む)|飲む:のむ:drink
聞|hear, ask|ブン|き(く)|聞く:きく:listen
読|read|ドク|よ(む)|読む:よむ:read
書|write|ショ|か(く)|書く:かく:write
話|talk|ワ|はな(す)|話す:はなす:speak
言|say|ゲン|い(う)|言う:いう:say
買|buy|バイ|か(う)|買う:かう:buy
休|rest|キュウ|やす(む)|休み:やすみ:holiday
立|stand|リツ|た(つ)|立つ:たつ:stand
入|enter|ニュウ|はい(る)|入る:はいる:enter
出|exit|シュツ|で(る)|出口:でぐち:exit
口|mouth|コウ|くち|入口:いりぐち:entrance
目|eye|モク|め|目:め:eye
耳|ear|ジ|みみ|耳:みみ:ear
手|hand|シュ|て|手:て:hand
足|foot, leg|ソク|あし|足:あし:foot
花|flower|カ|はな|花:はな:flower
魚|fish|ギョ|さかな|魚:さかな:fish
空|sky|クウ|そら|空港:くうこう:airport`;

export const KANJI: Kanji[] = RAW.split('\n').map((line) => {
  const [k, meaning, on, kun, ex] = line.split('|');
  const [w, r, en] = ex.split(':');
  return { k, strokes: STROKES[k] ?? 5, meaning, on, kun, ex: { w, r, en } };
});
