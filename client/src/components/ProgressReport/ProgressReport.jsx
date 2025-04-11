import React from 'react';
import ExportButton from './ExportButton';
import AIFeedback from './AIFeedback';
import styles from './ProgressReport.module.css';

export default function ProgressReport({ goalId }) {
  // If no goalId, show prompt message
  if (!goalId) {
    return (
      <div className={styles.reportContainer}>
        <div className={styles.noGoalMessage}>Please select a goal first</div>
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
