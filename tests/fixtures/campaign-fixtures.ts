/**
 * Campaign Mode Authoritative Test Fixtures & Expected Outputs
 * Derived from ORIGINAL_REQUEST.md and PROJECT.md
 */

export interface ExpectedSagaCurriculum {
  sagaNumber: number;
  id: string;
  titleKeyword: string;
  expectedMinQuestions: number;
  expectedMaxQuestions: number;
  expectedMinPassScore: number;
  expectedPassRatio: number;
  curriculumKeywords: string[];
}

export const EXPECTED_SAGAS: ExpectedSagaCurriculum[] = [
  {
    sagaNumber: 1,
    id: 'saga-1',
    titleKeyword: 'Ground Zero',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['hiragana', 'vowel', 'number', 'です', 'あいうえお', 'か', 'いち', 'に'],
  },
  {
    sagaNumber: 2,
    id: 'saga-2',
    titleKeyword: 'Reading Bridge',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['katakana', 'coffee', 'cafe', 'ticket', 'sign', 'コーヒー', 'カフェ', 'ラーメン'],
  },
  {
    sagaNumber: 3,
    id: 'saga-3',
    titleKeyword: 'Sentence Engine',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['particle', 'で', 'に', 'を', 'と', '水曜日', '金曜日', '毎朝', 'あります', 'います', '分'],
  },
  {
    sagaNumber: 4,
    id: 'saga-4',
    titleKeyword: 'Action & Inflections',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['te-form', 'adjective', 'verb', 'て', 'い-adjective', 'な-adjective', 'group', 'weekend'],
  },
  {
    sagaNumber: 5,
    id: 'saga-5',
    titleKeyword: 'Full N5 Mastery',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['counter', 'date', 'direction', 'simulation', '本', '枚', '匹', 'つ', '日'],
  },
  {
    sagaNumber: 6,
    id: 'saga-6',
    titleKeyword: 'N4 Frontier',
    expectedMinQuestions: 8,
    expectedMaxQuestions: 10,
    expectedMinPassScore: 7,
    expectedPassRatio: 0.7,
    curriculumKeywords: ['intransitive', 'transitive', '自動詞', '他動詞', 'potential', 'たら', 'なら', 'keigo', '参ります'],
  },
];

export const EXPECTED_STAGE_SCOPING: Record<string, { targetItems: string[]; category: string; targetRoute: string }> = {
  's1-1': {
    targetItems: ['あ', 'い', 'う', 'え', 'お'],
    category: 'Kana',
    targetRoute: '/kana',
  },
  's1-2': {
    targetItems: ['一', '二', '三', '四', '五'],
    category: 'Kanji',
    targetRoute: '/kanji-dojo',
  },
};

export const EXPECTED_CORRECTED_ROUTES: Record<string, string> = {
  's1-1': '/kana',
  's1-2': '/kanji-dojo',
  's1-3': '/grammar/g1',
  's1-4': '/stories/ch1-arrival',
  's2-4': '/stories/ch2-cafe',
  's4-4': '/stories/ch4-weekend',
};

export const CAMPAIGN_RETURN_BUTTON_LABEL = '← Return to Campaign Map';
export const CAMPAIGN_RETURN_ROUTE_PREFIX = '#/campaign';
