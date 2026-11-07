import React from 'react';

export interface OmrBubbleSheetProps {
  totalQuestions: number;
  answers: Record<number, number>;
  flagged?: Record<number, boolean>;
  submitted?: boolean;
  correctAnswers?: Record<number, number>;
  activeQuestionIdx?: number;
  onSelectAnswer: (questionIdx: number, optionIdx: number) => void;
  onSelectQuestion: (questionIdx: number) => void;
  onToggleFlag?: (questionIdx: number) => void;
}

export const OmrBubbleSheet: React.FC<OmrBubbleSheetProps> = ({
  totalQuestions,
  answers,
  flagged = {},
  submitted = false,
  correctAnswers = {},
  activeQuestionIdx,
  onSelectAnswer,
  onSelectQuestion,
  onToggleFlag,
}) => {
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div
      className="gp omr-sheet-container"
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        border: '2px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      <div className="row-between" style={{ marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div>
          <span className="small font-bold" style={{ letterSpacing: '0.5px' }}>
            📝 日本語能力試験 マークシート (OMR Answer Sheet)
          </span>
          <div className="muted small" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>
            Filled: <b>{answeredCount}</b> / {totalQuestions}
            {unansweredCount > 0 && !submitted && (
              <span className="bad-text" style={{ marginLeft: '0.5rem' }}>
                ({unansweredCount} blank)
              </span>
            )}
            {Object.values(flagged).filter(Boolean).length > 0 && (
              <span style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>
                🚩 {Object.values(flagged).filter(Boolean).length} flagged
              </span>
            )}
          </div>
        </div>

        <div className="controls nomargin" style={{ fontSize: '0.72rem' }}>
          <span className="muted">Options: ① ② ③ ④</span>
        </div>
      </div>

      <div
        className="omr-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
          gap: '0.4rem 0.6rem',
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '0.3rem 0.2rem',
        }}
      >
        {Array.from({ length: totalQuestions }, (_, i) => {
          const selectedOpt = answers[i];
          const isFlagged = Boolean(flagged[i]);
          const isCurrent = activeQuestionIdx === i;
          const isUnanswered = selectedOpt === undefined;
          const isCorrect = submitted && selectedOpt !== undefined && selectedOpt === correctAnswers[i];
          const isWrong = submitted && selectedOpt !== undefined && selectedOpt !== correctAnswers[i];

          return (
            <div
              key={i}
              id={`omr-row-${i}`}
              onClick={() => onSelectQuestion(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.4rem',
                borderRadius: '6px',
                background: isCurrent ? 'var(--surface2)' : 'transparent',
                border: isCurrent
                  ? '1px solid var(--accent)'
                  : isUnanswered && !submitted
                    ? '1px dashed rgba(245, 158, 11, 0.4)'
                    : '1px solid transparent',
                cursor: 'pointer',
              }}
              title={`Question ${i + 1}${isFlagged ? ' (Flagged)' : ''}`}
            >
              <div
                style={{
                  minWidth: '28px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>{i + 1}.</span>
                {isFlagged && <span style={{ fontSize: '0.65rem' }}>🚩</span>}
              </div>

              <div style={{ display: 'flex', gap: '3px', flex: 1, justifyContent: 'space-between' }}>
                {[0, 1, 2, 3].map((optIdx) => {
                  const isChosen = selectedOpt === optIdx;
                  const isWinningOpt = submitted && correctAnswers[i] === optIdx;

                  let bubbleBg = 'transparent';
                  let bubbleBorder = '1px solid var(--border)';
                  let textColor = 'inherit';

                  if (isChosen) {
                    if (!submitted) {
                      bubbleBg = 'radial-gradient(circle, #334155 0%, #0f172a 100%)';
                      bubbleBorder = '1.5px solid #0284c7';
                      textColor = '#38bdf8';
                    } else if (isCorrect) {
                      bubbleBg = 'rgba(16, 185, 129, 0.25)';
                      bubbleBorder = '1.5px solid #10b981';
                      textColor = '#10b981';
                    } else if (isWrong) {
                      bubbleBg = 'rgba(239, 68, 68, 0.25)';
                      bubbleBorder = '1.5px solid #ef4444';
                      textColor = '#ef4444';
                    }
                  } else if (submitted && isWinningOpt) {
                    bubbleBorder = '1.5px dashed #10b981';
                    textColor = '#10b981';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnswer(i, optIdx);
                        onSelectQuestion(i);
                      }}
                      style={{
                        width: '20px',
                        height: '18px',
                        borderRadius: '50%',
                        fontSize: '0.68rem',
                        fontWeight: isChosen ? 700 : 500,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: bubbleBg,
                        border: bubbleBorder,
                        color: textColor,
                        cursor: submitted ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Select option (${optIdx + 1})`}
                    >
                      {optIdx + 1}
                    </button>
                  );
                })}
              </div>

              {onToggleFlag && !submitted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFlag(i);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 2px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    opacity: isFlagged ? 1 : 0.25,
                  }}
                  title={isFlagged ? 'Remove flag' : 'Flag question for review'}
                >
                  🚩
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OmrBubbleSheet;
