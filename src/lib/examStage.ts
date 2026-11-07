import type { ExamLevel, ExamSection } from '../data/exam';
import type { GeneratedExamQuestion } from './jlptGenerator';
import type { DiagnosticRadarMetrics } from '../components/HexagonRadarChart';

export type ExamMode = 'full' | 'mini';

export type ExamStage =
  | 'section_1'
  | 'intermission_1'
  | 'section_2'
  | 'intermission_2'
  | 'section_3';

export const SECTION_STAGE_META: Record<ExamStage, { nameJp: string; nameEn: string; sectionKey?: ExamSection }> = {
  section_1: {
    nameJp: '第1部：言語知識（文字・語彙）',
    nameEn: 'Section 1: Vocabulary & Kanji',
    sectionKey: 'vocab',
  },
  intermission_1: {
    nameJp: '休憩・説明',
    nameEn: 'Intermission 1: Break & Instructions',
  },
  section_2: {
    nameJp: '第2部：言語知識（文法）・読解',
    nameEn: 'Section 2: Grammar & Reading',
    sectionKey: 'grammar',
  },
  intermission_2: {
    nameJp: '休憩・音響確認',
    nameEn: 'Intermission 2: Break & Audio Check',
  },
  section_3: {
    nameJp: '第3部：聴解',
    nameEn: 'Section 3: Listening Comprehension',
    sectionKey: 'listening',
  },
};

export function getStageDurationSec(stage: ExamStage, level: ExamLevel, mode: ExamMode): number {
  if (mode === 'mini') {
    if (stage === 'section_1') return 300;
    if (stage === 'intermission_1') return 60;
    if (stage === 'section_2') return 360;
    if (stage === 'intermission_2') return 60;
    return 240;
  }
  if (stage === 'section_1') return level === 'N5' ? 20 * 60 : 25 * 60;
  if (stage === 'intermission_1') return 180;
  if (stage === 'section_2') return level === 'N5' ? 40 * 60 : 55 * 60;
  if (stage === 'intermission_2') return 300;
  return level === 'N5' ? 30 * 60 : 35 * 60;
}

export function calculateRadarMetrics(
  questions: GeneratedExamQuestion[],
  answers: Record<number, number>,
): DiagnosticRadarMetrics {
  const buckets: Record<keyof DiagnosticRadarMetrics, { ok: number; total: number }> = {
    kanjiOrthography: { ok: 0, total: 0 },
    vocabContext: { ok: 0, total: 0 },
    grammarStructure: { ok: 0, total: 0 },
    readingComprehension: { ok: 0, total: 0 },
    infoRetrieval: { ok: 0, total: 0 },
    listeningResponse: { ok: 0, total: 0 },
  };

  questions.forEach((q, i) => {
    let axis: keyof DiagnosticRadarMetrics;
    const m = q.mondaiId;
    if (m === 'V1' || m === 'V2' || q.mondaiTitle.includes('漢字') || q.mondaiTitle.includes('表記')) {
      axis = 'kanjiOrthography';
    } else if (m === 'V3' || m === 'V4' || q.mondaiTitle.includes('文脈') || q.mondaiTitle.includes('言い換え')) {
      axis = 'vocabContext';
    } else if (
      m === 'G1' ||
      m === 'G2' ||
      q.mondaiTitle.includes('文法') ||
      q.mondaiTitle.includes('星') ||
      q.mondaiTitle.includes('組み立て')
    ) {
      axis = 'grammarStructure';
    } else if (m === 'R3' || m === 'R4' || q.mondaiTitle.includes('情報検索')) {
      axis = 'infoRetrieval';
    } else if (
      q.section === 'grammar' ||
      m === 'G3' ||
      m === 'R1' ||
      m === 'R2' ||
      q.mondaiTitle.includes('読解') ||
      q.mondaiTitle.includes('内容理解')
    ) {
      axis = 'readingComprehension';
    } else {
      axis = 'listeningResponse';
    }

    buckets[axis].total++;
    if (answers[i] === q.answer) {
      buckets[axis].ok++;
    }
  });

  return {
    kanjiOrthography: buckets.kanjiOrthography.total
      ? Math.round((buckets.kanjiOrthography.ok / buckets.kanjiOrthography.total) * 100)
      : 100,
    vocabContext: buckets.vocabContext.total
      ? Math.round((buckets.vocabContext.ok / buckets.vocabContext.total) * 100)
      : 100,
    grammarStructure: buckets.grammarStructure.total
      ? Math.round((buckets.grammarStructure.ok / buckets.grammarStructure.total) * 100)
      : 100,
    readingComprehension: buckets.readingComprehension.total
      ? Math.round((buckets.readingComprehension.ok / buckets.readingComprehension.total) * 100)
      : 100,
    infoRetrieval: buckets.infoRetrieval.total
      ? Math.round((buckets.infoRetrieval.ok / buckets.infoRetrieval.total) * 100)
      : 100,
    listeningResponse: buckets.listeningResponse.total
      ? Math.round((buckets.listeningResponse.ok / buckets.listeningResponse.total) * 100)
      : 100,
  };
}
