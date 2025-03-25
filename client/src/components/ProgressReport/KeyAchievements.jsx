import AchievementItem from './AchievementItem';

export default function KeyAchievements({ achievements }) {
  return (
    <div className="key-achievements">
      <h4>Key Achievements</h4>
      <ul>
        {achievements.map((item, index) => (
          <AchievementItem key={index} text={item} />
        ))}
      </ul>
    </div>
  );
}
