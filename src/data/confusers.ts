export interface ConfuserChoice {
  glyph: string;
  reading: string;
  meaning: string;
  distinguishingFeature: string;
  strokeCalloutTag: string; // e.g. "Upward Sweep ↗", "Downward Drop ↙", "Closed Loop", "Top Dot 丶"
}

export type VisualDiffType =
  | 'stroke-direction'
  | 'loop-vs-open'
  | 'dot-presence'
  | 'length-ratio'
  | 'radical-diff'
  | 'stroke-order'
  | 'protrusion';

export interface ConfuserChallenge {
  prompt: string;
  subPrompt?: string;
  audioReading: string;
  targetGlyph: string;
}

export interface ConfuserGroup {
  id: string;
  kind: 'kana' | 'kanji';
  title: string;
  diffType: VisualDiffType;
  distinctionRule: string;
  strokeDirectionCallout: string;
  choices: ConfuserChoice[];
  challenges: ConfuserChallenge[];
}

export const CONFUSER_GROUPS: ConfuserGroup[] = [
  // -------------------------------------------------------------
  // KANA CONFUSERS (9 Groups)
  // -------------------------------------------------------------
  {
    id: 'kana-shi-tsu',
    kind: 'kana',
    title: 'シ (shi) vs ツ (tsu)',
    diffType: 'stroke-direction',
    distinctionRule: 'シ (shi) strokes are aligned vertically on the left and the long stroke sweeps UPWARD from bottom-left (↗). ツ (tsu) strokes are aligned horizontally at the top and the long stroke drops DOWNWARD from top-right (↙).',
    strokeDirectionCallout: 'シ sweeps UP ↗ from bottom-left | ツ plunges DOWN ↙ from top-right',
    choices: [
      { glyph: 'シ', reading: 'shi', meaning: 'Katakana shi', distinguishingFeature: 'Vertical dots; long stroke sweeps UPWARD (↗)', strokeCalloutTag: 'Upward Sweep ↗' },
      { glyph: 'ツ', reading: 'tsu', meaning: 'Katakana tsu', distinguishingFeature: 'Horizontal dots; long stroke drops DOWNWARD (↙)', strokeCalloutTag: 'Downward Drop ↙' },
    ],
    challenges: [
      { prompt: 'shi', subPrompt: 'Sweep from bottom-left', audioReading: 'シ', targetGlyph: 'シ' },
      { prompt: 'tsu', subPrompt: 'Drop from top-right', audioReading: 'ツ', targetGlyph: 'ツ' },
      { prompt: 'Tears splashing UPWARDS', subPrompt: 'Vertical dots alignment', audioReading: 'シ', targetGlyph: 'シ' },
      { prompt: 'Tsunami crashing DOWNWARDS', subPrompt: 'Horizontal dots alignment', audioReading: 'ツ', targetGlyph: 'ツ' },
    ],
  },
  {
    id: 'kana-so-n',
    kind: 'kana',
    title: 'ソ (so) vs ン (n)',
    diffType: 'stroke-direction',
    distinctionRule: 'ソ (so) has a steep upper dot and the long stroke begins high and plunges DOWNWARD (↙). ン (n) has a flatter lower dot and the long stroke sweeps UPWARD (↗) from the bottom.',
    strokeDirectionCallout: 'ソ drops DOWN ↙ (like ツ) | ン sweeps UP ↗ (like シ)',
    choices: [
      { glyph: 'ソ', reading: 'so', meaning: 'Katakana so', distinguishingFeature: 'Steep top dot; stroke drops DOWNWARD (↙)', strokeCalloutTag: 'Downward Drop ↙' },
      { glyph: 'ン', reading: 'n / nn', meaning: 'Katakana n', distinguishingFeature: 'Flat bottom dot; stroke sweeps UPWARD (↗)', strokeCalloutTag: 'Upward Sweep ↗' },
    ],
    challenges: [
      { prompt: 'so', subPrompt: 'Stroke begins high, plunges down', audioReading: 'ソ', targetGlyph: 'ソ' },
      { prompt: 'n (nn)', subPrompt: 'Stroke begins low, sweeps up', audioReading: 'ン', targetGlyph: 'ン' },
      { prompt: 'Sewing needle plunging down', subPrompt: 'Matches the drop in ツ', audioReading: 'ソ', targetGlyph: 'ソ' },
      { prompt: 'Airplane taking off upwards', subPrompt: 'Matches the sweep in シ', audioReading: 'ン', targetGlyph: 'ン' },
    ],
  },
  {
    id: 'kana-re-ne-wa',
    kind: 'kana',
    title: 'れ (re) vs ね (ne) vs わ (wa)',
    diffType: 'loop-vs-open',
    distinctionRule: 'All three share the same vertical left trunk. れ (re) terminates in a sharp outward flick (⤻). ね (ne) terminates in a closed looped curl like a cat tail. わ (wa) terminates in a round, open smooth curve.',
    strokeDirectionCallout: 'れ flicks OUT ⤻ | ね forms a LOOP 🐈 | わ stays OPEN ◯',
    choices: [
      { glyph: 'れ', reading: 're', meaning: 'Hiragana re', distinguishingFeature: 'Tail flicks outward to the right (⤻)', strokeCalloutTag: 'Outward Flick ⤻' },
      { glyph: 'ね', reading: 'ne', meaning: 'Hiragana ne', distinguishingFeature: 'Tail ends in a closed loop (like neko)', strokeCalloutTag: 'Closed Loop 🐈' },
      { glyph: 'わ', reading: 'wa', meaning: 'Hiragana wa', distinguishingFeature: 'Tail is a smooth, open round belly', strokeCalloutTag: 'Open Belly ◯' },
    ],
    challenges: [
      { prompt: 're', subPrompt: 'Reindeer kicking back', audioReading: 'れ', targetGlyph: 'れ' },
      { prompt: 'ne', subPrompt: 'Neko with curled loop tail', audioReading: 'ね', targetGlyph: 'ね' },
      { prompt: 'wa', subPrompt: 'Round open swan belly', audioReading: 'わ', targetGlyph: 'わ' },
      { prompt: 'Closed curl at bottom-right', subPrompt: 'Which hiragana has the knot/loop?', audioReading: 'ね', targetGlyph: 'ね' },
      { prompt: 'Sharp rightward flick', subPrompt: 'Which hiragana kicks out?', audioReading: 'れ', targetGlyph: 'れ' },
      { prompt: 'Smooth curve with NO loop or flick', subPrompt: 'Open rounded body', audioReading: 'わ', targetGlyph: 'わ' },
    ],
  },
  {
    id: 'kana-nu-me',
    kind: 'kana',
    title: 'ぬ (nu) vs め (me)',
    diffType: 'loop-vs-open',
    distinctionRule: 'ぬ (nu) has a noodle knot/loop at the bottom-right tail. め (me) has no loop; the stroke crosses through smoothly like an eye (目).',
    strokeDirectionCallout: 'ぬ has a tail LOOP 🍜 | め is a clean CROSS ✕',
    choices: [
      { glyph: 'ぬ', reading: 'nu', meaning: 'Hiragana nu', distinguishingFeature: 'Ends in a looped knot on the tail', strokeCalloutTag: 'Knotted Loop 🍜' },
      { glyph: 'め', reading: 'me', meaning: 'Hiragana me', distinguishingFeature: 'Smooth diagonal cross, no loop', strokeCalloutTag: 'Clean Slash ✕' },
    ],
    challenges: [
      { prompt: 'nu', subPrompt: 'Noodles with a tangled loop', audioReading: 'ぬ', targetGlyph: 'ぬ' },
      { prompt: 'me', subPrompt: 'Cut noodles, no loop (eye)', audioReading: 'め', targetGlyph: 'め' },
      { prompt: 'Bottom-right closed knot', subPrompt: 'Contains the terminal loop', audioReading: 'ぬ', targetGlyph: 'ぬ' },
      { prompt: 'Terminal slash crosses through cleanly', subPrompt: 'Zero loops', audioReading: 'め', targetGlyph: 'め' },
    ],
  },
  {
    id: 'kana-ru-ro',
    kind: 'kana',
    title: 'る (ru) vs ろ (ro)',
    diffType: 'loop-vs-open',
    distinctionRule: 'る (ru) terminates in a small round loop at the end of the stroke. ろ (ro) has no loop and ends as an open road.',
    strokeDirectionCallout: 'る has a terminal LOOP ➰ | ろ has an OPEN road 🛣️',
    choices: [
      { glyph: 'る', reading: 'ru', meaning: 'Hiragana ru', distinguishingFeature: 'Curled terminal loop at bottom', strokeCalloutTag: 'Terminal Loop ➰' },
      { glyph: 'ろ', reading: 'ro', meaning: 'Hiragana ro', distinguishingFeature: 'Open tail with no loop', strokeCalloutTag: 'Open Tail 🛣️' },
    ],
    challenges: [
      { prompt: 'ru', subPrompt: 'Road with a loop at the end', audioReading: 'る', targetGlyph: 'る' },
      { prompt: 'ro', subPrompt: 'Road robbed of its loop', audioReading: 'ろ', targetGlyph: 'ろ' },
      { prompt: 'Has a small loop inside', subPrompt: 'Curled tail', audioReading: 'る', targetGlyph: 'る' },
      { prompt: 'Completely open at bottom', subPrompt: 'No terminal loop', audioReading: 'ろ', targetGlyph: 'ろ' },
    ],
  },
  {
    id: 'kana-ha-ho',
    kind: 'kana',
    title: 'は (ha) vs ほ (ho)',
    diffType: 'protrusion',
    distinctionRule: 'は (ha) has an open top on the right side. ほ (ho) has a horizontal roof bar over the right vertical stem, and the stem does NOT poke through it.',
    strokeDirectionCallout: 'は is OPEN at the top | ほ has a top ROOF bar',
    choices: [
      { glyph: 'は', reading: 'ha', meaning: 'Hiragana ha', distinguishingFeature: 'Open top above the loop', strokeCalloutTag: 'Open Top' },
      { glyph: 'ほ', reading: 'ho', meaning: 'Hiragana ho', distinguishingFeature: 'Top horizontal roof bar covers stem', strokeCalloutTag: 'Roof Bar 🏠' },
    ],
    challenges: [
      { prompt: 'ha', subPrompt: 'Hockey stick with open top', audioReading: 'は', targetGlyph: 'は' },
      { prompt: 'ho', subPrompt: 'House with a horizontal roof bar', audioReading: 'ほ', targetGlyph: 'ほ' },
      { prompt: 'Has an upper horizontal crossbar', subPrompt: 'Roof covering the stem', audioReading: 'ほ', targetGlyph: 'ほ' },
      { prompt: 'Right stem is open at the top', subPrompt: 'No upper horizontal bar', audioReading: 'は', targetGlyph: 'は' },
    ],
  },
  {
    id: 'kana-a-o',
    kind: 'kana',
    title: 'あ (a) vs お (o)',
    diffType: 'dot-presence',
    distinctionRule: 'あ (a) has a cross in the center with a circular loop around it. お (o) has a separate floating accent dash/dot (丶) on the upper right.',
    strokeDirectionCallout: 'あ has centered cross loop | お has separate TOP-RIGHT DOT 丶',
    choices: [
      { glyph: 'あ', reading: 'a', meaning: 'Hiragana a', distinguishingFeature: 'Crossed vertical stem with looping knot', strokeCalloutTag: 'Cross Loop' },
      { glyph: 'お', reading: 'o', meaning: 'Hiragana o', distinguishingFeature: 'Separate accent dot on upper-right', strokeCalloutTag: 'Upper-Right Dot 丶' },
    ],
    challenges: [
      { prompt: 'a', subPrompt: 'Apple with a center cross loop', audioReading: 'あ', targetGlyph: 'あ' },
      { prompt: 'o', subPrompt: 'Golfer yelling On the green with a ball dot', audioReading: 'お', targetGlyph: 'お' },
      { prompt: 'Contains a separate detached stroke dot', subPrompt: 'Top-right floating accent', audioReading: 'お', targetGlyph: 'お' },
      { prompt: 'Tied together with a center cross', subPrompt: 'No floating dot', audioReading: 'あ', targetGlyph: 'あ' },
    ],
  },
  {
    id: 'kana-ku-wa',
    kind: 'kana',
    title: 'ク (ku) vs ワ (wa)',
    diffType: 'stroke-direction',
    distinctionRule: 'ク (ku) starts with a slanted diagonal stroke from top-right to bottom-left (丿). ワ (wa) starts with a straight vertical drop downward on the left (|).',
    strokeDirectionCallout: 'ク has a SLANTED slash (丿) | ワ has a VERTICAL drop (|)',
    choices: [
      { glyph: 'ク', reading: 'ku', meaning: 'Katakana ku', distinguishingFeature: 'First stroke is a slanted diagonal slash (丿)', strokeCalloutTag: 'Slanted Slash 丿' },
      { glyph: 'ワ', reading: 'wa', meaning: 'Katakana wa', distinguishingFeature: 'First stroke is a straight vertical line (|)', strokeCalloutTag: 'Vertical Stem |' },
    ],
    challenges: [
      { prompt: 'ku', subPrompt: 'Cuckoo beak with slanted diagonal slash', audioReading: 'ク', targetGlyph: 'ク' },
      { prompt: 'wa', subPrompt: 'Straight vertical left drop', audioReading: 'ワ', targetGlyph: 'ワ' },
      { prompt: 'Left stroke is sharply diagonal (丿)', subPrompt: 'Slanted first stroke', audioReading: 'ク', targetGlyph: 'ク' },
      { prompt: 'Left stroke is completely vertical (|)', subPrompt: 'Perpendicular first stroke', audioReading: 'ワ', targetGlyph: 'ワ' },
    ],
  },
  {
    id: 'kana-a-ma',
    kind: 'kana',
    title: 'ア (a) vs マ (ma)',
    diffType: 'stroke-order',
    distinctionRule: 'ア (a) has a horizontal bar with a corner hook and a separate long downward sweeping curve. マ (ma) has an acute downward-left corner with a small internal tick/dot (丶).',
    strokeDirectionCallout: 'ア has an outer sweeping leg | マ has an inner tick dot',
    choices: [
      { glyph: 'ア', reading: 'a', meaning: 'Katakana a', distinguishingFeature: 'Long curved left leg sweeping down', strokeCalloutTag: 'Curved Leg' },
      { glyph: 'マ', reading: 'ma', meaning: 'Katakana ma', distinguishingFeature: 'Acute angled triangle with inner tick dot', strokeCalloutTag: 'Inner Tick 丶' },
    ],
    challenges: [
      { prompt: 'a', subPrompt: 'Axe shape with long sweeping curve', audioReading: 'ア', targetGlyph: 'ア' },
      { prompt: 'ma', subPrompt: 'Mask corner with inner tick mark', audioReading: 'マ', targetGlyph: 'マ' },
      { prompt: 'Features a long outer sweeping stroke', subPrompt: 'Two full independent strokes', audioReading: 'ア', targetGlyph: 'ア' },
      { prompt: 'Features a short inner dot/tick', subPrompt: 'Acute corner with tick', audioReading: 'マ', targetGlyph: 'マ' },
    ],
  },

  // -------------------------------------------------------------
  // KANJI CONFUSERS (10 Pairs)
  // -------------------------------------------------------------
  {
    id: 'kanji-nichi-shiro',
    kind: 'kanji',
    title: '日 (day, sun) vs 白 (white)',
    diffType: 'dot-presence',
    distinctionRule: '日 (sun, day, 4 strokes) has a flat top bar. 白 (white, 5 strokes) adds a short diagonal top slash/drop (丶/ノ) pointing down into the upper horizontal bar.',
    strokeDirectionCallout: '日 is a clean 4-stroke box | 白 has an EXTRA top drop (ノ)',
    choices: [
      { glyph: '日', reading: 'ひ / ニチ', meaning: 'day, sun', distinguishingFeature: 'Flat top bar, exactly 4 strokes', strokeCalloutTag: 'Flat Top (4画)' },
      { glyph: '白', reading: 'しろ / ハク', meaning: 'white', distinguishingFeature: 'Has an extra top drop mark (ノ), 5 strokes', strokeCalloutTag: 'Top Drop (5画)' },
    ],
    challenges: [
      { prompt: 'day, sun (nichi / hi)', subPrompt: '4 strokes, flat top', audioReading: 'ひ', targetGlyph: '日' },
      { prompt: 'white (shiro / haku)', subPrompt: '5 strokes with top drop', audioReading: 'しろ', targetGlyph: '白' },
      { prompt: 'Sun shining in the sky', subPrompt: 'Flat box', audioReading: 'ひ', targetGlyph: '日' },
      { prompt: 'White drop of light falling on the sun', subPrompt: 'Extra top pip', audioReading: 'しろ', targetGlyph: '白' },
    ],
  },
  {
    id: 'kanji-tsuchi-shi',
    kind: 'kanji',
    title: '土 (earth, soil) vs 士 (samurai, warrior)',
    diffType: 'length-ratio',
    distinctionRule: '土 (earth/soil): Top stroke is SHORTER; bottom base stroke is LONGER (wide base on the ground). 士 (samurai/gentleman): Top stroke is LONGER; bottom stroke is SHORTER (broad shoulders, narrow waist).',
    strokeDirectionCallout: '土 has SHORT top, LONG base | 士 has LONG top, SHORT base',
    choices: [
      { glyph: '土', reading: 'つち / ド', meaning: 'earth, soil', distinguishingFeature: 'Top horizontal stroke is shorter; base is wide', strokeCalloutTag: 'Short Top / Long Base' },
      { glyph: '士', reading: 'さむらい / シ', meaning: 'samurai, warrior, scholar', distinguishingFeature: 'Top horizontal stroke is longer; base is narrow', strokeCalloutTag: 'Long Top / Short Base' },
    ],
    challenges: [
      { prompt: 'earth, soil (tsuchi / do)', subPrompt: 'Wide foundation on the ground', audioReading: 'つち', targetGlyph: '土' },
      { prompt: 'samurai, gentleman (shi)', subPrompt: 'Broad shoulders of a warrior', audioReading: 'さむらい', targetGlyph: '士' },
      { prompt: 'Short-over-long horizontal strokes', subPrompt: 'Base is wider', audioReading: 'つち', targetGlyph: '土' },
      { prompt: 'Long-over-short horizontal strokes', subPrompt: 'Shoulders are wider', audioReading: 'さむらい', targetGlyph: '士' },
    ],
  },
  {
    id: 'kanji-ki-hon',
    kind: 'kanji',
    title: '木 (tree) vs 本 (book, origin)',
    diffType: 'dot-presence',
    distinctionRule: '木 (tree, 4 strokes) is the plain tree radical. 本 (book, origin, 5 strokes) adds a horizontal tick stroke across the lower vertical trunk, marking the root/base.',
    strokeDirectionCallout: '木 is a plain tree | 本 adds a BASE crossbar tick (一)',
    choices: [
      { glyph: '木', reading: 'き / モク', meaning: 'tree, wood', distinguishingFeature: 'Plain trunk and branches (4 strokes)', strokeCalloutTag: 'Plain Trunk' },
      { glyph: '本', reading: 'ほん / もと', meaning: 'book, origin, main', distinguishingFeature: 'Crossbar on trunk marking the origin/root (5 strokes)', strokeCalloutTag: 'Root Tick Mark' },
    ],
    challenges: [
      { prompt: 'tree, wood (ki / moku)', subPrompt: '4 strokes, natural tree', audioReading: 'き', targetGlyph: '木' },
      { prompt: 'book, origin (hon / moto)', subPrompt: '5 strokes, root marked with tick', audioReading: 'ほん', targetGlyph: '本' },
      { prompt: 'A living tree with branches', subPrompt: 'No tick on trunk', audioReading: 'き', targetGlyph: '木' },
      { prompt: 'Paper book made from the root of a tree', subPrompt: 'Has horizontal cross-tick', audioReading: 'ほん', targetGlyph: '本' },
    ],
  },
  {
    id: 'kanji-matsu-motsu',
    kind: 'kanji',
    title: '待 (wait) vs 持 (hold, have)',
    diffType: 'radical-diff',
    distinctionRule: '待 (wait) has the movement/step radical 彳 (gyōninben, 2 slashes + vertical). 持 (hold) has the hand radical 扌 (tehen, horizontal + vertical hook + upward slash).',
    strokeDirectionCallout: '待 has FOOTSTEP radical 彳 | 持 has HAND radical 扌',
    choices: [
      { glyph: '待', reading: 'ま(つ) / タイ', meaning: 'wait', distinguishingFeature: 'Left radical is 彳 (two footsteps / pause)', strokeCalloutTag: 'Radical 彳 (Steps)' },
      { glyph: '持', reading: 'も(つ) / ジ', meaning: 'hold, possess', distinguishingFeature: 'Left radical is 扌 (hand holding something)', strokeCalloutTag: 'Radical 扌 (Hand)' },
    ],
    challenges: [
      { prompt: 'wait (matsu / tai)', subPrompt: 'Pausing your footsteps (彳)', audioReading: 'まつ', targetGlyph: '待' },
      { prompt: 'hold, have (motsu / ji)', subPrompt: 'Gripping with your hand (扌)', audioReading: 'もつ', targetGlyph: '持' },
      { prompt: 'To wait at a temple for someone', subPrompt: 'Double-step radical 彳', audioReading: 'まつ', targetGlyph: '待' },
      { prompt: 'To carry luggage with your hands', subPrompt: 'Hand radical 扌', audioReading: 'もつ', targetGlyph: '持' },
    ],
  },
  {
    id: 'kanji-migi-hidari',
    kind: 'kanji',
    title: '右 (right) vs 左 (left)',
    diffType: 'stroke-order',
    distinctionRule: '右 (right): Stroke 1 is the diagonal slash (丿), Stroke 2 is the horizontal bar (一), and the bottom is mouth (口). 左 (left): Stroke 1 is the horizontal bar (一), Stroke 2 is the diagonal slash (丿), and the bottom is craft (工).',
    strokeDirectionCallout: '右 has 口 (mouth at right) | 左 has 工 (craft at left)',
    choices: [
      { glyph: '右', reading: 'みぎ / ウ', meaning: 'right', distinguishingFeature: 'Stroke 1 is diagonal; contains 口 (mouth)', strokeCalloutTag: 'Contains 口' },
      { glyph: '左', reading: 'ひだり / サ', meaning: 'left', distinguishingFeature: 'Stroke 1 is horizontal; contains 工 (craft)', strokeCalloutTag: 'Contains 工' },
    ],
    challenges: [
      { prompt: 'right (migi / u)', subPrompt: 'Hand bringing food to the mouth (口)', audioReading: 'みぎ', targetGlyph: '右' },
      { prompt: 'left (hidari / sa)', subPrompt: 'Hand holding a craft tool (工)', audioReading: 'ひだり', targetGlyph: '左' },
      { prompt: 'Contains mouth (口) component', subPrompt: 'Right hand eats', audioReading: 'みぎ', targetGlyph: '右' },
      { prompt: 'Contains craft/carpenter (工) component', subPrompt: 'Left hand holds ruler', audioReading: 'ひだり', targetGlyph: '左' },
    ],
  },
  {
    id: 'kanji-sen-kan',
    kind: 'kanji',
    title: '千 (thousand) vs 干 (dry)',
    diffType: 'stroke-direction',
    distinctionRule: '千 (thousand, 3 strokes) has a SLANTED diagonal slash stroke from right-to-left at the top (丿). 干 (dry, 3 strokes) has a FLAT horizontal bar at the top (一).',
    strokeDirectionCallout: '千 has a SLANTED top slash (丿) | 干 has a FLAT top bar (一)',
    choices: [
      { glyph: '千', reading: 'せん / ち', meaning: 'thousand', distinguishingFeature: 'Top stroke is a slanted diagonal slash (丿)', strokeCalloutTag: 'Slanted Slash 丿' },
      { glyph: '干', reading: 'ほ(す) / カン', meaning: 'dry, parch', distinguishingFeature: 'Top stroke is a flat horizontal bar (一)', strokeCalloutTag: 'Flat Bar 一' },
    ],
    challenges: [
      { prompt: 'thousand (sen / chi)', subPrompt: 'Slanted top slash (丿)', audioReading: 'せん', targetGlyph: '千' },
      { prompt: 'dry, air out (hosu / kan)', subPrompt: 'Flat horizontal top bar (一)', audioReading: 'ほす', targetGlyph: '干' },
      { prompt: 'Top stroke drops diagonally right-to-left', subPrompt: 'Number thousand', audioReading: 'せん', targetGlyph: '千' },
      { prompt: 'Top stroke is completely horizontal', subPrompt: 'Drying rack', audioReading: 'ほす', targetGlyph: '干' },
    ],
  },
  {
    id: 'kanji-hito-iri',
    kind: 'kanji',
    title: '人 (person) vs 入 (enter)',
    diffType: 'protrusion',
    distinctionRule: '人 (person): Left stroke starts at the top and sweeps down; right stroke leans against it lower down. 入 (enter): Right stroke starts at the top and dominates; left stroke attaches underneath the right stroke.',
    strokeDirectionCallout: '人: LEFT stroke covers right | 入: RIGHT stroke covers left',
    choices: [
      { glyph: '人', reading: 'ひと / ジン、ニン', meaning: 'person', distinguishingFeature: 'Left stroke dominates at the apex; right stroke props it up', strokeCalloutTag: 'Left Over Right' },
      { glyph: '入', reading: 'はい(る) / ニュウ', meaning: 'enter, insert', distinguishingFeature: 'Right stroke dominates at the apex; left stroke enters below', strokeCalloutTag: 'Right Over Left' },
    ],
    challenges: [
      { prompt: 'person (hito / jin)', subPrompt: 'Left stroke is taller and primary', audioReading: 'ひと', targetGlyph: '人' },
      { prompt: 'enter (hairu / nyuu)', subPrompt: 'Right stroke is taller and primary', audioReading: 'はいる', targetGlyph: '入' },
      { prompt: 'Two people leaning together (person)', subPrompt: 'Left leg leads', audioReading: 'ひと', targetGlyph: '人' },
      { prompt: 'Entering through a pointed tent flap', subPrompt: 'Right stroke roof over left', audioReading: 'はいる', targetGlyph: '入' },
    ],
  },
  {
    id: 'kanji-ten-otto',
    kind: 'kanji',
    title: '天 (heaven) vs 夫 (husband)',
    diffType: 'protrusion',
    distinctionRule: '天 (heaven): Top horizontal stroke is SHORTER than the second; vertical stroke does not pierce the top bar. 夫 (husband): Center vertical stroke PIERCES through the top horizontal bar (representing a man with a hairpin).',
    strokeDirectionCallout: '天: Top bar is closed | 夫: Center stroke PIERCES through top',
    choices: [
      { glyph: '天', reading: 'あめ / テン', meaning: 'heaven, sky', distinguishingFeature: 'Contained beneath top bar; short top, long second bar', strokeCalloutTag: 'Contained Top' },
      { glyph: '夫', reading: 'おっと / フ', meaning: 'husband, man', distinguishingFeature: 'Center stroke pierces above top bar (hairpin)', strokeCalloutTag: 'Piercing Hairpin' },
    ],
    challenges: [
      { prompt: 'heaven, sky (ten / ame)', subPrompt: 'Top horizontal bar caps the character', audioReading: 'てん', targetGlyph: '天' },
      { prompt: 'husband, man (otto / fu)', subPrompt: 'Central stroke pierces through top', audioReading: 'おっと', targetGlyph: '夫' },
      { prompt: 'The great canopy of heaven above', subPrompt: 'Does NOT poke through', audioReading: 'てん', targetGlyph: '天' },
      { prompt: 'A grown man wearing a tall hairpin', subPrompt: 'Pokes out through top bar', audioReading: 'おっと', targetGlyph: '夫' },
    ],
  },
  {
    id: 'kanji-dai-inu',
    kind: 'kanji',
    title: '大 (big) vs 犬 (dog)',
    diffType: 'dot-presence',
    distinctionRule: '大 (big, 3 strokes) is a person spreading arms and legs wide. 犬 (dog, 4 strokes) has an EXTRA accent dot (丶) at the upper right, representing the dog ear or collar.',
    strokeDirectionCallout: '大 is big (3 strokes) | 犬 has a TOP-RIGHT DOT 丶 (4 strokes)',
    choices: [
      { glyph: '大', reading: 'おお(きい) / ダイ', meaning: 'big, large', distinguishingFeature: '3 strokes, no dot', strokeCalloutTag: 'No Dot (3画)' },
      { glyph: '犬', reading: 'いぬ / ケン', meaning: 'dog', distinguishingFeature: '4 strokes, contains top-right dot (丶)', strokeCalloutTag: 'Accent Dot 丶 (4画)' },
    ],
    challenges: [
      { prompt: 'big, large (ookii / dai)', subPrompt: '3 strokes, plain spread', audioReading: 'おおきい', targetGlyph: '大' },
      { prompt: 'dog (inu / ken)', subPrompt: '4 strokes, has top-right ear dot', audioReading: 'いぬ', targetGlyph: '犬' },
      { prompt: 'Spreading arms wide to show size', subPrompt: 'No dot', audioReading: 'おおきい', targetGlyph: '大' },
      { prompt: 'Big animal with a tail/ear dot', subPrompt: 'Has top-right dot (丶)', audioReading: 'いぬ', targetGlyph: '犬' },
    ],
  },
  {
    id: 'kanji-ushi-go',
    kind: 'kanji',
    title: '牛 (cow) vs 午 (noon)',
    diffType: 'protrusion',
    distinctionRule: '牛 (cow, 4 strokes): Central vertical stroke PIERCES through the top horizontal bar (the cow horn). 午 (noon, 4 strokes): Central vertical stroke does NOT pierce the top horizontal bar.',
    strokeDirectionCallout: '牛: Vertical PIERCES top bar (horn) | 午: Contained under top bar',
    choices: [
      { glyph: '牛', reading: 'うし / ギュウ', meaning: 'cow, beef', distinguishingFeature: 'Central vertical stroke pierces through top bar (horn)', strokeCalloutTag: 'Piercing Horn 🐂' },
      { glyph: '午', reading: 'ご', meaning: 'noon, sign of the horse', distinguishingFeature: 'Vertical stroke begins at/below top bar; does not pierce', strokeCalloutTag: 'Capped Top 🕛' },
    ],
    challenges: [
      { prompt: 'cow, beef (ushi / gyuu)', subPrompt: 'Horn pokes through the top bar', audioReading: 'うし', targetGlyph: '牛' },
      { prompt: 'noon, midday (go)', subPrompt: 'Capped below the top bar', audioReading: 'ご', targetGlyph: '午' },
      { prompt: 'Animal with horns piercing through', subPrompt: 'Center stroke extends high', audioReading: 'うし', targetGlyph: '牛' },
      { prompt: 'Noon clock stopped under the roof', subPrompt: 'Center stroke starts below bar', audioReading: 'ご', targetGlyph: '午' },
    ],
  },
];
