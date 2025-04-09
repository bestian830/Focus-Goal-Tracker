import React from 'react';
import { useState, useEffect } from 'react';
import ExportButton from './ExportButton';
// import KeyAchievements from './KeyAchievements';
import AIFeedback from './AIFeedback';
import styles from './ProgressReport.module.css';

export default function ProgressReport({ goalId }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // 实际逻辑 (后期启用)
    /*
    fetch('/api/progress-report')
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.log(err));
    */

    // 假数据
    const mockReport = {
      achievements: [
        'Completed 3 major modules',
        'Achieved 85% in assessments',
        'Contributed to 2 projects'
      ],
      aiFeedback: 'Great progress, focus more on practical tasks next week!'
    };
    setReport(mockReport);
  }, []);

  if (!report) return <div className={styles.reportContainer}>Loading...</div>;
  
  // 如果没有goalId，显示提示信息
  if (!goalId) return <div className={styles.reportContainer}>请先选择一个目标</div>;

  return (
    <div className={styles.reportContainer}>
      <ExportButton />
      {/* <KeyAchievements goalId={goalId} /> */}
      <AIFeedback goalId={goalId} />
    </div>
  );
}
