import ProgressBlock from './ProgressBlock';

export default function ProgressTimeline({ progress }) {
  const totalBlocks = 6;

  return (
    <div className="progress-timeline">
      <h4>Progress Timeline</h4>
      <div className="progress-blocks">
        {Array.from({ length: totalBlocks }).map((_, index) => (
          <ProgressBlock key={index} filled={index < progress} />
        ))}
      </div>
    </div>
  );
}
