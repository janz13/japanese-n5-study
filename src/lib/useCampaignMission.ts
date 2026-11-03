import { useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCampaignStage, type CampaignSaga, type CampaignStage } from '../data/campaign';
import { useStore } from './store';

export interface CampaignMissionContext {
  isCampaignMode: boolean;
  stageId: string | null;
  stage: CampaignStage | null;
  saga: CampaignSaga | null;
  targetItems: string[] | null;
  targetScript?: 'hiragana' | 'katakana' | 'both';
  targetCategory?: string;
  targetTab?: string;
  targetLessonId?: string;
  isCompleted: boolean;
  completeMission: () => void;
  returnToCampaign: () => void;
}

export function useCampaignMission(): CampaignMissionContext {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stageId = searchParams.get('mission') || searchParams.get('stage') || null;

  const stageInfo = useMemo(() => {
    if (!stageId) return null;
    return getCampaignStage(stageId);
  }, [stageId]);

  const isCampaignMode = Boolean(stageInfo);
  const stage = stageInfo?.stage ?? null;
  const saga = stageInfo?.saga ?? null;
  const targetItems = stage?.targetItems ?? null;

  const scriptParam = searchParams.get('script');
  const targetScript =
    scriptParam === 'hiragana' || scriptParam === 'katakana' || scriptParam === 'both'
      ? scriptParam
      : stage?.targetScript;

  const targetCategory = stage?.targetCategory;

  const tabParam = searchParams.get('tab') || searchParams.get('mode');
  const targetTab = tabParam || stage?.targetTab;

  const targetLessonId = searchParams.get('lesson') || searchParams.get('lessonId') || undefined;

  const campaignCompletedStages = useStore((s) => s.campaignCompletedStages);
  const isCompleted = stageId ? Boolean(campaignCompletedStages[stageId]) : false;

  const returnToCampaign = useCallback(() => {
    if (saga) {
      navigate(`/campaign?saga=${saga.sagaNumber}`);
    } else {
      navigate('/campaign');
    }
  }, [navigate, saga]);

  const completeMission = useCallback(() => {
    if (stage?.id) {
      useStore.getState().completeCampaignStage(stage.id);
    }
  }, [stage]);

  return {
    isCampaignMode,
    stageId,
    stage,
    saga,
    targetItems,
    targetScript,
    targetCategory,
    targetTab,
    targetLessonId,
    isCompleted,
    completeMission,
    returnToCampaign,
  };
}
