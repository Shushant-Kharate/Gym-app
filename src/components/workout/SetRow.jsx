// SetRow.jsx — individual set row in workout mode
import { Check, SkipForward } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { calc1RM } from '../../logic/progressiveOverload';

export default function SetRow({ setIndex, set, onCheck, onSkip, onWeightChange, onRepsChange, restDurationSec }) {
  const { playSetCheck } = useAudio();

  function handleCheck() {
    if (!set.done) {
      playSetCheck();
      onCheck(setIndex, restDurationSec);
    }
  }

  const est1RM = set.done ? calc1RM(set.weightKg, set.reps) : null;

  return (
    <div className={`set-row ${set.done ? 'done' : ''} ${set.skipped ? 'skipped' : ''}`}>
      <span className="set-num">{setIndex + 1}</span>

      {/* Weight input */}
      <div>
        <input
          id={`set-weight-${setIndex}`}
          type="number"
          className="set-input"
          value={set.weightKg === 0 ? '' : set.weightKg}
          onChange={e => onWeightChange(setIndex, parseFloat(e.target.value) || 0)}
          placeholder="kg"
          disabled={set.done || set.skipped}
          step="2.5"
          min="0"
          aria-label={`Set ${setIndex + 1} weight in kg`}
        />
      </div>

      {/* Reps input */}
      <div>
        <input
          id={`set-reps-${setIndex}`}
          type="number"
          className="set-input"
          value={set.reps}
          onChange={e => onRepsChange(setIndex, parseInt(e.target.value) || 0)}
          disabled={set.done || set.skipped}
          aria-label={`Set ${setIndex + 1} reps`}
        />
      </div>

      {/* Check button + est 1RM */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <button
          id={`set-check-${setIndex}`}
          className={`set-check ${set.done ? 'done' : ''}`}
          onClick={handleCheck}
          disabled={set.skipped}
          aria-label={set.done ? `Set ${setIndex + 1} complete` : `Mark set ${setIndex + 1} done`}
        >
          {set.done && <Check size={16} color="white" strokeWidth={3} />}
        </button>
        {est1RM && (
          <span style={{
            fontSize: 8, fontFamily: 'var(--font-mono)',
            color: 'var(--accent-brass)', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            1RM≈{est1RM.value}
          </span>
        )}
      </div>
    </div>
  );
}

