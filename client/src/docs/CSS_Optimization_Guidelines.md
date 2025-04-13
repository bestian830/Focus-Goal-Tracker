
# ✨ CSS Optimization & Safety Guidelines for Focus App

## ✅ Goal
Provide a clear and safe workflow to beautify and optimize the CSS of the **Focus Goal Tracker App**, without breaking the existing Vite + React + MUI + CSS Module project logic.

---

## 🛡️ AI Prompt (CSS Safety Reminder)

> 🔐 Please note that I’m working on a project using **Vite + React + MUI + CSS Modules**. When providing styling suggestions, please follow these rules:

1. **Do not modify global class names** (such as `button`, `.container`, `.card`, etc.)
2. **Avoid overriding MUI’s internal class names** (like `.MuiButton-root`); instead, use the `sx` prop or `styled()` API
3. **Use CSS Modules**, so please provide styles in a `.module.css` file and apply them via `styles.xxx`
4. **Do not alter JSX structure or component props** (like `onClick` handlers or `useState` logic); focus only on styling
5. **Ensure that styles do not interfere with existing component functionality or React state management**

---

## 🎯 Recommended Optimization Sequence

### 🧩 Phase 1: Unify Style Consistency
- **Login / Welcome Page**
  - Consistent button color (primary/secondary)
  - Improve font size and spacing
  - Add hover effects

- **Goal Sidebar (Left Panel)**
  - Card shadow enhancement (`box-shadow`)
  - Priority label redesign (soft color, hover)
  - Date icon alignment and visual hierarchy

---

### 🧩 Phase 2: Enhance Interactivity
- **Main Goal Display**
  - Add hover/active states for quote block
  - Visual improvement for `Weekly Progress Cards`
  - Highlight current day with animation or box effect

---

### 🧩 Phase 3: Modularization and Maintainability
- Split CSS into per-component modules:

| Component             | Suggested CSS Module File         |
|----------------------|-----------------------------------|
| Goal Sidebar         | `GoalSidebar.module.css`          |
| Goal Detail View     | `GoalDetail.module.css`           |
| Login Page           | `LoginPage.module.css`            |
| Guest Welcome Page   | `WelcomePage.module.css`          |
| Common Variables     | `variables.module.css` or `theme.js` |

---

## 🛠️ Suggested Micro-Optimizations

| Location                  | Optimization Tip |
|---------------------------|------------------|
| `Logout` Button           | Use `variant="outlined"`, add icon, align right |
| `Generate Analysis` Area  | Add `Tooltip`, polish with spacing and clarity |
| `Weekly Progress Cards`   | Highlight `today`, use CSS `transition` |

---

## 🧪 Next Step
You can begin implementing CSS module improvement one section at a time. Recommended starting point: **GoalSidebar**.
