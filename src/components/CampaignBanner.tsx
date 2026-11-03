import { useNavigate } from 'react-router-dom';
import type { CampaignSaga, CampaignStage } from '../data/campaign';

export interface CampaignBannerProps {
  stage: CampaignStage;
  saga?: CampaignSaga | null;
  currentProgress?: number;
  totalGoal?: number;
  progressText?: string;
  onReturn?: () => void;
}

export default function CampaignBanner({
  stage,
  saga,
  currentProgress,
  totalGoal,
  progressText,
  onReturn,
}: CampaignBannerProps) {
  const navigate = useNavigate();

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else if (saga) {
      navigate(`/campaign?saga=${saga.sagaNumber}`);
    } else {
      navigate('/campaign');
    }
  };

  const computedProgressText =
    progressText ??
    (currentProgress !== undefined && totalGoal !== undefined
      ? `${currentProgress} / ${totalGoal} completed`
      : undefined);

  return (
    <div
      className="campaign-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        padding: '0.75rem 1.1rem',
        marginBottom: '1.2rem',
        background: 'var(--surface2)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: 'var(--radius, 10px)',
        border: '1px solid var(--border, #333)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.6rem' }}>{stage.icon || '⚔️'}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span
              className="tag"
              style={{
                fontSize: '0.72rem',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 700,
              }}
            >
              {saga ? `SAGA ${saga.sagaNumber}` : 'CAMPAIGN'} · MISSION {stage.stageNumber}
            </span>
            <b style={{ fontSize: '0.95rem' }}>{stage.title}</b>
            {stage.titleJp && <span className="muted small jp">({stage.titleJp})</span>}
          </div>
          {stage.targetItems && stage.targetItems.length > 0 && (
            <div className="muted small" style={{ marginTop: '0.15rem' }}>
              🎯 Target items: <span className="jp" style={{ fontWeight: 600, color: 'var(--text)' }}>{stage.targetItems.join(' ')}</span>
            </div>
          )}
          {computedProgressText && (
            <div className="muted small" style={{ marginTop: '0.15rem' }}>
              📊 Progress: {computedProgressText}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="chip on"
        onClick={handleReturn}
        style={{
          fontWeight: 600,
          padding: '0.45rem 1rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
        }}
      >
        ← Return to Campaign Map
      </button>
    </div>
  );
}
