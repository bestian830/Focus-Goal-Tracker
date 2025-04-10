import React from 'react';
import ExportButton from './ExportButton';
import AIFeedback from './AIFeedback';
import styles from './ProgressReport.module.css';

export default function ProgressReport({ goalId }) {
  // 如果没有goalId，显示提示信息
  if (!goalId) {
    return (
      <div className={styles.reportContainer}>
        <div className={styles.noGoalMessage}>请先选择一个目标</div>
      </div>
    );
  }

  return (
    <div className={styles.reportContainer}>
      <ExportButton />
      <AIFeedback goalId={goalId} />
    </div>
  );
}
