export default function ProgressBlock({ filled }) {
  return (
    <div className={`progress-block ${filled ? 'filled' : ''}`}></div>
  );
}
