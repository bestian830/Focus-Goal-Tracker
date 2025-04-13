# DailyReward Management Implementation Plan

## Overview

This document clarifies the relationship and implementation plan between the reward system in Goal Declaration and reward management in daily cards.

## Reward System Design Principles

1. **Dual-Layer Reward System**
   - **Global Rewards**: Set in Goal Declaration, applicable to all days
   - **Daily Specific Rewards**: Set in DailyCardRecord for specific dates, applicable only to that day

2. **Reward Claiming Conditions**
   - Global rewards: Can be claimed after completing at least one task
   - Daily specific rewards: Can be claimed after completing the corresponding specific task

## Current State Analysis

The system currently has:

1. **Reward Settings in Goal Declaration**
   - Users can set dailyReward (daily fixed reward) in the goal declaration
   - These rewards are saved in MongoDB as part of the goal

2. **Reward Display in DailyCardRecord**
   - Added DailyReward component that can display reward items and mark them as claimed
   - Currently mainly displays global rewards set in Goal Declaration

## Requirements Specification

When users modify the reward system in different locations:

1. **When modifying dailyReward in Goal Declaration**
   - All future date cards from the modification date will use the new reward settings
   - Existing historical cards remain unchanged

2. **When adding rewards for specific dates in DailyCardRecord**
   - Changes only apply to that day's card
   - Does not affect global settings or cards for other dates

## Task-Reward Relationship

Design a more granular task-reward matching system:

1. **Core Mechanism**
   - Each task can have a corresponding reward (not mandatory)
   - Only after completing a specific task can the corresponding reward be claimed

2. **Reward Management Approach**
   - Global dailyTask completion enables claiming the global dailyReward
   - Completion of specific tasks added for the day enables claiming the corresponding specific rewards
   - Users can add tasks without adding rewards (optional)

## Technical Implementation Details

1. **Data Structure Adjustments**
   ```javascript
   // State extension in DailyCardRecord
   const [dailyRewards, setDailyRewards] = useState([]);
   const [rewardCompletions, setRewardCompletions] = useState({});

   // Recording task-reward relationships
   const [taskRewardMap, setTaskRewardMap] = useState({});
   ```

2. **UI Changes**
   - Add "Add Reward" button in DailyCardRecord
   - When adding rewards, option to link to specific tasks
   - Keep reward checkboxes disabled until corresponding tasks are completed

3. **State Management**
   - Monitor task completion status changes
   - Unlock corresponding rewards when tasks are marked as completed
   - Save reward status to dailyCards in MongoDB

## Implementation Steps

1. **Extend DailyCardRecord Component**
   - Add reward management related states
   - Implement reward add/edit/delete functions

2. **Enhance Task-Reward Association**
   - Modify handleTaskStatusChange function to handle associated rewards
   - Add taskRewardMap data structure to track associations

3. **Extend UI Interface**
   - Add reward management interface elements
   - Implement display of task-reward associations

4. **Data Persistence**
   - Modify API calls to save reward data
   - Ensure reward status is correctly synchronized to MongoDB

## Expected Results

Users will be able to:
- Set global rewards in Goal Declaration
- Add specific rewards in daily cards
- Associate rewards with specific tasks
- Claim corresponding rewards after completing tasks
- View historical reward claim records

This design maintains the simplicity of setting universal rewards in the goal declaration while providing the flexibility of customizing rewards for specific dates, forming a complete incentive mechanism. 