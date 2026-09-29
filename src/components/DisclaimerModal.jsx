import Modal from './Modal.jsx';

// `blocking` = first visit: must be accepted, can't be dismissed.
export default function DisclaimerModal({ blocking, onAccept, onClose }) {
  return (
    <Modal
      title="Medical disclaimer"
      dismissible={!blocking}
      onClose={onClose}
      className="disclaimer"
      footer={
        <button type="button" className="btn primary" onClick={blocking ? onAccept : onClose}>
          I understand
        </button>
      }
    >
      <p>
        This app is not a substitute for medical advice. Always consult a healthcare provider before starting any
        breathing exercises, especially if you have respiratory or cardiovascular conditions, or if you are pregnant.
      </p>
      <p>
        Stop immediately if you feel dizzy, faint or unwell during any session. Use this app in a safe environment
        where you can sit or lie down if needed.
      </p>
    </Modal>
  );
}
