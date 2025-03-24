# Focus Goal Tracker - Frontend Merge Plan

## Merge Overview

This document outlines the frontend code merging strategy to integrate different code structures and implementations from two developers.

## Merge Strategy

### 1. File Structure

Retain the advantages of both structures:
- `pages/` directory: Maintain complete pages with full interaction logic, including user authentication
- `components/` directory: Preserve modular UI components

### 2. Home.jsx Merge Strategy

- **Preserve Original Authentication Logic**:
  - Maintain user state management (`user`, `loading`, `showProfileModal`, etc.)
  - Keep logout and modal toggle functionality

- **Retain Original Header**:
  - Use the original `<header className="app-header">` code
  - Remove partner's `<Header />` component reference

- **Integrate Partner's Components**:
  - Use `<Sidebar />`, `<GoalDetails />`, `<ProgressReport />` components in the `main-content` section
  - Preserve conditional rendering, only showing components after user login
  - Maintain welcome message for non-logged-in users

- **Keep ProfileModal**:
  - Preserve the original profile modal functionality

### 3. Profile.jsx Handling

- Completely retain the original `Profile.jsx` file
- Do not use partner's `ProfileInfo` and `ChangePassword` components

### 4. CSS Style Management

- Maintain `styles/Home.css`: Provides header styling and overall layout
- Keep `style/style.css`: Supplies styles needed for partner's components
- Ensure class names don't conflict, especially `.home-container` and `.main-content`

## Implementation Steps

1. Back up current files
2. In Home.jsx:
   - Keep original imports and state management code
   - Add partner's component imports (Sidebar, GoalDetails, ProgressReport)
   - In the return section, implement the merge strategy described above
3. Delete or back up redundant Header.jsx
4. Ensure both CSS files are correctly referenced
5. Test functionality to ensure all features (authentication, page navigation, etc.) work properly

## Notes

- The merge process maintains two sets of CSS, be aware of potential style conflicts
- Test priority: user login/logout, guest access, Profile functionality, new component display and interaction
- Preserve the original RWD (Responsive Web Design) functionality and user authentication logic 