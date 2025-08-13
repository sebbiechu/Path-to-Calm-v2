import { useState } from "react";

export default function Achievements({ unlockedBadges = [] }) {
  const [selected, setSelected] = useState(null);
  const unlocked = new Set(unlockedBadges);

  const achievements = [
    {
      id: "cloudwalker",
      title: "Cloudwalker",
      image: "/images/cloudwalker.png",
      description:
        "You’ve just completed your very first breathing session. Like a monk rising above the misty mountains, you’ve taken your first step on a journey toward inner peace. Breathe it in—this is your moment.",
      xp: 150
    },
    {
      id: "lunaguide",
      title: "Lunaguide",
      image: "/images/lunaguide.png",
      description:
        "With steady breath and mindful flow, you've synced with the natural cycles. Your breath waxes and wanes like the moon—effortless and eternal.",
      xp: 300
    },
    {
      id: "petalmind",
      title: "Petalmind",
      image: "/images/petalmind.png",
      description:
        "Your awareness has softened, unfolding like a lotus with every breath. You are now a Petalmind — gentle in thought, strong in presence.",
      xp: 450
    }
  ];

  return (
    <>
      <div className="ach-grid">
        {achievements.map(b => {
          const isUnlocked = unlocked.has(b.id);
          return (
            <button
              key={b.id}
              className={`ach-badge ${isUnlocked ? "unlocked" : "locked"}`}
              onClick={() => isUnlocked && setSelected(b)}
              aria-disabled={!isUnlocked}
              disabled={!isUnlocked}
              type="button"
            >
              <img className="ach-img" src={b.image} alt={b.title} />
              <div className="ach-title">{b.title}</div>
              <div className="ach-sub">{isUnlocked ? "Unlocked" : `${b.xp} XP`}</div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal-card badge-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.title} badge`}
          >
            <img className="badge-modal-image" src={selected.image} alt={selected.title} />
            <h2 className="badge-modal-title">{selected.title}</h2>
            <p className="badge-modal-desc">{selected.description}</p>
            <div className="modal-footer">
              <button className="btn ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
