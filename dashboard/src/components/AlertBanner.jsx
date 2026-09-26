function AlertBanner({ caseData, onDismiss, onView }) {
  return (
    <div className="cd-alert">
      <span>⚠ New High severity case</span>
      <button onClick={onView}>View</button>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

export default AlertBanner;