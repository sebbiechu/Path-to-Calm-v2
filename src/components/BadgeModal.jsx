import Modal from './Modal.jsx';
import BadgeArt from './BadgeArt.jsx';

const formatDay = (day) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BadgeModal({ badge, earnedOn, status, isNew, remaining = 0, onClose }) {
  const progress = status?.progress;
  return (
    <Modal
      title={isNew ? 'New badge' : badge.title}
      onClose={onClose}
      className="badge-modal"
      footer={
        isNew && (
          <button type="button" className="btn primary" onClick={onClose}>
            {remaining ? 'Next badge' : 'Done'}
          </button>
        )
      }
    >
      <div className={earnedOn ? '' : 'locked'}>
        <BadgeArt badge={badge} size={160} />
      </div>
      {isNew && <p className="badge-name">{badge.title}</p>}
      <p className="badge-status">
        {earnedOn
          ? `Earned on ${formatDay(earnedOn)}`
          : `${badge.goal}${progress ? `: ${progress[0]} of ${progress[1]}` : ''}`}
      </p>

      {earnedOn ? (
        <article className="learn-card">
          <h3>{badge.card.title}</h3>
          {badge.card.body.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </article>
      ) : (
        <p className="learn-teaser">Earn this badge to unlock “{badge.card.title}”.</p>
      )}
    </Modal>
  );
}
