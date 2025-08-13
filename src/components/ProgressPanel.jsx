import Achievements from './Achievements.jsx';
import StatsPanel from './StatsPanel.jsx';

export default function ProgressPanel({ unlockedBadges = [], xp = 0 }) {
  return (
    <div className="progress">
      <div className="progress-grid">
        <div className="progress-col">
          <h2 className="section-title">Your progress</h2>
          <StatsPanel />
        </div>

        <div className="progress-col">
          <h2 className="section-title">Achievements</h2>

          {/* Achievements box content */}
          <div className="ach-box">
            <div className="ach-subheader">
              <span className="ach-label">Badges</span>
              <span className="ach-xp">XP: {xp}</span>
            </div>

            <Achievements unlockedBadges={unlockedBadges} />
          </div>
        </div>
      </div>
    </div>
  );
}
